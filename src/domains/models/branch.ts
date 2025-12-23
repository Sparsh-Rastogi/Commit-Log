export interface Branch {
  id: number | null;
  name: string;
  description?: string;
  isMain: boolean;
  createdAt: Date;
}
