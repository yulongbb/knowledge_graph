import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RedeemService } from './redeem.service';
import { RedeemComponent } from './redeem.component';
import { ShareModule } from 'src/share/share.module';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', component: RedeemComponent }
];

@NgModule({
  declarations: [RedeemComponent],
  imports: [CommonModule, ShareModule, RouterModule.forChild(routes)],
  providers: [RedeemService],
  exports: [RedeemComponent]
})
export class RedeemModule { }
