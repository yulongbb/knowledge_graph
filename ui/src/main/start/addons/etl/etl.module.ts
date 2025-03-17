import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { EtlGraphComponent } from './components/etl-graph.component';
import { EtlToolboxComponent } from './components/etl-toolbox.component';
import { EtlToolbarComponent } from './components/etl-toolbar.component';
import { NodeConfigPanelComponent } from './components/node-config-panel.component';
import { RouterModule } from '@angular/router';
import { ShareModule } from 'src/share/share.module';
import { DataPreviewComponent } from './components/data-preview.component';
import { EtlRoutingModule } from './etl-routing.module';
import { ProjectListComponent } from './components/project-list.component';

@NgModule({
  declarations: [
    EtlGraphComponent,
    EtlToolboxComponent,
    EtlToolbarComponent,
    NodeConfigPanelComponent,
    DataPreviewComponent,
    ProjectListComponent
  ],
  imports: [
    CommonModule,
    ShareModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forChild([
      {
        path: '',
        component: EtlGraphComponent,
      }
    ]),
    EtlRoutingModule
  ],
  exports: [
    EtlGraphComponent,
    EtlToolboxComponent,
    NodeConfigPanelComponent
  ]
})
export class EtlModule { }
