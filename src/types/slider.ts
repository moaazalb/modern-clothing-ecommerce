import type { StaticImageData } from "next/image";

/**
 * A slide of the home page hero slider.
 */
export interface HeroSlide {
  id: number;
  img: StaticImageData;
  alt: string;
  text: string;
}