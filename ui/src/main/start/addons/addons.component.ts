import { Component } from '@angular/core';

interface Extension {
  name: string;
  rating: number;
  description: string;
  reviews: number;
  category: string;
  image: string; // 新增图片字段
}

@Component({
  selector: 'app-addons',
  templateUrl: './addons.component.html',
  styleUrls: ['./addons.component.scss']
})
export class AddonsComponent {
  categories: string[] = [
    '博客', '通讯', '开发人员工具', '娱乐', '新闻和天气', '照片', '高效工作', '搜索工具', '购物', '社交', '体育'
  ];

  // 最热应用列表
  hotExtensions: Extension[] = [
    { name: 'Global Speed: 视频速度控制', rating: 5, description: '设置视频和音频的默认速度。', reviews: 96, category: '高效工作', image: 'https://avatars.githubusercontent.com/u/17495916?s=100&v=4' },
    { name: '闪避式翻译：网易翻译插件', rating: 5, description: 'PDF翻译 | ...', reviews: 36, category: '高效工作', image: 'https://avatars.githubusercontent.com/u/17495916?s=100&v=4' },
    { name: '轻松读', rating: 5, description: '', reviews: 4, category: '高效工作', image: 'https://avatars.githubusercontent.com/u/17495916?s=100&v=4' },
    { name: 'ChatGPT免费版', rating: 5, description: 'GPT-4(即时重选)', reviews: 9, category: '开发人员工具', image: 'https://avatars.githubusercontent.com/u/17495916?s=100&v=4' },
    { name: '极酷Lab 快活版', rating: 5, description: '(CnixGPT免费版)', reviews: 1, category: '开发人员工具', image: 'https://avatars.githubusercontent.com/u/17495916?s=100&v=4' },
    { name: 'AdGuard广告挂载版', rating: 5, description: '', reviews: 6, category: '高效工作', image: 'https://avatars.githubusercontent.com/u/17495916?s=100&v=4' }
  ];

  // 最新应用列表
  latestExtensions: Extension[] = [
    { name: 'Magic VPN - 最好的免费代理工具', rating: 5, description: '', reviews: 8, category: '高效工作', image: 'https://avatars.githubusercontent.com/u/17495916?s=100&v=4' },
    { name: 'The Elder Scrolls V: Skyrim 10th Anniversary', rating: 5, description: 'Personalize Microsoft Edge with a new browser theme inspired by The Elder Scrolls V: Skyrim Anniversary Edition...', reviews: 25, category: '娱乐', image: 'https://avatars.githubusercontent.com/u/17495916?s=100&v=4' },
    { name: 'BattleTabs', rating: 5, description: 'Multiplayer Battles in your New Tab', reviews: 76, category: '娱乐', image: 'https://avatars.githubusercontent.com/u/17495916?s=100&v=4' },
    { name: 'YouTube NonStop', rating: 5, description: 'Kiss the annoying “Video paused. Continue watching?” confirmation goodbye!', reviews: 23, category: '娱乐', image: 'https://avatars.githubusercontent.com/u/17495916?s=100&v=4' }
  ];

  selectCategory(category: string) {
    // 筛选逻辑（根据需求实现）
  }
}