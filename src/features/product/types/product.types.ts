
import type {
  PublicBrand,
  PublicColor,
  PublicSize,
  PublicTag,
  SizeType,
} from "@/features/catalog/types/catalog.types";

export type { PaginatedResponse, PaginationMeta } from "@/lib/api/types";

/**
 * Product enums returned and accepted by the public products API.
 * These values mirror the backend enums.
 */
export type ProductGender = "MEN" | "WOMEN" | "UNISEX";

export type ProductSort = "newest" | "price_asc" | "price_desc";


/**
 * Minimal category data embedded in public product responses.
 */
export interface PublicProductCategory {
  id: string;
  name: string;
  slug: string;
}

/**
 * Image data returned by the public storefront API.
 */
export interface PublicProductImage {
  id: string;
  url: string;
  altText: string | null;
  colorId: string | null;
  sortOrder: number;
}

/**
 * Variant data returned by the public storefront API.
 */
export interface PublicProductVariant {
  id: string;
  color: PublicColor;
  size: PublicSize | null;
  price: string;
  inStock: boolean;
}

/**
 * Product listing item returned by GET /products.
 */
export interface PublicProductListItem {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  gender: ProductGender;
  isFeatured: boolean;
  minPrice: string;
  maxPrice: string;
  inStock: boolean;
  brand: PublicBrand | null;
  mainImage: PublicProductImage | null;
  colors: PublicColor[];
}

/**
 * Product details returned by GET /products/:slug.
 */
export interface PublicProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  price: string;
  gender: ProductGender;
  sizeType: SizeType | null;
  isFeatured: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  inStock: boolean;
  category: PublicProductCategory;
  brand: PublicBrand | null;
  colors: PublicColor[];
  sizes: PublicSize[];
  tags: PublicTag[];
  images: PublicProductImage[];
  variants: PublicProductVariant[];
}

/**
 * Query parameters supported by GET /products.
 */
export interface ProductListQueryParams {
  page?: number;
  limit?: number;
  sort?: ProductSort;
  categoryId?: string;
  brandId?: string;
  gender?: ProductGender;
  tagId?: string;
  colorId?: string;
  sizeId?: string;
  minPrice?: string;
  maxPrice?: string;
  inStock?: boolean;
  q?: string;
}
