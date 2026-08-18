import type { Metadata } from "next";
import PortfolioHome from "./portfolio-home";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Zishun Gao — Personal Portfolio",
  description:
    "Zishun Gao's personal portfolio across finance, economics, risk management, data analysis, applied research and responsible AI-assisted workflows.",
};

export default function HomePage() {
  return <PortfolioHome initialLanguage="en" />;
}
