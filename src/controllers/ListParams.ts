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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO check if change required after rewriting queries
  values: any[];
}
