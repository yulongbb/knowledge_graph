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
      </x-card>
    </div>
  `,
  styles: [`
    .data-preview {
      border-top: 1px solid #ddd;
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
    .card-body {
      padding: 16px;
    }
    .info {
      padding: 8px;
      color: #666;
      font-size: 12px;
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
