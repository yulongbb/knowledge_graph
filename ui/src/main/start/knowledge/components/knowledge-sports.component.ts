import { Component, OnInit } from '@angular/core';

type MatchData = {
  league: string;
  leagueLogo: string;
  matchTime: string;
  status: string;
  team1: string;
  team1Logo: string;
  team1Score: string;
  team2: string;
  team2Logo: string;
  team2Score: string;
  highlight: boolean;
}

// Common interface for all ranking types
interface RankingData {
  rank: number;
  team: string;
  change: string;
}

interface FootballRanking extends RankingData {
  points: number;
}

interface BasketballRanking extends RankingData {
  wins: number;
  losses: number;
}

@Component({
  selector: 'app-knowledge-sports',
  templateUrl: './knowledge-sports.component.html',
  styleUrls: ['./knowledge-sports.component.scss']
})
export class KnowledgeSportsComponent implements OnInit {
  
  // 当前激活的标签页
  activeTab: 'football' | 'basketball' | 'esports' = 'football';
  
  // 比赛数据
  matches: {
    football: MatchData[];
    basketball: MatchData[];
    esports: MatchData[];
  } = {
    football: [
      {
        league: '英超',
        leagueLogo: 'assets/icons/sports/premier-league.png',
        matchTime: '今天 19:30',
        status: 'upcoming', // upcoming, live, finished
        team1: '曼联',
        team1Logo: 'assets/icons/sports/man-utd.png',
        team1Score: '-',
        team2: '利物浦',
        team2Logo: 'assets/icons/sports/liverpool.png',
        team2Score: '-',
        highlight: true
      },
      {
        league: '西甲',
        leagueLogo: 'assets/icons/sports/la-liga.png',
        matchTime: '今天 22:00',
        status: 'upcoming',
        team1: '皇马',
        team1Logo: 'assets/icons/sports/real-madrid.png',
        team1Score: '-',
        team2: '巴塞罗那',
        team2Logo: 'assets/icons/sports/barcelona.png',
        team2Score: '-',
        highlight: true
      },
      {
        league: '意甲',
        leagueLogo: 'assets/icons/sports/serie-a.png',
        matchTime: '昨天 21:45',
        status: 'finished',
        team1: '尤文图斯',
        team1Logo: 'assets/icons/sports/juventus.png',
        team1Score: '2',
        team2: '罗马',
        team2Logo: 'assets/icons/sports/roma.png',
        team2Score: '1',
        highlight: false
      }
    ],
    basketball: [
      {
        league: 'NBA',
        leagueLogo: 'assets/icons/sports/nba.png',
        matchTime: '今天 09:00',
        status: 'upcoming',
        team1: '湖人',
        team1Logo: 'assets/icons/sports/lakers.png',
        team1Score: '-',
        team2: '凯尔特人',
        team2Logo: 'assets/icons/sports/celtics.png',
        team2Score: '-',
        highlight: true
      },
      {
        league: 'CBA',
        leagueLogo: 'assets/icons/sports/cba.png',
        matchTime: '昨天 19:35',
        status: 'finished',
        team1: '广东',
        team1Logo: 'assets/icons/sports/guangdong.png',
        team1Score: '102',
        team2: '辽宁',
        team2Logo: 'assets/icons/sports/liaoning.png',
        team2Score: '98',
        highlight: false
      }
    ],
    esports: [
      {
        league: 'LPL',
        leagueLogo: 'assets/icons/sports/lpl.png',
        matchTime: '今天 17:00',
        status: 'upcoming',
        team1: 'JDG',
        team1Logo: 'assets/icons/sports/jdg.png',
        team1Score: '-',
        team2: 'EDG',
        team2Logo: 'assets/icons/sports/edg.png',
        team2Score: '-',
        highlight: true
      },
      {
        league: 'LCK',
        leagueLogo: 'assets/icons/sports/lck.png',
        matchTime: '今天 15:00',
        status: 'live',
        team1: 'T1',
        team1Logo: 'assets/icons/sports/t1.png',
        team1Score: '1',
        team2: 'GEN',
        team2Logo: 'assets/icons/sports/gen.png',
        team2Score: '1',
        highlight: true
      }
    ]
  };
  
