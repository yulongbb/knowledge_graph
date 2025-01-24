import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-video-dialog',
  templateUrl: './video-dialog.component.html',
  styleUrls: ['./video-dialog.component.css']
})
export class VideoDialogComponent {
  constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<VideoDialogComponent>) {}

  closeDialog(): void {
    this.dialogRef.close();
  }
}