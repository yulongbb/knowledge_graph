import { Component, OnInit } from '@angular/core';

interface NavigationSite {
  name: string;
  url: string;
  description: string;
  icon: string;
}

interface NavigationCategory {
  name: string;
  icon: string;
  sites: NavigationSite[];
}

@Component({
  selector: 'app-knowledge-navigation',
  templateUrl: './knowledge-navigation.component.html',
  styleUrls: ['./knowledge-navigation.component.scss']
})
export class KnowledgeNavigationComponent implements OnInit {
  navigationCategories: NavigationCategory[] = [
    {
      name: '搜索引擎',
      icon: 'fas fa-search',
      sites: [
        {
          name: 'Google',
          url: 'https://www.google.com',
          description: '全球最大的搜索引擎',
          icon: 'assets/icons/sites/google.png'
        },
        {
          name: '百度',
          url: 'https://www.baidu.com',
          description: '中国最大的搜索引擎',
          icon: 'assets/icons/sites/baidu.png'
        },
        {
          name: '必应',
          url: 'https://www.bing.com',
          description: '微软搜索引擎',
          icon: 'assets/icons/sites/bing.png'
        }
      ]
    },
    {
      name: '开发工具',
      icon: 'fas fa-code',
      sites: [
        {
          name: 'GitHub',
          url: 'https://github.com',
          description: '全球最大的代码托管平台',
          icon: 'assets/icons/sites/github.png'
        },
        {
          name: 'Stack Overflow',
          url: 'https://stackoverflow.com',
          description: '程序员问答社区',
          icon: 'assets/icons/sites/stackoverflow.png'
        },
        {
          name: 'CodePen',
          url: 'https://codepen.io',
          description: '前端代码分享平台',
          icon: 'assets/icons/sites/codepen.png'
        }
      ]
    },
    {
      name: '设计资源',
      icon: 'fas fa-palette',
      sites: [
        {
          name: 'Dribbble',
          url: 'https://dribbble.com',
          description: '设计师作品展示平台',
          icon: 'assets/icons/sites/dribbble.png'
        },
        {
          name: 'Behance',
          url: 'https://www.behance.net',
          description: 'Adobe创意作品社区',
          icon: 'assets/icons/sites/behance.png'
        },
        {
          name: 'Unsplash',
          url: 'https://unsplash.com',
          description: '高质量免费图片库',
          icon: 'assets/icons/sites/unsplash.png'
        }
      ]
    },
    {
      name: '学习资源',
      icon: 'fas fa-graduation-cap',
      sites: [
        {
          name: 'Coursera',
          url: 'https://www.coursera.org',
          description: '在线课程学习平台',
          icon: 'assets/icons/sites/coursera.png'
        },
        {
          name: 'edX',
          url: 'https://www.edx.org',
          description: '顶尖大学在线课程',
          icon: 'assets/icons/sites/edx.png'
        },
        {
          name: 'Khan Academy',
          url: 'https://www.khanacademy.org',
          description: '免费在线教育平台',
          icon: 'assets/icons/sites/khan.png'
        }
      ]
    }
  ];

  constructor() { }

  ngOnInit(): void { }

  openSite(url: string): void {
    window.open(url, '_blank');
  }
}
