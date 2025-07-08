import { Component, Output, EventEmitter, OnInit } from '@angular/core';

interface DataSource {
  id: number;
  name: string;
  type: 'mysql' | 'api' | 'csv' | 'json';
  connected: boolean;
  url?: string;
  config?: any;
}

@Component({
  selector: 'app-data-source-panel',
  template: `
    <div class="data-source-panel">
      <div class="panel-header">
        <button class="add-source-btn" (click)="addDataSource()">+ 添加数据源</button>
      </div>
      
      <div class="data-source-list">
        <div 
          class="data-source-item" 
          *ngFor="let source of dataSources; trackBy: trackByFn"
          [class.connected]="source.connected"
          (click)="selectDataSource(source)"
        >
          <div class="source-info">
            <span class="source-name">{{ source.name }}</span>
            <span class="source-type">{{ getTypeLabel(source.type) }}</span>
          </div>
          <div class="source-actions">
            <button 
              class="action-btn connect-btn" 
              [class.connected]="source.connected"
              (click)="toggleConnection(source, $event)"
              [title]="source.connected ? '断开连接' : '连接'"
            >
              {{ source.connected ? '已连接' : '未连接' }}
            </button>
            <button 
              class="action-btn config-btn" 
              (click)="configureDataSource(source, $event)"
              title="配置"
            >
              ⚙️
            </button>
            <button 
              class="action-btn delete-btn" 
              (click)="deleteDataSource(source, $event)"
              title="删除"
            >
              🗑️
            </button>
          </div>
          <span class="source-status" [class.connected]="source.connected"></span>
        </div>
      </div>

      <div class="data-preview" *ngIf="selectedSource">
        <h4>数据预览 - {{ selectedSource.name }}</h4>
        <div class="preview-content">
          <div *ngIf="!selectedSource.connected" class="no-connection">
            请先连接数据源
          </div>
          <div *ngIf="selectedSource.connected" class="data-table">
            <table>
              <thead>
                <tr>
                  <th *ngFor="let col of previewColumns">{{ col }}</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let row of previewData">
                  <td *ngFor="let col of previewColumns">{{ row[col] }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./data-source-panel.component.scss']
})
export class DataSourcePanelComponent implements OnInit {
  @Output() sourceSelected = new EventEmitter<DataSource>();
  @Output() sourceConnected = new EventEmitter<DataSource>();
  @Output() sourceConfigured = new EventEmitter<DataSource>();

  dataSources: DataSource[] = [
    { id: 1, name: 'MySQL数据库', type: 'mysql', connected: true },
    { id: 2, name: 'API接口', type: 'api', connected: false },
    { id: 3, name: 'CSV文件', type: 'csv', connected: true },
    { id: 4, name: 'JSON数据', type: 'json', connected: false }
  ];

  selectedSource: DataSource | null = null;
  nextId = 5;

  // 模拟数据预览
  previewColumns: string[] = ['id', 'name', 'value', 'date'];
  previewData: any[] = [
    { id: 1, name: '数据1', value: 100, date: '2024-01-01' },
    { id: 2, name: '数据2', value: 200, date: '2024-01-02' },
    { id: 3, name: '数据3', value: 150, date: '2024-01-03' }
  ];

  ngOnInit() {
    // 默认选中第一个数据源
    if (this.dataSources.length > 0) {
      this.selectedSource = this.dataSources[0];
    }
  }

  trackByFn(index: number, item: DataSource): number {
    return item.id;
  }

  getTypeLabel(type: string): string {
    const typeMap: { [key: string]: string } = {
      'mysql': 'MySQL',
      'api': 'API',
      'csv': 'CSV',
      'json': 'JSON'
    };
    return typeMap[type] || type;
  }

  selectDataSource(source: DataSource) {
    this.selectedSource = source;
    this.sourceSelected.emit(source);
  }

  toggleConnection(source: DataSource, event: Event) {
    event.stopPropagation();
    source.connected = !source.connected;
    this.sourceConnected.emit(source);
  }

  configureDataSource(source: DataSource, event: Event) {
    event.stopPropagation();
    this.sourceConfigured.emit(source);
    // 这里可以打开配置对话框
    console.log('配置数据源:', source);
  }

  deleteDataSource(source: DataSource, event: Event) {
    event.stopPropagation();
    const index = this.dataSources.findIndex(s => s.id === source.id);
    if (index > -1) {
      this.dataSources.splice(index, 1);
      if (this.selectedSource?.id === source.id) {
        this.selectedSource = this.dataSources.length > 0 ? this.dataSources[0] : null;
      }
    }
  }

  addDataSource() {
    const newSource: DataSource = {
      id: this.nextId++,
      name: `新数据源${this.nextId - 1}`,
      type: 'api',
      connected: false
    };
    this.dataSources.push(newSource);
    this.selectDataSource(newSource);
  }
}
