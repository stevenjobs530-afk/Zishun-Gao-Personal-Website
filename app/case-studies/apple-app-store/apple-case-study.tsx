"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BarChart3, Database, ExternalLink, FileText, Search, ShieldCheck } from "lucide-react";
import Image from "next/image";
import PortfolioBackLink from "../../components/portfolio-back-link";
import ResilientBackgroundVideo from "../../components/resilient-background-video";
import "./apple-case-study.scss";

type Language = "en" | "zh";
const appBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const repositoryUrl =
  "https://github.com/stevenjobs530-afk/Apple-App-Store-Data-Cleaning-Analysis";

const heroVideo = `${appBasePath}/media/video/apple-app-store-hero.mp4`;
const heroPoster = `${appBasePath}/media/posters/apple-app-store-hero.jpg`;

const pipelineIcons = [FileText, Search, ShieldCheck, Database, BarChart3];

const pipelineEvidence = {
  en: [
    {
      label: "Verified conversion artifacts",
      body: "The public repository separates the conversion step from cleaning so the first CSV and SQLite copies can be reproduced.",
      files: "src/convert_apple_appstore_dataset.py\ndata/processed/apple_appstore_apps.csv\ndata/processed/apple_appstore_apps.sqlite",
    },
    {
      label: "Verified inspection records",
      body: "A written cleaning summary and SQL checks make row counts, missing fields and price logic reviewable.",
      files: "docs/cleaning_summary.md\nsql/validate_cleaned_apple_appstore.sql",
    },
    {
      label: "Verified quality fields",
      body: "The cleaning script preserves source values and adds explicit issue columns plus a queryable issue count.",
      files: "src/clean_apple_appstore_dataset.py\nIssue_* fields\nQuality_Issue_Count",
    },
    {
      label: "Verified cleaned outputs",
      body: "Cleaned records, quality-only rows and the analysis-ready export remain separate, named outputs.",
      files: "data/processed/cleaned_output/\n├── apple_appstore_apps_cleaned.csv\n├── apple_appstore_apps_cleaned.sqlite\n└── apple_appstore_apps_quality_issues.csv",
    },
    {
      label: "Verified analysis outputs",
      body: "The analysis script produces a documented report and reproducible figures rather than an undocumented dashboard.",
      files: "src/analyze_appstore_dataset.py\ndocs/apple_appstore_analysis_report.txt\noutputs/top_10_genres_by_app_count.png",
    },
  ],
  zh: [
    {
      label: "已核验的转换文件",
      body: "公开仓库将转换与清洗分开记录，使最初的 CSV 与 SQLite 副本可以复现。",
      files: "src/convert_apple_appstore_dataset.py\ndata/processed/apple_appstore_apps.csv\ndata/processed/apple_appstore_apps.sqlite",
    },
    {
      label: "已核验的检查记录",
      body: "清洗摘要与 SQL 检查让记录数、缺失字段和价格逻辑都可以复核。",
      files: "docs/cleaning_summary.md\nsql/validate_cleaned_apple_appstore.sql",
    },
    {
      label: "已核验的质量字段",
      body: "清洗脚本保留原始值，并增加明确的问题字段与可查询的问题计数。",
      files: "src/clean_apple_appstore_dataset.py\nIssue_* fields\nQuality_Issue_Count",
    },
    {
      label: "已核验的清洗输出",
      body: "清洗记录、问题记录与分析就绪导出保持为相互独立、名称清楚的输出。",
      files: "data/processed/cleaned_output/\n├── apple_appstore_apps_cleaned.csv\n├── apple_appstore_apps_cleaned.sqlite\n└── apple_appstore_apps_quality_issues.csv",
    },
    {
      label: "已核验的分析输出",
      body: "分析脚本生成有记录的报告与可复现图表，而不是缺少依据的仪表盘。",
      files: "src/analyze_appstore_dataset.py\ndocs/apple_appstore_analysis_report.txt\noutputs/top_10_genres_by_app_count.png",
    },
  ],
} as const;

