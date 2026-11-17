import Link from "next/link";
import { Suspense } from "react";
import type { ReactElement } from "react";

import { FilterBar } from "@/components/products/FilterBar";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductPagination } from "@/components/products/ProductPagination";
import { getColors, getSizes } from "@/features/catalog/api/catalog.server";
import type { PublicCategoryTreeNode } from "@/features/catalog/types/catalog.types";
import { getProducts } from "@/features/product/api/product.server";
import type { ProductListQueryParams } from "@/features/product/types/product.types";

interface ProductCatalogProps {
  title: string;
  basePath: string;
  query: ProductListQueryParams;
  subcategories?: PublicCategoryTreeNode[];
}

/**
 * Product listing used by every catalog page: title, filters, grid and
 * pagination. Data is fetched on the server and the filters live in the URL.
 *
 * @param props - Component props.
 * @param props.title - Heading of the page.
 * @param props.basePath - Path of the page, used by the pagination links.
 * @param props.query - Validated query (including categoryId on category pages).
 * @param props.subcategories - Direct sub-categories to link to.
 * @returns The listing.
 */
export async function ProductCatalog({
  title,
  basePath,
  query,
  subcategories = [],
}: ProductCatalogProps): Promise<ReactElement> {
  const [products, colors, sizes] = await Promise.all([
    getProducts(query),
    getColors(),
    getSizes(),
  ]);

  const { items, meta } = products;

  return (
    <section className="w-full pt-8 sm:pt-12 lg:pt-16">
      <div className="px-4 sm:px-6 lg:px-10 xl:px-14">
        <h1 className="mb-5 font-inter text-2xl font-bold leading-tight tracking-normal text-[#4B3621] sm:text-3xl lg:text-4xl">
          {title}
        </h1>

        {subcategories.length > 0 && (
          <nav aria-label="Subcategories" className="mb-5 flex flex-wrap gap-2">
            {subcategories.map((child) => (
              <Link
                key={child.id}
                href={`/categories/${encodeURIComponent(child.slug)}`}
                className="rounded-full border border-[#D6B58A] bg-[#F8F4ED] px-4 py-1.5 text-sm font-medium text-[#4B3621] transition-colors hover:bg-[#A87945] hover:text-white"
              >
                {child.name}
              </Link>
            ))}
          </nav>
        )}

        <Suspense fallback={null}>
          <FilterBar colors={colors} sizes={sizes} />
        </Suspense>

        <p className="mt-4 text-sm text-[#806B56]" role="status">
          {meta.total} {meta.total === 1 ? "product" : "products"}
        </p>
      </div>

      {items.length === 0 ? (
        <p
          role="status"
          className="py-12 text-center font-inter text-base text-[#806B56] sm:text-lg"
        >
          No products found
        </p>
      ) : (
        <ul className="grid grid-cols-1 justify-items-center gap-6 px-4 py-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-6 xl:gap-10">
          {items.map((product) => (
            <li key={product.id} className="w-full min-w-0 max-w-sm">
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}

      <ProductPagination basePath={basePath} query={query} meta={meta} />
    </section>
  );
}