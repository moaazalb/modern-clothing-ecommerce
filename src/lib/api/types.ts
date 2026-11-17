/**
 * Pagination metadata returned by paginated endpoints.
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Generic paginated API response.
 */
export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}