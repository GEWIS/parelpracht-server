export interface ListParams {
  sorting?: ListSorting
  skip?: number;
  take?: number;
  search?: string;
}

export interface ListSorting {
  column: string;
  direction: 'ASC' | 'DESC';
}
