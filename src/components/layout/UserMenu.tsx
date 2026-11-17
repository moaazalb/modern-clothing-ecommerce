"use client";

import type { ReactElement } from "react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserMenuProps {
  displayName: string;
  image: string;
  onLogout: () => void;
}

/**
 * The user dropdown menu in the navbar.
 *
 * @param {UserMenuProps} props - Component props.
 * @param {string} props.displayName - The user's display name.
 * @param {string} props.image - The user's avatar image URL.
 * @param {() => void} props.onLogout - Called when the user signs out.
 * @returns {ReactElement} The user dropdown menu.
 */
export function UserMenu({
  displayName,
  image,
  onLogout,
}: UserMenuProps): ReactElement {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Open account menu for ${displayName}`}
          className="group flex cursor-pointer items-center gap-2 rounded-full px-2 py-1.5 transition-all duration-200 hover:bg-[#F8F4ED] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A87945] focus-visible:ring-offset-2"
        >
          <Avatar className="size-9 border border-[#D6B58A] shadow-sm transition-all duration-200 group-hover:border-[#A87945] group-hover:shadow-md sm:size-10">
            <AvatarImage src={image} alt={displayName} />

            <AvatarFallback className="bg-[#A87945] text-xs font-semibold text-white">
              {displayName?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>

          <div className="hidden flex-col items-start sm:flex">
            <span className="text-[11px] font-medium text-[#A87945]">
              Welcome
            </span>

            <span className="max-w-24 truncate text-sm font-semibold text-[#4B3621] transition-colors duration-200 group-hover:text-[#A87945]">
              {displayName}
            </span>
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-56 border border-[#E8D8C3] bg-white p-2 shadow-lg"
      >
        <DropdownMenuLabel className="px-3 py-2">
          <p className="text-sm font-semibold text-[#4B3621]">{displayName}</p>

          <p className="text-xs font-normal text-[#806B56]">
            Manage your account
          </p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-[#E8D8C3]" />

        <DropdownMenuItem
          asChild
          className="cursor-pointer rounded-md px-3 py-2 text-sm text-[#4B3621] focus:bg-[#F8F4ED] focus:text-[#A87945]"
        >
          <Link href="/profile">My Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          asChild
          className="cursor-pointer rounded-md px-3 py-2 text-sm text-[#4B3621] focus:bg-[#F8F4ED] focus:text-[#A87945]"
        >
          <Link href="/orders">My Orders</Link>
        </DropdownMenuItem>

        <DropdownMenuItem
          asChild
          className="cursor-pointer rounded-md px-3 py-2 text-sm text-[#4B3621] focus:bg-[#F8F4ED] focus:text-[#A87945]"
        >
          <Link href="/sessions">Active Sessions</Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-[#E8D8C3]" />

        <DropdownMenuItem
          onSelect={onLogout}
          className="cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-red-600 focus:bg-red-50 focus:text-red-700"
        >
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
