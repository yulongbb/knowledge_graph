/**
 * 类型声明文件
 * 用于提供外部库的类型定义
 */

/**
 * canvas-datagrid 库的类型声明
 * 这是一个增强的声明，添加了滚动和拖动相关属性
 */
declare function canvasDatagrid(options?: any): {
  style: any;
  data: any[];
  columns: any[];
  attributes: {
    allowColumnResize: boolean;
    allowRowResize: boolean;
    borderDragBehavior: string;
    allowMovingSelection: boolean;
    selectionScrollMode: string;
    [key: string]: any;
  };
  scrollLeft: number;
  scrollTop: number;
  addEventListener: (event: string, callback: (e: any) => void) => void;
  removeEventListener: (event: string, callback: (e: any) => void) => void;
  draw: () => void;
  refresh: () => void;
  addColumn: (columnDefinition: any) => void;
  getCellAt: (x: number, y: number) => any;
  scrollIntoView: (cell: any) => void;
  [key: string]: any;
};
