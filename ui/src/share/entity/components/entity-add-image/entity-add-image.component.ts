import { Component, EventEmitter, Input, Output, ChangeDetectorRef } from '@angular/core';
import { XMessageService } from '@ng-nest/ui/message';
import { EntityService } from 'src/main/entity/entity.service';
import { Location } from '@angular/common';
import { TagService } from 'src/main/ontology/tag/tag.sevice';
import { Router } from '@angular/router';

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
  tags: string[] = [];
  tagSuggestions: string[] = [];

  constructor(
    private entityService: EntityService,
    private message: XMessageService,
    private location: Location,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
  }

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
    console.log('onDragOver');
    console.log(event);
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
    this.isUploading = true;

    // 处理文件拖拽
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
          this.uploadFile(file);
        }
      });
      return;
    }

    // 处理网页图片拖拽
    const items = event.dataTransfer?.items;
    if (items) {
      Array.from(items).forEach(item => {
        item.getAsString(html => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const imgSrc = doc.querySelector('img')?.src;
          if (imgSrc) {
            this.uploadImageFromUrl(imgSrc);
          }
        });
      });
    }
  }

  uploadFile(file: File) {
    this.isUploading = true;
    const formData = new FormData();

    formData.append('file', file, this.generateUniqueFileName(file.name));

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

  async uploadImageFromUrl(url: string) {
    try {
      this.isUploading = true;

      // 直接使用后端代理接口获取图片
      const proxyResponse = await fetch(`http://localhost:3000/api/minio-client/proxy-image?url=${encodeURIComponent(url)}`);
      if (!proxyResponse.ok) {
        throw new Error('无法获取图片');
      }

      const blob = await proxyResponse.blob();
      const fileName = this.generateUniqueFileNameFromUrl(url);
      const file = new File([blob], fileName, { type: blob.type || 'image/jpeg' });
      this.uploadFile(file);
    } catch (error) {
      console.error('获取图片失败:', error);
      this.message.error('无法获取网页图片，请尝试右键保存后上传');
      this.isUploading = false;
      this.cdr.detectChanges();
    }
  }

  private generateUniqueFileNameFromUrl(url: string): string {
    // 从URL中提取原始文件名
    const urlParts = url.split('/');
    let originalName = urlParts[urlParts.length - 1].split('?')[0];

    // 如果URL中没有有效的文件名，使用默认名称
    if (!originalName || originalName.length < 4) {
      originalName = 'image.jpg';
    }

    // 生成带时间戳的唯一文件名
    const timestamp = new Date().getTime();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const extension = this.getExtensionFromUrl(url);

    return `web-${timestamp}-${randomStr}.${extension}`;
  }

  private getExtensionFromUrl(url: string): string {
    // 首先尝试从URL路径中获取扩展名
    const pathMatch = url.split('?')[0].match(/\.([^.]+)$/);
    if (pathMatch && /^(jpg|jpeg|png|gif|webp|avif)$/i.test(pathMatch[1])) {
      return pathMatch[1].toLowerCase();
    }

    // 如果URL中没有有效的图片扩展名，返回默认扩展名
    return 'jpg';
  }

  selectImage(image: any) {
    // 如果点击已选中的图片，则取消选中
    if (this.selectedImage && this.selectedImage.url === image.url) {
      this.selectedImage = null;
    } else {
      this.selectedImage = { ...image };
    }
    this.cdr.detectChanges();
  }

  cancelEdit() {
    this.selectedImage = null;
  }

  uploadImage($event: any) {
    $event.url = `http://localhost:9000/kgms/${$event.body.name}`;
    $event.label = $event.body.name;
    $event.description = '';
    $event.tags = '';
    this.selectImage($event);
    console.log($event);
    this.uploadedFiles.push($event);
  }

  save() {
    if (!this.uploadedFiles.length) {
      this.message.warning('请先上传图片');
      return;
    }

    if (!this.selectedImage?.label) {
      this.message.warning('请输入图片标题');
      return;
    }

    // 构建保存数据
    const item: any = {
      type: { id: 'image' },
      labels: {
        zh: {
          language: 'zh',
          value: this.selectedImage.label
        }
      },
      descriptions: {
        zh: {
          language: 'zh',
          value: this.selectedImage.description || ''
        }
      },
      tags: this.selectedImage.tags?.split('#').filter((x: any) => x.trim() !== ''),
      images: this.uploadedFiles.map(img => {
        const url = img.url.replace('http://localhost:9000/kgms/', '');
        return url;
      })
    };

    // 发送请求
    this.entityService.addItem(item).subscribe({
      next: () => {
        this.message.success('保存成功！');
        // 清空表单信息
        this.uploadedFiles = [];
        this.selectedImage = null;
        // 先触发保存成功事件
        this.saved.emit();
        // 使用 router 导航到指定路径，带上空的 keyword 参数
        setTimeout(() => {
          this.router.navigate(['/start/image'], {
            queryParams: { keyword: '' }
          });
        }, 300);
      },
      error: (error) => {
        this.message.error('保存失败：' + error.message);
      }
    });
  }

  private generateUniqueFileName(originalName: string): string {
    const timestamp = new Date().getTime();
    const uniqueSuffix = Math.random().toString(36).substring(2, 10);
    const extension = originalName.substring(originalName.lastIndexOf('.'));
    return `${timestamp}-${uniqueSuffix}${extension}`;
  }

  back() {
    // 直接使用 router 导航到指定路径，带上空的 keyword 参数
    this.router.navigate(['/start/image'], {
      queryParams: { keyword: '' }
    });
  }
}
