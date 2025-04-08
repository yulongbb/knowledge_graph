import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ExamManagementComponent } from './components/exam-management/exam-management.component';
import { ExamService } from './services/exam.service';
import { ExamRoutingModule } from './exam-routing.module';

@NgModule({
  declarations: [ExamManagementComponent],
  imports: [
    CommonModule,
    FormsModule,  // Ensure this is imported for [(ngModel)] to work
    ReactiveFormsModule,
    ExamRoutingModule
  ],
  providers: [ExamService],
  exports: [ExamManagementComponent]
})
export class ExamModule { }
