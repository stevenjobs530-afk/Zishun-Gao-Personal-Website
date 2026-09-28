"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./resilient-background-video.module.css";
import Image from "next/image";

type VideoState = "loading" | "playing" | "poster" | "paused" | "reduced-motion";

type ResilientBackgroundVideoProps = {
  src: string;
  poster: string;
  className?: string;
  videoClassName?: string;
  priority?: boolean;
  staticOnMobile?: boolean;
  /** Renders a visible pause/play control (WCAG 2.2.2) with labels in this language. */
  language?: "en" | "zh";
  controlClassName?: string;
};

type PosterStyle = CSSProperties & {
  "--background-video-poster": string;
};

export default function ResilientBackgroundVideo({
  src,
  poster,
  className,
  videoClassName,
  priority = false,
  staticOnMobile = false,
  language,
  controlClassName,
}: ResilientBackgroundVideoProps) {
  const mediaRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isVisibleRef = useRef(priority);
  const reducedMotionRef = useRef(false);
  const userPausedRef = useRef(false);
  const [videoState, setVideoState] = useState<VideoState>("loading");
  const [userPaused, setUserPaused] = useState(false);

  const requestPlayback = useCallback(async () => {
    const video = videoRef.current;
    if (!video || reducedMotionRef.current || userPausedRef.current || !isVisibleRef.current || document.visibilityState !== "visible" || (staticOnMobile && window.matchMedia("(max-width: 768px)").matches)) return;

    if (!video.paused && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      setVideoState("playing");
      return;
    }

    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    if (video.error) video.load();
    setVideoState("loading");

    try {
      await video.play();
      if (!video.paused && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) setVideoState("playing");
    } catch {
      setVideoState("poster");
    }
  }, [staticOnMobile]);

  // Effects run in order: the stored pause choice and the reduced-motion
  // preference are both known before the playback effect first calls play().
  // Native autoPlay may already have started the video, so pause it explicitly.
  useEffect(() => {
    userPausedRef.current = readStoredMotionPause();
    if (!userPausedRef.current) return;
    videoRef.current?.pause();
    const frame = window.requestAnimationFrame(() => {
      setUserPaused(true);
      setVideoState((current) => current === "reduced-motion" ? current : "paused");
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const video = videoRef.current;

    const updateMotionPreference = () => {
      reducedMotionRef.current = motionPreference.matches;
      if (motionPreference.matches) {
        video?.pause();
        setVideoState("reduced-motion");
      } else {
        void requestPlayback();
      }
    };

    updateMotionPreference();
    motionPreference.addEventListener("change", updateMotionPreference);
    return () => motionPreference.removeEventListener("change", updateMotionPreference);
  }, [requestPlayback]);

  useEffect(() => {
    const media = mediaRef.current;
    const video = videoRef.current;
    if (!media || !video) return;

    const updatePlayback = () => {
      if (staticOnMobile && window.matchMedia("(max-width: 768px)").matches) {
        video.pause();
        setVideoState("poster");
      } else if (isVisibleRef.current && document.visibilityState === "visible") {
        void requestPlayback();
      } else {
        video.pause();
        if (!reducedMotionRef.current) setVideoState("poster");
      }
    };

    const retryFromUserGesture = () => {
      if (!isVisibleRef.current || reducedMotionRef.current || userPausedRef.current || !video.paused) return;
      void requestPlayback();
    };

    const bounds = media.getBoundingClientRect();
    isVisibleRef.current = bounds.bottom > 0 && bounds.top < window.innerHeight;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting && entry.intersectionRatio >= 0.05;
        updatePlayback();
      },
      { threshold: [0, 0.05, 0.5] },
    );
    observer.observe(media);
    document.addEventListener("visibilitychange", updatePlayback);
    document.addEventListener("touchend", retryFromUserGesture, { capture: true, passive: true });
    document.addEventListener("click", retryFromUserGesture, true);
    document.addEventListener("keydown", retryFromUserGesture, true);
    window.addEventListener("pageshow", updatePlayback);
    window.addEventListener("focus", updatePlayback);
    window.addEventListener("resize", updatePlayback);
    updatePlayback();

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", updatePlayback);
      document.removeEventListener("touchend", retryFromUserGesture, true);
      document.removeEventListener("click", retryFromUserGesture, true);
      document.removeEventListener("keydown", retryFromUserGesture, true);
      window.removeEventListener("pageshow", updatePlayback);
      window.removeEventListener("focus", updatePlayback);
      window.removeEventListener("resize", updatePlayback);
      video.pause();
    };
  }, [requestPlayback, staticOnMobile]);


  const posterStyle: PosterStyle = { "--background-video-poster": `url(${poster})` };
  const showPoster = () => {
    if (!reducedMotionRef.current) setVideoState(userPausedRef.current ? "paused" : "poster");
  };
  const togglePlayback = () => {
    const nextPaused = !userPausedRef.current;
    userPausedRef.current = nextPaused;
    setUserPaused(nextPaused);
    storeMotionPause(nextPaused);
    if (nextPaused) {
      videoRef.current?.pause();
      setVideoState("paused");
    } else {
      void requestPlayback();
    }
  };
  const showControl = Boolean(language) && videoState !== "reduced-motion";
  const handlePlaying = () => {
    if (reducedMotionRef.current) {
      videoRef.current?.pause();
      setVideoState("reduced-motion");
    } else if (userPausedRef.current) {
      videoRef.current?.pause();
      setVideoState("paused");
    } else {
      setVideoState("playing");
    }
  };

  return (
    <>
    <div
      ref={mediaRef}
      className={`${styles.media}${className ? ` ${className}` : ""}`}
      data-video-state={videoState}
      data-resilient-background-video
      data-static-on-mobile={staticOnMobile || undefined}
      style={posterStyle}
      aria-hidden="true"
    >
      <Image src={poster} alt="" fill sizes="100vw" unoptimized priority={priority} className={styles.poster} />
      <video
        ref={videoRef}
        className={`${styles.video}${videoClassName ? ` ${videoClassName}` : ""}`}
        poster={poster}
        autoPlay={!staticOnMobile}
        muted
        loop
        playsInline
        preload={priority ? "auto" : "metadata"}
        onLoadedData={() => void requestPlayback()}
        onCanPlay={() => void requestPlayback()}
        onPlaying={handlePlaying}
        onWaiting={showPoster}
        onStalled={showPoster}
        onError={showPoster}
        onPause={showPoster}
      >
        <source src={src} type="video/mp4" />
      </video>
    </div>
    {showControl && language ? (
      <VideoPauseButton
        language={language}
        paused={userPaused}
        onToggle={togglePlayback}
        className={`${styles.control}${staticOnMobile ? ` ${styles.controlDesktopOnly}` : ""}${controlClassName ? ` ${controlClassName}` : ""}`}
      />
    ) : null}
    </>
  );
}

