import { Component, Output, EventEmitter } from '@angular/core';

interface PaletteItem {
  type?: string;
  label: string;
  icon?: string;
}

@Component({
  selector: 'app-chart-palette',
  templateUrl: './chart-palette.component.html',
  styleUrls: ['./chart-palette.component.scss']
})
export class ChartPaletteComponent {
  @Output() itemSelected = new EventEmitter<PaletteItem>();

  chartItems: PaletteItem[] = [
    { type: 'chart', label: '柱状图' },
    { type: 'chart', label: '折线图' },
    { type: 'chart', label: '饼图' },
    { type: 'text', label: '文本' }
  ];

  onItemClick(item: PaletteItem) {
    this.itemSelected.emit(item);
  }
}