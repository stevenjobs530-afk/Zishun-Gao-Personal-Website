"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import PortfolioBackLink from "../../components/portfolio-back-link";
import styles from "./personal-training.module.css";
import StrengthDemo from "./strength-demo";

const appBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const mediaBasePath = `${appBasePath}/media`;

const HERO_VIDEO_URL = `${appBasePath}/personal-projects/personal-training/video/ocean-hero-720p.mp4`;
const HERO_VIDEO_POSTER = `${appBasePath}/personal-projects/personal-training/backgrounds/personal-training-motivation.webp`;

type HeroVideoState = "loading" | "playing" | "poster" | "reduced-motion";

const MENU_ITEMS = [
  { label: "Overview", target: "top" },
  { label: "Motivation", target: "motivation" },
  { label: "Custom Demo", target: "customisation" },
  { label: "Training Models", target: "training-models" },
  { label: "Progress", target: "progress" },
  { label: "Architecture", target: "architecture" },
] as const;

const FLEET = [
  {
    src: `${mediaBasePath}/video/training-strength.mp4`,
    poster: `${mediaBasePath}/posters/training-strength.jpg`,
    title: "STRENGTH",
    target: "customisation",
    action: "TRY THE DEMO",
    specs: [
      "User-named exercise or machine",
      "Setup notes",
      "Warm-up and working sets",
      "Weight, reps and optional notes",
      "Dated training sessions",
    ],
  },
  {
    src: `${mediaBasePath}/video/training-cardio.mp4`,
    poster: `${mediaBasePath}/posters/training-cardio.jpg`,
    title: "CARDIO",
    target: "training-models",
    action: "SEE THE MODEL",
    specs: [
      "User-named activities",
      "Six fixed activity categories",
      "Duration and calories",
      "Conditional distance fields",
      "Kilometres or miles",
      "Optional notes",
    ],
  },
  {
    src: `${mediaBasePath}/video/training-progress.mp4`,
    poster: `${mediaBasePath}/posters/training-progress.jpg`,
    title: "PROGRESS",
    target: "progress",
    action: "READ THE TREND",
    specs: [
      "Working sets only",
      "Average weight over time",
      "Selected cardio date ranges",
      "Cumulative calorie totals",
      "No AI or readiness scoring",
    ],
  },
] as const;

type FleetStyle = CSSProperties & { "--fleet-poster": string };

const titleVariants = {
  hidden: { opacity: 0, y: 40, transition: { duration: 0.48 } },
  visible: { opacity: 1, y: 0, transition: { duration: 0.96 } },
};

const titleContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

