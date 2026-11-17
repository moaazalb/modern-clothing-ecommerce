import Link from "next/link";
import type { ReactElement } from "react";

import { ProductCard } from "@/components/products/ProductCard";
import { getProducts } from "@/features/product/api/product.server";

const NEW_ARRIVALS_COUNT = 6;

/**
 * Home page section with the newest products.
 *
 * @returns The section, or an empty state when there are no products.
 */
export async function ProductSection(): Promise<ReactElement> {
  const { items } = await getProducts({
    page: 1,
    limit: NEW_ARRIVALS_COUNT,
    sort: "newest",
  });

  return (
    <section
      aria-labelledby="new-arrivals-title"
      className="w-full px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12"
    >
      <div className="mx-auto w-full max-w-3xl rounded-lg border border-[#D6B58A] bg-[#4B3621] p-3 shadow-sm sm:p-4">
        <h2
          id="new-arrivals-title"
          className="text-center font-inter text-base font-bold leading-relaxed tracking-normal text-[#F8F4ED] sm:text-lg md:text-xl"
        >
          New Arrivals
        </h2>
      </div>

      {items.length === 0 ? (
        <p
          role="status"
          className="py-12 text-center font-inter text-base text-[#806B56] sm:text-lg"
        >
          No products available
        </p>
      ) : (
        <>
          <ul className="mx-auto grid max-w-7xl grid-cols-1 justify-items-center gap-6 py-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8 xl:gap-10">
            {items.map((product) => (
              <li key={product.id} className="w-full min-w-0 max-w-sm">
                <ProductCard product={product} />
              </li>
            ))}
          </ul>

          <div className="text-center">
            <Link
              href="/products"
              className="font-inter text-sm font-semibold text-[#A87945] underline-offset-4 hover:underline"
            >
              View all products
            </Link>
          </div>
        </>
      )}
    </section>
  );
}