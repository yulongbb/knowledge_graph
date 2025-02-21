import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonComponent } from './person.component';
import { RouterModule } from '@angular/router';
import { ShareModule } from 'src/share/share.module';
// ...existing code...

@NgModule({
    declarations: [
        PersonComponent,
        // ...existing code...
    ],
    imports: [
        CommonModule,
        ShareModule,
        RouterModule.forChild([
            {
                path: '',
                component: PersonComponent,
            },
            {
                path: 'group/:groupName',
                component: PersonComponent,
            },
        ]),
        // ...existing code...
    ],
    exports: [
        PersonComponent,
        // ...existing code...
    ]
})
export class PersonModule { }
