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
  styleUrls: ['./project-list.component.scss'] // Ensure the correct path to the SCSS file
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
      const project:any = this.projectService.createProject(name, description);
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
