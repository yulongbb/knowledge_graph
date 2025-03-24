import { Component, EventEmitter, Input, Output, ChangeDetectorRef } from '@angular/core';
import { XMessageService } from '@ng-nest/ui/message';
import { EntityService } from 'src/main/entity/entity.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-entity-add-image',
  templateUrl: './entity-add-image.component.html',
  styleUrls: ['./entity-add-image.component.scss']
})
export class EntityAddImageComponent {
  @Input() id!: string;
  @Output() saved = new EventEmitter<void>();
  @Output() canceled = new EventEmitter<void>();

  images: any[] = [];
  thumbs: any[] = [];
  imgs: any[] = [];
  title = '新增图片';
  disabled = false;
  isDragging = false;
  selectedImage: any = null;
  isUploading = false;
  uploadedFiles: any[] = [];

  constructor(
    private entityService: EntityService,
    private message: XMessageService,
    private location: Location,
    private cdr: ChangeDetectorRef
  ) { }

  onImagePaste(event: ClipboardEvent) {
    const clipboardData = event.clipboardData || (window as any).clipboardData;

    if (clipboardData) {
      const items = clipboardData.items;

      for (let i = 0; i < items.length; i++) {
        if (items[i].kind === 'file' && items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            this.uploadFile(file);
          }
        }
      }
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files) {
      Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
          this.uploadFile(file);
        }
      });
    }
  }

  uploadFile(file: File) {
    this.isUploading = true;
    const uniqueFileName = this.generateUniqueFileName(file.name);
    const formData = new FormData();
    formData.append('file', file, uniqueFileName);

    fetch('http://localhost:3000/api/minio-client/uploadFile', {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        this.uploadImage({ body: { name: data.name } });
      })
      .catch(error => {
        this.message.error('图片上传失败：' + error.message);
      })
      .finally(() => {
        this.isUploading = false;
        this.cdr.detectChanges();
      });
  }

  selectImage(image: any) {
    this.selectedImage = { ...image };
    this.cdr.detectChanges();
  }

  cancelEdit() {
    this.selectedImage = null;
  }

  uploadImage($event: any) {
    const newImage = {
      url: `http://localhost:9000/kgms/${$event.body.name}`,
      label: '',
      description: ''
    };
    this.imgs.push(newImage);
    this.uploadedFiles = [...this.uploadedFiles, newImage];
    this.selectImage(newImage);
    this.cdr.detectChanges();
  }

  action(type: string) {
    switch (type) {
      case 'save':
        if (!this.imgs.length) {
          this.message.warning('请先上传图片');
          return;
        }

        if (!this.selectedImage.label) {
          this.message.warning('请输入图片标题');
          return;
        }

        const item: any = {
          images: this.imgs.map(img => ({
            url: img.url.replace('http://localhost:9000/kgms/', ''),
            label: img.label,
            description: img.description
          }))
        };

        this.entityService.post(item).subscribe({
          next: () => {
            this.message.success('图片添加成功！');
            this.saved.emit();
            this.back();
          },
          error: (error) => {
            this.message.error('保存失败：' + error.message);
          }
        });
        break;

      case 'cancel':
        this.back();
        break;
    }
  }

  private generateUniqueFileName(originalName: string): string {
    const timestamp = new Date().getTime();
    const uniqueSuffix = Math.random().toString(36).substring(2, 10);
    const extension = originalName.substring(originalName.lastIndexOf('.'));
    return `${timestamp}-${uniqueSuffix}${extension}`;
  }

  back() {
    this.canceled.emit();
    this.location.back();
  }
}
