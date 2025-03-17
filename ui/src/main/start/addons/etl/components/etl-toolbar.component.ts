import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-etl-toolbar',
  template: `
    <div class="etl-toolbar">
      <div class="toolbar-group">
        <button class="btn btn-primary" (click)="onSave()">
          <i>💾</i><span>保存</span>
        </button>
        <button class="btn btn-default" (click)="onLoad()">
          <i>📂</i><span>加载</span>
        </button>
      </div>
      <div class="toolbar-group">
        <button class="btn btn-primary" (click)="onExecute()">
          <i>▶️</i><span>执行</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .etl-toolbar {
      padding: 16px 24px;
      background: white;
      border-bottom: 1px solid #f0f0f0;
      display: flex;
      justify-content: space-between;
      gap: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .toolbar-group {
      display: flex;
      gap: 12px;
    }
    :host ::ng-deep .btn span {
      font-weight: 500;
    }
  `]
})
export class EtlToolbarComponent {
  @Output() save = new EventEmitter<void>();
  @Output() load = new EventEmitter<void>();
  @Output() execute = new EventEmitter<void>();

  onSave() { this.save.emit(); }
  onLoad() { this.load.emit(); }
  onExecute() { this.execute.emit(); }
}
