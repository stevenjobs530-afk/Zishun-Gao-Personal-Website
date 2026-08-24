"use client";

import { useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";
import Image from "next/image";

type Language = "en" | "zh";

const appBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const rotationIntervalMs = 2700;

const logos = [
  ["ChatGPT", "ChatGPT.svg"],
  ["Claude", "Claude.svg"],
  ["DeepSeek", "DeepSeek.svg"],
  ["Gemini", "Gemini.svg"],
  ["Grok", "Grok.svg"],
  ["Kimi", "Kimi-Black.svg"],
] as const;

const interfaceCopy = {
  en: {
    eyebrow: "AI research tools",
    title: "A layered view of the workflow toolkit",
    groupLabel: "Rotating group of AI tool logos used as part of the research workflow",
    note: "Tool identification only · no partnership or endorsement implied",
    pause: "Pause logo rotation",
    play: "Play logo rotation",
    reduced: "Logo rotation is off because reduced motion is enabled",
  },
  zh: {
    eyebrow: "AI 研究工具",
    title: "工作流工具的层叠视图",
    groupLabel: "研究工作流中使用的 AI 工具 Logo 轮播组",
    note: "仅用于识别工具 · 不代表合作或官方背书",
    pause: "暂停 Logo 轮播",
    play: "播放 Logo 轮播",
    reduced: "已启用减少动态效果，Logo 轮播已关闭",
  },
} as const;

export default function AiLogoLoop({ language }: { language: Language }) {
  const [frontIndex, setFrontIndex] = useState(0);
  const [manualPaused, setManualPaused] = useState(false);
  const [interactionPaused, setInteractionPaused] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const t = interfaceCopy[language];
  const isPaused = manualPaused || interactionPaused || !pageVisible || reducedMotion;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    const updateVisibility = () => setPageVisible(document.visibilityState === "visible");

    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    return () => document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  useEffect(() => {
    if (isPaused) return;

    const interval = window.setInterval(() => {
      setFrontIndex((current) => (current + 1) % logos.length);
    }, rotationIntervalMs);

    return () => window.clearInterval(interval);
  }, [isPaused]);

  return (
    <section
      className="ai-logo-loop"
      aria-label={t.groupLabel}
      onMouseEnter={() => setInteractionPaused(true)}
      onMouseLeave={() => setInteractionPaused(false)}
      onFocusCapture={() => setInteractionPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setInteractionPaused(false);
        }
      }}
      tabIndex={0}
    >
      <div className="ai-logo-loop-heading">
        <div>
          <span>{t.eyebrow}</span>
          <h3>{t.title}</h3>
        </div>
        <button
          type="button"
          className="ai-logo-loop-control"
          aria-label={reducedMotion ? t.reduced : manualPaused ? t.play : t.pause}
          aria-pressed={manualPaused}
          disabled={reducedMotion}
          onClick={() => setManualPaused((current) => !current)}
        >
          {manualPaused || reducedMotion ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
        </button>
      </div>

      <div className="ai-logo-loop-stage" aria-hidden="true">
        {logos.map(([name, file], index) => {
          const position = (index - frontIndex + logos.length) % logos.length;
          return (
            <div className="ai-logo-loop-item" data-position={position} key={name}>
              <Image
                src={`${appBasePath}/case-studies/ai-workflow/logos/${file}`}
                alt=""
                width={56}
                height={56}
                unoptimized
              />
            </div>
          );
        })}
      </div>

      <ul className="ai-logo-loop-names">
        {logos.map(([name]) => <li key={name}>{name}</li>)}
      </ul>
      <p className="ai-logo-loop-note">{t.note}</p>
    </section>
  );
}