const MOTION_PAUSE_KEY = "portfolio-background-motion-paused";

/** A viewer's pause choice carries across pages in the same tab. */
export function readStoredMotionPause() {
  try {
    return window.sessionStorage.getItem(MOTION_PAUSE_KEY) === "true";
  } catch {
    return false;
  }
}

export function storeMotionPause(paused: boolean) {
  try {
    if (paused) window.sessionStorage.setItem(MOTION_PAUSE_KEY, "true");
    else window.sessionStorage.removeItem(MOTION_PAUSE_KEY);
  } catch {
    // Storage can be unavailable (private mode); the choice then lasts for this page only.
  }
}

const pauseLabels = {
  en: { pause: "Pause background video", play: "Play background video" },
  zh: { pause: "暂停背景视频", play: "播放背景视频" },
} as const;

export function VideoPauseButton({
  language,
  paused,
  onToggle,
  className,
}: {
  language: "en" | "zh";
  paused: boolean;
  onToggle: () => void;
  className?: string;
}) {
  const label = paused ? pauseLabels[language].play : pauseLabels[language].pause;
  return (
    <button
      type="button"
      className={`${styles.pauseButton}${className ? ` ${className}` : ""}`}
      onClick={onToggle}
      aria-label={label}
      title={label}
      data-video-pause-control
      data-paused={paused}
    >
      {paused ? (
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16"><path d="M4.5 2.8v10.4L13 8z" fill="currentColor" /></svg>
      ) : (
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16"><path d="M4 2.8h2.6v10.4H4zm5.4 0H12v10.4H9.4z" fill="currentColor" /></svg>
      )}
    </button>
  );
}
