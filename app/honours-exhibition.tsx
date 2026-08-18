"use client";

import { useEffect, useRef, useState } from "react";

type Honour = {
  title: string;
  detail: string;
  label: string;
  images: Array<{ src: string; alt: string }>;
};

type Language = "en" | "zh";
const assetBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function withAssetBasePath(src: string) {
  return src.startsWith("/") ? `${assetBasePath}${src}` : src;
}

const honoursByLanguage: Record<Language, Honour[]> = {
  en: [
    {
      title: "Three Good Student",
      detail: "2022–2023 · School of International Trade and Economics, CUFE",
      label: "Academic honour",
      images: [{ src: "/achievements/three-good-student-2023.png", alt: "Central University of Finance and Economics Three Good Student certificate awarded to Gao Zishun for 2022–2023" }],
    },
    {
      title: "Comprehensive Development Scholarship",
      detail: "2021–2022 · Second Prize · School of International Trade and Economics, CUFE",
      label: "Scholarship",
      images: [{ src: "/achievements/comprehensive-development-scholarship-second-prize-2022.png", alt: "School of International Trade and Economics at Central University of Finance and Economics Comprehensive Development Scholarship Second Prize certificate awarded to Gao Zishun for 2021–2022" }],
    },
    {
      title: "三创赛 · Best Entrepreneurship",
      detail: "2023 university round · Team award · Cross-border E-commerce / Alibaba International Station",
      label: "Team award",
      images: [{ src: "/achievements/ecommerce-entrepreneurship-2023-redacted.png", alt: "Privacy-redacted Best Entrepreneurship team award certificate listing Gao Zishun for the 13th National College Student E-commerce Innovation, Creativity and Entrepreneurship Challenge, known as 三创赛, university round, 2023" }],
    },
    {
      title: "三创赛 · Best Creativity",
      detail: "2023 university round · Team award · Cross-border E-commerce / Alibaba International Station",
      label: "Team award",
      images: [{ src: "/achievements/ecommerce-creativity-2023-redacted.png", alt: "Privacy-redacted Best Creativity team award certificate listing Gao Zishun for the 13th National College Student E-commerce Innovation, Creativity and Entrepreneurship Challenge, known as 三创赛, university round, 2023" }],
    },
    {
      title: "三创赛 · Best Innovation",
      detail: "2023 university round · Team award · Cross-border E-commerce / Alibaba International Station",
      label: "Team award",
      images: [{ src: "/achievements/ecommerce-innovation-2023-redacted.png", alt: "Privacy-redacted Best Innovation team award certificate listing Gao Zishun for the 13th National College Student E-commerce Innovation, Creativity and Entrepreneurship Challenge, known as 三创赛, university round, 2023" }],
    },
    {
      title: "Market Research & Business Planning",
      detail: "2023 CMAU National Competition · University selection round · Team Second Prize",
      label: "Team award",
      images: [{ src: "/achievements/market-research-second-prize-2023-redacted.png", alt: "Privacy-redacted Second Prize certificate for Gao Zishun and team in the 2023 CMAU National College Student Market Research and Business Planning Competition university selection round" }],
    },
  ],
  zh: [
    {
      title: "三好学生",
      detail: "2022–2023 · 中央财经大学国际经济与贸易学院",
      label: "学术荣誉",
      images: [{ src: "/achievements/three-good-student-2023.png", alt: "高子舜获中央财经大学 2022–2023 学年三好学生证书" }],
    },
    {
      title: "综合发展奖学金",
      detail: "2021–2022 · 二等奖 · 中央财经大学国际经济与贸易学院",
      label: "奖学金",
      images: [{ src: "/achievements/comprehensive-development-scholarship-second-prize-2022.png", alt: "高子舜获中央财经大学国际经济与贸易学院 2021–2022 学年综合发展奖学金二等奖证书" }],
    },
    {
      title: "三创赛 · 最佳创业奖",
      detail: "2023 校赛 · 团队奖 · 跨境电商 / 阿里巴巴国际站",
      label: "团队奖",
      images: [{ src: "/achievements/ecommerce-entrepreneurship-2023-redacted.png", alt: "已隐藏其他个人信息的高子舜团队第十三届全国大学生电子商务创新、创意及创业挑战赛 2023 校赛最佳创业奖证书" }],
    },
    {
      title: "三创赛 · 最佳创意奖",
      detail: "2023 校赛 · 团队奖 · 跨境电商 / 阿里巴巴国际站",
      label: "团队奖",
      images: [{ src: "/achievements/ecommerce-creativity-2023-redacted.png", alt: "已隐藏其他个人信息的高子舜团队第十三届全国大学生电子商务创新、创意及创业挑战赛 2023 校赛最佳创意奖证书" }],
    },
    {
      title: "三创赛 · 最佳创新奖",
      detail: "2023 校赛 · 团队奖 · 跨境电商 / 阿里巴巴国际站",
      label: "团队奖",
      images: [{ src: "/achievements/ecommerce-innovation-2023-redacted.png", alt: "已隐藏其他个人信息的高子舜团队第十三届全国大学生电子商务创新、创意及创业挑战赛 2023 校赛最佳创新奖证书" }],
    },
    {
      title: "市场调查与商业策划",
      detail: "2023 CMAU 全国竞赛 · 校内选拔赛 · 团队二等奖",
      label: "团队奖",
      images: [{ src: "/achievements/market-research-second-prize-2023-redacted.png", alt: "已隐藏其他个人信息的高子舜团队 2023 CMAU 全国大学生市场调查与商业策划竞赛校内选拔赛二等奖证书" }],
    },
  ],
};