const copy = {
  en: {
    repository: "Repository",
    language: "中文",
    languageLabel: "Switch to Chinese",
    navigationLabel: "Apple case study navigation",
    backLabel: "Back to Portfolio — return to the Apple App Store project card",
    repositoryLabel: "Open the Apple App Store analysis repository in a new tab",
    eyebrow: "Case study 02 · SQLite · Python · Data quality",
    title: "Cleaning and analysing a historical App Store dataset",
    summary:
      "A documented Python and SQLite workflow for converting, checking, cleaning and describing a historical App Store dataset collected in 2021.",
    explore: "Explore the evidence",
    viewRepository: "View repository",
    historyArtworkAlt: "Geometric construction study of the Apple logo",
    metrics: [
      ["1,230,376", "rows in the cleaning summary"],
      ["1,229,886", "rows in the final analysis report"],
      ["October 2021", "source collection context"],
    ],
    sections: {
      question: {
        label: "01 / The analytical question",
        title: "At this scale data checks need to be repeatable",
        body: "The source contains text, prices, ratings, timestamps, developer fields and file sizes across more than 1.2 million iOS apps. At that scale, consistent comparison starts with repeatable checks rather than isolated manual corrections.",
        contextLabel: "Historical boundary",
        context: "The source repository states that the data was collected in October 2021. This case study describes that dataset and does not claim to represent today’s App Store.",
      },
      pipeline: {
        label: "02 / Evidence pipeline",
        title: "A documented sequence from source conversion to analysis",
        detailPrompt: "Explore evidence",
        steps: [
          ["01", "Convert", "Move the source JSON into CSV and SQLite so the full dataset can be inspected consistently."],
          ["02", "Inspect", "Profile missing values, timestamps, price logic, identifiers and non-positive sizes before changing records."],
          ["03", "Flag", "Create explicit Issue_* fields instead of filling ambiguous values with assumptions."],
          ["04", "Structure", "Build cleaned outputs and an analysis-ready view while retaining the original fields for comparison."],
          ["05", "Analyse", "Use pandas, matplotlib and seaborn to produce reproducible category, pricing and update summaries."],
        ],
      },
      uncertainty: {
        label: "03 / What was uncertain",
        title: "Different missing fields affect different analyses",
        intro: "The cleaning summary separates high-volume informational gaps from the smaller set of issues that can directly change analytical comparisons.",
        items: [
          ["643,988", "blank developer websites", "A large documentation gap, but not automatically a reason to remove an app from category or pricing analysis."],
          ["490", "missing prices", "A substantive issue for pricing comparisons and the derived free-versus-paid classification."],
          ["224", "missing or non-positive sizes", "Records that require caution in any file-size analysis."],
          ["3", "invalid release timestamps", "A small but explicit boundary for release-date and update-period analysis."],
        ],
        principleLabel: "Cleaning principle",
        principle: "Retain uncertain records where possible, mark the problem explicitly and filter only for calculations that require the affected field.",
      },
      evidence: {
        label: "04 / Three evidence stories",
        title: "Three descriptive findings from the 2021 dataset",
        stories: [
          {
            kicker: "Marketplace composition",
            title: "Free apps dominate the analysed rows",
            body: "The final analysis report records 1,127,384 free apps and 102,502 paid apps. The comparison uses the numeric price field rather than relying only on the source Free flag.",
            note: "Scope: the final 1,229,886-row analysis report.",
          },
          {
            kicker: "Category concentration",
            title: "Games is the largest recorded category",
            body: "Games contains 193,328 apps in the report. Business, Education, Utilities and Lifestyle are also described as large categories, but this page avoids inventing counts not stated in the evidence.",
            note: "Finding: category size, not category quality or profitability.",
          },
          {
            kicker: "Dataset-era activity",
            title: "Recorded updates rise toward the collection period",
            body: "The report counts 245,922 apps updated in 2020 and 527,359 in 2021. This describes timestamp activity within the historical dataset, not the current App Store.",
            note: "Boundary: data collection context ends in October 2021.",
          },
        ],
      },
      code: {
        label: "05 / Technical proof",
        title: "Quality issues are recorded as queryable fields",
        body: "The pipeline derives a price-based classification, records missing prices and logic mismatches separately, then totals the issue fields. The original values remain available for review.",
        filename: "src/clean_apple_appstore_dataset.py · Python",
        snippet: `df["Free_By_Price"] = df["Price"].fillna(0).eq(0)\ndf["Issue_Missing_Price"] = df["Price"].isna()\ndf["Issue_Price_Logic_Mismatch"] = (\n    df["Free"].eq(False) & df["Price"].fillna(0).eq(0)\n)\nissue_columns = [c for c in df.columns if c.startswith("Issue_")]\ndf["Quality_Issue_Count"] = df[issue_columns].sum(axis=1)`,
      },
      results: {
        label: "06 / Results and limits",
        title: "Documented outputs filters and data limits",
        items: [
          ["Reproducible", "The repository documents conversion, cleaning, SQL validation and Python analysis as separate steps."],
          ["Filterable", "Issue fields allow each analysis to define the quality conditions it actually needs."],
          ["Historically bounded", "The evidence supports comparisons inside the 2021 dataset, not claims about today’s catalogue or market performance."],
        ],
        countLabel: "A count that remains visible",
        countNote: "The cleaning summary reports 1,230,376 rows, while the later analysis report records 1,229,886. The 490-row difference is disclosed rather than assigned an undocumented explanation; the later figure is used only when referring to the final analysis report.",
      },
      closing: {
        label: "Summary",
        title: "The repository records the full process and its limits",
        body: "It connects the source records, explicit processing rules, quality fields and the resulting descriptive analysis.",
        repository: "Review the evidence",
        projects: "Back to all projects",
      },
    },
  },
  zh: {
    repository: "代码仓库",
    language: "EN",
    languageLabel: "Switch to English",
    navigationLabel: "Apple 案例研究导航",
    backLabel: "返回作品集中的 Apple App Store 项目卡片",
    repositoryLabel: "在新标签页中打开 Apple App Store 数据分析代码仓库",
    eyebrow: "案例研究 02 · SQLite · Python · 数据质量",
    title: "清洗与分析历史 App Store 数据",
    summary: "一个使用 Python 与 SQLite 转换、检查、清洗并描述 2021 年历史 App Store 数据的完整流程。",
    explore: "浏览分析证据",
    viewRepository: "查看代码仓库",
    historyArtworkAlt: "Apple 标志的几何构造研究图",
    metrics: [["1,230,376", "清洗摘要中的记录数"], ["1,229,886", "最终分析报告中的记录数"], ["2021 年 10 月", "数据源收集时点"]],
    sections: {
      question: {
        label: "01 / 分析问题",
        title: "在这一数据规模下检查过程需要可重复",
        body: "该数据涵盖 120 万余个 iOS 应用的文本、价格、评分、时间戳、开发者信息与文件大小。在这个规模上，可靠比较必须从可重复的检查开始，而不是依赖零散的人工修改。",
        contextLabel: "历史边界",
        context: "数据源仓库说明数据收集于 2021 年 10 月。本案例只描述该历史数据集，不代表当前的 App Store。",
      },
      pipeline: {
        label: "02 / 证据流程",
        title: "从源文件转换到分析的完整记录流程",
        detailPrompt: "查看证据",
        steps: [["01", "转换", "将源 JSON 转换为 CSV 与 SQLite，以统一方式检查完整数据。"], ["02", "检查", "在修改记录前，分析缺失值、时间戳、价格逻辑、标识符与非正文件大小。"], ["03", "标记", "建立明确的 Issue_* 字段，而不用主观假设填补模糊值。"], ["04", "结构化", "构建清洗输出与分析视图，同时保留原始字段用于比较。"], ["05", "分析", "使用 pandas、matplotlib 和 seaborn 生成可复现的类别、价格与更新摘要。"]],
      },
      uncertainty: {
        label: "03 / 不确定之处",
        title: "不同类型的缺失字段会影响不同分析",
        intro: "清洗摘要区分了大规模的信息性缺口，与少量会直接改变分析比较的实质性问题。",
        items: [["643,988", "开发者网站为空", "这是显著的文档缺口，但不必然意味着应用需要从类别或价格分析中删除。"], ["490", "价格缺失", "这会影响价格比较与免费/付费分类。"], ["224", "文件大小缺失或非正", "在任何文件大小分析中都需要谨慎处理。"], ["3", "无效发布时间", "这是发布日期与更新时段分析的明确边界。"]],
        principleLabel: "清洗原则",
        principle: "尽可能保留不确定记录，明确标记问题，并且只在某项计算确实需要可靠字段时进行筛选。",
      },
      evidence: {
        label: "04 / 三组分析证据",
        title: "来自 2021 年数据集的三项描述性结果",
        stories: [
          { kicker: "市场结构", title: "免费应用占分析记录的大多数", body: "最终分析报告记录了 1,127,384 个免费应用和 102,502 个付费应用。分类基于数值价格字段，而不是仅依赖原始 Free 标记。", note: "范围：最终报告中的 1,229,886 条分析记录。" },
          { kicker: "类别集中度", title: "游戏是记录数最多的类别", body: "报告中游戏类包含 193,328 个应用。商务、教育、工具与生活方式也被描述为大型类别，但本页不会虚构证据中未提供的数量。", note: "结论边界：类别规模，而非类别质量或盈利能力。" },
          { kicker: "数据时期内的活动", title: "记录中的更新活动在接近收集期时上升", body: "报告记录 2020 年更新的应用为 245,922 个，2021 年为 527,359 个。这反映历史数据内的时间戳活动，不代表当前 App Store。", note: "边界：数据收集时间截止于 2021 年 10 月。" },
        ],
      },
      code: {
        label: "05 / 技术证据", title: "将数据质量问题记录为可查询字段", body: "该流程基于价格派生分类，分别记录价格缺失与逻辑不一致，然后统计所有问题字段。原始值始终保留，便于复核。", filename: "src/clean_apple_appstore_dataset.py · Python", snippet: `df["Free_By_Price"] = df["Price"].fillna(0).eq(0)\ndf["Issue_Missing_Price"] = df["Price"].isna()\ndf["Issue_Price_Logic_Mismatch"] = (\n    df["Free"].eq(False) & df["Price"].fillna(0).eq(0)\n)\nissue_columns = [c for c in df.columns if c.startswith("Issue_")]\ndf["Quality_Issue_Count"] = df[issue_columns].sum(axis=1)`,
      },
      results: {
        label: "06 / 结果与边界", title: "项目记录的输出 筛选条件与数据限制", items: [["可复现", "代码仓库将转换、清洗、SQL 验证与 Python 分析记录为独立步骤。"], ["可筛选", "问题字段使每项分析能够定义自己真正需要的数据质量条件。"], ["历史范围明确", "证据支持对 2021 年数据集的比较，而不支持对当前应用目录或市场表现的结论。"]], countLabel: "保持可见的记录差异", countNote: "清洗摘要记录 1,230,376 条，而后续分析报告记录 1,229,886 条。本页不会为这 490 条差异虚构未记录的原因；只有在引用最终分析报告时才使用后一个数字。",
      },
      closing: { label: "项目总结", title: "代码仓库记录了完整流程与当前限制", body: "其中包含源记录、明确的处理规则、数据质量字段与描述性分析结果。", repository: "查看完整证据", projects: "返回所有项目" },
    },
  },
} as const;

