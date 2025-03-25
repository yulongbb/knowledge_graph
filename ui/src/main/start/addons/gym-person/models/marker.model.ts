export interface Marker {
  id: number;
  label: string;
  positionX: number;
  positionY: number;
  positionZ: number;
  description?: string;
  createdAt?: Date;
}
