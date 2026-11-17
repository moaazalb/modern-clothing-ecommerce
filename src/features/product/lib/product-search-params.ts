import type {
  ProductGender,
  ProductListQueryParams,
  ProductSort,
} from "../types/product.types";

export const PRODUCTS_PER_PAGE = 12;

export type RawSearchParams = Record<string, string | string[] | undefined>;

const SORTS: readonly ProductSort[] = ["newest", "price_asc", "price_desc"];
const GENDERS: readonly ProductGender[] = ["MEN", "WOMEN", "UNISEX"];

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Same format the backend accepts: up to 8 integer digits and 2 decimals. */
const MONEY_REGEX = /^\d{1,8}(\.\d{1,2})?$/;

const MAX_SEARCH_LENGTH = 100;
const MAX_PAGE = 10_000;

/** Query keys that live in the URL (page, limit and category are handled apart). */
const URL_KEYS = [
  "sort",
  "gender",
  "colorId",
  "sizeId",
  "inStock",
  "minPrice",
  "maxPrice",
  "q",
] as const;

/**
 * Returns the first value of a search parameter.
 *
 * @param value - A string or a list of strings.
 * @returns The first string, or undefined.
 */
function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Checks that a value is one of the allowed strings.
 *
 * @param allowed - The allowed values.
 * @param value - The value to check.
 * @returns True when the value is allowed.
 */
function isOneOf<T extends string>(
  allowed: readonly T[],
  value: string,
): value is T {
  return (allowed as readonly string[]).includes(value);
}

/**
 * Parses the page number, falling back to 1 for anything invalid.
 *
 * @param value - Raw page parameter.
 * @returns A page between 1 and the maximum.
 */
function parsePage(value: string | undefined): number {
  const page = Number.parseInt(value ?? "", 10);

  return Number.isInteger(page) && page >= 1 && page <= MAX_PAGE ? page : 1;
}

/**
 * Converts the URL search parameters into a safe backend query.
 * Invalid values are dropped, so a hand-written URL can never make the
 * backend answer 400.
 *
 * @param raw - The searchParams of the page.
 * @returns The validated query (without categoryId).
 */
export function parseProductSearchParams(
  raw: RawSearchParams,
): ProductListQueryParams {
  const query: ProductListQueryParams = {
    page: parsePage(first(raw.page)),
    limit: PRODUCTS_PER_PAGE,
  };

  const sort = first(raw.sort);
  if (sort && isOneOf(SORTS, sort)) query.sort = sort;

  const gender = first(raw.gender);
  if (gender && isOneOf(GENDERS, gender)) query.gender = gender;

  const colorId = first(raw.colorId);
  if (colorId && UUID_REGEX.test(colorId)) query.colorId = colorId;

  const sizeId = first(raw.sizeId);
  if (sizeId && UUID_REGEX.test(sizeId)) query.sizeId = sizeId;

  if (first(raw.inStock) === "true") query.inStock = true;

  const minPrice = first(raw.minPrice);
  if (minPrice && MONEY_REGEX.test(minPrice)) query.minPrice = minPrice;

  const maxPrice = first(raw.maxPrice);
  if (maxPrice && MONEY_REGEX.test(maxPrice)) query.maxPrice = maxPrice;

  if (
    query.minPrice &&
    query.maxPrice &&
    Number(query.minPrice) > Number(query.maxPrice)
  ) {
    delete query.maxPrice;
  }

  const search = first(raw.q)?.trim();
  if (search) query.q = search.slice(0, MAX_SEARCH_LENGTH);

  return query;
}

/**
 * Builds a listing URL that keeps the active filters.
 *
 * @param basePath - Path of the listing page.
 * @param query - The active query.
 * @param page - Page number to link to.
 * @returns The URL with its query string.
 */
export function buildListingHref(
  basePath: string,
  query: ProductListQueryParams,
  page: number,
): string {
  const params = new URLSearchParams();

  for (const key of URL_KEYS) {
    const value = query[key];

    if (value !== undefined) {
      params.set(key, String(value));
    }
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const search = params.toString();

  return search ? `${basePath}?${search}` : basePath;
}