import { Component, inject, OnInit, signal, } from '@angular/core';
import { XButtonComponent } from '@ng-nest/ui/button';
import {
    XDialogActionsDirective,
    XDialogCloseDirective,
    XDialogContentDirective,
    XDialogDragHandleDirective,
    XDialogFullscreenDirective,
    XDialogTitleDirective,
    X_DIALOG_DATA
} from '@ng-nest/ui/dialog';
import { XDialogRef } from '@ng-nest/ui/dialog';
import { XTreeModule } from '@ng-nest/ui/tree';
import { XInputModule } from '@ng-nest/ui/input';
import { XCheckboxModule, XCollapseModule, XDatePickerModule, XDrawerModule, XInputNumberModule, XLinkModule, XMenuModule, XPageHeaderModule, XSelectModule, XSwitchModule, XTableModule, XTagModule } from "@ng-nest/ui";
import { XUploadModule } from '@ng-nest/ui/upload';
import { XImageModule } from '@ng-nest/ui/image';
import { XStatisticModule } from '@ng-nest/ui/statistic';
import { XRadioModule } from '@ng-nest/ui/radio';
import { CommonModule } from "@angular/common";
import { ShareModule } from "src/share/share.module";
import {
    XDialogService,
    XGuid,
    XImagePreviewComponent,
    XTableColumn,
    XTableRow,
    XPlace,

} from '@ng-nest/ui';

import { OntologyService } from 'src/main/ontology/ontology/ontology.service';
import { DomSanitizer } from '@angular/platform-browser';
import { EsService } from 'src/main/search/es.service';
import { PropertyService } from 'src/main/ontology/property/property.service';
import { EntityService } from '../entity.service';
import { TagService } from 'src/main/ontology/tag/tag.sevice';
import { NavService } from 'src/services/nav.service';
import { XMessageService } from '@ng-nest/ui/message';
import { Qualify, QualifyService } from './../../ontology/qualify/qualify.service';

@Component({
    selector: 'qualifies-dialog',
    standalone: true,
    imports: [
        CommonModule,
        ShareModule,

        XButtonComponent,
        XDialogTitleDirective,
        XDialogDragHandleDirective,
        XDialogContentDirective,
        XDialogActionsDirective,
        XDialogFullscreenDirective,
        XDialogCloseDirective,
        XTreeModule,
        XInputModule,
        XDrawerModule,
        XUploadModule,
        XPageHeaderModule,
        XStatisticModule,
        XImageModule,
        XRadioModule,
        XTagModule,
        XSelectModule,
        XTableModule,
        XMenuModule,
        XLinkModule,
        XCheckboxModule,
        XSwitchModule,
        XCollapseModule,
        XDatePickerModule,
        XInputNumberModule,
    ],
    templateUrl: './qualifies.component.html'
})
export class QualifiesDialogComponent implements OnInit {
    data: any = inject(X_DIALOG_DATA);

    item: any;

    qualifiers: any;

    properties: any;
    propertyData: any;

    dialogRef = inject(XDialogRef<QualifiesDialogComponent>);

    columns2: XTableColumn[] = [
        { id: 'index', label: '序号', width: 40, left: 0, type: 'index' },
        { id: 'property', label: '限定名', flex: 1 },
        { id: 'name', label: '限值', flex: 1 },
        { id: 'actions', label: '操作', width: 100 },
    ];

    constructor(
        private message: XMessageService,
        public nav: NavService,
        private qualifyService: QualifyService,
        public tagService: TagService,
        private nodeService: EntityService,
    ) {

    }
    ngOnInit(): void {
        this.qualifyService
            .getList(1, 50, {
                filter: [
                    {
                        field: 'id',
                        value: this.data.mainsnak.property.replace('P', ''),
                        relation: 'properties',
                        operation: '=',
                    },
                ],
            })
            .subscribe((x: any) => {
                console.log(x.list)
                this.propertyData = signal(x.list);
                this.properties = x.list.map((p: any) => p.label);
            });

        this.qualifiers = [];
        Object.keys(this.data.mainsnak.qualifiers).map((key) => {
            console.log(key)
            console.log(this.data.mainsnak.qualifiers[key]);
            this.data.mainsnak.qualifiers[key].forEach((qlf: any) => {
                this.qualifiers.push(qlf);
            })
        })
    }
    add() {
        console.log(this.properties)
        if (!this.qualifiers) {
            this.qualifiers = []
        }
        this.qualifiers = [
            ...this.qualifiers,
            {
                mainsnak: {
                    snaktype: 'value',
                    property: '',
                    hash: '8f7599319c8f07055134a500cf67fc22d1b3142d',
                    datavalue: {
                        value: '',
                        type: 'string',
                    },
                    datatype: 'string',
                },
                type: 'statement',
                rank: 'normal',
            },
        ];
    }

