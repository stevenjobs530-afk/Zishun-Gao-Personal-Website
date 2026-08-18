import type { Metadata } from "next";
import UkRetailCaseStudy from "./uk-retail-case-study";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "UK Retail Transactions — Zishun Gao",
  description:
    "A traceable UK retail data-cleaning and analysis case study built with SQL and Python.",
};

export default function UkRetailPage() {
  return <UkRetailCaseStudy initialLanguage="en" />;
}
