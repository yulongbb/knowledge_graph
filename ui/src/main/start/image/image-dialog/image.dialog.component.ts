// image-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-image-dialog',
  template: `
    <div class="image-preview-container">
      <button class="close-btn" (click)="close()">×</button>
      <button *ngIf="currentIndex > 0" 
              class="nav-btn prev" 
              (click)="prevImage()">‹</button>
      
      <div class="image-content">
        <img [src]="currentImage.url" 
             [alt]="currentImage.title"
             (click)="$event.stopPropagation()">
        <div class="image-title" *ngIf="currentImage.title">
          {{currentImage.title}}
        </div>
      </div>

      <button *ngIf="currentIndex < images.length - 1" 
              class="nav-btn next" 
              (click)="nextImage()">›</button>
    </div>
  `,
  styles: [`
    .image-preview-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close-btn {
      position: absolute;
      top: 20px;
      right: 20px;
      background: none;
      border: none;
      color: white;
      font-size: 30px;
      cursor: pointer;
      z-index: 1000;
    }

    .nav-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(0, 0, 0, 0.5);
      border: none;
      color: white;
      font-size: 24px;
      padding: 20px 15px;
      cursor: pointer;
    }

    .prev { left: 20px; }
    .next { right: 20px; }

    .image-content {
      max-width: 90%;
      max-height: 90%;
      position: relative;
    }

    img {
      max-width: 100%;
      max-height: 90vh;
      object-fit: contain;
    }

    .image-title {
      position: absolute;
      bottom: -40px;
      left: 0;
      width: 100%;
      text-align: center;
      color: white;
      padding: 10px;
    }
  `]
})
export class ImageDialogComponent {
  images: any[];
  currentIndex: number;

  constructor(
    public dialogRef: MatDialogRef<ImageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.images = data.images;
    this.currentIndex = data.currentIndex;
  }

  get currentImage() {
    return this.images[this.currentIndex];
  }

  prevImage() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  nextImage() {
    if (this.currentIndex < this.images.length - 1) {
      this.currentIndex++;
    }
  }

  close() {
    this.dialogRef.close();
  }
}