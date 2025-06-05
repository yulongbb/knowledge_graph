import { Component, OnInit, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-knowledge-weather',
  templateUrl: './knowledge-weather.component.html',
  styleUrls: ['./knowledge-weather.component.scss']
})
export class KnowledgeWeatherComponent implements OnInit {
  @Input() city: string = '北京';
  
  weather: any = {};
  forecast: any[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  cities: string[] = ['北京', '上海', '广州', '深圳', '杭州', '南京', '成都', '重庆', '武汉', '西安'];
  selectedCity: string = '北京';
  
  weatherIcons: {[key: string]: string} = {
    'sunny': 'fas fa-sun',
    'cloudy': 'fas fa-cloud',
    'rainy': 'fas fa-cloud-rain',
    'snowy': 'fas fa-snowflake',
    'stormy': 'fas fa-bolt',
    'foggy': 'fas fa-smog',
    'windy': 'fas fa-wind',
    'partly-cloudy': 'fas fa-cloud-sun',
  };

  // 天气状态文本映射
  weatherConditionTexts: {[key: string]: string} = {
    'sunny': '晴天',
    'cloudy': '多云',
    'rainy': '雨',
    'snowy': '雪',
    'stormy': '雷雨',
    'foggy': '雾',
    'windy': '大风',
    'partly-cloudy': '局部多云'
  };

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadWeather();
  }

  ngOnChanges(): void {
    if (this.city) {
      this.selectedCity = this.city;
      this.loadWeather();
    }
  }

  loadWeather(): void {
    this.isLoading = true;
    
    // 模拟API调用，实际项目中应替换为真实的天气API
    setTimeout(() => {
      this.weather = this.getMockWeatherData(this.selectedCity);
      this.forecast = this.getMockForecastData(this.selectedCity);
      this.isLoading = false;
    }, 800);
    
    // 实际API调用示例:
    // this.http.get(`https://weather-api.example.com/current?city=${this.selectedCity}`)
    //   .subscribe(
    //     (data: any) => {
    //       this.weather = data;
    //       this.isLoading = false;
    //     },
    //     (error) => {
    //       this.errorMessage = '无法加载天气数据，请稍后再试';
    //       this.isLoading = false;
    //     }
    //   );
  }

  // 获取天气条件对应的文本
  getWeatherConditionText(condition: string): string {
    return this.weatherConditionTexts[condition as keyof typeof this.weatherConditionTexts] || condition;
  }

  changeCity(city: string): void {
    this.selectedCity = city;
    this.loadWeather();
  }

  getWeatherIcon(condition: string): string {
    return this.weatherIcons[condition as keyof typeof this.weatherIcons] || 'fas fa-question';
  }

  private getMockWeatherData(city: string): any {
    const conditions = ['sunny', 'cloudy', 'rainy', 'partly-cloudy', 'windy'];
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    const randomTemp = Math.floor(Math.random() * 15) + 15; // 15-30度之间
    const randomHumidity = Math.floor(Math.random() * 30) + 40; // 40-70%之间
    
    return {
      city: city,
      temperature: randomTemp,
      condition: randomCondition,
      humidity: randomHumidity,
      wind: {
        speed: Math.floor(Math.random() * 20) + 5,
        direction: ['东', '南', '西', '北', '东南', '西南', '东北', '西北'][Math.floor(Math.random() * 8)]
      },
      aqi: Math.floor(Math.random() * 100) + 20,
      updated: new Date().toLocaleTimeString('zh-CN', {hour: '2-digit', minute:'2-digit'})
    };
  }

  private getMockForecastData(city: string): any[] {
    const forecast = [];
    const conditions = ['sunny', 'cloudy', 'rainy', 'partly-cloudy', 'windy'];
    
    // 生成未来5天的预报
    const today = new Date();
    
    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      const dayTemp = Math.floor(Math.random() * 10) + 20; // 20-30度
      const nightTemp = dayTemp - (Math.floor(Math.random() * 5) + 5); // 比白天低5-10度
      
      forecast.push({
        date: date,
        dayOfWeek: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()],
        condition: conditions[Math.floor(Math.random() * conditions.length)],
        temperature: {
          day: dayTemp,
          night: nightTemp
        }
      });
    }
    
    return forecast;
  }
}
