import { Component, ElementRef, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { XTreeComponent } from '@ng-nest/ui';
import { forkJoin, map, tap } from 'rxjs';
import { IndexService } from 'src/layout/index/index.service';
import { OntologyService } from 'src/main/ontology/ontology/ontology.service';
import { PageBase } from 'src/share/base/base-page';
import { EntityService } from '../entity.service';
declare const canvasDatagrid: any;

@Component({
    selector: 'app-entity-grid',
    templateUrl: './entity-grid.component.html',
    styleUrls: ['./entity-grid.component.scss'],
})
export class EntityGridComponent extends PageBase implements OnInit {
    grid: any;
    @ViewChild('datagridContainer', { static: true }) datagridContainer!: ElementRef;
    @ViewChild('treeCom') treeCom!: XTreeComponent;

    data = [
        { 标签: '', 描述: '' },
        { 标签: '', 描述: '' },
        { 标签: '', 描述: '' },
        { 标签: '', 描述: '' },
        { 标签: '', 描述: '' },
        { 标签: '', 描述: '' },
        { 标签: '', 描述: '' },
        { 标签: '', 描述: '' },
        { 标签: '', 描述: '' },
        { 标签: '', 描述: '' },
        { 标签: '', 描述: '' },
    ];

    type:any;

    tree = () =>
        this.service
            .getList(1, Number.MAX_SAFE_INTEGER, {
                sort: [
                    { field: 'pid', value: 'asc' },
                    { field: 'sort', value: 'asc' },
                ],
            })
            .pipe(
                tap((x) => (console.log(x))),
                map((x) => x.list)
            );

    constructor(
        private service: OntologyService,
        private nodeService: EntityService,

        public override indexService: IndexService,

    ) {
        super(indexService);
    }


    ngOnInit(): void {
        this.grid = canvasDatagrid();
        this.grid.style.height = '400px';
        this.grid.style.width = '100%';
        this.grid.data = this.data;
        this.datagridContainer.nativeElement.appendChild(this.grid);


    }

    selectType(type:any){
        console.log(type)
        this.type = type;
    }

    uploadData() {
        let data: any = []
        this.data.forEach((d: any) => {
            if (d['标签'] != '') {
                data.push({
                    "type": this.type,
                    "labels": {
                        "zh": {
                            "language": "zh",
                            "value": d['标签']
                        }
                    },
                    "descriptions": {
                        "zh": {
                            "language": "zh",
                            "value": d['描述']
                        }
                    }
                })
            }

        })
        console.log('上传数据:', data);

        let arr:any = [];

        data.forEach((item:any) => {
            arr.push(this.nodeService.post(item))
        });

        forkJoin(arr).subscribe((items:any)=>{
            console.log(items)
        })


      
        // 在这里实现批量入库逻辑，例如通过 HTTP 提交数据
    }
}