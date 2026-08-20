"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./resilient-background-video.module.css";

const PLAYBACK_TIMEOUT_MS = 2500;

type VideoState = "loading" | "playing" | "fallback" | "reduced-motion";

type ResilientBackgroundVideoProps = {
  src: string;
  poster: string;
  playLabel: string;
  className?: string;
  videoClassName?: string;
  controlClassName?: string;
  priority?: boolean;
};

type PosterStyle = CSSProperties & {
  "--background-video-poster": string;
};

export default function ResilientBackgroundVideo({
  src,
  poster,
  playLabel,
  className,
  videoClassName,
  controlClassName,
  priority = false,
}: ResilientBackgroundVideoProps) {
  const mediaRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playbackTimerRef = useRef<number | null>(null);
  const isVisibleRef = useRef(priority);
  const reducedMotionRef = useRef(false);
  const [videoState, setVideoState] = useState<VideoState>("loading");

  const clearPlaybackTimer = useCallback(() => {
    if (playbackTimerRef.current === null) return;
    window.clearTimeout(playbackTimerRef.current);
    playbackTimerRef.current = null;
  }, []);

  const scheduleFallback = useCallback(() => {
    clearPlaybackTimer();
    if (reducedMotionRef.current) return;
    playbackTimerRef.current = window.setTimeout(() => {
      playbackTimerRef.current = null;
      const video = videoRef.current;
      if (video && (video.paused || video.currentTime < 0.1)) setVideoState("fallback");
    }, PLAYBACK_TIMEOUT_MS);
  }, [clearPlaybackTimer]);

  const requestPlayback = useCallback(async (fromUserGesture = false) => {
    const video = videoRef.current;
    if (!video || reducedMotionRef.current || document.visibilityState !== "visible") return;
    if (!fromUserGesture && !isVisibleRef.current) return;

    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    setVideoState((current) => current === "playing" ? current : "loading");
    scheduleFallback();

    try {
      await video.play();
      if (!video.paused && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        clearPlaybackTimer();
        setVideoState("playing");
      }
    } catch {
      clearPlaybackTimer();
      setVideoState("fallback");
    }
  }, [clearPlaybackTimer, scheduleFallback]);

  useEffect(() => {
    const media = mediaRef.current;
    const video = videoRef.current;
    if (!media || !video) return;

    const updateVisibility = () => {
      if (isVisibleRef.current && document.visibilityState === "visible") {
        void requestPlayback();
      } else {
        clearPlaybackTimer();
        video.pause();
      }
    };

    const bounds = media.getBoundingClientRect();
    isVisibleRef.current = bounds.bottom > 0 && bounds.top < window.innerHeight;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting && entry.intersectionRatio >= 0.05;
        updateVisibility();
      },
      { threshold: [0, 0.05, 0.5] },
    );
    observer.observe(media);
    document.addEventListener("visibilitychange", updateVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", updateVisibility);
      clearPlaybackTimer();
      video.pause();
    };
  }, [clearPlaybackTimer, requestPlayback]);

  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const video = videoRef.current;

    const updateMotionPreference = () => {
      reducedMotionRef.current = motionPreference.matches;
      clearPlaybackTimer();
      if (motionPreference.matches) {
        video?.pause();
        setVideoState("reduced-motion");
      } else {
        setVideoState("loading");
        void requestPlayback();
      }
    };

    updateMotionPreference();
    motionPreference.addEventListener("change", updateMotionPreference);
    return () => motionPreference.removeEventListener("change", updateMotionPreference);
  }, [clearPlaybackTimer, requestPlayback]);

  const posterStyle: PosterStyle = { "--background-video-poster": `url(${poster})` };

  return (
    <>
      <div
        ref={mediaRef}
        className={`${styles.media}${className ? ` ${className}` : ""}`}
        data-video-state={videoState}
        data-resilient-background-video
        style={posterStyle}
        aria-hidden="true"
      >
        <video
          ref={videoRef}
          className={`${styles.video}${videoClassName ? ` ${videoClassName}` : ""}`}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload={priority ? "auto" : "metadata"}
          onCanPlay={() => void requestPlayback()}
          onPlaying={() => {
            clearPlaybackTimer();
            setVideoState("playing");
          }}
          onWaiting={scheduleFallback}
          onStalled={scheduleFallback}
          onError={() => {
            clearPlaybackTimer();
            setVideoState("fallback");
          }}
        >
          <source src={src} type="video/mp4" />
        </video>
      </div>
      {videoState === "fallback" ? (
        <button
          type="button"
          className={`${styles.playControl}${controlClassName ? ` ${controlClassName}` : ""}`}
          onClick={() => {
            const video = videoRef.current;
            if (video?.error) video.load();
            void requestPlayback(true);
          }}
        >
          <span aria-hidden="true">▶</span>
          {playLabel}
        </button>
      ) : null}
    </>
  );
}
