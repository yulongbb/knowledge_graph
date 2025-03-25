import { Component, OnInit } from '@angular/core';
import { RedeemService } from './redeem.service';

@Component({
  selector: 'app-redeem',
  templateUrl: './redeem.component.html',
  styleUrls: ['./redeem.component.css']
})
export class RedeemComponent implements OnInit {
  points!: number;
  keywords!: string[];

  constructor(private RedeemService: RedeemService) { }

  ngOnInit(): void {
    this.points = this.RedeemService.getPoints();
    this.keywords = this.RedeemService.generateKeywords();
  }

  search(keyword: string): void {
    window.open(`https://cn.bing.com/search?q=${keyword}&qs=n&form=QBRE&sp=-1&lq=0&pq=type&sc=12-4&sk=&cvid=FB77F784F8B1480183735C0AA26BA0C3&ghsh=0&ghacc=0&ghpl=`, '_blank');
  }
}
