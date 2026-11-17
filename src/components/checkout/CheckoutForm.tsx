"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import type { ReactElement } from "react";
import { useForm, useWatch } from "react-hook-form";

import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useCreateOrderMutation } from "@/features/order/api/orderApi";
import {
  describeUnavailableItem,
  getCheckoutFailure,
} from "@/features/order/lib/checkout-errors";
import {
  clearCheckoutIdempotencyKey,
  getCheckoutIdempotencyKey,
} from "@/features/order/lib/idempotency-key";
import type {
  CheckoutUnavailableItem,
  CreateOrderPayload,
  OrderDetail,
  PaymentMethod,
} from "@/features/order/types/order.types";
import { useStartPaymentMutation } from "@/features/payment/api/paymentApi";
import { getCheckoutDestination } from "@/features/payment/lib/checkout-redirect";
import { baseApi } from "@/lib/api/baseApi";
import {
  DEFAULT_SHIPPING_COUNTRY,
  SHIPPING_COUNTRIES,
} from "@/lib/constants/shippingCountries";
import { checkoutFormSchema } from "@/lib/validations/checkout.schema";
import type { CheckoutFormValues } from "@/lib/validations/checkout.schema";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

interface CheckoutFormProps {
  canCheckout: boolean;
  onPlaced: (orderId: string, paymentUrl?: string) => void;
}

const SELECT_CLASS =
  "h-11 w-full rounded-lg border border-[#E8D8C3] bg-white px-3 text-sm text-[#4B3621] shadow-sm outline-none hover:border-[#D6B58A] focus-visible:border-[#A87945] focus-visible:ring-2 focus-visible:ring-[#D6B58A]/40";

const PAYMENT_OPTIONS: readonly {
  value: PaymentMethod;
  label: string;
  description: string;
}[] = [
  {
    value: "COD",
    label: "Cash on delivery",
    description: "You pay when you receive your order.",
  },
  {
    value: "ONLINE",
    label: "Pay online",
    description:
      "You will be taken to the payment page right after placing the order.",
  },
];

/**
 * Builds the API payload from the form values (empty optional fields are left out).
 *
 * @param {CheckoutFormValues} values - Validated form values.
 * @returns {CreateOrderPayload} The payload.
 */
function toPayload(values: CheckoutFormValues): CreateOrderPayload {
  return {
    shippingName: values.shippingName,
    shippingPhone: values.shippingPhone,
    shippingCountry: values.shippingCountry,
    shippingCity: values.shippingCity,
    shippingAddress: values.shippingAddress,
    shippingNotes: values.shippingNotes || undefined,
    customerNote: values.customerNote || undefined,
    paymentMethod: values.paymentMethod,
  };
}

/**
 * Delivery details form that places the order, paid on delivery or online.
 *
 * For an online order, the payment page is opened right after the order is
 * created. If that fails, the order still exists and its page offers a
 * "Pay now" button, so nothing is lost.
 *
 * @param {CheckoutFormProps} props - Component props.
 * @param {boolean} props.canCheckout - False when the bag is empty or has items that cannot be ordered.
 * @param {(orderId: string, paymentUrl?: string) => void} props.onPlaced - Called with the new order id and, for online orders, the address of the payment page.
 * @returns {JSX.Element} The form.
 */
