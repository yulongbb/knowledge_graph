import { Component, OnInit, signal, effect, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { XMessageService } from '@ng-nest/ui/message';
import { XTreeNode } from '@ng-nest/ui/tree';
import { ApiService, DataInterface } from './api.service';
declare const monaco: any;

type InterfaceType = 'REST' | 'SPARQL';

interface FieldMapping {
  [key: string]: {
    role: 'id' | 'attr' | 'ignore';
    type: string;
  };
}

@Component({
  selector: 'app-api-access',
  templateUrl: './api-access.component.html',
  styleUrls: ['./api-access.component.scss'],
})
export class ApiAccessComponent implements OnInit {
  interfaces = signal<DataInterface[]>([]);
  selectedIdx = signal<number | null>(null);
  isEditing = signal<boolean>(false);
  isCreating = signal<boolean>(false);
  isTesting = signal<boolean>(false);
  loading = signal<boolean>(false);

  testData = signal<any[]>([]);
  fieldMapping = signal<FieldMapping>({});
  testError = signal<string | null>(null);

  interfaceForm: FormGroup;

  interfaceTypes = [
    { label: 'REST API', value: 'REST' },
    { label: 'SPARQL', value: 'SPARQL' },
  ];

  methodOptions = [
    { label: 'GET', value: 'GET' },
    { label: 'POST', value: 'POST' },
  ];

  // 新增：树结构数据
  interfaceTree: any[] = [];
  // x-tree相关
  treeData: XTreeNode[] = [];
  expandedKeys: string[] = [];
  selectedTreeKeys: string[] = [];

  // 优化后的样例树结构数据
  sampleTreeData: XTreeNode[] = [
    {
      id: 'group-rest',
      title: 'REST API',
      expanded: true,
      children: [
        {
          id: 'iface-0',
          title: '用户REST接口',
          leaf: true,
          data: {
            interfaceName: '用户REST接口',
            type: 'REST',
            url: 'https://jsonplaceholder.typicode.com/users',
            method: 'GET',
            query: '',
            fieldMapping: {
              id: { role: 'id', type: 'number' },
              name: { role: 'attr', type: 'string' },
              email: { role: 'attr', type: 'string' },
              username: { role: 'attr', type: 'string' },
            },
          },
        },
        {
          id: 'iface-1',
          title: '示例-天气API',
          leaf: true,
          data: {
            interfaceName: '示例-天气API',
            type: 'REST',
            url: 'https://api.open-meteo.com/v1/forecast?latitude=35&longitude=139&hourly=temperature_2m',
            method: 'GET',
            query: '',
            fieldMapping: {
              latitude: { role: 'attr', type: 'number' },
              longitude: { role: 'attr', type: 'number' },
              hourly: { role: 'attr', type: 'object' },
            },
          },
        },
      ],
    },
    {
      id: 'group-sparql',
      title: 'SPARQL',
      expanded: true,
      children: [
        {
          id: 'iface-2',
          title: 'Wikidata-Person',
          leaf: true,
          data: {
            interfaceName: 'Wikidata-Person',
            type: 'SPARQL',
            url: 'https://query.wikidata.org/sparql',
            query:
              'SELECT ?person ?personLabel WHERE { ?person wdt:P31 wd:Q5. SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". } } LIMIT 10',
            method: 'GET',
            fieldMapping: {
              person: { role: 'id', type: 'string' },
              personLabel: { role: 'attr', type: 'string' },
            },
          },
        },
      ],
    },
  ];

  actions = signal(['编辑', '删除']);

  constructor(
    private fb: FormBuilder,
    private message: XMessageService,
    private apiService: ApiService // 注入ApiService
  ) {
    this.interfaceForm = this.fb.group({
      interfaceName: ['', [Validators.required]],
      type: ['REST', [Validators.required]],
      url: [''], // 默认空，后面根据类型设置
      query: [''],
      method: ['GET', [Validators.required]],
    });

    // effect() 必须放在构造函数中
    effect(() => {
      if (this.isCreating() || this.isEditing()) {
        const type = this.interfaceForm.get('type')?.value;
        if (type === 'SPARQL') {
          this.interfaceForm.get('query')?.setValidators([Validators.required]);
          this.interfaceForm.get('url')?.clearValidators();
          // SPARQL类型时自动填充默认url
          if (!this.interfaceForm.get('url')?.value) {
            this.interfaceForm.get('url')?.setValue('https://query.wikidata.org/sparql');
          }
        } else {
          this.interfaceForm.get('query')?.clearValidators();
          this.interfaceForm.get('url')?.setValidators([Validators.required]);
          // REST类型时清空url
          if (this.interfaceForm.get('url')?.value === 'https://query.wikidata.org/sparql') {
            this.interfaceForm.get('url')?.setValue('');
          }
        }
        this.interfaceForm.get('query')?.updateValueAndValidity();
        this.interfaceForm.get('url')?.updateValueAndValidity();
      }
    });
  }

  ngOnInit(): void {
    this.loadInterfaces();
    this.buildTreeData();
    this.registerSparqlLanguage();
    this.monacoOptions = {
      theme: 'vs-light',
      language: 'sparql',
      automaticLayout: true,
      fontSize: 15,
      minimap: { enabled: false },
      wordWrap: 'on',
      scrollBeyondLastLine: false,
      lineNumbers: 'on',
    };
  }

  // 加载接口列表
  loadInterfaces() {
    this.apiService.getList(1, 1000).subscribe({
      next: (res) => {
        this.interfaces.set(res.list || []);
        this.buildTreeData();
      },
      error: () => this.message.error('接口列表加载失败'),
    });
  }

  // 构建x-tree数据
  buildTreeData() {
    // 默认两个根节点
    const groups: { [type: string]: XTreeNode } = {
      REST: {
        id: 'REST',
        title: 'REST API',
        expanded: true,
        children: [],
      },
      SPARQL: {
        id: 'SPARQL',
        title: 'SPARQL',
        expanded: true,
        children: [],
      },
    };
    let flatIndex = 0;
    const list = this.interfaces();
    for (const iface of list) {
      const node: XTreeNode = {
        id: 'iface-' + flatIndex,
        title: iface.interfaceName,
        leaf: true,
        data: { ...iface, _flatIndex: flatIndex },
      };
      // 保证类型分组存在
      if (!groups[iface.type]) {
        groups[iface.type] = {
          id: iface.type,
          title: iface.type,
          expanded: true,
          children: [],
        };
      }
      groups[iface.type].children!.push(node);
      flatIndex++;
    }
    // 始终显示两个根节点
    this.treeData = Object.values(groups);
    this.expandedKeys = Object.keys(groups);
    // 保持选中
    if (this.selectedIdx() !== null) {
      this.selectedTreeKeys = ['iface-' + this.selectedIdx()];
    } else {
      this.selectedTreeKeys = [];
    }
  }

  // x-tree节点点击
  onTreeNodeClick(node: any) {
    if (node.leaf && node.data && typeof node.data._flatIndex === 'number') {
      this.onSelectInterface(node.data._flatIndex);
      this.selectedTreeKeys = [node.id as string];
    }
  }

  // 展开/收起分组
  toggleGroup(group: any) {
    group.expanded = !group.expanded;
  }

  // 数据接口管理相关
  addInterface() {
    this.onAddButtonClick(new MouseEvent('click'));
  }

  editInterface(idx: number) {
    const iface = this.interfaces()[idx];
    this.interfaceForm.reset({
      interfaceName: iface.interfaceName,
      type: iface.type,
      url: iface.url,
      query: iface.query || '',
      method: iface.method,
    });
  }

  deleteInterface(idx: number) {
    const iface = this.interfaces()[idx];
    if (!iface?.id) return;
    if (!confirm('确认删除该接口？')) return;
    this.apiService.delete(iface.id).subscribe({
      next: () => {
        this.message.success('删除成功');
        this.loadInterfaces();
        this.selectedIdx.set(null);
        this.isEditing.set(false);
      },
      error: () => this.message.error('删除失败'),
    });
  }

  saveInterface() {
    console.log(this.interfaceForm.value);
    if (this.interfaceForm.invalid) {
      Object.values(this.interfaceForm.controls).forEach((c) =>
        c.markAsTouched()
      );
      this.message.warning('请完善接口信息');
      return;
    }
    const value = this.interfaceForm.value;
    // 新增：如果有查询结果，存储到 resultData 字段
    const resultData = this.testData() && this.testData().length > 0 ? this.testData() : undefined;
    if (this.isCreating()) {
      this.apiService.post({ ...value, fieldMapping: {}, resultData }).subscribe({
        next: () => {
          this.message.success('新增成功');
          // this.isCreating.set(false); // 不关闭当前卡片
          this.loadInterfaces();
        },
        error: () => this.message.error('新增失败'),
      });
    } else if (this.isEditing() && this.selectedIdx() !== null) {
      const iface = this.interfaces()[this.selectedIdx()!];
      if (!iface?.id) return;
      this.apiService
        .put({ ...iface, ...value, resultData })
        .subscribe({
          next: () => {
            this.message.success('保存成功');
            // this.isEditing.set(false); // 不关闭当前卡片
            // this.selectedIdx.set(null);
            this.loadInterfaces();
          },
          error: () => this.message.error('保存失败'),
        });
    }
  }

  cancelEdit() {
    this.isCreating.set(false);
    this.isEditing.set(false);
    this.selectedIdx.set(null);
  }

  // 测试导入相关
  testInterface(idx: number) {
    this.selectedIdx.set(idx);
    this.isTesting.set(true);
    this.loading.set(true); // loading 开始
    this.testError.set(null);

    let iface: DataInterface;
    if (this.interfaceForm.get('type')?.value === 'SPARQL') {
      iface = {
        ...this.interfaceForm.value,
        query: this.interfaceForm.get('query')?.value
      };
    } else {
      // REST: 取当前表单内容
      iface = {
        ...this.interfaceForm.value
      };
    }

    console.log('测试接口:', iface);

    // 修正：REST类型点击Send按钮时也能请求接口并返回数据
    this.fetchData(iface)
      .then((data) => {
        this.testData.set(data);
        // 自动生成字段映射
        const keys = this.getFieldKeys(data);
        const mapping: FieldMapping = {};
        keys.forEach((k) => {
          mapping[k] = { role: 'attr', type: 'string' };
        });
        this.fieldMapping.set(
          iface.fieldMapping && Object.keys(iface.fieldMapping).length
            ? iface.fieldMapping
            : mapping
        );
        // 新增：同步保存查询结果到数据表
        if (this.isCreating()) {
          this.apiService.post({ ...this.interfaceForm.value, fieldMapping: mapping }).subscribe({
            next: (res) => {
              this.message.success('接口和查询结果已保存');
              this.loadInterfaces();
            },
            error: () => this.message.error('接口保存失败'),
          });
        }
      })
      .catch((e) => {
        this.testError.set('接口测试失败: ' + (e?.message || e));
        this.testData.set([]);
      })
      .finally(() => {
        this.loading.set(false); // loading 结束
      });
  }

  saveFieldMapping() {
    if (this.selectedIdx() === null) return;
    const iface = this.interfaces()[this.selectedIdx()!];
    if (!iface?.id) return;
    this.apiService
      .put({
        ...iface,
        fieldMapping: this.fieldMapping(),
      })
      .subscribe({
        next: () => this.message.success('字段映射已保存'),
        error: () => this.message.error('字段映射保存失败'),
      });
  }

  closeTest() {
    this.isTesting.set(false);
    this.testData.set([]);
    this.testError.set(null);
  }

  // 新增：编辑/查看时自动显示已保存的查询结果
  onSelectInterface(idx: number) {
    this.selectedIdx.set(idx);
    this.isEditing.set(true);
    this.isCreating.set(false);
    // 自动填充表单并触发Angular变更检测
    const iface: any = this.interfaces()[idx];
    setTimeout(() => {
      this.interfaceForm.setValue({
        interfaceName: iface.interfaceName,
        type: iface.type,
        url: iface.url,
        query: iface.query || '',
        method: iface.method,
      });
      // 如果有 resultData，自动显示到 testData
      if (iface.resultData && Array.isArray(iface.resultData) && iface.resultData.length > 0) {
        this.testData.set(iface.resultData);
        // 查询结果条数提示
        this.message.info(`查询结果共 ${iface.resultData.length} 条`);
      } else {
        this.testData.set([]);
      }
    });
    this.selectedTreeKeys = ['iface-' + idx];
  }

  // 工具方法
  async fetchData(iface: DataInterface): Promise<any[]> {
    if (iface.type === 'SPARQL') {
      const params = new URLSearchParams();
      params.append('query', iface.query || '');
      const res = await fetch(`${iface.url}?${params.toString()}`, {
        method: iface.method,
        headers: { Accept: 'application/sparql-results+json' },
      });
      const json = await res.json();
      const vars = json.head.vars;
      return json.results.bindings.map((item: any) => {
        const row: any = {};
        vars.forEach((v: string) => {
          row[v] = item[v]?.value || '';
        });
        return row;
      });
    } else {
      const res = await fetch(iface.url, { method: iface.method });
      const json = await res.json();
      return Array.isArray(json) ? json : [json];
    }
  }

  getFieldKeys(rows: any[]): string[] {
    if (!rows.length) return [];
    return Object.keys(rows[0]);
  }

  setFieldRole(key: string, role: 'id' | 'attr' | 'ignore') {
    const mapping = { ...this.fieldMapping() };
    mapping[key] = { ...mapping[key], role };
    this.fieldMapping.set(mapping);
  }

  setFieldType(key: string, type: string) {
    const mapping = { ...this.fieldMapping() };
    mapping[key] = { ...mapping[key], type };
    this.fieldMapping.set(mapping);
  }

  searchText = '';

  onSearchChange(value: string) {
    // 简单过滤treeData（只支持一级分组+接口节点）
    if (!value) {
      this.buildTreeData();
      return;
    }
    const keyword = value.trim().toLowerCase();
    const filtered = this.treeData
      .map((group) => {
        const children = (group.children || []).filter((node: any) =>
          node.title.toLowerCase().includes(keyword)
        );
        return { ...group, children };
      })
      .filter((g) => g.children && g.children.length > 0);
    this.treeData = filtered;
  }

  onBatchImport() {
    // TODO: 批量导入逻辑
    this.message.info('批量导入功能开发中');
  }

  onExport() {
    // TODO: 导出全部逻辑
    this.message.info('导出全部功能开发中');
  }

  apiEditTab = 'params';

  // Monaco 编辑器配置（如需集成）
  monacoOptions: any;
  registerSparqlLanguage() {
    if (
      !monaco.languages.getLanguages().some((lang: any) => lang.id === 'sparql')
    ) {
      monaco.languages.register({ id: 'sparql' });

      monaco.languages.setMonarchTokensProvider('sparql', {
        tokenizer: {
          root: [
            [
              /\b(PREFIX|SELECT|WHERE|FILTER|OPTIONAL|ORDER BY|LIMIT|OFFSET|DISTINCT|REDUCED|GRAPH|UNION|ASK|DESCRIBE|CONSTRUCT|FROM|NAMED|VALUES|BIND|SERVICE|MINUS|GROUP BY|HAVING|IN|NOT IN|EXISTS|NOT EXISTS|COUNT|SUM|AVG|MIN|MAX|STR|LANG|LANGMATCHES|DATATYPE|BOUND|IRI|URI|BNODE|RAND|ABS|CEIL|FLOOR|ROUND|CONCAT|STRLEN|UCASE|LCASE|ENCODE_FOR_URI|CONTAINS|STRSTARTS|STRENDS|STRBEFORE|STRAFTER|REPLACE|ISIRI|ISURI|ISBLANK|ISLITERAL|ISNUMERIC|REGEX|SUBSTR)\b/i,
              'keyword',
            ],
            [/\?[a-zA-Z_]\w*/, 'variable'],
            [/<[^>]*>/, 'string.uri'],
            [/".*?"/, 'string'],
            [/#[^\n]*/, 'comment'],
          ],
        },
      });
    }
  }

  // 新增：控制新增类型下拉菜单
  showAddTypeDropdown = signal<boolean>(false);

  // 新增：点击新增按钮，显示类型选择下拉
  onAddButtonClick(event: MouseEvent) {
    event.stopPropagation();
    this.showAddTypeDropdown.set(!this.showAddTypeDropdown());
  }

  // 新增：选择新增类型
  onSelectAddType(type: any) {
    this.showAddTypeDropdown.set(false);
    this.isCreating.set(true);
    this.isEditing.set(false);
    this.selectedIdx.set(null);
    this.interfaceForm.reset({
      type: type.value,
      method: 'GET',
      url: type.value === 'SPARQL' ? 'https://query.wikidata.org/sparql' : ''
    });
    this.selectedTreeKeys = [];
  }

  // SPARQL 卡片需要填写的信息字段
  sparqlFormFields = [
    {
      key: 'interfaceName',
      label: '接口名称',
      required: true,
      placeholder: '请输入接口名称'
    },
    {
      key: 'url',
      label: 'SPARQL Endpoint',
      required: true,
      placeholder: '请输入SPARQL服务地址'
    },
    {
      key: 'query',
      label: 'SPARQL 查询语句',
      required: true,
      placeholder: '请输入SPARQL查询'
    },
    {
      key: 'method',
      label: '请求方式',
      required: true,
      type: 'select',
      options: [
        { label: 'GET', value: 'GET' },
        { label: 'POST', value: 'POST' }
      ]
    }
  ];
}
