"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import HonoursExhibition from "./honours-exhibition";
import ResilientBackgroundVideo from "./components/resilient-background-video";

type Language = "en" | "zh";
type ViewportMode = "compact" | "medium" | "wide";
const appBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const mediaBasePath = `${appBasePath}/media`;

const COMPACT_VIEWPORT_QUERY = "(max-width: 768px)";
const MEDIUM_VIEWPORT_QUERY = "(max-width: 1100px)";

function readViewportMode(): ViewportMode {
  if (typeof window === "undefined") return "wide";
  if (window.matchMedia(COMPACT_VIEWPORT_QUERY).matches) return "compact";
  if (window.matchMedia(MEDIUM_VIEWPORT_QUERY).matches) return "medium";
  return "wide";
}

function subscribeViewportMode(onChange: () => void) {
  if (typeof window === "undefined") return () => undefined;

  const compactQuery = window.matchMedia(COMPACT_VIEWPORT_QUERY);
  const mediumQuery = window.matchMedia(MEDIUM_VIEWPORT_QUERY);
  const notify = () => onChange();

  compactQuery.addEventListener("change", notify);
  mediumQuery.addEventListener("change", notify);
  window.addEventListener("resize", notify, { passive: true });
  window.addEventListener("orientationchange", notify, { passive: true });
  window.visualViewport?.addEventListener("resize", notify, { passive: true });

  return () => {
    compactQuery.removeEventListener("change", notify);
    mediumQuery.removeEventListener("change", notify);
    window.removeEventListener("resize", notify);
    window.removeEventListener("orientationchange", notify);
    window.visualViewport?.removeEventListener("resize", notify);
  };
}

function useViewportMode() {
  return useSyncExternalStore(subscribeViewportMode, readViewportMode, () => "wide");
}

