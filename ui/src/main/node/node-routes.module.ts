import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NodeComponent } from './node.component';
import { NodeDetailComponent } from './node-detail/node-detail.component';

const routes: Routes = [
  { path: '', component: NodeComponent },
  { path: ':type', component: NodeDetailComponent },
  { path: ':type/:id', component: NodeDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FusionRoutesModule {}
