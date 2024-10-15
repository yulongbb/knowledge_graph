import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApplicationComponent } from './application.component';
import { ApplicationDetailComponent } from './application-detail/application-detail.component';

const routes: Routes = [
  { path: '', component: ApplicationComponent, data: { title: 'extraction' } },
  { path: ':type', component: ApplicationDetailComponent },
  { path: ':type/:id', component: ApplicationDetailComponent }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApplicationRoutesModule {}
