import { Component, OnInit, signal } from '@angular/core';
import {
  XDialogService,
  XImagePreviewComponent,
} from '@ng-nest/ui';
import { EsService } from './es.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { OntologyService } from '../ontology/ontology/ontology.service';
import { PropertyService } from '../ontology/property/property.service';
import { EntityService } from '../entity/entity.service';
import { DomSanitizer } from '@angular/platform-browser';
import { TagService } from 'src/main/ontology/tag/tag.sevice';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-application',
  styleUrls: ['./application.component.scss'],
  templateUrl: './application.component.html',
})
export class ApplicationComponent implements OnInit {
  way = '默认检索';
  menu: any = signal('知识');

  keyword = '';
  size = 10;
  index = 1;
  entities: any;
  images!: any;
  videos!: any;
  pdfs!: any;

  query: any = {};
  types: any;
  type: any;
  tags: Map<string, Array<string>> | undefined;
  tag: any;
  data = signal(['知识', '图片', '视频', '文件']);
  category: any;



  constructor(
    private sanitizer: DomSanitizer,
    private service: EsService,
    private ontologyService: OntologyService,
    private router: Router,
    public tagService: TagService,
    private activatedRoute: ActivatedRoute,
    public propertyService: PropertyService,
    private entityService: EntityService,
    private dialogSewrvice: XDialogService
  ) {
  

  }

  ngOnInit(): void {
  // 获取路由参数
  this.activatedRoute.queryParamMap.subscribe((x: ParamMap) => {
    let id = x.get('id') as string;
    console.log(id)
    this.ontologyService
      .getAllParentIds(id)
      .subscribe((parents: any) => {
        parents.push(id);
        this.tagService
          .getList(1, 500, {
            filter: [
              {
                field: 'id',
                value: parents as string[],
                relation: 'schemas',
                operation: 'IN',
              },
            ],
          })
          .subscribe((data: any) => {
            let tags: any = {};
            data.list.forEach((tag: any) => {
              tags[tag.type] = tags[tag.type] ?? [];
              tags[tag.type].push(tag.name);
            });
            this.tags = tags;
          });
      });
    this.ontologyService
      .getChildren(id).subscribe((data: any) => {
        console.log(data);
        let menu: any = [];
        data.forEach((d: any) => {
          if (d.id != 'E1') {
            if (d.pid == id) {
              menu.push({ id: d.id, label: d.name, })
            } else {
              menu.push({ id: d.id, label: d.name, pid: d?.pid })
            }
          }
        })
        this.category = menu.map((m: any) => m.id);
        this.category.unshift(id)

        menu.unshift({ id: '', label: '全部' });
        this.types = signal(menu)
        this.search('');
      })
  });
  }

  selectMenu(menu: any) {
    this.entities = null;
    this.images = null;
    this.videos = null;
    this.pdfs = null;
    this.menu = signal(menu.label);
  }

