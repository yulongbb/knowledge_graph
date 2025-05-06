import { Component, EventEmitter, Output, Input } from '@angular/core';

@Component({
  selector: 'app-etl-toolbar',
  template: `
    <div class="etl-toolbar">
      <div class="toolbar-left">
        <h2 class="project-title" *ngIf="projectName">{{projectName}}</h2>
      </div>
      <div class="toolbar-right">
        <div class="toolbar-group">
          <x-button type="primary" icon="fto-save" (click)="onSave()">保存</x-button>
          <x-button type="primary" icon="fto-play" (click)="onExecute()">执行</x-button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .etl-toolbar {
      padding: 12px 24px;
      background: white;
      border-bottom: 1px solid #f0f0f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    
    .toolbar-left, .toolbar-right {
      display: flex;
      align-items: center;
    }
    
    .project-title {
      margin: 0;
      font-size: 18px;
      font-weight: 500;
      color: #262626;
    }
    
    .toolbar-group {
      display: flex;
      gap: 12px;
    }
  `]
})
export class EtlToolbarComponent {
  @Input() projectName?: string;
  @Output() save = new EventEmitter<void>();
  @Output() execute = new EventEmitter<void>();

  onSave() { this.save.emit(); }
  onExecute() { this.execute.emit(); }
}
