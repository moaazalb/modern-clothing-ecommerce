"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactElement } from "react";
import { useRouter } from "next/navigation";

import logo from "../../../public/assets/images/logo.png";

import { CartButton } from "@/components/cart/CartButton";
import { UserMenu } from "@/components/layout/UserMenu";

import { useLogoutMutation } from "@/features/auth/api/authApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

import { capitalizeFirst } from "@/lib/utils/string/string";
import { baseApi } from "@/lib/api/baseApi";

/**
 * Main store navigation bar.
 *
 * @returns {JSX.Element} The application navbar.
 */
export function Navbar(): ReactElement {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const user = useAppSelector((state) => state.auth.user);

  const [logout] = useLogoutMutation();

  const displayName = user
    ? capitalizeFirst(`${user.firstName} ${user.lastName}`.trim())
    : "";

  /**
   * Logs out the current user and clears cached API data.
   *
   * @returns {Promise<void>}
   */
  const handleLogout = async (): Promise<void> => {
    try {
      await logout().unwrap();
    } catch {
      // Local authentication is cleared by the logout mutation.
    } finally {
      dispatch(baseApi.util.resetApiState());
      router.replace("/");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-[0_4px_20px_-12px_rgba(75,54,33,0.25)]">
      {/* Welcome Bar */}
      <div className="bg-[#4B3621] px-4 py-2 text-center text-xs text-[#F8F4ED] sm:text-sm">
        <p>
          {user ? "Welcome back," : "Welcome to our store"}

          {user && (
            <span className="ml-1 font-semibold text-[#D6B58A]">
              {displayName}
            </span>
          )}
        </p>
      </div>

      {/* Main Navbar */}
      <nav
        aria-label="Main navigation"
        className="border-b border-[#E8D8C3]/70 bg-white"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <Image
              src={logo}
              alt="Store logo"
              priority
              className="h-14 w-auto object-contain sm:h-16 md:h-20"
            />
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-3 sm:gap-5 md:gap-7">
            {/* Wishlist */}
            <button
              type="button"
              aria-label="Wishlist"
              className="group flex cursor-pointer items-center gap-2 text-[#806B56] transition-colors duration-200 hover:text-[#A87945]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.6"
                className="size-6 transition-transform duration-200 group-hover:scale-110"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>

              <span className="hidden text-sm font-medium sm:inline">
                Wishlist
              </span>
            </button>

            {/* Cart */}
            <div className="text-[#4B3621] transition-colors [&_button:hover]:text-[#A87945]">
              <CartButton />
            </div>

            {/* User */}
            <div className="border-l border-[#E8D8C3] pl-3 sm:pl-5">
              {user ? (
                <UserMenu
                  displayName={displayName}
                  image={user.avatar ?? ""}
                  onLogout={handleLogout}
                />
              ) : (
                <Link
                  href="/login"
                  className="text-sm font-semibold text-[#806B56] transition-colors hover:text-[#A87945]"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Shipping Announcement */}
      <div className="bg-[#F8F4ED] px-4 py-2.5 text-center">
        <p className="text-xs font-medium tracking-wide text-[#806B56] sm:text-sm">
          <span className="mr-2 text-[#A87945]">✦</span>
          Free shipping and returns on all orders
          <span className="ml-2 text-[#A87945]">✦</span>
        </p>
      </div>
    </header>
  );
}