export function CheckoutForm({
  canCheckout,
  onPlaced,
}: CheckoutFormProps): ReactElement {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [createOrder] = useCreateOrderMutation();
  const [startPayment] = useStartPaymentMutation();
  const [unavailableItems, setUnavailableItems] = useState<
    CheckoutUnavailableItem[]
  >([]);

  const {
    register,
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isValid, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      shippingName: user ? `${user.firstName} ${user.lastName}`.trim() : "",
      shippingPhone: "",
      shippingCountry: DEFAULT_SHIPPING_COUNTRY,
      shippingCity: "",
      shippingAddress: "",
      shippingNotes: "",
      customerNote: "",
      paymentMethod: "COD",
    },
    mode: "onChange",
  });

  const paymentMethod = useWatch({ control, name: "paymentMethod" });

  /**
   * Opens the checkout session of a new online order.
   *
   * @param {string} orderId - The order just created.
   * @returns {Promise<string | undefined>} The payment page address, or undefined when it could not be opened.
   */
  const getPaymentUrl = async (orderId: string): Promise<string | undefined> => {
    try {
      const attempt = await startPayment(orderId).unwrap();

      return attempt.checkoutUrl
        ? (getCheckoutDestination(attempt.checkoutUrl, orderId) ?? undefined)
        : undefined;
    } catch {
      // The order exists: its page offers "Pay now" to try again.
      return undefined;
    }
  };

  /**
   * Places the order. The same Idempotency-Key is reused until it succeeds.
   *
   * @param {CheckoutFormValues} values - Validated form values.
   * @returns {Promise<void>}
   */
  const onSubmit = async (values: CheckoutFormValues): Promise<void> => {
    clearErrors("root");
    setUnavailableItems([]);

    let order: OrderDetail;

    try {
      order = await createOrder({
        body: toPayload(values),
        idempotencyKey: getCheckoutIdempotencyKey(),
      }).unwrap();
    } catch (error: unknown) {
      const failure = getCheckoutFailure(error);

      setUnavailableItems(failure.unavailableItems);
      setError("root", { type: "server", message: failure.message });

      if (failure.unavailableItems.length > 0) {
        // Stock changed since the page loaded: refresh the bag.
        dispatch(baseApi.util.invalidateTags(["Cart"]));
      }

      return;
    }

    clearCheckoutIdempotencyKey();

    const paymentUrl =
      values.paymentMethod === "ONLINE" ? await getPaymentUrl(order.id) : undefined;

    onPlaced(order.id, paymentUrl);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-labelledby="delivery-title"
      className="flex flex-col gap-5 rounded-2xl border border-[#E8D8C3] bg-white p-5 shadow-sm sm:p-7"
    >
      <h2 id="delivery-title" className="text-lg font-bold text-[#4B3621]">
        Delivery details
      </h2>

      <FormField
        id="shippingName"
        label="Full name"
        autoComplete="name"
        maxLength={150}
        registration={register("shippingName")}
        error={errors.shippingName?.message}
      />

      <FormField
        id="shippingPhone"
        label="Phone"
        type="tel"
        autoComplete="tel"
        placeholder="+963 912 345 678"
        registration={register("shippingPhone")}
        error={errors.shippingPhone?.message}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="shippingCountry"
            className="text-sm font-semibold text-[#4B3621]"
          >
            Country
          </Label>

          <select
            id="shippingCountry"
            autoComplete="country"
            aria-invalid={Boolean(errors.shippingCountry)}
            className={SELECT_CLASS}
            {...register("shippingCountry")}
          >
            {SHIPPING_COUNTRIES.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>

          {errors.shippingCountry?.message && (
            <p role="alert" className="text-xs font-medium text-red-600">
              {errors.shippingCountry.message}
            </p>
          )}
        </div>

        <FormField
          id="shippingCity"
          label="City"
          autoComplete="address-level2"
          maxLength={100}
          registration={register("shippingCity")}
          error={errors.shippingCity?.message}
        />
      </div>

      <FormField
        id="shippingAddress"
        label="Address"
        autoComplete="street-address"
        maxLength={300}
        placeholder="Street, building, apartment"
        registration={register("shippingAddress")}
        error={errors.shippingAddress?.message}
      />

      <FormField
        id="shippingNotes"
        label="Delivery notes (optional)"
        maxLength={300}
        registration={register("shippingNotes")}
        error={errors.shippingNotes?.message}
      />

      <FormField
        id="customerNote"
        label="Note to the store (optional)"
        maxLength={500}
        registration={register("customerNote")}
        error={errors.customerNote?.message}
      />

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-sm font-semibold text-[#4B3621]">
          Payment method
        </legend>

        {PAYMENT_OPTIONS.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-start gap-3 rounded-lg border border-[#E8D8C3] bg-[#F8F4ED] p-3 text-sm has-[:checked]:border-[#A87945] has-[:checked]:bg-white"
          >
            <input
              type="radio"
              value={option.value}
              className="mt-1 accent-[#A87945]"
              {...register("paymentMethod")}
            />

            <span>
              <span className="block font-semibold text-[#4B3621]">
                {option.label}
              </span>

              <span className="block text-xs text-[#806B56]">
                {option.description}
              </span>
            </span>
          </label>
        ))}
      </fieldset>

      {errors.root?.message && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <p>{errors.root.message}</p>

          {unavailableItems.length > 0 && (
            <ul className="mt-2 list-disc ps-5">
              {unavailableItems.map((item) => (
                <li key={item.variantId}>{describeUnavailableItem(item)}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <Button
        type="submit"
        disabled={!isValid || isSubmitting || !canCheckout}
        className="w-full rounded-lg bg-[#A87945] py-5 font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#4B3621] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting
          ? "Placing order..."
          : paymentMethod === "ONLINE"
            ? "Place order and pay"
            : "Place order"}
      </Button>
    </form>
  );
}