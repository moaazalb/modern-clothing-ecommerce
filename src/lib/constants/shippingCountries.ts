export interface ShippingCountry {
  code: string;
  name: string;
}

/**
 * Countries the store ships to (two-letter ISO codes, as the API expects).
 */
export const SHIPPING_COUNTRIES: readonly ShippingCountry[] = [
  { code: "SY", name: "Syria" },
  { code: "LB", name: "Lebanon" },
  { code: "JO", name: "Jordan" },
  { code: "TR", name: "Turkey" },
  { code: "IQ", name: "Iraq" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "EG", name: "Egypt" },
];

export const DEFAULT_SHIPPING_COUNTRY = "SY";