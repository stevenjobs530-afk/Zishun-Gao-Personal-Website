import type { Metadata } from "next";
import { aepResearchContent } from "./aep-research-content";
import AepCaseStudy from "./aep-case-study";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: `${aepResearchContent.en.title} — Zishun Gao`,
  description: aepResearchContent.en.description,
  openGraph: {
    title: aepResearchContent.en.title,
    description: aepResearchContent.en.description,
    type: "article",
  },
  twitter: {
    card: "summary",
    title: aepResearchContent.en.title,
    description: aepResearchContent.en.description,
  },
};

export default function EarlyCareerWellbeingPage() {
  return <AepCaseStudy initialLanguage="en" />;
}
