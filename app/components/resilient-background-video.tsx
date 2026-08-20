"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./resilient-background-video.module.css";

type VideoState = "loading" | "playing" | "poster" | "reduced-motion";

type ResilientBackgroundVideoProps = {
  src: string;
  poster: string;
  className?: string;
  videoClassName?: string;
  priority?: boolean;
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
}: ResilientBackgroundVideoProps) {
  const mediaRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isVisibleRef = useRef(priority);
  const reducedMotionRef = useRef(false);
  const [videoState, setVideoState] = useState<VideoState>("loading");

  const requestPlayback = useCallback(async () => {
    const video = videoRef.current;
    if (!video || reducedMotionRef.current || !isVisibleRef.current || document.visibilityState !== "visible") return;

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
  }, []);

  useEffect(() => {
    const media = mediaRef.current;
    const video = videoRef.current;
    if (!media || !video) return;

    const updatePlayback = () => {
      if (isVisibleRef.current && document.visibilityState === "visible") {
        void requestPlayback();
      } else {
        video.pause();
        if (!reducedMotionRef.current) setVideoState("poster");
      }
    };

    const retryFromUserGesture = () => {
      if (!isVisibleRef.current || reducedMotionRef.current || !video.paused) return;
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
    updatePlayback();

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", updatePlayback);
      document.removeEventListener("touchend", retryFromUserGesture, true);
      document.removeEventListener("click", retryFromUserGesture, true);
      document.removeEventListener("keydown", retryFromUserGesture, true);
      window.removeEventListener("pageshow", updatePlayback);
      window.removeEventListener("focus", updatePlayback);
      video.pause();
    };
  }, [requestPlayback]);

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

  const posterStyle: PosterStyle = { "--background-video-poster": `url(${poster})` };
  const showPoster = () => {
    if (!reducedMotionRef.current) setVideoState("poster");
  };
  const handlePlaying = () => {
    if (reducedMotionRef.current) {
      videoRef.current?.pause();
      setVideoState("reduced-motion");
    } else {
      setVideoState("playing");
    }
  };

  return (
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
        onLoadedData={() => void requestPlayback()}
        onCanPlay={() => void requestPlayback()}
        onPlaying={handlePlaying}
        onWaiting={showPoster}
        onStalled={showPoster}
        onError={showPoster}
      >
        <source src={src} type="video/mp4" />
      </video>
    </div>
  );
}
