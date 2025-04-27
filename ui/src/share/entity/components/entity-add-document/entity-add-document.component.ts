import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { XFormComponent, XControl } from '@ng-nest/ui/form';
import { XMessageService } from '@ng-nest/ui/message';
import { EntityService } from 'src/main/entity/entity.service';
import { Location } from '@angular/common';

interface DocumentFile {
  url: string;
  thumbnail: string;
  label?: string;
  description?: string;
}

interface DocumentFormData {
  label: string;
  description?: string;
  documents: DocumentFile[];
  tags?: string[];
}

@Component({
  selector: 'app-entity-add-document',
  templateUrl: './entity-add-document.component.html',
  styleUrls: ['./entity-add-document.component.scss']
})
export class EntityAddDocumentComponent {
  @Input() id!: string;
  @Output() saved = new EventEmitter<void>();
  @Output() canceled = new EventEmitter<void>();
  
  @ViewChild('form') form!: XFormComponent;

  documents: DocumentFile[] = [];

  formControls: XControl[] = [
    {
      control: 'input',
      id: 'label',
      label: '文档标题',
      required: true
    },
    {
      control: 'textarea',
      id: 'description',
      label: '文档描述'
    },
    {
      control: 'input',
      id: 'tags',
      label: '标签',
      placeholder: '使用#分隔多个标签'
    }
  ];

  constructor(
    private entityService: EntityService,
    private message: XMessageService,
    private location: Location
  ) {}

  onFileUpload(event: any): void {
    const documentFile = event.body.name;
    this.processDocument(documentFile);
  }

  private processDocument(documentFile: string): void {
    const formData = new FormData();
    formData.append('pdf', documentFile);

    fetch('http://localhost:3000/api/minio-client/cover', {
      method: 'POST',
      body: formData
    })
    .then(response => {
      if (!response.ok) throw new Error('封面生成失败');
      return response.json();
    })
    .then(data => {
      this.documents.push({
        url: `http://localhost:9000/kgms/${documentFile}`,
        thumbnail: data.cover,
        label: this.form.formGroup.value.label,
        description: this.form.formGroup.value.description
      });
    })
    .catch(error => {
      this.message.error(`文档处理失败: ${error.message}`);
    });
  }

  removeDocument(index: number): void {
    this.documents.splice(index, 1);
  }

  save(): void {
    if (!this.documents.length) {
      this.message.warning('请先上传文档');
      return;
    }

    if (this.form.formGroup.invalid) {
      this.message.warning('请填写必填字段');
      return;
    }

    const formValue = this.form.formGroup.value;
    const documentData: DocumentFormData = {
      label: formValue.label,
      description: formValue.description,
      documents: this.documents,
      tags: formValue.tags?.split('#').filter((tag:any) => tag.trim())
    };

    this.entityService.post(documentData).subscribe({
      next: () => {
        this.message.success('文档添加成功');
        this.saved.emit();
        this.back();
      },
      error: (error) => {
        this.message.error(`保存失败: ${error.message}`);
      }
    });
  }

  back(): void {
    this.canceled.emit();
    this.location.back();
  }
}
