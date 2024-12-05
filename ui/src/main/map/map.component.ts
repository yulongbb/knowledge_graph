import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Query,
  TemplateRef,
  ViewChild,
  signal,
  viewChild,
} from '@angular/core';

import {
  XDialogRef,
  XDialogService,
  XMessageBoxAction,
  XMessageBoxService,
  XMessageService,
  XPlace,
} from '@ng-nest/ui';
import { latLng, marker, Marker, tileLayer } from 'leaflet';
import { EsService } from '../search/es.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, OnDestroy {
  options = {
    layers: [
      tileLayer('http://localhost/gis/{z}/{x}/{y}.jpg', { maxZoom: 5, minZoom: 1, attribution: '...' })
    ],
    zoom: 1,
    center: latLng(46.879966, -121.726909)
  };

  markers: Marker[] = [];
  entities:any;
  constructor(
    private service: EsService,
    private message: XMessageService,
    private dialogService: XDialogService,
    private msgBox: XMessageBoxService
  ) {

  }

  // 地图点击事件处理函数
  onMapClick(event: any) {
    this.markers = [];
    const { lat, lng } = event.latlng;

    this.service
      .searchEntity(1, 10, {
        "geo_distance": {
          "distance": "500km",
          "location": {
            "lat": lat,
            "lon": lng
          }
        }

      })
      .subscribe((data: any) => {
        console.log(data.list);
        this.entities = data.list;
        data.list.forEach((entity: any) => {

          console.log(entity._source.location);
          const newMarker = marker([entity._source.location.lat, entity._source.location.lon]);
          this.markers.push(newMarker);
         
        });
      });
    // 添加新的标记到标记数组
    console.log(`当前坐标：纬度 ${lat}, 经度 ${lng}`);
  }

  onScroll() {}


  ngOnInit(): void {

  }

  ngOnDestroy(): void { }
}
