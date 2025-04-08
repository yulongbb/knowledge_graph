import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExamManagementComponent } from './components/exam-management/exam-management.component';

const routes: Routes = [
  {
    path: '',
    component: ExamManagementComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExamRoutingModule { }
