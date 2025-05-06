import { Component, OnInit, OnDestroy } from '@angular/core';
import { NodeConfigService, NodeConfig } from '../services/node-config.service';
import { DataService } from '../services/data.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { CsvService } from '../services/csv.service';
import { ProjectService } from '../services/project.service';
import { ActivatedRoute } from '@angular/router';
import { XMessageBoxService } from '@ng-nest/ui/message-box';
import { XMessageService } from '@ng-nest/ui/message';
import { finalize } from 'rxjs/operators';

interface ConfigField {
  key: string;
  label: string;
  type: string;
}

@Component({
  selector: 'app-node-config-panel',
  template: `
    <div class="config-panel" *ngIf="selectedNode$ | async as node">
      <x-card>
        <div class="card-header">
          <h3>节点配置</h3>
        </div>
        <div class="card-body">
          <form [formGroup]="configForm" (ngSubmit)="onSubmit()">
            <ng-container *ngFor="let prop of getConfigFields(node.type)">
              <ng-container [ngSwitch]="prop.type">
                <div class="form-group" *ngSwitchCase="'transform'">
                  <label [for]="prop.key">{{prop.label}}</label>
                  <x-textarea [formControlName]="prop.key" rows="5"></x-textarea>
                  
                  <div class="transform-help">
                    <h4>转换示例：</h4>
                    <div class="example-list">
                      <x-card *ngFor="let example of transformExamples" class="example">
                        <div class="card-header">
                          <div class="example-header">
                            <span class="example-name">{{example.name}}</span>
                            <x-button type="primary" size="small" (click)="applyExample(example.code)">应用</x-button>
                          </div>
                        </div>
                        <div class="card-body">
                          <div class="example-desc">{{example.description}}</div>
                          <code class="example-code">{{example.code}}</code>
                        </div>
                      </x-card>
                    </div>
                    <div class="help-text">
                      <p>可用辅助函数：</p>
                      <ul>
                        <li><code>helpers.sum(array)</code> - 计算数组总和</li>
                        <li><code>helpers.average(array)</code> - 计算平均值</li>
                        <li><code>helpers.distinct(array)</code> - 数组去重</li>
                        <li><code>helpers.groupBy(array, key)</code> - 数据分组</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div class="form-group" *ngSwitchCase="'file'">
                  <label [for]="prop.key">{{prop.label}}</label>
                  <input type="file" [id]="prop.key" (change)="onFileSelected($event, prop.key)" accept=".csv">
                </div>
                <div class="form-group" *ngSwitchCase="'text'">
                  <label [for]="prop.key">{{prop.label}}</label>
                  <x-input [formControlName]="prop.key"></x-input>
                </div>
              </ng-container>
            </ng-container>
            <div class="form-actions">
              <x-button type="primary" htmlType="submit">保存</x-button>
            </div>
          </form>
        </div>
      </x-card>
    </div>
  `,
  styles: [`
    .config-panel {
      padding: 16px;
      margin: 8px;
      width: 100%;
      height: 100%;
      overflow-y: auto;
    }
    .form-group {
      margin-bottom: 20px;
    }
    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
    }
    .form-actions {
      margin-top: 24px;
      display: flex;
      justify-content: flex-end;
    }
    .card-header {
      padding: 16px;
      border-bottom: 1px solid #f0f0f0;
    }
    .card-header h3, .card-header h4 {
      margin: 0;
    }
    .card-body {
      padding: 16px;
    }
    .transform-help {
      margin-top: 16px;
      padding: 16px;
      background: #f9f9f9;
      border-radius: 4px;
      border: 1px solid #f0f0f0;
    }
    .example-list {
      margin: 12px 0;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .example-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .example-name {
      font-weight: 500;
    }
    .example-desc {
      color: #666;
      font-size: 12px;
      margin-bottom: 8px;
    }
    .example-code {
      display: block;
      padding: 8px;
      background: #f8f9fa;
      font-size: 12px;
      white-space: pre-wrap;
      border-radius: 4px;
      border: 1px solid #eee;
    }
    .help-text {
      font-size: 13px;
      color: #666;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #eee;
    }
    code {
      background: #f8f9fa;
      padding: 2px 4px;
      border-radius: 2px;
      font-family: monospace;
    }
    
    ::ng-deep .x-input, ::ng-deep .x-textarea {
      width: 100%;
    }
  `]
})
export class NodeConfigPanelComponent implements OnInit, OnDestroy {
  selectedNode$: Observable<NodeConfig | null>;
  configForm: FormGroup;
  private currentNode: NodeConfig | null = null;
  private subscription: Subscription;
  previewData$ = this.dataService.previewData$;
  transformExamples = this.dataService.getTransformExamples();
  private projectId!: string;
  loading = false;

