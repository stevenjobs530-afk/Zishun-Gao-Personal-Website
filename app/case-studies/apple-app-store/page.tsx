import type { Metadata } from "next";
import AppleCaseStudy from "./apple-case-study";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Apple App Store Data Analysis — Zishun Gao",
  description:
    "A documented Python and SQLite workflow for cleaning and analysing a historical Apple App Store dataset.",
};

export default function AppleAppStorePage() {
  return <AppleCaseStudy initialLanguage="en" />;
}
