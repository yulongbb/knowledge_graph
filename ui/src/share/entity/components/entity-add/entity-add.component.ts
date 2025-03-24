import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { XFormComponent, XControl } from '@ng-nest/ui/form';
import { XMessageService } from '@ng-nest/ui/message';
import { EntityService } from 'src/main/entity/entity.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-entity-add',
  templateUrl: './entity-add.component.html',
  styleUrls: ['./entity-add.component.scss']
})
export class EntityAddComponent {
  @Input() id!: string;
  @Output() saved = new EventEmitter<void>();
  
  @ViewChild('form') form!: XFormComponent;

  controls: XControl[] = [
    // ...existing controls array from entity-detail...
  ];

  constructor(
    private entityService: EntityService,
    private message: XMessageService,
    private location: Location
  ) {}

  get formInvalid() {
    return this.form?.formGroup?.invalid;
  }

  save() {
    if (this.formInvalid) return;

    const formValue = this.form.formGroup.value;
    const item = {
      labels: {
        zh: { language: 'zh', value: formValue.label }
      },
      aliases: formValue.aliases?.split(',').map((alias: string) => ({
        language: 'zh',
        value: alias.trim()
      })),
      descriptions: {
        zh: { language: 'zh', value: formValue.description }
      },
      type: formValue.type?.id,
      tags: formValue.tags?.split('#').filter((x: string) => x.trim() !== '')
    };

    this.entityService.post(item).subscribe({
      next: () => {
        this.message.success('新增成功！');
        this.saved.emit();
        this.back();
      },
      error: (error) => {
        this.message.error('新增失败：' + error.message);
      }
    });
  }

  back() {
    this.location.back();
  }
}
