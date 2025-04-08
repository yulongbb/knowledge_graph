import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { EChartsOption } from 'echarts';
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
  
  chartOptions: EChartsOption = {};
  updateOptions: EChartsOption = {};

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chartTitle'] || changes['chartType']) {
      this.initChartOptions();
    }
    
    if (changes['frequencyData'] || changes['displayLimit']) {
      if (this.frequencyData && this.frequencyData.length > 0) {
        this.updateFrequencyChart();
      }
    }
    
    if (changes['timeBasedData'] || changes['displayLimit']) {
      if (this.timeBasedData) {
        this.updateTimeBasedChart();
      }
    }
  }

  private initChartOptions(): void {
    this.chartOptions = {
      title: {
        text: this.chartTitle,
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: [],
        top: 'bottom'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: []
      },
      yAxis: {
        type: 'value'
      },
      series: []
    };
  }

  private updateFrequencyChart(): void {
    if (!this.frequencyData || this.frequencyData.length === 0) return;

    const limitedData = this.frequencyData.slice(0, this.displayLimit);
    const labels = limitedData.map(item => `${item.srcIp} → ${item.dstIp}`);
    const values = limitedData.map(item => item.count);
    
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#8C9EFF', '#DCE775', '#81C784', '#BA68C8'
    ];

    if (this.chartType === 'bar') {
      this.updateOptions = {
        xAxis: {
          type: 'category',
          data: labels
        },
        series: [{
          name: 'Communication Count',
          type: 'bar',
          data: values,
          itemStyle: {
            color: (params: any) => {
              return colors[params.dataIndex % colors.length];
            }
          }
        }]
      };
    } else if (this.chartType === 'pie') {
      const pieData = limitedData.map((item, index) => {
        return {
          name: `${item.srcIp} → ${item.dstIp}`,
          value: item.count,
          itemStyle: {
            color: colors[index % colors.length]
          }
        };
      });

      this.updateOptions = {
        series: [{
          type: 'pie',
          radius: '60%',
          center: ['50%', '50%'],
          data: pieData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      };
    }
  }

  private updateTimeBasedChart(): void {
    if (!this.timeBasedData) return;
    
    const timeKeys = Object.keys(this.timeBasedData);
    const topIpPairs = new Map<string, { counts: number[] }>();
    
    // Gather top IP pairs across all time periods
    timeKeys.forEach(timeKey => {
      const topPairs = this.timeBasedData![timeKey].slice(0, 5);
      
      topPairs.forEach(pair => {
        const pairKey = `${pair.srcIp} → ${pair.dstIp}`;
        if (!topIpPairs.has(pairKey)) {
          topIpPairs.set(pairKey, {
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
    
    // Create a series for each top IP pair
    const series: any[] = [];
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
    ];
    
    let colorIndex = 0;
    topIpPairs.forEach((value, key) => {
      series.push({
        name: key,
        type: 'line',
        data: value.counts,
        itemStyle: {
          color: colors[colorIndex % colors.length]
        }
      });
      colorIndex++;
    });
    
    this.updateOptions = {
      xAxis: {
        type: 'category',
        data: timeKeys
      },
      legend: {
        data: Array.from(topIpPairs.keys())
      },
      series: series
    };
  }
}
