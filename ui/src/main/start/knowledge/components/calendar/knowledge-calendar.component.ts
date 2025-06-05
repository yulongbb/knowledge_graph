import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-knowledge-calendar',
  templateUrl: './knowledge-calendar.component.html',
  styleUrls: ['./knowledge-calendar.component.scss']
})
export class KnowledgeCalendarComponent implements OnInit {
  @Input() events: any[] = [];
  @Output() dateSelected = new EventEmitter<Date>();
  
  currentDate = new Date();
  selectedDate = new Date();
  currentMonth: number;
  currentYear: number;
  weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  calendarDays: any[] = [];
  monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  
  constructor() {
    this.currentMonth = this.currentDate.getMonth();
    this.currentYear = this.currentDate.getFullYear();
  }

  ngOnInit(): void {
    this.generateCalendar();
  }

  ngOnChanges(): void {
    this.generateCalendar();
  }

  generateCalendar(): void {
    this.calendarDays = [];
    
    // 获取当月第一天
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    // 获取当月最后一天
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    
    // 填充上个月的日期
    const firstDayOfWeek = firstDay.getDay();
    const prevMonthLastDay = new Date(this.currentYear, this.currentMonth, 0).getDate();
    
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      this.calendarDays.push({
        date: prevMonthLastDay - i,
        currentMonth: false,
        today: false,
        selected: false,
        hasEvent: false
      });
    }
    
    // 填充当月的日期
    const daysInMonth = lastDay.getDate();
    const today = new Date();
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(this.currentYear, this.currentMonth, i);
      const isToday = date.getDate() === today.getDate() && 
                      date.getMonth() === today.getMonth() && 
                      date.getFullYear() === today.getFullYear();
                      
      const isSelected = date.getDate() === this.selectedDate.getDate() && 
                         date.getMonth() === this.selectedDate.getMonth() && 
                         date.getFullYear() === this.selectedDate.getFullYear();
                         
      // 检查当天是否有事件
      const hasEvent = this.checkForEvents(date);
      
      this.calendarDays.push({
        date: i,
        currentMonth: true,
        today: isToday,
        selected: isSelected,
        hasEvent: hasEvent
      });
    }
    
    // 填充下个月的日期
    const remainingDays = 42 - this.calendarDays.length; // 6行7列 = 42
    
    for (let i = 1; i <= remainingDays; i++) {
      this.calendarDays.push({
        date: i,
        currentMonth: false,
        today: false,
        selected: false,
        hasEvent: false
      });
    }
  }
  
  checkForEvents(date: Date): boolean {
    if (!this.events || this.events.length === 0) return false;
    
    return this.events.some(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === date.getDate() && 
             eventDate.getMonth() === date.getMonth() && 
             eventDate.getFullYear() === date.getFullYear();
    });
  }
  
  prevMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.generateCalendar();
  }
  
  nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.generateCalendar();
  }
  
  selectDate(day: any): void {
    if (!day.currentMonth) return;
    
    this.calendarDays.forEach(d => d.selected = false);
    day.selected = true;
    this.selectedDate = new Date(this.currentYear, this.currentMonth, day.date);
    this.dateSelected.emit(this.selectedDate);
  }
  
  goToToday(): void {
    const today = new Date();
    this.currentMonth = today.getMonth();
    this.currentYear = today.getFullYear();
    this.selectedDate = new Date();
    this.generateCalendar();
  }
}
