import type { Metadata } from "next";
import type { ReactElement } from "react";

import { ProductCatalog } from "@/components/products/ProductCatalog";
import {
  parseProductSearchParams,
  type RawSearchParams,
} from "@/features/product/lib/product-search-params";
import { NavigateButtons } from "@/components/home/NavigateButtons";
import { getCategoryTree } from "@/features/catalog/api/catalog.server";

export const metadata: Metadata = {
  title: "All Products",
};

interface ProductsPageProps {
  searchParams: Promise<RawSearchParams>;
}

/**
 * All products with filters, sorting and pagination (state lives in the URL).
 *
 * @param props - Page props.
 * @returns The products page.
 */
export default async function ProductsPage({
  searchParams,
}: ProductsPageProps): Promise<ReactElement> {
   const [query, categories] = await Promise.all([
    searchParams.then(parseProductSearchParams),
    getCategoryTree(),
  ]);


  return (
    <>
      <NavigateButtons categories={categories} />
      <ProductCatalog title="All Products" basePath="/products" query={query} />
    </>
  );
}
