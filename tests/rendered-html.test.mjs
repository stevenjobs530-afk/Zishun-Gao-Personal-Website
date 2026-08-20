import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

async function render(pathname) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${encodeURIComponent(pathname)}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the English UK Retail case study", async () => {
  const response = await render("/case-studies/uk-retail?lang=en");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>UK Retail Transactions — Zishun Gao<\/title>/i);
  assert.match(html, /UK retail/);
  assert.match(html, /Turning raw transaction data into an analysis table/);
  assert.match(html, /1\.6M/);
  assert.match(html, /raw records/);
  assert.match(html, /524,878/);
  assert.match(html, /clean rows/);
  assert.match(html, /£10\.6M\+/);
  assert.match(html, /analysed/);
  assert.match(html, /monthly-revenue-trend\.png/);
  assert.match(html, /top-products-revenue\.png/);
  assert.match(html, /Description IS NOT NULL/);
  assert.match(html, /\?lang=en#project-uk-retail/);
  assert.match(html, /data-portfolio-back-link/);
  assert.match(html, />Back to Portfolio<\/span>/);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site|react-loading-skeleton/i);
});

test("hydrates the static UK Retail route from the requested Chinese language", async () => {
  const response = await render("/case-studies/uk-retail?lang=zh");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /<title>UK Retail Transactions — Zishun Gao<\/title>/);

  const component = await readFile(
    new URL("../app/case-studies/uk-retail/uk-retail-case-study.tsx", import.meta.url),
    "utf8",
  );
  assert.match(component, /英国零售/);
  assert.match(component, /案例研究导航/);
  assert.match(component, /requestedLanguage/);
  assert.match(component, /url\.searchParams\.get\("lang"\)/);
  assert.match(component, /英国零售交易分析 — 高子舜/);
});

test("keeps the user-owned hero background and responsive language controls", async () => {
  const [component, stylesheet] = await Promise.all([
    readFile(new URL("../app/case-studies/uk-retail/uk-retail-case-study.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/case-studies/uk-retail/uk-retail-hero.scss", import.meta.url), "utf8"),
  ]);

  assert.match(component, /uk-retail-hero-bg/);
  assert.doesNotMatch(component, /<video/);
  assert.match(stylesheet, /uk-retail-hero-clean-data\.png/);
  assert.match(stylesheet, /method-background\.png/);
  assert.match(stylesheet, /evidence-trail-background\.png/);
  assert.doesNotMatch(stylesheet, /outputs-background\.png/);
  assert.match(stylesheet, /cleaning-decisions-background\.png/);
  assert.match(stylesheet, /results-background\.png/);
  assert.match(component, /uk-retail-mobile-language/);
  assert.match(component, /document\.documentElement\.lang/);
  assert.match(stylesheet, /max-width:\s*580px.+max-height:\s*720px/s);
  assert.match(stylesheet, /prefers-reduced-motion:\s*reduce/);
  assert.match(stylesheet, /\.uk-retail-evidence-list li[\s\S]*?> span\s*\{[^}]*margin-left:\s*14px;/s);
  assert.match(stylesheet, /@media \(max-width: 800px\)[\s\S]*\.uk-retail-evidence-list li\s*\{[^}]*[\s\S]*?> span\s*\{[^}]*margin-left:\s*8px;/s);
  assert.match(stylesheet, /@media \(max-width: 580px\)[\s\S]*\.uk-retail-evidence-list[\s\S]*?> span\s*\{[^}]*margin-left:\s*2px;/s);

  await Promise.all([
    access(new URL("public/case-studies/uk-retail/uk-retail-hero-clean-data.png", projectRoot)),
    access(new URL("public/case-studies/uk-retail/method-background.png", projectRoot)),
    access(new URL("public/case-studies/uk-retail/evidence-trail-background.png", projectRoot)),
    access(new URL("public/case-studies/uk-retail/cleaning-decisions-background.png", projectRoot)),
    access(new URL("public/case-studies/uk-retail/results-background.png", projectRoot)),
    access(new URL("public/case-studies/uk-retail/monthly-revenue-trend.png", projectRoot)),
    access(new URL("public/case-studies/uk-retail/top-products-revenue.png", projectRoot)),
  ]);
});

test("keeps UK Results full-bleed and aligns the SQL content shell", async () => {
  const [component, stylesheet] = await Promise.all([
    readFile(new URL("../app/case-studies/uk-retail/uk-retail-case-study.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/case-studies/uk-retail/uk-retail-hero.scss", import.meta.url), "utf8"),
  ]);

  assert.match(component, /className="uk-retail-code-inner"/);
  assert.match(stylesheet, /\.uk-retail-code-inner\s*\{[^}]*width:\s*min\(1120px, 100%\)[^}]*display:\s*grid[^}]*margin:\s*0 auto/s);
  assert.match(stylesheet, /\.uk-retail-results\s*\{[^}]*width:\s*100%[^}]*max-width:\s*none/s);
  assert.match(stylesheet, /\.uk-retail-results\s*\{[\s\S]*?> \*\s*\{[^}]*width:\s*min\(1120px, 100%\)[^}]*margin-right:\s*auto[^}]*margin-left:\s*auto/s);
  assert.match(stylesheet, /\.uk-retail-results-body\s*\{[^}]*margin:\s*clamp\(48px, 7vw, 88px\) auto 0 !important[^}]*text-align:\s*center/s);
});

test("server-renders the redesigned English Apple case study", async () => {
  const response = await render("/case-studies/apple-app-store?lang=en");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Apple App Store Data Analysis — Zishun Gao<\/title>/i);
  assert.match(html, /Cleaning and analysing a historical App Store dataset/);
  assert.match(html, /At this scale data checks need to be repeatable/);
  assert.match(html, /1,230,376/);
  assert.match(html, /1,229,886/);
  assert.match(html, /October 2021/);
  assert.match(html, /643,988/);
  assert.match(html, /Quality_Issue_Count/);
  assert.match(html, /Back to all projects/);
  assert.match(html, /\?lang=en#project-apple-app-store/);
  assert.match(html, /data-portfolio-back-link/);
  assert.match(html, />Back to Portfolio<\/span>/);
  assert.match(html, /docs\/cleaning_summary\.md/);
  assert.match(html, /sql\/validate_cleaned_apple_appstore\.sql/);
  assert.match(html, /aria-expanded="false"/);
  assert.doesNotMatch(html, /portfolio-v3-public/);
  assert.doesNotMatch(html, /Early-Career Wellbeing Study|Next case/);
});