  search(keyword: any) {
    this.keyword = keyword;
    this.index = 1;
    switch (this.menu()) {
      case '知识':
        if (keyword != '') {
          if (this.way == '默认检索') {
            this.query = {
              must: [
                {
                  "terms": {
                    "type": this.category
                  }
                },
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
          this.query = {
            must: [
              {
                terms: {
                  'type.keyword': this.category
                }
              },
            ]
          };
        }
        break;
      case '图片':
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
                }
              ],
              should: [
                { "wildcard": { "images": "*jpeg" } },
                { "wildcard": { "images": "*jpg" } },
                { "wildcard": { "images": "*jpeg" } },
                { "wildcard": { "images": "*png" } },
                { "wildcard": { "images": "*webp" } }],
            };
          } else if (this.way == '精确检索') {
            this.query = {
              must: [
                { term: { 'labels.zh.value.keyword': keyword } }
              ],
              should: [
                { "wildcard": { "images": "*jpeg" } },
                { "wildcard": { "images": "*jpg" } },
                { "wildcard": { "images": "*jpeg" } },
                { "wildcard": { "images": "*png" } },
                { "wildcard": { "images": "*webp" } }],
            };

          } else {
            this.query = {
              must: [{ match: { 'labels.zh.value': keyword } },],
              should: [
                { "wildcard": { "images": "*jpeg" } },
                { "wildcard": { "images": "*jpg" } },
                { "wildcard": { "images": "*jpeg" } },
                { "wildcard": { "images": "*png" } },
                { "wildcard": { "images": "*webp" } }],
            };
          }
        } else {
          this.query = {
            must: [
              {
                terms: {
                  'type.keyword': this.category
                }
              },
            ],
            should: [
              { "wildcard": { "images": "*jpeg" } },
              { "wildcard": { "images": "*jpg" } },
              { "wildcard": { "images": "*jpeg" } },
              { "wildcard": { "images": "*png" } },
              { "wildcard": { "images": "*webp" } }],
          };
        }
        break;
      case '视频':
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
                }
              ],
              should: [{ "wildcard": { "images": "*mp4" } }],
            };
          } else if (this.way == '精确检索') {
            this.query = {
              must: [
                { term: { 'labels.zh.value.keyword': keyword } }
              ],
              should: [{ "wildcard": { "images": "*mp4" } }],
            };

          } else {
            this.query = {
              must: [{ match: { 'labels.zh.value': keyword } },],
              should: [{ "wildcard": { "images": "*mp4" } }],
            };
          }
        } else {
          this.query = {
            must: [
              {
                terms: {
                  'type.keyword': this.category
                }
              },
            ],
            should: [{ "wildcard": { "images": "*mp4" } }],
          };
        }
        break;
      case '文件':
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
                }
              ],
              should: [{ "wildcard": { "images": "*pdf" } }],
            };
          } else if (this.way == '精确检索') {
            this.query = {
              must: [
                { term: { 'labels.zh.value.keyword': keyword } }
              ],
              should: [{ "wildcard": { "images": "*pdf" } }],
            };

          } else {
            this.query = {
              must: [{ match: { 'labels.zh.value': keyword } },],
              should: [{ "wildcard": { "images": "*pdf" } }],
            };
          }
        } else {
          this.query = {
            must: [
              {
                terms: {
                  'type.keyword': this.category
                }
              },
            ],
            should: [{ "wildcard": { "images": "*pdf" } }],
          };
        }
        break;
      default:
        this.query = {
          must: [
            {
              terms: {
                'type.keyword': this.category
              }
            },
          ],
        };
        break;
    }
    this.service
      .searchEntity(this.index, this.size, this.query)
      .subscribe((data: any) => {
        console.log(data);
        this.images = [];
        this.videos = [];
        this.pdfs = [];
        data.list.forEach((item: any) => {
          item?._source?.images?.forEach((image: any) => {
            if (
              image.split('.')[image.split('.').length - 1] == 'jpeg' ||
              image.split('.')[image.split('.').length - 1] == 'jpg' ||
              image.split('.')[image.split('.').length - 1] == 'png' ||
              image.split('.')[image.split('.').length - 1] == 'webp'
            ) {
              this.images.push({ _id: item._id, image: image, label: item?._source.labels.zh.value });
            }

            if (
              image.split('.')[image.split('.').length - 1] == 'mp4'
            ) {
              this.videos.push({ _id: item._id, image: image, label: item?._source.labels.zh.value });
            }

            if (
              image.split('.')[image.split('.').length - 1] == 'pdf'
            ) {
              this.pdfs.push({ _id: item._id, image: image, label: item?._source.labels.zh.value, description: item?._source.descriptions.zh.value });
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
        // let menu: any = [];
        // let arr: any = [];
        // data.types.forEach((m: any) => {
        //   arr.push(this.ontologyService.get(m.key));
        // });
        // forkJoin(arr).subscribe((properties: any) => {
        //   data.types.forEach((m: any) => {
        //     menu.push({
        //       id: m.key,
        //       label: properties.filter((p: any) => p.id == m.key)[0].name,
        //     });
        //   });
        //   let menuMerge = [];
        //   menuMerge = data.types.map((m: any, index: any) => {
        //     return { ...m, ...menu[index] };
        //   });
        //   menuMerge.forEach((m: any) => {
        //     m.label = m.label + '(' + m.doc_count + ')';
        //   });
        //   menuMerge.unshift({ id: '', label: '全部（' + data.total + ')' });
        //   this.types = menuMerge;
        //   console.log(menuMerge);
        // });
        // let tags: any = [];
        // data.tags.forEach((t: any) => {
        //   tags.push(t.key);
        // });
        // this.tags = tags;
      });
  }

  selectTag(tag: any) {
    if (this.type && this.type.id) {
      if (tag.length > 0) {
        let values: any = [];
        tag.forEach((t: any) => {
          values.push({ term: { 'tags.keyword': t } });
        })
        this.query = { must: [{ term: { 'type.keyword': this.type.id } }].concat(values) };
      } else {
        this.query = { must: [{ term: { 'type.keyword': this.type.id } }] };
      }
    } else {
      if (tag.length > 0) {
        let values: any = [];
        tag.forEach((t: any) => {
          values.push({ term: { 'tags.keyword': t } });
        })
        this.query = { must: values };
      } else {
        this.query = {};
      }

    }
    console.log(this.query)
    this.index = 1;
    this.service
      .searchEntity(this.index, this.size, this.query)
      .subscribe((data: any) => {
        console.log(data);

        this.images = [];
        this.videos = [];
        this.pdfs = [];
        data.list.forEach((item: any) => {
          item?._source?.images?.forEach((image: any) => {
            if (
              image.split('.')[image.split('.').length - 1] == 'jpeg' ||
              image.split('.')[image.split('.').length - 1] == 'jpg' ||
              image.split('.')[image.split('.').length - 1] == 'jpeg' ||
              image.split('.')[image.split('.').length - 1] == 'png' ||
              image.split('.')[image.split('.').length - 1] == 'webp'
            ) {
              this.images.push({ _id: item._id, image: image, label: item?._source.labels.zh.value });
            }

            if (
              image.split('.')[image.split('.').length - 1] == 'mp4'
            ) {
              this.videos.push({ _id: item._id, image: image, label: item?._source.labels.zh.value });
            }

            if (
              image.split('.')[image.split('.').length - 1] == 'pdf'
            ) {
              this.pdfs.push({ _id: item._id, image: image, label: item?._source.labels.zh.value, description: item?._source.descriptions.zh.value });
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
        this.tags = tags;
      });
  }

  selectType(type: any) {
    this.type = type;
    this.index = 1;
    switch (this.menu()) {
      case '知识':
        if (this.keyword != '') {
          if (this.way == '默认检索') {
            this.query = {
              must: [
                {
                  match: {
                    'labels.zh.value': {
                      query: this.keyword,
                      operator: 'and',
                    },
                  },
                },
                { term: { 'type.keyword': type.id } }
              ],
            };
          } else if (this.way == '精确检索') {
            this.query = {
              must: [{ term: { 'labels.zh.value.keyword': this.keyword } }, { term: { 'type.keyword': type.id } }],
            };
          } else {
            this.query = {
              must: [{ match: { 'labels.zh.value': this.keyword } }, { term: { 'type.keyword': type.id } }
              ]
            };
          }
        } else {
          if (type.id != '') {
            this.query = { must: [{ term: { 'type.keyword': type.id } }] };
          } else {
            this.query = {};
          }
        }
        break;
      case '图片':
        if (this.keyword != '') {
          if (this.way == '默认检索') {
            this.query = {
              must: [
                {
                  match: {
                    'labels.zh.value': {
                      query: this.keyword,
                      operator: 'and',
                    },
                  },
                },
                { term: { 'type.keyword': type.id } }
              ],
              should: [
                { "wildcard": { "images": "*jpeg" } },
                { "wildcard": { "images": "*jpg" } },
                { "wildcard": { "images": "*png" } },
                { "wildcard": { "images": "*webp" } }],
            };
          } else if (this.way == '精确检索') {
            this.query = {
              must: [
                { term: { 'labels.zh.value.keyword': this.keyword } },
                { term: { 'type.keyword': type.id } }
              ],
              should: [
                { "wildcard": { "images": "*jpeg" } },
                { "wildcard": { "images": "*jpg" } },
                { "wildcard": { "images": "*png" } },
                { "wildcard": { "images": "*webp" } }],
            };

          } else {
            this.query = {
              must: [{ match: { 'labels.zh.value': this.keyword } },
              { term: { 'type.keyword': type.id } }
              ],
              should: [
                { "wildcard": { "images": "*jpeg" } },
                { "wildcard": { "images": "*jpg" } },
                { "wildcard": { "images": "*png" } },
                { "wildcard": { "images": "*webp" } }],
            };
          }
        } else {
          if (type.id != '') {
            this.query = {
              must: [{ term: { 'type.keyword': type.id } }],
              should: [
                { "wildcard": { "images": "*jpeg" } },
                { "wildcard": { "images": "*jpg" } },
                { "wildcard": { "images": "*jpeg" } },
                { "wildcard": { "images": "*png" } },
                { "wildcard": { "images": "*webp" } }],
            };
          } else {
            this.query = {
              should: [
                { "wildcard": { "images": "*jpeg" } },
                { "wildcard": { "images": "*jpg" } },
                { "wildcard": { "images": "*jpeg" } },
                { "wildcard": { "images": "*png" } },
                { "wildcard": { "images": "*webp" } }]
            };
          }
        }
        break;
      case '视频':
        if (this.keyword != '') {
          if (this.way == '默认检索') {
            this.query = {
              must: [
                {
                  match: {
                    'labels.zh.value': {
                      query: this.keyword,
                      operator: 'and',
                    },
                  },
                },
                { term: { 'type.keyword': type.id } },
                { "wildcard": { "images": "*mp4" } }
              ],
            };
          } else if (this.way == '精确检索') {
            this.query = {
              must: [
                { term: { 'labels.zh.value.keyword': this.keyword } },
                { term: { 'type.keyword': type.id } },
                { "wildcard": { "images": "*mp4" } }
              ],
            };

          } else {
            this.query = {
              must: [{ match: { 'labels.zh.value': this.keyword } }, { term: { 'type.keyword': type.id } },
              { "wildcard": { "images": "*mp4" } }
              ],
            };
          }
        } else {
          if (type.id != '') {
            this.query = {
              must: [{ term: { 'type.keyword': type.id } }, { "wildcard": { "images": "*mp4" } }],

            };
          } else {
            this.query = {
              must: [{ "wildcard": { "images": "*mp4" } }],

            };
          }

        }
        break;
      case '文件':
        if (this.keyword != '') {
          if (this.way == '默认检索') {
            this.query = {
              must: [
                {
                  match: {
                    'labels.zh.value': {
                      query: this.keyword,
                      operator: 'and',
                    },
                  },
                }
              ],
              should: [{ "wildcard": { "images": "*pdf" } }],
            };
          } else if (this.way == '精确检索') {
            this.query = {
              must: [
                { term: { 'labels.zh.value.keyword': this.keyword } }
              ],
              should: [{ "wildcard": { "images": "*pdf" } }],
            };

          } else {
            this.query = {
              must: [{ match: { 'labels.zh.value': this.keyword } },],
              should: [{ "wildcard": { "images": "*pdf" } }],
            };
          }
        } else {

          if (type.id != '') {
            this.query = {
              must: [{ term: { 'type.keyword': type.id } }],
              should: [{ "wildcard": { "images": "*pdf" } }],

            };
          } else {
            this.query = {
              should: [{ "wildcard": { "images": "*pdf" } }],

            };
          }
        }
        break;
      default:
        this.query = {};
        break;
    }

    console.log(this.query);


    this.service
      .searchEntity(this.index, this.size, this.query)
      .subscribe((data: any) => {
        this.images = [];
        this.videos = [];
        this.pdfs = [];
        data.list.forEach((item: any) => {
          item?._source?.images?.forEach((image: any) => {
            if (
              image.split('.')[image.split('.').length - 1] == 'jpeg' ||
              image.split('.')[image.split('.').length - 1] == 'jpg' ||
              image.split('.')[image.split('.').length - 1] == 'jpeg' ||
              image.split('.')[image.split('.').length - 1] == 'png' ||
              image.split('.')[image.split('.').length - 1] == 'webp'
            ) {
              this.images.push({ _id: item._id, image: image, label: item?._source.labels.zh.value });
            }

            if (
              image.split('.')[image.split('.').length - 1] == 'mp4'
            ) {
              this.videos.push({ _id: item._id, image: image, label: item?._source.labels.zh.value });
            }

            if (
              image.split('.')[image.split('.').length - 1] == 'pdf'
            ) {
              this.pdfs.push({ _id: item._id, image: image, label: item?._source.labels.zh.value, description: item?._source.descriptions.zh.value });
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
          .then(() => { });
        break;
    }
  }

  trustUrl(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
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
        data.list.forEach((item: any) => {
          item?._source?.images?.forEach((image: any) => {
            if (
              image.split('.')[image.split('.').length - 1] == 'jpg' ||
              image.split('.')[image.split('.').length - 1] == 'jpeg' ||
              image.split('.')[image.split('.').length - 1] == 'png' ||
              image.split('.')[image.split('.').length - 1] == 'webp'
            ) {
              this.images.push({ _id: item._id, image: image, label: item?._source.labels.zh.value });
            }

            if (
              image.split('.')[image.split('.').length - 1] == 'mp4'
            ) {
              this.videos.push({ _id: item._id, image: image, label: item?._source.labels.zh.value });
            }

            if (
              image.split('.')[image.split('.').length - 1] == 'pdf'
            ) {
              this.pdfs.push({ _id: item._id, image: image, label: item?._source.labels.zh.value, description: item?._source.descriptions.zh.value });
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
      });
  }
}
