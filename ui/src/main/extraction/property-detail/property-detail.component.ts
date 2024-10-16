import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { XGuid, XQuery } from '@ng-nest/ui/core';
import { XFormComponent, XControl } from '@ng-nest/ui/form';
import { XMessageService } from '@ng-nest/ui/message';
import { map } from 'rxjs';
import { OntologyService } from 'src/main/ontology/ontology/ontology.service';
import { PropertyService } from 'src/main/ontology/property/property.service';

@Component({
  selector: 'app-property-detail',
  templateUrl: './property-detail.component.html',
  styleUrls: ['./property-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyDetailComponent implements OnInit {
  @Input() name: any;
  type: string = '';
  predicate: any;
  @ViewChild('form') form!: XFormComponent;
  controls: XControl[] = [
    {
      control: 'find',
      id: 'schemas',
      required: true,
      multiple: true,
      treeData: () =>
        this.ontologyService
          .getList(1, Number.MAX_SAFE_INTEGER, {
            sort: [
              { field: 'pid', value: 'asc' },
              { field: 'sort', value: 'asc' },
            ],
          })
          .pipe(map((x) => x.list)),
    },
    {
      control: 'input',
      id: 'name',
      required: true,
      maxlength: 16,
      // pattern: /^[A-Za-z0-9]{4,16}$/,
      // message: '只能包括数字、字母的组合，长度为4-16位'
    },
    {
      control: 'input',
      id: 'description',
      required: true,
      // pattern: /^([a-zA-Z\d])(\w|\-)+@[a-zA-Z\d]+\.[a-zA-Z]{2,4}$/,
      // message: '邮箱格式不正确，admin@ngnest.com'
    },
    {
      control: 'select',
      id: 'type',
      required: true,
      data: [
        'time',
        'external-id',
        'monolingualtext',
        'url',
        'wikibase-item',
        'quantity',
        'commonsMedia',
        'string',
        'wikibase-property',
      ]
    },
    {
      control: 'find',
      id: 'types',
      required: false,
      multiple: true,
      treeData: () =>
        this.ontologyService
          .getList(1, Number.MAX_SAFE_INTEGER, {
            sort: [
              { field: 'pid', value: 'asc' },
              { field: 'sort', value: 'asc' },
            ],
          })
          .pipe(map((x) => x.list)),
    },
    {
      control: 'switch',
      id: 'isPrimary',
    },
    // { control: 'input', id: 'id', hidden: true, value: XGuid() },
  ];
  title = '';
  get formInvalid() {
    return this.form?.formGroup?.invalid;
  }
  disabled = false;
  query: XQuery = { filter: [] };

  constructor(
    private ontologyService: OntologyService,
    private propertyService: PropertyService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private message: XMessageService
  ) {

  }

  ngOnInit(): void {

    this.propertyService.getPropertyByName(this.name).subscribe((data: any) => {
      if (data.length > 0) {
          this.query.filter = [
            {
              field: 'id',
              value: data[0].id,
              relation: 'properties',
              operation: '=',
            },
          ];
          this.ontologyService
            .getList(1, 10, this.query)
            .subscribe((y: any) => {
              data[0]['schemas'] = y.list;
              this.query.filter = [
                {
                  field: 'id',
                  value: data[0].id as string,
                  relation: 'values',
                  operation: '=',
                },
              ];
              this.ontologyService
                .getList(1, 10, this.query)
                .subscribe((t: any) => {
                  data[0]['types'] = t.list;
                  this.form.formGroup.patchValue(data[0]);
                });
          
        });
        this.type = 'edit'
      } else {
        this.type = 'add'
        this.form.formGroup.patchValue({name: this.name, description: this.name});
      }
      this.action(this.type);

    })

  }

  action(type: string) {
    switch (type) {
      case 'info':
        // console.log(this.id);
        // this.propertyService.get(this.id as string).subscribe((x: any) => {
        //   this.query.filter = [
        //     {
        //       field: 'id',
        //       value: x.id as string,
        //       relation: 'properties',
        //       operation: '=',
        //     },
        //   ];
        //   this.ontologyService
        //     .getList(1, 10, this.query)
        //     .subscribe((y: any) => {
        //       x['schemas'] = y.list;
        //       this.query.filter = [
        //         {
        //           field: 'id',
        //           value: x.id as string,
        //           relation: 'values',
        //           operation: '=',
        //         },
        //       ];
        //       this.ontologyService
        //         .getList(1, 10, this.query)
        //         .subscribe((t: any) => {
        //           x['types'] = t.list;
        //           this.form.formGroup.patchValue(x);
        //         });
        //     });
        // });
        break;
      case 'edit':
        this.action('info');
        break;
      case 'save':
        console.log(this.form.formGroup.value);
        if (!this.form.formGroup.value.isPrimary) {
          this.form.formGroup.value.isPrimary = false;
        }


        if (this.type === 'add') {
          console.log(this.form.formGroup.value);
          this.propertyService
            .post(this.form.formGroup.value)
            .subscribe((x) => {
              this.message.success('新增成功！');
            });
        } else if (this.type === 'edit') {
          this.propertyService.put(this.form.formGroup.value).subscribe((x) => {
            console.log(this.predicate);
            this.message.success('修改成功！');
          });
        }
        break;
      case 'cancel':
        this.router.navigate(['/index/properties']);
        break;
    }
  }
}
