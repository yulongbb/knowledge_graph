import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { XGuid } from '@ng-nest/ui/core';
import { XFormComponent, XControl } from '@ng-nest/ui/form';
import { XMessageService } from '@ng-nest/ui/message';

@Component({
  selector: 'app-fusion-entity',
  templateUrl: './fusion-entity.component.html',
  styleUrls: ['./fusion-entity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FusionEntityComponent implements OnInit {
  id: string = '';
  type: string = '';
  @ViewChild('form') form!: XFormComponent;
  controls: XControl[] = [
    {
      control: 'input',
      id: 'name',
      label: '名称',
      required: true,
      maxlength: 16,
      // pattern: /^[A-Za-z0-9]{4,16}$/,
      // message: '只能包括数字、字母的组合，长度为4-16位'
    },
    {
      control: 'input',
      id: 'description',
      label: '描述',
      required: true,
      // pattern: /^([a-zA-Z\d])(\w|\-)+@[a-zA-Z\d]+\.[a-zA-Z]{2,4}$/,
      // message: '邮箱格式不正确，admin@ngnest.com'
    },
    { control: 'input', id: 'id', hidden: true, value: XGuid() }
  ];
  title = '实体对齐';
  get formInvalid() {
    return this.form?.formGroup?.invalid;
  }
  disabled = false;
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private message: XMessageService
  ) {

  }

  ngOnInit(): void {
  }

}