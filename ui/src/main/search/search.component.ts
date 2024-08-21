import { Component, OnInit } from '@angular/core';
import { XData, XSliderNode } from '@ng-nest/ui';
import { Observable, map, tap } from 'rxjs';
import { EsService } from './es.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-search',
  styleUrls: ['./search.component.scss'],
  templateUrl: './search.component.html',
})
export class SearchComponent implements OnInit {
  entities: any;
  query = {};
  keyword = '';
  data: XData<XSliderNode> = ['目标库', '文库', '图库', '音频库', '视频库',];
  size = 20;
  index = 1;

  constructor(
    private service: EsService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {

  }

  ngOnInit(): void {
    this.service.searchEntity(1, 10, {}).subscribe((data: any) => {
      console.log(data);
      this.entities = data.list;
    })
  }

  search(keyword: any) {
    if (keyword != '') {
      this.query = { "must": [{ "match": { "labels.zh.value": keyword } }] }
    } else {
      this.query = {}
    }
    this.service.searchEntity(1, 10, this.query).subscribe((data: any) => {
      console.log(data);
      this.entities = data.list;
    })
  }

  getMd(row: any) {
    console.log(row);
    if (row.type.label == 'PDF') {
      return 6;
    }
    if (row.type.label == '图像') {
      return 8;
    }
    if (row.type.label == '音频') {
      return 10;
    }
    if (row.type.label == '视频') {
      return 12;
    }
    return 4;
  }


  action(type: string, item?: any) {
    console.log(item);

    switch (type) {
      case 'info':
        console.log(item);
        this.router.navigate(
          [`./${type}/${item._id}`],
          {
            relativeTo: this.activatedRoute,
          }
        ).then(() => {
        });
        break;

    }
  }

}
