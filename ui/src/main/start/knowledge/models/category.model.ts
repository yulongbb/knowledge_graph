export interface Category {
  id: string;
  name: string;
  label: string;
  value: number;
  description: string | null;
  collection: string | null;
  router: string | null;
  icon: string | null;
  sort: number | null;
  pid: string | null;
  path: string;
  color: string | null;
  parent: any | null;
  children?: Category[];
}

export interface CategoryResponse {
  list: Category[];
  total: number;
  query: any;
}
