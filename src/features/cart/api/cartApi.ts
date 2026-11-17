import { baseApi } from "@/lib/api/baseApi";

import type {
  AddCartItemPayload,
  CartResponse,
  UpdateCartItemPayload,
} from "@/features/cart/types/cart.types";

/**
 * Cart endpoints injected into the central API instance.
 *
 * Cart data is managed by the backend and cached through RTK Query.
 */
export const cartApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Retrieves the authenticated user's cart.
     */
    getCart: builder.query<CartResponse, void>({
      query: () => ({
        url: "cart",
        method: "GET",
      }),
      providesTags: ["Cart"],
    }),

    /**
     * Adds a product variant to the authenticated user's cart.
     */
    addCartItem: builder.mutation<CartResponse, AddCartItemPayload>({
      query: (body) => ({
        url: "cart/items",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Cart"],
    }),

    /**
     * Replaces the quantity of an existing cart item.
     */
    updateCartItem: builder.mutation<
      CartResponse,
      { itemId: string } & UpdateCartItemPayload
    >({
      query: ({ itemId, quantity }) => ({
        url: `cart/items/${itemId}`,
        method: "PATCH",
        body: { quantity },
      }),
      invalidatesTags: ["Cart"],
    }),

    /**
     * Removes an item from the authenticated user's cart.
     */
    removeCartItem: builder.mutation<CartResponse, string>({
      query: (itemId) => ({
        url: `cart/items/${itemId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),

    /**
     * Removes all items from the authenticated user's cart.
     */
    clearCart: builder.mutation<CartResponse, void>({
      query: () => ({
        url: "cart",
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddCartItemMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
} = cartApi;