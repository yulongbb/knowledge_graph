import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { XDialogRef, X_DIALOG_DATA } from '@ng-nest/ui/dialog';

@Component({
  selector: 'app-create-project-dialog',
  template: `
    <div class="dialog-container">
      <h3 class="dialog-title">{{ data.title }}</h3>
      
      <form [formGroup]="projectForm">
        <div class="form-group">
          <label>项目名称 <span class="required">*</span></label>
          <x-input formControlName="name" placeholder="请输入项目名称"></x-input>
          <div *ngIf="projectForm.get('name')?.invalid && projectForm.get('name')?.touched" class="error-message">
            项目名称不能为空
          </div>
        </div>
        
        <div class="form-group">
          <label>项目描述</label>
          <x-textarea formControlName="description" rows="3" placeholder="请输入项目描述"></x-textarea>
        </div>
      </form>
      
      <div class="dialog-actions">
        <x-button (click)="close()">取消</x-button>
        <x-button type="primary" (click)="save()" [disabled]="!projectForm.valid">创建</x-button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container {
      width: 500px;
      padding: 1.5rem;
    }
    .dialog-title {
      margin-top: 0;
      margin-bottom: 1.5rem;
      font-size: 18px;
      color: #262626;
    }
    .form-group {
      margin-bottom: 1.5rem;
    }
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    .required {
      color: #ff4d4f;
      margin-left: 4px;
    }
    .error-message {
      color: #ff4d4f;
      font-size: 12px;
      margin-top: 4px;
    }
    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 2rem;
      gap: 0.5rem;
    }
    
    ::ng-deep .x-input, ::ng-deep .x-textarea {
      width: 100%;
    }
  `]
})
export class CreateProjectDialogComponent implements OnInit {
  projectForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: XDialogRef<CreateProjectDialogComponent>,
    @Inject(X_DIALOG_DATA) public data: { title: string }
  ) {
    this.projectForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      description: ['', Validators.maxLength(200)]
    });
  }

  ngOnInit(): void {}

  save(): void {
    if (this.projectForm.valid) {
      this.dialogRef.close(this.projectForm.value);
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.projectForm.controls).forEach(key => {
        this.projectForm.get(key)?.markAsTouched();
      });
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
