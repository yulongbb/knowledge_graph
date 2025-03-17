import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseComponent } from './course.component';
import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { PathStylesDemoComponent } from './path-styles-demo.component';
import { SafePipe } from 'src/pipes/safe.pipe';
import { QuizComponent } from './quiz.component';
import { AllPathComponent } from './all-path.component';
import { CourseDetailComponent } from './course-detail/course-detail.component';
import { CourseMapComponent } from './course-map/course-map.component';
import { LearningPathComponent } from './course-learning/app-learning-path.component';

@NgModule({
    declarations: [
        CourseComponent,
        CourseDetailComponent,
        PathStylesDemoComponent,
        LearningPathComponent,
        QuizComponent,
        SafePipe,
        AllPathComponent,
        CourseMapComponent
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
    exports: [
        CourseComponent,
        CourseDetailComponent,
        CourseMapComponent,
        LearningPathComponent
    ]
})
export class CourseModule { }
