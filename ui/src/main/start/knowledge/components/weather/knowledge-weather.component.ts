import { Component, OnInit } from '@angular/core';

interface WeatherData {
  city: string;
  temperature: number;
  weather: string;
  humidity: number;
  windSpeed: string;
  icon: string;
}

interface ForecastData {
  date: string;
  dayOfWeek: string;
  high: number;
  low: number;
  weather: string;
  icon: string;
}

@Component({
  selector: 'app-knowledge-weather',
  templateUrl: './knowledge-weather.component.html',
  styleUrls: ['./knowledge-weather.component.scss']
})
export class KnowledgeWeatherComponent implements OnInit {
  currentWeather: WeatherData = {
    city: '北京',
    temperature: 25,
    weather: '晴',
    humidity: 45,
    windSpeed: '3-4级',
    icon: 'fas fa-sun'
  };

  forecast: ForecastData[] = [
    {
      date: '今天',
      dayOfWeek: '周一',
      high: 28,
      low: 15,
      weather: '晴',
      icon: 'fas fa-sun'
    },
    {
      date: '明天',
      dayOfWeek: '周二',
      high: 26,
      low: 17,
      weather: '多云',
      icon: 'fas fa-cloud-sun'
    },
    {
      date: '后天',
      dayOfWeek: '周三',
      high: 22,
      low: 14,
      weather: '小雨',
      icon: 'fas fa-cloud-rain'
    },
    {
      date: '周四',
      dayOfWeek: '周四',
      high: 24,
      low: 16,
      weather: '阴',
      icon: 'fas fa-cloud'
    },
    {
      date: '周五',
      dayOfWeek: '周五',
      high: 27,
      low: 18,
      weather: '晴',
      icon: 'fas fa-sun'
    }
  ];

  constructor() { }

  ngOnInit(): void {
    this.loadWeatherData();
  }

  loadWeatherData(): void {
    // 这里可以调用天气API获取实际数据
    console.log('Loading weather data...');
  }

  searchCity(city: string): void {
    // 搜索其他城市天气
    console.log('Searching weather for:', city);
  }
}
