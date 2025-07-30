import { Component, Output, EventEmitter } from '@angular/core';

interface PaletteItem {
  type: string;
  label: string;
  icon?: string;
  category?: string;
}

interface ChartGroup {
  group: string;
  items: PaletteItem[];
}

@Component({
  selector: 'app-chart-palette',
  templateUrl: './chart-palette.component.html',
  styleUrls: ['./chart-palette.component.scss']
})
export class ChartPaletteComponent {
  @Output() itemSelected = new EventEmitter<PaletteItem>();

  chartGroups: ChartGroup[] = [
    {
      group: '基础图表',
      items: [
        { type: 'bar', label: '柱状图', icon: '📊', category: '基础' },
        { type: 'line', label: '折线图', icon: '📈', category: '基础' },
        { type: 'pie', label: '饼图', icon: '🥧', category: '基础' }
      ]
    },
    {
      group: '高级图表',
      items: [
        { type: 'scatter', label: '散点图', icon: '🔵', category: '高级' },
        { type: 'radar', label: '雷达图', icon: '🕸️', category: '高级' }
      ]
    },
    {
      group: '其他',
      items: [
        { type: 'text', label: '文本', icon: '🔤', category: '其他' }
      ]
    }
  ];

  onItemClick(item: PaletteItem) {
    this.itemSelected.emit(item);
  }
}