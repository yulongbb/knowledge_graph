import { Component, OnInit,  } from '@angular/core';
import { XData, XSliderNode } from '@ng-nest/ui';
import { map, tap } from 'rxjs';
import { EsService } from '../search/es.service';

@Component({
  selector: 'app-home',
  styleUrls: ['./home.component.scss'],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {

  keyword = '';
  data: XData<XSliderNode> = ['目标库', '文库', '图库', '音频库', '视频库',];
  size = 20;
  index = 1;
  data$!: any;
  query:any;

  constructor(
    private service: EsService,

  ) {
    this.data$ = this.service
      .searchEntity(1, 20, {})
      .pipe(
        tap((x: any) => console.log(x)),
        map((x: any) => x.list)
      );
  }

  ngOnInit(): void {
  }

  search(keyword: any) {
    if (keyword != '') {
      this.query = { "must": [{ "match": { "labels.zh.value": keyword } }] }
    } else {
      this.query = {}
    }
    this.data$ = this.service
    .searchEntity(1, 20, this.query)
    .pipe(
      tap((x: any) => console.log(x)),
      map((x: any) => x.list)
    );
  }



}
