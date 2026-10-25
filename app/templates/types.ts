import type { BaseModel } from '@/lib/types';

export type Template = {
  name: string;
  img: string | null;
  message: string;
} & BaseModel;
