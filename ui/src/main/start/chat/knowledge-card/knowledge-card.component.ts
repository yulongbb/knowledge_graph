import { Component, Input, OnChanges } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'knowledge-card',
  templateUrl: './knowledge-card.component.html',
  styleUrls: ['./knowledge-card.component.scss']
})
export class KnowledgeCardComponent implements OnChanges {
  @Input() results: any[] = [];
  @Input() keyword: string = '';
  isCollapsed: boolean = false;
  isLoading: boolean = true;

  constructor(private router: Router) {}

  ngOnChanges() {
    this.isLoading = false;
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  navigateToDetail(result: any) {
    this.router.navigate(['/start/search/info', result["_id"]]);
  }
}
