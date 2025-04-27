import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { XFormComponent, XControl } from '@ng-nest/ui/form';
import { XMessageService } from '@ng-nest/ui/message';
import { EntityService } from 'src/main/entity/entity.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-entity-add-video',
  templateUrl: './entity-add-video.component.html',
  styleUrls: ['./entity-add-video.component.scss']
})
export class EntityAddVideoComponent {
  @Input() id!: string;
  @Output() saved = new EventEmitter<void>();
  @Output() canceled = new EventEmitter<void>();
  
  @ViewChild('form') form!: XFormComponent;

  videos: any[] = [];
  thumbs: any[] = [];

  controls: XControl[] = [
    {
      control: 'input',
      id: 'label',
      label: '标题',
      required: true
    },
    {
      control: 'textarea',
      id: 'description',
      label: '描述',
      required: false
    }
  ];

  constructor(
    private entityService: EntityService,
    private message: XMessageService,
    private location: Location
  ) {}

  uploadVideo(event: any) {
    const videoFile = event.body.name;
    this.processVideoUpload(videoFile);
  }

  private processVideoUpload(videoFile: string) {
    const formData = new FormData();
    formData.append('video', videoFile);

    fetch('http://localhost:3000/api/minio-client/extract', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      this.videos.push({
        url: `http://localhost:9000/kgms/${videoFile}`,
        thumbnail: data.thumbnail,
        label: this.form.formGroup().value.label,
        description: this.form.formGroup().value.description
      });
    })
    .catch(error => {
      this.message.error('视频处理失败：' + error.message);
    });
  }

  save() {
    if (!this.videos.length) {
      this.message.warning('请先上传视频');
      return;
    }

    const formValue = this.form.formGroup().value;
    const item = {
      videos: this.videos,
      label: formValue.label,
      description: formValue.description
    };

    this.entityService.post(item).subscribe({
      next: () => {
        this.message.success('视频添加成功！');
        this.saved.emit();
        this.back();
      },
      error: (error) => {
        this.message.error('保存失败：' + error.message);
      }
    });
  }

  back() {
    this.canceled.emit();
    this.location.back();
  }
}
