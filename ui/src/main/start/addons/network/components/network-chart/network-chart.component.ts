import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { IpFrequency, TimeBasedFrequency } from '../../models/network.model';

@Component({
  selector: 'app-network-chart',
  templateUrl: './network-chart.component.html',
  styleUrls: ['./network-chart.component.scss']
})
export class NetworkChartComponent implements OnChanges {
  @Input() chartType: 'bar' | 'line' | 'pie' = 'bar';
  @Input() chartTitle: string = '';
  @Input() frequencyData: IpFrequency[] = [];
  @Input() timeBasedData: TimeBasedFrequency | null = null;
  @Input() displayLimit: number = 10;
  
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  
  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: ''
      }
    }
  };
  
  public chartData: ChartData = {
    labels: [],
    datasets: []
  };

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.chartOptions && this.chartOptions.plugins && this.chartOptions.plugins.title) {
      this.chartOptions.plugins.title.text = this.chartTitle;
    }
    
    if (changes['frequencyData'] || changes['displayLimit']) {
      this.updateFrequencyChart();
    }
    
    if (changes['timeBasedData'] || changes['displayLimit']) {
      this.updateTimeBasedChart();
    }
  }

  private updateFrequencyChart(): void {
    if (!this.frequencyData || this.frequencyData.length === 0) return;

    const limitedData = this.frequencyData.slice(0, this.displayLimit);
    
    this.chartData = {
      labels: limitedData.map(item => `${item.srcIp} → ${item.dstIp}`),
      datasets: [{
        data: limitedData.map(item => item.count),
        label: 'Communication Count',
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)'
        ]
      }]
    };
    
    if (this.chart) {
      this.chart.update();
    }
  }

  private updateTimeBasedChart(): void {
    if (!this.timeBasedData) return;
    
    const timeKeys = Object.keys(this.timeBasedData);
    const datasets: any[] = [];
    const topIpPairs = new Map<string, { srcIp: string, dstIp: string, counts: number[] }>();
    
    // Gather top IP pairs across all time periods
    timeKeys.forEach(timeKey => {
      const topPairs = this.timeBasedData![timeKey].slice(0, 5);
      
      topPairs.forEach(pair => {
        const pairKey = `${pair.srcIp} → ${pair.dstIp}`;
        if (!topIpPairs.has(pairKey)) {
          topIpPairs.set(pairKey, {
            srcIp: pair.srcIp,
            dstIp: pair.dstIp,
            counts: new Array(timeKeys.length).fill(0)
          });
        }
      });
    });
    
    // Fill in counts for each pair
    timeKeys.forEach((timeKey, index) => {
      const pairs = this.timeBasedData![timeKey];
      pairs.forEach(pair => {
        const pairKey = `${pair.srcIp} → ${pair.dstIp}`;
        if (topIpPairs.has(pairKey)) {
          topIpPairs.get(pairKey)!.counts[index] = pair.count;
        }
      });
    });
    
    // Create a dataset for each top IP pair
    const colors = [
      'rgba(255, 99, 132, 0.6)',
      'rgba(54, 162, 235, 0.6)',
      'rgba(255, 206, 86, 0.6)',
      'rgba(75, 192, 192, 0.6)',
      'rgba(153, 102, 255, 0.6)'
    ];
    
    let colorIndex = 0;
    topIpPairs.forEach((value, key) => {
      datasets.push({
        data: value.counts,
        label: key,
        backgroundColor: colors[colorIndex % colors.length],
        borderColor: colors[colorIndex % colors.length].replace('0.6', '1'),
        fill: false
      });
      colorIndex++;
    });
    
    this.chartData = {
      labels: timeKeys,
      datasets: datasets
    };
    
    if (this.chart) {
      this.chart.update();
    }
  }
}
