import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DigitalPersonComponent } from './digital-person.component';
import { ShareModule } from 'src/share/share.module';
import { FormsModule } from '@angular/forms';
import { VirtualCharacterComponent } from './virtual-character/virtual-character.component';
import { DigitalPersonService } from './digital-person.service';

// Suppress FBXLoader ShininessExponent warning
console.warn = function() {};

const routes: Routes = [
  {
    path: '',
    component: DigitalPersonComponent
  }
];

@NgModule({
  declarations: [
    DigitalPersonComponent,
    VirtualCharacterComponent
  ],
  imports: [
    CommonModule,
    ShareModule,
    FormsModule,
    RouterModule.forChild(routes)
  ],
  providers: [DigitalPersonService]
})
export class DigitalPersonModule { }
