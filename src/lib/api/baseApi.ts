import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQueryWithReauth } from "./baseQueryWithReauth";

/**
 * Central API instance shared across application features.
 *
 * Feature-specific endpoints are injected into this instance.
 */
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,

  tagTypes: [
    "User",
    "Session",
    "Product",
    "Category",
    "Cart",
    "Order",
    "Brand",
    "Color",
    "Size",
    "Tag",
    "Payment",
  ],

  endpoints: () => ({}),
});
