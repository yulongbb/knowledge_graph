import { Component, Input, OnInit, signal, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { XFormComponent, XControl } from '@ng-nest/ui/form';
import { XMessageService } from '@ng-nest/ui/message';
import { EntityService } from 'src/main/entity/entity.service';
import { PropertyService } from 'src/main/ontology/property/property.service';
import { marker, tileLayer, latLng, Marker } from 'leaflet';

interface EntityFormData {
  _key: string;
  label: string;
  aliases?: string;
  description?: string;
  type: { id: string; label: string };
  tags?: string[];
}

@Component({
  selector: 'app-entity-edit',
  templateUrl: './entity-edit.component.html',
  styleUrls: ['./entity-edit.component.scss']
})
export class EntityEditComponent implements OnInit {
  @Input() id!: string;
  @ViewChild('form') form!: XFormComponent;

  entity = signal<any>(null);
  properties = signal<any[]>([]);
  statements = signal<any[]>([]);
  tag = signal<string[]>([]);
  markers: Marker[] = [];

  formControls: XControl[] = [
    // ... copy existing controls array from entity-detail component ...
  ];

  mapOptions = {
    layers: [
      tileLayer('http://localhost/gis/{z}/{x}/{y}.jpg', {
        noWrap: true,
        maxZoom: 5,
        minZoom: 1
      })
    ],
    zoom: 3,
    center: latLng(46.879966, -121.726909)
  };

  constructor(
    private entityService: EntityService,
    private propertyService: PropertyService,
    private message: XMessageService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.loadEntityData();
  }

  private loadEntityData(): void {
    // ... copy loadEntityData logic from entity-detail component ...
  }

  save(): void {
    if (this.form.formGroup.invalid) {
      this.message.warning('请完善必填信息');
      return;
    }

    const formValue = this.form.formGroup().value;
    const updateData = this.prepareUpdateData(formValue);

    this.entityService.put(updateData).subscribe({
      next: () => {
        this.message.success('更新成功');
        this.back();
      },
      error: (error) => {
        this.message.error(`更新失败: ${error.message}`);
      }
    });
  }

  private prepareUpdateData(formValue: EntityFormData): any {
    return {
      id: this.id,
      _key: formValue._key,
      labels: {
        zh: { language: 'zh', value: formValue.label }
      },
      aliases: {
        zh: formValue.aliases?.split(',').map(alias => ({
          language: 'zh',
          value: alias.trim()
        }))
      },
      descriptions: {
        zh: { language: 'zh', value: formValue.description }
      },
      type: formValue.type?.id,
      tags: this.tag(),
      // ... include other necessary fields like location, images, etc.
    };
  }

  back(): void {
    this.location.back();
  }

  // ... other necessary methods for map, property editing, etc.
}
