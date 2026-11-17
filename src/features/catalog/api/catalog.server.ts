import { serverFetch } from "@/lib/api/serverFetch";

import type {
  PublicCategoryTreeNode,
  PublicColor,
  PublicSize,
} from "../types/catalog.types";

const CATALOG_REVALIDATE_SECONDS = 300;

/**
 * Fetches the public category tree.
 *
 * @returns Root categories with their nested children.
 */
export function getCategoryTree(): Promise<PublicCategoryTreeNode[]> {
  return serverFetch<PublicCategoryTreeNode[]>("categories/tree", {
    revalidate: CATALOG_REVALIDATE_SECONDS,
  });
}

/**
 * Fetches the active colors (used by the filters).
 *
 * @returns Active colors.
 */
export function getColors(): Promise<PublicColor[]> {
  return serverFetch<PublicColor[]>("colors", {
    revalidate: CATALOG_REVALIDATE_SECONDS,
  });
}

/**
 * Fetches the active sizes (used by the filters).
 *
 * @returns Active sizes.
 */
export function getSizes(): Promise<PublicSize[]> {
  return serverFetch<PublicSize[]>("sizes", {
    revalidate: CATALOG_REVALIDATE_SECONDS,
  });
}

/**
 * Finds a category by slug anywhere in the tree.
 *
 * @param categories - The nodes to search.
 * @param slug - The category slug.
 * @returns The matching category, or undefined.
 */
export function findCategoryBySlug(
  categories: PublicCategoryTreeNode[],
  slug: string,
): PublicCategoryTreeNode | undefined {
  for (const category of categories) {
    if (category.slug === slug) {
      return category;
    }

    const child = findCategoryBySlug(category.children, slug);

    if (child) {
      return child;
    }
  }

  return undefined;
}