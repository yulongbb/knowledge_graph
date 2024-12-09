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
import { latLng, marker, Marker, Map , tileLayer } from 'leaflet';
import { EsService } from '../search/es.service';
import { forkJoin } from 'rxjs';
import { OntologyService } from '../ontology/ontology/ontology.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, OnDestroy {
  options = {
    layers: [
      tileLayer('http://localhost/gis/{z}/{x}/{y}.jpg', {  noWrap: true, maxZoom: 10, minZoom: 1, attribution: '...' })
    ],
    zoom: 3,
    center: latLng(46.879966, -121.726909)
  };

  markers: Marker[] = [];



  entities:any;
  types: any;
  type: any;
  constructor(
    private service: EsService,
    private ontologyService: OntologyService,
    private message: XMessageService,
    private dialogService: XDialogService,
    private msgBox: XMessageBoxService
  ) {

  }
  onMapReady(map: Map) {
    // 设置拖动边界（限制地图范围）
    const southWest = latLng(-90, -180); // 西南角坐标
    const northEast = latLng(90, 180); // 东北角坐标
    const bounds = L.latLngBounds(southWest, northEast);

    map.setMaxBounds(bounds);
    map.fitBounds(bounds)

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
        this.entities = data.list;
        let menu: any = [];
        let arr: any = [];
        data.types.forEach((m: any) => {
          arr.push(this.ontologyService.get(m.key));
        });
        forkJoin(arr).subscribe((properties: any) => {
          data.types.forEach((m: any) => {
            menu.push({
              id: m.key,
              label: properties.filter((p: any) => p.id == m.key)[0].name,
            });
          });
          let menuMerge = [];
          menuMerge = data.types.map((m: any, index: any) => {
            return { ...m, ...menu[index] };
          });
          menuMerge.forEach((m: any) => {
            m.label = m.label + '(' + m.doc_count + ')';
          });
          menuMerge.unshift({ id: '', label: '全部（' + data.total + ')' });
          this.types = menuMerge;
          console.log(menuMerge);
        });
       
     
        data.list.forEach((entity: any) => {

          console.log(entity._source.location);
          const newMarker = marker([entity._source.location.lat, entity._source.location.lon]);
          this.markers.push(newMarker);
         
        });
      });
    // 添加新的标记到标记数组
    console.log(`当前坐标：纬度 ${lat}, 经度 ${lng}`);
  }

  selectType($event:any){

  }

  onScroll() {}


  ngOnInit(): void {

  }

  ngOnDestroy(): void { }
  

}