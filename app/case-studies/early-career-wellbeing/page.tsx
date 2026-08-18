import type { Metadata } from "next";
import AepCaseStudy from "./aep-case-study";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Early-Career Wellbeing Questionnaire — Zishun Gao",
  description:
    "An AEP questionnaire project covering early-career wellbeing, participant routing, server-side validation and protected research data.",
};

export default function EarlyCareerWellbeingPage() {
  return <AepCaseStudy initialLanguage="en" />;
}
