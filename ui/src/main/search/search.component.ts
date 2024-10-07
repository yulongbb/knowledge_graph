import { Component, OnInit, signal } from '@angular/core';
import {
  XData,
  XDialogService,
  XImagePreviewComponent,
  XSliderNode,
} from '@ng-nest/ui';
import { EsService } from './es.service';
import { ActivatedRoute, Router } from '@angular/router';
import { OntologyService } from '../ontology/ontology/ontology.service';
import { PropertyService } from '../ontology/property/property.service';
import { forkJoin } from 'rxjs';
import { EntityService } from '../entity/entity.service';

@Component({
  selector: 'app-search',
  styleUrls: ['./search.component.scss'],
  templateUrl: './search.component.html',
})
export class SearchComponent implements OnInit {
  way = '默认检索';
  menu: any = signal('知识');

  keyword = '';
  size = 10;
  index = 1;
  entities!: any;
  images!: any;
  videos!: any;
  query: any = {};
  types: any;
  tags: any;
  tag: any;
  data = signal(['知识', '图片', '视频', '文件']);

  constructor(
    private service: EsService,
    private ontologyService: OntologyService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public propertyService: PropertyService,
    private entityService: EntityService,
    private dialogSewrvice: XDialogService
  ) {}

  ngOnInit(): void {
    this.service
      .searchEntity(this.index, this.size, {})
      .subscribe((data: any) => {
        this.images = [];
        this.videos = [];

        data.list.forEach((item: any) => {
          item._source.images.forEach((image: any) => {
            if (
              image.split('.')[image.split('.').length - 1] == 'mp4'
            ) {
              this.videos.push(image);
            }
            if (
              image.split('.')[image.split('.').length - 1] != 'mp4' &&
              image.split('.')[image.split('.').length - 1] != 'pdf'
            ) {
              this.images.push(image);
            }
          });
          this.ontologyService.get(item._source.type).subscribe((t: any) => {
            item._type = t.label;
            this.ontologyService
              .getAllParentIds(item['_source'].type)
              .subscribe((parents: any) => {
                parents.push(item['_source'].type);
                this.propertyService
                  .getList(1, 100, {
                    filter: [
                      {
                        field: 'id',
                        value: parents as string[],
                        relation: 'schemas',
                        operation: 'IN',
                      },
                      { field: 'isPrimary', value: true, operation: '=' },
                    ],
                  })
                  .subscribe((p: any) => {
                    console.log(p.list);
                    this.entityService
                      .getLinks(1, 100, item['_id'], {})
                      .subscribe((c: any) => {
                        console.log(c);
                        let statements: any = [];
                        c.list.forEach((path: any) => {
                          console.log(path);
                          if (path.edges[0]['_from'] != path.edges[0]['_to']) {
                            path.edges[0].mainsnak.datavalue.value.id =
                              path?.vertices[1]?.id;
                            path.edges[0].mainsnak.datavalue.value.label =
                              path?.vertices[1]?.labels?.zh?.value;
                          }
                          if (
                            p.list?.filter(
                              (property: any) =>
                                path.edges[0].mainsnak.property ==
                                `P${property.id}`
                            ).length > 0
                          ) {
                            statements.push(path.edges[0]);
                          }
                        });
                        item.claims = statements;
                      });
                  });
              });
          });
        });
        this.entities = data.list;
        let menu: any = [];
        let arr: any = [];
        console.log(data.total);
        let tags: any = [];
        data.tags.forEach((t: any) => {
          tags.push(t.key);
        });
        this.tags = signal(tags);
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
          this.types = signal(menuMerge);
          console.log(menuMerge);
        });
      });
  }

  selectMenu(menu: any) {
    console.log(menu.label);
    this.menu = signal(menu.label);
  }

  search(keyword: any) {
    this.index = 1;
    if (keyword != '') {
      if (this.way == '默认检索') {
        this.query = {
          must: [
            {
              match: {
                'labels.zh.value': {
                  query: keyword,
                  operator: 'and',
                },
              },
            },
          ],
        };
      } else if (this.way == '精确检索') {
        this.query = {
          should: [{ term: { 'labels.zh.value.keyword': keyword } }],
        };
      } else {
        this.query = { must: [{ match: { 'labels.zh.value': keyword } }] };
      }
    } else {
      this.query = {};
    }
    this.service
      .searchEntity(this.index, this.size, this.query)
      .subscribe((data: any) => {
        this.images = [];
        this.videos = [];
        data.list.forEach((item: any) => {
          item._source.images.forEach((image: any) => {
            if (
              image.split('.')[image.split('.').length - 1] == 'mp4'
            ) {
              this.videos.push(image);
            }
            if (
              image.split('.')[image.split('.').length - 1] != 'mp4' &&
              image.split('.')[image.split('.').length - 1] != 'pdf'
            ) {
              this.images.push(image);
            }
          });
          this.ontologyService.get(item._source.type).subscribe((t: any) => {
            item._type = t.label;
            this.ontologyService
              .getAllParentIds(item['_source'].type)
              .subscribe((parents: any) => {
                parents.push(item['_source'].type);
                this.propertyService
                  .getList(1, 50, {
                    filter: [
                      {
                        field: 'id',
                        value: parents as string[],
                        relation: 'schemas',
                        operation: 'IN',
                      },
                      { field: 'isPrimary', value: true, operation: '=' },
                    ],
                  })
                  .subscribe((p: any) => {
                    this.entityService
                      .getLinks(1, 20, item['_id'], {})
                      .subscribe((c: any) => {
                        let statements: any = [];
                        c.list.forEach((path: any) => {
                          if (path.edges[0]['_from'] != path.edges[0]['_to']) {
                            console.log(path);
                            path.edges[0].mainsnak.datavalue.value.id =
                              path?.vertices[1]?.id;
                            path.edges[0].mainsnak.datavalue.value.label =
                              path?.vertices[1]?.labels?.zh?.value;
                          }
                          if (
                            p.list?.filter(
                              (property: any) =>
                                path.edges[0].mainsnak.property ==
                                `P${property.id}`
                            ).length > 0
                          ) {
                            statements.push(path.edges[0]);
                          }
                        });
                        item.claims = statements;
                        console.log(item);
                      });
                  });
              });
          });
        });
        this.entities = data.list;
        let tags: any = [];
        data.tags.forEach((t: any) => {
          tags.push(t.key);
        });
        this.tags = signal(tags);
      });
  }

  selectTag(tag: any) {
    this.index = 1;
    if (tag.length > 0) {
      let values: any = [];
      tag.forEach((t: any) => {
        values.push({ term: { 'tags.keyword': t } });
      });
      this.query = { must: values };
    } else {
      this.query = {};
    }
    this.service
      .searchEntity(this.index, this.size, this.query)
      .subscribe((data: any) => {
        console.log(data);
        this.images = [];
        this.videos = [];
        data.list.forEach((item: any) => {
          item._source.images.forEach((image: any) => {
            if (
              image.split('.')[image.split('.').length - 1] == 'mp4'
            ) {
              this.videos.push(image);
            }
            if (
              image.split('.')[image.split('.').length - 1] != 'mp4' &&
              image.split('.')[image.split('.').length - 1] != 'pdf'
            ) {
              this.images.push(image);
            }
          });
          this.ontologyService.get(item._source.type).subscribe((t: any) => {
            console.log(t);
            item._type = t.label;
            this.ontologyService
              .getAllParentIds(item['_source'].type)
              .subscribe((parents: any) => {
                parents.push(item['_source'].type);
                this.propertyService
                  .getList(1, 50, {
                    filter: [
                      {
                        field: 'id',
                        value: parents as string[],
                        relation: 'schemas',
                        operation: 'IN',
                      },
                      { field: 'isPrimary', value: true, operation: '=' },
                    ],
                  })
                  .subscribe((p: any) => {
                    this.entityService
                      .getLinks(1, 20, item['_id'], {})
                      .subscribe((c: any) => {
                        let statements: any = [];
                        c.list.forEach((path: any) => {
                          if (path.edges[0]['_from'] != path.edges[0]['_to']) {
                            console.log(path);
                            path.edges[0].mainsnak.datavalue.value.id =
                              path?.vertices[1]?.id;
                            path.edges[0].mainsnak.datavalue.value.label =
                              path?.vertices[1]?.labels?.zh?.value;
                          }
                          if (
                            p.list?.filter(
                              (property: any) =>
                                path.edges[0].mainsnak.property ==
                                `P${property.id}`
                            ).length > 0
                          ) {
                            statements.push(path.edges[0]);
                          }
                        });
                        item.claims = statements;
                      });
                  });
              });
          });
        });
        this.entities = data.list;
        let tags: any = [];
        data.tags.forEach((t: any) => {
          tags.push(t.key);
        });
        this.tags = signal(tags);
      });
  }

  selectType(type: any) {
    this.index = 1;
    if (type.id) {
      this.query = { must: [{ term: { 'type.keyword': type.id } }] };
    } else {
      this.query = {};
    }
    this.service
      .searchEntity(this.index, this.size, this.query)
      .subscribe((data: any) => {
        console.log(data);
        this.images = [];
        this.videos = [];
        data.list.forEach((item: any) => {
          item._source.images.forEach((image: any) => {
            if (
              image.split('.')[image.split('.').length - 1] == 'mp4'
            ) {
              this.videos.push(image);
            }
            if (
              image.split('.')[image.split('.').length - 1] != 'mp4' &&
              image.split('.')[image.split('.').length - 1] != 'pdf'
            ) {
              this.images.push(image);
            }
          });
          this.ontologyService.get(item._source.type).subscribe((t: any) => {
            console.log(t);
            item._type = t.label;
            this.ontologyService
              .getAllParentIds(item['_source'].type)
              .subscribe((parents: any) => {
                parents.push(item['_source'].type);
                this.propertyService
                  .getList(1, 50, {
                    filter: [
                      {
                        field: 'id',
                        value: parents as string[],
                        relation: 'schemas',
                        operation: 'IN',
                      },
                      { field: 'isPrimary', value: true, operation: '=' },
                    ],
                  })
                  .subscribe((p: any) => {
                    this.entityService
                      .getLinks(1, 20, item['_id'], {})
                      .subscribe((c: any) => {
                        let statements: any = [];
                        c.list.forEach((path: any) => {
                          if (path.edges[0]['_from'] != path.edges[0]['_to']) {
                            console.log(path);
                            path.edges[0].mainsnak.datavalue.value.id =
                              path?.vertices[1]?.id;
                            path.edges[0].mainsnak.datavalue.value.label =
                              path?.vertices[1]?.labels?.zh?.value;
                          }
                          if (
                            p.list?.filter(
                              (property: any) =>
                                path.edges[0].mainsnak.property ==
                                `P${property.id}`
                            ).length > 0
                          ) {
                            statements.push(path.edges[0]);
                          }
                        });
                        item.claims = statements;
                      });
                  });
              });
          });
        });
        this.entities = data.list;
        let tags: any = [];
        data.tags.forEach((t: any) => {
          tags.push(t.key);
        });
        this.tags = signal(tags);
      });
  }

  action(type: string, item?: any) {
    console.log(item);

    switch (type) {
      case 'info':
        this.router
          .navigate([`/index/search/${type}/${item._id}`], {
            relativeTo: this.activatedRoute,
          })
          .then(() => {});
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
          src: 'http://localhost:9000/kgms/' + image,
        },
      ],
    });
  }

  onScroll() {
    this.index++;
    console.log(this.index);
    this.service
      .searchEntity(this.index, this.size, this.query)
      .subscribe((data: any) => {
        console.log(data);

        data.list.forEach((item: any) => {
          item._source.images.forEach((image: any) => {
            if (
              image.split('.')[image.split('.').length - 1] == 'mp4'
            ) {
              this.videos.push(image);
            }
            if (
              image.split('.')[image.split('.').length - 1] != 'mp4' &&
              image.split('.')[image.split('.').length - 1] != 'pdf'
            ) {
              this.images.push(image);
            }
          });
          this.ontologyService.get(item._source.type).subscribe((t: any) => {
            item._type = t.label;
            this.ontologyService
              .getAllParentIds(item['_source'].type)
              .subscribe((parents: any) => {
                parents.push(item['_source'].type);
                this.propertyService
                  .getList(1, 50, {
                    filter: [
                      {
                        field: 'id',
                        value: parents as string[],
                        relation: 'schemas',
                        operation: 'IN',
                      },
                      { field: 'isPrimary', value: true, operation: '=' },
                    ],
                  })
                  .subscribe((p: any) => {
                    this.entityService
                      .getLinks(1, 20, item['_id'], {})
                      .subscribe((c: any) => {
                        let statements: any = [];
                        c.list.forEach((path: any) => {
                          if (path.edges[0]['_from'] != path.edges[0]['_to']) {
                            console.log(path);
                            path.edges[0].mainsnak.datavalue.value.id =
                              path?.vertices[1]?.id;
                            path.edges[0].mainsnak.datavalue.value.label =
                              path?.vertices[1]?.labels?.zh?.value;
                          }
                          if (
                            p.list?.filter(
                              (property: any) =>
                                path.edges[0].mainsnak.property ==
                                `P${property.id}`
                            ).length > 0
                          ) {
                            statements.push(path.edges[0]);
                          }
                        });
                        item.claims = statements;
                        console.log(item);
                      });
                  });
              });
          });
        });
        if (data.list.length > 0) {
          data.list.forEach((d: any) => {
            this.entities.push(d);
          });
        }

        console.log(this.entities);
      });
  }
}
