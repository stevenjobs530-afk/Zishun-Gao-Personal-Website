import type { Metadata } from "next";
import AiWorkflowConcept from "./ai-workflow-concept";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "AI-Assisted Job Workflow Concept — Zishun Gao",
  description:
    "A human-controlled workflow concept for discovering, validating, comparing and tracking UK early-career opportunities with AI assistance.",
};

export default function AiAssistedJobWorkflowPage() {
  return <AiWorkflowConcept initialLanguage="en" />;
}
