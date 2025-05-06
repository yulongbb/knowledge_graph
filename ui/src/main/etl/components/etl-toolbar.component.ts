import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-etl-toolbar',
  template: `
    <div class="etl-toolbar">
      <div class="toolbar-group">
        <x-button type="primary" icon="fto-save" (click)="onSave()">保存</x-button>
      </div>
      <div class="toolbar-group">
        <x-button type="primary" icon="fto-play" (click)="onExecute()">执行</x-button>
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
  `]
})
export class EtlToolbarComponent {
  @Output() save = new EventEmitter<void>();
  @Output() execute = new EventEmitter<void>();

  onSave() { this.save.emit(); }
  onExecute() { this.execute.emit(); }
}