  constructor(
    private nodeConfigService: NodeConfigService,
    private dataService: DataService,
    private csvService: CsvService,
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private messageBox: XMessageBoxService,
    private message: XMessageService
  ) {
    this.configForm = this.fb.group({});
    this.selectedNode$ = this.nodeConfigService.selectedNode$;
    this.subscription = new Subscription();
  }

  ngOnInit() {
    // 获取项目ID
    this.route.paramMap.subscribe(params => {
      this.projectId = params.get('id')!;
    });

    // 监听节点选择变化
    this.subscription = this.selectedNode$.subscribe(async (node: NodeConfig | null) => {
      console.log("Node selected in panel:", node);
      this.currentNode = node;
      
      if (node) {
        try {
          console.log("Loading config for node:", node.id);
          // 加载节点配置
          const config = await this.projectService.loadNodeConfig(this.projectId, node.id);
          console.log("Loaded node config:", config);
          this.initForm(node, config || {});
        } catch (error: any) {
          console.error("Failed to load node config:", error);
          this.message.error(`加载节点配置失败: ${error.message}`);
          // 即使加载失败，也初始化一个空表单
          this.initForm(node, {});
        }
      } else {
        // 创建一个空的表单，防止界面出错
        this.configForm = this.fb.group({});
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private initForm(node: NodeConfig, config: any) {
    const formConfig: Record<string, any[]> = {};
    this.getConfigFields(node.type).forEach(field => {
      formConfig[field.key] = [config[field.key] || ''];
    });
    this.configForm = this.fb.group(formConfig);
  }

  getConfigFields(type: string): ConfigField[] {
    switch (type) {
      case 'source':
        return [
          { key: 'file', label: 'CSV文件', type: 'file' },
          { key: 'encoding', label: '编码', type: 'text' }
        ];
      case 'transform':
        return [
          { key: 'expression', label: '转换表达式', type: 'transform' }
        ];
      case 'target':
        return [
          { key: 'path', label: '目标路径', type: 'text' }
        ];
      default:
        return [];
    }
  }

  async onFileSelected(event: Event, controlName: string) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !this.currentNode) return;

    this.loading = true;
    try {
      const data = await this.csvService.parseCsvFile(file);
      this.dataService.setNodeData(this.currentNode.id, data);
      this.configForm.patchValue({ [controlName]: file.name });
      this.message.success(`成功导入 ${data.length} 条数据`);
    } catch (error: any) {
      this.message.error(`CSV解析失败: ${error.message}`);
    } finally {
      this.loading = false;
    }
  }

  onSubmit() {
    if (!this.currentNode) return;

    this.loading = true;
    const config = this.configForm.value;
    
    this.projectService.saveNodeConfig(this.projectId, this.currentNode.id, config)
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: () => {
          this.nodeConfigService.updateNodeProperties(this.currentNode!.id, config);
          this.message.success('节点配置已保存');
        },
        error: (error) => {
          this.message.error(`保存失败: ${error.message}`);
        }
      });
  }

  applyExample(code: string) {
    this.configForm.patchValue({
      expression: code
    });
  }
}
