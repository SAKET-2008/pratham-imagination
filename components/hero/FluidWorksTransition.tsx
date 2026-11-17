"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import "./fluid-works-transition.css";

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const smooth = (value: number, start: number, end: number) => {
  const amount = clamp((value - start) / (end - start), 0, 1);
  return amount * amount * (3 - 2 * amount);
};

export default function FluidWorksTransition() {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let frame = 0;
    let previousProgress = -1;

    const updateProgress = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const scrollDistance = Math.max(
          section.offsetHeight - window.innerHeight,
          1,
        );
        const nextProgress = clamp(
          -section.getBoundingClientRect().top / scrollDistance,
          0,
          1,
        );

        if (Math.abs(nextProgress - previousProgress) > 0.004) {
          previousProgress = nextProgress;
          setProgress(nextProgress);
        }
      });
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  // First opening reveals WORKS; the shutter closes over it, then opens again
  // on CATALOGUES before the real catalogue experience follows below.
  const firstOpening = smooth(progress, 0.03, 0.3);
  const firstClosing = smooth(progress, 0.43, 0.57);
  const secondOpening = smooth(progress, 0.68, 0.91);
  const aperture = Math.max(
    firstOpening * (1 - firstClosing),
    secondOpening,
  );
  const radius = aperture * 145;
  const worksOpacity =
    smooth(progress, 0.17, 0.34) * (1 - smooth(progress, 0.44, 0.56));
  const catalogueOpacity = smooth(progress, 0.78, 0.94);
  const apertureStyle = {
    "--aperture-radius": `${radius}vmax`,
    "--aperture-diameter": `${radius * 2}vmax`,
  } as CSSProperties;

  return (
    <section
      ref={sectionRef}
      className="fluid-transition"
      aria-label="Work and catalogue transition"
    >
      <div className="fluid-transition-stage">
        <div className="fluid-underlay" aria-hidden="true" />

        <div
          className="fluid-transition-title fluid-transition-title-works"
          style={{
            opacity: worksOpacity,
            transform: `translate3d(0, ${(1 - worksOpacity) * 55}px, 0) scale(${0.9 + worksOpacity * 0.1})`,
          }}
        >
          <p className="fluid-eyebrow">SELECTED CREATIONS / 2026</p>
          <h2>WORKS<span>.</span></h2>
        </div>

        <div
          className="fluid-transition-title fluid-transition-title-catalogues"
          style={{
            opacity: catalogueOpacity,
            transform: `translate3d(0, ${(1 - catalogueOpacity) * 45}px, 0) scale(${0.94 + catalogueOpacity * 0.06})`,
          }}
        >
          <p className="fluid-eyebrow">THE PRINT COLLECTION</p>
          <h2>CATALOGUES<span>.</span></h2>
        </div>

        <div
          className="fluid-fill"
          style={apertureStyle}
          aria-hidden="true"
        >
          <div className="fluid-wave fluid-wave-top" />
          <div className="fluid-wave fluid-wave-bottom" />
          <div className="fluid-blob fluid-blob-one" />
          <div className="fluid-blob fluid-blob-two" />
          <div className="fluid-blob fluid-blob-three" />
          <div className="fluid-aperture-ring" />
        </div>

        <div className="fluid-transition-hint">
          <span>Scroll to open</span>
          <span aria-hidden="true">↓</span>
        </div>
      </div>
    </section>
  );
}
