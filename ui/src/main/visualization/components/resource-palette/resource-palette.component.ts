import { Component, Output, EventEmitter } from '@angular/core';

interface PaletteItem {
  type?: string;
  label: string;
  icon?: string;
}

@Component({
  selector: 'app-resource-palette',
  templateUrl: './resource-palette.component.html',
  styleUrls: ['./resource-palette.component.scss']
})
export class ResourcePaletteComponent {
  @Output() itemSelected = new EventEmitter<PaletteItem>();

  resourceItems: PaletteItem[] = [
    { label: 'API数据', icon: '🔗' },
    { label: '静态资源', icon: '📁' },
    { label: '数据库', icon: '🗄️' }
  ];

  onItemClick(item: PaletteItem) {
    this.itemSelected.emit(item);
  }
}