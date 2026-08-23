"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { siriOrbPreset } from "./brand-orb-preset";
import { createOrbRenderer, type OrbRendererHandle } from "./orb-renderer";

const appBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function withBasePath(path: string): string {
  return path.startsWith("/") ? `${appBasePath}${path}` : path;
}

export default function BrandOrb() {
  const fallbackSrc = withBasePath("/orb/siri-orb-fallback.png?v=2");
  const rootRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<OrbRendererHandle | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    const orbCanvas = canvas;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = document.visibilityState === "visible";
    let intersecting = true;
    let rendererFailed = false;
    let rendererReady = false;

    function syncRenderer() {
      const shouldAnimate = visible && intersecting && !reduceMotion.matches;
      if (shouldAnimate && !rendererRef.current && !rendererFailed) {
        rendererRef.current = createOrbRenderer({
          canvas: orbCanvas,
          getParams: () => siriOrbPreset,
          onReady: () => {
            rendererReady = true;
            root.dataset.orbMode = "webgpu";
            root.dataset.orbActive = visible && intersecting && !reduceMotion.matches ? "true" : "false";
            setReady(true);
          },
          onError: (error) => {
            rendererFailed = true;
            root.dataset.orbMode = "fallback";
            root.dataset.orbError = error.message;
            rendererRef.current?.dispose();
            rendererRef.current = null;
            setReady(false);
          },
        });
      }
      rendererRef.current?.setActive(shouldAnimate);
      root.dataset.orbActive = shouldAnimate && rendererReady ? "true" : "false";
      if (reduceMotion.matches) {
        root.dataset.orbMode = "reduced-motion";
        setReady(false);
      } else if (rendererReady) {
        root.dataset.orbMode = "webgpu";
        setReady(true);
      }
    }

    const observer = new IntersectionObserver(([entry]) => {
      intersecting = entry?.isIntersecting ?? false;
      syncRenderer();
    });
    const onVisibilityChange = () => {
      visible = document.visibilityState === "visible";
      syncRenderer();
    };
    const onMotionChange = () => syncRenderer();

    observer.observe(root);
    document.addEventListener("visibilitychange", onVisibilityChange);
    reduceMotion.addEventListener("change", onMotionChange);
    syncRenderer();

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      reduceMotion.removeEventListener("change", onMotionChange);
      rendererRef.current?.dispose();
      rendererRef.current = null;
    };
  }, []);

  return (
    <span
      ref={rootRef}
      className="brand-orb"
      aria-hidden="true"
      data-orb-ready={ready ? "true" : "false"}
      data-orb-mode="fallback"
      data-orb-active="false"
      style={{ "--brand-orb-fallback": `url(${fallbackSrc})` } as CSSProperties}
    >
      <span className="brand-orb-fallback" />
      <canvas ref={canvasRef} className="brand-orb-canvas" />
    </span>
  );
}
