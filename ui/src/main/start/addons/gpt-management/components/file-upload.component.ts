import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-file-upload',
  template: `
    <div class="file-upload">
      <input
        type="file"
        #fileInput
        [accept]="accept"
        (change)="onFileSelected($event)"
        style="display: none"
      >
      <div class="upload-area" (click)="fileInput.click()" [class.has-file]="previewUrl">
        <ng-container *ngIf="!previewUrl">
          <mat-icon>cloud_upload</mat-icon>
          <span>点击上传logo</span>
        </ng-container>
        <img *ngIf="previewUrl" [src]="previewUrl" alt="Logo预览">
      </div>
    </div>
  `,
  styles: [`
    .file-upload {
      width: 100%;
    }
    .upload-area {
      border: 2px dashed #ccc;
      border-radius: 4px;
      padding: 20px;
      text-align: center;
      cursor: pointer;
      transition: border-color 0.3s;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    .upload-area:hover {
      border-color: #2196f3;
    }
    .upload-area.has-file {
      border-style: solid;
    }
    .upload-area img {
      max-width: 100%;
      max-height: 200px;
      object-fit: contain;
    }
  `]
})
export class FileUploadComponent {
  @Input() accept = 'image/*';
  @Input() previewUrl: string | null = null;
  @Output() fileSelected = new EventEmitter<File>();

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.fileSelected.emit(file);
      // 创建预览URL
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
}
