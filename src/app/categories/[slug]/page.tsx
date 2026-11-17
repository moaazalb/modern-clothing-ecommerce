import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactElement } from "react";

import { ProductCatalog } from "@/components/products/ProductCatalog";
import {
  findCategoryBySlug,
  getCategoryTree,
} from "@/features/catalog/api/catalog.server";
import {
  parseProductSearchParams,
  type RawSearchParams,
} from "@/features/product/lib/product-search-params";
import { NavigateButtons } from "@/components/home/NavigateButtons";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<RawSearchParams>;
}

/**
 * Loads a category by slug from the cached category tree.
 *
 * @param slug - Category slug from the URL.
 * @returns The category, or undefined.
 */
async function getCategory(slug: string) {
  const tree = await getCategoryTree();

  return findCategoryBySlug(tree, slug.toLowerCase());
}

/**
 * Builds the page title and description from the category.
 *
 * @param props - Page props.
 * @returns The page metadata.
 */
export async function generateMetadata({
  params,
}: Pick<CategoryPageProps, "params">): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    return { title: "Category not found" };
  }

  return {
    title: category.name,
    description: category.description ?? undefined,
  };
}

/**
 * Products of one category. The backend includes the products of all its
 * sub-categories automatically.
 *
 * @param props - Page props.
 * @returns The category page.
 */
export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps): Promise<ReactElement> {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  const query = {
    ...parseProductSearchParams(await searchParams),
    categoryId: category.id,
  };

  return (
    <>
    <ProductCatalog
      title={category.name}
      basePath={`/categories/${encodeURIComponent(category.slug)}`}
      query={query}
      subcategories={category.children}
    />
     <NavigateButtons categories={category.children} />
  </>
  );
}