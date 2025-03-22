import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GptModel } from '../models/gpt-model.interface';
import { GptManagementService } from '../services/gpt-management.service';

@Component({
  selector: 'app-gpt-model-form-dialog',
  template: `
    <h2 mat-dialog-title>{{ isEdit ? '编辑模型' : '新增模型' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="model-form">
        <app-file-upload
          [previewUrl]="logoPreviewUrl"
          (fileSelected)="onLogoSelected($event)"
        ></app-file-upload>

        <mat-form-field appearance="fill">
          <mat-label>模型名称</mat-label>
          <input matInput formControlName="name" required>
          <mat-error *ngIf="form.get('name')?.hasError('required')">
            请输入模型名称
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>描述</mat-label>
          <textarea matInput formControlName="description" rows="3"></textarea>
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>API地址</mat-label>
          <input matInput formControlName="apiEndpoint" required>
          <mat-error *ngIf="form.get('apiEndpoint')?.hasError('required')">
            请输入API地址
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>API密钥</mat-label>
          <input matInput formControlName="apiKey" required [type]="hideKey ? 'password' : 'text'">
          <button mat-icon-button matSuffix (click)="hideKey = !hideKey">
            <mat-icon>{{hideKey ? 'visibility_off' : 'visibility'}}</mat-icon>
          </button>
          <mat-error *ngIf="form.get('apiKey')?.hasError('required')">
            请输入API密钥
          </mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">取消</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="!form.valid">
        确定
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .model-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 400px;
    }
    app-file-upload {
      margin-bottom: 16px;
    }
  `]
})
export class GptModelFormDialogComponent {
  form: FormGroup;
  isEdit: boolean;
  hideKey = true;
  selectedLogo: File | null = null;
  logoPreviewUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<GptModelFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: GptModel,
    private gptService: GptManagementService
  ) {
    this.isEdit = !!data;
    this.logoPreviewUrl = data?.logo ? `/api/uploads/logos/${data.logo}` : null;
    this.form = this.fb.group({
      name: [data?.name || '', Validators.required],
      description: [data?.description || ''],
      apiEndpoint: [data?.apiEndpoint || '', Validators.required],
      apiKey: [data?.apiKey || '', Validators.required]
    });
  }

  onLogoSelected(file: File) {
    this.selectedLogo = file;
    // 创建本地预览URL
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      this.logoPreviewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  async onSubmit() {
    if (this.form.valid) {
      const formData = new FormData();
      const formValue = this.form.value;
      
      // 添加表单字段到FormData
      Object.keys(formValue).forEach(key => {
        formData.append(key, formValue[key]);
      });

      // 如果选择了新logo，添加到FormData
      if (this.selectedLogo) {
        formData.append('logo', this.selectedLogo);
      }

      this.dialogRef.close(formData);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