const interfaceCopy = {
  en: {
    gallery: "Achievement certificate gallery", enlarge: "Enlarge", centre: "Center", tap: "Tap to inspect", select: "Select certificate",
    dragToExplore: "Drag to explore", swipeToExplore: "Swipe to explore",
    controls: "Gallery controls", previousAchievement: "Previous achievement", nextAchievement: "Next achievement", previous: "Previous", next: "Next",
    closeLabel: "Close enlarged certificate", close: "Close", staticPreview: "Static certificate preview.", interactivePreview: "Interactive certificate. Drag horizontally for perspective.",
    certificateControls: "Certificate controls", previousCertificate: "Previous certificate", nextCertificate: "Next certificate", rotateLeft: "Rotate certificate left",
    rotateRight: "Rotate certificate right", resetAngle: "Reset certificate angle", tiltLeft: "Tilt left", tiltRight: "Tilt right", reset: "Reset",
    certificate: "Certificate", of: "of", staticHint: "Static certificate preview", inspectHint: "Use previous and next to inspect", dragHint: "Drag horizontally to inspect",
  },
  zh: {
    gallery: "荣誉证书画廊", enlarge: "放大查看", centre: "移至中间", tap: "点击查看", select: "选择证书",
    dragToExplore: "拖动浏览", swipeToExplore: "滑动浏览",
    controls: "画廊控制", previousAchievement: "上一项荣誉", nextAchievement: "下一项荣誉", previous: "上一项", next: "下一项",
    closeLabel: "关闭证书放大视图", close: "关闭", staticPreview: "证书静态预览。", interactivePreview: "交互式证书预览。横向拖动可查看纸面透视效果。",
    certificateControls: "证书控制", previousCertificate: "上一张证书", nextCertificate: "下一张证书", rotateLeft: "向左倾斜证书",
    rotateRight: "向右倾斜证书", resetAngle: "重置证书角度", tiltLeft: "向左倾斜", tiltRight: "向右倾斜", reset: "重置",
    certificate: "证书", of: "共", staticHint: "证书静态预览", inspectHint: "使用上一项与下一项查看", dragHint: "横向拖动查看",
  },
} as const;

