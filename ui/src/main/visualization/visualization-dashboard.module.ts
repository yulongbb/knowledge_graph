import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgxEchartsModule } from 'ngx-echarts';

import { VisualizationDashboardComponent } from './visualization-dashboard.component';
import { CanvasPreviewComponent } from './canvas-preview.component';
import { VisualizationDashboardRoutingModule } from './visualization-dashboard-routing.module';

@NgModule({
  declarations: [
    VisualizationDashboardComponent,
    CanvasPreviewComponent
  ],
  imports: [
    VisualizationDashboardRoutingModule,
    CommonModule,
    FormsModule,
    DragDropModule,
    NgxEchartsModule.forRoot({ echarts: () => import('echarts') }),
  ],
  exports: [
    VisualizationDashboardComponent,
    CanvasPreviewComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class VisualizationDashboardModule {}
