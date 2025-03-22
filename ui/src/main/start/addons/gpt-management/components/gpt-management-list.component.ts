import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GptManagementService } from '../services/gpt-management.service';
import { GptModelFormDialogComponent } from './gpt-model-form-dialog.component';
import { GptModel } from '../models/gpt-model.interface';
import { ConfirmDialogComponent } from './confirm-dialog.component';

@Component({
  selector: 'app-gpt-management-list',
  template: `
    <div class="container">
      <div class="header">
        <h2>GPT模型管理</h2>
        <button mat-raised-button color="primary" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon> 添加模型
        </button>
      </div>

      <mat-table [dataSource]="models" class="mat-elevation-z8">
        <ng-container matColumnDef="logo">
          <mat-header-cell *matHeaderCellDef> Logo </mat-header-cell>
          <mat-cell *matCellDef="let model">
            <div class="logo-container">
              <img 
                *ngIf="model.logo" 
                [src]="'/api/uploads/logos/' + model.logo" 
                [alt]="model.name + ' logo'"
                class="model-logo"
              >
              <mat-icon *ngIf="!model.logo" class="no-logo">image</mat-icon>
            </div>
          </mat-cell>
        </ng-container>

        <ng-container matColumnDef="name">
          <mat-header-cell *matHeaderCellDef> 名称 </mat-header-cell>
          <mat-cell *matCellDef="let model"> {{model.name}} </mat-cell>
        </ng-container>

        <ng-container matColumnDef="description">
          <mat-header-cell *matHeaderCellDef> 描述 </mat-header-cell>
          <mat-cell *matCellDef="let model"> {{model.description}} </mat-cell>
        </ng-container>

        <ng-container matColumnDef="apiEndpoint">
          <mat-header-cell *matHeaderCellDef> API地址 </mat-header-cell>
          <mat-cell *matCellDef="let model"> {{model.apiEndpoint}} </mat-cell>
        </ng-container>

        <ng-container matColumnDef="actions">
          <mat-header-cell *matHeaderCellDef> 操作 </mat-header-cell>
          <mat-cell *matCellDef="let model">
            <button mat-icon-button color="primary" (click)="edit(model)">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button color="warn" (click)="delete(model.id)">
              <mat-icon>delete</mat-icon>
            </button>
          </mat-cell>
        </ng-container>

        <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
        <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
      </mat-table>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .mat-table {
      width: 100%;
    }
    .logo-container {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      border-radius: 4px;
      background-color: #f5f5f5;
    }
    .model-logo {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .no-logo {
      opacity: 0.5;
      color: #999;
    }
    .mat-column-logo {
      flex: 0 0 60px;
    }
  `]
})
export class GptManagementListComponent implements OnInit {
  models: GptModel[] = [];
  displayedColumns: string[] = ['logo', 'name', 'description', 'apiEndpoint', 'actions'];

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private gptManagementService: GptManagementService
  ) {}

  ngOnInit() {
    this.loadModels();
  }

  loadModels() {
    this.gptManagementService.getAll().subscribe(
      data => this.models = data,
      error => this.showError('加载模型列表失败')
    );
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(GptModelFormDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.gptManagementService.create(result).subscribe(
          () => {
            this.loadModels();
            this.showSuccess('创建成功');
          },
          error => this.showError('创建失败')
        );
      }
    });
  }

  edit(model: GptModel) {
    const dialogRef = this.dialog.open(GptModelFormDialogComponent, {
      data: model
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.gptManagementService.update(model.id, result).subscribe(
          () => {
            this.loadModels();
            this.showSuccess('更新成功');
          },
          error => this.showError('更新失败')
        );
      }
    });
  }

  delete(id: number) {
    const confirmRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: '确认删除', message: '确定要删除这个模型吗？' }
    });
    confirmRef.afterClosed().subscribe(result => {
      if (result) {
        this.gptManagementService.delete(id).subscribe(
          () => {
            this.loadModels();
            this.showSuccess('删除成功');
          },
          error => this.showError('删除失败')
        );
      }
    });
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, '关闭', { duration: 3000 });
  }

  private showError(message: string) {
    this.snackBar.open(message, '关闭', { duration: 3000, panelClass: ['error-snackbar'] });
  }
}
