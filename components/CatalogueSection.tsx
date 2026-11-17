"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PageFlip, type FlipCorner, type SizeType } from "page-flip";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";

const clamp = (value: number) =>
  Math.min(1, Math.max(0, value));

const smooth = (
  value: number,
  start: number,
  end: number
) => {
  const x = clamp((value - start) / (end - start));
  return x * x * (3 - 2 * x);
};

/* =========================================================
   CATALOGUE DATA
========================================================= */

const catalogueImagePath = (folder: string, pageNumber: number) => {
  const extension = folder === "C1" && pageNumber === 1 ? "JPG" : "jpg";
  return `/images/CATALOGUES/${folder}/${String(pageNumber).padStart(2, "0")}.${extension}`;
};

const catalogues = [
  {
    id: 1,
    title: "CATALOGUE 01",
    folder: "C1",
    pages: 3,
  },
  {
    id: 2,
    title: "CATALOGUE 02",
    folder: "C2",
    pages: 2,
  },
  {
    id: 3,
    title: "CATALOGUE 02",
    folder: "C2",
    pages: 2,
  },
  {
    id: 4,
    title: "CATALOGUE 02",
    folder: "C2",
    pages: 2,
  },
];

/* =========================================================
   PAGE COMPONENT
========================================================= */

function FlipPage({
  src,
  pageNumber,
  blank = false,
}: {
  src?: string;
  pageNumber?: number;
  blank?: boolean;
}) {
  return (
    <div
      className="
        catalogue-flip-page
        relative
        h-full
        w-full
        overflow-hidden
        bg-[#ebe8df]
      "
      data-density="soft"
    >
      {!blank && src ? (
        <img
          src={src}
          alt={`Catalogue page ${pageNumber ?? ""}`}
          className="
            absolute
            inset-0
            h-full
            w-full
            object-contain
            select-none
          "
          draggable={false}
        />
      ) : (
        <div className="absolute inset-0 bg-[#ebe8df]" />
      )}
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function CatalogueSection() {
  const sectionRef =
    useRef<HTMLDivElement>(null);

  const hoverHintShown = useRef(false);

  const [showCatalogueHoverHint, setShowCatalogueHoverHint] =
    useState(false);

  const flipBookContainerRef =
    useRef<HTMLDivElement>(null);

  const pageFlipRef =
    useRef<PageFlip | null>(null);

  /* ---------------------------------------------------------
     SCROLL
  --------------------------------------------------------- */

  const [progress, setProgress] =
    useState(0);

  /* ---------------------------------------------------------
     CATALOGUE VIEWER
  --------------------------------------------------------- */

  const [selectedCatalogue, setSelectedCatalogue] =
    useState<number | null>(null);

  const [viewerReady, setViewerReady] =
    useState(false);

  const [currentPage, setCurrentPage] =
    useState(0);

  const [isFlipping, setIsFlipping] =
    useState(false);

  /* ---------------------------------------------------------
     STRIP
  --------------------------------------------------------- */

  const [stripNudge, setStripNudge] =
    useState(0);

  /* ---------------------------------------------------------
     PREMIUM CURSOR
  --------------------------------------------------------- */

  const [mousePosition, setMousePosition] =
    useState({
      x: 0,
      y: 0,
    });

  const [cursorPosition, setCursorPosition] =
    useState({
      x: 0,
      y: 0,
    });

  const [showCatalogueCursor, setShowCatalogueCursor] =
    useState(false);

  const [cursorMode, setCursorMode] =
    useState<"drag" | "open" | "left" | "right">(
      "drag"
    );

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || hoverHintShown.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hoverHintShown.current) {
          hoverHintShown.current = true;
          setShowCatalogueHoverHint(true);
          observer.disconnect();
        }
      },
      { threshold: 0.01 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  /* =========================================================
     MOUSE POSITION
  ========================================================= */

  useEffect(() => {
    const handleMouseMove = (
      event: MouseEvent
    ) => {
      setMousePosition({
        x: event.clientX,
        y: event.clientY,
      });
    };

    window.addEventListener(
      "mousemove",
      handleMouseMove
    );

    return () => {
      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );
    };
  }, []);

  /* =========================================================
     PREMIUM CURSOR SMOOTH FOLLOW
  ========================================================= */

  useEffect(() => {
    let animationFrame = 0;

    const animateCursor = () => {
      setCursorPosition((previous) => ({
        x:
          previous.x +
          (mousePosition.x -
            previous.x) *
            0.14,

        y:
          previous.y +
          (mousePosition.y -
            previous.y) *
            0.14,
      }));

      animationFrame =
        requestAnimationFrame(
          animateCursor
        );
    };

    animationFrame =
      requestAnimationFrame(
        animateCursor
      );

    return () => {
      cancelAnimationFrame(
        animationFrame
      );
    };
  }, [mousePosition]);

  /* =========================================================
     SCROLL PROGRESS
  ========================================================= */

  useEffect(() => {
    const update = () => {
      if (!sectionRef.current) return;

      const rect =
        sectionRef.current.getBoundingClientRect();

      const distance =
        sectionRef.current.offsetHeight -
        window.innerHeight;

      if (distance <= 0) return;

      setProgress(
        clamp(
          -rect.top / distance
        )
      );
    };

    update();

    window.addEventListener(
      "scroll",
      update,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      update
    );

    return () => {
      window.removeEventListener(
        "scroll",
        update
      );

      window.removeEventListener(
        "resize",
        update
      );
    };
  }, []);

  /* =========================================================
     SELECTED CATALOGUE
  ========================================================= */

  const selected =
    catalogues.find(
      (item) =>
        item.id === selectedCatalogue
    );

  /* =========================================================
     DESTROY PAGEFLIP
  ========================================================= */

  const destroyPageFlip = useCallback(() => {
    if (pageFlipRef.current) {
      try {
        pageFlipRef.current.destroy();
      } catch {
        // Already destroyed
      }

      pageFlipRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (selectedCatalogue === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedCatalogue]);

  /* =========================================================
     BODY CLEANUP
  ========================================================= */

  useEffect(() => () => destroyPageFlip(), [destroyPageFlip]);

  /* =========================================================
     OPEN CATALOGUE
  ========================================================= */

  const openCatalogue = (
    catalogueId: number
  ) => {
    destroyPageFlip();

    setSelectedCatalogue(
      catalogueId
    );

    setCurrentPage(0);
    setViewerReady(false);
    setIsFlipping(false);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setViewerReady(true);
      });
    });
  };

  /* =========================================================
     CLOSE CATALOGUE
  ========================================================= */

  const closeCatalogue = useCallback(() => {
    destroyPageFlip();

    setSelectedCatalogue(null);
    setViewerReady(false);
    setCurrentPage(0);
    setIsFlipping(false);

  }, [destroyPageFlip]);

  /* =========================================================
     NEXT PAGE
  ========================================================= */

  const nextPage = useCallback(() => {
    if (
      !pageFlipRef.current ||
      !selected ||
      isFlipping
    ) {
      return;
    }

    const totalPages =
      selected.pages % 2 === 0
        ? selected.pages
        : selected.pages + 1;

    if (
      currentPage + 2 >=
      totalPages
    ) {
      return;
    }

    setIsFlipping(true);

    pageFlipRef.current.flipNext(
      "bottom" as FlipCorner
    );
  }, [selected, isFlipping, currentPage]);

  /* =========================================================
     PREVIOUS PAGE
  ========================================================= */

  const previousPage = useCallback(() => {
    if (
      !pageFlipRef.current ||
      isFlipping
    ) {
      return;
    }

    if (currentPage <= 0) {
      return;
    }

    setIsFlipping(true);

    pageFlipRef.current.flipPrev(
      "bottom" as FlipCorner
    );
  }, [currentPage, isFlipping]);

  /* =========================================================
     CREATE STPAGEFLIP
  ========================================================= */

  useEffect(() => {
    if (
      !selected ||
      !viewerReady ||
      !flipBookContainerRef.current
    ) {
      return;
    }

    const container =
      flipBookContainerRef.current;

    destroyPageFlip();

    const totalPages =
      selected.pages % 2 === 0
        ? selected.pages
        : selected.pages + 1;

    const pageElements =
      Array.from(
        container.children
      ) as HTMLElement[];

    if (
      pageElements.length !==
      totalPages
    ) {
      return;
    }

    /*
      REAL STPAGEFLIP
    */

    const pageFlip =
      new PageFlip(
        container,
        {
          width: 520,
          height: 680,

          size: "stretch" as SizeType,

          minWidth: 280,
          maxWidth: 650,

          minHeight: 380,
          maxHeight: 850,

          drawShadow: true,

          maxShadowOpacity: 0.32,

          flippingTime: 850,

          /*
            IMPORTANT:
            false = landscape / two-page
            spread behaviour
          */
          usePortrait: false,

          startZIndex: 10,

          autoSize: true,

          mobileScrollSupport: false,

          swipeDistance: 25,

          useMouseEvents: true,

          showCover: false,

          disableFlipByClick: false,

          clickEventForward: true,
        }
      );

    /* -------------------------------------------------------
       FLIP EVENT
    ------------------------------------------------------- */

    pageFlip.on(
      "flip",
      (event) => {
        const page =
          Number(event.data);

        setCurrentPage(page);
        setIsFlipping(false);
      }
    );

    /* -------------------------------------------------------
       STATE EVENT
    ------------------------------------------------------- */

    pageFlip.on(
      "changeState",
      (event) => {
        if (
          event.data ===
          "flipping"
        ) {
          setIsFlipping(true);
        }

        if (
          event.data ===
          "read"
        ) {
          setIsFlipping(false);
        }
      }
    );

    /*
      IMPORTANT:
      StPageFlip method is:

      loadFromHTML()

      NOT:

      loadFromHtml()
    */

    pageFlip.loadFromHTML(
      pageElements
    );

    pageFlipRef.current =
      pageFlip;

    setCurrentPage(0);

    return () => {
      try {
        pageFlip.destroy();
      } catch {
        // Ignore cleanup errors
      }

      if (
        pageFlipRef.current ===
        pageFlip
      ) {
        pageFlipRef.current =
          null;
      }
    };
  }, [
    selected,
    viewerReady,
    destroyPageFlip,
  ]);

  /* =========================================================
     KEYBOARD
  ========================================================= */

  useEffect(() => {
    if (
      selectedCatalogue === null
    ) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (
        event.key === "Escape"
      ) {
        closeCatalogue();
        return;
      }

      if (
        event.key === "ArrowRight"
      ) {
        event.preventDefault();
        nextPage();
        return;
      }

      if (
        event.key === "ArrowLeft"
      ) {
        event.preventDefault();
        previousPage();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    selectedCatalogue,
    currentPage,
    isFlipping,
    closeCatalogue,
    nextPage,
    previousPage,
  ]);

  /* =========================================================
     SCROLL PHASES
  ========================================================= */

  const sceneEnter =
    smooth(
      progress,
      0,
      0.16
    );

  const catalogueZoom =
    smooth(
      progress,
      0.08,
      0.36
    );

  const bookOpen =
    smooth(
      progress,
      0.32,
      0.50
    );

  const collectionReveal =
    smooth(
      progress,
      0.48,
      0.56
    );

  const galleryProgress =
    smooth(
      progress,
      0.54,
      0.80
    );

  const collectionClose =
    smooth(
      progress,
      0.80,
      0.87
    );

  const bookClose =
    smooth(
      progress,
      0.84,
      0.94
    );

  const backCoverReveal =
    smooth(
      progress,
      0.90,
      0.98
    );

  /* =========================================================
     MAIN BOOK TRANSFORM
  ========================================================= */

  const scale =
    0.35 +
    catalogueZoom * 0.65;

  const translateY =
    80 -
    sceneEnter * 80;

  const translateZ =
    -600 +
    catalogueZoom * 600;

  const openingRotation =
    -bookOpen * 145;

  const closingRotation =
    bookClose * 145;

  const coverRotation =
    openingRotation +
    closingRotation;

  const bookRotateY =
    backCoverReveal * 180;

  const finalScale =
    scale +
    bookClose * 0.03;

  const finalY =
    translateY -
    bookClose * 5;

  /* =========================================================
     HORIZONTAL STRIP
  ========================================================= */

  const cardWidth = 32;
  const gap = 3;

  const totalWidth =
    catalogues.length *
      cardWidth +
    (catalogues.length - 1) *
      gap;

  const startX = 8;

  const endX =
    -(
      totalWidth -
      100 +
      8
    );

  const galleryX =
    startX +
    (endX - startX) *
      galleryProgress +
    stripNudge;

  /* =========================================================
     STRIP NAVIGATION
  ========================================================= */

  const moveStripLeft = () => {
    setStripNudge(
      (value) =>
        Math.min(
          value + 34,
          68
        )
    );
  };

  const moveStripRight = () => {
    setStripNudge(
      (value) =>
        Math.max(
          value - 34,
          -68
        )
    );
  };

  /* =========================================================
     PAGE DISPLAY
  ========================================================= */

  const displayLeft =
    currentPage + 1;

  const displayRight =
    currentPage + 2 <=
    (selected?.pages ?? 0)
      ? currentPage + 2
      : null;

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <section
      ref={sectionRef}
      className="
        relative
        h-[700vh]
        bg-[#050505]
        text-white
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
            PREMIUM CATALOGUE CURSOR
        ================================================= */}

        {showCatalogueCursor && (
          <div
            className="
              pointer-events-none
              fixed
              z-[1000]
              flex
              h-[82px]
              w-[82px]
              items-center
              justify-center
              rounded-full
              border
              border-white/30
              bg-black/25
              backdrop-blur-md
              text-[8px]
              uppercase
              tracking-[0.22em]
              text-white
              shadow-[0_0_40px_rgba(255,255,255,0.06)]
            "
            style={{
              left:
                cursorPosition.x,
              top:
                cursorPosition.y,

              transform:
                "translate(-50%, -50%)",

              transition:
                "width 300ms cubic-bezier(.16,1,.3,1), height 300ms cubic-bezier(.16,1,.3,1)",
            }}
          >
            {cursorMode === "drag" && (
              <>
                <span>
                  DRAG
                </span>

                <span
                  className="
                    absolute
                    left-[15px]
                    text-[10px]
                    text-white/45
                  "
                >
                  ←
                </span>

                <span
                  className="
                    absolute
                    right-[15px]
                    text-[10px]
                    text-white/45
                  "
                >
                  →
                </span>
              </>
            )}

            {cursorMode === "open" && (
              <>
                <span>
                  scroll
                </span>

                <span
                  className="
                    absolute
                    bottom-[13px]
                    h-px
                    w-7
                    bg-white/40
                  "
                />
              </>
            )}

            {cursorMode === "left" && (
              <span className="text-lg font-light">
                ←
              </span>
            )}

            {cursorMode === "right" && (
              <span className="text-lg font-light">
                →
              </span>
            )}
          </div>
        )}

        {/* =================================================
            SECTION LABEL
        ================================================= */}

        <div
          className="
            absolute
            left-6
            top-7
            z-50
            md:left-12
          "
          onPointerEnter={() => setShowCatalogueHoverHint(false)}
          style={{
            opacity:
              1 -
              smooth(
                progress,
                0.80,
                0.90
              ),
          }}
        >
          <div className="relative">
            <span className="sr-only">Catalogue</span>
            <TextHoverEffect
              text="CATALOGUE"
              className="catalogue-section-label-hover"
            />
            {showCatalogueHoverHint && (
              <div className="catalogue-first-hover-hint" aria-hidden="true">
                <svg viewBox="0 0 64 40" fill="none">
                  <path
                    d="M61 35C43 32 31 22 17 8M17 8l2 13M17 8l14 2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>HOVER HERE</span>
              </div>
            )}
          </div>
        </div>

        {/* =================================================
            MAIN SCROLL BOOK
        ================================================= */}

        <div
          className="
            absolute
            inset-0
            z-10
            flex
            items-center
            justify-center
          "
          style={{
            perspective:
              "1800px",
          }}
        >
          <div
            className="
              relative
              transform-gpu
            "
            style={{
              width: "300px",
              height: "430px",

              transform: `
                translate3d(
                  0,
                  ${finalY}px,
                  ${translateZ}px
                )
                scale(${finalScale})
                rotateY(${bookRotateY}deg)
              `,

              transformStyle:
                "preserve-3d",

              transformOrigin:
                "center center",

              willChange:
                "transform",
            }}
          >
            {/* BOOK BODY */}

            <div
              className="
                absolute
                inset-0
                rounded-[3px]
                bg-[#0c0c0c]
                shadow-2xl
              "
              style={{
                transform:
                  "translateZ(-12px)",
                backfaceVisibility:
                  "hidden",
              }}
            />

            {/* INSIDE */}

            <div
              className="
                absolute
                inset-0
                rounded-[3px]
                bg-[#e9e7df]
              "
              style={{
                transform: `
                rotateY(${180 - bookOpen * 180}deg)
                translateZ(2px)
                `,
                transformOrigin:
                  "left center",
                backfaceVisibility:
                  "hidden",
              }}
            >
              <div
                className="
                  flex
                  h-full
                  flex-col
                  items-center
                  justify-center
                  text-black
                "

              >
                <div
                  className="
                    mb-4
                    text-[8px]
                    uppercase
                    tracking-[0.3em]
                    text-black/40
                  "
                >
                  Selected Works
                </div>

                <div
                  className="
                    text-3xl
                    tracking-[-0.06em]
                  "
                >
                  PRATHAM
                </div>
              </div>
            </div>

            {/* FRONT COVER */}

            <div
              className="
                absolute
                inset-0
                overflow-hidden
                rounded-[3px]
                bg-[#151515]
                p-8
                shadow-2xl
              "
              style={{
                transform: `
                  rotateY(
                    ${coverRotation}deg
                  )
                `,
                transformOrigin:
                  "left center",
                backfaceVisibility:
                  "hidden",
                WebkitBackfaceVisibility:
                  "hidden",
              }}
            >
              <div
                className="
                  absolute
                  left-8
                  top-8
                  h-24
                  w-24
                  rounded-full
                  border
                  border-white/10
                "
              />

              <div
                className="
                  absolute
                  right-8
                  top-8
                  h-px
                  w-20
                  bg-white/20
                "
              />

              <div
                className="
                  absolute
                  bottom-24
                  left-8
                  h-px
                  w-32
                  bg-white/10
                "
              />

              <div
                className="
                  absolute
                  bottom-8
                  left-8
                "
              >
                <div
                  className="
                    mb-3
                    text-[8px]
                    uppercase
                    tracking-[0.3em]
                    text-white/40
                  "
                > 
                  Studio Collection
                </div>

                <div
                  className="
                    text-4xl
                    font-medium
                    tracking-[-0.06em]
                  "
                >
                  CATALOGUES
                </div>
              </div>

              <div
                className="
                  absolute
                  bottom-8
                  right-8
                  text-[8px]
                  tracking-[0.3em]
                  text-white/30
                "
              >
                2026
              </div>
            </div>

            {/* BACK COVER */}

            <div
              className="
                absolute
                inset-0
                flex
                flex-col
                items-center
                justify-between
                rounded-[3px]
                bg-[#111]
                px-8
                py-10
                text-center
                shadow-2xl
              "
              style={{
                transform:
                  "rotateY(180deg) translateZ(8px)",
                backfaceVisibility:
                  "hidden",
                WebkitBackfaceVisibility:
                  "hidden",
              }}
            >
              <div
                className="
                  flex
                  flex-1
                  items-center
                  justify-center
                "
                style={{
                  opacity:
                    backCoverReveal,
                  transform: `
                    scale(
                      ${
                        0.92 +
                        backCoverReveal *
                          0.08
                      }
                    )
                  `,
                }}
              >
                <img
                  src="/images/logo.png"
                  alt="Studio logo"
                  className="
                    h-28
                    w-28
                    object-contain
                  "
                />
              </div>

              <div
                className="
                  w-full
                  border-t
                  border-white/10
                  pt-6
                "
                style={{
                  opacity:
                    backCoverReveal,
                }}
              >
                <div
                  className="
                    text-[11px]
                    font-medium
                    tracking-[0.25em]
                  "
                >
                  STUDIO
                </div>

                <div
                  className="
                    mt-3
                    text-[7px]
                    uppercase
                    leading-[1.8]
                    tracking-[0.22em]
                    text-white/35
                  "
                >
                  Graphic Design
                  <br />
                  Branding · Print · Visuals
                </div>

                <div
                  className="
                    mt-6
                    text-[7px]
                    uppercase
                    leading-[1.8]
                    tracking-[0.18em]
                    text-white/30
                  "
                >
                  Morbi · Gujarat
                  <br />
                  India
                </div>
              </div>

              <div
                className="
                  pt-6
                  text-[7px]
                  uppercase
                  tracking-[0.25em]
                  text-white/25
                "
                style={{
                  opacity:
                    backCoverReveal,
                }}
              >
                Designed with imagination
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            CATALOGUE STRIP
        ================================================= */}

        <div
          className="
            group
            absolute
            inset-0
            z-20
            flex
            cursor-none
            items-center
            overflow-hidden
            bg-[#050505]
          "
        style={{
        opacity: collectionReveal * (1 - collectionClose),
        }}
                
          onMouseEnter={() => {
            setShowCatalogueCursor(true);
            setCursorMode("drag");
          }}
          onMouseLeave={() => {
            setShowCatalogueCursor(false);
          }}
        >
          {/* =================================================
              LEFT ARROW
          ================================================= */}

          <button
            type="button"
            aria-label="Previous catalogues"
            onClick={moveStripLeft}
            onMouseEnter={() =>
              setCursorMode("left")
            }
            onMouseLeave={() =>
              setCursorMode("drag")
            }
            className="
              group/arrow
              absolute
              left-6
              top-1/2
              z-[80]
              flex
              h-16
              w-16
              -translate-y-1/2
              cursor-none
              items-center
              justify-center
              overflow-hidden
              rounded-full
              border
              border-white/20
              bg-black/40
              backdrop-blur-xl
              opacity-0
              transition-all
              duration-500
              group-hover:opacity-100
              hover:scale-110
              hover:border-white/50
              hover:bg-white
              md:left-10
            "
          >
            <span
              className="
                absolute
                h-px
                w-7
                -translate-x-1
                bg-white/70
                transition-all
                duration-500
                group-hover/arrow:-translate-x-2
                group-hover/arrow:w-9
                group-hover/arrow:bg-black
              "
            />

            <span
              className="
                absolute
                h-2
                w-2
                -translate-x-[15px]
                rotate-45
                border-b
                border-l
                border-white/70
                transition-all
                duration-500
                group-hover/arrow:-translate-x-[18px]
                group-hover/arrow:border-black
              "
            />
          </button>

          {/* =================================================
              RIGHT ARROW
          ================================================= */}

          <button
            type="button"
            aria-label="Next catalogues"
            onClick={moveStripRight}
            onMouseEnter={() =>
              setCursorMode("right")
            }
            onMouseLeave={() =>
              setCursorMode("drag")
            }
            className="
              group/arrow
              absolute
              right-6
              top-1/2
              z-[80]
              flex
              h-16
              w-16
              -translate-y-1/2
              cursor-none
              items-center
              justify-center
              overflow-hidden
              rounded-full
              border
              border-white/20
              bg-black/40
              backdrop-blur-xl
              opacity-0
              transition-all
              duration-500
              group-hover:opacity-100
              hover:scale-110
              hover:border-white/50
              hover:bg-white
              md:right-10
            "
          >
            <span
              className="
                absolute
                h-px
                w-7
                translate-x-1
                bg-white/70
                transition-all
                duration-500
                group-hover/arrow:translate-x-2
                group-hover/arrow:w-9
                group-hover/arrow:bg-black
              "
            />

            <span
              className="
                absolute
                h-2
                w-2
                translate-x-[15px]
                rotate-45
                border-r
                border-t
                border-white/70
                transition-all
                duration-500
                group-hover/arrow:translate-x-[18px]
                group-hover/arrow:border-black
              "
            />
          </button>

          {/* =================================================
              CARDS
          ================================================= */}

          <div
            className="
              flex
              w-max
              items-center
              gap-[3vw]
              transform-gpu
            "
            style={{
              transform: `
                translate3d(
                  ${galleryX}vw,
                  0,
                  0
                )
              `,
              willChange:
                "transform",
            }}
          >
            {catalogues.map(
              (catalogue) => (
                <button
                  key={
                    catalogue.id
                  }
                  type="button"
                  onClick={() =>
                    openCatalogue(
                      catalogue.id
                    )
                  }
                  onMouseEnter={() => {
                    setCursorMode(
                      "open"
                    );
                  }}
                  onMouseLeave={() => {
                    setCursorMode(
                      "drag"
                    );
                  }}
                  className="
                    group/card
                    relative
                    h-[55vh]
                    w-[32vw]
                    min-w-[280px]
                    max-w-[520px]
                    shrink-0
                    cursor-none
                    overflow-hidden
                    rounded-[3px]
                    bg-[#111]
                    text-left
                  "
                >
                  <img
                    src={catalogueImagePath(catalogue.folder, 1)}
                    alt={
                      catalogue.title
                    }
                    className="
                      absolute
                      inset-0
                      h-full
                      w-full
                      object-cover
                      transition-transform
                      duration-1000
                      ease-out
                      group-hover/card:scale-105
                    "
                    draggable={
                      false
                    }
                  />

                  <div
                    className="
                      absolute
                      inset-0
                      bg-gradient-to-t
                      from-black/70
                      via-transparent
                      to-black/10
                    "
                  />

                  <div
                    className="
                      absolute
                      left-7
                      top-7
                      h-px
                      w-0
                      bg-white
                      transition-all
                      duration-700
                      group-hover/card:w-16
                    "
                  />

                  <div
                    className="
                      absolute
                      right-6
                      top-6
                      z-10
                      text-[9px]
                      tracking-[0.25em]
                      text-white/60
                    "
                  >
                    {String(
                      catalogue.id
                    ).padStart(
                      2,
                      "0"
                    )}
                  </div>

                  <div
                    className="
                      absolute
                      bottom-0
                      left-0
                      right-0
                      z-10
                      p-7
                    "
                  >
                    <div
                      className="
                        mb-2
                        text-[8px]
                        uppercase
                        tracking-[0.3em]
                        text-white/50
                      "
                    >
                      Collection
                    </div>

                    <div
                      className="
                        text-xl
                        font-medium
                        tracking-[-0.04em]
                      "
                    >
                      {
                        catalogue.title
                      }
                    </div>

                    <div
                      className="
                        mt-2
                        text-[8px]
                        uppercase
                        tracking-[0.2em]
                        text-white/35
                      "
                    >
                      {
                        catalogue.pages
                      }{" "}
                      Pages
                    </div>
                  </div>
                </button>
              )
            )}
          </div>
        </div>

        {/* =================================================
            SCROLL INDICATOR
        ================================================= */}

        <div
          className="
            pointer-events-none
            absolute
            bottom-8
            left-0
            right-0
            z-40
            flex
            justify-center
          "
          style={{
            opacity:
              progress < 0.48
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
              text-white/30
            "
          >
            Scroll

            <span
              className="
                h-px
                w-12
                bg-white/20
              "
            />

            ↓
          </div>
        </div>

        {/* =================================================
            STPAGEFLIP VIEWER
        ================================================= */}

        {selected && (
          <div
            className="
              absolute
              inset-0
              z-[200]
              bg-[#050505]
            "
          >
            {/* TOP BAR */}

            <div
              className="
                absolute
                left-0
                right-0
                top-0
                z-[300]
                flex
                items-center
                justify-between
                px-6
                py-6
                md:px-12
              "
            >
              <div>
                <div
                  className="
                    text-[8px]
                    uppercase
                    tracking-[0.35em]
                    text-white/30
                  "
                >
                  Catalogue
                </div>

                <div
                  className="
                    mt-2
                    text-sm
                    tracking-[-0.02em]
                  "
                >
                  {
                    selected.title
                  }
                </div>
              </div>

              <button
                type="button"
                onClick={
                  closeCatalogue
                }
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/20
                  text-lg
                  transition-all
                  duration-500
                  hover:bg-white
                  hover:text-black
                "
              >
                ×
              </button>
            </div>

            {/* BOOK */}

            <div
              className="
                absolute
                inset-0
                flex
                items-center
                justify-center
                px-4
                py-24
              "
            >
              <div
                className="
                  relative
                  flex
                  items-center
                  justify-center
                "
                style={{
                  width:
                    "min(90vw, 1100px)",

                  height:
                    "min(76vh, 760px)",

                  opacity:
                    viewerReady
                      ? 1
                      : 0,

                  transform:
                    viewerReady
                      ? "scale(1)"
                      : "scale(.88)",

                  transition:
                    "transform 900ms cubic-bezier(.16,1,.3,1), opacity 700ms ease",
                }}
              >
                {/* ACTUAL STPAGEFLIP ROOT */}

                <div
                  ref={
                    flipBookContainerRef
                  }
                  className="
                    relative
                    h-full
                    w-full
                  "
                >
                  {Array.from({
                    length:
                      selected.pages %
                        2 ===
                      0
                        ? selected.pages
                        : selected.pages +
                          1,
                  }).map(
                    (_, index) => {
                      const pageNumber =
                        index + 1;

                      const isBlank =
                        pageNumber >
                        selected.pages;

                      const src =
                        !isBlank
                          ? catalogueImagePath(
                              selected.folder,
                              pageNumber
                            )
                          : undefined;

                      return (
                        <FlipPage
                          key={`${selected.id}-${pageNumber}`}
                          src={src}
                          pageNumber={
                            pageNumber
                          }
                          blank={
                            isBlank
                          }
                        />
                      );
                    }
                  )}
                </div>
              </div>
            </div>

            {/* =================================================
                PAGE NAVIGATION
            ================================================= */}

            <button
              type="button"
              aria-label="Previous page"
              onClick={
                previousPage
              }
              disabled={
                currentPage <=
                  0 ||
                isFlipping
              }
              className="
                absolute
                left-0
                top-1/2
                z-[350]
                flex
                h-24
                w-24
                -translate-y-1/2
                items-center
                justify-center
                text-2xl
                text-white/20
                transition-all
                duration-500
                hover:text-white
                disabled:pointer-events-none
                disabled:opacity-0
              "
            >
              ←
            </button>

            <button
              type="button"
              aria-label="Next page"
              onClick={
                nextPage
              }
              disabled={
                isFlipping ||
                !selected ||
                currentPage +
                    2 >=
                  (selected.pages %
                    2 ===
                  0
                    ? selected.pages
                    : selected.pages +
                      1)
              }
              className="
                absolute
                right-0
                top-1/2
                z-[350]
                flex
                h-24
                w-24
                -translate-y-1/2
                items-center
                justify-center
                text-2xl
                text-white/20
                transition-all
                duration-500
                hover:text-white
                disabled:pointer-events-none
                disabled:opacity-0
              "
            >
              →
            </button>

            {/* =================================================
                BOTTOM BAR
            ================================================= */}

            <div
              className="
                absolute
                bottom-0
                left-0
                right-0
                z-[300]
                flex
                items-center
                justify-between
                px-6
                py-6
                md:px-12
              "
            >
              <button
                type="button"
                onClick={
                  previousPage
                }
                disabled={
                  currentPage <=
                    0 ||
                  isFlipping
                }
                className="
                  text-[9px]
                  uppercase
                  tracking-[0.25em]
                  text-white/40
                  transition-colors
                  duration-300
                  hover:text-white
                  disabled:opacity-10
                "
              >
                ← Previous
              </button>

              <div
                className="
                  text-[9px]
                  tracking-[0.25em]
                  text-white/40
                "
              >
                {String(
                  displayLeft
                ).padStart(
                  2,
                  "0"
                )}

                <span className="mx-2">
                  —
                </span>

                {displayRight
                  ? String(
                      displayRight
                    ).padStart(
                      2,
                      "0"
                    )
                  : "—"}

                <span className="mx-3">
                  /
                </span>

                {String(
                  selected.pages
                ).padStart(
                  2,
                  "0"
                )}
              </div>

              <button
                type="button"
                onClick={
                  nextPage
                }
                disabled={
                  isFlipping ||
                  currentPage +
                      2 >=
                    (selected.pages %
                      2 ===
                    0
                      ? selected.pages
                      : selected.pages +
                        1)
                }
                className="
                  text-[9px]
                  uppercase
                  tracking-[0.25em]
                  text-white/40
                  transition-colors
                  duration-300
                  hover:text-white
                  disabled:opacity-10
                "
              >
                Next →
              </button>
            </div>

            {/* HINT */}

            <div
              className="
                pointer-events-none
                absolute
                bottom-20
                left-1/2
                z-[300]
                -translate-x-1/2
                text-[7px]
                uppercase
                tracking-[0.3em]
                text-white/20
              "
            >
              Drag or click to turn pages
            </div>
          </div>
        )}
      </div>
    </section>
  );
}