export interface Branch {
  id: number | null;
  name: string;
  description?: string;
  is_main: boolean;
  createdAt: Date;
}
