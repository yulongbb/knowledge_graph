import { Component, OnInit } from '@angular/core';

interface Game {
  id: number;
  name: string;
  type: string;
  thumbnail: string;
  rating: number;
  players: number;
  description: string;
  trending?: boolean;
  isNew?: boolean;
}

@Component({
  selector: 'app-knowledge-games',
  templateUrl: './knowledge-games.component.html',
  styleUrls: ['./knowledge-games.component.scss']
})
export class KnowledgeGamesComponent implements OnInit {
  activeTab: 'popular' | 'new' | 'categories' = 'popular';
  searchQuery: string = '';
  
  games: Game[] = [
    {
      id: 1,
      name: '王者荣耀',
      type: 'MOBA',
      thumbnail: 'assets/images/games/honor-of-kings.jpg',
      rating: 4.7,
      players: 19800000,
      description: '王者荣耀是一款5v5团队公平竞技的MOBA手游，拥有超过200个英雄角色',
      trending: true
    },
    {
      id: 2,
      name: '和平精英',
      type: '射击生存',
      thumbnail: 'assets/images/games/game-for-peace.jpg',
      rating: 4.6,
      players: 15600000,
      description: '和平精英是一款战术竞技类手游，游戏中100名玩家将落地求生'
    },
    {
      id: 3,
      name: '原神',
      type: '开放世界',
      thumbnail: 'assets/images/games/genshin-impact.jpg',
      rating: 4.8,
      players: 12400000,
      description: '原神是一款开放世界冒险RPG游戏，玩家将在提瓦特大陆自由探索',
      trending: true
    },
    {
      id: 4,
      name: '英雄联盟',
      type: 'MOBA',
      thumbnail: 'assets/images/games/lol.jpg',
      rating: 4.5,
      players: 9800000,
      description: '英雄联盟是一款5v5多人在线战术竞技游戏，拥有丰富的英雄角色'
    },
    {
      id: 5,
      name: '我的世界',
      type: '沙盒',
      thumbnail: 'assets/images/games/minecraft.jpg',
      rating: 4.9,
      players: 8700000,
      description: '我的世界是一款沙盒建造游戏，玩家可以在方块世界自由创造'
    },
    {
      id: 6,
      name: '绝地求生',
      type: '射击生存',
      thumbnail: 'assets/images/games/pubg.jpg',
      rating: 4.3,
      players: 7500000,
      description: '绝地求生是一款战术射击类游戏，最终只有一人或一队能够获胜'
    },
    {
      id: 7,
      name: '阴阳师',
      type: '回合制',
      thumbnail: 'assets/images/games/onmyoji.jpg',
      rating: 4.4,
      players: 6200000,
      description: '阴阳师是一款回合制策略游戏，玩家将收集式神并进行战斗'
    },
    {
      id: 8,
      name: '梦幻西游',
      type: 'MMORPG',
      thumbnail: 'assets/images/games/mhxy.jpg',
      rating: 4.2,
      players: 5900000,
      description: '梦幻西游是一款回合制MMORPG游戏，以西游记为背景，拥有丰富的玩法'
    },
    {
      id: 9,
      name: '崩坏：星穹铁道',
      type: '回合制',
      thumbnail: 'assets/images/games/honkai-star-rail.jpg',
      rating: 4.8,
      players: 9200000,
      description: '崩坏：星穹铁道是一款太空幻想题材的回合制角色扮演游戏',
      trending: true,
      isNew: true
    },
    {
      id: 10,
      name: '第五人格',
      type: '非对称竞技',
      thumbnail: 'assets/images/games/identity-v.jpg',
      rating: 4.5,
      players: 4800000,
      description: '第五人格是一款1v4非对称对抗竞技游戏，玩家扮演监管者或求生者'
    }
  ];
  
  gameCategories = [
    { id: 'all', name: '全部' },
    { id: 'moba', name: 'MOBA' },
    { id: 'fps', name: '射击' },
    { id: 'rpg', name: '角色扮演' },
    { id: 'sandbox', name: '沙盒' },
    { id: 'card', name: '卡牌' },
    { id: 'strategy', name: '策略' },
    { id: 'mmorpg', name: 'MMORPG' },
    { id: 'casual', name: '休闲' },
    { id: 'puzzle', name: '解谜' }
  ];
  
  selectedCategory: string = 'all';
  
  // 游戏推荐榜单
  topGames = [
    { rank: 1, name: '原神', genre: '开放世界RPG', change: 'up' },
    { rank: 2, name: '王者荣耀', genre: 'MOBA', change: 'same' },
    { rank: 3, name: '崩坏：星穹铁道', genre: '回合制RPG', change: 'up' },
    { rank: 4, name: '和平精英', genre: '射击生存', change: 'down' },
    { rank: 5, name: '英雄联盟', genre: 'MOBA', change: 'down' }
  ];
  
  constructor() { }

  ngOnInit(): void {
  }

  setActiveTab(tab: 'popular' | 'new' | 'categories'): void {
    this.activeTab = tab;
  }
  
  getFilteredGames(): Game[] {
    let filtered = [...this.games];
    
    // Filter by search query
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(game => 
        game.name.toLowerCase().includes(query) || 
        game.type.toLowerCase().includes(query) ||
        game.description.toLowerCase().includes(query)
      );
    }
    
    // Filter by category
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(game => 
        game.type.toLowerCase().includes(this.selectedCategory.toLowerCase())
      );
    }
    
    // Filter by tab
    if (this.activeTab === 'new') {
      filtered = filtered.filter(game => game.isNew);
    } else if (this.activeTab === 'popular') {
      // Sort by players count for popular tab
      return filtered.sort((a, b) => b.players - a.players);
    }
    
    return filtered;
  }
  
  selectCategory(category: string): void {
    this.selectedCategory = category;
  }
  
  formatPlayerCount(count: number): string {
    if (count >= 10000000) {
      return (count / 10000000).toFixed(1) + '千万';
    } else if (count >= 10000) {
      return (count / 10000).toFixed(1) + '万';
    }
    return count.toString();
  }
  
  getTrendIcon(change: string): string {
    switch (change) {
      case 'up': return 'fa-arrow-up';
      case 'down': return 'fa-arrow-down';
      default: return 'fa-minus';
    }
  }
  
  getTrendClass(change: string): string {
    switch (change) {
      case 'up': return 'trend-up';
      case 'down': return 'trend-down';
      default: return 'trend-same';
    }
  }
}
