"use client";

import { ReactNode, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./camera-shutter.css";

gsap.registerPlugin(ScrollTrigger);

type CameraShutterProps = {
  works: ReactNode;
  catalogueIntro: ReactNode;
};

export default function CameraShutter({
  works,
  catalogueIntro,
}: CameraShutterProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const shutterRef = useRef<HTMLDivElement>(null);
  const rimRef = useRef<HTMLDivElement>(null);
  const worksRef = useRef<HTMLDivElement>(null);
  const catalogueRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const shutter = shutterRef.current;
    const rim = rimRef.current;
    const worksLayer = worksRef.current;
    const catalogueLayer = catalogueRef.current;

    if (!section || !shutter || !rim || !worksLayer || !catalogueLayer) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(shutter, { "--aperture": "0vmax" });
      gsap.set(rim, { "--aperture": "0vmax" });
      gsap.set(rim, { opacity: 1, rotation: 0 });
      gsap.set(worksLayer, { opacity: 1 });
      gsap.set(catalogueLayer, { opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=500%",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // 1. Open shutter and reveal WORKS
      tl.to(shutter, {
        "--aperture": "180vmax",
        duration: 1.5,
        ease: "power2.inOut",
      });

      tl.to(
        rim,
        {
          rotation: 180,
          duration: 1.5,
          ease: "power2.inOut",
        },
        "<"
      );

      // 2. Close shutter over WORKS
      tl.to(shutter, {
        "--aperture": "0vmax",
        duration: 1.3,
        ease: "power2.inOut",
      });

      tl.to(
        rim,
        {
          rotation: 360,
          duration: 1.3,
          ease: "power2.inOut",
        },
        "<"
      );

      // 3. Switch from WORKS to Catalogue while covered
      tl.to(worksLayer, {
        opacity: 0,
        duration: 0.15,
      });

      tl.to(
        catalogueLayer,
        {
          opacity: 1,
          duration: 0.15,
        },
        "<"
      );

      // 4. Open shutter to reveal Catalogue
      tl.to(shutter, {
        "--aperture": "180vmax",
        duration: 1.5,
        ease: "power2.inOut",
      });

      tl.to(
        rim,
        {
          rotation: 540,
          duration: 1.5,
          ease: "power2.inOut",
        },
        "<"
      );

      // 5. Remove the shutter completely
      tl.to(
        [shutter, rim],
        {
          opacity: 0,
          duration: 0.5,
          ease: "power1.out",
        },
        "+=0.2"
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="camera-shutter-section">
      <div className="camera-shutter-stage">
        <div ref={worksRef} className="shutter-content shutter-works">
          {works}
        </div>

        <div
          ref={catalogueRef}
          className="shutter-content shutter-catalogue"
        >
          {catalogueIntro}
        </div>

        {/* Black shutter overlay */}
        <div ref={shutterRef} className="camera-shutter-overlay" />

        {/* Metallic aperture rim */}
        <div ref={rimRef} className="camera-shutter-rim">
          <div className="shutter-rim-inner" />
          <div className="shutter-rim-highlight" />
        </div>

        {/* Small camera-style centre detail */}
        <div className="shutter-centre-detail">
          <span>STUDIO / 001</span>
        </div>
      </div>
    </section>
  );
}