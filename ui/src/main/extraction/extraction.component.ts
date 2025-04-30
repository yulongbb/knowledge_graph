import { PageBase } from 'src/share/base/base-page';
import { Component, ElementRef, signal, ViewChild } from '@angular/core';
import { XMessageService } from '@ng-nest/ui/message';
import { IndexService } from 'src/layout/index/index.service';
import { XDialogService, XGuid, XMessageBoxAction, XMessageBoxService, XPlace, XQuery, XTableColumn } from '@ng-nest/ui';
import { ExtractionService } from './extraction.service';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, map, Observable, Subscription, tap } from 'rxjs';
import { PropertyService } from '../ontology/property/property.service';
import { EsService } from '../start/search/es.service';
import { EntityService } from 'src/main/entity/entity.service';
import { OntologyService } from 'src/main/ontology/ontology/ontology.service';
import { DatasetService } from '../dataset/dataset.sevice';
import { HttpClient } from '@angular/common/http';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-extraction',
  templateUrl: 'extraction.component.html',
  styleUrls: ['./extraction.component.scss'],
})
export class ExtractionComponent extends PageBase {
  grid: any;
  @ViewChild('datagridContainer', { static: true }) datagridContainer!: ElementRef;

  data = [];
  type: any;
  index = 1;
  keyword: any = '';
  query: any
  items: any = signal([]);
  activeTabIndex = 0;
  datasets = (index: number, size: number, query: any) =>
    this.datasetService.getList(index, size, query).pipe(
      map((x: any) => x.list)
    );
  dataset: any;

  latestJob: any = null;
  showProgress: any = false;
  isImporting = false;

  // Preview data and columns
  previewData: any[] = [];
  previewColumns: XTableColumn[] = [];

  private intervalId: any;
  private subscription: Subscription = new Subscription;

  // 批量编辑相关属性
  editMode = false;
  selectedCells: Array<{ rowIndex: number, columnIndex: number }> = [];
  hasSelection = false;
  clipboardContent: any = null;
  batchFillValue: string = '';
  lastSelectedCell: { rowIndex: number, columnIndex: number } | null = null;
  isSelecting = false;

  // 批处理任务相关
  batchTaskId: string | null = null;
  batchTask: any = null;
  isBatchProcessing = false;
  batchEntities: any[] = [];

  // 批处理任务选择器相关
  showBatchTaskSelector = true; // 默认始终显示批处理任务选择器
  batchTasks: any[] = [];
  selectedBatchTaskId: string | null = null;

  // 批处理任务状态和模板相关
  showNewBatchTaskDialog = false;
  newBatchTask: any = {
    name: '',
    description: '',
    type: 'entity-batch',
    entities: []
  };

