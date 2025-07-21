import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApiAccessComponent } from './api-access.component';

const routes: Routes = [
  { path: '', component: ApiAccessComponent, data: { title: '数据接口接入' } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApiRoutesModule {}
