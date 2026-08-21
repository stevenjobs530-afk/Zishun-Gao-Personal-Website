import { expect, test, type Page } from "@playwright/test";

const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 440, height: 900 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
  { width: 3840, height: 2160 },
] as const;

const ROUTES = [
  ["home", "/"],
  ["uk-retail", "/case-studies/uk-retail/"],
  ["apple", "/case-studies/apple-app-store/"],
  ["aep", "/case-studies/early-career-wellbeing/"],
  ["ai-workflow", "/case-studies/ai-assisted-job-workflow/"],
  ["personal-training", "/personal-projects/personal-training/"],
] as const;

async function openReady(page: Page, path: string, language: "en" | "zh") {
  await page.goto(`${path}?lang=${language}`, { waitUntil: "domcontentloaded" });
  await expect(page.locator("main")).toBeVisible();
  await page.evaluate(async () => document.fonts.ready);
  await expect(page.locator("html")).toHaveAttribute("lang", language === "zh" ? "zh-CN" : "en");
}

async function expectNoRootOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 2);
}

async function expectInsideViewport(page: Page, selectors: string[]) {
  const issues = await page.evaluate((targets) => {
    const viewportWidth = document.documentElement.clientWidth;
    return targets.flatMap((selector) =>
      [...document.querySelectorAll<HTMLElement>(selector)]
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
        })
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return {
            selector,
            text: element.textContent?.trim().replace(/\s+/g, " ").slice(0, 90),
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            viewportWidth,
          };
        })
        .filter(({ left, right }) => left < -2 || right > viewportWidth + 2),
    );
  }, selectors);
  expect(issues).toEqual([]);
}

async function expectNoIntersection(page: Page, first: string, second: string) {
  const intersection = await page.evaluate(
    ([firstSelector, secondSelector]) => {
      const firstElement = document.querySelector<HTMLElement>(firstSelector);
      const secondElement = document.querySelector<HTMLElement>(secondSelector);
      if (!firstElement || !secondElement) return null;
      const a = firstElement.getBoundingClientRect();
      const b = secondElement.getBoundingClientRect();
      return {
        width: Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)),
        height: Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)),
      };
    },
    [first, second] as const,
  );
  expect(intersection).not.toBeNull();
  expect((intersection?.width ?? 0) * (intersection?.height ?? 0)).toBe(0);
}

