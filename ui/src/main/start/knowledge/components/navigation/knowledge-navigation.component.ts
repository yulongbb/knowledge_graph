import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-knowledge-navigation',
  templateUrl: './knowledge-navigation.component.html',
  styleUrls: ['./knowledge-navigation.component.scss']
})
export class KnowledgeNavigationComponent implements OnInit {
  categories = [
    {
      name: '工具',
      links: [
        { name: '必应词典', icon: 'assets/icons/bing-dict.png', url: 'https://www.bing.com/dict' },
        { name: 'Office Plus', icon: 'assets/icons/office-plus.png', url: 'https://www.office.com' },
        { name: '微软电脑管家', icon: 'assets/icons/ms-defender.png', url: '#' },
        { name: '天气', icon: 'assets/icons/weather.png', url: '#' },
        { name: '搜索图片', icon: 'assets/icons/image-search.png', url: '#' },
        { name: '地图', icon: 'assets/icons/map.png', url: '#' },
        { name: '交通状况', icon: 'assets/icons/traffic.png', url: '#' },
        { name: '汇率换算', icon: 'assets/icons/exchange.png', url: '#' },
        { name: '理财工具', icon: 'assets/icons/finance.png', url: '#' },
        { name: '健身工具', icon: 'assets/icons/fitness.png', url: '#' }
      ]
    },
    {
      name: '视频',
      links: [
        { name: '爱奇艺', icon: 'assets/icons/iqiyi.png', url: 'https://www.iqiyi.com' },
        { name: '芒果TV', icon: 'assets/icons/mgtv.png', url: 'https://www.mgtv.com' },
        { name: '腾讯视频', icon: 'assets/icons/tencent-video.png', url: 'https://v.qq.com' },
        { name: '优酷网', icon: 'assets/icons/youku.png', url: 'https://www.youku.com' },
        { name: '哔哩哔哩', icon: 'assets/icons/bilibili.png', url: 'https://www.bilibili.com' },
        { name: '虎牙直播', icon: 'assets/icons/huya.png', url: '#' },
        { name: '斗鱼直播', icon: 'assets/icons/douyu.png', url: '#' },
        { name: '咪咕咪唧', icon: 'assets/icons/migu.png', url: '#' }
      ]
    },
    {
      name: '购物',
      links: [
        { name: '京东', icon: 'assets/icons/jd.png', url: 'https://www.jd.com' },
        { name: '天猫', icon: 'assets/icons/tmall.png', url: 'https://www.tmall.com' },
        { name: '淘宝', icon: 'assets/icons/taobao.png', url: 'https://www.taobao.com' },
        { name: '考拉海购', icon: 'assets/icons/kaola.png', url: '#' },
        { name: '唯品会', icon: 'assets/icons/vip.png', url: '#' },
        { name: '亚马逊', icon: 'assets/icons/amazon.png', url: '#' }
      ]
    },
    {
      name: '新闻',
      links: [
        { name: 'MSN中国', icon: 'assets/icons/msn.png', url: 'https://www.msn.cn' },
        { name: '新华网', icon: 'assets/icons/xinhua.png', url: 'http://www.xinhuanet.com' },
        { name: '中华网', icon: 'assets/icons/china.png', url: 'https://www.china.com' },
        { name: '腾讯新闻', icon: 'assets/icons/qq-news.png', url: 'https://news.qq.com' },
        { name: '新浪新闻', icon: 'assets/icons/sina.png', url: 'https://news.sina.com.cn' },
        { name: '人民网', icon: 'assets/icons/people.png', url: 'http://www.people.com.cn' },
        { name: 'China Daily', icon: 'assets/icons/chinadaily.png', url: '#' },
        { name: '太平洋电脑网', icon: 'assets/icons/pconline.png', url: '#' }
      ]
    },
    {
      name: '音乐',
      links: [
        { name: '音乐台播FM', icon: 'assets/icons/music-fm.png', url: '#' },
        { name: 'QQ音乐', icon: 'assets/icons/qq-music.png', url: 'https://y.qq.com' },
        { name: '网易云音乐', icon: 'assets/icons/netease-music.png', url: 'https://music.163.com' },
        { name: '酷狗音乐', icon: 'assets/icons/kugou.png', url: 'https://www.kugou.com' },
        { name: '咪咕音乐', icon: 'assets/icons/migu-music.png', url: '#' },
        { name: '豆瓣音乐', icon: 'assets/icons/douban-music.png', url: '#' }
      ]
    },
    {
      name: '邮箱',
      links: [
        { name: 'Outlook邮箱', icon: 'assets/icons/outlook.png', url: 'https://outlook.live.com' },
        { name: 'QQ邮箱', icon: 'assets/icons/qq-mail.png', url: 'https://mail.qq.com' },
        { name: '163邮箱', icon: 'assets/icons/163mail.png', url: 'https://mail.163.com' },
        { name: '新浪邮箱', icon: 'assets/icons/sina-mail.png', url: '#' },
        { name: '阿里郵箱', icon: 'assets/icons/aliyun-mail.png', url: '#' },
        { name: 'Foxmail邮箱', icon: 'assets/icons/foxmail.png', url: '#' }
      ]
    },
    {
      name: '银行',
      links: [
        { name: '工商银行', icon: 'assets/icons/icbc.png', url: 'https://www.icbc.com.cn' },
        { name: '建设银行', icon: 'assets/icons/ccb.png', url: 'http://www.ccb.com' },
        { name: '农业银行', icon: 'assets/icons/abc.png', url: 'http://www.abchina.com' },
        { name: '中国银行', icon: 'assets/icons/boc.png', url: 'https://www.boc.cn' }
      ]
    },
    {
      name: '生活',
      links: [
        { name: 'BOSS直聘', icon: 'assets/icons/boss.png', url: 'https://www.zhipin.com' },
        { name: '58同城', icon: 'assets/icons/58.png', url: 'https://www.58.com' },
        { name: '生活', icon: 'assets/icons/life.png', url: '#' },
        { name: '58招聘', icon: 'assets/icons/58job.png', url: '#' },
        { name: '大众点评', icon: 'assets/icons/dianping.png', url: '#' },
        { name: '安居客', icon: 'assets/icons/anjuke.png', url: '#' },
        { name: '智联招聘', icon: 'assets/icons/zhilian.png', url: '#' },
        { name: '链家网', icon: 'assets/icons/lianjia.png', url: '#' }
      ]
    },
    {
      name: '社区',
      links: [
        { name: '知乎', icon: 'assets/icons/zhihu.png', url: 'https://www.zhihu.com' },
        { name: '豆瓣', icon: 'assets/icons/douban.png', url: 'https://www.douban.com' },
        { name: '新浪微博', icon: 'assets/icons/weibo.png', url: 'https://weibo.com' },
        { name: '百度贴吧', icon: 'assets/icons/tieba.png', url: 'https://tieba.baidu.com' },
        { name: '知乎', icon: 'assets/icons/zhihu.png', url: 'https://www.zhihu.com' },
        { name: '百合网', icon: 'assets/icons/baihe.png', url: '#' },
        { name: '人人网', icon: 'assets/icons/renren.png', url: '#' },
        { name: '百合网', icon: 'assets/icons/baihe.png', url: '#' }
      ]
    }
  ];

  constructor() { }

  ngOnInit(): void { }

  openLink(url: string): void {
    if (url && url !== '#') {
      window.open(url, '_blank');
    }
  }
}
