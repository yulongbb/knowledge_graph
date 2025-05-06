import { Component } from '@angular/core';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-data-preview',
  template: `
    <div class="data-preview">
      <x-card>
        <div class="card-header">
          <h3>数据预览</h3>
        </div>
        <div class="card-body" *ngIf="(dataService.previewData$ | async)?.data as data">
          <x-table [columns]="getColumns(data)" [data]="data.slice(0, 10)"></x-table>
          <div class="info" *ngIf="data.length > 10">
            显示前10条数据，共 {{data.length}} 条
          </div>
        </div>
        <div class="card-empty" *ngIf="!((dataService.previewData$ | async)?.data)">
          <div class="empty-placeholder">
            <i class="fto-database"></i>
            <p>尚无数据预览，请选择一个节点并配置数据</p>
          </div>
        </div>
      </x-card>
    </div>
  `,
  styles: [`
    .data-preview {
      border-top: 1px solid #f0f0f0;
      padding: 16px;
      height: 300px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .card-header {
      padding: 16px;
      border-bottom: 1px solid #f0f0f0;
    }
    .card-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
    }
    .card-body {
      padding: 16px;
      overflow: auto;
    }
    .card-empty {
      padding: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 200px;
    }
    .empty-placeholder {
      text-align: center;
      color: #bfbfbf;
    }
    .empty-placeholder i {
      font-size: 32px;
      margin-bottom: 8px;
    }
    .info {
      padding: 8px;
      color: #666;
      font-size: 12px;
      background: #f9f9f9;
      border-radius: 4px;
      margin-top: 8px;
    }
    
    ::ng-deep .x-table {
      width: 100%;
    }
  `]
})
export class DataPreviewComponent {
  constructor(public dataService: DataService) {}

  getColumns(data: any[]) {
    if (data.length === 0) return [];
    return Object.keys(data[0]).map(key => {
      return { id: key, label: key, flex: 1 };
    });
  }
}
