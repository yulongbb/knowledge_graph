import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Material Modules
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

import { GptManagementListComponent } from './components/gpt-management-list.component';
import { GptModelFormDialogComponent } from './components/gpt-model-form-dialog.component';
import { ConfirmDialogComponent } from './components/confirm-dialog.component';
import { FileUploadComponent } from './components/file-upload.component';

@NgModule({
  declarations: [
    GptManagementListComponent,
    GptModelFormDialogComponent,
    ConfirmDialogComponent,
    FileUploadComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    // Material Modules
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatSnackBarModule,
    MatIconModule,
    MatChipsModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatDividerModule,
    // Routing
    RouterModule.forChild([
      { path: '', component: GptManagementListComponent }
    ])
  ]
})
export class GptManagementModule { }
