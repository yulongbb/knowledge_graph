import { Component } from '@angular/core';
import { ProjectService } from '../services/project.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-project-list',
  template: `
    <div class="project-container">
      <div class="header">
        <h2>ETL项目管理</h2>
        <button class="btn btn-primary" (click)="showCreateDialog = true">
          <i>➕</i>新建项目
        </button>
      </div>

      <div class="project-list">
        <div *ngFor="let project of projects$ | async" class="project-card card">
          <div class="project-info">
            <h3>{{project.name}}</h3>
            <p>{{project.description}}</p>
            <div class="meta">
              <span><i>📅</i>创建: {{project.createTime | date:'short'}}</span>
              <span><i>🔄</i>更新: {{project.updateTime | date:'short'}}</span>
            </div>
          </div>
          <div class="actions">
            <button class="btn btn-primary" (click)="openProject(project.id)">
              <i>⚙️</i>配置
            </button>
            <button class="btn btn-danger" (click)="deleteProject(project.id)">
              <i>🗑️</i>删除
            </button>
          </div>
        </div>
      </div>

      <div class="dialog-overlay" *ngIf="showCreateDialog">
        <div class="dialog-content">
          <div class="dialog-header">
            <h3>新建 ETL 项目</h3>
          </div>
          <form [formGroup]="createForm" (ngSubmit)="createProject()" class="form">
            <div class="form-group">
              <label class="form-label">项目名称</label>
              <input class="form-input" type="text" formControlName="name" placeholder="输入项目名称">
            </div>
            <div class="form-group">
              <label class="form-label">项目描述</label>
              <textarea class="form-textarea" formControlName="description" rows="3" placeholder="输入项目描述"></textarea>
            </div>
            <div class="dialog-footer">
              <button type="button" class="btn btn-default" (click)="showCreateDialog = false">取消</button>
              <button type="submit" class="btn btn-primary" [disabled]="!createForm.valid">创建</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .project-container {
      padding: 24px;
      background: #f5f5f5;
      min-height: 100vh;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      h2 {
        margin: 0;
        font-size: 24px;
        color: #262626;
      }
    }
    .project-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 24px;
    }
    .project-card {
      padding: 20px;
    }
    .project-info {
      h3 {
        margin: 0 0 8px 0;
        color: #262626;
        font-size: 18px;
      }
      p {
        margin: 0 0 16px 0;
        color: #595959;
      }
    }
    .meta {
      display: flex;
      gap: 16px;
      color: #8c8c8c;
      font-size: 13px;
      span {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
    .actions {
      margin-top: 16px;
      display: flex;
      gap: 8px;
    }
  `]
})
export class ProjectListComponent {
  projects$ = this.projectService.projects$;
  showCreateDialog = false;
  createForm: FormGroup;

  constructor(
    private projectService: ProjectService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.createForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
  }

  createProject() {
    if (this.createForm.valid) {
      const { name, description } = this.createForm.value;
      const project = this.projectService.createProject(name, description);
      this.showCreateDialog = false;
      this.createForm.reset();
      this.openProject(project.id);
    }
  }

  openProject(id: string) {
    this.router.navigate(['/etl/editor', id]);
  }

  deleteProject(id: string) {
    if (confirm('确定要删除此项目吗？')) {
      this.projectService.deleteProject(id);
    }
  }
}
