import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseComponent } from './course.component';
import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
    declarations: [CourseComponent],
    imports: [
        CommonModule,
        FormsModule,
        NgxPaginationModule,
        RouterModule.forChild([
            {
                path: '',
                component: CourseComponent,
            },
        ]),
    ],
    exports: [CourseComponent]
})
export class CourseModule { }
