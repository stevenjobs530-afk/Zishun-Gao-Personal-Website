"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ClipboardCheck,
  Database,
  ExternalLink,
  FileCheck2,
  Globe2,
  HeartHandshake,
  LockKeyhole,
  MessageCircleMore,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import PortfolioBackLink from "../../components/portfolio-back-link";
import ResilientBackgroundVideo from "../../components/resilient-background-video";
import "./aep-case-study.scss";

type Language = "en" | "zh";
const appBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const repositoryUrl = "https://github.com/stevenjobs530-afk/AEP-Workplace-Wellbeing-Questionnaire-Formal";
const questionnaireUrl = "https://stevenjobs530-afk.github.io/AEP-Workplace-Wellbeing-Questionnaire-Formal/";
const heroVideo = `${appBasePath}/media/video/early-career-wellbeing-hero.mp4`;
const heroPoster = `${appBasePath}/media/posters/early-career-wellbeing-hero.jpg`;

const flowIcons = [ClipboardCheck, ShieldCheck, LockKeyhole, FileCheck2, Database];

const copy = {
  en: {
    research: "Research",
    system: "System",
    safeguards: "Safeguards",
    language: "中文",
    languageLabel: "Switch to Chinese",
    navLabel: "AEP case study navigation",
    backLabel: "Back to Portfolio — return to the AEP project card",
    questionnaireLabel: "Open the live AEP questionnaire in a new tab",
    repositoryLabel: "Open the AEP questionnaire repository in a new tab",
    eyebrow: "Case study 03 · Applied research · Supabase · Research safeguards",
    title: "A questionnaire on the transition from education to employment",
    summary:
      "The seven-stage questionnaire covers job-search pressure, workplace belonging, changing skill expectations and support needs, with route-specific questions and protected submission handling.",
    explore: "Explore the research design",
    openQuestionnaire: "Open live questionnaire",
    metrics: [
      ["3", "participant routes"],
      ["7", "guided stages"],
      ["RLS", "protected response storage"],
    ],
    sections: {
      purpose: {
        label: "01 / Research purpose",
        title: "Research scope and boundaries",
        body: "This University of Bristol Applied Extended Project explores how students, recent graduates and early-career professionals experience the move from education into work. It focuses on pressure, belonging, changing skill expectations and the support that may make the transition more manageable.",
        boundaryLabel: "Research boundary",
        boundary: "The questionnaire does not collect clinical or diagnostic information. This case study describes the research instrument and its technical safeguards; it does not display participant responses or claim research findings.",
      },
      routes: {
        label: "02 / Participant routes",
        title: "Three routes keep questions relevant to each participant group",
        intro: "Routing keeps questions relevant while preserving a clear way to decline participation or skip non-required items.",
        items: [
          ["B1", "Students and recent graduates", "Questions are framed around expectations of entering work, including anticipated pressure, belonging and support."],
          ["B2", "Early-career professionals", "Questions use lived experience from the first three years after graduation rather than asking participants to speculate."],
          ["Open", "None of the above", "The main rating sections are skipped and the participant may leave only an optional open comment."],
        ],
        consentLabel: "Consent handling",
        consent: "Choosing not to participate ends the questionnaire without creating a response row.",
      },
      themes: {
        label: "03 / Questionnaire themes",
        title: "Five themes used in the questionnaire",
        items: [
          ["Job-search pressure", "Applications, waiting, rejection, feedback and uncertainty before work begins."],
          ["Workplace belonging", "Connection with colleagues, role clarity and the move into a professional identity."],
          ["AI-related pressure", "Changing skill expectations and the need for clear guidance on responsible use."],
          ["Cross-cultural adjustment", "Workplace norms, communication, relocation and unfamiliar expectations where applicable."],
          ["Employer support", "Onboarding, mentoring, manager capability, confidentiality and accessible follow-up."],
        ],
      },
      flow: {
        label: "04 / Data flow",
        title: "Response validation storage and export preparation",
        steps: [
          ["01", "Questionnaire", "The active route and optional answers are serialized without collecting account or login identifiers."],
          ["02", "Validate", "An Edge Function checks origin, consent, version, route, controlled options, ranges and text limits."],
          ["03", "Protect", "The browser cannot read or write the response table directly; the service function performs the insert."],
          ["04", "Check", "Integrity queries test duplicates, consent, routes and selection limits before any export."],
          ["05", "Export", "A flattened CSV-ready query supports later analysis while test and live modes remain separated."],
        ],
      },
      safeguards: {
        label: "05 / Participant agency",
        title: "Optionality and data access across the interface and backend",
        intro: "The interface and backend use the same principle: collect only what the research needs, make optionality visible and prevent the public browser from becoming a data-access surface.",
        items: [
          ["Voluntary", "Participants may stop before submission and may skip questions except where consent or routing requires an answer."],
          ["Non-diagnostic", "The questionnaire explicitly avoids presenting itself as a psychological or clinical assessment."],
          ["Anonymous by design", "The response schema does not store a name, email, login identifier, IP address or user agent."],
          ["Deny by default", "RLS is enabled and public browser roles receive no direct response-table privileges."],
        ],
      },
      code: {
        label: "06 / Technical proof",
        title: "The server checks that each submission follows the selected route",
        body: "Client-side branching improves the experience, but hidden fields are not treated as a security boundary. The submission function independently derives the expected route and rejects inconsistent payloads.",
        filename: "supabase/functions/submit-aep-questionnaire/index.ts · TypeScript",
        snippet: `function expectedRoute(situation: string) {
  if (situation === "student" || situation === "recent") return "b1";
  if (situation === "professional") return "b2";
  return "open";
}

if (payload.consented !== true) throw new Error("CONSENT_REQUIRED");
if (payload.route !== expectedRoute(payload.situation as string)) {
  throw new Error("INVALID_ROUTE");
}`,
      },
      outcomes: {
        label: "07 / Results and limits",
        title: "What the current system supports and what this page does not report",
        items: [
          ["Adaptive", "A single public questionnaire supports expectation-based, experience-based and open-comment routes."],
          ["Traceable", "Questionnaire version, route rules, validation and export logic form a reviewable chain."],
          ["Analysis-ready", "Likert items, controlled choices, arrays and optional text remain structurally distinguishable for later work."],
        ],
        limitLabel: "What this page does not claim",
        limit: "No participant responses, aggregate findings or claims about the wider early-career population are presented here. The portfolio documents the instrument and infrastructure only.",
      },
      closing: {
        label: "Summary",
        title: "The project combines questionnaire design with documented data safeguards",
        body: "It covers participant choice, route-specific questions, server-side checks, protected storage and a structured export for later analysis.",
        questionnaire: "Open the questionnaire",
        repository: "Review the repository",
        projects: "Back to all projects",
      },
    },
  },
  zh: {
    research: "研究",
    system: "系统",
    safeguards: "保护措施",
    language: "EN",
    languageLabel: "Switch to English",
    navLabel: "AEP 案例研究导航",
    backLabel: "返回作品集中的 AEP 项目卡片",
    questionnaireLabel: "在新标签页中打开 AEP 正式问卷",
    repositoryLabel: "在新标签页中打开 AEP 问卷代码仓库",
    eyebrow: "案例研究 03 · 应用研究 · Supabase · 研究保护措施",
    title: "一份关于从教育走向就业经历的问卷",
    summary: "这份七阶段问卷涉及求职压力、职场归属感、技能预期变化与支持需求，并使用分组问题和受保护的提交流程。",
    explore: "浏览研究设计",
    openQuestionnaire: "打开正式问卷",
    metrics: [["3", "参与者路径"], ["7", "引导式阶段"], ["RLS", "受保护的回答存储"]],
    sections: {
      purpose: {
        label: "01 / 研究目的",
        title: "研究范围与边界",
        body: "这项布里斯托大学 Applied Extended Project 关注学生、应届毕业生与职场新人从教育走向就业时的经历，重点包括压力、归属感、技能预期变化，以及可能让过渡更可控的支持。",
        boundaryLabel: "研究边界",
        boundary: "问卷不收集临床或诊断信息。本案例展示研究工具及其技术保护措施；不会呈现参与者回答，也不会提前声称研究结论。",
      },
      routes: {
        label: "02 / 参与者路径",
        title: "三条路径让不同参与者看到与自身情况相关的问题",
        intro: "路径分流让问题保持相关，同时清楚保留拒绝参与和跳过非必答题的权利。",
        items: [
          ["B1", "学生与应届毕业生", "问题围绕进入职场前的预期，包括可能出现的压力、归属感与支持需求。"],
          ["B2", "职场新人", "问题基于毕业后三年内的真实经历，而不是要求参与者进行假设。"],
          ["开放", "以上均不适用", "系统跳过主要量表部分，只提供一项可选的开放评论。"],
        ],
        consentLabel: "同意状态处理",
        consent: "选择不参与会直接结束问卷，并且不会建立回答记录。",
      },
      themes: {
        label: "03 / 问卷主题",
        title: "问卷使用的五个主题",
        items: [
          ["求职压力", "申请、等待、拒绝、反馈，以及正式入职前的不确定性。"],
          ["工作场所归属感", "与同事建立联系、明确角色，以及向职业身份的过渡。"],
          ["AI 相关压力", "技能预期变化，以及对负责任使用方式的清晰指导。"],
          ["跨文化适应", "在适用情况下，关注职场规范、沟通、搬迁与陌生预期。"],
          ["雇主支持", "入职引导、导师支持、管理者能力、保密性与可持续跟进。"],
        ],
      },
      flow: {
        label: "04 / 数据流程",
        title: "回答验证 存储与导出准备",
        steps: [
          ["01", "问卷", "序列化当前路径与可选回答，不收集账户或登录标识。"],
          ["02", "验证", "Edge Function 检查来源、同意状态、版本、路径、选项、评分范围与文本长度。"],
          ["03", "保护", "浏览器不能直接读写回答表；只有服务器函数执行插入。"],
          ["04", "检查", "导出前使用完整性查询检查重复、同意状态、路径与选择限制。"],
          ["05", "导出", "扁平化的 CSV 查询支持后续分析，同时保持测试与正式数据分离。"],
        ],
      },
      safeguards: {
        label: "05 / 参与者自主权",
        title: "界面与后端共同处理可选性和数据访问",
        intro: "界面与后端遵循同一原则：只收集研究真正需要的信息，明确展示可选性，并防止公开浏览器成为数据访问入口。",
        items: [
          ["自愿参与", "参与者可在提交前停止，并可跳过除同意与路径分流所需之外的问题。"],
          ["非诊断", "问卷明确说明自己不是心理或临床评估。"],
          ["匿名设计", "回答结构不存储姓名、邮箱、登录标识、IP 地址或浏览器用户代理。"],
          ["默认拒绝", "RLS 已启用，公开浏览器角色没有回答表的直接访问权限。"],
        ],
      },
      code: {
        label: "06 / 技术证据",
        title: "服务器检查每次提交是否符合所选路径",
        body: "客户端分流可以改善体验，但隐藏字段并不是安全边界。提交函数会独立推导应有路径，并拒绝不一致的数据。",
        filename: "supabase/functions/submit-aep-questionnaire/index.ts · TypeScript",
        snippet: `function expectedRoute(situation: string) {
  if (situation === "student" || situation === "recent") return "b1";
  if (situation === "professional") return "b2";
  return "open";
}

if (payload.consented !== true) throw new Error("CONSENT_REQUIRED");
if (payload.route !== expectedRoute(payload.situation as string)) {
  throw new Error("INVALID_ROUTE");
}`,
      },
      outcomes: {
        label: "07 / 结果与边界",
        title: "当前系统支持与本页未报告的内容",
        items: [
          ["自适应", "同一公开问卷支持基于预期、基于真实经历，以及开放评论三类路径。"],
          ["可追溯", "问卷版本、路径规则、验证与导出逻辑构成可复核的链条。"],
          ["便于分析", "量表题、受控选项、数组与可选文本在结构上保持清晰区分。"],
        ],
        limitLabel: "本页不会声称什么",
        limit: "本页不呈现参与者回答、汇总结论，也不对更广泛的职场新人群体作出推断。作品集只记录研究工具与基础设施。",
      },
      closing: {
        label: "项目总结",
        title: "该项目结合了问卷设计与有记录的数据保护措施",
        body: "内容包括参与者选择、分组问题、服务端检查、受保护存储与供后续分析使用的结构化导出。",
        questionnaire: "打开正式问卷",
        repository: "查看代码仓库",
        projects: "返回所有项目",
      },
    },
  },
} as const;

