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
import { ShareModule } from 'src/share/share.module';
import { KnowledgeDefaultComponent } from './components/default/knowledge-default.component';

const routes: Routes = [
  {
    path: '',
    component: KnowledgeComponent,
    children: [
      {
        path: '',
        redirectTo: 'discover',
        pathMatch: 'full'
      },
      {
        path: 'discover',
        component: KnowledgeDefaultComponent
      },
      {
        path: 'following',
        component: KnowledgeDefaultComponent
      },
      {
        path: 'news',
        component: KnowledgeNewsComponent
      },
      {
        path: 'sports',
        component: KnowledgeSportsComponent
      },
      {
        path: 'games',
        component: KnowledgeGamesComponent
      },
      {
        path: 'ai-tools',
        component: KnowledgeAiToolsComponent
      },
      {
        path: 'navigation',
        component: KnowledgeNavigationComponent
      },
      {
        path: 'finance',
        component: KnowledgeFinanceComponent
      },
      {
        path: 'weather',
        component: KnowledgeWeatherComponent
      },
      {
        path: 'calendar',
        component: KnowledgeCalendarComponent
      },
      {
        path: ':category',
        component: KnowledgeDefaultComponent
      },
      {
        path: ':category/:subcategory',
        component: KnowledgeDefaultComponent
      },
      {
        path: ':category/:subcategory/:subsubcategory',
        component: KnowledgeDefaultComponent
      }
    ]
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
    KnowledgeGamesComponent,
    KnowledgeDefaultComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    InfiniteScrollModule,
    FontAwesomeModule,
    ShareModule
  ],
  providers: [CategoryService, EsService]
})
export class KnowledgeModule { }
