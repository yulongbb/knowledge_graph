import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DatasetComponent } from './dataset.component';
import { DatasetDetailComponent } from './dataset-detail/dataset-detail.component';
import { FileManagerComponent } from './file-manager.component';

const routes: Routes = [
  { path: '', component: FileManagerComponent, data: { title: 'extraction' } },
  { path: 'file-manager', component: FileManagerComponent },
  { path: ':type', component: DatasetDetailComponent },
  { path: ':type/:id', component: DatasetDetailComponent }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DatasetRoutesModule {}
