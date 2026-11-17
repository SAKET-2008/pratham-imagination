"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

export default function HeroText() {
  const container =
    useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!container.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-create",
        {
          yPercent: 120,
          opacity: 0,
        },
        {
          yPercent: 0,
          opacity: 1,
          duration: 1.5,
          delay: 0.45,
          ease: "power4.out",
        }
      );

      gsap.fromTo(
        ".hero-subtitle",
        {
          y: 20,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 1.1,
          delay: 1.05,
          ease: "power3.out",
        }
      );
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={container}
      className="
        pointer-events-none
        absolute
        inset-0
        z-10
        flex
        items-center
      "
    >
      <div
        className="
          w-full
          px-6
          md:px-12
        "
      >

        {/* =============================================
            WE CREATE
        ============================================= */}

        <div className="overflow-hidden">
          <h1
            className="
              hero-create

              w-fit

              whitespace-nowrap

              text-[15vw]
              md:text-[13.5vw]

              font-medium

              leading-[0.76]

              tracking-[-0.085em]

              text-[#f1f0eb]
            "
          >
            WE CREATE
          </h1>
        </div>


        {/* =============================================
            SUBTITLE
        ============================================= */}

        <div
          className="
            hero-subtitle

            mt-7

            ml-[2px]
            md:ml-[11vw]

            max-w-md
          "
        >
          <p
            className="
              text-[9px]
              md:text-xs

              uppercase

              leading-[1.8]

              tracking-[0.28em]

              text-white/40
            "
          >
            Through branding, advertising
            <br />
            and digital experiences.
          </p>
        </div>

      </div>
    </div>
  );
}