test.describe("bilingual cross-browser layout", () => {
  for (const viewport of VIEWPORTS) {
    test(`${viewport.width}x${viewport.height} keeps every core route contained`, async ({ page }) => {
      await page.setViewportSize(viewport);

      for (const [name, route] of ROUTES) {
        for (const language of ["en", "zh"] as const) {
          await test.step(`${name} ${language}`, async () => {
            await openReady(page, route, language);
            await expectNoRootOverflow(page);

            if (name === "uk-retail") {
              await expectInsideViewport(page, [
                "#overview h2",
                "#overview .uk-retail-overview-copy > p",
                ".uk-retail-code h2",
                ".uk-retail-output-intro h2",
              ]);
              await expectNoIntersection(page, "#overview .uk-retail-overview-copy > p", "#overview aside");
              await expectNoIntersection(page, ".uk-retail-code h2", ".uk-retail-code pre");
              if (language === "zh") {
                const wordBreak = await page.locator("#overview h2").evaluate((element) => getComputedStyle(element).wordBreak);
                expect(wordBreak).not.toBe("keep-all");
              }
            }

            if (name === "aep") {
              const codePanel = page.locator(".aep-code pre");
              await expect(codePanel).toBeVisible();
              await expectInsideViewport(page, [".aep-code pre"]);
              expect(await codePanel.evaluate((element) => getComputedStyle(element).overflowX)).toMatch(/auto|scroll/);
            }

            if (name === "ai-workflow") {
              const tableWrap = page.locator(".ai-concept-table-wrap");
              await expect(tableWrap).toBeVisible();
              expect(await tableWrap.evaluate((element) => getComputedStyle(element).overflowX)).toMatch(/auto|scroll/);
              const heroMedia = page.locator(".ai-concept-hero-media");
              const expectedPosition = viewport.width <= 700 ? "82% 50%" : "50% 50%";
              await expect(heroMedia.locator("video")).toHaveCSS("object-position", expectedPosition);
              await expect(heroMedia).toHaveCSS("background-position", expectedPosition);
            }

            if (name === "personal-training") {
              await expectInsideViewport(page, ["h1"]);
              const heroOpacity = await page.locator("h1").evaluate((element) => Number.parseFloat(getComputedStyle(element).opacity));
              expect(heroOpacity).toBeGreaterThan(0.9);
              const heroMedia = page.locator("[data-video-state][class*='heroMedia']");
              const mediaBackground = await heroMedia.evaluate((element) => getComputedStyle(element).backgroundImage);
              expect(mediaBackground).not.toBe("none");
              expect(await heroMedia.evaluate((element) => Number.parseFloat(getComputedStyle(element).opacity))).toBeGreaterThan(0.9);
              if (viewport.width <= 768) {
                const navigation = page.locator("[class*='sectionNavigation']");
                const languageToggle = navigation.locator("button");
                await expect(languageToggle).toBeVisible();
                const [navigationBox, toggleBox] = await Promise.all([navigation.boundingBox(), languageToggle.boundingBox()]);
                expect(navigationBox).not.toBeNull();
                expect(toggleBox).not.toBeNull();
                expect((toggleBox?.x ?? 0) + (toggleBox?.width ?? 0)).toBeLessThanOrEqual(
                  (navigationBox?.x ?? 0) + (navigationBox?.width ?? 0) + 2,
                );
                await navigation.evaluate((element) => { element.scrollLeft = element.scrollWidth; });
                const lastLink = navigation.locator("a").last();
                await expect(lastLink).toBeVisible();
                const [navBox, linkBox] = await Promise.all([navigation.boundingBox(), lastLink.boundingBox()]);
                expect(navBox).not.toBeNull();
                expect(linkBox).not.toBeNull();
                expect((linkBox?.x ?? 0) + (linkBox?.width ?? 0)).toBeLessThanOrEqual(
                  (navBox?.x ?? 0) + (navBox?.width ?? 0) + 2,
                );
              }
            }

            if (name === "home" && viewport.height >= 2000) {
              const gap = await page.evaluate(() => {
                const heading = document.querySelector<HTMLElement>("#education .framework-heading");
                const cards = document.querySelector<HTMLElement>("#education .education-layout");
                if (!heading || !cards) return null;
                return cards.getBoundingClientRect().top - heading.getBoundingClientRect().bottom;
              });
              expect(gap).not.toBeNull();
              expect(gap ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(180);
            }

            if (name === "home" && viewport.width <= 768) {
              const metricIssues = await page.locator(".experience-metrics > div").evaluateAll((rows) =>
                rows.flatMap((row) => {
                  const value = row.querySelector<HTMLElement>("dt");
                  const label = row.querySelector<HTMLElement>("dd");
                  if (!value || !label) return [{ reason: "missing metric content" }];
                  const valueRect = value.getBoundingClientRect();
                  const labelRect = label.getBoundingClientRect();
                  const valueStyle = getComputedStyle(value);
                  const lineHeight = Number.parseFloat(valueStyle.lineHeight);
                  const overlaps = Math.max(0, Math.min(valueRect.right, labelRect.right) - Math.max(valueRect.left, labelRect.left))
                    * Math.max(0, Math.min(valueRect.bottom, labelRect.bottom) - Math.max(valueRect.top, labelRect.top));
                  return valueRect.height <= lineHeight + 1 && overlaps === 0 && valueStyle.whiteSpace === "nowrap"
                    ? []
                    : [{ value: value.textContent?.trim(), height: valueRect.height, lineHeight, overlaps, whiteSpace: valueStyle.whiteSpace }];
                }),
              );
              expect(metricIssues).toEqual([]);
            }
          });
        }
      }
    });
  }

  test("Personal Training language switching preserves edited demo state", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openReady(page, "/personal-projects/personal-training/", "en");

    const exerciseName = page.getByLabel("Exercise or machine name");
    await exerciseName.fill("My bilingual demo exercise");
    await page.getByRole("button", { name: "Switch to Chinese" }).click();

    await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
    await expect(page).toHaveURL(/lang=zh/);
    await expect(page.getByLabel("动作或器械名称")).toHaveValue("My bilingual demo exercise");
    await expect(page.locator("[data-portfolio-back-link]")).toHaveAttribute("href", /lang=zh#personal-training-project/);
  });

  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    test(`Personal Training hero autoplays with ${reducedMotion} motion preference`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.emulateMedia({ reducedMotion });
      await openReady(page, "/personal-projects/personal-training/", "en");

      const heroMedia = page.locator("[data-video-state][class*='heroMedia']");
      const video = heroMedia.locator("video");
      await expect(video).toHaveAttribute("autoplay", "");
      await expect(video).toHaveAttribute("muted", "");
      await expect(video).toHaveAttribute("playsinline", "");
      await expect(video).not.toHaveCSS("display", "none");
      await expect(heroMedia).toHaveAttribute("data-video-state", "playing", { timeout: 10_000 });
      await expect.poll(() => video.evaluate((element) => (element as HTMLVideoElement).currentTime)).toBeGreaterThan(0);
    });
  }

  test("Personal Training keeps its poster stable when autoplay is rejected", async ({ page }) => {
    await page.route("**/ocean-hero-720p.mp4", (route) => route.abort());
    await page.addInitScript(() => {
      HTMLMediaElement.prototype.play = function play() {
        this.pause();
        return Promise.reject(new DOMException("Autoplay blocked", "NotAllowedError"));
      };
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await openReady(page, "/personal-projects/personal-training/", "en");

    const heroMedia = page.locator("[data-video-state][class*='heroMedia']");
    await expect(heroMedia).toHaveAttribute("data-video-state", "poster", { timeout: 10_000 });
    await page.locator("body").click({ position: { x: 8, y: 8 } });
    await page.waitForTimeout(250);
    await expect(heroMedia).toHaveAttribute("data-video-state", "poster");
    await expect(heroMedia).not.toHaveCSS("background-image", "none");
  });
});
