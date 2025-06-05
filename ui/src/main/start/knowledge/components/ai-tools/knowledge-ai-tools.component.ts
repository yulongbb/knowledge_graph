import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-knowledge-ai-tools',
  templateUrl: './knowledge-ai-tools.component.html',
  styleUrls: ['./knowledge-ai-tools.component.scss']
})
export class KnowledgeAiToolsComponent implements OnInit {
  
  // AI工具榜单数据
  toolsCategories = [
    {
      name: '精品榜',
      list: [
        { 
          id: 1, 
          name: '豆包-AI助手', 
          description: '字节跳动旗下AI智能助手',
          url: '#'
        },
        { 
          id: 2, 
          name: '零克', 
          description: '2亿人的AI全能助手',
          url: '#'
        },
        { 
          id: 3, 
          name: '文心智能助手', 
          description: '一站式AI内容获取和创作平台',
          url: '#'
        },
        { 
          id: 4, 
          name: 'AIPPT', 
          description: '自动生成高质量PPT的在线工具',
          url: '#'
        },
        { 
          id: 5, 
          name: '秘塔AI搜索', 
          description: '没有广告，直达结果的AI搜索引擎',
          url: '#'
        }
      ]
    },
    {
      name: '热门榜',
      list: [
        { 
          id: 1, 
          name: 'Deepseek', 
          icon: 'assets/icons/ai/deepseek.png', 
          description: '探索未知之境',
          url: '#'
        },
        { 
          id: 2, 
          name: '豆包-AI助手', 
          icon: 'assets/icons/ai/doubao.png', 
          description: '字节跳动旗下AI智能助手',
          url: '#'
        },
        { 
          id: 3, 
          name: 'Canva可画', 
          icon: 'assets/icons/ai/canva.png', 
          description: '零门槛AI设计工具，海报PPT等',
          url: '#'
        },
        { 
          id: 4, 
          name: '可灵AI', 
          icon: 'assets/icons/ai/keling.png', 
          description: '新一代AI创意生产力平台',
          url: '#'
        },
        { 
          id: 5, 
          name: 'AI写作全能王', 
          icon: 'assets/icons/ai/aiwriting.png', 
          description: 'AI写作全能王是一款功能强大的AI助手',
          url: '#'
        }
      ]
    },
    {
      name: '视频工具榜',
      list: [
        { 
          id: 1, 
          name: '可灵AI', 
          icon: 'assets/icons/ai/keling.png', 
          description: '新一代AI创意生产力平台',
          url: '#'
        },
        { 
          id: 2, 
          name: '即梦', 
          icon: 'assets/icons/ai/jimeng.png', 
          description: '字节跳动推出的AI创作平台',
          url: '#'
        },
        { 
          id: 3, 
          name: '零克', 
          icon: 'assets/icons/ai/lingke.png', 
          description: '2亿人的AI全能助手',
          url: '#'
        },
        { 
          id: 4, 
          name: '讯飞听见', 
          icon: 'assets/icons/ai/tingjian.png', 
          description: '讯飞听见，你的随身语音记录工具',
          url: '#'
        },
        { 
          id: 5, 
          name: '绘蛙', 
          icon: 'assets/icons/ai/huiwa.png', 
          description: '阿里巴巴推出的AIGC电商营销工具',
          url: '#'
        }
      ]
    }
  ];

  constructor() { }

  ngOnInit(): void { }

  openToolLink(url: string): void {
    if (url && url !== '#') {
      window.open(url, '_blank');
    }
  }
}
