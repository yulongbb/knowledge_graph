import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NetworkComponent } from './components/network.component';
import { NetworkService } from './services/network.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { NetworkRoutingModule } from './network-routing.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTabsModule } from '@angular/material/tabs';
import { NgChartsModule } from 'ng2-charts';
import { NetworkChartComponent } from './components/network-chart/network-chart.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    NetworkComponent,
    NetworkChartComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    NetworkRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatProgressBarModule,
    MatIconModule,
    MatPaginatorModule,
    MatTabsModule,
    NgChartsModule
  ],
  providers: [
    NetworkService
  ],
  exports: [
    NetworkComponent
  ]
})
export class NetworkModule { }
