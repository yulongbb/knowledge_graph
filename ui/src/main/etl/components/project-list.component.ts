import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../services/project.service';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { XMessageBoxService } from '@ng-nest/ui/message-box';
import { XDialogService } from '@ng-nest/ui/dialog';
import { finalize } from 'rxjs/operators';
import { XMessageService } from '@ng-nest/ui/message';
import { CreateProjectDialogComponent } from './create-project-dialog.component';

@Component({
  selector: 'app-project-list',
  template: `
    <div class="project-container">
      <div class="header">
        <h2>ETL项目管理</h2>
        <x-button type="primary" icon="fto-plus" (click)="openCreateDialog()">新建项目</x-button>
      </div>

      <div class="project-list">
        <x-card *ngFor="let project of projects$ | async" class="project-card">
          <div class="card-header">
            <h3>{{project.name}}</h3>
          </div>
          <div class="card-body">
            <p>{{project.description}}</p>
            <div class="meta">
              <span><i class="fto-calendar"></i>创建: {{project.createTime | date:'short'}}</span>
              <span><i class="fto-refresh-cw"></i>更新: {{project.updateTime | date:'short'}}</span>
            </div>
          </div>
          <div class="card-actions">
            <x-button type="primary" icon="fto-settings" (click)="openProject(project.id)">配置</x-button>
            <x-button type="danger" icon="fto-trash-2" (click)="confirmDelete(project.id)">删除</x-button>
          </div>
        </x-card>
      </div>
    </div>
  `,
  styleUrls: ['./project-list.component.scss'] 
})
export class ProjectListComponent implements OnInit {
  projects$ = this.projectService.projects$;
  loading = false;
  
  constructor(
    private projectService: ProjectService,
    private fb: FormBuilder,
    private router: Router,
    private dialogService: XDialogService,
    private messageBox: XMessageBoxService,
    private message: XMessageService
  ) {}

  ngOnInit() {
    this.loading = true;
    this.projectService.loadProjects();
  }

  openCreateDialog() {
    const dialogRef = this.dialogService.create(CreateProjectDialogComponent, {
      draggable: true,
      resizable: true,
      data: { 
        title: '新建 ETL 项目'
      }
    });

    dialogRef.afterClose.subscribe((result: any) => {
      if (result) {
        this.loading = true;
        this.projectService.createProject(result.name, result.description || '')
          .pipe(
            finalize(() => this.loading = false)
          )
          .subscribe({
            next: (project) => {
              this.message.success(`项目 "${project.name}" 已创建`);
            },
            error: (error) => {
              this.message.error(`创建失败: ${error.message}`);
            }
          });
      }
    });
  }

  openProject(id: string) {
    this.router.navigate(['/index/algorithm/editor', id]);
  }

  confirmDelete(id: string) {
    this.messageBox.confirm({
      title: '确认删除',
      content: '确定要删除此项目吗？此操作不可撤销。',
      type: 'warning',
      callback: (result) => {
        if (result) {
          this.loading = true;
          this.projectService.deleteProject(id)
            .pipe(
              finalize(() => this.loading = false)
            )
            .subscribe({
              next: () => {
                this.message.success('项目已删除');
              },
              error: (error) => {
                this.message.error(`删除失败: ${error.message}`);
              }
            });
        }
      }
    });
  }
}
