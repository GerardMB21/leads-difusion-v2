import { CSSProperties, ReactNode } from 'react';

export enum OrderBy {
  ASC = 'asc',
  DESC = 'desc',
}

export type BaseModel = {
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type BaseFilters = {
  id?: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  orderBy?: OrderBy;
};

export type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export type NormalizedError = {
  status: number;
  message: string;
};

export interface CommonProps {
  id?: string;
  className?: string;
  children?: ReactNode;
  style?: CSSProperties;
}
