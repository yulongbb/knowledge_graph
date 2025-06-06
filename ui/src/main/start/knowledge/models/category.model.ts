export interface Category {
  id: string;
  name: string;
  label: string;  // 添加label字段用于路由
  displayName?: string;
  description?: string;
  avatar?: string; // Add avatar property
  children?: Category[];
  pid?: string;
  parentId?: string;
  path?: string;
  level?: number;
}

export interface CategoryResponse {
  list: Category[];
  total: number;
  query: any;
}