function ProjectNavigation({ onNavigate }: { onNavigate: (target: string) => void }) {
  return (
    <nav className={styles.projectNavigation} aria-label="Personal Training project navigation">
      <div className={styles.sectionNavigation}>
        {MENU_ITEMS.map((item) => (
          <a
            key={item.target}
            href={`#${item.target}`}
            onClick={(event) => {
              event.preventDefault();
              onNavigate(item.target);
            }}
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

function FleetVideo({ item, index, onNavigate }: { item: (typeof FLEET)[number]; index: number; onNavigate: (target: string) => void }) {
  const articleRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [videoState, setVideoState] = useState<"poster" | "loading" | "playing">("poster");
  const prefersReducedMotion = useReducedMotion();

  const play = useCallback(() => {
    setIsActive(true);
    if (prefersReducedMotion) return;
    setVideoState("loading");
    const playback = videoRef.current?.play();
    if (playback) void playback.catch(() => setVideoState("poster"));
  }, [prefersReducedMotion]);

  const pause = useCallback(() => {
    setIsActive(false);
    videoRef.current?.pause();
    setVideoState("poster");
  }, []);

  useEffect(() => {
    const article = articleRef.current;
    const video = videoRef.current;
    if (!article || prefersReducedMotion) return;

    const touchPointer = window.matchMedia("(hover: none), (pointer: coarse)");
    let observer: IntersectionObserver | null = null;

    const updateObserver = () => {
      observer?.disconnect();
      observer = null;
      if (!touchPointer.matches) {
        pause();
        return;
      }

      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.55) play();
          else pause();
        },
        { threshold: [0, 0.55, 0.75] },
      );
      observer.observe(article);
    };

    updateObserver();
    touchPointer.addEventListener("change", updateObserver);
    return () => {
      observer?.disconnect();
      touchPointer.removeEventListener("change", updateObserver);
      video?.pause();
    };
  }, [pause, play, prefersReducedMotion]);

  const fleetStyle: FleetStyle = { "--fleet-poster": `url(${item.poster})` };

  return (
    <motion.article
      ref={articleRef}
      className={styles.fleetColumn}
      initial={{ x: prefersReducedMotion ? 0 : "100vw" }}
      animate={{ x: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 1.56, delay: prefersReducedMotion ? 0 : index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={play}
      onMouseLeave={pause}
      onFocus={play}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) pause();
      }}
      data-active={isActive}
      data-video-state={videoState}
      style={fleetStyle}
    >
      <video
        ref={videoRef}
        className={styles.fleetVideo}
        muted
        loop
        playsInline
        preload="metadata"
        poster={item.poster}
        onPlaying={() => setVideoState("playing")}
        onWaiting={() => setVideoState("poster")}
        onStalled={() => setVideoState("poster")}
        onError={() => setVideoState("poster")}
      >
        <source src={item.src} type="video/mp4" />
      </video>
      <div className={styles.fleetShade} />
      <div className={styles.fleetContent}>
        <div className={styles.fleetMask}>
          <h2>{item.title.split("\n").map((line) => <span key={line}>{line}</span>)}</h2>
        </div>
        <dl>
          {item.specs.map((spec, specIndex) => (
            <motion.div
              key={spec}
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.45, delay: prefersReducedMotion ? 0 : specIndex * 0.045 }}
            >
              <dt>{String(specIndex + 1).padStart(2, "0")}</dt>
              <dd>{spec}</dd>
            </motion.div>
          ))}
        </dl>
        <button type="button" className={styles.viewButton} onClick={() => onNavigate(item.target)}>{item.action}</button>
      </div>
    </motion.article>
  );
}

