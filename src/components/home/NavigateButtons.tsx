import Link from "next/link";
import type { ReactElement } from "react";

import { Button } from "@/components/ui/button";
import type { PublicCategoryTreeNode } from "@/features/catalog/types/catalog.types";

interface NavigateButtonsProps {
  categories: readonly PublicCategoryTreeNode[];
}

/**
 * Row of category links. Each link opens the category page, which also
 * lists the products of its sub-categories.
 *
 * @param {NavigateButtonsProps} props - Component props.
 * @param {readonly PublicCategoryTreeNode[]} props.categories - Categories to link to (usually the roots of the category tree).
 * @returns {JSX.Element | null} The category navigation, or null when there are no categories.
 */
export function NavigateButtons({
  categories,
}: NavigateButtonsProps): ReactElement | null {
  if (categories.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Product categories" className="py-8">
      <ul className="flex flex-wrap items-center justify-center gap-3">
        {categories.map((category) => (
          <li key={category.id}>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="
                border-[#D6B58A]
                bg-[#F8F4ED]
                text-[#4B3621]
                shadow-sm
                transition-all duration-300 ease-in-out
                hover:border-[#A87945]
                hover:bg-[#A87945]
                hover:text-white
                focus-visible:ring-2
                focus-visible:ring-[#A87945]
                focus-visible:ring-offset-2
              "
            >
              <Link href={`/categories/${encodeURIComponent(category.slug)}`}>
                {category.name}
              </Link>
            </Button>
          </li>
        ))}
      </ul>
    </nav>
  );
}