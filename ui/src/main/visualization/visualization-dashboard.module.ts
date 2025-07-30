import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgxEchartsModule } from 'ngx-echarts';

import { VisualizationDashboardComponent } from './visualization-dashboard.component';
import { ChartPaletteComponent } from './components/chart-palette/chart-palette.component';
import { MaterialPaletteComponent } from './components/material-palette/material-palette.component';
import { ResourcePaletteComponent } from './components/resource-palette/resource-palette.component';
import { TemplatePaletteComponent } from './components/template-palette/template-palette.component';
import { DataSourcePanelComponent } from './components/data-source-panel/data-source-panel.component';
import { StylePanelComponent } from './components/style-panel/style-panel.component';
import { VisualizationDashboardRoutingModule } from './visualization-dashboard-routing.module';

@NgModule({
  declarations: [
    VisualizationDashboardComponent,
    ChartPaletteComponent,
    MaterialPaletteComponent,
    ResourcePaletteComponent,
    TemplatePaletteComponent,
    DataSourcePanelComponent,
    StylePanelComponent
  ],
  imports: [
    VisualizationDashboardRoutingModule,
    CommonModule,
    FormsModule,
    DragDropModule,
    NgxEchartsModule.forRoot({ echarts: () => import('echarts') })
  ],
  exports: [
    VisualizationDashboardComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class VisualizationDashboardModule {}
