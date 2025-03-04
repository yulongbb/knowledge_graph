import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseComponent } from './course.component';
import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { PathStylesDemoComponent } from './path-styles-demo.component';
import { LearningPathComponent } from './app-learning-path.conponent';
import { SafePipe } from 'src/pipes/safe.pipe';
import { QuizComponent } from './quiz.component';

@NgModule({
    declarations: [
        CourseComponent,
        PathStylesDemoComponent,
        LearningPathComponent,
        QuizComponent,
        SafePipe
    ],
    imports: [
        CommonModule,
        FormsModule,
        NgxPaginationModule,
        RouterModule.forChild([
            { path: '', component: CourseComponent },
            { path: 'path-styles', component: PathStylesDemoComponent }  // 添加新路由
        ]),
    ],
    exports: [CourseComponent]
})
export class CourseModule { }
