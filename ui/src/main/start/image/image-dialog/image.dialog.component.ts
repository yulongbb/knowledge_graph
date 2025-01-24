// image-dialog.component.ts
import { Component, CUSTOM_ELEMENTS_SCHEMA, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-image-dialog',
  templateUrl: './image-dialog.component.html',
  styleUrls: ['./image-dialog.component.css']
})
export class ImageDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ImageDialogComponent>
  ) {}

  // 上一张图片
  prevImage(): void {
    if (this.data.currentIndex > 0) {
      this.data.currentIndex--;
    }
  }

  // 下一张图片
  nextImage(): void {
    if (this.data.currentIndex < this.data.images.length - 1) {
      this.data.currentIndex++;
    }
  }

  // 关闭弹框
  closeDialog(): void {
    this.dialogRef.close();
  }
}