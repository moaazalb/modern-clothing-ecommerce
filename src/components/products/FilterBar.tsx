"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import type { FormEvent, ReactElement } from "react";

import { FILTER_BUTTON_CLASS } from "@/components/products/FilterButton";
import { FilterMenu } from "@/components/products/FilterMenu";
import type { FilterOption } from "@/components/products/FilterMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  PublicColor,
  PublicSize,
} from "@/features/catalog/types/catalog.types";

interface FilterBarProps {
  colors: PublicColor[];
  sizes: PublicSize[];
}

const FILTER_KEYS = [
  "gender",
  "sort",
  "colorId",
  "sizeId",
  "inStock",
  "minPrice",
  "maxPrice",
  "q",
] as const;

const GENDER_OPTIONS: readonly FilterOption[] = [
  { label: "All genders", value: "" },
  { label: "Men", value: "MEN" },
  { label: "Women", value: "WOMEN" },
  { label: "Unisex", value: "UNISEX" },
];

const SORT_OPTIONS: readonly FilterOption[] = [
  { label: "Newest", value: "" },
  { label: "Price: low to high", value: "price_asc" },
  { label: "Price: high to low", value: "price_desc" },
];

/**
 * Builds a menu label that shows the current selection.
 *
 * @param base - Label when nothing is selected.
 * @param options - The menu options.
 * @param value - The selected value.
 * @returns The label.
 */
function buildLabel(
  base: string,
  options: readonly FilterOption[],
  value: string,
): string {
  const selected = value
    ? options.find((option) => option.value === value)
    : undefined;

  return selected ? `${base}: ${selected.label}` : base;
}

/**
 * Filter controls. Every change updates the URL (and resets the page), so
 * the server renders the new result and the link can be shared.
 *
 * @param props - Component props.
 * @param props.colors - Active colors for the color menu.
 * @param props.sizes - Active sizes for the size menu.
 * @returns The filter bar.
 */
export function FilterBar({ colors, sizes }: FilterBarProps): ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const colorOptions: FilterOption[] = [
    { label: "All colors", value: "" },
    ...colors.map((color) => ({
      label: color.name,
      value: color.id,
      color: color.hexCode,
    })),
  ];

  const sizeOptions: FilterOption[] = [
    { label: "All sizes", value: "" },
    ...sizes.map((size) => ({ label: size.name, value: size.id })),
  ];

  const hasActiveFilters = FILTER_KEYS.some((key) => searchParams.has(key));
  const isInStockOnly = searchParams.get("inStock") === "true";

  /**
   * Updates query parameters (an empty value removes the parameter).
   *
   * @param changes - Parameters to set or remove.
   * @returns {void}
   */
  const updateParams = (changes: Record<string, string>): void => {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(changes)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }

    params.delete("page");

    const query = params.toString();

    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  };

  /**
   * Applies the search text and the price range.
   *
   * @param {FormEvent<HTMLFormElement>} event - Form submit event.
   * @returns {void}
   */
  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    updateParams({
      q: String(formData.get("q") ?? "").trim(),
      minPrice: String(formData.get("minPrice") ?? "").trim(),
      maxPrice: String(formData.get("maxPrice") ?? "").trim(),
    });
  };

  /**
   * Removes every filter.
   *
   * @returns {void}
   */
  const handleClear = (): void => {
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  const inputClass =
    "h-11 border-[#D6B58A] bg-white text-sm text-[#4B3621] focus-visible:ring-[#A87945]";

  return (
    <div
      aria-busy={isPending}
      className={`flex flex-col gap-3 transition-opacity ${isPending ? "opacity-60" : ""}`}
    >
      <div className="flex flex-wrap items-center gap-3">
        <FilterMenu
          label={buildLabel("Gender", GENDER_OPTIONS, searchParams.get("gender") ?? "")}
          options={GENDER_OPTIONS}
          onSelect={(value) => updateParams({ gender: value })}
          isDisabled={isPending}
        />

        <FilterMenu
          label={buildLabel("Color", colorOptions, searchParams.get("colorId") ?? "")}
          options={colorOptions}
          onSelect={(value) => updateParams({ colorId: value })}
          isDisabled={isPending}
          isColorMenu
        />

        <FilterMenu
          label={buildLabel("Size", sizeOptions, searchParams.get("sizeId") ?? "")}
          options={sizeOptions}
          onSelect={(value) => updateParams({ sizeId: value })}
          isDisabled={isPending}
        />

        <FilterMenu
          label={buildLabel("Sort", SORT_OPTIONS, searchParams.get("sort") ?? "")}
          options={SORT_OPTIONS}
          onSelect={(value) => updateParams({ sort: value })}
          isDisabled={isPending}
        />

        <Button
          type="button"
          variant="outline"
          size="lg"
          aria-pressed={isInStockOnly}
          disabled={isPending}
          onClick={() => updateParams({ inStock: isInStockOnly ? "" : "true" })}
          className={`${FILTER_BUTTON_CLASS} ${
            isInStockOnly ? "border-[#A87945] bg-[#A87945] text-white" : ""
          }`}
        >
          In stock only
        </Button>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="lg"
            disabled={isPending}
            onClick={handleClear}
            className="text-[#806B56] hover:text-[#4B3621]"
          >
            Clear filters
          </Button>
        )}
      </div>

      <form
        key={searchParams.toString()}
        onSubmit={handleSubmit}
        className="flex flex-wrap items-center gap-3"
      >
        <Input
          name="q"
          type="search"
          aria-label="Search products"
          placeholder="Search products"
          maxLength={100}
          defaultValue={searchParams.get("q") ?? ""}
          className={`${inputClass} w-full sm:w-64`}
        />

        <Input
          name="minPrice"
          inputMode="decimal"
          aria-label="Minimum price"
          placeholder="Min $"
          pattern="\d{1,8}(\.\d{1,2})?"
          title="Use a price such as 20 or 19.99"
          defaultValue={searchParams.get("minPrice") ?? ""}
          className={`${inputClass} w-28`}
        />

        <Input
          name="maxPrice"
          inputMode="decimal"
          aria-label="Maximum price"
          placeholder="Max $"
          pattern="\d{1,8}(\.\d{1,2})?"
          title="Use a price such as 100 or 99.99"
          defaultValue={searchParams.get("maxPrice") ?? ""}
          className={`${inputClass} w-28`}
        />

        <Button type="submit" size="lg" disabled={isPending} className="bg-[#4B3621] text-white hover:bg-[#A87945]">
          Apply
        </Button>
      </form>
    </div>
  );
}