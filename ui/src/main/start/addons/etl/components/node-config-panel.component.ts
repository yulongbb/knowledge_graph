import { Component, OnInit, OnDestroy } from '@angular/core';
import { NodeConfigService, NodeConfig } from '../services/node-config.service';
import { DataService } from '../services/data.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { CsvService } from '../services/csv.service';

interface ConfigField {
  key: string;
  label: string;
  type: string;
}

@Component({
  selector: 'app-node-config-panel',
  template: `
    <div class="config-panel" *ngIf="selectedNode$ | async as node">
      <h3>节点配置</h3>
      <form [formGroup]="configForm" (ngSubmit)="onSubmit()">
        <div class="form-group" *ngFor="let prop of getConfigFields(node.type)">
          <label [for]="prop.key">{{prop.label}}</label>
          <ng-container [ngSwitch]="prop.type">
            <ng-container *ngSwitchCase="'transform'">
              <textarea [id]="prop.key" [formControlName]="prop.key" rows="5"></textarea>
              <div class="transform-help">
                <h4>转换示例：</h4>
                <div class="example-list">
                  <div class="example" *ngFor="let example of transformExamples">
                    <div class="example-header">
                      <span class="example-name">{{example.name}}</span>
                      <button type="button" (click)="applyExample(example.code)">应用</button>
                    </div>
                    <div class="example-desc">{{example.description}}</div>
                    <code class="example-code">{{example.code}}</code>
                  </div>
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
            </ng-container>
            <input *ngSwitchCase="'file'" type="file" [id]="prop.key" (change)="onFileSelected($event, prop.key)" accept=".csv">
            <input *ngSwitchCase="'text'" [type]="prop.type" [id]="prop.key" [formControlName]="prop.key">
          </ng-container>
        </div>
        <button type="submit">保存</button>
      </form>

      <div class="data-preview" *ngIf="previewData$ | async as preview">
        <h4>数据预览</h4>
        <pre>{{preview.data | json}}</pre>
      </div>
    </div>
  `,
  styles: [`
    .config-panel {
      padding: 16px;
      border: 1px solid #ddd;
      border-radius: 4px;
      margin: 8px;
    }
    .form-group {
      margin-bottom: 12px;
    }
    label {
      display: block;
      margin-bottom: 4px;
    }
    input {
      width: 100%;
      padding: 4px;
    }
    .data-preview {
      margin-top: 16px;
      padding: 8px;
      background: #f5f5f5;
      border-radius: 4px;
    }
    pre {
      max-height: 200px;
      overflow: auto;
      margin: 0;
    }
    textarea {
      width: 100%;
      padding: 8px;
      font-family: monospace;
      resize: vertical;
    }
    .transform-help {
      margin-top: 8px;
      padding: 8px;
      background: #f5f5f5;
      border-radius: 4px;
    }
    .example-list {
      margin: 8px 0;
    }
    .example {
      margin-bottom: 12px;
      padding: 8px;
      background: #fff;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .example-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }
    .example-name {
      font-weight: 500;
    }
    .example-desc {
      color: #666;
      font-size: 12px;
      margin-bottom: 4px;
    }
    .example-code {
      display: block;
      padding: 4px;
      background: #f8f9fa;
      font-size: 12px;
      white-space: pre-wrap;
    }
    .help-text {
      font-size: 12px;
      color: #666;
    }
    code {
      background: #f8f9fa;
      padding: 2px 4px;
      border-radius: 2px;
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

  constructor(
    private nodeConfigService: NodeConfigService,
    private dataService: DataService,
    private csvService: CsvService,
    private fb: FormBuilder
  ) {
    this.configForm = this.fb.group({});
    this.selectedNode$ = this.nodeConfigService.selectedNode$;
    this.subscription = new Subscription();
  }

  ngOnInit() {
    this.subscription = this.selectedNode$.subscribe((node: NodeConfig | null) => {
      this.currentNode = node;
      if (node) {
        this.initForm(node);
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private initForm(node: NodeConfig) {
    const formConfig: Record<string, any[]> = {};
    this.getConfigFields(node.type).forEach(field => {
      formConfig[field.key] = [node.properties[field.key] || ''];
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

    try {
      const data = await this.csvService.parseCsvFile(file);
      this.dataService.setNodeData(this.currentNode.id, data);
      this.configForm.patchValue({ [controlName]: file.name });
    } catch (error) {
      console.error('Error parsing CSV:', error);
    }
  }

  onSubmit() {
    if (this.currentNode) {
      this.nodeConfigService.updateNodeProperties(
        this.currentNode.id,
        this.configForm.value
      );
    }
  }

  applyExample(code: string) {
    this.configForm.patchValue({
      expression: code
    });
  }
}
