import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactElement } from "react";

import { SingleProduct } from "@/components/products/singleProduct/SingleProduct";
import { getProductBySlug } from "@/features/product/api/product.server";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Builds SEO metadata from the product data returned by the backend.
 *
 * @param props - Page props.
 * @returns The page metadata.
 */
export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product not found" };
  }

  const title = product.metaTitle ?? product.name;
  const description = product.metaDescription ?? product.shortDescription ?? undefined;
  const image = product.images[0]?.url;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

/**
 * Product details page, rendered on the server.
 *
 * @param props - Page props.
 * @returns The product page.
 */
export default async function ProductPage({
  params,
}: ProductPageProps): Promise<ReactElement> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return <SingleProduct product={product} />;
}