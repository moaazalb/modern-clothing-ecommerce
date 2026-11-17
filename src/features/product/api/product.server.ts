import { ServerApiError, serverFetch } from "@/lib/api/serverFetch";

import type {
  PaginatedResponse,
  ProductListQueryParams,
  PublicProductDetail,
  PublicProductListItem,
} from "../types/product.types";

/**
 * Fetches a page of public products.
 *
 * @param query - Filters, sort and pagination.
 * @returns The page of products.
 */
export function getProducts(
  query: ProductListQueryParams,
): Promise<PaginatedResponse<PublicProductListItem>> {
  return serverFetch<PaginatedResponse<PublicProductListItem>>("products", {
    params: query,
  });
}

/**
 * Fetches one public product by slug.
 *
 * @param slug - Product slug.
 * @returns The product, or null when it does not exist or is not visible.
 */
export async function getProductBySlug(
  slug: string,
): Promise<PublicProductDetail | null> {
  try {
    return await serverFetch<PublicProductDetail>(
      `products/${encodeURIComponent(slug)}`,
    );
  } catch (error) {
    if (error instanceof ServerApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}