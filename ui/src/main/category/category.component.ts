import { Component, ViewChild } from '@angular/core';
import { IndexService } from 'src/layout/index/index.service';
import { PageBase } from 'src/share/base/base-page';
import { XTreeAction, XTreeComponent, XGuid } from '@ng-nest/ui';
import { XFormRow } from '@ng-nest/ui/form';
import { UntypedFormGroup } from '@angular/forms';
import { CategoryService, Category } from './category.service';
import { XMessageService } from '@ng-nest/ui/message';
import { XMessageBoxService, XMessageBoxAction } from '@ng-nest/ui/message-box';
import { ActivatedRoute, Router } from '@angular/router';
import { XFormComponent } from '@ng-nest/ui/form';
import { map, tap } from 'rxjs/operators';

@Component({
    selector: 'app-category',
    templateUrl: 'category.component.html',
    styleUrls: ['./category.component.scss'],
})
export class CategoryComponent extends PageBase {
    @ViewChild('treeCom') treeCom!: XTreeComponent;
    @ViewChild('form') form!: XFormComponent;

    formGroup = new UntypedFormGroup({});

    get disabled() {
        return !['edit', 'add', 'add-root'].includes(this.type);
    }

    type = 'info';

    selected!: Category;
    treeLoading = true;

    data = () =>
        this.service
            .getList(1, Number.MAX_SAFE_INTEGER, {
                sort: [
                    { field: 'pid', value: 'asc' },
                    { field: 'sort', value: 'asc' },
                ],
            })
            .pipe(
                tap((x) => console.log('Categories loaded:', x)),
                map((x) => x.list)
            );

    treeActions: XTreeAction[] = [
        {
            id: 'add',
            label: '新增',
            icon: 'fto-plus-square',
            handler: (category: Category) => {
                this.action('add', category);
            },
        },
        {
            id: 'edit',
            label: '修改',
            icon: 'fto-edit',
            handler: (category: Category) => {
                this.action('edit', category);
            },
        },
        {
            id: 'delete',
            label: '删除',
            icon: 'fto-trash-2',
            handler: (category: Category) => {
                this.action('delete', category);
            },
        },
    ];

    controls: XFormRow[] = [
        {
            controls: [
                {
                    control: 'input',
                    id: 'id',
                    label: 'ID',
                },
                {
                    control: 'input',
                    id: 'name',
                    label: '名称',
                    required: true
                },
                {
                    control: 'input',
                    id: 'label',
                    label: '显示名称',
                    required: true
                },
                {
                    control: 'textarea',
                    id: 'description',
                    label: '描述'
                },
                {
                    control: 'color-picker',
                    id: 'color',
                    label: '颜色'
                },
                {
                    control: 'input',
                    id: 'icon',
                    label: '图标',
                },
                {
                    control: 'input',
                    id: 'sort',
                    label: '排序',
                    type: 'number'
                }
            ],
        },
        {
            hidden: true,
            controls: [
                {
                    control: 'input',
                    id: 'pid',
                },
            ],
        },
    ];

    constructor(
        private service: CategoryService,
        public override indexService: IndexService,
        private message: XMessageService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private msgBox: XMessageBoxService
    ) {
        super(indexService);
    }

    action(type: string, category: Category) {
        switch (type) {
            case 'add-root':
                this.selected = category;
                this.type = type;
                this.formGroup.reset();
                this.formGroup.patchValue({
                    id: XGuid(),
                    pid: null,
                    sort: 0
                });
                break;
            case 'add':
                this.selected = category;
                this.type = type;
                this.formGroup.reset();
                this.formGroup.patchValue({
                    id: XGuid(),
                    pid: category.id,
                    sort: 0
                });
                break;
            case 'save':
                if (this.type === 'add' || this.type === 'add-root') {
                    console.log('Form Value:', this.formGroup.value);
                    this.service.post(this.formGroup.value).subscribe((x) => {
                        this.type = 'info';
                        this.treeCom.addNode(x);
                        this.message.success('新增成功！');
                    });
                } else if (this.type === 'edit') {
                    this.service.put(this.formGroup.value).subscribe(() => {
                        this.type = 'info';
                        this.treeCom.updateNode(category, this.formGroup.value);
                        this.message.success('修改成功！');
                    });
                }
                break;
            case 'delete':
                this.msgBox.confirm({
                    title: '提示',
                    content: `此操作将永久删除此分类：${category.label}，以及其下的所有子分类，是否继续？`,
                    type: 'warning',
                    callback: (action: XMessageBoxAction) => {
                        action === 'confirm' &&
                            this.service.delete(category.id).subscribe(() => {
                                this.treeCom.removeNode(category);
                                this.formGroup.reset();
                                this.message.success('删除成功！');
                            });
                    },
                });
                break;
            case 'edit':
                this.selected = category;
                this.type = type;
                this.service.get(category?.id).subscribe((x) => {
                    this.formGroup.patchValue(x);
                });
                break;
            case 'info':
                this.selected = category;
                this.type = 'info';
                this.service.get(category?.id).subscribe((x) => {
                    this.formGroup.patchValue(x);
                });
                break;
        }
    }
}
