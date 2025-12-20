export interface Branch {
  id: string;
  name: string;
  description?: string;
  isMain: boolean;
  createdAt: Date;
}
