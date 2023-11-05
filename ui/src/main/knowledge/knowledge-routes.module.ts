import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { KnowledgeComponent } from './knowledge.component';
import { KnowledgeDetailComponent } from './knowledge-detail/knowledge-detail.component';

const routes: Routes = [
  { path: '', component: KnowledgeComponent, data: { title: 'extraction' } },
  { path: ':type', component: KnowledgeDetailComponent },
  { path: ':type/:id', component: KnowledgeDetailComponent }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class KnowledgeRoutesModule {}
