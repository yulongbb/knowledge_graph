import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FusionComponent } from './fusion.component';

const routes: Routes = [
  { path: '', component: FusionComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FusionRoutesModule {}
