import { Component, OnInit, signal } from '@angular/core';
import { XData, XDialogService, XImagePreviewComponent, XSliderNode } from '@ng-nest/ui';
import { EsService } from './es.service';
import { ActivatedRoute, Router } from '@angular/router';
import { OntologyService } from '../ontology/ontology/ontology.service';
import { PropertyService } from '../ontology/property/property.service';
import { NodeService } from '../node/node.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-search',
  styleUrls: ['./search.component.scss'],
  templateUrl: './search.component.html',
})
export class SearchComponent implements OnInit {

  keyword = '';
  size = 20;
  index = 1;
  entities!: any;
  query: any = {};
  menu: any;

  constructor(
    private service: EsService,
    private ontologyService: OntologyService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public propertyService: PropertyService,
    private nodeService: NodeService,
    private dialogSewrvice: XDialogService
  ) {

    this.service.searchEntity(1, 10, {}).subscribe((data: any) => {
      data.list.forEach((item: any) => {
        this.ontologyService.get(item._source.type).subscribe((t: any) => {
          item._type = t.label;
          this.ontologyService.getAllParentIds(item['_source'].type).subscribe((parents: any) => {
            parents.push(item['_source'].type)
            this.propertyService.getList(1, 100, { filter: [{ field: 'id', value: parents as string[], relation: 'schemas', operation: 'IN' }, { field: 'isPrimary', value: true, operation: '=' }] }).subscribe((p: any) => {
              this.nodeService.getLinks(1, 100, item['_id'], {}).subscribe((c: any) => {
                let statements: any = [];
                c.list.forEach((path: any) => {
                  if (path.edges[0]['_from'] != path.edges[0]['_to']) {
                    path.edges[0].mainsnak.datavalue.value.id = path?.vertices[1]?.id;
                    path.edges[0].mainsnak.datavalue.value.label = path?.vertices[1]?.labels?.zh?.value;
                  }
                  if (p.list?.filter((property: any) => path.edges[0].mainsnak.property == `P${property.id}`).length > 0) {
                    statements.push(path.edges[0])
                  }
                })
                item.claims = statements;
              })
            });
          });
        })
      });
      this.entities = data.list;
      let menu: any = []
      let arr: any = [];
      console.log(data.total)

      data.aggregations.forEach((m: any) => {
        arr.push(this.ontologyService.get(m.key));
      })
      forkJoin(arr).subscribe((properties: any) => {
        data.aggregations.forEach((m: any) => {
          menu.push({ id: m.key, label: properties.filter((p: any) => p.id == m.key)[0].name })
        })
        let menuMerge = [];
        menuMerge = data.aggregations.map((m: any, index: any) => {
          return { ...m, ...menu[index] }
        })
        menuMerge.forEach((m: any) => {
          m.label = m.label + '(' + m.doc_count + ')';
        })
        menuMerge.unshift({ id: '', label: '全部（' + data.total + ')' });
        this.menu = signal(menuMerge)
        console.log(menuMerge)

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
          this.ontologyService.getAllParentIds(item['_source'].type).subscribe((parents: any) => {
            parents.push(item['_source'].type)
            this.propertyService.getList(1, 50, { filter: [{ field: 'id', value: parents as string[], relation: 'schemas', operation: 'IN' }, { field: 'isPrimary', value: true, operation: '=' }] }).subscribe((p: any) => {
              this.nodeService.getLinks(1, 20, item['_id'], {}).subscribe((c: any) => {
                let statements: any = [];
                c.list.forEach((path: any) => {
                  if (path.edges[0]['_from'] != path.edges[0]['_to']) {
                    console.log(path)
                    path.edges[0].mainsnak.datavalue.value.id = path?.vertices[1]?.id;
                    path.edges[0].mainsnak.datavalue.value.label = path?.vertices[1]?.labels?.zh?.value;
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

  selectType(type: any) {
    if (type.id) {
      this.query = { "must": [{ "term": { "type.keyword": type.id } }] }
    } else {
      this.query = {}
    }
    this.service.searchEntity(1, 10, this.query).subscribe((data: any) => {
      console.log(data);
      data.list.forEach((item: any) => {
        this.ontologyService.get(item._source.type).subscribe((t: any) => {
          console.log(t)
          item._type = t.label;
          this.ontologyService.getAllParentIds(item['_source'].type).subscribe((parents: any) => {
            parents.push(item['_source'].type)
            this.propertyService.getList(1, 50, { filter: [{ field: 'id', value: parents as string[], relation: 'schemas', operation: 'IN' }, { field: 'isPrimary', value: true, operation: '=' }] }).subscribe((p: any) => {
              this.nodeService.getLinks(1, 20, item['_id'], {}).subscribe((c: any) => {
                let statements: any = [];
                c.list.forEach((path: any) => {
                  if (path.edges[0]['_from'] != path.edges[0]['_to']) {
                    console.log(path)
                    path.edges[0].mainsnak.datavalue.value.id = path?.vertices[1]?.id;
                    path.edges[0].mainsnak.datavalue.value.label = path?.vertices[1]?.labels?.zh?.value;
                  }
                  if (p.list?.filter((property: any) => path.edges[0].mainsnak.property == `P${property.id}`).length > 0) {
                    statements.push(path.edges[0])
                  }
                })
                item.claims = statements;
              })
            });
          });
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


  preview(image: any) {
    this.dialogSewrvice.create(XImagePreviewComponent, {
      width: '100%',
      height: '100%',
      className: 'x-image-preview-portal',
      data: [
        {
          src: 'http://localhost:9000/kgms/' + image
        }
      ]
    });
  }

  onScroll() {
    console.log('scrolled!!');
  }

}
