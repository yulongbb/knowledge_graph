import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WikiComponent } from './wiki.component';

@NgModule({
  declarations: [
    WikiComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([
      { path: '', component: WikiComponent }
    ])
  ]
})
export class WikiModule { }
