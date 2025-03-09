import { Component, Input, OnChanges, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { faChevronLeft, faChevronRight, faPencilSquare } from '@fortawesome/free-solid-svg-icons';

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
  faChevronLeft = faChevronLeft;
  faChevronRight = faChevronRight;

  @ViewChild('cardContent') cardContent: ElementRef | undefined;

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

  scrollLeft() {
    this.cardContent?.nativeElement.scrollBy({ left: -300, behavior: 'smooth' });
  }

  scrollRight() {
    this.cardContent?.nativeElement.scrollBy({ left: 300, behavior: 'smooth' });
  }
}
