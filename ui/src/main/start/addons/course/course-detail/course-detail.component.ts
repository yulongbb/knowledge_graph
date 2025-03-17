import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-course-detail',
  templateUrl: './course-detail.component.html',
  styleUrls: ['./course-detail.component.scss']
})
export class CourseDetailComponent {
  @Input() course: any;
  showLearningPath = false;
  selectedChapter = 0;
  activeTab = 'path';
  courseComments = [
    {
      username: '张三',
      avatar: 'assets/avatar1.jpg',
      date: '2023-12-01',
      content: '课程内容非常充实，讲解清晰，很有收获！',
      rating: 5
    },
    {
      username: '李四',
      avatar: 'assets/avatar2.jpg',
      date: '2023-11-30',
      content: '实验部分很实用，帮助理解理论知识。',
      rating: 4
    }
  ];

  chapters: any[] = [
    {
      title: '第一章：课程介绍',
      sections: ['1.1 课程概述', '1.2 学习目标', '1.3 前置知识']
    },
    {
      title: '第二章：基础概念',
      sections: ['2.1 核心理论', '2.2 基本原理', '2.3 实践应用']
    }
  ];

  basicBooks: any[] = [
    {
      title: '课程基础教材',
      author: '张三',
      publisher: '教育出版社',
      year: '2023',
      type: 'basic'
    }
  ];

  referenceBooks: any[] = [
    {
      title: '进阶参考书',
      author: '李四',
      publisher: '科技出版社',
      year: '2022',
      type: 'reference'
    }
  ];

  labs: any[] = [
    {
      title: '实验一：基础操作',
      description: '通过实践掌握基本概念和操作方法',
      duration: '2小时'
    },
    {
      title: '实验二：进阶应用',
      description: '深入理解核心概念，提升实践能力',
      duration: '3小时'
    }
  ];

  toggleLearningPath() {
    this.showLearningPath = !this.showLearningPath;
  }

  selectChapter(index: number) {
    this.selectedChapter = index;
  }

  getProgressText(chapter: any) {
    const completedSections = chapter.sections.filter((section: string) => true).length;
    return `${completedSections}/${chapter.sections.length}`;
  }
}
