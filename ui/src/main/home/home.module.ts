import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { RouterModule } from '@angular/router';
import { XDrawerModule } from '@ng-nest/ui/drawer';
import { XButtonModule, XRadioModule } from '@ng-nest/ui';


@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    XDrawerModule,
    XButtonModule,
    XRadioModule,
    RouterModule.forChild([
      {
        path: '',
        component: HomeComponent,
      },
    ]),
  ],
  exports: [RouterModule],
})
export class HomeModule {}