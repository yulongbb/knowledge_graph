import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PropertyComponent } from './property.component';
import { PropertyDetailComponent } from './property-detail/property-detail.component';

const routes: Routes = [
  { path: '', component: PropertyComponent, data: { title: 'extraction' } },
  { path: ':type', component: PropertyDetailComponent },
  { path: ':type/:id', component: PropertyDetailComponent }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PropertyRoutesModule {}
