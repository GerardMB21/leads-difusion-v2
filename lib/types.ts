export enum OrderBy {
  ASC = 'asc',
  DESC = 'desc',
}

export type BaseModel = {
  id: number;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
};

export type BaseFilters = {
  id?: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  orderBy?: OrderBy;
};
