import Link from "next/link";
import type { ReactElement } from "react";

import { Button } from "@/components/ui/button";
import { buildListingHref } from "@/features/product/lib/product-search-params";
import type {
  PaginationMeta,
  ProductListQueryParams,
} from "@/features/product/types/product.types";

interface ProductPaginationProps {
  basePath: string;
  query: ProductListQueryParams;
  meta: PaginationMeta;
}

/**
 * Previous / next navigation that keeps the active filters.
 *
 * @param props - Component props.
 * @returns The pagination, or null when there is a single page.
 */
export function ProductPagination({
  basePath,
  query,
  meta,
}: ProductPaginationProps): ReactElement | null {
  if (meta.totalPages <= 1) {
    return null;
  }

  const hasPrevious = meta.page > 1;
  const hasNext = meta.page < meta.totalPages;

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-4 px-4 pb-12"
    >
      {hasPrevious ? (
        <Button asChild variant="outline">
          <Link href={buildListingHref(basePath, query, meta.page - 1)} rel="prev">
            Previous
          </Link>
        </Button>
      ) : (
        <Button variant="outline" disabled>
          Previous
        </Button>
      )}

      <span className="text-sm font-medium text-[#4B3621]">
        Page {meta.page} of {meta.totalPages}
      </span>

      {hasNext ? (
        <Button asChild variant="outline">
          <Link href={buildListingHref(basePath, query, meta.page + 1)} rel="next">
            Next
          </Link>
        </Button>
      ) : (
        <Button variant="outline" disabled>
          Next
        </Button>
      )}
    </nav>
  );
}