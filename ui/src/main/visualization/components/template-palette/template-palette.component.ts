import { Component, Output, EventEmitter } from '@angular/core';

interface PaletteItem {
  type?: string;
  label: string;
  icon?: string;
  description?: string;
}

@Component({
  selector: 'app-template-palette',
  templateUrl: './template-palette.component.html',
  styleUrls: ['./template-palette.component.scss']
})
export class TemplatePaletteComponent {
  @Output() itemSelected = new EventEmitter<PaletteItem>();

  templateItems: PaletteItem[] = [
    { label: '空白模版', icon: '📄', description: '从头开始创建' },
    { label: '数据看板', icon: '📊', description: '数据可视化模版' },
    { label: '营销模版', icon: '📈', description: '营销活动展示' }
  ];

  onItemClick(item: PaletteItem) {
    this.itemSelected.emit(item);
  }
}
 