
/**
 * Category node returned by the public category tree endpoint.
 */
export interface PublicCategoryTreeNode {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  children: PublicCategoryTreeNode[];
}

/**
 * Brand returned by the public brands endpoint.
 */
export interface PublicBrand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
}

/**
 * Color returned by the public colors endpoint.
 */
export interface PublicColor {
  id: string;
  name: string;
  slug: string;
  hexCode: string;
}

/**
 * Supported sizing systems returned by the backend.
 *
 * These values must match the backend SizeType enum.
 */
export type SizeType = "APPAREL" | "FOOTWEAR";

/**
 * Size returned by the public sizes endpoint.
 */
export interface PublicSize {
  id: string;
  name: string;
  code: string;
  sizeType: SizeType;
  sortOrder: number;
}

/**
 * Tag returned by the public tags endpoint.
 */
export interface PublicTag {
  id: string;
  name: string;
  slug: string;
}

/**
 * Optional query parameters for retrieving public sizes.
 */
export interface GetPublicSizesParams {
  sizeType?: SizeType;
}