export default function AepCaseStudy({ initialLanguage }: { initialLanguage: Language }) {
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const resolvedUrlLanguage = useRef(false);
  const t = copy[language];
  const portfolioHref = `${appBasePath}/?lang=${language}#project-early-career-wellbeing`;

  useEffect(() => {
    const url = new URL(window.location.href);
    if (!resolvedUrlLanguage.current) {
      resolvedUrlLanguage.current = true;
      const requestedLanguage = url.searchParams.get("lang") === "zh" ? "zh" : "en";
      if (requestedLanguage !== language) {
        const timer = window.setTimeout(() => setLanguage(requestedLanguage), 0);
        return () => window.clearTimeout(timer);
      }
    }

    const previousLanguage = document.documentElement.lang;
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
    document.title = language === "zh" ? "AEP 职场新人福祉问卷 — 高子舜" : "Early-Career Wellbeing Questionnaire — Zishun Gao";
    document.querySelector('meta[name="description"]')?.setAttribute(
      "content",
      language === "zh"
        ? "一项关注教育到就业过渡、参与者自主权与受保护研究数据流程的应用研究案例。"
        : "An AEP questionnaire project covering early-career wellbeing, participant routing, server-side validation and protected research data.",
    );
    return () => { document.documentElement.lang = previousLanguage; };
  }, [language]);

  function toggleLanguage() {
    const next: Language = language === "en" ? "zh" : "en";
    setLanguage(next);
    const url = new URL(window.location.href);
    url.searchParams.set("lang", next);
    window.history.replaceState({}, "", url);
  }

  return (
    <main className="aep-page" lang={language === "zh" ? "zh-CN" : "en"}>
      <PortfolioBackLink href={portfolioHref} language={language} ariaLabel={t.backLabel} />
      <section className="aep-hero" aria-labelledby="aep-title">
        <ResilientBackgroundVideo
          className="aep-hero-media"
          videoClassName="aep-hero-video"
          src={heroVideo}
          poster={heroPoster}
          playLabel={language === "zh" ? "播放背景动画" : "Play background animation"}
          priority
        />
        <div className="aep-hero-shade" aria-hidden="true" />

        <header className="aep-nav">
          <nav className="aep-nav-links aep-glass" aria-label={t.navLabel}>
            <a href="#research">{t.research}</a>
            <a href="#system">{t.system}</a>
            <a href="#safeguards">{t.safeguards}</a>
            <button type="button" onClick={toggleLanguage} aria-label={t.languageLabel}>{t.language}</button>
          </nav>
          <button className="aep-mobile-language aep-glass" type="button" onClick={toggleLanguage} aria-label={t.languageLabel}>{t.language}</button>
        </header>

        <div className="aep-hero-copy">
          <p>{t.eyebrow}</p>
          <h1 id="aep-title">{t.title}</h1>
          <span>{t.summary}</span>
          <div className="aep-hero-actions">
            <a className="aep-primary" href="#research">{t.explore}<ArrowRight aria-hidden="true" /></a>
            <a className="aep-secondary aep-glass" href={questionnaireUrl} target="_blank" rel="noreferrer" aria-label={t.questionnaireLabel}>{t.openQuestionnaire}<ExternalLink aria-hidden="true" /></a>
          </div>
        </div>

        <dl className="aep-metrics aep-glass">
          {t.metrics.map(([value, label]) => <div key={label}><dt>{value}</dt><dd>{label}</dd></div>)}
        </dl>
      </section>

      <article className="aep-story">
        <section id="research" className="aep-section aep-purpose" aria-labelledby="purpose-title">
          <div className="aep-heading"><p>{t.sections.purpose.label}</p><h2 id="purpose-title">{t.sections.purpose.title}</h2></div>
          <div className="aep-purpose-grid">
            <p>{t.sections.purpose.body}</p>
            <aside><span>{t.sections.purpose.boundaryLabel}</span><p>{t.sections.purpose.boundary}</p></aside>
          </div>
        </section>

        <section className="aep-section aep-routes aep-dark" aria-labelledby="routes-title">
          <div className="aep-heading"><p>{t.sections.routes.label}</p><h2 id="routes-title">{t.sections.routes.title}</h2></div>
          <p className="aep-intro">{t.sections.routes.intro}</p>
          <div className="aep-route-grid">
            {t.sections.routes.items.map(([code, title, body], index) => <article key={code}><span>{code}</span>{index === 0 ? <Sparkles aria-hidden="true" /> : index === 1 ? <Users aria-hidden="true" /> : <MessageCircleMore aria-hidden="true" />}<h3>{title}</h3><p>{body}</p></article>)}
          </div>
          <aside className="aep-consent-note"><strong>{t.sections.routes.consentLabel}</strong><p>{t.sections.routes.consent}</p></aside>
        </section>

        <section className="aep-section aep-themes" aria-labelledby="themes-title">
          <div className="aep-heading"><p>{t.sections.themes.label}</p><h2 id="themes-title">{t.sections.themes.title}</h2></div>
          <div className="aep-theme-field">
            {t.sections.themes.items.map(([title, body], index) => <article key={title} className={`aep-theme-${index + 1}`}><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{body}</p></article>)}
          </div>
        </section>

        <section id="system" className="aep-section aep-flow aep-dark" aria-labelledby="flow-title">
          <div className="aep-heading"><p>{t.sections.flow.label}</p><h2 id="flow-title">{t.sections.flow.title}</h2></div>
          <ol>{t.sections.flow.steps.map(([number, title, body], index) => {
            const Icon = flowIcons[index];
            return <li key={number}><div><Icon aria-hidden="true" /></div><span>{number}</span><h3>{title}</h3><p>{body}</p></li>;
          })}</ol>
        </section>

        <section id="safeguards" className="aep-section aep-safeguards" aria-labelledby="safeguards-title">
          <div className="aep-heading"><p>{t.sections.safeguards.label}</p><h2 id="safeguards-title">{t.sections.safeguards.title}</h2></div>
          <p className="aep-intro">{t.sections.safeguards.intro}</p>
          <div className="aep-safeguard-grid">
            {t.sections.safeguards.items.map(([title, body], index) => <article key={title}>{index === 0 ? <HeartHandshake aria-hidden="true" /> : index === 1 ? <Globe2 aria-hidden="true" /> : index === 2 ? <Users aria-hidden="true" /> : <LockKeyhole aria-hidden="true" />}<h3>{title}</h3><p>{body}</p></article>)}
          </div>
        </section>

        <section className="aep-section aep-code aep-dark" aria-labelledby="code-title">
          <div><div className="aep-heading"><p>{t.sections.code.label}</p><h2 id="code-title">{t.sections.code.title}</h2></div><p>{t.sections.code.body}</p></div>
          <pre aria-label={t.sections.code.filename}><span>{t.sections.code.filename}</span><code>{t.sections.code.snippet}</code></pre>
        </section>

        <section className="aep-section aep-outcomes" aria-labelledby="outcomes-title">
          <div className="aep-heading"><p>{t.sections.outcomes.label}</p><h2 id="outcomes-title">{t.sections.outcomes.title}</h2></div>
          <ol>{t.sections.outcomes.items.map(([title, body], index) => <li key={title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{body}</p></li>)}</ol>
          <aside><span>{t.sections.outcomes.limitLabel}</span><p>{t.sections.outcomes.limit}</p></aside>
        </section>

        <section className="aep-section aep-closing aep-dark" aria-labelledby="closing-title">
          <p>{t.sections.closing.label}</p><h2 id="closing-title">{t.sections.closing.title}</h2><span>{t.sections.closing.body}</span>
          <div>
            <a href={questionnaireUrl} target="_blank" rel="noreferrer" aria-label={t.questionnaireLabel}>{t.sections.closing.questionnaire}<ExternalLink aria-hidden="true" /></a>
            <a href={repositoryUrl} target="_blank" rel="noreferrer" aria-label={t.repositoryLabel}>{t.sections.closing.repository}<ExternalLink aria-hidden="true" /></a>
            <a href={portfolioHref}>{t.sections.closing.projects}<ArrowLeft aria-hidden="true" /></a>
          </div>
        </section>
      </article>
    </main>
  );
}
