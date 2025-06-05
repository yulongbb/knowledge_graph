import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { KnowledgeNavbarComponent } from './components/navbar/knowledge-navbar.component';
import { KnowledgeComponent } from './knowledge.component';
import { KnowledgeCalendarComponent } from './components/calendar/knowledge-calendar.component';
import { KnowledgeWeatherComponent } from './components/weather/knowledge-weather.component';
import { KnowledgeNewsComponent } from './components/news/knowledge-news.component';
import { KnowledgeFinanceComponent } from './components/finance/knowledge-finance.component';
import { KnowledgeNavigationComponent } from './components/navigation/knowledge-navigation.component';
import { KnowledgeAiToolsComponent } from './components/ai-tools/knowledge-ai-tools.component';
import { KnowledgeSportsComponent } from './components/sports/knowledge-sports.component';
import { KnowledgeGamesComponent } from './components/games/knowledge-games.component';
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
    KnowledgeNavbarComponent,
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
