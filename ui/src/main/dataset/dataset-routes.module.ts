import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DatasetComponent } from './dataset.component';
import { DatasetDetailComponent } from './dataset-detail/dataset-detail.component';

const routes: Routes = [
  { path: '', component: DatasetComponent, data: { title: 'extraction' } },
  { path: ':type', component: DatasetDetailComponent },
  { path: ':type/:id', component: DatasetDetailComponent }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DatasetRoutesModule {}
