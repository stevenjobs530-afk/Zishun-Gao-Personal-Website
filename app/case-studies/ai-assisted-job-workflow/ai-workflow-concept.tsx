"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  FileSearch,
  Scale,
  Search,
  ShieldCheck,
  Table2,
  UserCheck,
} from "lucide-react";
import PortfolioBackLink from "../../components/portfolio-back-link";
import ResilientBackgroundVideo from "../../components/resilient-background-video";
import "./ai-workflow-concept.scss";

type Language = "en" | "zh";
const appBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const stageIcons = [Search, FileSearch, Scale, Table2];
const heroVideo = `${appBasePath}/media/video/ai-workflow-hero.mp4`;
const heroPoster = `${appBasePath}/media/posters/ai-workflow-hero.jpg`;

const copy = {
  en: {
    documentTitle: "AI-Assisted Job Workflow Concept — Zishun Gao",
    system: "System",
    responsibilities: "Responsibilities",
    safeguardsNav: "Safeguards",
    measurement: "Measurement",
    language: "中文",
    languageLabel: "Switch to Chinese",
    navLabel: "AI workflow concept navigation",
    backLabel: "Back to Portfolio — return to the AI workflow feature",
    hero: {
      eyebrow: "Workflow concept · AI-assisted job research",
      title: "A structured process for UK job research",
      summary: "The workflow uses AI to help discover, check, compare and track early-career opportunities. Personal decisions, account changes and applications remain manual.",
      cta: "Explore the workflow",
      return: "Back to portfolio",
      note: "Read-only discovery · Manual applications",
      stagesLabel: "Four-stage AI-assisted workflow",
      stages: [
        ["01", "Discover", "Find possible roles across named, relevant sources."],
        ["02", "Validate", "Return to the original vacancy and check the evidence."],
        ["03", "Compare", "Explain fit, gaps, requirements and uncertainty."],
        ["04", "Track", "Record status, evidence dates and the next action."],
      ],
    },
    framing: {
      label: "01 / Why this workflow exists",
      title: "Why a structured search and review process is useful",
      body: "Early-career vacancies are distributed across company sites, job boards and professional networks. Titles vary, requirements are easy to miss and the same role can appear more than once. The workflow organises that search into a consistent review process while leaving career decisions to the user.",
      principleLabel: "Working principle",
      principle: "Use AI for breadth, structure and first-pass comparison. Use primary evidence, testing and human judgment for accuracy and action.",
      statusLabel: "Current status",
      status: "This page documents a workflow concept. It does not claim measured outcomes, automated applications or employer decisions.",
    },
    loop: {
      label: "02 / The operating loop",
      title: "Four stages with a defined output",
      stages: [
        ["Discover", "AI support", "Search within an agreed target set; capture the role, employer, location, source and closing date.", "Output: candidate vacancy list"],
        ["Validate", "Evidence check", "Open the original listing; confirm that it is active and check mandatory requirements, location, work-right wording and source date.", "Output: verified source record"],
        ["Compare", "Transparent reasoning", "Compare the vacancy with supported experience. Separate direct evidence, transferable evidence, gaps and unresolved questions.", "Output: fit note with caveats"],
        ["Track", "Structured follow-up", "Write the confirmed record to a workbook without overwriting its history. Keep status changes tied to dated evidence.", "Output: current next action"],
      ],
    },
    roles: {
      label: "03 / AI versus human responsibility",
      title: "What AI supports and what remains manual",
      aiTitle: "AI may support",
      humanTitle: "I retain control",
      ai: [
        "Search within sources and criteria I define",
        "Extract comparable vacancy fields",
        "Draft evidence-linked fit and gap notes",
        "Flag duplicates, missing fields and stale dates",
        "Prepare a reviewable tracker update",
      ],
      human: [
        "Decide which roles are genuinely relevant",
        "Verify sensitive or ambiguous requirements",
        "Choose the truthful wording used in an application",
        "Approve any workbook or status change",
        "Complete and submit every application manually",
      ],
      boundary: "Passwords, identity documents, private account access, final answers and submission authority remain outside the AI workflow.",
    },
    evidence: {
      label: "04 / Transparent comparison",
      title: "How role fit is compared with available evidence",
      intro: "The comparison keeps four evidence layers distinct so a confident tone cannot hide a weak basis.",
      layers: [
        ["Direct evidence", "The vacancy asks for something already demonstrated by a project, course or verified experience."],
        ["Transferable evidence", "A related capability can reasonably transfer, but the connection must be stated rather than assumed."],
        ["Gap", "A required or preferred capability is not supported by current evidence."],
        ["Unresolved", "The source is ambiguous, unavailable or needs a human decision before the role can progress."],
      ],
      callout: "A recommendation is never stronger than the source evidence behind it.",
    },
    tracker: {
      label: "05 / The tracker",
      title: "Sources status and next actions in the workbook",
      intro: "Each row is a compact decision record. The structure below is illustrative and anonymised; it does not expose private application data.",
      columns: ["Company", "Role", "Source", "Fit rationale", "Status", "Next action", "Evidence date"],
      rows: [
        ["Company A", "Risk graduate", "Verified", "Direct + transferable", "Review", "Check work-right wording", "12 Aug"],
        ["Company B", "Finance analyst", "Verified", "Direct evidence", "Shortlist", "Prepare tailored examples", "13 Aug"],
        ["Company C", "Data graduate", "Needs check", "Gap recorded", "Hold", "Confirm mandatory tool", "13 Aug"],
      ],
      rules: [
        "Preserve the original workbook and create a dated copy before edits.",
        "Keep the source date separate from today and retain the direct vacancy link.",
        "Treat emails or status changes as evidence only after the exact record is checked.",
        "Do not convert a missing answer into a confident assumption.",
      ],
    },
    safeguards: {
      label: "06 / Safeguards",
      title: "Limits applied throughout the workflow",
      items: [
        ["Read-only discovery", "Search and review do not authorise account changes, messages, submissions or external actions."],
        ["Primary-source validation", "A vacancy is not treated as current until the original listing and key requirements have been checked."],
        ["Privacy boundary", "Private credentials, identity documents and sensitive application data are not placed into a public case study."],
        ["Honest positioning", "Fit notes distinguish demonstrated capability from foundational knowledge, learning goals and unsupported claims."],
        ["Ambiguity pause", "Forced or unclear work-right, sponsorship or personal questions stop for human review."],
        ["Manual submission", "The user remains responsible for final wording, declarations, attachments and the submit action."],
      ],
    },
    results: {
      label: "07 / Measurement and limits",
      title: "Metrics to collect before evaluating the workflow",
      intro: "The concept becomes credible through dated evidence, not through impressive-sounding automation claims.",
      measures: [
        ["Source coverage", "How many target sources were checked and how recently."],
        ["Validation rate", "How many discovered roles remained active and usable after source review."],
        ["Duplicate rate", "How often the same role was found through multiple routes."],
        ["Follow-up completeness", "How many active records have a clear owner, evidence date and next action."],
        ["Outcome progression", "How verified applications progress over time, without treating generic receipts as success."],
      ],
      limitLabel: "What this page does not claim",
      limit: "No measured time saving, application success rate, recruiter response rate or hiring outcome is presented yet. Until those figures are collected and verified, this remains an AI Workflow Concept.",
    },
    closing: {
      label: "Summary",
      title: "The documented process responsibilities and current limits",
      body: "It records how sources are checked, how roles are compared, what is tracked and which actions remain outside the AI-assisted process.",
      back: "Back to the portfolio",
    },
  },
  zh: {
    documentTitle: "AI 辅助求职工作流概念 — 高子舜",
    system: "系统",
    responsibilities: "职责边界",
    safeguardsNav: "保护措施",
    measurement: "衡量方法",
    language: "EN",
    languageLabel: "切换至英文",
    navLabel: "AI 工作流概念导航",
    backLabel: "返回作品集中的 AI 工作流部分",
    hero: {
      eyebrow: "工作流概念 · AI 辅助求职信息整理",
      title: "英国求职信息的结构化整理流程",
      summary: "这套流程使用 AI 辅助发现、核验、比较和跟踪初级职业机会；个人决定、账户变更与申请仍由人工完成。",
      cta: "了解工作流",
      return: "返回作品集",
      note: "只读发现 · 人工完成申请",
      stagesLabel: "四阶段 AI 辅助工作流",
      stages: [
        ["01", "发现", "从指定且相关的来源中寻找可能合适的岗位。"],
        ["02", "核验", "回到原始职位页面，检查信息与要求。"],
        ["03", "比较", "说明匹配、差距、要求与不确定性。"],
        ["04", "跟踪", "记录状态、证据日期与下一步行动。"],
      ],
    },
    framing: {
      label: "01 / 为什么需要这套工作流",
      title: "为什么需要结构化的搜索与核验流程",
      body: "初级职业机会分散在公司网站、招聘平台和职业网络中。职位名称并不统一，关键要求容易遗漏，同一岗位也可能重复出现。这套工作流将分散搜索整理为一致的复核过程，职业决定仍由用户完成。",
      principleLabel: "工作原则",
      principle: "让 AI 扩大范围、整理结构并完成初步比较；让原始证据、测试与人工判断保证准确性和行动质量。",
      statusLabel: "当前状态",
      status: "本页面记录的是工作流概念，不声称已经取得量化结果，也不声称可以自动申请或代表雇主决定。",
    },
    loop: {
      label: "02 / 运行循环",
      title: "四个阶段与对应输出",
      stages: [
        ["发现", "AI 辅助", "在商定的目标集合中搜索，记录职位、雇主、地点、来源与截止日期。", "输出：候选职位清单"],
        ["核验", "证据检查", "打开原始职位，确认仍然有效，并检查硬性要求、地点、工作权利表述与来源日期。", "输出：已核验来源记录"],
        ["比较", "透明推理", "把职位要求与已有经历比较，分开记录直接证据、可迁移证据、差距与未解决问题。", "输出：含限制的匹配说明"],
        ["跟踪", "结构化跟进", "在不覆盖历史的前提下，将确认后的记录写入工作簿，并让状态变化对应日期证据。", "输出：当前下一步行动"],
      ],
    },
    roles: {
      label: "03 / AI 与人的职责边界",
      title: "AI 辅助范围与人工操作范围",
      aiTitle: "AI 可以辅助",
      humanTitle: "我保留控制权",
      ai: ["在我设定的来源和条件中搜索", "提取可比较的职位字段", "起草基于证据的匹配与差距说明", "标记重复、缺失字段与过期日期", "准备可复核的跟踪表更新"],
      human: ["决定哪些职位真正相关", "核验敏感或模糊的要求", "选择申请中真实且准确的表述", "批准任何工作簿或状态变更", "亲自完成并提交每一份申请"],
      boundary: "密码、身份证明、私人账户访问、最终答案与提交权限均不属于 AI 工作流。",
    },
    evidence: {
      label: "04 / 透明比较",
      title: "如何根据现有资料比较岗位匹配情况",
      intro: "比较过程明确区分四层证据，避免自信的语气掩盖薄弱的依据。",
      layers: [
        ["直接证据", "职位要求对应已由项目、课程或可核验经历展示的能力。"],
        ["可迁移证据", "相关能力可能合理迁移，但必须清楚说明连接逻辑，而不能默认成立。"],
        ["差距", "硬性或优先要求目前没有得到证据支持。"],
        ["未解决", "来源含糊、无法访问，或需要人工决定后才能继续。"],
      ],
      callout: "建议的可信度，永远不能超过其背后的来源证据。",
    },
    tracker: {
      label: "05 / 跟踪表",
      title: "工作簿中的来源 状态与下一步",
      intro: "每一行都是精简的决策记录。以下结构仅作示意且已经匿名化，不展示私人申请信息。",
      columns: ["公司", "职位", "来源", "匹配依据", "状态", "下一步", "证据日期"],
      rows: [
        ["公司 A", "风险管培生", "已核验", "直接 + 可迁移", "复核", "检查工作权利表述", "8 月 12 日"],
        ["公司 B", "财务分析师", "已核验", "直接证据", "短名单", "准备针对性案例", "8 月 13 日"],
        ["公司 C", "数据管培生", "待检查", "已记录差距", "暂缓", "确认硬性工具要求", "8 月 13 日"],
      ],
      rules: ["保留原始工作簿，修改前先创建带日期的副本。", "将来源日期与今天分开记录，并保留职位原始链接。", "只有核对准确记录后，邮件或状态变化才能作为证据。", "不能把缺失答案转化为自信假设。"],
    },
    safeguards: {
      label: "06 / 保护措施",
      title: "工作流各阶段使用的限制条件",
      items: [
        ["只读发现", "搜索与复核不代表可以更改账户、发送消息、提交申请或执行外部操作。"],
        ["原始来源核验", "只有核对原始职位与关键要求后，才把机会视为当前有效。"],
        ["隐私边界", "私人凭证、身份证明与敏感申请数据不会出现在公开案例中。"],
        ["诚实定位", "匹配说明会区分已展示能力、基础知识、学习目标与缺乏支持的说法。"],
        ["遇到歧义暂停", "工作权利、担保或个人问题如果被强制回答或含义不清，会暂停并交由人工复核。"],
        ["人工提交", "最终措辞、声明、附件与提交动作始终由用户负责。"],
      ],
    },
    results: {
      label: "07 / 衡量与限制",
      title: "评估工作流前需要收集的指标",
      intro: "这个概念需要通过带日期的证据建立可信度，而不是依靠听起来很强的自动化说法。",
      measures: [
        ["来源覆盖", "检查了多少目标来源，以及检查时间有多近。"],
        ["核验比例", "发现的职位中，有多少在来源复核后仍然有效且可使用。"],
        ["重复比例", "同一职位通过多个渠道被发现的频率。"],
        ["跟进完整度", "有多少有效记录具备明确责任人、证据日期与下一步。"],
        ["结果进展", "已核验申请如何随时间推进，同时不把普通回执当作成功。"],
      ],
      limitLabel: "本页面不声称什么",
      limit: "目前不展示节省时间、申请成功率、招聘方回复率或录用结果。只有在相关数据被收集并核验后，本页面才会从“AI 工作流概念”升级为案例研究。",
    },
    closing: {
      label: "项目总结",
      title: "本页记录的流程 职责分工与当前限制",
      body: "内容包括来源核验、岗位比较、跟踪字段，以及不属于 AI 辅助流程的操作。",
      back: "返回作品集",
    },
  },
} as const;

