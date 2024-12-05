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
import { latLng, tileLayer } from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, OnDestroy {
  options = {
    layers: [
      tileLayer('http://localhost/gis/{z}/{x}/{y}.jpg', { maxZoom: 5, minZoom:1, attribution: '...' })
    ],
    zoom: 1,
    center: latLng(46.879966, -121.726909)
  };
  constructor(
    private message: XMessageService,
    private dialogService: XDialogService,
    private msgBox: XMessageBoxService
  ) {

  }

  ngOnInit(): void {
  
  }

  ngOnDestroy(): void { }
}
