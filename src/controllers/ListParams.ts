export interface ListParams {
  sorting?: ListSorting
  skip?: number;
  take?: number;
  search?: string;
  filters?: ListOrFilter[];
}

export interface ListSorting {
  column: string;
  direction: SortDirection;
}

export type SortDirection = 'ASC' | 'DESC';

export interface ListOrFilter {
  column: string;
  values: any[];
}
