import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-video-dialog',
  templateUrl: './video-dialog.component.html',
  styleUrls: ['./video-dialog.component.css']
})
export class VideoDialogComponent {
  ip = environment.ip;
  constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<VideoDialogComponent>) {}

  closeDialog(): void {
    this.dialogRef.close();
  }
}