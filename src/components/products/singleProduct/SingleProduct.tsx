"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { ReactElement } from "react";

import { AddToCartForm } from "@/components/products/singleProduct/AddToCartForm";
import {
  findVariant,
  getImagesForColor,
  getInitialVariant,
  pickVariantForColor,
} from "@/features/product/lib/variants";
import type { PublicProductDetail } from "@/features/product/types/product.types";
import { formatPrice } from "@/lib/utils/price/price";

interface SingleProductProps {
  product: PublicProductDetail;
}

/**
 * Product page content: image gallery, details and the add-to-cart form.
 * It owns the selected color and size so the gallery follows the color.
 *
 * @param {SingleProductProps} props - Component props.
 * @param {PublicProductDetail} props.product - Product details from the API.
 * @returns {JSX.Element} The product details.
 */
export function SingleProduct({ product }: SingleProductProps): ReactElement {
  const initialVariant = getInitialVariant(product);

  const [colorId, setColorId] = useState<string | null>(
    initialVariant?.color.id ?? null,
  );
  const [sizeId, setSizeId] = useState<string | null>(
    initialVariant?.size?.id ?? null,
  );
  const [imageIndex, setImageIndex] = useState<number>(0);

  const selectedVariant = colorId
    ? findVariant(product, colorId, sizeId)
    : undefined;

  const images = getImagesForColor(product, colorId);
  const activeImage = images[imageIndex] ?? images[0];
  const description = product.description ?? product.shortDescription;
  const price = selectedVariant?.price ?? product.price;

  /**
   * Selects the best variant of the chosen color and shows its images.
   *
   * @param {string} nextColorId - Chosen color ID.
   * @returns {void}
   */
  const handleColorChange = (nextColorId: string): void => {
    const variant = pickVariantForColor(product, nextColorId);

    setColorId(nextColorId);
    setSizeId(variant?.size?.id ?? null);
    setImageIndex(0);
  };

  return (
    <article className="mx-auto grid w-full max-w-7xl grid-cols-1 items-start gap-8 px-4 py-8 sm:gap-10 sm:px-6 sm:py-12 lg:grid-cols-2 lg:gap-14 lg:px-8 lg:py-16">
      {/* Gallery */}
      <div className="flex w-full flex-col gap-4">
        <div className="flex min-h-[300px] w-full items-center justify-center rounded-2xl border border-[#E8D8C3] bg-[#F8F4ED] p-4 sm:min-h-[420px] sm:p-6 lg:p-8">
          {activeImage ? (
            <Image
              className="h-auto max-h-[420px] w-full max-w-[520px] rounded-xl object-contain sm:max-h-[560px] lg:max-h-[720px]"
              src={activeImage.url}
              alt={activeImage.altText ?? product.name}
              width={1200}
              height={1200}
              priority
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 50vw"
            />
          ) : (
            <p className="font-inter text-sm text-[#806B56]">
              No image available
            </p>
          )}
        </div>

        {images.length > 1 && (
          <ul className="flex flex-wrap gap-2">
            {images.map((image, index) => (
              <li key={image.id}>
                <button
                  type="button"
                  aria-label={`Show image ${index + 1}`}
                  aria-current={image.id === activeImage?.id}
                  onClick={() => setImageIndex(index)}
                  className={`overflow-hidden rounded-lg border-2 bg-[#F8F4ED] ${
                    image.id === activeImage?.id
                      ? "border-[#A87945]"
                      : "border-[#E8D8C3]"
                  }`}
                >
                  <Image
                    className="size-16 object-cover"
                    src={image.url}
                    alt=""
                    width={64}
                    height={64}
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Details */}
      <div className="flex w-full min-w-0 items-center justify-center">
        <div className="w-full max-w-xl">
          <nav aria-label="Breadcrumb" className="mb-3 text-sm text-[#806B56]">
            <Link
              href={`/categories/${encodeURIComponent(product.category.slug)}`}
              className="hover:text-[#A87945] hover:underline"
            >
              {product.category.name}
            </Link>

            {product.brand && <span> · {product.brand.name}</span>}
          </nav>

          <h1 className="mb-3 font-inter text-2xl font-bold leading-tight tracking-normal text-[#4B3621] sm:text-3xl lg:text-4xl">
            {product.name}
          </h1>

          <p className="mb-4 font-inter text-2xl font-bold text-[#A87945]">
            {formatPrice(price)}
          </p>

          {description && (
            <p className="mb-8 font-inter text-base leading-7 text-[#806B56] sm:text-lg sm:leading-8">
              {description}
            </p>
          )}

          <AddToCartForm
            product={product}
            colorId={colorId}
            sizeId={sizeId}
            selectedVariant={selectedVariant}
            onColorChange={handleColorChange}
            onSizeChange={setSizeId}
          />
        </div>
      </div>
    </article>
  );
}