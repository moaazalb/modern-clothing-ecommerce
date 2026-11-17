"use client";

import Image from "next/image";
import { useState } from "react";
import type { ReactElement } from "react";

import { SliderArrowButton } from "@/components/slider/SliderArrowButton";
import { SliderDots } from "@/components/slider/SliderDots";
import { HERO_SLIDES } from "@/lib/constants/heroSlides";

const ACTIVE_SLIDE_CLASS = "scale-100 opacity-100 duration-700 ease-in-out";
const INACTIVE_SLIDE_CLASS = "scale-95 opacity-0 duration-700 ease-in-out";

/**
 * Home page hero slider. The current slide is local UI state.
 * Renders nothing when there are no slides.
 *
 * @returns {JSX.Element | null} The slider, or null when there are no slides.
 */
export function Slider(): ReactElement | null {
  const [slideIndex, setSlideIndex] = useState<number>(0);

  const slideCount = HERO_SLIDES.length;

  if (slideCount === 0) return null;

  /**
   * Goes to the next slide (wraps to the first one after the last).
   *
   * @returns {void}
   */
  const handleNext = (): void => {
    setSlideIndex((current) => (current + 1) % slideCount);
  };

  /**
   * Goes to the previous slide (wraps to the last one before the first).
   *
   * @returns {void}
   */
  const handlePrevious = (): void => {
    setSlideIndex((current) => (current - 1 + slideCount) % slideCount);
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured collections"
      className="relative w-full overflow-hidden pb-6"
    >
      <div>
        {HERO_SLIDES.map((slide, index) => {
          const isActive = index === slideIndex;

          return (
            <div
              key={slide.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${slideCount}`}
              aria-hidden={!isActive}
              className={isActive ? ACTIVE_SLIDE_CLASS : INACTIVE_SLIDE_CLASS}
            >
              <div className="relative w-full">
                {isActive && (
                  <Image
                    className="h-[420px] w-full object-cover sm:h-[550px] md:h-[650px] lg:h-[750px] xl:h-[800px]"
                    src={slide.img}
                    alt={slide.alt}
                    sizes="100vw"
                    priority={index === 0}
                  />
                )}
              </div>

              <div className="absolute inset-x-4 top-1/2 mx-auto max-w-4xl -translate-y-1/2 text-center sm:inset-x-8">
                <p className="font-inter text-2xl font-bold leading-snug tracking-normal text-white drop-shadow-lg sm:text-3xl md:text-4xl lg:text-5xl">
                  {isActive && slide.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <SliderDots
        slides={HERO_SLIDES}
        activeIndex={slideIndex}
        onSelect={setSlideIndex}
      />

      <SliderArrowButton direction="next" onClick={handleNext} />
      <SliderArrowButton direction="prev" onClick={handlePrevious} />
    </section>
  );
}