export default function HonoursExhibition({ language }: { language: Language }) {
  const honours = honoursByLanguage[language];
  const t = interfaceCopy[language];
  const carouselItems = [
    { honour: honours[honours.length - 1], originalIndex: honours.length - 1, clone: true },
    ...honours.map((honour, originalIndex) => ({ honour, originalIndex, clone: false })),
    { honour: honours[0], originalIndex: 0, clone: true },
  ];
  const [trackIndex, setTrackIndex] = useState(1);
  const trackIndexRef = useRef(1);
  const [trackAnimated, setTrackAnimated] = useState(true);
  const [dragOffset, setDragOffset] = useState(0);
  const [trackMetrics, setTrackMetrics] = useState({ viewportWidth: 0, cardWidth: 0, step: 0 });
  const [activeHonour, setActiveHonour] = useState<number | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [rotation, setRotation] = useState(0);
  const dragStart = useRef<number | null>(null);
  const galleryDragStart = useRef<number | null>(null);
  const galleryDragged = useRef(false);
  const transitionLocked = useRef(false);
  const pendingFocus = useRef(false);
  const [galleryDragging, setGalleryDragging] = useState(false);
  const [hasExploredGallery, setHasExploredGallery] = useState(false);
  const [certificateDragging, setCertificateDragging] = useState(false);
  const closeButton = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const cardButtons = useRef<Array<HTMLButtonElement | null>>([]);
  const carouselViewport = useRef<HTMLDivElement>(null);
  const carouselTrack = useRef<HTMLDivElement>(null);
  const carouselSlides = useRef<Array<HTMLElement | null>>([]);
  const [reducedMotion, setReducedMotion] = useState(false);

  const selected = activeHonour === null ? null : honours[activeHonour];
  const activeCard = carouselItems[trackIndex]?.originalIndex ?? 0;
  const trackX = trackMetrics.viewportWidth / 2 - trackMetrics.cardWidth / 2 - trackIndex * trackMetrics.step + dragOffset;

  function updateTrackIndex(nextIndex: number) {
    trackIndexRef.current = nextIndex;
    setTrackIndex(nextIndex);
  }

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setReducedMotion(media.matches);
    updateMotionPreference();
    media.addEventListener("change", updateMotionPreference);
    return () => media.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    const viewport = carouselViewport.current;
    const track = carouselTrack.current;
    const slide = carouselSlides.current[0];
    if (!viewport || !track || !slide) return;

    const measure = () => {
      const gap = Number.parseFloat(window.getComputedStyle(track).columnGap) || 0;
      const cardWidth = slide.offsetWidth;
      const currentIndex = trackIndexRef.current;
      const normalisedIndex = currentIndex === 0 ? honours.length : currentIndex === honours.length + 1 ? 1 : currentIndex;
      transitionLocked.current = false;
      pendingFocus.current = false;
      setTrackAnimated(false);
      if (normalisedIndex !== currentIndex) updateTrackIndex(normalisedIndex);
      setTrackMetrics({ viewportWidth: viewport.clientWidth, cardWidth, step: cardWidth + gap });
      window.requestAnimationFrame(() => window.requestAnimationFrame(() => setTrackAnimated(true)));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(slide);
    return () => observer.disconnect();
  }, [language, honours.length]);

  useEffect(() => {
    if (!selected) return;
    dialogRef.current?.showModal();
    closeButton.current?.focus();
    return () => {
      openerRef.current?.focus();
    };
  }, [selected]);

  function openHonour(index: number) {
    openerRef.current = document.activeElement as HTMLElement;
    setActiveHonour(index);
    setActiveImage(0);
    setRotation(0);
  }

  function closeHonour() {
    dialogRef.current?.close();
    setActiveHonour(null);
    setActiveImage(0);
    setRotation(0);
  }

  function moveImage(direction: -1 | 1) {
    if (!selected) return;
    setActiveImage((current) => (current + direction + selected.images.length) % selected.images.length);
    setRotation(0);
  }

  function finishTrackMove(completedIndex: number) {
    const normalisedIndex = completedIndex === 0 ? honours.length : completedIndex === honours.length + 1 ? 1 : completedIndex;
    const focusAfterMove = pendingFocus.current;
    pendingFocus.current = false;

    if (normalisedIndex !== completedIndex) {
      setTrackAnimated(false);
      updateTrackIndex(normalisedIndex);
      window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
        setTrackAnimated(true);
        transitionLocked.current = false;
        if (focusAfterMove) cardButtons.current[carouselItems[normalisedIndex].originalIndex]?.focus();
      }));
      return;
    }

    transitionLocked.current = false;
    if (focusAfterMove) cardButtons.current[carouselItems[normalisedIndex].originalIndex]?.focus();
  }

  function moveToTrack(nextIndex: number, focusCard = false) {
    if (!trackMetrics.step || transitionLocked.current || nextIndex === trackIndexRef.current) return;
    pendingFocus.current = focusCard;

    if (reducedMotion) {
      const normalisedIndex = nextIndex === 0 ? honours.length : nextIndex === honours.length + 1 ? 1 : nextIndex;
      transitionLocked.current = true;
      setTrackAnimated(false);
      updateTrackIndex(normalisedIndex);
      window.requestAnimationFrame(() => {
        setTrackAnimated(true);
        transitionLocked.current = false;
        pendingFocus.current = false;
        if (focusCard) cardButtons.current[carouselItems[normalisedIndex].originalIndex]?.focus();
      });
      return;
    }

    transitionLocked.current = true;
    setTrackAnimated(true);
    updateTrackIndex(nextIndex);
  }

  function moveCard(direction: -1 | 1, focusCard = false) {
    moveToTrack(trackIndexRef.current + direction, focusCard);
  }

  function handleGalleryPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if ((event.target as Element).closest(".honour-carousel-controls")) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (transitionLocked.current) return;
    galleryDragStart.current = event.clientX;
    galleryDragged.current = false;
    setTrackAnimated(false);
  }

  function handleGalleryPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (galleryDragStart.current === null) return;
    if (Math.abs(event.clientX - galleryDragStart.current) > 6) {
      galleryDragged.current = true;
      setGalleryDragging(true);
      setHasExploredGallery(true);
      if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.setPointerCapture(event.pointerId);
      }
    }
    setDragOffset(event.clientX - galleryDragStart.current);
  }

  function handleGalleryPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (galleryDragStart.current === null) return;
    const delta = event.clientX - galleryDragStart.current;
    if (Math.abs(delta) > 48) {
      moveCard(delta < 0 ? 1 : -1);
    } else {
      setTrackAnimated(true);
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    galleryDragStart.current = null;
    setDragOffset(0);
    setGalleryDragging(false);
    window.setTimeout(() => {
      galleryDragged.current = false;
    }, 0);
  }

  function handleGalleryPointerCancel(event: React.PointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    galleryDragStart.current = null;
    galleryDragged.current = false;
    setDragOffset(0);
    setTrackAnimated(true);
    setGalleryDragging(false);
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    dragStart.current = event.clientX;
    setCertificateDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (dragStart.current === null) return;
    if (reducedMotion) return;
    const delta = event.clientX - dragStart.current;
    setRotation(Math.max(-11, Math.min(11, delta / 15)));
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (dragStart.current === null || !selected) return;
    const delta = event.clientX - dragStart.current;
    if (selected.images.length > 1 && Math.abs(delta) > 64) moveImage(delta < 0 ? 1 : -1);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    dragStart.current = null;
    setRotation(0);
    setCertificateDragging(false);
  }

  function handlePointerCancel(event: React.PointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    dragStart.current = null;
    setRotation(0);
    setCertificateDragging(false);
  }

  return (
    <>
      <div className={`honours-carousel${galleryDragging ? " is-dragging" : ""}`} role="region" aria-label={t.gallery} tabIndex={0} onDragStart={(event) => event.preventDefault()} onKeyDown={(event) => {
        if (event.key === "ArrowLeft") { event.preventDefault(); moveCard(-1, true); }
        if (event.key === "ArrowRight") { event.preventDefault(); moveCard(1, true); }
      }} onPointerDown={handleGalleryPointerDown} onPointerMove={handleGalleryPointerMove} onPointerUp={handleGalleryPointerUp} onPointerCancel={handleGalleryPointerCancel}>
        <div ref={carouselViewport} className="honour-carousel-viewport">
          <div ref={carouselTrack} className={`honour-carousel-track${trackAnimated ? " is-animated" : ""}${trackMetrics.step ? " is-ready" : ""}`} style={{ transform: `translate3d(${trackX}px, 0, 0)` }} onTransitionEnd={(event) => {
            if (event.target === event.currentTarget && event.propertyName === "transform" && transitionLocked.current) finishTrackMove(trackIndexRef.current);
          }} onTransitionCancel={(event) => {
            if (event.target === event.currentTarget && event.propertyName === "transform" && transitionLocked.current) finishTrackMove(trackIndexRef.current);
          }}>
            {carouselItems.map(({ honour, originalIndex, clone }, itemIndex) => {
              const isActive = itemIndex === trackIndex;
              return (
                <article ref={(element) => { carouselSlides.current[itemIndex] = element; }} className={`honour-slot honour-carousel-item${isActive ? " honour-carousel-active" : ""}`} key={`${honour.title}-${itemIndex}`} aria-hidden={clone || !isActive}>
                  <button ref={(element) => { if (!clone) cardButtons.current[originalIndex] = element; }} className="honour-art" type="button" onClick={() => {
                    if (galleryDragged.current) {
                      galleryDragged.current = false;
                      return;
                    }
                    if (isActive) openHonour(originalIndex);
                    else moveToTrack(itemIndex);
                  }} aria-label={isActive ? `${t.enlarge} ${honour.title}` : `${t.centre} ${honour.title}`} aria-current={isActive ? "true" : undefined} tabIndex={!clone && isActive ? 0 : -1}>
                    <span className="honour-art-frame">
                      <img src={withAssetBasePath(honour.images[0].src)} alt="" loading="lazy" />
                    </span>
                    <span className="honour-open-label">{isActive ? t.tap : t.select}</span>
                  </button>
                  <div className="honour-meta">
                    <div><h3>{honour.title}</h3><p>{honour.detail}</p></div>
                    <span>{honour.label}</span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
        <div className={`honour-explore-hint${hasExploredGallery ? " is-explored" : ""}`} aria-hidden="true">
          <span className="honour-explore-arrow">↔</span>
          <span className="honour-explore-desktop">{t.dragToExplore}</span>
          <span className="honour-explore-touch">{t.swipeToExplore}</span>
        </div>
        <div className="honour-carousel-controls" role="group" aria-label={t.controls}>
          <button type="button" onClick={() => moveCard(-1)} aria-label={t.previousAchievement}>{t.previous}</button>
          <span aria-live="polite">{activeCard + 1} / {honours.length}</span>
          <button type="button" onClick={() => moveCard(1)} aria-label={t.nextAchievement}>{t.next}</button>
        </div>
      </div>

      {selected && (
        <dialog ref={dialogRef} className="honour-dialog" aria-labelledby="honour-dialog-title" onCancel={(event) => { event.preventDefault(); closeHonour(); }} onClick={(event) => event.target === event.currentTarget && closeHonour()} onKeyDown={(event) => {
            if (event.target instanceof HTMLButtonElement) return;
            if (event.key === "ArrowLeft") { event.preventDefault(); moveImage(-1); }
            if (event.key === "ArrowRight") { event.preventDefault(); moveImage(1); }
          }}>
            <div className="honour-dialog-header">
              <div><span>{selected.label}</span><h3 id="honour-dialog-title">{selected.title}</h3></div>
              <button ref={closeButton} type="button" onClick={closeHonour} aria-label={t.closeLabel}>{t.close}</button>
            </div>

            <div className={`certificate-stage${certificateDragging ? " is-dragging" : ""}${reducedMotion ? " is-static" : ""}`} tabIndex={reducedMotion ? -1 : 0} aria-label={reducedMotion ? t.staticPreview : t.interactivePreview} onDragStart={(event) => event.preventDefault()} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerCancel}>
              <div className="certificate-plane" style={{ transform: `rotateX(2deg) rotateY(${rotation}deg)` }}>
                <img src={withAssetBasePath(selected.images[activeImage].src)} alt={selected.images[activeImage].alt} draggable={false} />
              </div>
            </div>

            <div className="honour-dialog-footer">
              <p>{selected.detail}</p>
              <div className="certificate-controls" role="group" aria-label={t.certificateControls}>
                {selected.images.length > 1 && <button type="button" onClick={() => moveImage(-1)} aria-label={t.previousCertificate}>{t.previous}</button>}
                {!reducedMotion && <button type="button" onClick={() => setRotation((value) => Math.max(-11, value - 4))} aria-label={t.rotateLeft}>{t.tiltLeft}</button>}
                {!reducedMotion && <button type="button" onClick={() => setRotation(0)} aria-label={t.resetAngle}>{t.reset}</button>}
                {!reducedMotion && <button type="button" onClick={() => setRotation((value) => Math.min(11, value + 4))} aria-label={t.rotateRight}>{t.tiltRight}</button>}
                {selected.images.length > 1 && <button type="button" onClick={() => moveImage(1)} aria-label={t.nextCertificate}>{t.next}</button>}
              </div>
              <span className="certificate-counter" aria-live="polite">{t.certificate} {activeImage + 1} {t.of} {selected.images.length} · {reducedMotion ? (selected.images.length > 1 ? t.inspectHint : t.staticHint) : t.dragHint}</span>
            </div>
        </dialog>
      )}
    </>
  );
}
