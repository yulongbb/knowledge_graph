import { Component, OnInit, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-wiki',
  templateUrl: './wiki.component.html',
  styleUrls: ['./wiki.component.scss']
})
export class WikiComponent implements OnInit, AfterViewInit {
  
  // 百科页面数据
  wikiTitle = '知识百科 共笔知识';
  
  // 热门条目数据
  hotEntries = [
    {
      title: '中央党史和文献研究院',
      description: '是中央直属事业单位，享受正部级待遇的事业单位，驻北京市。',
      imageUrl: 'assets/images/wiki/entry1.jpg'
    },
    {
      title: '大理三塔',
      description: '位于云南大理崇圣寺内，是大理国时期修建的著名佛塔。崇圣寺塔于2010年3月起已对外开放，并与周边"崇圣三塔文化旅游区"一同向游客开放。',
      linkText: '同类词条(查看全部)',
      linkUrl: '/wiki/category/temples'
    }
  ];
  
  // 优秀条目数据
  featuredEntry = {
    title: '乡镇企业',
    content: '乡镇企业（1960年—1983年12月8日），是一种经济组织，是由农村（包括乡镇）人、生产队（包括生产大队）人、社员（包括社员）个人，甚至是城镇居民在农村办的企业。"乡镇企业"概念最早引用于1979年...'
  };
  
  // 特色图片数据
  featuredImage = {
    title: '广元水景',
    imageUrl: 'assets/images/wiki/featured.jpg',
    description: '广元水景（四川省市）。拍摄者：王志超'
  };

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    // 确保卡片高度一致
    this.equalizeCardHeights();
    
    // 在窗口调整大小时重新计算高度
    window.addEventListener('resize', () => {
      this.equalizeCardHeights();
    });
  }

  // 使卡片高度一致的方法
  equalizeCardHeights(): void {
    setTimeout(() => {
      // 获取所有需要对齐高度的区域
      this.equalizeHeight('.wiki-section');
      this.equalizeHeight('.wiki-left-column .wiki-section');
      this.equalizeHeight('.wiki-right-column .wiki-section');
    }, 100);
  }

  // 使特定选择器下的元素高度相同
  equalizeHeight(selector: string): void {
    const elements = document.querySelectorAll(selector);
    if (elements.length <= 1) return;

    // 重置高度以获取自然高度
    elements.forEach(el => {
      (el as HTMLElement).style.height = 'auto';
    });

    // 找出最大高度
    let maxHeight = 0;
    elements.forEach(el => {
      const height = (el as HTMLElement).offsetHeight;
      if (height > maxHeight) {
        maxHeight = height;
      }
    });

    // 应用最大高度给所有元素
    elements.forEach(el => {
      (el as HTMLElement).style.height = `${maxHeight}px`;
    });
  }

  search(term: string): void {
    console.log('Searching for:', term);
    // 实现搜索功能
  }
}
