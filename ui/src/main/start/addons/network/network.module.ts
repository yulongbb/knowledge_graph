import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NetworkComponent } from './components/network.component';
import { NetworkService } from './services/network.service';
import { NgxEchartsModule } from 'ngx-echarts';
import { NetworkChartComponent } from './components/network-chart/network-chart.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    NetworkComponent,
    NetworkChartComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: NetworkComponent,
      },
    ]),
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    })
  ],
  providers: [
    NetworkService
  ],
  exports: [
    NetworkComponent
  ]
})
export class NetworkModule { }
