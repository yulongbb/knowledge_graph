import { Component, EventEmitter, Input, Output } from '@angular/core';
import { XFormComponent, XControl } from '@ng-nest/ui/form';
import { XMessageService } from '@ng-nest/ui/message';
import { EntityService } from 'src/main/entity/entity.service';
import { Location } from '@angular/common';
import { Marker, marker, tileLayer, latLng, LatLng } from 'leaflet';
import { FormGroup, Validators } from '@angular/forms';
import * as L from 'leaflet';

interface MapFormData {
  label: string;
  description?: string;
  location: {
    lat: number;
    lon: number;
  };
}

@Component({
  selector: 'app-entity-add-map',
  templateUrl: './entity-add-map.component.html',
  styleUrls: ['./entity-add-map.component.scss']
})
export class EntityAddMapComponent {
  @Input() id!: string;
  @Output() saved = new EventEmitter<void>();
  @Output() canceled = new EventEmitter<void>();
  
  markers: Marker[] = [];
  selectedLocation: LatLng | null = null;

  formControls: XControl[] = [
    {
      control: 'input',
      id: 'label',
      label: '位置名称',
      required: true,
      validators: [Validators.required]
    },
    {
      control: 'textarea',
      id: 'description',
      label: '位置描述'
    }
  ];

  mapOptions = {
    layers: [
      tileLayer('http://localhost/gis/{z}/{x}/{y}.jpg', {
        noWrap: true,
        maxZoom: 5,
        minZoom: 1,
        attribution: '...'
      })
    ],
    zoom: 3,
    center: latLng(46.879966, -121.726909)
  };

  constructor(
    private entityService: EntityService,
    private message: XMessageService,
    private location: Location
  ) {}

  onMapClick(event: { latlng: LatLng }): void {
    this.selectedLocation = event.latlng;
    this.updateMarker();
  }

  private updateMarker(): void {
    if (!this.selectedLocation) return;
    
    const newMarker = marker([
      this.selectedLocation.lat,
      this.selectedLocation.lng
    ]);
    this.markers = [newMarker];
  }

  onMapReady(map: L.Map): void {
    const bounds = new L.LatLngBounds(
      latLng(-90, -180),
      latLng(90, 180)
    );
    map.setMaxBounds(bounds);
    map.fitBounds(bounds);
  }

  save(form: FormGroup): void {
    if (form.invalid) {
      this.message.warning('请填写必填字段');
      return;
    }

    if (!this.selectedLocation) {
      this.message.warning('请在地图上选择位置');
      return;
    }

    const formData: MapFormData = {
      ...form.value,
      location: {
        lat: this.selectedLocation.lat,
        lon: this.selectedLocation.lng
      }
    };

    this.entityService.post(formData).subscribe({
      next: () => {
        this.message.success('位置添加成功');
        this.saved.emit();
        this.back();
      },
      error: (error) => {
        this.message.error(`保存失败: ${error.message}`);
      }
    });
  }

  back(): void {
    this.canceled.emit();
    this.location.back();
  }
}
