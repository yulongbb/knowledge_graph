import { Component, OnInit } from '@angular/core';
import { XData, XSliderNode } from '@ng-nest/ui';
import { Observable, map, tap } from 'rxjs';
import { ImageService } from '../image/image.service';

@Component({
  selector: 'app-search',
  styleUrls: ['./search.component.scss'],
  templateUrl: './search.component.html',
})
export class SearchComponent implements OnInit {

  keyword = '';
  data: XData<XSliderNode> = ['目标库', '文库', '图库', '音频库', '视频库',];
  size = 20;
  index = 1;
  data$!: Observable<any>;

  constructor(
    private service: ImageService,

  ) {
    this.data$ = this.service
      .getList(this.index, this.size, { collection: 'entity', keyword: `%${this.keyword}%` })
      .pipe(
        tap((x: any) => console.log(x)),
        map((x: any) => x)
      );
  }

  ngOnInit(): void {
  }

  search(keyword: any) {

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


}