test("hydrates the static Apple route from the requested Chinese language", async () => {
  const response = await render("/case-studies/apple-app-store?lang=zh");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /<title>Apple App Store Data Analysis — Zishun Gao<\/title>/);

  const component = await readFile(
    new URL("../app/case-studies/apple-app-store/apple-case-study.tsx", import.meta.url),
    "utf8",
  );
  assert.match(component, /清洗与分析历史 App Store 数据/);
  assert.match(component, /2021 年 10 月/);
  assert.match(component, /requestedLanguage/);
  assert.match(component, /Apple App Store 数据分析 — 高子舜/);
});

test("centers the Apple and AEP five-step grids with equal-width tracks", async () => {
  const [appleStyles, aepStyles] = await Promise.all([
    readFile(new URL("../app/case-studies/apple-app-store/apple-case-study.scss", import.meta.url), "utf8"),
    readFile(new URL("../app/case-studies/early-career-wellbeing/aep-case-study.scss", import.meta.url), "utf8"),
  ]);

  assert.match(appleStyles, /\.apple-pipeline\s*\{[\s\S]*?ol\s*\{[\s\S]*?grid-template-columns:\s*repeat\(5, minmax\(0, 1fr\)\)[\s\S]*?margin:\s*clamp\(64px, 8vw, 104px\) auto 0/s);
  assert.match(appleStyles, /\.apple-pipeline\s*\{[\s\S]*?li\s*\{[^}]*min-width:\s*0/s);
  assert.match(aepStyles, /\.aep-flow\s*\{[\s\S]*?ol\s*\{[\s\S]*?grid-template-columns:\s*repeat\(5, minmax\(0, 1fr\)\)[\s\S]*?margin:\s*clamp\(64px, 8vw, 104px\) auto 0/s);
  assert.match(aepStyles, /\.aep-flow\s*\{[\s\S]*?li\s*\{[^}]*min-width:\s*0/s);
});

test("uses the AEP Hero display font throughout English display copy", async () => {
  const stylesheet = await readFile(
    new URL("../app/case-studies/early-career-wellbeing/aep-case-study.scss", import.meta.url),
    "utf8",
  );

  assert.match(stylesheet, /--aep-display-font:\s*"Newsreader", "Source Serif 4", Georgia, serif/);
  assert.match(stylesheet, /\.aep-page\[lang="zh-CN"\]\s*\{[^}]*--aep-display-font:\s*"Inter"/s);
  assert.doesNotMatch(stylesheet, /Instrument Serif/);
  assert.ok((stylesheet.match(/font-family:\s*var\(--aep-display-font\)/g) ?? []).length >= 10);
});

test("routes the Apple and AEP cards to their local case studies", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  const html = await response.text();

  assert.match(html, /href="\/case-studies\/apple-app-store\/?\?lang=en"/);
  assert.match(html, /href="\/case-studies\/early-career-wellbeing\/?\?lang=en"/);
});

test("downloads the matching CV after client-side language hydration", async () => {
  const englishResponse = await render("/?lang=en");
  assert.equal(englishResponse.status, 200);
  const english = await englishResponse.text();

  assert.match(english, /href="\/cv\/Zishun_Gao_CV_UK_2026\.pdf"/);
  assert.match(english, /download="Zishun_Gao_CV_UK_2026\.pdf"/);
  assert.match(english, /Download English CV/);
  assert.doesNotMatch(english, /href="\/cv\/Zishun_Gao_CV_CN_2026\.pdf"/);

  const component = await readFile(new URL("../app/portfolio-home.tsx", import.meta.url), "utf8");
  assert.match(component, /Zishun_Gao_CV_CN_2026\.pdf/);
  assert.match(component, /下载中文简历/);
  assert.match(component, /requestedLanguage/);

  await Promise.all([
    access(new URL("../public/cv/Zishun_Gao_CV_UK_2026.pdf", import.meta.url)),
    access(new URL("../public/cv/Zishun_Gao_CV_CN_2026.pdf", import.meta.url)),
  ]);
});

test("adds the client-localized AI workflow feature to the portfolio homepage", async () => {
  const englishResponse = await render("/?lang=en");
  assert.equal(englishResponse.status, 200);
  const english = await englishResponse.text();

  assert.match(english, /id="ai-workflow"/);
  assert.match(english, /A structured workflow for/);
  assert.match(english, /job research and tracking/);
  assert.match(english, /Discover/);
  assert.match(english, /Validate/);
  assert.match(english, /Compare/);
  assert.match(english, /Track/);
  assert.match(english, /href="\/case-studies\/ai-assisted-job-workflow\/?\?lang=en"/);

  const component = await readFile(new URL("../app/portfolio-home.tsx", import.meta.url), "utf8");
  assert.match(component, /求职信息的/);
  assert.match(component, /整理与跟踪/);
  assert.match(component, /requestedLanguage/);
});

test("uses the supplied AI laboratory image without the previous orbit decoration", async () => {
  const [home, stylesheet] = await Promise.all([
    readFile(new URL("../app/portfolio-home.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    access(new URL("../public/backgrounds/ai-workflow-laboratory.png", import.meta.url)),
  ]);

  assert.match(stylesheet, /ai-workflow-laboratory\.png/);
  assert.doesNotMatch(home, /ai-feature-atmosphere|ai-orbit/);
});

test("uses the supplied evidence image for the Working Method section", async () => {
  const stylesheet = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  await access(new URL("../public/backgrounds/method-evidence.png", import.meta.url));

  assert.match(stylesheet, /\.method-photo\s*\{[^}]*method-evidence\.png/s);
  assert.match(stylesheet, /\.framework-method\s*\{[^}]*background-color:\s*#d8d0c3;/s);
  assert.doesNotMatch(stylesheet, /\.framework-method\s*\{[^}]*background:\s*#d8d0c3;/s);
});

test("keeps paired homepage headings optically consistent in both languages", async () => {
  const stylesheet = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(stylesheet, /\.framework-heading h2 em\s*\{[^}]*font-family:\s*"Cormorant Garamond"[^}]*font-size:\s*1em[^}]*font-weight:\s*500[^}]*letter-spacing:\s*-0\.045em/s);
  assert.match(stylesheet, /main\[lang="en"\] \.personal-serif\s*\{[^}]*font-family:\s*inherit[^}]*font-size:\s*1em[^}]*font-style:\s*italic[^}]*letter-spacing:\s*-0\.03em/s);
  assert.match(stylesheet, /main\[lang="en"\] \.framework-heading h2 em\s*\{[^}]*font-family:\s*inherit[^}]*font-size:\s*0\.94em[^}]*font-style:\s*italic[^}]*letter-spacing:\s*-0\.055em/s);
  assert.match(stylesheet, /main\[lang="en"\] \.ai-feature-copy h2 em\s*\{[^}]*font-family:\s*inherit[^}]*font-size:\s*0\.94em[^}]*font-style:\s*italic[^}]*letter-spacing:\s*inherit/s);
  assert.match(stylesheet, /\.contact-content h2\s*\{[^}]*line-height:\s*1\.02/s);
  assert.match(stylesheet, /main\[lang="en"\] \.contact-content h2 em\s*\{[^}]*margin-top:\s*0\.14em[^}]*font-family:\s*inherit[^}]*font-size:\s*0\.94em[^}]*font-style:\s*italic[^}]*letter-spacing:\s*inherit[^}]*line-height:\s*1/s);
  assert.match(stylesheet, /main\[lang="zh-CN"\] \.contact-content h2\s*\{[^}]*font-family:\s*"Inter"[^}]*font-size:\s*clamp\(52px, 7\.4vw, 104px\)[^}]*line-height:\s*1\.02/s);
  assert.match(stylesheet, /main\[lang="zh-CN"\] \.contact-content h2 em\s*\{[^}]*margin-top:\s*0\.16em[^}]*font-family:\s*inherit[^}]*font-size:\s*1em[^}]*font-style:\s*normal[^}]*line-height:\s*1/s);
  assert.match(stylesheet, /main\[lang="zh-CN"\] \.framework-heading h2 em\s*\{[^}]*font-family:\s*"Inter"[^}]*font-style:\s*normal[^}]*font-weight:\s*400/s);
  assert.match(stylesheet, /main\[lang="zh-CN"\] \.framework-heading h2\s*\{[^}]*font-size:\s*clamp\(44px, 13\.2vw, 62px\)[^}]*line-height:\s*0\.94/s);
  assert.match(stylesheet, /main\[lang="zh-CN"\] \.framework-heading h2 > span,[\s\S]*main\[lang="zh-CN"\] \.framework-heading h2 > em\s*\{[^}]*white-space:\s*nowrap/s);
});

