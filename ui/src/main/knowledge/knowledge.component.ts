import { PageBase } from 'src/share/base/base-page';
import { Component, Query } from '@angular/core';
import { IndexService } from 'src/layout/index/index.service';
import { Knowledge, KnowledgeService } from './knowledge.service';
import { XFormRow, XGuid, XMessageService, XTableColumn } from '@ng-nest/ui';
import { UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'app-knowledge',
  templateUrl: 'knowledge.component.html',
  styleUrls: ['./knowledge.component.scss'],
})
export class KnowledgeComponent extends PageBase {
  formGroup = new UntypedFormGroup({});

  selected!: Knowledge;
  type = 'add';
  loading = true;


  
  data:any;

  controls: XFormRow[] = [
    {
      controls: [
        {
          control: 'input',
          id: 'name',
          label: '名称',
          required: true,
        },
      ],
    }
  ];




  constructor(
    private service: KnowledgeService,
    public override indexService: IndexService,
    private message: XMessageService,

  ) {
    super(indexService);

  }

  ngOnInit() {
    const index = 0; // 你的索引值
    const size = 10; // 你的大小值

    this.service.getList(index, size).subscribe(
      (data: any) => {
        this.data = data;
        // 这里的 data 就是从服务端获取到的数据
        console.log('获取到的数据：', data);
        // 在这里你可以对获取到的数据进行处理或者显示
      },
      (error: any) => {
        // 如果发生错误，会在这里捕获并处理
        console.error('发生错误：', error);
      }
    );
  }

  get disabled() {
    return !['edit', 'add',].includes(this.type);
  }


  action(type: string, knowledge: Knowledge) {
    console.log(type)
    switch (type) {
      case 'add':
        this.selected = knowledge;
        this.type = type;
        this.formGroup.reset();
        this.formGroup.patchValue({
          id: XGuid(),
        });
        break;
      case 'save':
        if (this.type === 'add') {
          console.log(this.formGroup.value);
          this.service.post(this.formGroup.value).subscribe((x) => {
            this.type = 'info';
            console.log(x);
            this.message.success('新增成功！');
          });
        } else if (this.type === 'edit') {
          // this.service.put(this.formGroup.value).subscribe(() => {
          //   this.type = 'info';
          //   this.treeCom.updateNode(node, this.formGroup.value);
          //   this.message.success('修改成功！');
          // });
        }
        break;
      // case 'delete':
      //   this.msgBox.confirm({
      //     title: '提示',
      //     content: `此操作将永久删除此条数据：${schema.label}，是否继续？`,
      //     type: 'warning',
      //     callback: (action: XMessageBoxAction) => {
      //       action === 'confirm' &&
      //         this.service.delete(schema.id).subscribe(() => {
      //           console.log(schema);
      //           this.treeCom.removeNode(schema);
      //           this.formGroup.reset();
      //           this.message.success('删除成功！');
      //         });
      //     },
      //   });
        break;
    }
  }
}
