"use client";

import { useId, useState, type PointerEvent } from "react";
import "./text-hover-effect.css";

type TextHoverEffectProps = {
  text: string;
  className?: string;
};

export function TextHoverEffect({
  text,
  className = "",
}: TextHoverEffectProps) {
  const id = useId().replace(/:/g, "");
  const [pointer, setPointer] = useState({ x: 300, y: 90 });
  const [hovered, setHovered] = useState(false);

  const movePointer = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    setPointer({
      x: ((event.clientX - bounds.left) / bounds.width) * 600,
      y: ((event.clientY - bounds.top) / bounds.height) * 180,
    });
  };

  return (
    <div
      className={`text-hover-effect ${className}`}
      aria-hidden="true"
      onPointerEnter={() => setHovered(true)}
      onPointerMove={movePointer}
      onPointerLeave={() => setHovered(false)}
    >
      <svg
        viewBox="0 0 600 180"
        preserveAspectRatio="xMidYMid meet"
        className="text-hover-effect-svg"
      >
        <defs>
          <linearGradient id={`${id}-stroke`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f4f0e9" />
            <stop offset="45%" stopColor="#a7c7ff" />
            <stop offset="100%" stopColor="#f4f0e9" />
          </linearGradient>
          <radialGradient
            id={`${id}-reveal`}
            gradientUnits="userSpaceOnUse"
            cx={pointer.x}
            cy={pointer.y}
            r="190"
          >
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="58%" stopColor="white" stopOpacity="0.92" />
            <stop offset="100%" stopColor="black" stopOpacity="0" />
          </radialGradient>
          <mask id={`${id}-mask`}>
            <rect width="600" height="180" fill={`url(#${id}-reveal)`} />
          </mask>
          <filter id={`${id}-glow`} x="-40%" y="-50%" width="180%" height="200%">
            <feGaussianBlur stdDeviation="3.5" />
          </filter>
        </defs>
        <text
          x="50%"
          y="52%"
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-hover-effect-outline"
        >
          {text}
        </text>
        <text
          x="50%"
          y="52%"
          textAnchor="middle"
          dominantBaseline="middle"
          className={`text-hover-effect-glow${hovered ? " is-visible" : ""}`}
          stroke={`url(#${id}-stroke)`}
          filter={`url(#${id}-glow)`}
          mask={`url(#${id}-mask)`}
        >
          {text}
        </text>
        <text
          x="50%"
          y="52%"
          textAnchor="middle"
          dominantBaseline="middle"
          className={`text-hover-effect-highlight${hovered ? " is-visible" : ""}`}
          stroke={`url(#${id}-stroke)`}
          mask={`url(#${id}-mask)`}
        >
          {text}
        </text>
      </svg>
    </div>
  );
}
