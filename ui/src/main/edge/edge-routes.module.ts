import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EdgeComponent } from './edge.component';
import { EdgeDetailComponent } from './edge-detail/edge-detail.component';

const routes: Routes = [
  { path: '', component: EdgeComponent },
  { path: ':type', component: EdgeDetailComponent },
  { path: ':type/:id', component: EdgeDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FusionRoutesModule {}
