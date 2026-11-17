import type { HeroSlide } from "@/types/slider";

/**
 * Home page hero slides.
 *
 * This is editorial content (the backend has no banners module), so it
 * lives here and not in the API. Import the slide images from your assets
 * folder and add one entry per slide, for example:
 *
 *   import slideOne from "@/assets/slider/slide-1.jpg";
 *   { id: 1, img: slideOne, alt: "New summer collection", text: "..." },
 *
 * While the list is empty, the slider renders nothing.
 */
export const HERO_SLIDES: readonly HeroSlide[] = [];