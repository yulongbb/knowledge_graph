import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VisualizationDashboardComponent } from './visualization-dashboard.component';

const routes: Routes = [
  { path: '', component: VisualizationDashboardComponent },
  { path: ':id', component: VisualizationDashboardComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VisualizationDashboardRoutingModule {}
