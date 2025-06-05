import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { KnowledgeNavComponent } from './components/knowledge-nav.component';
import { KnowledgeComponent } from './knowledge.component';
import { KnowledgeCalendarComponent } from './components/knowledge-calendar.component';
import { KnowledgeWeatherComponent } from './components/knowledge-weather.component';
import { KnowledgeNewsComponent } from './components/knowledge-news.component';
import { KnowledgeFinanceComponent } from './components/knowledge-finance.component';
import { KnowledgeNavigationComponent } from './components/knowledge-navigation.component';
import { KnowledgeAiToolsComponent } from './components/knowledge-ai-tools.component';
import { KnowledgeSportsComponent } from './components/knowledge-sports.component';
import { KnowledgeGamesComponent } from './components/knowledge-games.component';
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
    KnowledgeNavComponent,
    KnowledgeCalendarComponent,
    KnowledgeWeatherComponent,
    KnowledgeNewsComponent,
    KnowledgeFinanceComponent,
    KnowledgeNavigationComponent,
    KnowledgeAiToolsComponent,
    KnowledgeSportsComponent,
    KnowledgeGamesComponent
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
