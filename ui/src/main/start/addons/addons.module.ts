import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ShareModule } from 'src/share/share.module';
import { AddonsComponent } from './addons.component';
import { QuillModule } from 'ngx-quill';


@NgModule({
  declarations: [AddonsComponent],
  imports: [
    CommonModule,
    ShareModule,
    RouterModule.forChild([
      {
        path: '',
        component: AddonsComponent,
      },
    ]),
    QuillModule.forRoot(), // Add QuillModule
  ],
  exports: [RouterModule],
  providers: []

})
export class addonsModule {

}