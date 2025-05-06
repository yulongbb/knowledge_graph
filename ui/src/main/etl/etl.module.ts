import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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
import { CreateProjectDialogComponent } from './components/create-project-dialog.component';
import { NgNestModule } from 'src/share/ng-nest.module';

@NgModule({
  declarations: [
    EtlGraphComponent,
    EtlToolboxComponent,
    EtlToolbarComponent,
    NodeConfigPanelComponent,
    DataPreviewComponent,
    ProjectListComponent,
    CreateProjectDialogComponent
  ],
  imports: [
    CommonModule,
    ShareModule,
    NgNestModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forChild([
      {
        path: '',
        component: ProjectListComponent,
      }
    ]),
    EtlRoutingModule,
  ],
  exports: [
    EtlGraphComponent,
    EtlToolboxComponent,
    NodeConfigPanelComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // Add schema to handle custom elements
})
export class EtlModule { }
