import { Component, Output, EventEmitter } from '@angular/core';

interface PaletteItem {
  type?: string;
  label: string;
  icon?: string;
}

@Component({
  selector: 'app-material-palette',
  templateUrl: './material-palette.component.html',
  styleUrls: ['./material-palette.component.scss']
})
export class MaterialPaletteComponent {
  @Output() itemSelected = new EventEmitter<PaletteItem>();

  materialItems: PaletteItem[] = [
    { label: '插画', icon: '🎨' },
    { label: '图标', icon: '🔶' },
    { label: '形状', icon: '⭕' },
    { type: 'image', label: '图片', icon: '🖼️' }
  ];

  onItemClick(item: PaletteItem) {
    this.itemSelected.emit(item);
  }
}
 