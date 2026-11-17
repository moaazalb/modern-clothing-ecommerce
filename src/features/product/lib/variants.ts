import type {
  PublicColor,
  PublicSize,
} from "@/features/catalog/types/catalog.types";

import type {
  PublicProductDetail,
  PublicProductImage,
  PublicProductVariant,
} from "../types/product.types";

export interface SizeOption {
  size: PublicSize;
  inStock: boolean;
}

/**
 * Lists the colors that have at least one variant.
 *
 * @param product - The product.
 * @returns Unique colors, in variant order.
 */
export function getProductColors(product: PublicProductDetail): PublicColor[] {
  const colors = new Map<string, PublicColor>();

  for (const variant of product.variants) {
    colors.set(variant.color.id, variant.color);
  }

  return [...colors.values()];
}

/**
 * Lists the sizes available in one color, with their stock state.
 *
 * @param product - The product.
 * @param colorId - The selected color.
 * @returns The sizes of that color (empty for products without sizes).
 */
export function getSizesForColor(
  product: PublicProductDetail,
  colorId: string,
): SizeOption[] {
  const options: SizeOption[] = [];

  for (const variant of product.variants) {
    if (variant.color.id === colorId && variant.size) {
      options.push({ size: variant.size, inStock: variant.inStock });
    }
  }

  return options;
}

/**
 * Finds the variant that matches a color and a size.
 *
 * @param product - The product.
 * @param colorId - The selected color.
 * @param sizeId - The selected size, or null for products without sizes.
 * @returns The matching variant, or undefined.
 */
export function findVariant(
  product: PublicProductDetail,
  colorId: string,
  sizeId: string | null,
): PublicProductVariant | undefined {
  return product.variants.find(
    (variant) =>
      variant.color.id === colorId && (variant.size?.id ?? null) === sizeId,
  );
}

/**
 * Picks the variant to select when a color is chosen: the first one in
 * stock, otherwise the first one of that color.
 *
 * @param product - The product.
 * @param colorId - The chosen color.
 * @returns The variant, or undefined.
 */
export function pickVariantForColor(
  product: PublicProductDetail,
  colorId: string,
): PublicProductVariant | undefined {
  const variants = product.variants.filter(
    (variant) => variant.color.id === colorId,
  );

  return variants.find((variant) => variant.inStock) ?? variants[0];
}

/**
 * Picks the variant selected when the page opens.
 *
 * @param product - The product.
 * @returns The first variant in stock, otherwise the first variant.
 */
export function getInitialVariant(
  product: PublicProductDetail,
): PublicProductVariant | undefined {
  return product.variants.find((variant) => variant.inStock) ?? product.variants[0];
}

/**
 * Returns the images to show for a color: its own images, or the general
 * ones when that color has none.
 *
 * @param product - The product.
 * @param colorId - The selected color, or null when nothing is selected.
 * @returns The images, in display order.
 */
export function getImagesForColor(
  product: PublicProductDetail,
  colorId: string | null,
): PublicProductImage[] {
  const general = product.images.filter((image) => image.colorId === null);

  if (colorId === null) {
    return general.length > 0 ? general : product.images;
  }

  const colored = product.images.filter((image) => image.colorId === colorId);

  return colored.length > 0 ? colored : general;
}