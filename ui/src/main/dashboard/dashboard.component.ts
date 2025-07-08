import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Query,
  TemplateRef,
  ViewChild,
  signal,
  viewChild,
} from '@angular/core';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
 
  constructor(
    
  ) {

  }

  ngOnInit(): void {
 
  }

  ngOnDestroy(): void { }
}
