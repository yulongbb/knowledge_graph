export interface GptModel {
  id: number;
  name: string;
  description?: string;
  logo?: string | null;  // 设置为可选且可为null
  apiEndpoint: string;
  apiKey: string;
  createdAt: Date;
  updatedAt: Date;
}
