import { Component, ChangeDetectionStrategy, OnInit, ViewChild } from '@angular/core';
import { XQuery } from '@ng-nest/ui/core';
import { XTableColumn, XTableComponent } from '@ng-nest/ui/table';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { XMessageService } from '@ng-nest/ui/message';
import { XMessageBoxService, XMessageBoxAction } from '@ng-nest/ui/message-box';
import { NavService } from 'src/services/nav.service';
import { PropertyService } from '../../property/property.service';

@Component({
    selector: 'app-ontology-properties',
    templateUrl: './ontology-properties.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OntologyPropertiesComponent implements OnInit {
    index = 1;

    query: XQuery = { filter: [] };

    schemaId!: string;
    data = (index: number, size: number, query: any) =>
        this.service.getList(index, size, query).pipe((x: any) => {
            return x;
        });
    columns: XTableColumn[] = [
        { id: 'id', label: '序号', flex: 0.5, left: 0, },
        { id: 'actions', label: '操作', width: 100 },
        { id: 'name', label: '名称', flex: 0.5, sort: true },
        { id: 'description', label: '描述', flex: 2.5, sort: true },
    ];
    @ViewChild('tableCom') tableCom!: XTableComponent;

    constructor(
        public service: PropertyService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private message: XMessageService,
        private msgBox: XMessageBoxService,
        private nav: NavService
    ) {
        // this.activatedRoute.paramMap.subscribe((x: ParamMap) => {
        //     this.schemaId = x.get('schemaId') as string;
        //     this.query.filter = [{ field: 'schemaId', value: this.schemaId as string, operation: '=' }];
        // });
    }

    ngOnInit() { }

    action(type: string, item?: any) {
        switch (type) {
            case 'add':
                this.router.navigate([`./${type}`], { relativeTo: this.activatedRoute });
                break;
            case 'info':
                this.router.navigate([`./${type}/${item.id}`], { relativeTo: this.activatedRoute });
                break;
            case 'edit':
                this.router.navigate([`./${type}/${item.id}`], { relativeTo: this.activatedRoute });
                break;
            case 'delete':
                this.msgBox.confirm({
                    title: '提示',
                    content: `此操作将永久删除此条数据：${item.name}，是否继续？`,
                    type: 'warning',
                    callback: (action: XMessageBoxAction) => {
                        action === 'confirm' &&
                            this.service.delete(item.id).subscribe(() => {
                                this.tableCom.change(this.index);
                                this.message.success('删除成功！');
                            });
                    }
                });
                break;
            case 'cancel':
                this.nav.back();
                break;
        }
    }
}