test("keeps bilingual display titles free of punctuation", async () => {
  const copyFiles = [
    "../app/portfolio-home.tsx",
    "../app/case-studies/uk-retail/uk-retail-case-study.tsx",
    "../app/case-studies/apple-app-store/apple-case-study.tsx",
    "../app/case-studies/early-career-wellbeing/aep-case-study.tsx",
    "../app/case-studies/ai-assisted-job-workflow/ai-workflow-concept.tsx",
  ];
  const sources = await Promise.all(copyFiles.map((file) => readFile(new URL(file, import.meta.url), "utf8")));

  for (const source of sources) {
    const values = [...source.matchAll(/\b(?:title|titleTop|titleBottom|italic|name|statement):\s*"([^"]+)"/g)].map((match) => match[1]);
    assert.ok(values.length > 0);
    for (const value of values) assert.doesNotMatch(value, /[.!?,;:。！？；：，]/);
  }

  const personalTraining = await readFile(new URL("../app/personal-projects/personal-training/personal-training-hero.tsx", import.meta.url), "utf8");
  const strengthDemo = await readFile(new URL("../app/personal-projects/personal-training/strength-demo.tsx", import.meta.url), "utf8");
  const literalHeadings = [...`${personalTraining}\n${strengthDemo}`.matchAll(/<h[1-3][^>]*>([^<{]+)<\/h[1-3]>/g)].map((match) => match[1].trim());
  assert.ok(literalHeadings.length > 0);
  for (const heading of literalHeadings) assert.doesNotMatch(heading, /[.!?,;:。！？；：，]/);
});

test("keeps experience cards inside the available responsive width", async () => {
  const stylesheet = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(stylesheet, /\.experience-list\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\)[^}]*width:\s*100%[^}]*max-width:\s*1600px/s);
  assert.match(stylesheet, /\.experience-photo\s*\{[^}]*width:\s*100%[^}]*min-width:\s*0[^}]*max-width:\s*100%/s);
  assert.match(stylesheet, /\.experience-metrics dd\s*\{[^}]*overflow-wrap:\s*break-word/s);
  assert.match(stylesheet, /\.experience-details li\s*\{[^}]*overflow-wrap:\s*break-word/s);
});