  constructor(
    public override indexService: IndexService,
    private ontologyService: OntologyService,
    private datasetService: DatasetService,
    private service: ExtractionService,
    private propertyService: PropertyService,
    private esService: EsService,
    private nodeService: EntityService,
    private message: XMessageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private msgBox: XMessageBoxService,
    private dialogService: XDialogService,
    private http: HttpClient
  ) {
    super(indexService);

    // 检查是否有批处理任务ID传递过来
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['batchTaskId']) {
        this.batchTaskId = params['batchTaskId'];
        this.loadBatchTask();
      }
    });
  }

  ngOnInit(): void {
    this.setupGrid();
    // 如果没有批处理任务，则使用默认空表格并加载批处理任务列表
    if (!this.batchTaskId) {
      // 创建100行空白数据
      this.grid.data = this.generateDefaultData();
      // 加载批处理任务列表
      this.loadBatchTasks();
    }
  }

  // 初始化网格组件
  setupGrid() {
    this.grid = canvasDatagrid();
    this.grid.style.height = '700px';
    this.grid.style.width = '100%';
    this.grid.style.overflowX = 'auto';
    this.grid.style.whiteSpace = 'nowrap';

    // 固定基础字段列定义
    this.grid.columns = [
      { label: '名称', property: '名称', width: 150 },
      { label: '描述', property: '描述', width: 250 },
      { label: '别名', property: '别名', width: 150 },
      { label: '类型', property: '类型', width: 100 },
      { label: '标签', property: '标签', width: 150 },
      { label: '图片', property: '图片', width: 200 }
    ];

    // 绑定数据到网格，默认加载10条空数据
    this.grid.data = this.generateDefaultData();

    // 自定义上下文菜单
    this.grid.addEventListener('contextmenu', this.handleContextMenu.bind(this));

    // 添加单元格选择事件处理
    this.grid.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.grid.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.grid.addEventListener('mouseup', this.handleMouseUp.bind(this));

    // 键盘快捷键
    this.grid.addEventListener('keydown', this.handleKeyDown.bind(this));

    // this.optimizeGridStyles();
    this.datagridContainer.nativeElement.appendChild(this.grid);
  }

  // 处理上下文菜单
  handleContextMenu(e: any) {
    // 添加批量编辑相关菜单项
    if (this.editMode) {
      if (this.selectedCells.length > 0) {
        e.items.push({
          title: '复制选中',
          click: () => this.copySelection()
        });
        e.items.push({
          title: '粘贴',
          click: () => this.pasteSelection(),
          disabled: !this.clipboardContent
        });
        e.items.push({
          title: '清空选中',
          click: () => this.clearSelection()
        });
      }
    }

    e.items.push({
      title: '添加行',
      click: () => this.addCustomRows(1)
    });
    e.items.push({
      title: '添加列',
      click: () => this.addCustomColumn()
    });
  }

  // 处理鼠标按下事件
  handleMouseDown(e: any) {
    if (!this.editMode) return;

    // 获取点击的单元格位置
    const cell = this.grid.getCellAt(e.x, e.y);
    if (!cell || cell.rowIndex === undefined || cell.columnIndex === undefined) return;

    // 开始选择
    this.isSelecting = true;
    this.lastSelectedCell = { rowIndex: cell.rowIndex, columnIndex: cell.columnIndex };

    // 如果按住Ctrl键，则添加到当前选择
    if (!e.ctrlKey && !e.shiftKey) {
      this.selectedCells = [];
    }

    // 如果按住Shift键，则进行范围选择
    if (e.shiftKey && this.lastSelectedCell) {
      this.selectCellRange(this.lastSelectedCell, { rowIndex: cell.rowIndex, columnIndex: cell.columnIndex });
    } else {
      // 添加当前单元格到选择
      this.addCellToSelection(cell.rowIndex, cell.columnIndex);
    }

    this.updateSelectionStatus();
    this.highlightSelectedCells();
  }

  // 处理鼠标移动事件
  handleMouseMove(e: any) {
    if (!this.editMode || !this.isSelecting) return;

    // 获取当前鼠标位置下的单元格
    const cell = this.grid.getCellAt(e.x, e.y);
    if (!cell || cell.rowIndex === undefined || cell.columnIndex === undefined) return;

    // 如果拖动到不同的单元格，更新选择
    if (this.lastSelectedCell &&
      (cell.rowIndex !== this.lastSelectedCell.rowIndex ||
        cell.columnIndex !== this.lastSelectedCell.columnIndex)) {

      // 重置选择并选择范围
      if (!e.ctrlKey) {
        this.selectedCells = [];
      }

      this.selectCellRange(this.lastSelectedCell, { rowIndex: cell.rowIndex, columnIndex: cell.columnIndex });
      this.lastSelectedCell = { rowIndex: cell.rowIndex, columnIndex: cell.columnIndex };

      this.updateSelectionStatus();
      this.highlightSelectedCells();
    }
  }

  // 处理鼠标松开事件
  handleMouseUp() {
    this.isSelecting = false;
  }

  // 处理键盘按键事件
  handleKeyDown(e: any) {
    // Ctrl+C: 复制选择内容
    if (e.ctrlKey && e.key === 'c') {
      this.copySelection();
      e.preventDefault();
    }
    // Ctrl+V: 粘贴内容
    else if (e.ctrlKey && e.key === 'v') {
      this.pasteSelection();
      e.preventDefault();
    }
    // Delete: 清除选中单元格
    else if (e.key === 'Delete' && this.selectedCells.length > 0) {
      this.clearSelection();
      e.preventDefault();
    }
  }

  // 选择单元格范围
  selectCellRange(start: { rowIndex: number, columnIndex: number }, end: { rowIndex: number, columnIndex: number }) {
    const startRow = Math.min(start.rowIndex, end.rowIndex);
    const endRow = Math.max(start.rowIndex, end.rowIndex);
    const startCol = Math.min(start.columnIndex, end.columnIndex);
    const endCol = Math.max(start.columnIndex, end.columnIndex);

    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        this.addCellToSelection(row, col);
      }
    }
  }

  // 添加单元格到选择
  addCellToSelection(rowIndex: number, columnIndex: number) {
    // 检查是否已经在选择中
    const exists = this.selectedCells.some(
      cell => cell.rowIndex === rowIndex && cell.columnIndex === columnIndex
    );

    if (!exists) {
      this.selectedCells.push({ rowIndex, columnIndex });
    }
  }

  // 更新选择状态
  updateSelectionStatus() {
    this.hasSelection = this.selectedCells.length > 0;
  }

  // 突出显示选中的单元格
  highlightSelectedCells() {
    // 重置所有单元格样式
    this.grid.style.activeCellBackgroundColor = 'rgba(0, 105, 217, 0.2)';
    this.grid.style.activeCellBorderColor = '#0069d9';
    this.grid.style.activeCellBorderWidth = 1;

    // 设置选中单元格样式
    this.grid.draw();
  }

  // 切换批量编辑模式
  toggleEditMode() {
    this.editMode = !this.editMode;
    if (!this.editMode) {
      // 退出编辑模式时清除选择
      this.selectedCells = [];
      this.hasSelection = false;
      this.highlightSelectedCells();
    }
  }

  // 复制选中的单元格
  copySelection() {
    if (!this.hasSelection) return;

    const copyData: any = [];
    let minRow = Infinity;
    let minCol = Infinity;
    let maxRow = -1;
    let maxCol = -1;

    // 找到选择边界
    this.selectedCells.forEach(cell => {
      minRow = Math.min(minRow, cell.rowIndex);
      minCol = Math.min(minCol, cell.columnIndex);
      maxRow = Math.max(maxRow, cell.rowIndex);
      maxCol = Math.max(maxCol, cell.columnIndex);
    });

    // 创建二维数组存储选中数据
    for (let r = 0; r <= maxRow - minRow; r++) {
      copyData[r] = new Array(maxCol - minCol + 1).fill('');
    }

    // 填充选中数据
    this.selectedCells.forEach(cell => {
      const row = this.grid.data[cell.rowIndex];
      const col = this.grid.columns[cell.columnIndex];
      if (row && col) {
        const value = row[col.property] || '';
        const r = cell.rowIndex - minRow;
        const c = cell.columnIndex - minCol;
        if (copyData[r]) {
          copyData[r][c] = value;
        }
      }
    });

    this.clipboardContent = {
      data: copyData,
      width: maxCol - minCol + 1,
      height: maxRow - minRow + 1,
      originalSelection: [...this.selectedCells]
    };

    this.message.success('已复制选中内容');
  }

  // 粘贴到选中位置
  pasteSelection() {
    if (!this.clipboardContent || this.selectedCells.length === 0) return;

    // 获取粘贴的起始位置
    let startRow = Infinity;
    let startCol = Infinity;

    this.selectedCells.forEach(cell => {
      startRow = Math.min(startRow, cell.rowIndex);
      startCol = Math.min(startCol, cell.columnIndex);
    });

    // 粘贴数据
    const { data, width, height } = this.clipboardContent;
    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        const targetRow = startRow + r;
        const targetCol = startCol + c;

        // 确保目标行列有效
        if (targetRow < this.grid.data.length && targetCol < this.grid.columns.length) {
          const value = data[r][c];
          const rowData = this.grid.data[targetRow];
          const colProperty = this.grid.columns[targetCol].property;

          if (rowData && colProperty) {
            rowData[colProperty] = value;
          }
        }
      }
    }

    // 刷新表格
    this.grid.draw();
    this.message.success('已粘贴内容');
  }

  // 清空选中的单元格
  clearSelection() {
    if (!this.hasSelection) return;

    this.selectedCells.forEach(cell => {
      const row = this.grid.data[cell.rowIndex];
      const col = this.grid.columns[cell.columnIndex];
      if (row && col && col.property) {
        row[col.property] = '';
      }
    });

    // 刷新表格
    this.grid.draw();
    this.message.success('已清空选中单元格');
  }

  // 使用指定值填充选中单元格
  fillSelection() {
    if (!this.hasSelection) return;

    this.selectedCells.forEach(cell => {
      const row = this.grid.data[cell.rowIndex];
      const col = this.grid.columns[cell.columnIndex];
      if (row && col && col.property) {
        row[col.property] = this.batchFillValue;
      }
    });

    // 刷新表格
    this.grid.draw();
    this.message.success('已填充选中单元格');
  }

  generateDefaultData(): any[] {
    // Create 100 empty rows
    return Array.from({ length: 100 }, () => ({
      '名称': '',
      '描述': '',
      '别名': '',
      '类型': '',
      '标签': '',
      '图片': ''
    }));
  }

  // 添加自定义列 - 固定列模式下，不再允许添加新列
  addCustomColumn() {
    this.message.info('为确保数据一致性，批处理模式下暂不支持添加自定义列');
  }

  addCustomRows(rowCount: number = 1) {
    if (isNaN(rowCount) || rowCount < 1) {
      this.message.warning('请输入有效的行数');
      return;
    }

    // 获取当前最大ID
    let maxId = Math.max(...this.grid.data.map((item: any) => item.id || 0), 0);

    // 创建新的行数据
    const newData = Array.from({ length: rowCount }, (_, index) => {
      const row: any = { id: maxId + index + 1 };
      this.grid.columns.forEach((col: any) => {
        row[col.property] = '';
      });
      return row;
    });

    // 将新行添加到现有数据中
    this.grid.data.push(...newData);

    // 刷新表格视图以反映更改
    this.grid.refresh();
  }

  startPolling() {
    this.showProgress = true;
    this.intervalId = setInterval(() => this.fetchLatestJob(), 5000); // 每5秒轮询一次
  }

  stopPolling() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  fetchLatestJob() {
    this.subscription = this.nodeService.jobs().subscribe(
      (data: any[]) => {
        // 假设作业按照创建时间排序，最新的在最后
        const unfinishedJobs = data.filter(job => job.progress < 100);
        if (unfinishedJobs.length > 0) {
          this.latestJob = unfinishedJobs[unfinishedJobs.length - 1]; // 获取最新的未完成作业
        } else {
          this.showProgress = false; // 如果没有进行中的作业，隐藏进度条并停止轮询
          this.stopPolling();
        }
      },
      (error) => console.error('Error fetching jobs:', error)
    );
  }

  // 选择数据集并加载其数据
  selectDataset(value: string) {
    // 不再需要此功能
  }

  loadApiData(dataset: any) {
    this.http.get<any>(dataset.description).subscribe(
      (apiData: any) => {
        if (apiData.sections && apiData.sections[0] && apiData.sections[0].cards) {
          const data = apiData.sections[0].cards;
          // 自动检测并设置列
          if (data.length > 0) {
            const firstItem = data[0];
            const columns = Object.keys(firstItem).map(key => ({
              label: key,
              property: key
            }));
            this.grid.columns = columns;
          }
          this.grid.data = data;
        }
      },
      (error: any) => {
        this.message.error('获取API数据失败');
        console.error('Error fetching API data:', error);
      }
    );
  }

  // 从文件加载数据集数据
  loadDataset(file: string) {
    this.fetchJson(`http://localhost:9000/kgms/${file}`).then((data: Array<any>) => {
      if (data.length > 0) {
        // 自动检测并设置列
        const firstItem = data[0];
        const columns = Object.keys(firstItem).filter(key => key !== '_id').map(key => ({
          label: key,
          property: key
        }));
        this.grid.columns = columns;
        // 设置数据
        this.grid.data = data.map(({ _id, ...rest }) => rest);
      }
    }).catch(error => {
      this.message.error('加载数据集失败');
      console.error('Error fetching JSON:', error);
    });
  }

  // 从URL获取JSON数据
  async fetchJson(url: string): Promise<any> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const text = await response.text();
      const lines = text.split('\n').filter(line => line.trim() !== '');
      return lines.map(line => JSON.parse(line));
    } catch (error) {
      console.error('Failed to fetch or parse JSONL:', error);
      throw error;
    }
  }

  // 预览导入数据
  previewImport() {
    if (!this.grid.data || this.grid.data.length === 0) {
      this.message.warning('没有数据可以预览');
      return;
    }
    // 准备预览数据
    this.preparePreviewData();
    // 切换到预览标签页
    this.activeTabIndex = 1;
  }

  // 准备预览数据 - 只预览基础字段
  preparePreviewData() {
    // 分析数据
    const data = this.grid.data;
    const previewItems = [];

    // 设置预览列
    this.previewColumns = [
      { id: 'index', label: '序号', type: 'index', width: 80 },
      { id: 'label', label: '名称', flex: 1 },
      { id: 'description', label: '描述', flex: 2 },
      { id: 'category', label: '类型', width: 100 },
      { id: 'aliases', label: '别名', flex: 1 },
      { id: 'tags', label: '标签', flex: 1 },
      { id: 'images', label: '图片', flex: 1 }
    ];

    // 分析每一行数据，转换为预览格式
    for (const row of data) {
      previewItems.push({
        label: row['名称'] || '未命名',
        description: row['描述'] || '',
        category: row['类型'] || '通用',
        aliases: row['别名'] || '',
        tags: row['标签'] || '',
        images: row['图片'] || ''
      });
    }

    this.previewData = previewItems;
  }

  // 将数据导入节点服务
  importData() {
    if (!this.grid.data || this.grid.data.length === 0) {
      this.message.warning('没有数据可以导入');
      return;
    }

    this.msgBox.confirm({
      content: '确定要导入数据吗？',
      type: 'warning',
      callback: (action: XMessageBoxAction) => {
        if (action === 'confirm') {
          this.proceedWithImport();
        }
      }
    });
  }

  proceedWithImport() {
    this.isImporting = true;
    this.showProgress = false;

    // 获取字段映射信息 - 自动检测
    const columns = this.grid.columns.map((col: any) => col.property);
    const nameField = this.detectField(columns, ['名称', 'name', 'title', 'label']);
    const descField = this.detectField(columns, ['描述', 'description', 'desc', 'summary']);
    const typeField = this.detectField(columns, ['类型', '类别', 'category', 'type']);
    const aliasFields = this.detectMultipleFields(columns, ['别名', 'alias', 'aliases']);
    const tagFields = this.detectMultipleFields(columns, ['标签', 'tag', 'tags']);
    const imageFields = this.detectMultipleFields(columns, ['图片', '文件', 'image', 'images', 'file', 'files']);
    const urlField = this.detectField(columns, ['url', 'link', '链接', 'source', '来源']);

    // 转换数据
    const entities = this.grid.data.map((row: any) => {
      const entity: any = {
        labels: { zh: { language: "zh", value: row[nameField] || "未命名实体" } },
        claims: {}
      };

      // 添加描述
      if (descField && row[descField]) {
        entity.descriptions = { zh: { language: "zh", value: row[descField] } };
      }

      // 添加类别
      if (typeField && row[typeField]) {
        entity.category = row[typeField];
        entity.type = row[typeField];
      }

      // 添加URL
      if (urlField && row[urlField]) {
        entity.sources = [row[urlField]];
      }

      // 添加别名
      entity.aliases = { zh: [] };
      aliasFields.forEach(field => {
        if (row[field]) {
          const aliases = Array.isArray(row[field]) ? row[field] : [row[field]];
          aliases.forEach((alias: string) => {
            entity.aliases.zh.push({ language: "zh", value: alias });
          });
        }
      });

      // 添加标签
      entity.tags = [];
      tagFields.forEach(field => {
        if (row[field]) {
          const tags = Array.isArray(row[field]) ? row[field] : [row[field]];
          entity.tags = entity.tags.concat(tags);
        }
      });

      // 添加图片
      entity.images = [];
      imageFields.forEach(field => {
        if (row[field]) {
          const images = Array.isArray(row[field]) ? row[field] : [row[field]];
          entity.images = entity.images.concat(images);
        }
      });

      // 添加其他属性作为claims
      for (const key of columns) {
        if (row[key] && ![nameField, descField, typeField, urlField].concat(aliasFields, tagFields, imageFields).includes(key)) {
          entity.claims[key] = [{
            "mainsnak": {
              "snaktype": "value",
              "property": key,
              "datavalue": {
                "value": row[key],
                "type": "wikibase-entityid"
              },
              "datatype": "wikibase-item"
            },
            "type": "statement",
            "rank": "normal"
          }];
        }
      }

      return entity;
    });

    // 提交导入请求
    setTimeout(() => {
      this.nodeService.import(entities).subscribe(
        (res: any) => {
          this.fetchLatestJob();
          this.startPolling();
          this.isImporting = false;
          this.message.success('导入任务已提交');
        },
        (error) => {
          this.isImporting = false;
          this.message.error('导入失败');
          console.error('Import error:', error);
        }
      );
    }, 1000);
  }

  // 检测特定类型的字段
  detectField(columns: string[], possibleNames: string[]): string {
    for (const name of possibleNames) {
      const field = columns.find(col => col.toLowerCase().includes(name.toLowerCase()));
      if (field) return field;
    }
    return columns[0] || '';  // 默认返回第一个字段
  }

  // 检测多个可能的字段名
  detectMultipleFields(columns: string[], possibleNames: string[]): string[] {
    return columns.filter(col =>
      possibleNames.some(name =>
        col.toLowerCase().includes(name.toLowerCase())
      )
    );
  }

  // Handle tab change event
  onTabChanged(event: any) {
    this.activeTabIndex = Number(event);

    // 切换到数据表格时，刷新表格绘制以确保正确显示
    if (this.activeTabIndex === 0 && this.grid) {
      setTimeout(() => {
        this.grid.draw();
      }, 100);
    }
  }

  // 加载批处理任务
  loadBatchTask() {
    if (!this.batchTaskId) return;

    this.isBatchProcessing = true;
    this.nodeService.getBatchTask(this.batchTaskId).subscribe(
      (task) => {
        this.batchTask = task;
        
        if (task.type === 'entity-new-batch') {
          // 处理新的批处理任务类型（批量创建）
          this.loadNewBatchTaskData(task);
        } else {
          // 处理传统批处理任务（批量编辑）
          this.loadBatchEntities(task.entities);
        }
        // 更新任务状态为处理中（如果当前是待处理状态）
        if (task.status === 'pending') {
          this.nodeService.updateBatchTask({
            id: this.batchTaskId as string,
            status: 'processing'
          }).subscribe();
        }
      },
      (error) => {
        this.message.error('加载批处理任务失败');
        this.isBatchProcessing = false;
        console.error('Error loading batch task:', error);
      }
    );
  }

  // 加载批处理任务中的实体
  loadBatchEntities(entityIds: string[]) {
    if (!entityIds || entityIds.length === 0) {
      this.isBatchProcessing = false;
      return;
    }

    // 创建请求以获取所有实体
    const requests = entityIds.map(id => this.esService.getEntity(id));

    forkJoin(requests).subscribe(
      (entities) => {
        this.batchEntities = entities;
        console.log('Loaded batch entities:', entities);
        this.convertEntitiesToGrid(entities);
        this.isBatchProcessing = false;
      },
      (error) => {
        this.message.error('加载实体数据失败');
        this.isBatchProcessing = false;
        console.error('Error loading batch entities:', error);
      }
    );
  }

  // 将实体转换为网格数据 - 简化版本，只处理基础字段
  convertEntitiesToGrid(entities: any[]) {
    if (!entities || entities.length === 0) return;

    // 准备行数据
    const rows = entities.map(entity => {
      const row: any = {};
      const source = entity['_source'] || entity;

      // 基础字段
      row['名称'] = source.labels?.zh?.value || '';
      row['描述'] = source.descriptions?.zh?.value || '';
      row['类型'] = source.type || '';
      
      // 别名处理
      if (source.aliases?.zh?.length > 0) {
        row['别名'] = source.aliases.zh.map((alias: any) => alias.value).join(', ');
      } else {
        row['别名'] = '';
      }
      
      // 标签处理
      if (source.tags?.length > 0) {
        row['标签'] = source.tags.join(', ');
      } else {
        row['标签'] = '';
      }
      
      // 图片处理
      if (source.images?.length > 0) {
        row['图片'] = source.images.join(', ');
      } else {
        row['图片'] = '';
      }

      // 保存原始实体ID以便后续更新
      row._entityId = entity._id;
      
      return row;
    });

    // 设置网格数据
    this.grid.data = rows;
    this.grid.draw();
  }

  // 保存批处理编辑结果
  saveBatchChanges() {
    if (!this.batchTaskId || !this.grid.data || this.grid.data.length === 0) {
      this.message.warning('没有数据可以保存');
      return;
    }

    this.msgBox.confirm({
      content: '确定要保存对这些实体的更改吗？',
      type: 'warning',
      callback: (action: XMessageBoxAction) => {
        if (action === 'confirm') {
          this.proceedWithBatchSave();
        }
      }
    });
  }

  // 执行批量保存 - 简化版本，只处理基础字段
  proceedWithBatchSave() {
    this.isImporting = true;

    // 准备更新请求
    const updateRequests: Observable<any>[] = [];

    // 遍历网格数据
    for (const row of this.grid.data) {
      if (!row._entityId) continue;

      const entityToUpdate: any = this.batchEntities.find((e: any) => e._id === row._entityId);
      if (!entityToUpdate) continue;

      // 创建简单的更新对象，只包含基础字段
      const updateData:any = {
        id: entityToUpdate._id,
        labels: { 
          zh: { 
            language: "zh", 
            value: row['名称'] || entityToUpdate._source.labels?.zh?.value 
          }
        },
        descriptions: { 
          zh: { 
            language: "zh", 
            value: row['描述'] || entityToUpdate._source.descriptions?.zh?.value 
          }
        },
        type: row['类型'] || entityToUpdate._source.type,
        
        // 别名处理
        aliases: { 
          zh: row['别名'] ? row['别名'].split(',').map((alias: string) => ({
            language: "zh",
            value: alias.trim()
          })) : entityToUpdate._source.aliases?.zh || []
        },
        
        // 标签处理
        tags: row['标签'] ? 
          row['标签'].split(',').map((tag: string) => tag.trim()) : 
          entityToUpdate._source.tags || [],
        
        // 图片处理
        images: row['图片'] ? 
          row['图片'].split(',').map((image: string) => image.trim()) : 
          entityToUpdate._source.images || []
      };

      // 添加更新请求
      updateRequests.push(this.nodeService.updateItem(updateData));
    }

    // 执行所有更新请求
    if (updateRequests.length > 0) {
      forkJoin(updateRequests).subscribe(
        () => {
          // 更新批处理任务状态
          if (this.batchTask) {
            this.batchTask.status = 'completed';
            this.nodeService.updateBatchTask(this.batchTask).subscribe();
          }

          this.isImporting = false;
          this.message.success(`成功更新了 ${updateRequests.length} 个实体`);
        },
        (error) => {
          this.isImporting = false;
          this.message.error('保存更改失败');
          console.error('Error saving batch changes:', error);
        }
      );
    } else {
      this.isImporting = false;
      this.message.warning('没有实体需要更新');
    }
  }

  // 加载批处理任务列表
  loadBatchTasks() {
    this.nodeService.getBatchTasks().subscribe(
      (result) => {
        // 格式化批处理任务列表为下拉菜单格式，包括新类型
        this.batchTasks = result.items
          .filter((task: any) => task.status !== 'completed' && task.status !== 'failed')
          .map((task: any) => {
            const isNewBatch = task.type === 'entity-new-batch';
            const entitiesCount = task.entities?.length || 0;
            const dataCount = task.data?.length || 0;
            const count = isNewBatch ? dataCount : entitiesCount;
            
            return {
              id: task.id,
              label: `${task.description || '批处理任务'} (${task.createdAt.substring(0, 10)}, ${count}${isNewBatch ? '条新数据' : '个实体'})`,
              task: task
            };
          });

        if (this.batchTasks.length === 0) {
          this.message.info('没有可用的批处理任务，您可以创建新的批处理任务');
          // 显示空表格
          this.grid.data = [];
        }
      },
      (error) => {
        console.error('Error loading batch tasks:', error);
        this.message.error('加载批处理任务失败');
      }
    );
  }

  // 刷新批处理任务列表
  refreshBatchTasks() {
    this.message.info('正在刷新批处理任务列表...');
    this.loadBatchTasks();
  }

  // 切换数据集选择器和批处理任务选择器
  toggleBatchTaskSelector() {
    this.showBatchTaskSelector = !this.showBatchTaskSelector;

    if (this.showBatchTaskSelector) {
      this.loadBatchTasks(); // 确保任务列表是最新的
    }
  }

  // 选择批处理任务
  selectBatchTask(taskId: string) {
    if (!taskId) return;

    this.isBatchProcessing = true;
    this.batchTaskId = taskId;
    this.loadBatchTask();
  }

  // 加载新建批处理任务的数据 - 使用固定列
  loadNewBatchTaskData(task: any) {
    if (!task.data || task.data.length === 0) {
      this.isBatchProcessing = false;
      this.message.warning('批处理任务没有包含数据');
      return;
    }
    
    // 设置固定列
    this.grid.columns = [
      { label: '名称', property: '名称', width: 150 },
      { label: '描述', property: '描述', width: 250 },
      { label: '别名', property: '别名', width: 150 },
      { label: '类型', property: '类型', width: 100 },
      { label: '标签', property: '标签', width: 150 },
      { label: '图片', property: '图片', width: 200 }
    ];
    
    // 转换数据以适应固定列
    const adaptedData = task.data.map((item: any) => {
      const newItem: any = {};
      
      // 适配属性名称
      newItem['名称'] = item['名称'] || '';
      newItem['描述'] = item['描述'] || '';
      newItem['别名'] = item['别名'] || '';
      newItem['类型'] = item['类型'] || '';
      newItem['标签'] = item['标签'] || '';
      newItem['图片'] = item['图片'] || item['文件'] || '';
      
      return newItem;
    });
    
    // 设置网格数据
    this.grid.data = adaptedData;
    this.grid.draw();
    this.isBatchProcessing = false;
  }

  // 创建新的批处理任务
  createNewBatchTask() {
    this.newBatchTask = {
      name: '新建批处理任务',
      description: '批量创建实体',
      type: 'entity-new-batch',
      entities: [],
      data: []
    };
    this.showNewBatchTaskDialog = true;
  }

  // 确认创建批处理任务
  confirmCreateBatchTask() {
    if (!this.newBatchTask.name || !this.newBatchTask.description) {
      this.message.warning('请输入任务名称和描述');
      return;
    }

    // 检查表格数据是否为空
    if (this.grid.data.length === 0) {
      this.message.warning('请先添加数据行');
      return;
    }

    // 创建任务对象
    const batchTask = {
      id: uuidv4(),
      type: 'entity-new-batch',
      description: `${this.newBatchTask.name} - ${this.newBatchTask.description}`,
      createdBy: 'current-user', // 这里应该是当前登录用户
      entities: [],
      data: this.grid.data
    };

    // 创建批处理任务
    this.nodeService.createBatchTask(batchTask).subscribe(
      (result) => {
        this.message.success('批处理任务创建成功');
        this.showNewBatchTaskDialog = false;
        this.refreshBatchTasks(); // 刷新任务列表
      },
      (error) => {
        this.message.error('创建批处理任务失败');
        console.error('Error creating batch task:', error);
      }
    );
  }

  // 获取批处理任务状态标签
  getBatchTaskStatusLabel(status: string): string {
    switch(status) {
      case 'pending': return '待处理';
      case 'processing': return '处理中';
      case 'completed': return '已完成';
      case 'failed': return '失败';
      default: return '未知';
    }
  }

  // 获取批处理任务状态样式类
  getBatchTaskStatusClass(status: string): string {
    return `status-${status || 'pending'}`;
  }

  ngOnDestroy() {
    this.stopPolling();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}