
"use client";

import type { ReactElement } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FILTER_BUTTON_CLASS } from "@/components/products/FilterButton";

export interface FilterOption {
  label: string;
  value: string;
  color?: string;
}

interface FilterMenuProps {
  label: string;
  options: readonly FilterOption[];
  onSelect: (value: string) => void;
  isDisabled?: boolean;
  isColorMenu?: boolean;
}

/**
 * Button that opens a dropdown of filter options.
 *
 * @param {FilterMenuProps} props - Component props.
 * @returns {JSX.Element} The filter menu.
 */
export function FilterMenu({
  label,
  options,
  onSelect,
  isDisabled = false,
  isColorMenu = false,
}: FilterMenuProps): ReactElement {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={isDisabled}
          className={`
            ${FILTER_BUTTON_CLASS}
            gap-2
            disabled:cursor-not-allowed
            disabled:opacity-50
          `}
        >
          {label}

          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="
          z-50
          max-h-60
          w-[var(--radix-dropdown-menu-trigger-width)]
          overflow-y-auto
          rounded-lg
          border border-[#E8D8C3]
          bg-[#F8F4ED]
          p-1.5
          shadow-lg
          shadow-[#4B3621]/10
        "
      >
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onSelect={() => onSelect(option.value)}
            className="
              cursor-pointer
              rounded-md
              px-3
              py-2.5
              text-sm
              font-medium
              text-[#4B3621]
              transition-colors
              duration-200
              focus:bg-[#E8D8C3]
              focus:text-[#4B3621]
            "
          >
            {isColorMenu && (
              <span
                aria-hidden="true"
                className="mr-2 inline-block size-3 rounded-full border border-[#D6B58A]"
                style={{ backgroundColor: option.color }}
              />
            )}

            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
