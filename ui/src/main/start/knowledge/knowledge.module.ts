import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { KnowledgeNavComponent } from './components/knowledge-nav.component';
import { KnowledgeComponent } from './knowledge.component';
import { CategoryService } from './services/category.service';
import { EsService } from '../home/es.service';

const routes: Routes = [
  {
    path: '',
    component: KnowledgeComponent,
    runGuardsAndResolvers: 'paramsOrQueryParamsChange'
  }
];

@NgModule({
  declarations: [
    KnowledgeComponent,
    KnowledgeNavComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    InfiniteScrollModule,
    FontAwesomeModule
  ],
  providers: [CategoryService, EsService]
})
export class KnowledgeModule { }
