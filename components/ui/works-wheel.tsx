"use client";

import * as React from "react";
import { TextHoverEffect } from "./text-hover-effect";
import type { WorksWheelItem } from "@/lib/types/works";
import "./works-wheel.css";

export type { WorksWheelItem } from "@/lib/types/works";

export interface WorksWheelProps
  extends Omit<React.ComponentPropsWithoutRef<"section">, "children"> {
  items: WorksWheelItem[];
  label?: string;
  action?: string;
}

const BASE_CARD_W = 359;
const BASE_CARD_H = 208;
const STEP = 40;
const DRUM = 2.22;
const LENS = 2.7;
const RING_R = 1.14;
const BOW = 1.82;
const TITLE = 0.124;
const INDEX = 0.06;
const CULL = 1.6;
const TURN_EASE = 0.14;

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

const lerp = (a: number, b: number, t: number) =>
  a + (b - a) * t;

const rad = (deg: number) => (deg * Math.PI) / 180;

type Stage = {
  w: number;
  h: number;
};

const bowAt = (drumDeg: number, bow: number) =>
  -bow * (1 - Math.cos(rad(drumDeg)));

function place(
  ringDeg: number,
  drumDeg: number,
  ringR: number,
  drumR: number,
  bow: number,
  m: number,
) {
  return (
    `translateX(${m * bowAt(drumDeg, bow)}px)` +
    ` rotateZ(${(1 - m) * ringDeg}deg)` +
    ` translateY(${-(1 - m) * ringR}px)` +
    ` rotateX(${m * drumDeg}deg)` +
    ` translateZ(${m * drumR}px)`
  );
}

