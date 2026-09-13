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

type NavigationProbe = {
  sequence: Array<string | null>;
  horizontalCalls: Array<number | null>;
  last: string | null;
  observer?: MutationObserver;
};

async function installNavigationProbe(page: Page) {
  await page.evaluate(() => {
    const scopedWindow = window as typeof window & { __navigationProbe?: NavigationProbe };
    const container = document.querySelector<HTMLElement>(".personal-nav-items");
    if (!container) throw new Error("Navigation items container not found");
    scopedWindow.__navigationProbe?.observer?.disconnect();

    const readCurrent = () => document.querySelector<HTMLElement>(".personal-nav-link[aria-current='location']")?.getAttribute("aria-label") ?? null;
    const probe: NavigationProbe = { sequence: [], horizontalCalls: [], last: readCurrent() };
    const observer = new MutationObserver(() => {
      const current = readCurrent();
      if (current === probe.last) return;
      probe.last = current;
      probe.sequence.push(current);
    });
    observer.observe(container, { subtree: true, attributes: true, attributeFilter: ["aria-current"] });
    probe.observer = observer;

    const originalScrollTo = container.scrollTo.bind(container);
    Object.defineProperty(container, "scrollTo", {
      configurable: true,
      value: (options?: ScrollToOptions | number, y?: number) => {
        probe.horizontalCalls.push(typeof options === "number" ? options : options?.left ?? null);
        if (typeof options === "number") originalScrollTo(options, y ?? 0);
        else originalScrollTo(options);
      },
    });
    scopedWindow.__navigationProbe = probe;
  });
}

async function resetNavigationProbe(page: Page) {
  await page.evaluate(() => {
    const scopedWindow = window as typeof window & { __navigationProbe?: NavigationProbe };
    const probe = scopedWindow.__navigationProbe;
    if (!probe) throw new Error("Navigation probe not installed");
    probe.sequence = [];
    probe.horizontalCalls = [];
    probe.last = document.querySelector<HTMLElement>(".personal-nav-link[aria-current='location']")?.getAttribute("aria-label") ?? null;
  });
}

async function readNavigationProbe(page: Page) {
  return page.evaluate(() => {
    const scopedWindow = window as typeof window & { __navigationProbe?: NavigationProbe };
    const probe = scopedWindow.__navigationProbe;
    return probe ? { sequence: probe.sequence, horizontalCalls: probe.horizontalCalls } : null;
  });
}

