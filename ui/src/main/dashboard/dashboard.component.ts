import { Component, ElementRef, OnDestroy, OnInit, Query, TemplateRef, ViewChild, signal, viewChild } from '@angular/core';


import { EntityService } from '../entity/entity.service';
import { Observable } from 'rxjs';
import { EsService } from '../search/es.service';

import cytoscape from 'cytoscape';
import cxtmenu from 'cytoscape-cxtmenu';
import cola from 'cytoscape-cola';
import edgehandles from 'cytoscape-edgehandles';

import { XDialogRef, XDialogService, XMessageBoxAction, XMessageBoxService, XMessageService, XPlace } from '@ng-nest/ui';
import { EntityDetailComponent } from './entity-detail/entity-detail.component';
import { animate, animation } from '@angular/animations';
import { OntologyService } from '../ontology/ontology/ontology.service';
import { PropertyService } from '../ontology/property/property.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],

})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('cy', { static: true }) cyContainer!: ElementRef;
  contentTpl = viewChild.required<TemplateRef<void>>('contentTpl');
  properties: any;
  propertyData: any;
  model1: any;
  keyword = '';
  way = '默认检索';
  cy: any;
  visible = signal(false);
  placement = signal<XPlace>('center');
  id: any;
  data: any;
  type: any;
  dialog(data: any, type: any, place: XPlace) {
    this.dialogService.create(EntityDetailComponent, {
      placement: place, // 默认center
      data: { id: data.id, type: type, cy: this.cy },
    });
  }


  close() {
    this.visible.set(false);
  }

  evt(type: string) {
    this.id = null;
    this.type = null;

  }

  constructor(private service: EntityService,
    private ontologyService: OntologyService,
    public propertyService: PropertyService,
    private esService: EsService,
    private message: XMessageService,
    private dialogService: XDialogService,
    private msgBox: XMessageBoxService,
  ) {

  }

  ngOnInit(): void {
    this.esService.searchEntity(1, 1, {}).subscribe((data: any) => {
      this.service.graph(1, 100, data.list[0]._id).subscribe((data: any) => {
        cytoscape.use(cxtmenu);
        cytoscape.use(cola); // register extension
        cytoscape.use(edgehandles);

        console.log(data)
        this.cy = cytoscape({
          container: this.cyContainer.nativeElement, // container to render in
          elements: data.elements,
          style: [ // the stylesheet for the graph
            {
              selector: 'node',
              style: {
                'border-color': '#ffffff',
                'border-width': 2,
                'background-image': 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg width="1792" height="1792" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1536 1399q0 109-62.5 187t-150.5 78h-854q-88 0-150.5-78t-62.5-187q0-85 8.5-160.5t31.5-152 58.5-131 94-89 134.5-34.5q131 128 313 128t313-128q76 0 134.5 34.5t94 89 58.5 131 31.5 152 8.5 160.5zm-256-887q0 159-112.5 271.5t-271.5 112.5-271.5-112.5-112.5-271.5 112.5-271.5 271.5-112.5 271.5 112.5 112.5 271.5z" fill="#fff"/></svg>`),
                'background-width': '60%',
                'background-height': '60%',
                'color': '#333333',
                'label': 'data(label)',
                'text-valign': 'bottom',
                'text-margin-y': 6,
                'text-background-color': '#ffffff',
                'text-background-opacity': 0.5,
              }
            },
            {
              selector: 'node.hover',
              style: {
                'border-color': '#000000',
                'text-background-color': '#eeeeee',
                'text-background-opacity': 1
              }
            },
            {
              selector: 'node:selected',
              style: {
                'border-color': '#ff0000',
                'border-width': 6,
                'border-opacity': 0.5
              }
            },
            {
              selector: 'edge',
              style: {
                'width': 0.4,
                'line-color': '#ccc',
                'target-arrow-color': '#ccc',
                'target-arrow-shape': 'triangle',
                'curve-style': 'bezier',
                "text-opacity": 1,
                "overlay-opacity": 0,
                'arrow-scale': 0.3,
                'color': '#aaa',
                'label': 'data(label)',
                'font-size': '6px',
                'control-point-weight': 0.5,
                'control-point-distance': 30,
              }
            },
            {
              selector: 'edge.hover',
              style: {
                'line-color': '#999999'
              }
            },
            // edgehandles
            {
              selector: '.eh-handle',
              style: {
                'background-color': 'red',
                'background-image': [],
                'width': 12,
                'height': 12,
                'shape': 'ellipse',
                'overlay-opacity': 0,
                'border-width': 12,
                'border-opacity': 0,
                'label': ''
              }
            },
            {
              selector: '.eh-hover',
              style: {
                'background-color': 'red'
              }
            },
            {
              selector: '.eh-source',
              style: {
                'border-width': 2,
                'border-color': 'red'
              }
            },
            {
              selector: '.eh-target',
              style: {
                'border-width': 2,
                'border-color': 'red'
              }
            },
            {
              selector: '.eh-preview, .eh-ghost-edge',
              style: {
                'background-color': 'red',
                'line-color': 'red',
                'target-arrow-color': 'red',
                'source-arrow-color': 'red',
              }
            },
            {
              selector: '.eh-ghost-edge.eh-preview-active',
              style: {
                'opacity': 0
              }
            }
          ],

          layout: {
            name: 'cose',
            animate: false,
          },
        });
        var eh = this.cy.edgehandles();
        this.cy.cxtmenu({
          selector: 'node',

          commands: [
            {
              content: '浏览',
              select: (ele: any) => {
                console.log(ele.data());
                console.log('浏览知识');
                this.dialog(ele.data(), 'info', 'center')
              }
            },

            {
              content: '编辑',
              select: (ele: any) => {
                console.log(ele.id());
                console.log('编辑知识');
                this.dialog(ele.data(), 'edit', 'center')
              },
            },
            {
              content: '连接',
              select: (ele: any) => {
                console.log(ele.id());
                console.log('连接知识');
                eh.start(ele);
              },
            },
            {
              content: '删除',
              select: (ele: any) => {
                console.log(ele.position());
                this.msgBox.alert({
                  title: '删除弹框',
                  content: '知识删除',
                  placement: 'center',
                  callback: (action: XMessageBoxAction) => {
                    console.log(ele.data());
                    this.service.deleteItem(ele.data()['id']).subscribe(() => {
                      ele.remove()
                      this.message.success('删除成功！');
                    });
                  }
                });
              }
            }
          ]
        });
        this.cy.cxtmenu({
          selector: 'edge',
          commands: [
            {
              content: '编辑',
              select: (ele: any) => {
                console.log(ele.id());
                console.log('编辑知识');
                this.dialog(ele.data(), '', 'center')
              },
            },
            {
              content: '删除',
              select: (ele: any) => {
                console.log(ele.position());
                this.msgBox.alert({
                  title: '删除弹框',
                  content: '这是一段内容',
                  placement: 'center',
                  callback: (action: XMessageBoxAction) => { }
                });
              }
            }
          ]
        });

        this.cy.cxtmenu({
          selector: 'core',
          commands: [
            {
              content: '创建知识',
              select: (ele: any) => {
                console.log(ele);
                console.log('创建知识');
                this.dialog(ele.data(), 'add', 'center')
              }
            },
          ]
        });


        var doubleClickDelayMs = 350;
        var previousTapStamp: any;
        this.cy.on('tap', (ele: any) => {
          var currentTapStamp = ele.timeStamp;
          var msFromLastTap = currentTapStamp - previousTapStamp;
          if (msFromLastTap < doubleClickDelayMs) {
            ele.target.trigger('doubleTap', ele);
          }
          previousTapStamp = currentTapStamp;
        })
        this.cy.on('doubleTap', (ele: any) => {
          var target: any = ele.target;
          if (target == this.cy) {
            console.log("双击空白处")
            console.log(this.cy.nodes())

          } else if (target.isNode()) {
            console.log("双击节点")
            console.log(target.data())
            this.service.graph(1, 100, target.data().id).subscribe((data: any) => {
              this.initializeCytoscape(data);
            })
          } else if (target.isEdge()) {
            console.log("双击边")
          }
        })


        this.cy.on('ehcomplete', (event: any, sourceNode: any, targetNode: any, addedEdge: any) => {


          this.esService.getEntity(sourceNode.data().id).subscribe((x: any) => {
            console.log(x['_source'].type)
            this.ontologyService.get(x._source.type).subscribe((type: any) => {
              this.ontologyService.getAllParentIds(x._source.type).subscribe((parents: any) => {
                parents.push(x._source.type)

                this.propertyService.getList(1, 50, { filter: [{ field: 'id', value: parents as string[], relation: 'schemas', operation: 'IN' }] }).subscribe((x: any) => {
                  this.propertyData = signal(x.list.filter((p: any) => p.type == 'wikibase-item'));
                  this.properties = signal(x.list.filter((p: any) => p.type == 'wikibase-item').map((p: any) => p.name)
                  )
                });
              });
            });

          })

          this.msgBox.alert({
            title: '选择关系',
            content: this.contentTpl(),
            backdropClose: true,
            callback: (action: XMessageBoxAction) => {
              console.log(this.model1)
              let property = this.propertyData().filter((p: any) => p.name == this.model1)[0];
              console.log(property)


              let edge = {
                '_from': sourceNode.data()['_id'],
                '_to': targetNode.data()['_id'],
                "mainsnak": {
                  "snaktype": "value",
                  "property": `P${property.id}`,
                  "datavalue": {
                    "value": {
                      "entity-type": "item",
                      "numeric-id": Number.parseInt(targetNode.data()['_id'].split('/')[1].replace('Q', '')),
                      "id": targetNode.data()['_id'].split('/')[1]
                    },
                    "type": "wikibase-entityid"
                  },
                  "datatype": "wikibase-item"
                },
                "type": "statement",
                "rank": "normal"
              }

              this.service.addEdge(edge).subscribe((e: any) => {
                console.log(e)

              })


            }
          });
        });
      })
    });
  }

  initializeCytoscape(data: any): void {

    data.elements.nodes.forEach((node: any) => {
      if (this.cy.nodes().filter((n: any) => n.data().id == node.data.id).length == 0) {
        this.cy.add(node);
      }
    })
    data.elements.edges.forEach((edge: any) => {
      if (this.cy.edges().filter((e: any) => e.data().source == edge.data.source && e.data().target == edge.data.target).length == 0) {
        this.cy.add(edge);
      }
    });
    this.cy.layout({
      name: 'cola',
      animate: true,
    }).run();
  }


  search(keyword: any) {
    let query = {}
    if (keyword != '') {
      if (this.way == '默认检索') {
        query = {
          "must": [{
            "match": {
              "labels.zh.value": {
                "query": keyword,
                "operator": "and"
              }
            }
          }]
        }

      } else if (this.way == '精确检索') {
        query = { "should": [{ "term": { "labels.zh.value.keyword": keyword } }] }

      } else {
        query = { "must": [{ "match": { "labels.zh.value": keyword } }] }
      }
    }
    this.esService.searchEntity(1, 10, query).subscribe((data: any) => {
    })
  }
  modelAsync = signal('');
  dataAsync = signal(
    (str: string) =>
      new Observable<string[]>((x) => {
        // 替换成http请求
        let query = {}
        if (str != '') {
          if (this.way == '默认检索') {
            query = {
              "must": [{
                "match": {
                  "labels.zh.value": {
                    "query": str,
                    "operator": "and"
                  }
                }
              }]
            }
          } else if (this.way == '精确检索') {
            query = { "should": [{ "term": { "labels.zh.value.keyword": str } }] }
          } else {
            query = { "must": [{ "match": { "labels.zh.value": str } }] }
          }
        }
        this.esService.searchEntity(1, 10, query).subscribe((data: any) => {
          x.next(data.list);
          x.complete();
        })
      })
  );

  selectNode(node: any) {
    console.log(node)
    this.modelAsync = signal(node?._source?.labels.zh.value);
    this.service.graph(1, 10, node?._id).subscribe((data: any) => {
      this.initializeCytoscape(data);
    })
  }


  ngOnDestroy(): void {
    throw new Error('Method not implemented.');
  }
}