export function WorksWheel({
  items,
  label = "Works '26",
  action = "View",
  className = "",
  ...props
}: WorksWheelProps) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const wheelRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLElement | null)[]>([]);
  const labelRef = React.useRef<HTMLDivElement>(null);
  const titleRef = React.useRef<HTMLDivElement>(null);

  // Progress starts at zero: zero now means DRUM, not ring.
  const turn = React.useRef(0);
  const target = React.useRef(0);

  const [active, setActive] = React.useState(0);
  const [stage, setStage] = React.useState<Stage>({ w: 0, h: 0 });
  const [trackVisible, setTrackVisible] = React.useState(false);
  const [hasFinePointer, setHasFinePointer] = React.useState(false);
  const [showWheelCursor, setShowWheelCursor] = React.useState(false);
  const [cursorPosition, setCursorPosition] = React.useState({ x: 0, y: 0 });
  const [circleFormed, setCircleFormed] = React.useState(false);
  const [expandedItem, setExpandedItem] = React.useState<number | null>(null);

  const count = items.length;
  const last = Math.max(count - 1, 0);

  React.useEffect(() => {
    const pointerQuery = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (min-width: 701px)",
    );
    const updatePointerCapability = () => setHasFinePointer(pointerQuery.matches);

    updatePointerCapability();
    pointerQuery.addEventListener("change", updatePointerCapability);
    return () => pointerQuery.removeEventListener("change", updatePointerCapability);
  }, []);

  React.useEffect(() => {
    if (expandedItem === null) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpandedItem(null);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [expandedItem]);

  React.useEffect(() => {
    const track = trackRef.current;
    if (!track || !count) return;

    const updateScrollProgress = () => {
      const scrollDistance = Math.max(
        track.offsetHeight - window.innerHeight,
        1,
      );
      const progress = clamp(
        -track.getBoundingClientRect().top / scrollDistance,
        0,
        1,
      );

      target.current = progress * count;
    };

    updateScrollProgress();
    window.addEventListener("scroll", updateScrollProgress, {
      passive: true,
    });
    window.addEventListener("resize", updateScrollProgress);

    return () => {
      window.removeEventListener("scroll", updateScrollProgress);
      window.removeEventListener("resize", updateScrollProgress);
    };
  }, [count]);

  React.useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const observer = new IntersectionObserver(
      ([entry]) => setTrackVisible(entry.isIntersecting),
      { rootMargin: "100px 0px" },
    );
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const read = () => {
      setStage({
        w: el.clientWidth,
        h: el.clientHeight,
      });
    };

    read();

    const observer = new ResizeObserver(read);
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  const metrics = React.useMemo(() => {
   
  const { w, h } = stage;

  // Keep the requested 359 x 208 size where possible.
  // Scale down proportionally on smaller screens.
  const scale = Math.min(
    1,
    w / 430,
    h / 330
  );

  const cardW = BASE_CARD_W * scale;
  const cardH = BASE_CARD_H * scale;

  const drumR = cardH * DRUM;
  const proposedRingR = cardH * RING_R;
  const scaleForRadius = (radius: number) => count
    ? clamp(
        (((2 * Math.PI * radius) / count) * 0.82) / (cardW || 1),
        0.16,
        1,
      )
    : 1;
  const mobileStage = w <= 700;
  const horizontalInset = mobileStage ? 10 : 20;
  const verticalInset = mobileStage ? 12 : 24;
  let ringR = proposedRingR;
  let ringScale = scaleForRadius(ringR);

  // Fit the ring to the viewport using its final card scale, with a tighter
  // mobile inset so the circular formation fills more of the screen.
  for (let iteration = 0; iteration < 3; iteration++) {
    const maxRingR = Math.max(
      0,
      Math.min(
        w / 2 - (cardW * ringScale) / 2 - horizontalInset,
        h / 2 - (cardH * ringScale) / 2 - verticalInset,
      ),
    );
    ringR = Math.min(proposedRingR, maxRingR);
    ringScale = scaleForRadius(ringR);
  }

  return {
    cardW,
    cardH,
    ringR,
    ringScale,
    drumR,
    bow: cardH * BOW,
    depth: cardH * LENS,
    title: cardH * TITLE,
    index: cardH * INDEX,
  };
}, [stage, count]);

  // Main animation
  React.useEffect(() => {
    if (!stage.h || !count || !trackVisible) return;

    let frame = 0;

    const { ringR, ringScale, drumR, bow } = metrics;

    const draw = () => {
      frame = requestAnimationFrame(draw);

      // Ease toward scroll progress to preserve the physical drum rotation
      // instead of snapping the cards directly to each wheel event.
      const gap = target.current - turn.current;
      if (target.current >= count - 0.0001) {
        turn.current = count;
      } else if (Math.abs(gap) < 0.0005) {
        turn.current = target.current;
      } else {
        turn.current += gap * TURN_EASE;
      }

      const t = turn.current;

      // Drum remains active while projects rotate.
      // During the final progress unit, it transforms into the ring.
      const m = clamp(count - t, 0, 1);
      const formed = m <= 0.02;
      setCircleFormed((previous) => previous === formed ? previous : formed);

      // Stop rotation on the last project while the ring forms.
      const pos = clamp(t, 0, last);

      if (wheelRef.current) {
        wheelRef.current.style.transform =
          `translateZ(${-m * drumR}px)`;
      }

      for (let i = 0; i < count; i++) {
        const d = i - pos;
        const drumDeg = d * STEP;

        const card = cardRefs.current[i];

        if (card) {
          card.style.transform = place(
            d * (360 / count),
            drumDeg,
            ringR,
            drumR,
            bow,
            m,
          );

          card.style.opacity =
            m > 0.5 && Math.abs(d) > CULL ? "0" : "1";

          card.style.zIndex = String(
            Math.round(100 - Math.abs(d) * 2),
          );
        }

        const face = card?.firstElementChild as HTMLElement | null;

        if (face) {
          face.style.transform =
            `scale(${lerp(ringScale, 1, m)})`;
        }
      }

      if (labelRef.current) {
        labelRef.current.style.opacity = String(1 - m);
      }

      if (titleRef.current) {
        titleRef.current.style.opacity = String(m);
      }

      const near = clamp(Math.round(pos), 0, last);

      setActive((previous) =>
        previous === near ? previous : near,
      );
    };

    frame = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(frame);
  }, [metrics, stage.h, count, last, trackVisible]);

  const scrollToProgress = React.useCallback(
    (progress: number) => {
      const track = trackRef.current;
      if (!track || !count) return;

      const scrollDistance = Math.max(
        track.offsetHeight - window.innerHeight,
        0,
      );
      const trackTop =
        window.scrollY + track.getBoundingClientRect().top;

      window.scrollTo({
        top:
          trackTop +
          scrollDistance * clamp(progress / count, 0, 1),
        behavior: "smooth",
      });
    },
    [count],
  );

  return (
    <div
      ref={trackRef}
      className="works-wheel-track"
      style={{ height: `${(count + 1) * 100}svh` }}
    >
      <section
        aria-label={label}
        className={`works-wheel ${className}`}
        {...props}
      >
      <header className="works-wheel-heading">
        {/* <p>Pratham Imagination <span>—</span> 2026</p>
        <h2 className="sr-only">Selected Works</h2> */}
        <TextHoverEffect text="CARDS" />
      </header>
      <div
        ref={stageRef}
        tabIndex={0}
        role="listbox"
        aria-label={label}
        aria-activedescendant={`works-wheel-${active}`}
        className={`works-wheel-stage${showWheelCursor && hasFinePointer ? " has-custom-cursor" : ""}`}
        style={{
          perspective: `${metrics.depth}px`,
        }}
        onMouseEnter={() => {
          if (hasFinePointer) setShowWheelCursor(true);
        }}
        onMouseLeave={() => setShowWheelCursor(false)}
        onMouseMove={(event) => {
          if (hasFinePointer) {
            setCursorPosition({ x: event.clientX, y: event.clientY });
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            scrollToProgress(Math.round(target.current) + 1);
          } else if (event.key === "ArrowUp") {
            scrollToProgress(Math.round(target.current) - 1);
          } else {
            return;
          }

          event.preventDefault();
        }}
      >
        <div
          ref={wheelRef}
          className="works-wheel-rotator"
        >
          {items.map((item, i) => (
            <a
              key={item.image}
              id={`works-wheel-${i}`}
              role="option"
              aria-selected={i === active}
              href={item.href || undefined}
              ref={(node) => {
                cardRefs.current[i] = node;
              }}
              className="works-wheel-card"
              style={{
                width: metrics.cardW,
                height: metrics.cardH,
                marginLeft: -metrics.cardW / 2,
                marginTop: -metrics.cardH / 2,
              }}
              onClick={(event) => {
                event.preventDefault();
                if (circleFormed) setExpandedItem(i);
              }}
            >
              <span className="works-wheel-card-face">
                <img
                  src={item.image}
                  alt={item.title}
                  style={{ objectFit: item.imageFit ?? "cover" }}
                  draggable={false}
                />

                {action && item.href && (
                  <span className="works-wheel-action">
                    <svg viewBox="0 0 12 12" aria-hidden="true">
                      <path
                        d="M3 9 9 3M4 3h5v5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {action}
                  </span>
                )}
              </span>
            </a>
          ))}
        </div>
      </div>

      {showWheelCursor && hasFinePointer && expandedItem === null && (
        <div
          aria-hidden="true"
          className="works-wheel-cursor"
          style={{ left: cursorPosition.x, top: cursorPosition.y }}
        >
          {circleFormed ? "CLICK" : "SCROLL"}
        </div>
      )}

      {expandedItem !== null && items[expandedItem] && (
        <div
          className="works-wheel-expanded"
          role="dialog"
          aria-modal="true"
          aria-label={items[expandedItem].title}
          onClick={() => setExpandedItem(null)}
        >
          <button
            type="button"
            className="works-wheel-expanded-close"
            aria-label="Close expanded card"
            onClick={() => setExpandedItem(null)}
          >
            ×
          </button>
          <img
            src={items[expandedItem].image}
            alt={items[expandedItem].title}
            onClick={(event) => event.stopPropagation()}
          />
          <p>{items[expandedItem].title}</p>
        </div>
      )}

      <div
        ref={labelRef}
        className="works-wheel-center-label"
        style={{ fontSize: metrics.title }}
      >
        {label}
      </div>

      <div
        ref={titleRef}
        className="works-wheel-front-title"
        style={{ fontSize: metrics.title }}
      >
        {items[active]?.title}
      </div>

      <ol
        className="works-wheel-index"
        style={{ fontSize: metrics.index }}
      >
        {items.map((item, i) => (
          <li key={item.image}>
            <button
              type="button"
              onClick={() => scrollToProgress(i)}
              className={i === active ? "is-active" : ""}
            >
              {item.title}
            </button>
          </li>
        ))}
      </ol>
      </section>
    </div>
  );
}

export default WorksWheel;