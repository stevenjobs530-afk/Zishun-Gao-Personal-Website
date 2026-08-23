import { expect, test, type Page } from "@playwright/test";

const VIEWPORTS = [
  { width: 390, height: 844 },
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

async function expectHorizontallyCentered(page: Page, elementSelector: string, containerSelector: string) {
  const alignment = await page.evaluate(
    ([targetSelector, parentSelector]) => {
      const element = document.querySelector<HTMLElement>(targetSelector);
      const container = document.querySelector<HTMLElement>(parentSelector);
      if (!element || !container) return null;

      const elementRect = element.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      return {
        offset:
          elementRect.left + elementRect.width / 2 -
          (containerRect.left + containerRect.width / 2),
      };
    },
    [elementSelector, containerSelector] as const,
  );

  expect(alignment).not.toBeNull();
  expect(Math.abs(alignment?.offset ?? Number.POSITIVE_INFINITY)).toBeLessThanOrEqual(2);
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
              await expectHorizontallyCentered(page, ".aep-routes > .aep-intro", ".aep-routes");
            }

            if (name === "apple") {
              await expectHorizontallyCentered(page, ".apple-question > .apple-question-copy", ".apple-question");
              await expectHorizontallyCentered(page, ".apple-uncertainty > .apple-intro", ".apple-uncertainty");
            }

            if (name === "ai-workflow") {
              const tableWrap = page.locator(".ai-concept-table-wrap");
              await expect(tableWrap).toBeVisible();
              expect(await tableWrap.evaluate((element) => getComputedStyle(element).overflowX)).toMatch(/auto|scroll/);
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

  test("homepage navigation supports keyboard, hashes, history and aria-current", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openReady(page, "/", "en");
    await expect(page.locator(".personal-nav-link[aria-current='location']")).toHaveCount(0);

    const projects = page.getByRole("link", { name: "Projects", exact: true });
    await projects.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#projects$/);
    await expect(projects).toHaveAttribute("aria-current", "location");

    const contact = page.getByRole("link", { name: "Contact", exact: true });
    await contact.click();
    await expect(page).toHaveURL(/#contact$/);
    await expect(contact).toHaveAttribute("aria-current", "location");

    await page.goBack();
    await expect(page).toHaveURL(/#projects$/);
    await expect(projects).toHaveAttribute("aria-current", "location");
    await page.goForward();
    await expect(page).toHaveURL(/#contact$/);
    await expect(contact).toHaveAttribute("aria-current", "location");

    await page.goto("/?lang=en#projects", { waitUntil: "domcontentloaded" });
    await expect(projects).toHaveAttribute("aria-current", "location");

    await page.goto("/?lang=en", { waitUntil: "domcontentloaded" });
    const chinese = page.getByRole("button", { name: "中文", exact: true });
    await chinese.focus();
    await page.keyboard.press("Space");
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
    await expect(page).toHaveURL(/lang=zh/);
  });

  test("mobile scroll spy keeps the active item inside the horizontal navigation viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/?lang=en#contact", { waitUntil: "domcontentloaded" });
    await expect(page.locator("main")).toBeVisible();
    const contact = page.getByRole("link", { name: "Contact", exact: true });
    await expect(contact).toHaveAttribute("aria-current", "location");

    await expect.poll(() => page.evaluate(() => {
      const container = document.querySelector<HTMLElement>(".personal-nav-items");
      const active = document.querySelector<HTMLElement>(".personal-nav-link[aria-current='location']");
      if (!container || !active) return null;
      const containerRect = container.getBoundingClientRect();
      const activeRect = active.getBoundingClientRect();
      return {
        inside: activeRect.left >= containerRect.left - 2 && activeRect.right <= containerRect.right + 2,
        rootOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    })).toEqual({ inside: true, rootOverflow: 0 });
  });

  test("homepage remains contained at 100, 150 and 200 percent zoom-equivalent viewports", async ({ page }) => {
    const zoomViewports = [
      { zoom: 100, width: 1440, height: 900 },
      { zoom: 150, width: 960, height: 600 },
      { zoom: 200, width: 720, height: 450 },
    ] as const;

    for (const viewport of zoomViewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      for (const language of ["en", "zh"] as const) {
        await test.step(`${viewport.zoom}% ${language}`, async () => {
          await openReady(page, "/", language);
          await expectNoRootOverflow(page);
          await expectInsideViewport(page, [".personal-brand", ".personal-nav-main", ".personal-hero-actions"]);
        });
      }
    }
  });
});