test("classifies the live viewport for automatic responsive layout changes", async () => {
  const component = await readFile(new URL("../app/portfolio-home.tsx", import.meta.url), "utf8");
  const response = await render("/?lang=en");
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(component, /useSyncExternalStore\(subscribeViewportMode, readViewportMode/);
  assert.match(component, /matchMedia\(COMPACT_VIEWPORT_QUERY\)/);
  assert.match(component, /matchMedia\(MEDIUM_VIEWPORT_QUERY\)/);
  assert.match(component, /window\.addEventListener\("resize", notify/);
  assert.match(component, /window\.addEventListener\("orientationchange", notify/);
  assert.match(component, /window\.visualViewport\?\.addEventListener\("resize", notify/);
  assert.match(component, /data-viewport=\{viewportMode\}/);
  assert.match(html, /data-viewport="wide"/);
});

test("keeps one responsive layout between defined minimum and maximum widths", async () => {
  const stylesheet = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(stylesheet, /:root\s*\{[^}]*--page-content-max:\s*1760px/s);
  assert.match(stylesheet, /html\s*\{[^}]*min-width:\s*280px/s);
  assert.match(stylesheet, /\.personal-hero\s*\{[^}]*width:\s*100%/s);
  assert.match(stylesheet, /\.personal-navbar\s*\{[^}]*width:\s*100%/s);
  assert.match(stylesheet, /\.contact-section\s*\{[^}]*width:\s*100%/s);
  assert.match(stylesheet, /\.framework-section > :not\(\.section-blend\)\s*\{[^}]*max-width:\s*var\(--page-content-max\)/s);
  assert.match(stylesheet, /@media \(max-width:\s*1100px\)/);
  assert.match(stylesheet, /@media \(max-width:\s*768px\)/);
  assert.match(stylesheet, /\.education-layout\s*\{[^}]*min-width:\s*0/s);
  assert.match(stylesheet, /\.grade-list\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/s);
  assert.match(stylesheet, /@media \(max-width:\s*768px\)[\s\S]*\.framework-heading h2\s*\{[^}]*font-size:\s*clamp\(42px, 11\.5vw, 58px\)[^}]*line-height:\s*0\.94/s);
  assert.match(stylesheet, /@media \(max-width:\s*768px\)[\s\S]*\.education-stack\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\)/s);
});

test("server-renders the English AI workflow concept without outcome overclaims", async () => {
  const response = await render("/case-studies/ai-assisted-job-workflow?lang=en");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>AI-Assisted Job Workflow Concept — Zishun Gao<\/title>/);
  assert.match(html, /A structured process for UK job research/);
  assert.match(html, /media\/video\/ai-workflow-hero\.mp4/);
  assert.match(html, /media\/posters\/ai-workflow-hero\.jpg/);
  assert.match(html, /AI may support/);
  assert.match(html, /I retain control/);
  assert.match(html, /Read-only discovery/);
  assert.match(html, /Manual submission/);
  assert.match(html, /This page documents a workflow concept/);
  assert.match(html, /No measured time saving/);
  assert.match(html, /\?lang=en#ai-workflow/);
  assert.match(html, /data-portfolio-back-link/);
  assert.match(html, />Back to Portfolio<\/span>/);
});

test("hydrates the static AI workflow route from the requested Chinese language", async () => {
  const response = await render("/case-studies/ai-assisted-job-workflow?lang=zh");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /<title>AI-Assisted Job Workflow Concept — Zishun Gao<\/title>/);

  const component = await readFile(
    new URL("../app/case-studies/ai-assisted-job-workflow/ai-workflow-concept.tsx", import.meta.url),
    "utf8",
  );
  assert.match(component, /英国求职信息的结构化整理流程/);
  assert.match(component, /AI 可以辅助/);
  assert.match(component, /我保留控制权/);
  assert.match(component, /requestedLanguage/);
  assert.match(component, /AI 辅助求职工作流概念 — 高子舜/);
});

test("keeps the AI case-study Hero focused on the supplied video composition", async () => {
  const component = await readFile(
    new URL("../app/case-studies/ai-assisted-job-workflow/ai-workflow-concept.tsx", import.meta.url),
    "utf8",
  );

  assert.match(component, /videoClassName="ai-concept-hero-video"/);
  assert.match(component, /className="ai-concept-nav-cta"/);
  assert.match(component, /className="ai-concept-primary"/);
  assert.doesNotMatch(component, /className="ai-concept-grid"/);
  assert.doesNotMatch(component, /className="ai-concept-orbits"/);
  assert.doesNotMatch(component, /className="ai-concept-hero-stages"/);
});

test("uses resilient local background videos and posters across the portfolio", async () => {
  const [shared, sharedStyles, home, apple, aep, aiWorkflow, personalTraining, homeStyles, appleStyles, aepStyles] = await Promise.all([
    readFile(new URL("../app/components/resilient-background-video.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/resilient-background-video.module.css", import.meta.url), "utf8"),
    readFile(new URL("../app/portfolio-home.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/case-studies/apple-app-store/apple-case-study.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/case-studies/early-career-wellbeing/aep-case-study.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/case-studies/ai-assisted-job-workflow/ai-workflow-concept.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/personal-projects/personal-training/personal-training-hero.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/case-studies/apple-app-store/apple-case-study.scss", import.meta.url), "utf8"),
    readFile(new URL("../app/case-studies/early-career-wellbeing/aep-case-study.scss", import.meta.url), "utf8"),
  ]);

  for (const component of [home, apple, aep, aiWorkflow]) assert.match(component, /<ResilientBackgroundVideo/);
  for (const source of [home, apple, aep, aiWorkflow, personalTraining]) {
    assert.doesNotMatch(source, /d8j0ntlcm91z4\.cloudfront\.net|app-uploads\.krea\.ai/);
  }

  assert.match(shared, /type VideoState = "loading" \| "playing" \| "fallback" \| "reduced-motion"/);
  assert.match(shared, /poster=\{poster\}/);
  assert.match(shared, /<source src=\{src\} type="video\/mp4"/);
  assert.match(shared, /video\.defaultMuted = true/);
  assert.match(shared, /video\.setAttribute\("playsinline", ""\)/);
  assert.match(shared, /video\.readyState >= HTMLMediaElement\.HAVE_CURRENT_DATA/);
  assert.match(shared, /PLAYBACK_TIMEOUT_MS = 2500/);
  assert.match(shared, /IntersectionObserver/);
  assert.match(shared, /prefers-reduced-motion: reduce/);
  assert.match(sharedStyles, /background-image:\s*var\(--background-video-poster\)/);
  assert.match(sharedStyles, /data-video-state="playing"/);

  assert.match(homeStyles, /\.personal-hero-media\s*\{[^}]*z-index:\s*0/s);
  assert.match(homeStyles, /\.hero-nav-spacer\s*\{[^}]*z-index:\s*1/s);
  assert.match(appleStyles, /\.apple-hero-media\s*\{[^}]*z-index:\s*0/s);
  assert.match(appleStyles, /\.apple-hero-shade\s*\{[^}]*z-index:\s*1/s);
  assert.match(aepStyles, /\.aep-hero-media\s*\{[^}]*z-index:\s*0/s);
  assert.match(aepStyles, /\.aep-hero-shade\s*\{[^}]*z-index:\s*1/s);

  const assetNames = [
    "homepage-hero",
    "homepage-contact",
    "apple-app-store-hero",
    "early-career-wellbeing-hero",
    "ai-workflow-hero",
    "training-strength",
    "training-cardio",
    "training-progress",
  ];

  for (const name of assetNames) {
    const video = new URL(`../public/media/video/${name}.mp4`, import.meta.url);
    const poster = new URL(`../public/media/posters/${name}.jpg`, import.meta.url);
    await Promise.all([access(video), access(poster)]);
    const [videoStats, posterStats] = await Promise.all([stat(video), stat(poster)]);
    assert.ok(videoStats.size >= 100_000 && videoStats.size <= 3_000_000);
    assert.ok(posterStats.size >= 20_000 && posterStats.size <= 300_000);
  }
});

test("keeps all case-study cards in the current tab and provides exact return targets", async () => {
  const home = await readFile(new URL("../app/portfolio-home.tsx", import.meta.url), "utf8");

  assert.doesNotMatch(home, /openInNewTab/);
  assert.match(home, /id=\{`project-\$\{project\.slug\}`\}/);
  assert.match(home, /tabIndex=\{-1\}/);
  assert.match(home, /focusReturnedProject/);
});

test("routes the unchanged Personal Training card to the local English hero", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  const html = await response.text();

  assert.match(html, /id="personal-training-project" tabindex="-1" class="fitness-project"/);
  assert.match(html, /href="\/personal-projects\/personal-training\/?\?lang=en"/);
  assert.match(html, /Personal Training Website V2/);
  assert.match(html, /React · Supabase · RLS/);
  assert.match(html, /Custom exercises/);
  assert.match(html, /RLS private history/);
  assert.match(html, /https:\/\/github\.com\/stevenjobs530-afk\/personal-training-website-v2/);
  assert.doesNotMatch(html, /personal-training-showcase/);
});

