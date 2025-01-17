import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ShareModule } from 'src/share/share.module';
import { AddonsComponent } from './addons.component';



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
  ],
  exports: [RouterModule],
  providers: []

})
export class addonsModule {

}