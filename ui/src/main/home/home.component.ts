import { Component, OnInit, signal, } from '@angular/core';
import { EsService } from '../search/es.service';
import { OntologyService } from '../ontology/ontology/ontology.service';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { property } from 'lodash';

@Component({
  selector: 'app-home',
  styleUrls: ['./home.component.scss'],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {

  keyword = '';
  size = 20;
  index = 1;
  entities!: any;
  query: any;
  menu: any;

  constructor(
    private service: EsService,
    private ontologyService: OntologyService,
    private router: Router,
    private activatedRoute: ActivatedRoute,

  ) {
    this.service.searchEntity(1, 50, {}).subscribe((data: any) => {
      data.list.forEach((item: any) => {
        this.ontologyService.get(item._source.type).subscribe((t: any) => {
          console.log(t)
          item._type = t.label
        })
      });
      this.entities = data.list;
      let menu:any = []
      let arr:any = [];
      data.aggregations.forEach((m: any) => {
        arr.push( this.ontologyService.get(m.key));
      })
      forkJoin(arr).subscribe((properties:any) => {
        console.log(properties)
        data.aggregations.forEach((m: any) => {
          menu.push({ id: m.key, label: properties.filter((p:any)=> p.id==m.key)[0].name})
        })
        console.log(menu)
        this.menu = signal(menu)

       });
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
      data.list.forEach((item: any) => {
        this.ontologyService.get(item._source.type).subscribe((t: any) => {
          item._type = t.label
        })
      });
      this.entities = data.list;
    })
  }

  action(type: string, item?: any) {
    console.log(item);

    switch (type) {
      case 'info':
        this.router.navigate(
          [`/index/search/${type}/${item._id}`],
          {
            relativeTo: this.activatedRoute,
          }
        ).then(() => {
        });
        break;

    }
  }


}
