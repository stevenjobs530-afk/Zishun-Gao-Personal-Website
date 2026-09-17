"use client";

import { useEffect, useRef } from "react";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// Bounds of the black mark (including its leaf) in the 1448 × 1086 source.
const artwork = { width: 1448, height: 1086, x: 720, y: 480, markWidth: 486, markHeight: 564 };

export function centerAppleArtwork(width: number, height: number) {
  const scale = Math.min(
    Math.max(width / artwork.width, height / artwork.height),
    width * 0.8 / artwork.markWidth,
    height * 0.8 / artwork.markHeight,
  );
  return {
    width: artwork.width * scale,
    height: artwork.height * scale,
    left: width / 2 - artwork.x * scale,
    top: height / 2 - artwork.y * scale,
  };
}

export default function CenteredAppleArtwork() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const align = () => {
      const frame = centerAppleArtwork(element.clientWidth, element.clientHeight);
      element.style.backgroundSize = `${frame.width}px ${frame.height}px`;
      element.style.backgroundPosition = `${frame.left}px ${frame.top}px`;
    };
    const observer = new ResizeObserver(align);
    observer.observe(element);
    align();
    return () => observer.disconnect();
  }, []);
  return <span ref={ref} className="centered-apple-artwork" aria-hidden="true" style={{ backgroundImage: `url(${basePath}/case-studies/apple-app-store/apple-construction-grid.webp)` }} />;
}
