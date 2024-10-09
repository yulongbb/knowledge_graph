import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QualifyComponent } from './qualify.component';
import { QualifyDetailComponent } from './qualify-detail/qualify-detail.component';

const routes: Routes = [
  { path: '', component: QualifyComponent, data: { title: 'extraction' } },
  { path: ':type', component: QualifyDetailComponent },
  { path: ':type/:id', component: QualifyDetailComponent }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QualifyRoutesModule {}