  // 新闻数据
  news = [
    {
      id: 1,
      title: '英超揭幕战：曼联迎战利物浦，十年恩怨再度上演',
      source: '体坛周报',
      time: '2小时前',
      cover: 'assets/images/sports/football-news1.jpg',
      views: '50.2万'
    },
    {
      id: 2,
      title: '国足12强赛大名单：武磊领衔，归化球员悉数入选',
      source: '新浪体育',
      time: '4小时前',
      cover: 'assets/images/sports/football-news2.jpg',
      views: '42.8万'
    },
    {
      id: 3,
      title: 'NBA季前赛即将开始，詹姆斯:我的第21个赛季仍充满激情',
      source: '腾讯体育',
      time: '昨天',
      cover: 'assets/images/sports/basketball-news1.jpg',
      views: '38.6万'
    },
    {
      id: 4,
      title: 'S13全球总决赛：中国战队能否重夺冠军？',
      source: '电竞天下',
      time: '昨天',
      cover: 'assets/images/sports/esports-news1.jpg',
      views: '33.5万'
    }
  ];
  
  // 热门榜单
  rankings: {
    football: FootballRanking[];
    basketball: BasketballRanking[];
    esports: BasketballRanking[];
  } = {
    football: [
      { rank: 1, team: '曼城', points: 86, change: 'up' },
      { rank: 2, team: '阿森纳', points: 84, change: 'down' },
      { rank: 3, team: '利物浦', points: 78, change: 'up' },
      { rank: 4, team: '曼联', points: 72, change: 'same' },
      { rank: 5, team: '切尔西', points: 70, change: 'up' }
    ],
    basketball: [
      { rank: 1, team: '凯尔特人', wins: 58, losses: 24, change: 'up' },
      { rank: 2, team: '掘金', wins: 56, losses: 26, change: 'down' },
      { rank: 3, team: '雄鹿', wins: 55, losses: 27, change: 'same' },
      { rank: 4, team: '76人', wins: 54, losses: 28, change: 'up' },
      { rank: 5, team: '湖人', wins: 52, losses: 30, change: 'up' }
    ],
    esports: [
      { rank: 1, team: 'JDG', wins: 14, losses: 2, change: 'same' },
      { rank: 2, team: 'BLG', wins: 13, losses: 3, change: 'up' },
      { rank: 3, team: 'LNG', wins: 12, losses: 4, change: 'up' },
      { rank: 4, team: 'TES', wins: 11, losses: 5, change: 'down' },
      { rank: 5, team: 'EDG', wins: 10, losses: 6, change: 'same' }
    ]
  };

  constructor() { }

  ngOnInit(): void {
  }
  
  // 切换标签页
  changeTab(tab: 'football' | 'basketball' | 'esports'): void {
    this.activeTab = tab;
  }
  
  // Get current matches based on active tab
  getCurrentMatches(): MatchData[] {
    return this.matches[this.activeTab];
  }
  
  // Get current rankings based on active tab
  getCurrentRankings(): RankingData[] {
    return this.rankings[this.activeTab];
  }
  
  // Check if current tab is football
  isFootballTab(): boolean {
    return this.activeTab === 'football';
  }
  
  // Get points for a football ranking
  getPoints(team: RankingData): number {
    if (this.isFootballTab()) {
      return (team as FootballRanking).points;
    }
    return 0;
  }
  
  // Get win-loss record for basketball/esports ranking
  getWinLoss(team: RankingData): string {
    if (!this.isFootballTab()) {
      const basketballTeam = team as BasketballRanking;
      return `${basketballTeam.wins}-${basketballTeam.losses}`;
    }
    return '';
  }
  
  // 获取样式类
  getStatusClass(status: string): string {
    switch (status) {
      case 'live':
        return 'match-live';
      case 'finished':
        return 'match-finished';
      default:
        return '';
    }
  }
  
  // 获取状态文本
  getStatusText(status: string, time: string): string {
    switch (status) {
      case 'live':
        return '进行中';
      case 'finished':
        return '已结束';
      default:
        return time;
    }
  }
  
  // 获取变化图标
  getChangeIcon(change: string): string {
    switch (change) {
      case 'up':
        return 'fa-caret-up';
      case 'down':
        return 'fa-caret-down';
      default:
        return 'fa-minus';
    }
  }
  
  // 获取变化颜色
  getChangeClass(change: string): string {
    switch (change) {
      case 'up':
        return 'trend-up';
      case 'down':
        return 'trend-down';
      default:
        return 'trend-same';
    }
  }
}