function ArrowAction() {
  return <ArrowRight aria-hidden="true" />;
}

export default function AiWorkflowConcept({ initialLanguage }: { initialLanguage: Language }) {
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const resolvedUrlLanguage = useRef(false);
  const t = copy[language];
  const portfolioHref = `${appBasePath}/?lang=${language}#ai-workflow`;

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

    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
    document.title = t.documentTitle;
    url.searchParams.set("lang", language);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, [language, t.documentTitle]);

  function toggleLanguage() {
    setLanguage((current) => current === "en" ? "zh" : "en");
  }

  return (
    <main className="ai-concept-page" lang={language === "zh" ? "zh-CN" : "en"}>
      <PortfolioBackLink href={portfolioHref} language={language} ariaLabel={t.backLabel} />
      <section className="ai-concept-hero">
        <ResilientBackgroundVideo
          className="ai-concept-hero-media"
          videoClassName="ai-concept-hero-video"
          src={heroVideo}
          poster={heroPoster}
          playLabel={language === "zh" ? "播放背景动画" : "Play background animation"}
          priority
        />
        <div className="ai-concept-frame">
          <nav className="ai-concept-nav" aria-label={t.navLabel}>
            <div className="ai-concept-nav-links">
              <a href="#system">{t.system}</a>
              <a href="#responsibilities">{t.responsibilities}</a>
              <a href="#safeguards">{t.safeguardsNav}</a>
              <button type="button" onClick={toggleLanguage} aria-label={t.languageLabel}>{t.language}</button>
            </div>
            <a className="ai-concept-nav-cta" href="#system">{t.hero.cta}</a>
          </nav>

          <div className="ai-concept-hero-copy">
            <h1>{t.hero.title}</h1>
            <span>{t.hero.summary}</span>
            <a className="ai-concept-primary" href="#system">{t.hero.cta}</a>
            <p>{t.hero.note}</p>
          </div>
        </div>
      </section>

      <article className="ai-concept-article">
        <section className="ai-concept-section ai-concept-framing">
          <header><p>{t.framing.label}</p><h2>{t.framing.title}</h2></header>
          <div className="ai-concept-framing-grid">
            <p>{t.framing.body}</p>
            <aside><span>{t.framing.principleLabel}</span><strong>{t.framing.principle}</strong></aside>
            <aside><span>{t.framing.statusLabel}</span><strong>{t.framing.status}</strong></aside>
          </div>
        </section>

        <section id="system" className="ai-concept-section ai-concept-loop">
          <header><p>{t.loop.label}</p><h2>{t.loop.title}</h2></header>
          <div className="ai-concept-loop-grid">
            {t.loop.stages.map(([title, mode, detail, output], index) => {
              const Icon = stageIcons[index];
              return <article key={title}><div><span>{String(index + 1).padStart(2, "0")}</span><Icon aria-hidden="true" /></div><p>{mode}</p><h3>{title}</h3><span>{detail}</span><strong>{output}</strong></article>;
            })}
          </div>
        </section>

        <section id="responsibilities" className="ai-concept-section ai-concept-roles">
          <header><p>{t.roles.label}</p><h2>{t.roles.title}</h2></header>
          <div className="ai-concept-role-grid">
            <article><FileSearch aria-hidden="true" /><h3>{t.roles.aiTitle}</h3><ul>{t.roles.ai.map((item) => <li key={item}><CheckCircle2 aria-hidden="true" />{item}</li>)}</ul></article>
            <article><UserCheck aria-hidden="true" /><h3>{t.roles.humanTitle}</h3><ul>{t.roles.human.map((item) => <li key={item}><CheckCircle2 aria-hidden="true" />{item}</li>)}</ul></article>
          </div>
          <p className="ai-concept-boundary"><ShieldCheck aria-hidden="true" />{t.roles.boundary}</p>
        </section>

        <section className="ai-concept-section ai-concept-evidence">
          <header><p>{t.evidence.label}</p><h2>{t.evidence.title}</h2><span>{t.evidence.intro}</span></header>
          <div className="ai-concept-evidence-grid">
            {t.evidence.layers.map(([title, detail], index) => <article key={title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{detail}</p></article>)}
          </div>
          <blockquote><Scale aria-hidden="true" />{t.evidence.callout}</blockquote>
        </section>

        <section className="ai-concept-section ai-concept-tracker">
          <header><p>{t.tracker.label}</p><h2>{t.tracker.title}</h2><span>{t.tracker.intro}</span></header>
          <div className="ai-concept-table-wrap" tabIndex={0} role="region" aria-label={t.tracker.title}>
            <table>
              <thead><tr>{t.tracker.columns.map((column) => <th key={column} scope="col">{column}</th>)}</tr></thead>
              <tbody>{t.tracker.rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={`${rowIndex}-${cellIndex}`}>{cell}</td>)}</tr>)}</tbody>
            </table>
          </div>
          <ul className="ai-concept-tracker-rules">{t.tracker.rules.map((rule) => <li key={rule}><CheckCircle2 aria-hidden="true" />{rule}</li>)}</ul>
        </section>

        <section id="safeguards" className="ai-concept-section ai-concept-safeguards">
          <header><p>{t.safeguards.label}</p><h2>{t.safeguards.title}</h2></header>
          <div className="ai-concept-safeguard-grid">
            {t.safeguards.items.map(([title, detail], index) => <article key={title}><span>{String(index + 1).padStart(2, "0")}</span><ShieldCheck aria-hidden="true" /><h3>{title}</h3><p>{detail}</p></article>)}
          </div>
        </section>

        <section id="measurement" className="ai-concept-section ai-concept-results">
          <header><p>{t.results.label}</p><h2>{t.results.title}</h2><span>{t.results.intro}</span></header>
          <dl>{t.results.measures.map(([term, detail]) => <div key={term}><dt>{term}</dt><dd>{detail}</dd></div>)}</dl>
          <aside><span>{t.results.limitLabel}</span><p>{t.results.limit}</p></aside>
        </section>

        <section className="ai-concept-closing">
          <p>{t.closing.label}</p>
          <h2>{t.closing.title}</h2>
          <span>{t.closing.body}</span>
          <a href={portfolioHref}>{t.closing.back}<ArrowAction /></a>
        </section>
      </article>
    </main>
  );
}