const copy = {
  en: {
    documentTitle: "Zishun Gao — Personal Portfolio",
    documentDescription: "Zishun Gao's personal portfolio across finance, economics, risk management, data analysis, applied research and responsible AI-assisted workflows.",
    language: "中文",
    languageLabel: "Switch to Chinese",
    primaryNavigation: "Primary navigation",
    brandHome: "Zishun Gao, home",
    brandDescriptor: "Personal portfolio",
    navigation: [
      ["education", "Education", "Study"],
      ["honours", "Honours", "Awards"],
      ["projects", "Projects", "Work"],
      ["ai-workflow", "AI workflow", "AI"],
      ["method", "Method", "Method"],
      ["experience", "Experience", "Roles"],
      ["contact", "Contact", "Contact"],
    ],
    hero: {
      eyebrow: "Finance · Economics · Risk management",
      greeting: "Hello, I'm",
      name: "Zishun Gao",
      bridge: "My work covers",
      statement: "finance risk data analysis and applied research",
      primaryCta: "View my work",
      secondaryCta: "Explore profile",
      cvCta: "Download English CV",
      intro: "MSc Management student at the University of Bristol,",
      introSecond: "with interests in finance, risk and data analysis.",
      explore: "Explore",
      exploreLabel: "Scroll to the Education section",
    },
    education: {
      label: "Academic foundation",
      title: "Education",
      italic: "academic record",
      summary: "A foundation in international economics, trade and financial risk management, now extended through digitalisation and big data.",
      undergraduate: "A · Undergraduate",
      programme: "Joint undergraduate programme",
      university: "Central University of Finance and Economics × Victoria University",
      discipline: "International Economics and Trade / Financial Risk Management",
      weightedAverage: "Weighted average / 100 · 143 credits",
      gradesLabel: "B · Selected grades",
      grades: [["99", "International Economic Analysis"], ["97", "International Trade"], ["96", "Macroeconomics"], ["94", "Econometrics"]],
      currentLabel: "C · Current study",
      currentSchool: "University of Bristol · 2025–2026",
      currentDegree: "MSc Management",
      currentTrack: "Digitalisation and Big Data · Current",
    },
    honours: {
      label: "Recognition",
      title: "Honours",
      italic: "achievements",
      summary: "Selected academic and competition recognition from my undergraduate studies.",
    },
    projects: {
      label: "Selected work",
      title: "Selected projects",
      italic: "methods and results",
      summary: "Each project describes the source material, method, output and current limits of the work.",
      workflowLabel: "Project workflow",
      openLabel: "View",
      items: [
        {
          index: "01",
          type: "Data engineering",
          tools: "SQL · Python · MySQL",
          title: "UK retail transaction analysis",
          description: "Around 1.6 million raw retail records were cleaned into 524,878 analysable transactions, supporting review of more than £10.6M in sales.",
          path: ["Raw records", "Cleaning rules", "Analysis tables", "Charts"],
          value: "The resulting table supports monthly revenue and product comparisons, with the cleaning rules recorded in SQL.",
          metric: "£10.6M+ sales analysed",
          slug: "uk-retail",
        },
        {
          index: "02",
          type: "Data quality",
          tools: "SQLite · pandas · seaborn",
          title: "Apple App Store data analysis",
          description: "A documented Python workflow, reproducible SQL and explicit quality flags were used to clean and analyse 1,229,886 app records.",
          path: ["Raw records", "Quality flags", "Analysis tables", "Charts"],
          value: "Quality flags allow different filters to be applied to category, price and update analysis.",
          metric: "1.23M analysable records",
          slug: "apple-app-store",
        },
        {
          index: "03",
          type: "Applied research",
          tools: "JavaScript · Supabase · RLS",
          title: "AEP early career wellbeing questionnaire",
          description: "A seven-stage University of Bristol questionnaire with server-side validation, protected storage and structured export for later analysis.",
          path: ["Questionnaire", "Validation", "Protected storage", "Export"],
          value: "The project documents the questionnaire structure, submission checks, protected storage and export process; it does not present participant findings.",
          metric: "Seven-stage online study",
          slug: "early-career-wellbeing",
        },
      ],
      fitness: {
        label: "Personal project",
        title: "Personal Training Website V2",
        heading: ["A personal training log", "with user defined exercises"],
        description: "A personal full-stack project for recording strength and cardio sessions. Users can define exercise and equipment names, add setup notes and keep records in private accounts. The public demo uses fictional data only.",
        flowLabel: "Personal training system data flow",
        flow: ["Custom exercises", "Server validation", "Supabase persistence", "RLS private history"],
        view: "View project",
      },
    },
    ai: {
      label: "AI-assisted job research",
      title: "A structured workflow for",
      italic: "job research and tracking",
      summary: "A documented process for finding, checking, comparing and tracking UK early-career opportunities. Applications and personal decisions remain manual.",
      stagesLabel: "AI-assisted opportunity workflow",
      stages: [
        ["01", "Discover", "Broaden the search across named sources and capture possible opportunities."],
        ["02", "Validate", "Check the original vacancy, employer and requirements before treating a result as usable."],
        ["03", "Compare", "Explain the evidence for fit, surface gaps and keep uncertain points visible."],
        ["04", "Track", "Maintain status, evidence dates and next actions in a structured workbook."],
      ],
      assurance: "Read-only discovery · Evidence-linked comparison · Manual applications",
      cta: "Explore the AI workflow",
      concept: "Workflow concept",
    },
    method: {
      label: "Working method",
      title: "How I organise",
      italic: "project work",
      summary: "A practical sequence for checking sources, preparing data, carrying out analysis and recording limitations.",
      flowLabel: "Evidence-to-decision framework",
      stages: [
        ["Scope and sources", "Define the question, identify the original sources, and record dates, definitions and provenance before analysis begins.", "Working output · A source register with assumptions kept separate from observed facts."],
        ["Data quality", "Profile missing values, duplicates, formats and invalid ranges. Document every cleaning rule and flag uncertain records instead of silently overwriting them.", "Working output · An analysis-ready dataset whose exclusions and quality limits can be reviewed."],
        ["Analysis", "Use reproducible SQL, Python or Excel steps to compare trends, segments and KPIs, then link each chart back to checked data.", "Working output · Findings that can be reproduced, explained and challenged."],
        ["Business context", "Relate findings to measures such as revenue, receivables, reconciliation, controls and risk, while stating who can act on the information.", "Working output · Practical implications for the relevant process or control."],
        ["Conclusion and limits", "State limitations, uncertainty and missing evidence, then record the supported conclusion and any reasonable next step.", "Working output · A conclusion that can be reviewed and revised when new evidence is available."],
      ],
    },
    experience: {
      label: "Practice",
      title: "Work experience in",
      italic: "data and finance",
      summary: "Two early roles involving reporting systems, data checks, receivables follow-up and financial records.",
      items: [
        {
          date: "Jan–Mar 2025",
          role: "Data Analysis Intern",
          organisation: "Licheng Holdings Group Co., Ltd.",
          focus: "Data systems · Governance · Reporting",
          summary: "Mapped how an internal data platform worked, then turned workflow observations into baselines, test evidence and clearer operating guidance.",
          metrics: [["6", "DMS workflows benchmarked"], ["8+", "Test cases & SOPs"], ["3", "Departments in rollout"]],
          details: [
            "Supported integration and rule tuning for a DeepSeek-enabled reporting module, contributing to a reported ~40% improvement in report-generation efficiency and field-matching accuracy.",
            "Documented data-governance and permissions workflows; the resulting test cases and SOPs helped reduce manual rework by about 20%.",
            "Worked with product, operations and sales teams to roll out updated reporting processes across three departments.",
          ],
        },
        {
          date: "Jul–Aug 2021",
          role: "Sales Intern",
          organisation: "Aisino (Shandong) Technology Co., Ltd.",
          focus: "Finance operations · Customer data · Excel",
          summary: "Used a structured customer ledger to support receivables follow-up, reconciliation and weekly financial reporting.",
          metrics: [["4,000+", "Customer records"], ["RMB 100K+", "Receivables recovered"], ["4–5 pp", "Call-to-payment lift"]],
          details: [
            "Built and maintained an Excel tracker covering more than 4,000 customer records, creating a clearer working view of follow-up status and payment response.",
            "Used response patterns to refine follow-up priorities, helping improve call-to-payment conversion by 4–5 percentage points and recover more than RMB 100,000 within one month.",
            "Prepared daily reconciliation records and weekly accounts-receivable summaries for the finance team.",
          ],
        },
      ],
    },
    contact: {
      top: "Back to top",
      eyebrow: "Get in touch",
      title: "Stay",
      italic: "in touch",
      intro: "I'm interested in graduate and early-career opportunities across finance, risk, business analysis and data-supported decision-making.",
      optionsLabel: "Contact options",
      email: "Email",
      instagram: "Instagram · soon",
      footer: "Finance · Economics · Risk management",
    },
  },
  zh: {
    documentTitle: "高子舜 — 个人作品集",
    documentDescription: "高子舜的个人作品集，聚焦金融、经济、风险管理、数据分析、应用研究与负责任的 AI 辅助工作流。",
    language: "EN",
    languageLabel: "切换至英文",
    primaryNavigation: "主导航",
    brandHome: "高子舜，返回主页",
    brandDescriptor: "个人作品集",
    navigation: [
      ["education", "教育"],
      ["honours", "荣誉"],
      ["projects", "项目"],
      ["ai-workflow", "AI 工作流"],
      ["method", "方法"],
      ["experience", "经历"],
      ["contact", "联系"],
    ],
    hero: {
      eyebrow: "金融 · 经济 · 风险管理",
      greeting: "你好，我是",
      name: "高子舜",
      bridge: "的项目主要涉及",
      statement: "金融 风险 数据分析与应用研究",
      primaryCta: "查看作品",
      secondaryCta: "了解我的背景",
      cvCta: "下载中文简历",
      intro: "英国布里斯托大学管理学硕士在读，",
      introSecond: "关注金融、风险与数据分析。",
      explore: "继续了解",
      exploreLabel: "前往教育经历部分",
    },
    education: {
      label: "学术基础",
      title: "教育与",
      italic: "学术经历",
      summary: "以国际经济、国际贸易和金融风险管理为基础，并在研究生阶段继续学习数字化与大数据。",
      undergraduate: "A · 本科",
      programme: "中外合作本科项目",
      university: "中央财经大学 × 澳大利亚维多利亚大学",
      discipline: "国际经济与贸易 / 金融风险管理",
      weightedAverage: "加权平均 / 100 · 143 学分",
      gradesLabel: "B · 精选课程成绩",
      grades: [["99", "国际经济分析"], ["97", "国际贸易"], ["96", "宏观经济学"], ["94", "计量经济学"]],
      currentLabel: "C · 当前学习",
      currentSchool: "英国布里斯托大学 · 2025–2026",
      currentDegree: "管理学硕士",
      currentTrack: "数字化与大数据 · 在读",
    },
    honours: {
      label: "荣誉认可",
      title: "荣誉与",
      italic: "成就",
      summary: "本科阶段获得的部分学术荣誉与竞赛奖项。",
    },
    projects: {
      label: "精选作品",
      title: "项目案例",
      italic: "方法与结果",
      summary: "每个项目分别说明资料来源、处理方法、主要输出与当前限制。",
      workflowLabel: "项目流程",
      openLabel: "查看",
      items: [
        {
          index: "01",
          type: "数据工程",
          tools: "SQL · Python · MySQL",
          title: "英国零售交易分析",
          description: "将约 160 万条原始零售记录清洗为 524,878 条可分析交易，用于复核超过 1,060 万英镑的销售数据。",
          path: ["原始记录", "清洗规则", "分析表", "图表"],
          value: "清洗后的数据表可用于比较月度营收与商品表现，相关处理规则记录在 SQL 中。",
          metric: "分析销售额超过 £10.6M",
          slug: "uk-retail",
        },
        {
          index: "02",
          type: "数据质量",
          tools: "SQLite · pandas · seaborn",
          title: "Apple App Store 数据分析",
          description: "通过有记录的 Python 流程、可复现 SQL 与明确的质量标记，清洗并分析 1,229,886 条应用记录。",
          path: ["原始记录", "质量标记", "分析表", "图表"],
          value: "质量标记可针对类别、价格和更新时间分析分别设置筛选条件。",
          metric: "123 万条可分析记录",
          slug: "apple-app-store",
        },
        {
          index: "03",
          type: "应用研究",
          tools: "JavaScript · Supabase · RLS",
          title: "AEP 职场新人福祉问卷",
          description: "一项分为七个阶段的布里斯托大学问卷，包含服务端验证、受保护存储与供后续分析使用的结构化导出。",
          path: ["问卷", "验证", "受保护存储", "导出"],
          value: "项目记录问卷结构、提交验证、受保护存储与导出流程；本页不展示参与者结论。",
          metric: "七阶段在线研究",
          slug: "early-career-wellbeing",
        },
      ],
      fitness: {
        label: "个人项目",
        title: "Personal Training Website V2",
        heading: ["支持自定义动作的", "个人训练记录"],
        description: "一个用于记录力量与有氧训练的个人全栈项目。用户可自定义动作和器械名称、添加设置备注，并将记录保存至私人账户。公开演示仅使用虚构数据。",
        flowLabel: "私人训练系统数据流程",
        flow: ["自定义动作", "服务端验证", "Supabase 持久化", "RLS 私人历史"],
        view: "查看项目",
      },
    },
    ai: {
      label: "AI 辅助求职信息整理",
      title: "求职信息的",
      italic: "整理与跟踪",
      summary: "一套用于发现、核验、比较和跟踪英国初级职业机会的记录流程；申请与个人决定仍由人工完成。",
      stagesLabel: "AI 辅助职业机会工作流",
      stages: [
        ["01", "发现", "扩大指定来源的搜索范围，并记录可能合适的职业机会。"],
        ["02", "核验", "回到原始职位页面，核对雇主、要求与时效，再决定信息能否使用。"],
        ["03", "比较", "说明匹配依据，主动显示能力差距，并保留不确定信息。"],
        ["04", "跟踪", "在结构化工作簿中维护状态、证据日期与下一步行动。"],
      ],
      assurance: "只读发现 · 基于证据的比较 · 人工完成申请",
      cta: "深入了解 AI 工作流",
      concept: "工作流概念",
    },
    method: {
      label: "工作方法",
      title: "项目工作中的",
      italic: "基本步骤",
      summary: "从核对来源、准备数据到完成分析和记录限制的一套实际工作步骤。",
      flowLabel: "从证据到决策的方法框架",
      stages: [
        ["范围与来源", "先明确问题，找到原始来源，并在分析开始前记录日期、定义与出处。", "工作产出 · 一份来源记录，将观察事实与假设清楚分开。"],
        ["数据质量", "检查缺失值、重复项、格式与无效范围；记录每条清洗规则，对不确定记录做标记而不是静默覆盖。", "工作产出 · 一份可供复核的数据集，清楚说明排除规则与质量限制。"],
        ["分析", "通过可复现的 SQL、Python 或 Excel 步骤比较趋势、分组与 KPI，并让每张图表都能回溯到核查后的数据。", "工作产出 · 能够被复现、解释与质疑的分析发现。"],
        ["业务背景", "将发现与收入、应收账款、对账、控制和风险等指标联系起来，并说明谁可以使用这些信息。", "工作产出 · 与相关流程或控制直接对应的实际含义。"],
        ["结论与限制", "说明限制、不确定性与缺失资料，再记录现有证据支持的结论和合理下一步。", "工作产出 · 一项可随新增资料复核和修正的结论。"],
      ],
    },
    experience: {
      label: "实践经历",
      title: "数据与财务",
      italic: "相关实践",
      summary: "两段涉及报表系统、数据核对、应收账款跟进与财务记录的早期实践经历。",
      items: [
        {
          date: "2025 年 1–3 月",
          role: "数据分析实习生",
          organisation: "力诚控股集团有限公司",
          focus: "数据系统 · 治理 · 报表",
          summary: "梳理内部数据平台的工作方式，并将流程观察转化为基线指标、测试证据与更清晰的操作指引。",
          metrics: [["6", "项 DMS 流程基准评估"], ["8+", "个测试用例与 SOP"], ["3", "个部门参与推广"]],
          details: [
            "支持 DeepSeek 赋能报表模块的集成与规则调优，助力报表生成效率与字段匹配准确率据报提升约 40%。",
            "记录数据治理与权限流程；相关测试用例和 SOP 帮助减少约 20% 的重复性人工返工。",
            "与产品、运营及销售团队协作，在三个部门推广更新后的报表流程。",
          ],
        },
        {
          date: "2021 年 7–8 月",
          role: "销售实习生",
          organisation: "航天信息（山东）科技有限公司",
          focus: "财务运营 · 客户数据 · Excel",
          summary: "通过结构化客户台账支持应收账款跟进、财务核对与周度汇总。",
          metrics: [["4,000+", "条客户记录"], ["¥100K+", "一个月内回收应收款"], ["4–5 pp", "通话到付款转化提升"]],
          details: [
            "搭建并维护覆盖 4,000 余条客户记录的 Excel 跟踪表，让跟进状态与付款反馈更清晰可查。",
            "根据客户响应数据调整跟进优先级，帮助将通话到付款转化率提升 4–5 个百分点，并在一个月内回收超过人民币 10 万元应收款。",
            "为财务团队编制每日对账记录与每周应收账款汇总。",
          ],
        },
      ],
    },
    contact: {
      top: "返回顶部",
      eyebrow: "保持联系",
      title: "期待与你",
      italic: "保持联系",
      intro: "我关注金融、风险、商业分析及数据支持决策方向的毕业生与初级职业机会。",
      optionsLabel: "联系方式",
      email: "邮箱",
      instagram: "Instagram · 敬请期待",
      footer: "金融 · 经济 · 风险管理",
    },
  },
} as const;

