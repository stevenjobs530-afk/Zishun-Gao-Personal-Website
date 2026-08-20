import type { Metadata } from "next";
import PersonalTrainingHero from "./personal-training-hero";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Personal Training — Zishun Gao",
  description: "A personal full-stack project for recording strength, cardio and rest-day sessions.",
};

export default function PersonalTrainingPage() {
  return <PersonalTrainingHero initialLanguage="en" />;
}
