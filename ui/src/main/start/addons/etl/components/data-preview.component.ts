import { Component } from '@angular/core';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-data-preview',
  template: `
    <div class="data-preview">
      <div class="header">
        <h3>数据预览</h3>
      </div>
      <div class="table-container" *ngIf="(dataService.previewData$ | async)?.data as data">
        <table>
          <thead>
            <tr>
              <th *ngFor="let header of getHeaders(data)">{{header}}</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of data.slice(0, 10)">
              <td *ngFor="let header of getHeaders(data)">{{row[header]}}</td>
            </tr>
          </tbody>
        </table>
        <div class="info" *ngIf="data.length > 10">
          显示前10条数据，共 {{data.length}} 条
        </div>
      </div>
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
    .header {
      margin-bottom: 8px;
    }
    .table-container {
      overflow: auto;
      flex: 1;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 8px;
      border: 1px solid #ddd;
      text-align: left;
    }
    th {
      background: #f5f5f5;
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

  getHeaders(data: any[]): string[] {
    if (data.length === 0) return [];
    return Object.keys(data[0]);
  }
}
