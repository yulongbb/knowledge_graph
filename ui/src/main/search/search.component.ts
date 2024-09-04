import { Component, OnInit, signal } from '@angular/core';
import { XData, XSliderNode } from '@ng-nest/ui';
import { EsService } from './es.service';
import { ActivatedRoute, Router } from '@angular/router';
import { OntologyService } from '../ontology/ontology/ontology.service';
import { PropertyService } from '../ontology/property/property.service';
import { NodeService } from '../node/node.service';

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
  menu = signal([]);
  constructor(
    private service: EsService,
    private router: Router,
    private ontologyService: OntologyService,
    private activatedRoute: ActivatedRoute,
    public propertyService: PropertyService,
    private nodeService: NodeService,

  ) {

  }

  ngOnInit(): void {
    this.ontologyService
      .getList(1, Number.MAX_SAFE_INTEGER, {
        sort: [
          { field: 'pid', value: 'asc' },
          { field: 'sort', value: 'asc' },
        ],
      }).subscribe((data: any) => {
        console.log(data);
        let menu: any = [];
        data.list.forEach((d: any) => {
          if (d.id != 'E1') {
            if (d.pid == 'E1') {
              menu.push({ id: d.id, label: d.name, })

            } else {

              menu.push({ id: d.id, label: d.name, pid: d?.pid })

            }
          }

        })
        this.menu = signal(menu)
      })
    this.service.searchEntity(1, 50, {}).subscribe((data: any) => {
      data.list.forEach((item: any) => {
        this.ontologyService.get(item._source.type).subscribe((t: any) => {
          console.log(t)
          item._type = t.label;
          this.ontologyService.getAllParentIds(item['_source'].type).subscribe((parents: any) => {
            parents.push(item['_source'].type)
            this.propertyService.getList(1, 50, { filter: [{ field: 'id', value: parents as string[], relation: 'schemas', operation: 'IN' }, { field: 'isPrimary', value: true, operation: '=' }] }).subscribe((p: any) => {
              console.log(p.list)
              this.nodeService.getLinks(1, 20, item['_id'], {}).subscribe((c: any) => {
                let statements: any = [];
                c.list.forEach((path: any) => {
                  if (path.edges[0]['_from'] != path.edges[0]['_to']) {
                    path.edges[0].mainsnak.datavalue.value.id = path.vertices[1].id;
                    path.edges[0].mainsnak.datavalue.value.label = path.vertices[1].labels.zh.value;
                  }
                  if (p.list?.filter((property: any) => path.edges[0].mainsnak.property == `P${property.id}`).length > 0) {
                    statements.push(path.edges[0])
                  }
                })
                item.claims = statements;
                console.log(item)

              })

            });
          });
        })
      });
      this.entities = data.list;
    })
  }

  search(keyword: any) {
    if (keyword != '') {
      this.query = { "must": [{ "match": { "labels.zh.value": keyword } }, { "match": { "descriptions.zh.value": keyword } }] }
    } else {
      this.query = {}
    }
    this.service.searchEntity(1, 50, this.query).subscribe((data: any) => {
      console.log(data);
      this.entities = data.list;
    })
  }

  selectType(type: any) {
    this.query = { "must": [{"term": {"type.keyword": type.id}}] }

    this.service.searchEntity(1, 50, this.query).subscribe((data: any) => {
      console.log(data);
      this.entities = data.list;
    })  }

  action(type: string, item?: any) {
    console.log(item);

    switch (type) {
      case 'info':
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
