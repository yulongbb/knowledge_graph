import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TagComponent } from './tag.component';
import { TagDetailComponent } from './tag-detail/tag-detail.component';

const routes: Routes = [
  { path: '', component: TagComponent, data: { title: 'extraction' } },
  { path: ':type', component: TagDetailComponent },
  { path: ':type/:id', component: TagDetailComponent }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TagRoutesModule {}
