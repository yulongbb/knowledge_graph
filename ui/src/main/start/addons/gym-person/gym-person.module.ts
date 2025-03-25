import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { GymPersonComponent } from './gym-person.component';
import { VirtualCharacterComponent } from './virtual-character/virtual-character.component';

@NgModule({
  declarations: [
    GymPersonComponent,
    VirtualCharacterComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    RouterModule.forChild([
      { path: '', component: GymPersonComponent }
    ])
  ]
})
export class GymPersonModule { }
