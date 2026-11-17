"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import gsap from "gsap";

import HeroScene from "./HeroScene";

const LOGO_IMAGE = "/images/logo.png";

export default function Hero() {
  const hero = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLDivElement>(null);

  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  /* =====================================================
     SCROLL PROGRESS
  ===================================================== */

  useEffect(() => {
    const updateProgress = () => {
      if (!hero.current) return;

      const rect =
        hero.current.getBoundingClientRect();

      const distance =
        hero.current.offsetHeight -
        window.innerHeight;

      if (distance <= 0) return;

      const value = THREE_CLAMP(
        -rect.top / distance
      );

      setProgress(value);
    };

    updateProgress();

    window.addEventListener(
      "scroll",
      updateProgress,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      updateProgress
    );

    return () => {
      window.removeEventListener(
        "scroll",
        updateProgress
      );

      window.removeEventListener(
        "resize",
        updateProgress
      );
    };
  }, []);

  /* =====================================================
     PRELOADER
  ===================================================== */

  useEffect(() => {
    const duration = 1200;
    const startTime = performance.now();
    let frame = 0;

    const updateLoadingProgress = (now: number) => {
      const nextProgress = Math.min(
        100,
        Math.round(((now - startTime) / duration) * 100),
      );
      setLoadingProgress(nextProgress);

      if (nextProgress === 100) {
        setLoaded(true);
        return;
      }

      frame = requestAnimationFrame(updateLoadingProgress);
    };

    frame = requestAnimationFrame(updateLoadingProgress);

    return () => cancelAnimationFrame(frame);
  }, []);

  /* =====================================================
     NAV ENTRANCE
  ===================================================== */

  useEffect(() => {
    if (!loaded || !hero.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-nav",
        {
          opacity: 0,
          y: -20,
        },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power4.out",
        }
      );
    }, hero);

    return () => ctx.revert();
  }, [loaded]);

  /* =====================================================
     CUSTOM CURSOR
  ===================================================== */

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const move = (e: PointerEvent) => {
      if (!cursor.current) return;

      gsap.to(cursor.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.35,
        ease: "power3.out",
      });
    };

    window.addEventListener(
      "pointermove",
      move
    );

    return () => {
      window.removeEventListener(
        "pointermove",
        move
      );
    };
  }, []);

  /* =====================================================
     CINEMATIC TYPOGRAPHY

     0.00 → 0.10
     Text hidden

     0.10 → 0.36
     HUGE → NORMAL

     0.36 → 0.44
     HOLD

     0.44 → 0.66
     NORMAL → HUGE → OUT

     0.66+
     Text completely gone
  ===================================================== */

  const textEntry = THREE_SMOOTH(
    progress,
    0.10,
    0.36
  );

  const textExit = THREE_SMOOTH(
    progress,
    0.44,
    0.66
  );

  let textScale = 2.2;
  let textY = 42;
  let textOpacity = 0;

  /* ENTRY */

  if (
    progress >= 0.10 &&
    progress < 0.36
  ) {
    textScale =
      2.2 -
      textEntry * 1.2;

    textY =
      42 -
      textEntry * 42;

    textOpacity =
      THREE_SMOOTH(
        progress,
        0.10,
        0.15
      );
  }

  /* HOLD */

  if (
    progress >= 0.36 &&
    progress < 0.44
  ) {
    textScale = 1;
    textY = 0;
    textOpacity = 1;
  }

  /* EXIT */

  if (progress >= 0.44) {
    textScale =
      1 +
      textExit * 1.4;

    textY =
      -textExit * 115;

    textOpacity =
      1 -
      THREE_SMOOTH(
        progress,
        0.58,
        0.66
      );
  }

  /* =====================================================
     CINEMATIC LOGO SEQUENCE

     0.68 → 0.74
     LOGO APPEARS AT CENTER

     0.74 → 0.90
     TRUE 3D ROTATION

     FRONT
       ↓
     EDGE
       ↓
     BACK
       ↓
     EDGE
       ↓
     FRONT

     0.90 → 0.94
     HOLD AT CENTER

     0.94 → 1.00
     MOVE TOWARD NAV
  ===================================================== */

  const imageAppear =
    THREE_SMOOTH(
      progress,
      0.68,
      0.74
    );

  const imageRotation =
    THREE_SMOOTH(
      progress,
      0.74,
      0.90
    );

  const imageNav =
    THREE_SMOOTH(
      progress,
      0.94,
      1.0
    );

  /*
     The logo remains large during the
     entire rotation.
  */

  const imageSize =
    42 -
    imageNav * 37;

  /*
     CENTER until 94%.

     Only after rotation is complete
     do these values change.
  */

  const imageLeft =
    50 -
    imageNav * 42;

  const imageTop =
    50 -
    imageNav * 43;

  /*
     360 degree Y-axis rotation.

     This gives:

     0°   = FRONT
     90°  = EDGE
     180° = BACK
     270° = EDGE
     360° = FRONT
  */

  const imageRotateY =
    imageRotation * 360;
    
  const shineProgress =
    THREE_SMOOTH(
      progress,
      0.74,
      0.90
    );

  const shineX =
    -150 +
    shineProgress * 300;
  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <section
      ref={hero}
      className="
        relative
        h-[500vh]
        bg-[#050505]
        text-[#f1f0eb]
      "
    >
      <div
        className="
          sticky
          top-0
          h-screen
          overflow-hidden
          bg-[#050505]
        "
      >

        {/* =================================================
            LOADER
        ================================================= */}

        <div
          className={`
            pointer-events-none
            absolute
            inset-0
            z-[200]
            flex
            items-center
            justify-center
            bg-[#050505]
            transition-opacity
            duration-1000
            ${
              loaded
                ? "opacity-0"
                : "opacity-100"
            }
          `}
        >
          <div
            className="
              absolute
              left-6
              top-7
              text-[9px]
              uppercase
              tracking-[0.3em]
              text-white/40
              md:left-12
            "
          >
            PRATHAM / 001
          </div>

          <div
            className="
              flex
              w-[min(320px,82vw)]
              flex-col
              gap-4
            "
          >
            <div
              className="
                flex  
                items-center
                justify-between
                text-[9px]
                uppercase
                tracking-[0.3em]
                text-white/50
              "
            >
              <span>
                Loading
              </span>

            </div>

            <div
              className="
                h-px
                w-full
                overflow-hidden
                bg-white/10
              "
            >
              <div
                className="
                  h-full
                  w-full
                  origin-left
                  bg-white/70
                  animate-[loader_1.2s_cubic-bezier(.76,0,.24,1)_forwards]
                "
              />
            </div>

            <div className="flex justify-end text-[50px] font-light leading-none tabular-nums tracking-[0.12em] text-white/75">
              {loadingProgress}%
            </div>
          </div>


        </div>

        {/* =================================================
            3D SCENE
        ================================================= */}

        <HeroScene
          scrollProgress={progress}
        />

        {/* =================================================
            ATMOSPHERE
        ================================================= */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            z-[1]
            bg-[radial-gradient(circle_at_58%_46%,transparent_10%,rgba(0,0,0,.15)_45%,rgba(0,0,0,.8)_100%)]
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            z-[2]
            bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,.5)_100%)]
          "
        />

        {/* =================================================
            NAV

            THIS LOGO IS PERMANENT.

            It is NOT the cinematic logo.
        ================================================= */}

        <nav
          className="
            hero-nav
            absolute
            left-0
            right-0
            top-0
            z-40
            flex
            items-center
            justify-between
            px-6
            py-7
            md:px-12
          "
        >

          {/* NAV LOGO */}

          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <img
              src={LOGO_IMAGE}
              alt=""
              className="
                h-7
                w-7
                object-contain
              "
            />

            <div
              className="
                text-sm
                font-medium
                tracking-[0.25em]
              "
            >
              PRATHAM
            </div>
          </div>

          {/* NAV LINKS */}

          <div
            className="
              hidden
              items-center
              gap-10
              text-[10px]
              uppercase
              tracking-[0.28em]
              text-white/40
              md:flex
            "
          >
            <span>
              Work
            </span>

            <span>
              About
            </span>

            <span>
              Services
            </span>
          </div>

          {/* MENU */}

          <button
            className="
              group
              flex
              items-center
              gap-4
              text-xs
              uppercase
              tracking-[0.25em]
            "
          >
            <span>
              Menu
            </span>

            <span
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                border
                border-white/30
                transition-all
                duration-500
                group-hover:bg-white
                group-hover:text-black
              "
            >
              +
            </span>
          </button>

        </nav>

        {/* =================================================
            UNIFIED CINEMATIC TEXT
        ================================================= */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            z-[15]
            flex
            items-center
            justify-center
          "
          style={{
            opacity: textOpacity,

            transform:
              `translateY(${textY}vh) scale(${textScale})`,

            filter:
              `blur(${textExit * 6}px)`,

            transformOrigin:
              "center center",
          }}
        >

          <div
            className="
              absolute
              left-[7vw]
              top-1/2
              w-[90vw]
              -translate-y-1/2
              md:left-[11vw]
            "
          >

            {/* WE CREATE */}

            <h1
              className="
                whitespace-nowrap
                text-[15vw]
                font-medium
                leading-[0.76]
                tracking-[-0.085em]
                text-[#f1f0eb]
                md:text-[13.5vw]
              "
            >
              WE CREATE
            </h1>

            {/* SUBTITLE */}

            <p
              className="
                mt-5
                ml-[2px]
                max-w-md
                text-[9px]
                uppercase
                leading-[1.8]
                tracking-[0.28em]
                text-white/40
                md:text-xs
              "
            >
              Through branding, advertising
              <br />
              and digital experiences.
            </p>

            {/* DESIRE */}

            <h2
              className="
                mt-[8vh]
                whitespace-nowrap
                text-[20vw]
                font-medium
                leading-[0.72]
                tracking-[-0.1em]
                text-[#f1f0eb]
                md:text-[18vw]
              "
            >
              DESIRE

              <span
                className="
                  text-white/30
                "
              >
                .
              </span>
            </h2>

          </div>

        </div>

        {/* =================================================
            CHAPTER
        ================================================= */}

        <div
          className="
            pointer-events-none
            absolute
            left-6
            top-1/2
            z-30
            -translate-y-1/2
            md:left-12
          "
          style={{
            opacity:
              progress > 0.10 &&
              progress < 0.70
                ? 1
                : 0,
          }}
        >


        </div>

        {/* =================================================
            CINEMATIC 3D LOGO

            IMPORTANT:

            This is OUTSIDE the NAV.

            It appears in the center,
            rotates in 3D,
            holds,
            THEN travels toward NAV.
        ================================================= */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            z-[25]
            flex
            items-center
            justify-center
          "
          style={{
            opacity: imageAppear,
            perspective: "1400px",
          }}
        >

          {/* 3D CARD */}

          <div
            className="
              absolute
              transform-gpu
            "
            style={{
              width:
                `${imageSize}vh`,

              height:
                `${imageSize}vh`,

              left:
                `${imageLeft}%`,

              top:
                `${imageTop}%`,

              transform:
                `translate(-50%, -50%) rotateY(${imageRotateY}deg)`,

              transformStyle:
                "preserve-3d",

              transformOrigin:
                "center center",

              willChange:
                "transform, left, top, width, height",
            }}
          >

            {/* =============================================
                FRONT
            ============================================= */}

            <div
              className="
                absolute
                inset-0
                overflow-hidden
              "
              style={{
                backfaceVisibility:
                  "hidden",

                WebkitBackfaceVisibility:
                  "hidden",

                transform:
                  "translateZ(3px)",
              }}
            >
              <img
                src={LOGO_IMAGE}
                alt=""
                className="
                  h-full
                  w-full
                  object-contain
                "
              />

              {/* MOVING SHINE */}

              <div
                className="
                  pointer-events-none
                  absolute
                  inset-y-0
                  w-[22%]
                  skew-x-[-18deg]
                  bg-gradient-to-r
                  from-transparent
                  via-white/70
                  to-transparent
                  blur-[8px]
                "
                style={{
                  left:
                    `${shineX}%`,
                  opacity:
                    shineProgress > 0 &&
                    shineProgress < 1
                      ? 0.8
                      : 0,
                  mixBlendMode:
                    "screen",
                }}
              />
            </div>

            {/* =============================================
                BACK

                ScaleX(-1) keeps the logo readable
                when viewed from the back.
            ============================================= */}

            <div
              className="
                absolute
                inset-0
                overflow-hidden
              "
              style={{
                backfaceVisibility:
                  "hidden",

                WebkitBackfaceVisibility:
                  "hidden",

                transform:
                  "rotateY(180deg) translateZ(3px)",
              }}
            >
              <img
                src={LOGO_IMAGE}
                alt=""
                className="
                  h-full
                  w-full
                  object-contain
                "
                style={{
                  transform:
                    "scaleX(-1)",
                }}
              />

              {/* BACK SHINE */}

              <div
                className="
                  pointer-events-none
                  absolute
                  inset-y-0
                  w-[22%]
                  skew-x-[-18deg]
                  bg-gradient-to-r
                  from-transparent
                  via-white/60
                  to-transparent
                  blur-[8px]
                "
                style={{
                  left:
                    `${shineX}%`,
                  opacity:
                    shineProgress > 0 &&
                    shineProgress < 1
                      ? 0.65
                      : 0,
                  mixBlendMode:
                    "screen",
                }}
              />
            </div>

          </div>

        </div>

        {/* =================================================
            SCROLL INDICATOR
        ================================================= */}

        <div
          className="
            pointer-events-none
            absolute
            bottom-7
            left-0
            right-0
            z-30
            flex
            justify-center
          "
          style={{
            opacity:
              progress < 0.16
                ? 1
                : 0,
          }}
        >
          <div
            className="
              flex
              items-center
              gap-3
              text-[9px]
              uppercase
              tracking-[0.3em]
              text-white/40
            "
          >
            Scroll

            <span
              className="
                h-px
                w-12
                bg-white/25
              "
            />

            ↓
          </div>
        </div>

        {/* =================================================
            FINAL BLACK HANDOFF

            Delayed until after the logo movement.
        ================================================= */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            z-[35]
            bg-[#050505]
          "
          style={{
            opacity:
              THREE_SMOOTH(
                progress,
                0.985,
                1
              ),
          }}
        />

        {/* =================================================
            GRAIN
        ================================================= */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            z-40
            opacity-[0.045]
            mix-blend-overlay
            bg-[url('/noise.png')]
          "
        />

        {/* =================================================
            CURSOR
        ================================================= */}

        <div
          ref={cursor}
          data-custom-cursor
          className="
            pointer-events-none
            fixed
            left-0
            top-0
            z-[100]
            flex
            h-16
            w-16
            -translate-x-1/2
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            border
            border-white/30
            backdrop-blur-sm
          "
        >
          <span
            className="
              text-[8px]
              uppercase
              tracking-[0.18em]
              text-white/70
            "
          >
            DRAG
          </span>
        </div>

      </div>
    </section>
  );
}

/* =========================================================
   MATH HELPERS
========================================================= */

function THREE_CLAMP(value: number) {
  return Math.min(
    1,
    Math.max(0, value)
  );
}

function THREE_SMOOTH(
  value: number,
  start: number,
  end: number
) {
  const x =
    THREE_CLAMP(
      (value - start) /
        (end - start)
    );

  return (
    x *
    x *
    (3 - 2 * x)
  );
}