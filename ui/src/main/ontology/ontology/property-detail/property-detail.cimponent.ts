import { Component, OnInit, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { XFormComponent, XControl } from '@ng-nest/ui/form';
import { SettingService } from 'src/services/setting.service';
import { NavService } from 'src/services/nav.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { XMessageService } from '@ng-nest/ui/message';
import { PropertyService } from '../../property/property.service';

@Component({
  selector: 'app-property-detail',
  templateUrl: './property-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PropertyDetailComponent implements OnInit {
  id!: string | null;
  type!: string | null;
  menuId!: string | null;
  controls: XControl[] = [
    { control: 'input', id: 'name', label: '名称', required: true },
    { control: 'input', id: 'descroption', label: '描述', required: true },
    { control: 'input', id: 'id', hidden: true, value: this.setting.guid() },
  ];

  @ViewChild('form') form!: XFormComponent;

  get formInvalid() {
    return this.form?.formGroup?.invalid;
  }

  get disabled() {
    return this.type === 'info';
  }

  constructor(
    private service: PropertyService,
    private setting: SettingService,
    private activatedRoute: ActivatedRoute,
    private message: XMessageService,
    private nav: NavService,
    private cdr: ChangeDetectorRef
  ) {
    this.activatedRoute.paramMap.subscribe((x: ParamMap) => {
      console.log(x);
      this.id = x.get('id');
      this.type = x.get('type');
      this.menuId = x.get('menuId');
      if (this.menuId) {
        (this.controls.find((x) => x.id === 'menuId') as XControl).value = this.menuId;
      }
    });
  }

  ngOnInit() {
    this.action(this.type);
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  action(type: string | null) {
    switch (type) {
      case 'info':
        console.log(this.id);
        this.service.get(this.id as string).subscribe((x) => {
          console.log(x);
          this.form.formGroup.patchValue(x);
        });
        break;
      case 'edit':
        this.action('info');
        break;
      case 'save':
        if (this.type === 'add') {
          this.service.post(this.setForm(this.form.formGroup.value)).subscribe(() => {
            this.message.success('新增成功！');
            this.nav.back(true);
          });
        } else if (this.type === 'edit') {
          this.service.put(this.setForm(this.form.formGroup.value)).subscribe(() => {
            this.message.success('修改成功！');
            this.nav.back(true);
          });
        }
        break;
      case 'cancel':
        this.nav.back();
        break;
    }
  }

  setForm(value: any) {
    return value;
  }
}
