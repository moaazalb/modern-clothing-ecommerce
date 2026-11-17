
"use client";

import Image from "next/image";
import type { ReactElement } from "react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { CartItem } from "@/features/cart/types/cart.types";

interface CartItemRowProps {
  item: CartItem;
  currency: string;
  onRemove: (itemId: string) => void;
  isRemoving: boolean;
}

/**
 * One line of the shopping bag: image, details and a remove button.
 *
 * @param {CartItemRowProps} props - Component props.
 * @param {CartItem} props.item - The cart line to show.
 * @param {string} props.currency - The cart currency.
 * @param {(itemId: string) => void} props.onRemove - Called with the cart line ID.
 * @param {boolean} props.isRemoving - Whether a removal request is in progress.
 * @returns {JSX.Element} The cart line.
 */
export function CartItemRow({
  item,
  currency,
  onRemove,
  isRemoving,
}: CartItemRowProps): ReactElement {
  const itemLabel = `${item.productName}, ${item.color.name}${
    item.size ? `, size ${item.size.name}` : ""
  }`;

  const formatPrice = (price: string): string =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(Number(price));

  /**
   * Asks the parent to remove this cart line.
   *
   * @returns {void}
   */
  const handleRemove = (): void => {
    onRemove(item.id);
  };

  return (
    <li className="grid grid-cols-[104px_minmax(0,1fr)] gap-4 py-5 sm:grid-cols-[130px_minmax(0,1fr)] sm:gap-5">
      {/* Product Image and Name */}
      <div className="flex flex-col gap-2">
        <div className="relative overflow-hidden rounded-xl border border-[#E8D8C3] bg-[#F8F4ED]">
          {item.imageUrl ? (
            <Image
              className="h-[125px] w-full object-cover transition-transform duration-300 hover:scale-105 sm:h-[145px]"
              src={item.imageUrl}
              alt={item.productName}
              width={500}
              height={500}
              unoptimized
            />
          ) : (
            <div
              className="flex h-[125px] items-center justify-center text-xs text-[#806B56] sm:h-[145px]"
              aria-label="Product image unavailable"
            >
              No image
            </div>
          )}
        </div>

        <h3 className="line-clamp-2 text-sm font-bold leading-5 text-[#4B3621] sm:text-base">
          {item.productName}
        </h3>
      </div>

      {/* Product Details */}
      <div className="flex min-w-0 flex-col justify-between gap-3">
        <div className="space-y-2.5">
          {item.size && (
            <p className="text-xs leading-5 text-[#806B56] sm:text-sm">
              Selected size:
              <span className="ml-2 font-semibold text-[#4B3621]">
                {item.size.name}
              </span>
            </p>
          )}

          <div className="flex items-center gap-2 text-xs text-[#806B56] sm:text-sm">
            <span>Selected color:</span>

            <span
              role="img"
              aria-label={`Color ${item.color.name}`}
              className="size-5 shrink-0 rounded-full border border-[#D6B58A] shadow-sm"
              style={{ backgroundColor: item.color.hexCode }}
            />

            <span className="font-semibold text-[#4B3621]">
              {item.color.name}
            </span>
          </div>

          <p className="text-xs leading-5 text-[#806B56] sm:text-sm">
            Quantity:
            <span className="ml-2 font-semibold text-[#4B3621]">
              {item.quantity}
            </span>
          </p>

          <p className="text-xs leading-5 text-[#806B56] sm:text-sm">
            Unit price:
            <span className="ml-2 font-semibold text-[#4B3621]">
              {formatPrice(item.unitPrice)}
            </span>
          </p>

          {!item.available && (
            <p className="text-xs font-semibold leading-5 text-red-700">
              {item.issue === "OUT_OF_STOCK"
                ? "Out of stock"
                : item.issue === "INSUFFICIENT_STOCK"
                  ? `Only ${item.maxQuantity} available`
                  : "This item is unavailable"}
            </p>
          )}
        </div>

        {/* Price and Remove Button */}
        <div className="flex flex-wrap items-end justify-between gap-2 border-t border-[#E8D8C3] pt-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-[#806B56] sm:text-xs">
              Total price
            </p>

            <p className="mt-1 text-lg font-bold tracking-tight text-[#A87945] sm:text-xl">
              {formatPrice(item.lineTotal)}
            </p>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant="outline"
                aria-label={`Remove ${itemLabel} from the cart`}
                onClick={handleRemove}
                disabled={isRemoving}
                className="h-8 rounded-lg border-[#D6B58A] bg-white px-3 text-xs font-semibold text-[#A87945] transition-all hover:border-[#A87945] hover:bg-[#A87945] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="mr-1.5 size-4"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 7h12m-10 0V5a1 1 0 011-1h6a1 1 0 011 1v2m2 0l-.8 13H6.8L6 7m4 4v5m4-5v5"
                  />
                </svg>
                Remove
              </Button>
            </TooltipTrigger>

            <TooltipContent
              side="bottom"
              className="border border-[#E8D8C3] bg-[#4B3621] text-[#F8F4ED]"
            >
              Remove from the Cart
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </li>
  );
}