async function expectNavigationTargetReached(page: Page, id: string) {
  await expect.poll(() => page.evaluate((targetId) => {
    const target = document.getElementById(targetId);
    if (!target) return false;
    const referenceY = Math.min(180, Math.max(112, window.innerHeight * 0.2));
    const rect = target.getBoundingClientRect();
    const atPageEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
    return (rect.top <= referenceY && rect.bottom > referenceY) || (targetId === "contact" && atPageEnd);
  }, id)).toBe(true);
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

            if (name === "home" && [390, 768, 1440].includes(viewport.width)) {
              for (const sectionId of ["education", "honours", "projects", "method", "experience"]) {
                await expectHorizontallyCentered(
                  page,
                  `#${sectionId} .framework-heading h2`,
                  `#${sectionId} .framework-heading`,
                );
                await expectNoIntersection(
                  page,
                  `#${sectionId} .framework-kicker`,
                  `#${sectionId} .framework-heading h2`,
                );
              }
            }

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

    const projects = page.getByRole("link", { includeHidden: true, name: "Projects", exact: true });
    await projects.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#projects$/);
    await expect(projects).toHaveAttribute("aria-current", "location");

    const contact = page.getByRole("link", { includeHidden: true, name: "Contact", exact: true });
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

  test("mobile menu reveals all links, closes after navigation and returns focus on Escape", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await openReady(page, "/", "en");
    const toggle = page.locator(".personal-menu-toggle");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByRole("link", { includeHidden: true, name: "Contact", exact: true })).toBeHidden();
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    for (const link of await page.locator(".personal-nav-link").all()) await expect(link).toBeVisible();
    await expectInsideViewport(page, [".personal-nav-link"]);
    await page.getByRole("link", { includeHidden: true, name: "Contact", exact: true }).click();
    await expect(page).toHaveURL(/#contact$/);
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await toggle.click();
    await page.getByRole("link", { includeHidden: true, name: "Projects", exact: true }).focus();
    await page.keyboard.press("Escape");
    await expect(toggle).toBeFocused();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  test("phone project text, AEP metrics and retail controls do not collide", async ({ page }) => {
    for (const viewport of [{ width: 320, height: 568 }, { width: 375, height: 812 }, { width: 390, height: 844 }, { width: 430, height: 932 }]) {
      await page.setViewportSize(viewport);
      for (const language of ["en", "zh"] as const) {
        await openReady(page, "/", language);
        const overflow = await page.locator(".project-copy h3, .project-description").evaluateAll(elements =>
          elements.filter(e => e.scrollWidth > e.clientWidth + 1).map(e => e.textContent));
        expect(overflow).toEqual([]);
        await expectNoRootOverflow(page);
        await openReady(page, "/case-studies/early-career-wellbeing/", language);
        await expectNoIntersection(page, ".aep-hero-copy", ".aep-metrics");
        const metricsSpacing = await page.evaluate(() => {
          const copy = document.querySelector(".aep-hero-copy")!.getBoundingClientRect();
          const metrics = document.querySelector(".aep-metrics")!.getBoundingClientRect();
          return { gap: metrics.top - copy.bottom, left: metrics.left, right: innerWidth - metrics.right };
        });
        expect(metricsSpacing.gap).toBeGreaterThanOrEqual(24);
        expect(metricsSpacing.left).toBeGreaterThanOrEqual(16);
        expect(metricsSpacing.right).toBeGreaterThanOrEqual(16);
        await expectNoRootOverflow(page);
        await openReady(page, "/case-studies/uk-retail/", language);
        await expectNoIntersection(page, "[data-portfolio-back-link]", ".uk-retail-mobile-language");
        await expectNoIntersection(page, "[data-portfolio-back-link]", ".uk-retail-nav-cta");
        await expectNoRootOverflow(page);
      }
    }
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

  test("programmatic section jumps keep one aria-current owner and one final horizontal alignment", async ({ page }) => {
    const viewports = [{ width: 390, height: 844 }, { width: 956, height: 440 }] as const;

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      for (const language of ["en", "zh"] as const) {
        await test.step(`${viewport.width}x${viewport.height} ${language}`, async () => {
          await openReady(page, "/", language);
          await installNavigationProbe(page);
          const labels = language === "en"
            ? { contact: "Contact", projects: "Projects", ai: "AI workflow", method: "Method" }
            : { contact: "联系", projects: "项目", ai: "AI 工作流", method: "方法" };

          for (const [id, label] of [["contact", labels.contact], ["projects", labels.projects], ["ai-workflow", labels.ai], ["method", labels.method]] as const) {
            await resetNavigationProbe(page);
            const link = page.getByRole("link", { includeHidden: true, name: label, exact: true });
            if (viewport.width <= 768) await page.locator(".personal-menu-toggle").click();
            await link.click();
            await expect(page).toHaveURL(new RegExp(`#${id}$`));
            await expect(link).toHaveAttribute("aria-current", "location");
            await expectNavigationTargetReached(page, id);
            await page.waitForTimeout(220);

            const probe = await readNavigationProbe(page);
            expect(probe).not.toBeNull();
            expect(probe?.sequence.filter((value) => value !== null)).toEqual([label]);
            expect(probe?.horizontalCalls.length ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(1);
          }
          await expectNoRootOverflow(page);
        });
      }
    }
  });

  test("direct hashes, hashchange, history and keyboard activation keep the requested target", async ({ page }) => {
    const viewports = [{ width: 390, height: 844 }, { width: 956, height: 440 }] as const;

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      for (const language of ["en", "zh"] as const) {
        const labels = language === "en"
          ? { contact: "Contact", projects: "Projects", method: "Method" }
          : { contact: "联系", projects: "项目", method: "方法" };
        await test.step(`${viewport.width}x${viewport.height} ${language}`, async () => {
          await page.goto(`/?lang=${language}#contact`, { waitUntil: "domcontentloaded" });
          await expect(page.getByRole("link", { includeHidden: true, name: labels.contact, exact: true })).toHaveAttribute("aria-current", "location");
          await expectNavigationTargetReached(page, "contact");

          await page.goto(`/?lang=${language}`, { waitUntil: "domcontentloaded" });
          const contact = page.getByRole("link", { includeHidden: true, name: labels.contact, exact: true });
          if (viewport.width <= 768) await page.locator(".personal-menu-toggle").click();
          await contact.focus();
          await page.keyboard.press("Enter");
          await expect(page).toHaveURL(/#contact$/);
          await expectNavigationTargetReached(page, "contact");

          const projects = page.getByRole("link", { includeHidden: true, name: labels.projects, exact: true });
          if (viewport.width <= 768) await page.locator(".personal-menu-toggle").click();
          await projects.click();
          await expectNavigationTargetReached(page, "projects");
          await page.goBack();
          await expect(page).toHaveURL(/#contact$/);
          await expect(contact).toHaveAttribute("aria-current", "location");
          await expectNavigationTargetReached(page, "contact");
          await page.goForward();
          await expect(page).toHaveURL(/#projects$/);
          await expect(projects).toHaveAttribute("aria-current", "location");
          await expectNavigationTargetReached(page, "projects");

          await page.evaluate(() => { window.location.hash = "method"; });
          await expect(page).toHaveURL(/#method$/);
          await expect(page.getByRole("link", { includeHidden: true, name: labels.method, exact: true })).toHaveAttribute("aria-current", "location");
          await expectNavigationTargetReached(page, "method");
        });
      }
    }
  });

  test("manual section scrolling still hands control to the observer scroll spy", async ({ page }) => {
    await page.setViewportSize({ width: 956, height: 440 });
    for (const language of ["en", "zh"] as const) {
      await openReady(page, "/", language);
      for (const id of ["education", "honours", "projects", "ai-workflow", "method", "experience", "contact"] as const) {
        await page.evaluate((targetId) => {
          const previous = document.documentElement.style.scrollBehavior;
          document.documentElement.style.scrollBehavior = "auto";
          document.getElementById(targetId)?.scrollIntoView({ block: "start", behavior: "auto" });
          document.documentElement.style.scrollBehavior = previous;
        }, id);
        await expect(page.locator(`.personal-nav-link[href="#${id}"]`)).toHaveAttribute("aria-current", "location");
      }
    }
  });

  test("reduced motion keeps target locking while using immediate scrolling", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 956, height: 440 });
    await openReady(page, "/", "en");
    await installNavigationProbe(page);
    await resetNavigationProbe(page);
    await page.getByRole("link", { includeHidden: true, name: "Contact", exact: true }).click();
    await expectNavigationTargetReached(page, "contact");
    await expect(page.locator("html")).toHaveCSS("scroll-behavior", "auto");
    const probe = await readNavigationProbe(page);
    expect(probe?.sequence.filter((value) => value !== null)).toEqual(["Contact"]);
  });
});
