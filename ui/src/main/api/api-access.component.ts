import { Component, OnInit, signal, effect, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { XMessageService } from '@ng-nest/ui/message';
import { XTreeNode } from '@ng-nest/ui/tree';
declare const monaco: any;

type InterfaceType = 'REST' | 'SPARQL';

interface FieldMapping {
  [key: string]: {
    role: 'id' | 'attr' | 'ignore';
    type: string;
  };
}

interface DataInterface {
  interfaceName: string;
  type: InterfaceType;
  url: string;
  query?: string;
  method: string;
  fieldMapping: FieldMapping;
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

  constructor(private fb: FormBuilder, private message: XMessageService) {
    this.interfaceForm = this.fb.group({
      interfaceName: ['', [Validators.required]],
      type: ['REST', [Validators.required]],
      url: ['', [Validators.required]],
      query: [''],
      method: ['GET', [Validators.required]],
    });

    // effect() 必须放在构造函数中
    effect(() => {
      if (this.isCreating() || this.isEditing()) {
        const type = this.interfaceForm.get('type')?.value;
        if (type === 'SPARQL') {
          this.interfaceForm.get('query')?.setValidators([Validators.required]);
        } else {
          this.interfaceForm.get('query')?.clearValidators();
        }
        this.interfaceForm.get('query')?.updateValueAndValidity();
      }
    });
  }

  ngOnInit(): void {
    this.setSampleInterfaces();
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

  // 优化：从树结构样例生成 interfaces 列表和 treeData
  private setSampleInterfaces() {
    const flatList: DataInterface[] = [];
    let flatIndex = 0;
    const walk = (nodes: any) => {
      for (const node of nodes) {
        if (node.leaf && node.data) {
          flatList.push({
            interfaceName: node.title,
            type: node.data.type,
            url: node.data.url,
            query: node.data.query,
            method: node.data.method,
            fieldMapping: node.data.fieldMapping,
          });
          // 给节点加 _flatIndex 便于选中
          node.data._flatIndex = flatIndex++;
        }
        if (node.children) walk(node.children);
      }
    };
    walk(this.sampleTreeData);
    this.interfaces.set(flatList);
    // 直接用样例树结构作为 treeData
    this.treeData = JSON.parse(JSON.stringify(this.sampleTreeData));
    this.expandedKeys = this.treeData.map((g) => g.id as string);
    if (this.selectedIdx() !== null) {
      this.selectedTreeKeys = ['iface-' + this.selectedIdx()];
    } else {
      this.selectedTreeKeys = [];
    }
  }

  // 构建x-tree数据
  buildTreeData() {
    const list = this.interfaces();
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
    for (const iface of list) {
      const node: XTreeNode = {
        id: 'iface-' + flatIndex,
        title: iface.interfaceName,
        leaf: true,
        data: { ...iface, _flatIndex: flatIndex },
      };
      groups[iface.type].children!.push(node);
      flatIndex++;
    }
    this.treeData = Object.values(groups).filter(
      (g) => g.children && g.children.length > 0
    );
    this.expandedKeys = this.treeData.map((g) => g.id as string);
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
    this.isCreating.set(true);
    this.isEditing.set(false);
    this.selectedIdx.set(null);
    this.interfaceForm.reset({ type: 'REST', method: 'GET' });
    this.selectedTreeKeys = [];
  }

  editInterface(idx: number) {
    this.selectedIdx.set(idx);
    this.isEditing.set(true);
    this.isCreating.set(false);
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
    if (!confirm('确认删除该接口？')) return;
    const arr = [...this.interfaces()];
    arr.splice(idx, 1);
    this.interfaces.set(arr);
    this.buildTreeData();
    if (this.selectedIdx() === idx) {
      this.selectedIdx.set(null);
      this.isEditing.set(false);
    }
  }

  saveInterface() {
    if (this.interfaceForm.invalid) {
      Object.values(this.interfaceForm.controls).forEach((c) =>
        c.markAsTouched()
      );
      this.message.warning('请完善接口信息');
      return;
    }
    const value = this.interfaceForm.value;
    if (this.isCreating()) {
      this.interfaces.set([
        ...this.interfaces(),
        {
          ...value,
          fieldMapping: {},
        },
      ]);
    } else if (this.isEditing() && this.selectedIdx() !== null) {
      const arr = [...this.interfaces()];
      arr[this.selectedIdx()!] = {
        ...arr[this.selectedIdx()!],
        ...value,
      };
      this.interfaces.set(arr);
    }
    this.isCreating.set(false);
    this.isEditing.set(false);
    this.selectedIdx.set(null);
    this.buildTreeData();
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
    this.loading.set(true);
    this.testError.set(null);
    const iface = this.interfaces()[idx];
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
      })
      .catch((e) => {
        this.testError.set('接口测试失败: ' + (e?.message || e));
        this.testData.set([]);
      })
      .finally(() => this.loading.set(false));
  }

  saveFieldMapping() {
    if (this.selectedIdx() === null) return;
    const arr = [...this.interfaces()];
    arr[this.selectedIdx()!] = {
      ...arr[this.selectedIdx()!],
      fieldMapping: this.fieldMapping(),
    };
    this.interfaces.set(arr);
    this.message.success('字段映射已保存');
  }

  closeTest() {
    this.isTesting.set(false);
    this.testData.set([]);
    this.testError.set(null);
  }

  // 新增：选中接口并进入编辑模式
  onSelectInterface(idx: number) {
    this.selectedIdx.set(idx);
    this.isEditing.set(true);
    this.isCreating.set(false);
    // 自动填充表单并触发Angular变更检测
    const iface = this.interfaces()[idx];
    setTimeout(() => {
      this.interfaceForm.setValue({
        interfaceName: iface.interfaceName,
        type: iface.type,
        url: iface.url,
        query: iface.query || '',
        method: iface.method,
      });
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
}
