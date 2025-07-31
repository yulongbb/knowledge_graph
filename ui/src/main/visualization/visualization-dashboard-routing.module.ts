import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VisualizationDashboardComponent } from './visualization-dashboard.component';
import { CanvasPreviewComponent } from './canvas-preview.component';

const routes: Routes = [
  { path: '', component: VisualizationDashboardComponent },
    { path: 'canvas-preview', component: CanvasPreviewComponent },

  { path: ':id', component: VisualizationDashboardComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VisualizationDashboardRoutingModule {}
