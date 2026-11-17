"use client";

import Link from "next/link";
import { useState } from "react";
import type { ReactElement } from "react";

import { Button } from "@/components/ui/button";
import { useAddCartItemMutation } from "@/features/cart/api/cartApi";
import {
  getProductColors,
  getSizesForColor,
} from "@/features/product/lib/variants";
import type {
  PublicProductDetail,
  PublicProductVariant,
} from "@/features/product/types/product.types";
import {
  getApiErrorMessage,
  isUnauthorizedError,
} from "@/lib/api/getApiErrorMessage";
import { showSuccess } from "@/lib/utils/alerts/alerts";

interface AddToCartFormProps {
  product: PublicProductDetail;
  colorId: string | null;
  sizeId: string | null;
  selectedVariant: PublicProductVariant | undefined;
  onColorChange: (colorId: string) => void;
  onSizeChange: (sizeId: string) => void;
}

const SELECT_CLASS =
  "h-11 w-full rounded-lg border border-[#D6B58A] bg-white px-3 text-sm text-[#4B3621] outline-none focus:ring-2 focus:ring-[#A87945] disabled:cursor-not-allowed disabled:opacity-50";

/**
 * Color and size selectors with the add-to-cart button.
 * The selection is owned by the parent so the gallery can follow the color.
 *
 * @param {AddToCartFormProps} props - Component props.
 * @returns {JSX.Element} The form.
 */
export function AddToCartForm({
  product,
  colorId,
  sizeId,
  selectedVariant,
  onColorChange,
  onSizeChange,
}: AddToCartFormProps): ReactElement {
  const [addCartItem, { isLoading }] = useAddCartItemMutation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [needsSignIn, setNeedsSignIn] = useState<boolean>(false);

  const colors = getProductColors(product);
  const sizes = colorId ? getSizesForColor(product, colorId) : [];
  const hasSizes = product.sizeType !== null;
  const canAdd = Boolean(selectedVariant?.inStock) && !isLoading;

  let buttonLabel = "Add to Cart";

  if (isLoading) {
    buttonLabel = "Adding...";
  } else if (!selectedVariant) {
    buttonLabel = "Unavailable";
  } else if (!selectedVariant.inStock) {
    buttonLabel = "Out of Stock";
  }

  /**
   * Adds the selected variant to the authenticated user's cart.
   *
   * @returns {Promise<void>}
   */
  const handleSubmit = async (): Promise<void> => {
    if (!selectedVariant || !canAdd) {
      return;
    }

    setErrorMessage(null);
    setNeedsSignIn(false);

    try {
      await addCartItem({
        variantId: selectedVariant.id,
        quantity: 1,
      }).unwrap();

      showSuccess(
        "Added to Cart!",
        `${product.name} has been added to your cart.`,
      );
    } catch (error) {
      if (isUnauthorizedError(error)) {
        setNeedsSignIn(true);
        return;
      }

      setErrorMessage(getApiErrorMessage(error));
    }
  };

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
        <div className="w-full min-w-0 flex-1">
          <label
            htmlFor="product-color"
            className="mb-2 block text-sm font-medium text-[#4B3621]"
          >
            Pick a color
          </label>

          <select
            id="product-color"
            value={colorId ?? ""}
            onChange={(event) => onColorChange(event.target.value)}
            disabled={colors.length === 0 || isLoading}
            className={SELECT_CLASS}
          >
            {colors.map((color) => (
              <option key={color.id} value={color.id}>
                {color.name}
              </option>
            ))}
          </select>
        </div>

        {hasSizes && (
          <div className="w-full min-w-0 flex-1">
            <label
              htmlFor="product-size"
              className="mb-2 block text-sm font-medium text-[#4B3621]"
            >
              Pick a size
            </label>

            <select
              id="product-size"
              value={sizeId ?? ""}
              onChange={(event) => onSizeChange(event.target.value)}
              disabled={sizes.length === 0 || isLoading}
              className={SELECT_CLASS}
            >
              {sizes.map(({ size, inStock }) => (
                <option key={size.id} value={size.id}>
                  {inStock ? size.name : `${size.name} (Out of stock)`}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={handleSubmit}
        disabled={!canAdd}
        className="w-full border-[#A87945] bg-[#A87945] px-8 font-semibold text-white shadow-sm transition-all duration-300 hover:border-[#4B3621] hover:bg-[#4B3621] hover:text-white focus-visible:ring-2 focus-visible:ring-[#A87945] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-[#D6B58A] disabled:bg-[#E8D8C3] disabled:text-[#806B56] sm:w-auto"
      >
        {buttonLabel}
      </Button>

      {needsSignIn && (
        <p role="alert" className="text-sm text-[#4B3621]">
          Please{" "}
          <Link href="/login" className="font-semibold text-[#A87945] underline">
            sign in
          </Link>{" "}
          to add items to your cart.
        </p>
      )}

      {errorMessage && (
        <p role="alert" className="text-sm text-red-700">
          {errorMessage}
        </p>
      )}
    </div>
  );
}