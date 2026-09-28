import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const ROUTES = [
  "/",
  "/case-studies/uk-retail/",
  "/case-studies/apple-app-store/",
  "/case-studies/early-career-wellbeing/",
  "/case-studies/ai-assisted-job-workflow/",
  "/personal-projects/personal-training/",
] as const;

async function openReady(page: Page, path: string, language: "en" | "zh") {
  await page.goto(`${path}?lang=${language}`, { waitUntil: "domcontentloaded" });
  await expect(page.locator("main")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", language === "zh" ? "zh-CN" : "en");
}

async function scrollThrough(page: Page) {
  // Render reveal/lazy content before auditing.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += innerHeight) {
      scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    scrollTo(0, 0);
  });
}

test.describe("accessibility and motion controls", () => {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    for (const language of ["en", "zh"] as const) {
      test(`has no WCAG 2 A/AA axe violations at ${viewport.width}px in ${language}`, async ({ page }) => {
        test.setTimeout(120_000);
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.setViewportSize(viewport);
        for (const route of ROUTES) {
          await openReady(page, route, language);
          await scrollThrough(page);
          const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
          const violations = results.violations.map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(" ")).join(", ")}`);
          expect(violations, `${route}?lang=${language}`).toEqual([]);
        }
      });
    }
  }

  test("background video pause control stops playback, updates its label and persists across pages", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openReady(page, "/case-studies/ai-assisted-job-workflow/", "en");
    const control = page.locator("[data-video-pause-control]");
    const video = page.locator(".ai-concept-hero-video");
    await expect(control).toHaveAttribute("aria-label", "Pause background video");
    await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(false);

    await control.focus();
    await page.keyboard.press("Enter");
    await expect(control).toHaveAttribute("aria-label", "Play background video");
    await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
    // A later click elsewhere must not restart a video the viewer paused.
    await page.mouse.click(700, 450);
    await page.waitForTimeout(300);
    expect(await video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);

    await openReady(page, "/case-studies/apple-app-store/", "zh");
    const appleControl = page.locator("[data-video-pause-control]");
    await expect(appleControl).toHaveAttribute("aria-label", "播放背景视频");
    expect(await page.locator(".apple-hero-video").evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);

    await appleControl.click();
    await expect(appleControl).toHaveAttribute("aria-label", "暂停背景视频");
    await expect.poll(() => page.locator(".apple-hero-video").evaluate((element: HTMLVideoElement) => element.paused)).toBe(false);
  });

  test("reduced motion hides pause controls because videos never play", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const route of ["/case-studies/early-career-wellbeing/", "/personal-projects/personal-training/"]) {
      await openReady(page, route, "en");
      await expect(page.locator("[data-video-pause-control]")).toHaveCount(0);
      for (const video of await page.locator("video").all()) {
        expect(await video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
      }
    }
  });

  test("Chinese document language, title and description are set before hydration", async ({ page }) => {
    // Block the app bundle so only the static HTML and its inline bootstrap run.
    await page.route(/\/assets\/.*\.js$/, (route) => route.abort());
    await page.goto("/case-studies/uk-retail/?lang=zh", { waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
    await expect(page).toHaveTitle("英国零售交易分析 — 高子舜");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /可追溯英国零售数据/);

    await page.goto("/?lang=en", { waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("removing a demo set keeps keyboard focus inside the demo", async ({ page }) => {
    await openReady(page, "/personal-projects/personal-training/", "en");
    const firstRemove = page.getByRole("button", { name: "Remove demo set 1" });
    await firstRemove.scrollIntoViewIfNeeded();
    await firstRemove.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("button", { name: "Remove demo set 1" })).toBeFocused();
    await page.keyboard.press("Enter");
    // With no sets left, focus lands on the add action.
    await expect(page.getByRole("button", { name: "Add demo set", exact: true })).toBeFocused();
  });

  test("Apple pipeline cards expose one button per step without nested headings", async ({ page }) => {
    await openReady(page, "/case-studies/apple-app-store/", "en");
    const triggers = page.locator(".apple-pipeline-trigger");
    await expect(triggers).toHaveCount(5);
    await expect(page.locator(".apple-pipeline-trigger :is(h1, h2, h3, h4, p, div)")).toHaveCount(0);
    await triggers.first().focus();
    await page.keyboard.press("Space");
    await expect(triggers.first()).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(triggers.first()).toHaveAttribute("aria-expanded", "false");
  });
});