    save(row: any) {
        console.log(this.qualifiers);

        this.data.mainsnak.qualifiers = {};
        this.qualifiers.forEach((qualify: any) => {
            if (!this.data.mainsnak.qualifiers[qualify.mainsnak.property]) {
                this.data.mainsnak.qualifiers[qualify.mainsnak.property] = []
            }
            this.data.mainsnak.qualifiers[qualify.mainsnak.property].push(qualify)
        })
        console.log(this.data);
        this.nodeService.updateEdge(this.data).subscribe(() => {
            this.message.success('更新成功！');
        })
    }

    del(row: any) {
        console.log(row);
        const index = this.qualifiers.findIndex((x: any) => x.id === row.id);
        if (index >= 0) {
            this.qualifiers.splice(index, 1);
        }
        this.nodeService.deleteEdge(row._key).subscribe(() => {

            this.message.success('删除成功！');
        })
    }

    change(qualify: any) {
        console.log(qualify)
        qualify.mainsnak.datatype = this.propertyData().filter((p: any) => p.label == qualify.mainsnak.label)[0].type;
        switch (qualify.mainsnak.datatype) {
            case 'commonsMedia':
            case 'external-id':
            case 'string':
            case 'url':
            case 'math':
            case 'monolingualtext':
            case 'musical-notation':
                qualify.mainsnak.property = `Q${this.propertyData().filter((p: any) => p.label == qualify.mainsnak.label)[0].id}`
                qualify.mainsnak.datavalue = {
                    value: '',
                    type: 'string',
                }
                break;
            case 'globe-coordinate':
                qualify.mainsnak.property = `Q${this.propertyData().filter((p: any) => p.label == qualify.mainsnak.label)[0].id}`
                qualify.mainsnak.datavalue = {
                    value: {
                        latitude: 0,
                        longitude: 0,
                        altitude: null,
                        precision: 0,
                        globe: 'http://www.wikidata.org/entity/Q2', // Default to Earth
                    },
                    type: 'globecoordinate',
                }
                break;

            case 'quantity':
                qualify.mainsnak.property = `Q${this.propertyData().filter((p: any) => p.label == qualify.mainsnak.label)[0].id}`
                qualify.mainsnak.datavalue = {
                    value: {
                        amount: 0,
                        unit: '1',
                        upperBound: null,
                        lowerBound: null,
                    },
                    type: 'quantity',
                }
                break;
            case 'time':
                qualify.mainsnak.property = `Q${this.propertyData().filter((p: any) => p.label == qualify.mainsnak.label)[0].id}`
                qualify.mainsnak.datavalue = {
                    value: {
                        time: '',
                        timezone: 0,
                        before: 0,
                        after: 0,
                        precision: 0,
                        calendarmodel: 'http://www.wikidata.org/entity/Q1985727', // Default to Gregorian calendar
                    },
                    type: 'time'
                }
                break;
            case 'wikibase-item':
            case 'wikibase-property':
            case 'wikibase-lexeme':
            case 'wikibase-form':
            case 'wikibase-sense':
                qualify.mainsnak.property = `P${this.propertyData().filter((p: any) => p.label == qualify.mainsnak.label)[0].id}`
                qualify.mainsnak.datavalue = {
                    value: {
                        'entity-type': qualify.mainsnak.datatype.replace('wikibase-', ''),
                        'numeric-id': 0,
                        id: '',
                    },
                    type: 'wikibase-entityid'
                }
                break;
        }

        qualify.mainsnak.property = `Q${this.propertyData().filter((p: any) => p.label == qualify.mainsnak.label)[0].id}`
        console.log(qualify);
    }


    close() {
        this.dialogRef.close();
    }
}