test("uses the supplied runner image and a compact AEP-to-personal-project gap", async () => {
  const [home, stylesheet] = await Promise.all([
    readFile(new URL("../app/portfolio-home.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    access(new URL("../public/backgrounds/personal-training-runner.png", import.meta.url)),
  ]);

  assert.match(home, /className="projects-content"/);
  assert.match(stylesheet, /\.projects-content\s*\{[^}]*gap:\s*24px;/s);
  assert.match(stylesheet, /\.fitness-project\s*\{[^}]*personal-training-runner\.png/s);
  assert.match(stylesheet, /\.project-photo-1\s*\{\s*background-position:\s*center 62%;\s*\}/);
  assert.match(stylesheet, /\.project-photo-2\s*\{[^}]*apple-park-card\.png/s);
  assert.match(stylesheet, /\.project-photo-2\s*\{\s*background-position:\s*center 35%;\s*\}/);
  assert.match(stylesheet, /background-size:\s*cover,\s*130% auto;/);
  await access(new URL("../public/backgrounds/apple-park-card.png", import.meta.url));
});

test("server-renders the complete English-only Personal Training project route", async () => {
  const response = await render("/personal-projects/personal-training?lang=en");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Personal Training — Zishun Gao<\/title>/);
  assert.match(html, /PERSONAL TRAINING WEBSITE V2 · INDEPENDENT FULL-STACK PROJECT/);
  assert.match(html, /A PERSONAL/);
  assert.match(html, /TRAINING LOG/);
  assert.match(html, /FOR STRENGTH AND/);
  assert.match(html, /CARDIO RECORDS/);
  assert.match(html, /A mobile-first personal project for recording user-named strength exercises and machines/);
  assert.match(html, /ocean-hero-720p\.mp4/);
  assert.match(html, /<video/);
  assert.match(html, /playsInline=""/);
  assert.doesNotMatch(html, /player\.vimeo\.com|1184061018/);
  assert.match(html, /Back to Portfolio/);
  assert.match(html, /\?lang=en#personal-training-project/);
  assert.match(html, /data-portfolio-back-link/);
  assert.match(html, /Personal Training project navigation/);
  assert.match(html, />Overview</);
  assert.match(html, />Motivation</);
  assert.match(html, />Custom Demo</);
  assert.match(html, />Training Models</);
  assert.match(html, />Progress</);
  assert.match(html, />Architecture</);
  assert.match(html, /WHY THE EXERCISE LIST IS USER DEFINED/);
  assert.match(html, /EDIT A FICTIONAL EXERCISE AND SESSION/);
  assert.match(html, /STRENGTH CARDIO AND REST DAY RECORDS/);
  assert.match(html, /TECHNICAL STRUCTURE AND CURRENT LIMITS/);
  assert.match(html, /Next\.js 16\.2\.9/);
  assert.match(html, /React 19\.2\.7/);
  assert.match(html, /owner-scoped RLS/i);
  assert.doesNotMatch(html, /登录|中文/);
});

test("normalizes any direct Personal Training language request to English", async () => {
  const response = await render("/personal-projects/personal-training?lang=zh");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /A PERSONAL/);
  assert.doesNotMatch(html, /切换|返回作品集|中文/);

  const component = await readFile(
    new URL("../app/personal-projects/personal-training/personal-training-hero.tsx", import.meta.url),
    "utf8",
  );
  assert.match(component, /searchParams\.set\("lang", "en"\)/);
  assert.match(component, /history\.replaceState/);
});

test("keeps the project interaction and demo privacy boundaries explicit", async () => {
  const [component, demo, stylesheet] = await Promise.all([
    readFile(new URL("../app/personal-projects/personal-training/personal-training-hero.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/personal-projects/personal-training/strength-demo.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/personal-projects/personal-training/personal-training.module.css", import.meta.url), "utf8"),
  ]);

  assert.match(component, /function ProjectNavigation/);
  assert.match(component, /className=\{styles\.sectionNavigation\}/);
  assert.match(component, /className=\{styles\.heroMedia\}/);
  assert.match(component, /Overview/);
  assert.match(component, /Motivation/);
  assert.match(component, /Custom Demo/);
  assert.match(component, /Training Models/);
  assert.match(component, /Progress/);
  assert.match(component, /Architecture/);
  assert.match(component, /TRY THE DEMO/);
  assert.match(component, /SEE THE MODEL/);
  assert.match(component, /READ THE TREND/);
  assert.match(component, /event\.key === "Escape"/);
  assert.match(component, /scrollIntoView/);
  assert.match(component, /HERO_PLAYBACK_TIMEOUT_MS = 2500/);
  assert.match(component, /video\.paused \|\| video\.currentTime < 0\.1/);
  assert.match(component, /video\.readyState >= HTMLMediaElement\.HAVE_CURRENT_DATA/);
  assert.match(component, /if \(video\?\.error\) video\.load\(\)/);
  assert.match(component, /Play animation/);
  assert.match(component, /\n\s+autoPlay\n/);
  assert.match(component, /preload=\{prefersReducedMotion \? "none" : "auto"\}/);
  assert.match(component, /document\.addEventListener\("visibilitychange", handleVisibilityChange\)/);
  assert.match(component, /window\.addEventListener\("pageshow", handlePageShow\)/);
  assert.doesNotMatch(component, /@vimeo\/player|player\.vimeo\.com|1184061018/);
  assert.doesNotMatch(component, /app-uploads\.krea\.ai/);
  assert.match(component, /video\/training-strength\.mp4/);
  assert.match(component, /posters\/training-progress\.jpg/);
  assert.match(component, /intersectionRatio >= 0\.55/);
  assert.match(component, /poster=\{item\.poster\}/);
  assert.doesNotMatch(component, /RippleField|StaggeredMenu|feDisplacementMap|from "gsap"/);
  assert.match(demo, /useReducer/);
  assert.match(demo, /Studio Cable Row — Demo/);
  assert.match(demo, /Nothing is saved/);
  assert.match(demo, /Refreshing this page resets the demo/);
  assert.doesNotMatch(demo, /\bfetch\s*\(|localStorage|sessionStorage|document\.cookie|supabase/i);
  assert.match(stylesheet, /prefers-reduced-motion: reduce/);
  assert.match(stylesheet, /height:\s*100svh/);
  assert.match(stylesheet, /overflow-x:\s*clip/);
  assert.match(stylesheet, /background:\s*var\(--paper,\s*#f0ece4\)/);
  assert.match(stylesheet, /\.heroMedia\s*\{[\s\S]*border-radius:\s*28px/s);
  assert.match(stylesheet, /\.heroMedia\[data-video-state="playing"\] \.backgroundVideo\s*\{[^}]*opacity:\s*1/s);
  assert.match(stylesheet, /\.videoPlayFallback\s*\{[^}]*position:\s*absolute[^}]*z-index:\s*3/s);
  assert.match(stylesheet, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*\.backgroundVideo,[\s\S]*\.videoPlayFallback\s*\{\s*display:\s*none;/s);
  assert.match(stylesheet, /\.story\s*\{[\s\S]*gap:\s*32px;[\s\S]*background:\s*var\(--paper,\s*#f0ece4\)/s);
  assert.match(stylesheet, /\.storySection::before[\s\S]*background-image:\s*var\(--story-section-image\)[\s\S]*background-attachment:\s*scroll[\s\S]*filter:\s*var\(--story-section-filter,\s*none\)/s);
  assert.match(stylesheet, /\.motivationSection\s*\{[^}]*--story-section-filter:\s*brightness\(1\.14\) saturate\(1\.06\)/s);
  assert.match(stylesheet, /\.customisationSection\s*\{[^}]*--story-section-filter:\s*brightness\(1\.14\) saturate\(1\.05\)/s);
  assert.match(stylesheet, /\.modelsSection\s*\{[^}]*--story-section-filter:\s*brightness\(1\.14\) saturate\(1\.06\)/s);
  assert.match(stylesheet, /\.architectureSection\s*\{[^}]*--story-section-filter:\s*brightness\(1\.24\) saturate\(1\.08\)/s);
  assert.match(stylesheet, /@media \(max-width:\s*760px\)[\s\S]*\.motivationSection\s*\{[^}]*0\.56[\s\S]*\.architectureSection\s*\{[^}]*0\.58/s);
  assert.match(stylesheet, /personal-training-motivation\.webp/);
  assert.match(stylesheet, /personal-training-custom-demo\.webp/);
  assert.match(stylesheet, /personal-training-models\.webp/);
  assert.match(stylesheet, /personal-training-architecture\.webp/);
  const heroVideo = new URL("../public/personal-projects/personal-training/video/ocean-hero-720p.mp4", import.meta.url);
  await Promise.all([
    access(new URL("../public/personal-projects/personal-training/backgrounds/personal-training-motivation.webp", import.meta.url)),
    access(new URL("../public/personal-projects/personal-training/backgrounds/personal-training-custom-demo.webp", import.meta.url)),
    access(new URL("../public/personal-projects/personal-training/backgrounds/personal-training-models.webp", import.meta.url)),
    access(new URL("../public/personal-projects/personal-training/backgrounds/personal-training-architecture.webp", import.meta.url)),
    access(heroVideo),
  ]);
  const heroVideoStats = await stat(heroVideo);
  assert.ok(heroVideoStats.size >= 3_700_000 && heroVideoStats.size <= 3_800_000);
  assert.match(stylesheet, /@media \(max-width:\s*760px\)[\s\S]*\.heroTitle\s*\{[^}]*line-height:\s*0\.88/s);
});

test("server-renders the complete English portfolio homepage by default", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /<title>Zishun Gao — Personal Portfolio<\/title>/);
  assert.match(html, /Hello, I/);
  assert.match(html, />Education</);
  assert.match(html, />Honours</);
  assert.match(html, /Selected projects/);
  assert.match(html, /How I organise/);
  assert.match(html, /Work experience in/);
  assert.match(html, /Get in touch/);
  assert.match(html, /Switch to Chinese/);
  assert.doesNotMatch(html, /Vertex Sci|deep-structure research lab/i);
});

test("hydrates the static portfolio homepage from the requested Chinese language", async () => {
  const response = await render("/?lang=zh");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /<title>Zishun Gao — Personal Portfolio<\/title>/);

  const component = await readFile(new URL("../app/portfolio-home.tsx", import.meta.url), "utf8");
  assert.match(component, /金融 风险 数据分析与应用研究/);
  assert.match(component, /教育与/);
  assert.match(component, /荣誉与/);
  assert.match(component, /项目案例/);
  assert.match(component, /切换至英文/);
  assert.match(component, /requestedLanguage/);
  assert.match(component, /高子舜 — 个人作品集/);
});

test("keeps the homepage language state and honours interaction explicit", async () => {
  const [home, honours, stylesheet] = await Promise.all([
    readFile(new URL("../app/portfolio-home.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/honours-exhibition.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(home, /document\.documentElement\.lang/);
  assert.match(home, /window\.history\.replaceState/);
  assert.match(home, /personal-language-toggle/);
  assert.match(home, /\["education", "Education", "Study"\]/);
  assert.match(home, /\["ai-workflow", "AI workflow", "AI"\]/);
  assert.match(home, /personal-nav-label-compact/);
  assert.match(home, /aria-label=\{title\}/);
  assert.match(honours, /prefers-reduced-motion: reduce/);
  assert.match(honours, /onPointerDown=\{handleGalleryPointerDown\}/);
  assert.match(honours, /showModal\(\)/);
  assert.match(honours, /Drag to explore/);
  assert.match(honours, /setHasExploredGallery\(true\)/);
  assert.match(honours, /\}, \[language, honours\.length\]\);/);
  assert.match(stylesheet, /personal-language-toggle/);
  assert.match(stylesheet, /main\[lang="en"\] \.personal-nav-label-full\s*\{[^}]*display:\s*none/s);
  assert.match(stylesheet, /main\[lang="en"\] \.personal-nav-label-compact\s*\{[^}]*display:\s*inline/s);
  assert.match(stylesheet, /@media \(max-width:\s*400px\)[\s\S]*main\[lang="en"\] \.personal-brand\s*\{[^}]*display:\s*none/s);
  assert.match(stylesheet, /@media \(max-width:\s*340px\)[\s\S]*main\[lang="en"\] \.personal-nav-link\s*\{[^}]*font-size:\s*9px/s);
  assert.match(stylesheet, /--honour-active-card-width:\s*105%/);
  assert.match(stylesheet, /0\.93\s*\/\s*1\.05\s*=\s*0\.886/);
  assert.match(stylesheet, /mask-image:\s*linear-gradient\(90deg/);
  assert.match(stylesheet, /\.framework-section\s*\{[^}]*margin-top:\s*0;/s);
  assert.match(stylesheet, /\.section-blend\s*\{[^}]*height:\s*1px;/s);
  assert.match(stylesheet, /\.image-backed-section::after\s*\{\s*content:\s*none;/s);
  assert.match(stylesheet, /\.honour-explore-hint[\s\S]*pointer-events:\s*none/);
  assert.match(stylesheet, /\.honours-photo \.framework-heading\s*\{[^}]*align-items:\s*center;[^}]*text-align:\s*center;/s);
  assert.match(stylesheet, /\.honours-carousel\s*\{[^}]*width:\s*100%;[^}]*margin-inline:\s*auto;/s);
  assert.match(stylesheet, /\.honour-meta\s*\{[^}]*flex-direction:\s*column;[^}]*align-items:\s*center;[^}]*text-align:\s*center;/s);
  assert.match(stylesheet, /@media \(max-width: 768px\)/);
  assert.match(stylesheet, /@media \(prefers-reduced-motion: reduce\)/);
});

test("server-renders the redesigned English AEP case study", async () => {
  const response = await render("/case-studies/early-career-wellbeing?lang=en");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Early-Career Wellbeing Questionnaire — Zishun Gao<\/title>/i);
  assert.match(html, /A questionnaire on the transition from education to employment/);
  assert.match(html, /Research scope and boundaries/);
  assert.match(html, /participant routes/);
  assert.match(html, /guided stages/);
  assert.match(html, /RLS/);
  assert.match(html, /The project combines questionnaire design with documented data safeguards/);
  assert.match(html, /AEP-Workplace-Wellbeing-Questionnaire-Formal/);
  assert.match(html, /\?lang=en#project-early-career-wellbeing/);
  assert.match(html, /data-portfolio-back-link/);
  assert.match(html, />Back to Portfolio<\/span>/);
  assert.doesNotMatch(html, />AEP Research</);
  assert.doesNotMatch(html, /portfolio-v3-public|Next case/i);
});

test("hydrates the static AEP route from the requested Chinese language", async () => {
  const response = await render("/case-studies/early-career-wellbeing?lang=zh");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /<title>Early-Career Wellbeing Questionnaire — Zishun Gao<\/title>/);

  const component = await readFile(
    new URL("../app/case-studies/early-career-wellbeing/aep-case-study.tsx", import.meta.url),
    "utf8",
  );
  assert.match(component, /一份关于从教育走向就业经历的问卷/);
  assert.match(component, /三条路径让不同参与者看到与自身情况相关的问题/);
  assert.match(component, /requestedLanguage/);
  assert.match(component, /AEP 职场新人福祉问卷 — 高子舜/);
});

test("uses one persistent Back to Portfolio control across every detail route", async () => {
  const [shared, sharedStyles, ukRetail, apple, aep, aiWorkflow, personalTraining, personalTrainingStyles, home, homeStyles] = await Promise.all([
    readFile(new URL("../app/components/portfolio-back-link.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/portfolio-back-link.module.css", import.meta.url), "utf8"),
    readFile(new URL("../app/case-studies/uk-retail/uk-retail-case-study.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/case-studies/apple-app-store/apple-case-study.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/case-studies/early-career-wellbeing/aep-case-study.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/case-studies/ai-assisted-job-workflow/ai-workflow-concept.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/personal-projects/personal-training/personal-training-hero.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/personal-projects/personal-training/personal-training.module.css", import.meta.url), "utf8"),
    readFile(new URL("../app/portfolio-home.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(shared, /language === "zh" \? "返回作品集" : "Back to Portfolio"/);
  assert.match(shared, /<ArrowLeft aria-hidden="true" \/>/);
  assert.match(shared, /data-portfolio-back-link/);
  assert.match(sharedStyles, /position:\s*fixed;/);
  assert.match(sharedStyles, /z-index:\s*95;/);
  assert.match(sharedStyles, /min-height:\s*54px;/);
  assert.match(sharedStyles, /@media \(max-width:\s*760px\)[\s\S]*min-height:\s*48px;/);
  assert.match(sharedStyles, /prefers-reduced-motion:\s*reduce/);

  for (const component of [ukRetail, apple, aep, aiWorkflow, personalTraining]) {
    assert.match(component, /<PortfolioBackLink/);
  }

  assert.doesNotMatch(ukRetail, /className="uk-retail-brand"|<Link href=\{portfolioHref\}>\{t\.portfolio\}<\/Link>/);
  assert.doesNotMatch(apple, /className="apple-brand|<Link href=\{portfolioHref\}>\{t\.portfolio\}<\/Link>/);
  assert.doesNotMatch(aep, /className="aep-back|<Link href=\{portfolioHref\}>\{t\.portfolio\}<\/Link>/);
  assert.doesNotMatch(aiWorkflow, /className="ai-concept-brand|<Link href=\{portfolioHref\}>\{t\.portfolio\}<\/Link>/);
  assert.doesNotMatch(personalTraining, /styles\.backLink|styles\.brandMark|styles\.brandCopy/);
  assert.match(personalTrainingStyles, /\.fleetOverlay\s*\{[^}]*z-index:\s*100;/s);

  assert.match(home, /id="personal-training-project" tabIndex=\{-1\}/);
  assert.match(home, /id="ai-workflow" tabIndex=\{-1\}/);
  assert.match(home, /targetId !== "ai-workflow"/);
  assert.match(homeStyles, /\.project-framework,[\s\S]*\.fitness-project,[\s\S]*\.ai-workflow-feature\s*\{[^}]*scroll-margin-top:\s*96px;/s);
});

test("keeps AEP motion preferences and local navigation explicit", async () => {
  const [component, stylesheet, home, shared] = await Promise.all([
    readFile(new URL("../app/case-studies/early-career-wellbeing/aep-case-study.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/case-studies/early-career-wellbeing/aep-case-study.scss", import.meta.url), "utf8"),
    readFile(new URL("../app/portfolio-home.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/resilient-background-video.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(component, /<ResilientBackgroundVideo/);
  assert.match(shared, /prefers-reduced-motion: reduce/);
  assert.match(component, /\?lang=\$\{language\}#project-early-career-wellbeing/);
  assert.match(component, /aep-hero-video/);
  assert.doesNotMatch(component, /portfolio-v3-public/i);
  assert.match(stylesheet, /max-width:\s*580px.+max-height:\s*720px/s);
  assert.match(stylesheet, /prefers-reduced-motion:\s*reduce/);
  assert.doesNotMatch(stylesheet, /mask-image:\s*linear-gradient\(to bottom/);
  assert.match(stylesheet, /\.aep-page\[lang="en"\] \.aep-heading h2,[\s\S]*font-family:\s*"Newsreader"[^}]*letter-spacing:\s*-0\.015em;[^}]*line-height:\s*1\.06;/s);
  assert.match(stylesheet, /\.aep-page\[lang="en"\] \.aep-purpose-grid aside p\s*\{[^}]*font-family:\s*"Newsreader"[^}]*letter-spacing:\s*0;[^}]*line-height:\s*1\.18;/s);
  assert.match(stylesheet, /\.aep-page\[lang="zh-CN"\] \.aep-hero-copy h1,[\s\S]*font-family:\s*"Inter"[^}]*letter-spacing:\s*-0\.025em;[^}]*line-height:\s*1\.12;/s);
  assert.match(home, /slug: "early-career-wellbeing"/);
});

test("keeps Apple motion preferences and local navigation explicit", async () => {
  const [component, stylesheet, home, shared] = await Promise.all([
    readFile(new URL("../app/case-studies/apple-app-store/apple-case-study.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/case-studies/apple-app-store/apple-case-study.scss", import.meta.url), "utf8"),
    readFile(new URL("../app/portfolio-home.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/resilient-background-video.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(component, /<ResilientBackgroundVideo/);
  assert.match(shared, /prefers-reduced-motion: reduce/);
  assert.match(component, /\?lang=\$\{language\}#project-apple-app-store/);
  assert.match(component, /apple-construction-grid\.png[^>]+unoptimized/);
  assert.match(component, /View repository/);
  assert.match(component, /aria-expanded=\{isActive\}/);
  assert.match(component, /event\.key === "Enter" \|\| event\.key === " "/);
  assert.match(component, /onKeyDown=\{\(event\) => \{/);
  assert.doesNotMatch(component, /portfolio-v3-public|early-career-wellbeing/i);
  assert.match(stylesheet, /apple-hero-video/);
  assert.match(stylesheet, /max-width:\s*580px.+max-height:\s*720px/s);
  assert.match(stylesheet, /prefers-reduced-motion:\s*reduce/);
  assert.doesNotMatch(stylesheet, /height:\s*(?:92|96|100)px;\s*background:\s*linear-gradient\(180deg/s);
  assert.match(home, /slug: "apple-app-store"/);
});