export default function AppleCaseStudy({ initialLanguage }: { initialLanguage: Language }) {
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [activePipelineStep, setActivePipelineStep] = useState<number | null>(null);
  const resolvedUrlLanguage = useRef(false);
  const t = copy[language];
  const portfolioHref = `${appBasePath}/?lang=${language}#project-apple-app-store`;

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
    document.title = language === "zh" ? "Apple App Store 数据分析 — 高子舜" : "Apple App Store Data Analysis — Zishun Gao";
    document.querySelector('meta[name="description"]')?.setAttribute(
      "content",
      language === "zh"
        ? "一个聚焦数据质量、可追溯处理与谨慎解读的 App Store 数据案例。"
        : "A documented Python and SQLite workflow for cleaning and analysing a historical Apple App Store dataset.",
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
    <main className="apple-page" lang={language === "zh" ? "zh-CN" : "en"}>
      <PortfolioBackLink href={portfolioHref} language={language} ariaLabel={t.backLabel} />
      <section className="apple-hero" aria-labelledby="apple-title">
        <ResilientBackgroundVideo
          className="apple-hero-media"
          videoClassName="apple-hero-video"
          src={heroVideo}
          poster={heroPoster}
          playLabel={language === "zh" ? "播放背景动画" : "Play background animation"}
          priority
        />
        <div className="apple-hero-shade" aria-hidden="true" />

        <header className="apple-nav">
          <nav className="apple-nav-links apple-glass" aria-label={t.navigationLabel}>
            <a href="#pipeline">{language === "en" ? "Method" : "方法"}</a>
            <a href="#evidence">{language === "en" ? "Evidence" : "证据"}</a>
            <a href="#results">{language === "en" ? "Results" : "结果"}</a>
            <button type="button" onClick={toggleLanguage} aria-label={t.languageLabel}>{t.language}</button>
          </nav>
          <button className="apple-mobile-language apple-glass" type="button" onClick={toggleLanguage} aria-label={t.languageLabel}>{t.language}</button>
        </header>

        <div className="apple-hero-copy">
          <p>{t.eyebrow}</p>
          <h1 id="apple-title">{t.title}</h1>
          <span>{t.summary}</span>
          <div className="apple-hero-actions">
            <a className="apple-primary" href="#question">{t.explore}<ArrowRight aria-hidden="true" /></a>
            <a className="apple-secondary apple-glass" href={repositoryUrl} target="_blank" rel="noreferrer" aria-label={t.repositoryLabel}>{t.viewRepository}<ExternalLink aria-hidden="true" /></a>
          </div>
        </div>

        <dl className="apple-metrics apple-glass">
          {t.metrics.map(([value, label]) => <div key={label}><dt>{value}</dt><dd>{label}</dd></div>)}
        </dl>
      </section>

      <article className="apple-story">
        <section id="question" className="apple-section apple-question" aria-labelledby="question-title">
          <div className="apple-heading"><p>{t.sections.question.label}</p><h2 id="question-title">{t.sections.question.title}</h2></div>
          <p className="apple-question-copy">{t.sections.question.body}</p>
          <aside className="apple-history-feature">
            <div><span>{t.sections.question.contextLabel}</span><p>{t.sections.question.context}</p></div>
            <figure><Image src={`${appBasePath}/case-studies/apple-app-store/apple-construction-grid.png`} width={1448} height={1086} sizes="(max-width: 760px) 88vw, 42vw" alt={t.historyArtworkAlt} unoptimized /></figure>
          </aside>
        </section>

        <section id="pipeline" className="apple-section apple-pipeline apple-dark" aria-labelledby="pipeline-title">
          <div className="apple-heading"><p>{t.sections.pipeline.label}</p><h2 id="pipeline-title">{t.sections.pipeline.title}</h2></div>
          <ol onKeyDown={(event) => {
            if (event.key === "Escape") setActivePipelineStep(null);
          }}>{t.sections.pipeline.steps.map(([number, title, body], index) => {
            const Icon = pipelineIcons[index];
            const evidence = pipelineEvidence[language][index];
            const isActive = activePipelineStep === index;
            const detailId = `apple-pipeline-detail-${index + 1}`;
            return <li className={isActive ? "is-active" : undefined} key={number}>
              <button
                className="apple-pipeline-trigger"
                type="button"
                aria-expanded={isActive}
                aria-controls={detailId}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setActivePipelineStep((current) => current === index ? null : index);
                  }
                }}
                onClick={() => setActivePipelineStep((current) => current === index ? null : index)}
              >
                <div className="apple-pipeline-icon" aria-hidden="true"><Icon /></div>
                <span>{number}</span><h3>{title}</h3><p>{body}</p>
                <small>{t.sections.pipeline.detailPrompt}</small>
              </button>
              <div id={detailId} className="apple-pipeline-detail" aria-hidden={!isActive}>
                <strong>{evidence.label}</strong>
                <p>{evidence.body}</p>
                <pre><code>{evidence.files}</code></pre>
              </div>
            </li>;
          })}</ol>
        </section>

        <section className="apple-section apple-uncertainty" aria-labelledby="uncertainty-title">
          <div className="apple-heading"><p>{t.sections.uncertainty.label}</p><h2 id="uncertainty-title">{t.sections.uncertainty.title}</h2></div>
          <p className="apple-intro">{t.sections.uncertainty.intro}</p>
          <div className="apple-issue-grid">{t.sections.uncertainty.items.map(([value, label, body]) => <article key={label}><strong>{value}</strong><h3>{label}</h3><p>{body}</p></article>)}</div>
          <aside className="apple-principle"><span>{t.sections.uncertainty.principleLabel}</span><p>{t.sections.uncertainty.principle}</p></aside>
        </section>

        <section id="evidence" className="apple-section apple-evidence" aria-labelledby="evidence-title">
          <div className="apple-heading"><p>{t.sections.evidence.label}</p><h2 id="evidence-title">{t.sections.evidence.title}</h2></div>
          <div className="apple-story-grid">
            {t.sections.evidence.stories.map((story, index) => <article key={story.kicker} className={`apple-evidence-card apple-evidence-${index + 1}`}>
              <div className="apple-evidence-visual" aria-hidden="true">
                {index === 0 ? <div className="apple-split"><span style={{ width: "91.67%" }} /><i style={{ width: "8.33%" }} /></div> : null}
                {index === 1 ? <strong>193,328</strong> : null}
                {index === 2 ? <div className="apple-years"><span><i style={{ height: "46.63%" }} />2020</span><span><i style={{ height: "100%" }} />2021</span></div> : null}
              </div>
              <p>{story.kicker}</p><h3>{story.title}</h3><div>{story.body}</div><small>{story.note}</small>
            </article>)}
          </div>
        </section>

        <section className="apple-section apple-code apple-dark" aria-labelledby="code-title">
          <div><div className="apple-heading"><p>{t.sections.code.label}</p><h2 id="code-title">{t.sections.code.title}</h2></div><p>{t.sections.code.body}</p></div>
          <pre aria-label={t.sections.code.filename}><span>{t.sections.code.filename}</span><code>{t.sections.code.snippet}</code></pre>
        </section>

        <section id="results" className="apple-section apple-results" aria-labelledby="results-title">
          <div className="apple-heading"><p>{t.sections.results.label}</p><h2 id="results-title">{t.sections.results.title}</h2></div>
          <ol>{t.sections.results.items.map(([title, body], index) => <li key={title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{body}</p></li>)}</ol>
          <aside><span>{t.sections.results.countLabel}</span><p>{t.sections.results.countNote}</p></aside>
        </section>

        <section className="apple-section apple-closing apple-dark" aria-labelledby="closing-title">
          <p>{t.sections.closing.label}</p>
          <h2 id="closing-title">{t.sections.closing.title}</h2>
          <span>{t.sections.closing.body}</span>
          <div className="apple-closing-actions"><a href={repositoryUrl} target="_blank" rel="noreferrer" aria-label={t.repositoryLabel}>{t.sections.closing.repository}<ExternalLink aria-hidden="true" /></a><a href={portfolioHref}>{t.sections.closing.projects}<ArrowLeft aria-hidden="true" /></a></div>
        </section>
      </article>
    </main>
  );
}
