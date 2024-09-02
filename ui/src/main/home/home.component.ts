import { Component, OnInit,  } from '@angular/core';
import { XData, XSliderNode } from '@ng-nest/ui';
import { map, tap } from 'rxjs';
import { EsService } from '../search/es.service';
import { OntologyService } from '../ontology/ontology/ontology.service';

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
  entities!: any;
  query:any;

  constructor(
    private service: EsService,
    private ontologyService: OntologyService,

  ) {
    this.service.searchEntity(1, 50, {}).subscribe((data: any) => {
      data.list.forEach((item:any) => {
        this.ontologyService.get(item._source.type).subscribe((t:any)=>{
          console.log(t)
          item._type = t.label
        })
      });
      this.entities = data.list;
    })
  }

  ngOnInit(): void {
  }

  search(keyword: any) {
    if (keyword != '') {
      this.query = { "must": [{ "match": { "labels.zh.value": keyword } }] }
    } else {
      this.query = {}
    }
    this.service.searchEntity(1, 50, this.query).subscribe((data: any) => {
      data.list.forEach((item:any) => {
        this.ontologyService.get(item._source.type).subscribe((t:any)=>{
          item._type = t.label
        })
      });
      this.entities = data.list;
    })
  }



}