function RevealBlock({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.72, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function ProjectStory() {
  return (
    <div className={styles.story}>
      <section id="motivation" className={`${styles.storySection} ${styles.motivationSection}`} tabIndex={-1}>
        <RevealBlock className={styles.sectionHeadingBlock}>
          <p className={styles.sectionIndex}>01 · MOTIVATION</p>
          <h2 tabIndex={-1}>WHY THE EXERCISE LIST IS USER DEFINED</h2>
        </RevealBlock>
        <RevealBlock className={styles.motivationCopy}>
          <p className={styles.leadCopy}>I started this project because equipment, layouts, names and machine condition can vary from one gym to the next.</p>
          <p>A fixed library cannot describe every real environment. I therefore made strength exercises and machines user-named, with setup notes for details such as a seat position, grip or machine number. It is a focused design choice for my logging routine, not a claim that one approach suits every person or outperforms every established product.</p>
        </RevealBlock>
      </section>

      <section id="customisation" className={`${styles.storySection} ${styles.customisationSection}`} tabIndex={-1}>
        <RevealBlock className={styles.sectionHeadingBlock}>
          <p className={styles.sectionIndex}>02 · CUSTOM DEMO</p>
          <h2 tabIndex={-1}>EDIT A FICTIONAL EXERCISE AND SESSION</h2>
          <p>Rename the fictional machine, adjust its setup note, and build temporary warm-up or working sets. This demonstration exists only in this page&apos;s React memory.</p>
        </RevealBlock>
        <RevealBlock className={styles.demoWrap}>
          <StrengthDemo />
        </RevealBlock>
      </section>

      <section id="training-models" className={`${styles.storySection} ${styles.modelsSection}`} tabIndex={-1}>
        <RevealBlock className={styles.sectionHeadingBlock}>
          <p className={styles.sectionIndex}>03 · TRAINING MODELS &amp; PROGRESS</p>
          <h2 tabIndex={-1}>STRENGTH CARDIO AND REST DAY RECORDS</h2>
          <p>Strength and Cardio keep different fields because they describe different kinds of session. Progress reads from those records without inventing a scoring layer.</p>
        </RevealBlock>

        <div className={styles.modelGrid}>
          <RevealBlock className={styles.modelCard}>
            <p className={styles.modelNumber}>01</p>
            <h3>Strength</h3>
            <p>Each dated session links a user-named exercise or machine to warm-up or working sets. A set records weight, reps and an optional note; the exercise can also retain its own setup note.</p>
            <ul>
              <li>User-named exercise or machine</li>
              <li>Date and set type</li>
              <li>Weight, repetitions and set note</li>
            </ul>
          </RevealBlock>
          <RevealBlock className={styles.modelCard}>
            <p className={styles.modelNumber}>02</p>
            <h3>Cardio</h3>
            <p>Cardio uses a separate model with user-named activities inside six fixed categories: indoor walk, outdoor walk, indoor run, outdoor run, cycling and elliptical.</p>
            <ul>
              <li>Duration and calories</li>
              <li>Conditional distance fields</li>
              <li>Kilometres or miles and an optional note</li>
            </ul>
          </RevealBlock>
          <RevealBlock className={styles.modelCard}>
            <p className={styles.modelNumber}>03</p>
            <h3>Rest Day</h3>
            <p>Recovery in the application means a Rest Day record. It is not a physiological recovery score, wearable-derived readiness measure or medical assessment.</p>
          </RevealBlock>
        </div>

        <RevealBlock className={styles.progressPanel}>
          <div id="progress" className={styles.progressAnchor} tabIndex={-1}>
            <p className={styles.sectionIndex}>PROGRESS · READ-ONLY DERIVATION</p>
            <h3 tabIndex={-1}>HOW THE SUMMARY VALUES ARE CALCULATED</h3>
          </div>
          <div className={styles.progressDiagram} aria-label="Illustrative progress calculation">
            <div><span>WORKING SETS</span><strong>32.5</strong><small>average kg · illustrative</small></div>
            <div className={styles.trendLine} aria-hidden="true"><i /><i /><i /><i /></div>
            <div><span>SELECTED CARDIO RANGE</span><strong>1,840</strong><small>cumulative kcal · illustrative</small></div>
          </div>
          <p>Strength excludes warm-up sets and calculates average working-set weight over time for the selected exercise. Cardio totals kcal inside a selected date range. These are lightweight descriptive trends—not AI, readiness, medical advice or a professional performance judgement.</p>
        </RevealBlock>
      </section>

      <section id="architecture" className={`${styles.storySection} ${styles.architectureSection}`} tabIndex={-1}>
        <RevealBlock className={styles.sectionHeadingBlock}>
          <p className={styles.sectionIndex}>04 · ARCHITECTURE &amp; LIMITS</p>
          <h2 tabIndex={-1}>TECHNICAL STRUCTURE AND CURRENT LIMITS</h2>
        </RevealBlock>
        <RevealBlock className={styles.architectureGrid}>
          <div className={styles.stackPanel}>
            <p>Application stack</p>
            <ul>
              <li><span>Interface</span><strong>Next.js 16.2.9 · React 19.2.7</strong></li>
              <li><span>Language</span><strong>TypeScript</strong></li>
              <li><span>Styling</span><strong>Tailwind CSS</strong></li>
              <li><span>Data layer</span><strong>Supabase SSR / JS</strong></li>
              <li><span>Write boundary</span><strong>Authenticated server actions</strong></li>
              <li><span>Ownership</span><strong>Owner-scoped RLS</strong></li>
            </ul>
          </div>
          <div className={styles.boundaryCopy}>
            <h3>What this page shows and does not show</h3>
            <p>The application is an independent personal full-stack project. Its authenticated server actions and owner-scoped Row Level Security are design mechanisms for separating records, not claims of a security audit or commercial-scale maturity.</p>
            <p>This showcase does not connect to private data. Every demo value is fictional, temporary and reset by refresh. The project may still have gaps in UX refinement, automated test coverage, accessibility and scaling.</p>
            <p>Established commercial products have broader feature sets, exercise libraries, ecosystems and teams. This project takes a narrower focus: user-defined names and setup notes, separate Strength and Cardio models, owner-scoped permissions and an independently implemented full-stack workflow.</p>
          </div>
        </RevealBlock>
      </section>
    </div>
  );
}

export default function PersonalTrainingHero() {
  const [isFleetOpen, setIsFleetOpen] = useState(false);
  const [heroVideoState, setHeroVideoState] = useState<HeroVideoState>("loading");
  const prefersReducedMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const backgroundVideoRef = useRef<HTMLVideoElement>(null);
  const exploreButtonRef = useRef<HTMLButtonElement>(null);
  const fleetCloseRef = useRef<HTMLButtonElement>(null);
  const fleetOverlayRef = useRef<HTMLElement>(null);

  useEffect(() => {
    document.documentElement.lang = "en";
    const url = new URL(window.location.href);
    if (url.searchParams.get("lang") !== "en") {
      url.searchParams.set("lang", "en");
      window.history.replaceState(null, "", `${url.pathname}?${url.searchParams.toString()}${url.hash}`);
    }
  }, []);

  const requestHeroPlayback = useCallback(async () => {
    const video = backgroundVideoRef.current;
    if (!video || prefersReducedMotion || document.visibilityState !== "visible") return;

    if (!video.paused && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      setHeroVideoState("playing");
      return;
    }

    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    if (video.error) video.load();
    setHeroVideoState("loading");
    try {
      await video.play();
      if (!video.paused && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) setHeroVideoState("playing");
    } catch {
      setHeroVideoState("poster");
    }
  }, [prefersReducedMotion]);

  const handleHeroVideoPlaying = useCallback(() => {
    if (prefersReducedMotion) {
      backgroundVideoRef.current?.pause();
      setHeroVideoState("reduced-motion");
    } else {
      setHeroVideoState("playing");
    }
  }, [prefersReducedMotion]);

  const showHeroPoster = useCallback(() => {
    if (!prefersReducedMotion) setHeroVideoState("poster");
  }, [prefersReducedMotion]);

  useEffect(() => {
    const hero = heroRef.current;
    const video = backgroundVideoRef.current;
    if (!hero || !video) return;

    if (prefersReducedMotion) {
      video.pause();
      const frame = window.requestAnimationFrame(() => setHeroVideoState("reduced-motion"));
      return () => window.cancelAnimationFrame(frame);
    }

    const heroRect = hero.getBoundingClientRect();
    let isHeroVisible = heroRect.bottom > 0 && heroRect.top < window.innerHeight;
    const updatePlayback = () => {
      if (isHeroVisible && document.visibilityState === "visible") {
        void requestHeroPlayback();
      } else {
        video.pause();
        setHeroVideoState("poster");
      }
    };

    const handleVisibilityChange = () => updatePlayback();
    const handlePageShow = () => updatePlayback();
    const retryFromUserGesture = () => {
      if (!isHeroVisible || !video.paused) return;
      void requestHeroPlayback();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isHeroVisible = entry.isIntersecting && entry.intersectionRatio >= 0.05;
        updatePlayback();
      },
      { threshold: [0, 0.05, 0.25] },
    );
    observer.observe(hero);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("touchend", retryFromUserGesture, { capture: true, passive: true });
    document.addEventListener("click", retryFromUserGesture, true);
    document.addEventListener("keydown", retryFromUserGesture, true);
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("focus", updatePlayback);
    updatePlayback();

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("touchend", retryFromUserGesture, true);
      document.removeEventListener("click", retryFromUserGesture, true);
      document.removeEventListener("keydown", retryFromUserGesture, true);
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("focus", updatePlayback);
      video.pause();
    };
  }, [prefersReducedMotion, requestHeroPlayback]);

  useEffect(() => {
    if (!isFleetOpen) return;
    document.documentElement.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsFleetOpen(false);
        requestAnimationFrame(() => exploreButtonRef.current?.focus());
        return;
      }

      if (event.key !== "Tab" || !fleetOverlayRef.current) return;
      const focusable = [...fleetOverlayRef.current.querySelectorAll<HTMLElement>("button")];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    requestAnimationFrame(() => fleetCloseRef.current?.focus());
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFleetOpen]);

  const closeFleet = () => {
    setIsFleetOpen(false);
    requestAnimationFrame(() => exploreButtonRef.current?.focus());
  };

  const navigateToSection = useCallback((target: string) => {
    setIsFleetOpen(false);
    window.setTimeout(() => {
      const section = document.getElementById(target);
      section?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
      if (target !== "top") {
        section?.focus({ preventScroll: true });
      }
    }, prefersReducedMotion ? 0 : 80);
  }, [prefersReducedMotion]);

  return (
    <main className={styles.page}>
      <section ref={heroRef} id="top" className={styles.heroViewport} aria-labelledby="personal-training-hero-title">
        <PortfolioBackLink
          href={`${appBasePath}/?lang=en#personal-training-project`}
          language="en"
          ariaLabel="Back to Portfolio — return to the Personal Training project card"
        />
        <ProjectNavigation onNavigate={navigateToSection} />

        <motion.div
          className={styles.heroHeading}
          initial="hidden"
          animate="visible"
          variants={titleContainer}
        >
          <motion.p
            className={styles.heroEyebrow}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
          >
            PERSONAL TRAINING WEBSITE V2 · INDEPENDENT FULL-STACK PROJECT
          </motion.p>
          <h1 id="personal-training-hero-title" className={styles.heroTitle}>
            <motion.span variants={titleVariants}>A PERSONAL</motion.span>
            <motion.em variants={titleVariants}>TRAINING LOG</motion.em>
            <motion.span variants={titleVariants}>FOR STRENGTH AND</motion.span>
            <motion.em variants={titleVariants}>CARDIO RECORDS</motion.em>
          </h1>
        </motion.div>

        <motion.div
          className={styles.heroMedia}
          data-video-state={heroVideoState}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={styles.background}>
            <video
              ref={backgroundVideoRef}
              src={HERO_VIDEO_URL}
              poster={HERO_VIDEO_POSTER}
              className={styles.backgroundVideo}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-hidden="true"
              onLoadedData={() => void requestHeroPlayback()}
              onCanPlay={() => void requestHeroPlayback()}
              onPlaying={handleHeroVideoPlaying}
              onWaiting={showHeroPoster}
              onStalled={showHeroPoster}
              onError={showHeroPoster}
            />
          </div>
          <div className={styles.loadingShade} />
          <div className={styles.heroMediaFooter}>
            <p className={styles.heroDescription}>
              A mobile-first personal project for recording user-named strength exercises and machines, structured sets, cardio sessions, rest days and simple summaries based on saved records.
            </p>
            <button
              ref={exploreButtonRef}
              type="button"
              className={styles.exploreButton}
              onClick={() => setIsFleetOpen(true)}
            >
              Explore training models <span aria-hidden="true">↗</span>
            </button>
          </div>
        </motion.div>

        <AnimatePresence>
          {isFleetOpen ? (
          <motion.section
            className={styles.fleetOverlay}
            ref={fleetOverlayRef}
            key="fleet"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0 } }}
            onAnimationComplete={() => {
              if (isFleetOpen) fleetCloseRef.current?.focus();
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Training models overview"
          >
            <button ref={fleetCloseRef} type="button" className={styles.fleetClose} onClick={closeFleet} aria-label="Close fleet viewer">
              CLOSE <span aria-hidden="true">×</span>
            </button>
            {FLEET.map((item, index) => <FleetVideo item={item} index={index} key={item.title} onNavigate={navigateToSection} />)}
          </motion.section>
          ) : null}
        </AnimatePresence>
      </section>
      <ProjectStory />
    </main>
  );
}