function Navigation({ language, toggleLanguage }: { language: Language; toggleLanguage: () => void }) {
  const t = copy[language];
  return (
    <nav className="personal-navbar" aria-label={t.primaryNavigation}>
      <a href="#home" className="personal-brand glass-panel" aria-label={t.brandHome}>
        <span className="personal-brand-mark">ZG</span>
        <span className="personal-brand-copy"><strong>{language === "en" ? "Zishun Gao" : "高子舜"}</strong><small>{t.brandDescriptor}</small></span>
      </a>
      <div className="personal-nav-main glass-panel">
        {t.navigation.map(([id, title, compactTitle]) => (
          <a key={id} href={`#${id}`} className="personal-nav-link" aria-label={title}>
            <span className="personal-nav-label-full">{title}</span>
            <span className="personal-nav-label-compact" aria-hidden="true">{compactTitle ?? title}</span>
          </a>
        ))}
        <button className="personal-language-toggle" type="button" onClick={toggleLanguage} aria-label={t.languageLabel}>{t.language}</button>
      </div>
    </nav>
  );
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Hero({ language }: { language: Language }) {
  const t = copy[language].hero;
  const cvFilename = language === "zh" ? "Zishun_Gao_CV_CN_2026.pdf" : "Zishun_Gao_CV_UK_2026.pdf";
  return (
    <section id="home" className="personal-hero">
      <ResilientBackgroundVideo
        className="personal-hero-media"
        videoClassName="personal-hero-video"
        src={`${mediaBasePath}/video/homepage-hero.mp4`}
        poster={`${mediaBasePath}/posters/homepage-hero.jpg`}
        playLabel={language === "zh" ? "播放背景动画" : "Play background animation"}
        priority
      />
      <div className="hero-nav-spacer" aria-hidden="true" />
      <div className="personal-hero-content">
        <p className="personal-eyebrow">{t.eyebrow}</p>
        <h1 className="personal-hero-title">
          <span>{t.greeting}</span><br />
          <span className="personal-serif">{t.name}</span><span>{language === "zh" ? t.bridge : ` ${t.bridge}`}</span><br />
          <span>{t.statement}</span>
        </h1>
        <div className="personal-hero-actions">
          <a href="#projects" className="primary-button">{t.primaryCta}</a>
          <a href="#education" className="outline-button glass-panel">{t.secondaryCta}</a>
          <a href={`${appBasePath}/cv/${cvFilename}`} className="outline-button glass-panel" download={cvFilename}>{t.cvCta}</a>
        </div>
      </div>
      <div className="personal-hero-footer">
        <p className="personal-intro">{t.intro}<br />{t.introSecond}</p>
        <a href="#education" className="scroll-button glass-panel" aria-label={t.exploreLabel}><span>{t.explore}</span><ArrowIcon /></a>
      </div>
    </section>
  );
}

function SectionHeading({ number, label, title, italic, summary, keepItalicTogether = false }: { number: string; label: string; title: string; italic?: string; summary: string; keepItalicTogether?: boolean }) {
  const isWide = `${title} ${italic ?? ""}`.length > 30;
  return (
    <div className={`framework-heading${isWide ? " framework-heading-wide" : ""}`}>
      <div className="framework-kicker"><span>{number}</span><span>{label}</span></div>
      <h2><span>{title}</span>{italic ? <em className={keepItalicTogether ? "keep-together" : undefined}>{italic}</em> : null}</h2>
      <p>{summary}</p>
    </div>
  );
}

function SectionBlend() {
  return <span className="section-blend" aria-hidden="true" />;
}

function EducationSection({ language }: { language: Language }) {
  const t = copy[language].education;
  return (
    <section id="education" className="framework-section framework-paper image-backed-section education-photo">
      <SectionBlend />
      <SectionHeading number="01" label={t.label} title={t.title} italic={t.italic} summary={t.summary} />
      <div className="education-layout">
        <article className="framework-card education-primary">
          <span className="card-index">{t.undergraduate}</span>
          <div>
            <p className="slot-label">{t.programme}</p>
            <h3>{t.university}</h3>
            <p className="education-discipline">{t.discipline}</p>
          </div>
          <div className="education-stat"><strong>87.36</strong><span>{t.weightedAverage}</span></div>
        </article>
        <div className="education-stack">
          <article className="framework-card metric-slot">
            <span className="card-index">{t.gradesLabel}</span>
            <div className="grade-list">{t.grades.map(([score, course]) => <div className="grade-row" key={course}><strong>{score}</strong><span>{course}</span></div>)}</div>
          </article>
          <article className="framework-card metric-slot">
            <span className="card-index">{t.currentLabel}</span>
            <div><p className="slot-label">{t.currentSchool}</p><h3>{t.currentDegree}</h3><p className="education-discipline">{t.currentTrack}</p></div>
          </article>
        </div>
      </div>
    </section>
  );
}

function HonoursSection({ language }: { language: Language }) {
  const t = copy[language].honours;
  return (
    <section id="honours" className="framework-section framework-ink image-backed-section honours-photo">
      <SectionBlend />
      <SectionHeading number="02" label={t.label} title={t.title} italic={t.italic} summary={t.summary} />
      <HonoursExhibition language={language} />
    </section>
  );
}

function ProjectsSection({ language }: { language: Language }) {
  const t = copy[language].projects;
  return (
    <section id="projects" className="framework-section framework-paper projects-section">
      <SectionBlend />
      <SectionHeading number="03" label={t.label} title={t.title} italic={t.italic} summary={t.summary} />
      <div className="projects-content">
        <div className="project-list">
          {t.items.map((project, index) => (
            <article id={`project-${project.slug}`} tabIndex={-1} className={`project-framework project-photo project-photo-${index + 1}`} key={project.index}>
              <div className="project-number">{project.index}<span>{project.tools}</span></div>
              <div className="project-copy"><p>{project.type}</p><h3>{project.title}</h3><p className="project-description">{project.description}</p></div>
              <div className="project-details">
                <div className="project-path" aria-label={t.workflowLabel}>{project.path.map((step, stepIndex) => <span key={step}>{step}{stepIndex < project.path.length - 1 ? <i>→</i> : null}</span>)}</div>
                <p>{project.value}</p><strong>{project.metric}</strong>
              </div>
              <a
                className="project-open"
                href={`${appBasePath}/case-studies/${project.slug}/?lang=${language}`}
                aria-label={`${t.openLabel} ${project.title}`}
              ><ArrowIcon /></a>
            </article>
          ))}
        </div>
        <article id="personal-training-project" tabIndex={-1} className="fitness-project">
          <div className="fitness-kicker"><span>{t.fitness.label}</span><span>React · Supabase · RLS</span></div>
          <div className="fitness-copy"><p>{t.fitness.title}</p><h3>{t.fitness.heading.map((line) => <span key={line}>{line}</span>)}</h3></div>
          <p className="fitness-description">{t.fitness.description}</p>
          <div className="fitness-flow" aria-label={t.fitness.flowLabel}>{t.fitness.flow.map((step, index) => <span key={step}>{step}{index < t.fitness.flow.length - 1 ? <i>→</i> : null}</span>)}</div>
          <div className="fitness-links">
            <a href={`${appBasePath}/personal-projects/personal-training/?lang=en`}>{t.fitness.view} <ArrowIcon /></a>
            <a href="https://github.com/stevenjobs530-afk/personal-training-website-v2" target="_blank" rel="noreferrer">GitHub <ArrowIcon /></a>
          </div>
        </article>
      </div>
    </section>
  );
}

function AiWorkflowSection({ language }: { language: Language }) {
  const t = copy[language].ai;

  return (
    <section id="ai-workflow" tabIndex={-1} className="ai-workflow-feature">
      <SectionBlend />
      <div className="ai-feature-topline">
        <span>04</span>
        <span>{t.concept}</span>
      </div>
      <div className="ai-feature-copy">
        <p className="ai-feature-label">{t.label}</p>
        <h2>{t.title}<br /><em>{t.italic}</em></h2>
        <p className="ai-feature-summary">{t.summary}</p>
        <a className="ai-feature-cta" href={`${appBasePath}/case-studies/ai-assisted-job-workflow/?lang=${language}`}>
          <span>{t.cta}</span><ArrowIcon />
        </a>
      </div>
      <ol className="ai-feature-stages" aria-label={t.stagesLabel}>
        {t.stages.map(([number, title, detail]) => (
          <li key={number}>
            <span>{number}</span>
            <h3>{title}</h3>
            <p>{detail}</p>
          </li>
        ))}
      </ol>
      <p className="ai-feature-assurance">{t.assurance}</p>
    </section>
  );
}

function MethodSection({ language }: { language: Language }) {
  const t = copy[language].method;
  return (
    <section id="method" className="framework-section framework-method image-backed-section method-photo">
      <SectionBlend />
      <SectionHeading number="05" label={t.label} title={t.title} italic={t.italic} summary={t.summary} keepItalicTogether={language === "zh"} />
      <div className="method-flow" aria-label={t.flowLabel}>
        {t.stages.map(([stage, detail, output], index) => (
          <div className="method-stage-wrap" key={stage}>
            <article className="method-stage">
              <span className="method-stage-number">{String(index + 1).padStart(2, "0")}</span>
              <div className="method-stage-copy"><h3>{stage}</h3><p>{detail}</p></div>
              <p className="method-stage-output">{output}</p>
            </article>
          </div>
        ))}
      </div>
    </section>
  );
}

function ExperienceSection({ language }: { language: Language }) {
  const t = copy[language].experience;
  return (
    <section id="experience" className="framework-section framework-paper experience-section">
      <SectionBlend />
      <SectionHeading number="06" label={t.label} title={t.title} italic={t.italic} summary={t.summary} />
      <div className="experience-list">
        {t.items.map((item, index) => (
          <article className={`experience-row experience-photo experience-photo-${index + 1}`} key={item.role}>
            <div className="experience-card-top">
              <span className="experience-date">{item.date}</span>
              <span className="experience-focus">{item.focus}</span>
            </div>
            <div className="experience-card-main">
              <p className="experience-organisation">{item.organisation}</p>
              <h3>{item.role}</h3>
              <p className="experience-summary">{item.summary}</p>
            </div>
            <dl className="experience-metrics">
              {item.metrics.map(([value, label]) => (
                <div key={label}><dt>{value}</dt><dd>{label}</dd></div>
              ))}
            </dl>
            <ul className="experience-details">
              {item.details.map((detail) => <li key={detail}>{detail}</li>)}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

function ContactSection({ language }: { language: Language }) {
  const t = copy[language].contact;
  const contacts = [
    [t.email, "mailto:gzs20030423@gmail.com"],
    ["LinkedIn", "https://www.linkedin.com/in/zishungao24279b/"],
    ["GitHub", "https://github.com/stevenjobs530-afk"],
  ];
  return (
    <section id="contact" className="contact-section">
      <SectionBlend />
      <ResilientBackgroundVideo
        className="contact-flower-media"
        videoClassName="contact-flower-video"
        src={`${mediaBasePath}/video/homepage-contact.mp4`}
        poster={`${mediaBasePath}/posters/homepage-contact.jpg`}
        playLabel={language === "zh" ? "播放背景动画" : "Play background animation"}
      />
      <div className="contact-topline"><span>07</span><a href="#home">{t.top}</a></div>
      <div className="contact-content">
        <p className="contact-eyebrow">{t.eyebrow}</p>
        <h2>{t.title}<br /><em>{t.italic}</em></h2>
        <p className="contact-intro">{t.intro}</p>
        <div className="contact-buttons" aria-label={t.optionsLabel}>
          {contacts.map(([label, href], index) => <a key={label} href={href} className={index === 0 ? "contact-button contact-button-primary" : "contact-button"} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined}><span>{label}</span><ArrowIcon /></a>)}
          <button type="button" className="contact-button contact-button-disabled" disabled><span>{t.instagram}</span></button>
        </div>
      </div>
      <div className="contact-footer"><span>© 2026 {language === "en" ? "Zishun Gao" : "高子舜"}</span><span>{t.footer}</span></div>
    </section>
  );
}

export default function PortfolioHome({ initialLanguage }: { initialLanguage: Language }) {
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const resolvedUrlLanguage = useRef(false);
  const viewportMode = useViewportMode();

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
    document.title = copy[language].documentTitle;
    document.querySelector('meta[name="description"]')?.setAttribute("content", copy[language].documentDescription);
    url.searchParams.set("lang", language);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, [language]);

  useEffect(() => {
    const focusReturnedProject = () => {
      const targetId = decodeURIComponent(window.location.hash.slice(1));
      if (!targetId.startsWith("project-") && targetId !== "personal-training-project" && targetId !== "ai-workflow") return;
      window.requestAnimationFrame(() => {
        document.getElementById(targetId)?.focus({ preventScroll: true });
      });
    };

    focusReturnedProject();
    window.addEventListener("hashchange", focusReturnedProject);
    return () => window.removeEventListener("hashchange", focusReturnedProject);
  }, []);

  function toggleLanguage() {
    setLanguage((current) => current === "en" ? "zh" : "en");
  }

  return (
    <main lang={language === "zh" ? "zh-CN" : "en"} data-viewport={viewportMode}>
      <Navigation language={language} toggleLanguage={toggleLanguage} />
      <Hero language={language} />
      <EducationSection language={language} />
      <HonoursSection language={language} />
      <ProjectsSection language={language} />
      <AiWorkflowSection language={language} />
      <MethodSection language={language} />
      <ExperienceSection language={language} />
      <ContactSection language={language} />
    </main>
  );
}
