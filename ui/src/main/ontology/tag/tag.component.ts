import { Component, ElementRef, OnDestroy, OnInit, Query, ViewChild, signal } from '@angular/core';

@Component({
  selector: 'app-tag',
  templateUrl: './tag.component.html',
  styleUrls: ['./tag.component.scss'],

})
export class TagComponent implements OnInit, OnDestroy {
 
  ngOnInit(): void {
    }


  ngOnDestroy(): void {
    throw new Error('Method not implemented.');
  }
}