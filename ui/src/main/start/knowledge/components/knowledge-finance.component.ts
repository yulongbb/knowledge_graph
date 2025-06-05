import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-knowledge-finance',
  templateUrl: './knowledge-finance.component.html',
  styleUrls: ['./knowledge-finance.component.scss']
})
export class KnowledgeFinanceComponent implements OnInit {
  // Add Math property to make it available in the template
  Math = Math;
  
  isLoading: boolean = true;
  errorMessage: string = '';
  
  // 伦敦金数据
  goldPrice = {
    current: 2046.75,
    change: +12.50,
    changePercent: +0.61,
    high: 2052.30,
    low: 2031.20,
    open: 2034.25,
    previousClose: 2034.25,
    timestamp: new Date(),
    currency: 'USD'
  };
  
  // 模拟历史价格数据（用于图表）
  chartData = {
    labels: [] as string[],
    datasets: [{
      label: '伦敦金价格 (USD/oz)',
      data: [] as number[],
      borderColor: '#FFD700',
      backgroundColor: 'rgba(255, 215, 0, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };
  
  // 财经新闻
  financialNews = [
    { id: 1, title: '美联储暗示年内可能降息，金价上涨', source: '华尔街日报', time: '2小时前', url: '#' },
    { id: 2, title: '中国央行增持黄金储备，为连续第18个月', source: '路透社', time: '5小时前', url: '#' },
    { id: 3, title: '全球经济不确定性加剧，避险资产受青睐', source: '金融时报', time: '昨天', url: '#' },
    { id: 4, title: '美元指数走弱，贵金属价格普遍上涨', source: '彭博社', time: '昨天', url: '#' },
    { id: 5, title: '印度黄金需求强劲回升，全球供应趋紧', source: '世界黄金协会', time: '2天前', url: '#' }
  ];
  
  // 市场概况
  marketOverview = [
    { name: '恒生指数', value: '17,687.85', change: '+0.92%', trend: 'up' },
    { name: '上证指数', value: '2,898.34', change: '+0.35%', trend: 'up' },
    { name: '道琼斯', value: '38,497.23', change: '-0.12%', trend: 'down' },
    { name: '纳斯达克', value: '15,609.00', change: '+0.28%', trend: 'up' },
    { name: '美元指数', value: '105.43', change: '-0.55%', trend: 'down' },
    { name: 'WTI原油', value: '77.91', change: '+1.25%', trend: 'up' }
  ];
  
  // 图表配置
  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index'
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        position: 'right',
        grid: {
          color: 'rgba(200, 200, 200, 0.2)'
        }
      }
    }
  };
  
  timeRangeOptions = ['1D', '1W', '1M', '3M', '6M', '1Y'];
  selectedTimeRange = '1W';
  
  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.generateChartData();
  }
  
  generateChartData(): void {
    this.isLoading = true;
    
    // 生成模拟历史数据
    const now = new Date();
    const labels: string[] = [];
    const data: number[] = [];
    let days = 7; // 默认一周数据
    
    switch(this.selectedTimeRange) {
      case '1D':
        days = 1;
        break;
      case '1W':
        days = 7;
        break;
      case '1M':
        days = 30;
        break;
      case '3M':
        days = 90;
        break;
      case '6M':
        days = 180;
        break;
      case '1Y':
        days = 365;
        break;
    }
    
    // 为了简单起见，只为天级别数据生成随机数据点
    // 实际应用中应从API获取真实数据
    const startPrice = 2000 + Math.random() * 100;
    let currentPrice = startPrice;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      
      // 格式化日期
      let label;
      if (days <= 1) {
        // 小时格式
        label = date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      } else {
        // 日期格式
        label = date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
      }
      
      labels.push(label);
      
      // 生成有一定上下变化的随机价格
      const change = (Math.random() - 0.48) * 20; // 略微上涨趋势
      currentPrice += change;
      data.push(parseFloat(currentPrice.toFixed(2)));
    }
    
    // 更新图表数据
    this.chartData = {
      labels: labels,
      datasets: [{
        label: '伦敦金价格 (USD/oz)',
        data: data,
        borderColor: '#FFD700',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        fill: true,
        tension: 0.4
      }]
    };
    
    this.isLoading = false;
  }
  
  changeTimeRange(range: string): void {
    this.selectedTimeRange = range;
    this.generateChartData();
  }
  
  isPriceUp(): boolean {
    return this.goldPrice.change > 0;
  }
  
  formatPrice(price: number): string {
    return price.toFixed(2);
  }
  
  refreshData(): void {
    this.isLoading = true;
    
    // 模拟API调用延迟
    setTimeout(() => {
      // 更新当前价格（随机小幅波动）
      const basePrice = this.goldPrice.current;
      const change = (Math.random() - 0.5) * 5;
      const newPrice = basePrice + change;
      
      this.goldPrice = {
        ...this.goldPrice,
        current: parseFloat(newPrice.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat((change / basePrice * 100).toFixed(2)),
        timestamp: new Date()
      };
      
      // 更新图表数据最新点
      const datasets = [...this.chartData.datasets];
      datasets[0].data[datasets[0].data.length - 1] = newPrice;
      
      this.chartData = {
        ...this.chartData,
        datasets
      };
      
      this.isLoading = false;
    }, 800);
    
    // 实际API调用示例:
    // this.http.get<any>('https://api.example.com/gold-price')
    //   .subscribe(
    //     data => {
    //       this.goldPrice = data;
    //       this.isLoading = false;
    //     },
    //     error => {
    //       this.errorMessage = '无法加载金价数据，请稍后再试';
    //       this.isLoading = false;
    //     }
    //   );
  }
}
