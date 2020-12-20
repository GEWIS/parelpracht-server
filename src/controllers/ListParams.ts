export interface ListParams {
  sorting?: ListSorting
}

export interface ListSorting {
  column: string;
  direction: 'ASC' | 'DESC';
}
