/**
 * A color assigned to a cart item.
 */
export interface CartItemColor {
  id: string;
  name: string;
  slug: string;
  hexCode: string;
}

/**
 * A size assigned to a cart item.
 */
export interface CartItemSize {
  id: string;
  name: string;
  code: string;
  sizeType: "APPAREL" | "FOOTWEAR";
  sortOrder: number;
}

/**
 * Reasons why a cart item cannot currently be purchased.
 */
export type CartItemIssue =
  | "UNAVAILABLE"
  | "OUT_OF_STOCK"
  | "INSUFFICIENT_STOCK";

/**
 * Represents one product variant in the authenticated user's cart.
 */
export interface CartItem {
  id: string;
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  sku: string;
  color: CartItemColor;
  size: CartItemSize | null;
  imageUrl: string | null;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
  available: boolean;
  issue: CartItemIssue | null;
  maxQuantity: number;
}

/**
 * Represents the authenticated user's cart returned by the API.
 */
export interface CartResponse {
  items: CartItem[];
  itemCount: number;
  subtotal: string;
  currency: string;
  hasUnavailableItems: boolean;
}

/**
 * Payload used to add a product variant to the cart.
 */
export interface AddCartItemPayload {
  variantId: string;
  quantity: number;
}

/**
 * Payload used to update an existing cart item's quantity.
 */
export interface UpdateCartItemPayload {
  quantity: number;
}