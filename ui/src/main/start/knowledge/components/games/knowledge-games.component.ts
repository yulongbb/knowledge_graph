import { Component, OnInit } from '@angular/core';

interface Game {
  id: number;
  name: string;
  description: string;
  thumbnail: string;
  type: string;
  rating: number;
  players: number;
  trending?: boolean;
  isNew?: boolean;
  category: string;
}

interface GameCategory {
  id: string;
  name: string;
}

interface TopGame {
  rank: number;
  name: string;
  genre: string;
  change: 'up' | 'down' | 'same';
}

@Component({
  selector: 'app-knowledge-games',
  templateUrl: './knowledge-games.component.html',
  styleUrls: ['./knowledge-games.component.scss']
})
export class KnowledgeGamesComponent implements OnInit {
  activeTab: string = 'popular';
  selectedCategory: string = 'all';
  searchQuery: string = '';

  gameCategories: GameCategory[] = [
    { id: 'all', name: '全部' },
    { id: 'action', name: '动作' },
    { id: 'rpg', name: 'RPG' },
    { id: 'strategy', name: '策略' },
    { id: 'puzzle', name: '益智' },
    { id: 'racing', name: '竞速' },
    { id: 'sports', name: '体育' }
  ];

  games: Game[] = [
    {
      id: 1,
      name: '原神',
      description: '开放世界冒险游戏，探索奇幻的提瓦特大陆',
      thumbnail: 'assets/games/genshin.jpg',
      type: 'RPG',
      rating: 4.8,
      players: 50000000,
      trending: true,
      isNew: false,
      category: 'rpg'
    },
    {
      id: 2,
      name: '英雄联盟',
      description: '全球最受欢迎的MOBA游戏',
      thumbnail: 'assets/games/lol.jpg',
      type: 'MOBA',
      rating: 4.6,
      players: 150000000,
      trending: true,
      isNew: false,
      category: 'action'
    },
    {
      id: 3,
      name: '崩坏：星穹铁道',
      description: '回合制策略RPG，银河冒险之旅',
      thumbnail: 'assets/games/starrail.jpg',
      type: 'RPG',
      rating: 4.7,
      players: 30000000,
      trending: false,
      isNew: true,
      category: 'rpg'
    },
    {
      id: 4,
      name: '王者荣耀',
      description: '5V5公平竞技手游',
      thumbnail: 'assets/games/honor-of-kings.jpg',
      type: 'MOBA',
      rating: 4.5,
      players: 100000000,
      trending: true,
      isNew: false,
      category: 'action'
    },
    {
      id: 5,
      name: '我的世界',
      description: '创造性沙盒游戏，建造你的世界',
      thumbnail: 'assets/games/minecraft.jpg',
      type: '沙盒',
      rating: 4.9,
      players: 200000000,
      trending: false,
      isNew: false,
      category: 'puzzle'
    },
    {
      id: 6,
      name: '2048',
      description: '经典数字拼图游戏',
      thumbnail: 'assets/games/2048.jpg',
      type: '益智',
      rating: 4.3,
      players: 5000000,
      trending: false,
      isNew: false,
      category: 'puzzle'
    }
  ];

  topGames: TopGame[] = [
    { rank: 1, name: '英雄联盟', genre: 'MOBA', change: 'same' },
    { rank: 2, name: '原神', genre: 'RPG', change: 'up' },
    { rank: 3, name: '王者荣耀', genre: 'MOBA', change: 'down' },
    { rank: 4, name: '我的世界', genre: '沙盒', change: 'up' },
    { rank: 5, name: '星穹铁道', genre: 'RPG', change: 'same' }
  ];

  constructor() { }

  ngOnInit(): void { }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  selectCategory(categoryId: string): void {
    this.selectedCategory = categoryId;
  }

  getFilteredGames(): Game[] {
    let filteredGames = [...this.games];

    // 根据活动标签过滤
    switch (this.activeTab) {
      case 'popular':
        filteredGames = filteredGames.filter(game => game.trending);
        break;
      case 'new':
        filteredGames = filteredGames.filter(game => game.isNew);
        break;
      case 'categories':
        if (this.selectedCategory !== 'all') {
          filteredGames = filteredGames.filter(game => game.category === this.selectedCategory);
        }
        break;
    }

    // 根据搜索查询过滤
    if (this.searchQuery) {
      filteredGames = filteredGames.filter(game =>
        game.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        game.description.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    return filteredGames;
  }

  formatPlayerCount(count: number): string {
    if (count >= 100000000) {
      return (count / 100000000).toFixed(1) + '亿';
    } else if (count >= 10000) {
      return (count / 10000).toFixed(1) + '万';
    } else {
      return count.toString();
    }
  }

  getTrendIcon(change: string): string {
    switch (change) {
      case 'up':
        return 'fa-arrow-up';
      case 'down':
        return 'fa-arrow-down';
      case 'same':
        return 'fa-minus';
      default:
        return 'fa-minus';
    }
  }

  getTrendClass(change: string): string {
    switch (change) {
      case 'up':
        return 'trend-up';
      case 'down':
        return 'trend-down';
      case 'same':
        return 'trend-same';
      default:
        return 'trend-same';
    }
  }
}
