import Image from "next/image";
import Link from "next/link";
import type { ReactElement } from "react";

import { ColorSwatches } from "@/components/products/ColorSwatches";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { PublicProductListItem } from "@/features/product/types/product.types";
import { formatPrice } from "@/lib/utils/price/price";

interface ProductCardProps {
  product: PublicProductListItem;
}

/**
 * Displays a public product card with its image, details, price and colors.
 *
 * @param {ProductCardProps} props - The product card props.
 * @param {PublicProductListItem} props.product - The public product data.
 * @returns {JSX.Element} The product card.
 */
export function ProductCard({ product }: ProductCardProps): ReactElement {
  const { name, slug, shortDescription, mainImage, minPrice, maxPrice, inStock, colors } =
    product;

  const priceLabel =
    minPrice === maxPrice
      ? formatPrice(minPrice)
      : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;

  return (
    <Link
      href={`/products/${encodeURIComponent(slug)}`}
      aria-label={`View ${name}`}
      className="block w-full"
    >
      <Card className="w-full max-w-sm gap-0 overflow-hidden rounded-xl border border-[#E8D8C3] bg-white py-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#4B3621]/10">
        <div className="relative mx-3 mt-3 aspect-square overflow-hidden rounded-lg bg-[#F8F4ED] sm:mx-4 sm:mt-4">
          {!inStock && (
            <span className="absolute left-3 top-3 z-10 rounded-full bg-[#4B3621] px-3 py-1 text-xs font-semibold text-white">
              Out of stock
            </span>
          )}

          {mainImage ? (
            <Image
              className="object-cover transition-transform duration-500 hover:scale-105"
              src={mainImage.url}
              alt={mainImage.altText ?? name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div
              role="img"
              aria-label={`${name} image unavailable`}
              className="flex h-full items-center justify-center text-sm text-[#806B56]"
            >
              No image available
            </div>
          )}
        </div>

        <CardContent className="px-4 py-4 text-center sm:py-5">
          <h2 className="mb-2 line-clamp-1 text-lg font-semibold text-[#4B3621] sm:text-xl">
            {name}
          </h2>

          <p className="line-clamp-2 text-sm leading-relaxed text-[#806B56] sm:text-base">
            {shortDescription ?? ""}
          </p>
        </CardContent>

        <CardFooter className="flex items-center justify-between gap-2 border-t border-[#E8D8C3] bg-[#F8F4ED]/50 px-4 py-3">
          <p className="text-base font-bold text-[#A87945]">{priceLabel}</p>

          <ColorSwatches colors={colors.map((color) => color.hexCode)} />
        </CardFooter>
      </Card>
    </Link>
  );
}