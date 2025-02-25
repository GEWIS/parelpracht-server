export interface PaginationParams {
  skip?: number;
  take?: number;
}

export interface ListParams extends PaginationParams {
  sorting?: ListSorting;
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
