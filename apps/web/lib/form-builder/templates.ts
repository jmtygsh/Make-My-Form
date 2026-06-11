// apps/web/lib/form-builder/templates.ts
import type { Block } from "./schema";
import { createBlock, newOption } from "./field-config";

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  /** Factory → fresh block instances on every use. */
  build: () => Block[];
}

/** Quick helper: a configured block of `type` with overrides. */
function block(
  type: Parameters<typeof createBlock>[0],
  patch: Record<string, unknown> = {},
): Block {
  return { ...createBlock(type), ...patch } as Block;
}

export const TEMPLATES: FormTemplate[] = [
  {
    id: "contact",
    name: "Contact form",
    description: "Name, email and message — the essentials.",
    category: "General",
    build: () => [
      block("heading_2", { content: "Contact us" }),
      block("short_answer", { label: "Your name", required: true }),
      block("email", { label: "Email address", required: true }),
      block("long_answer", { label: "Message", required: true }),
    ],
  },
  {
    id: "feedback",
    name: "Customer feedback",
    description: "Rating + open feedback to learn what users think.",
    category: "Feedback",
    build: () => [
      block("heading_2", { content: "We value your feedback" }),
      block("rating", { label: "How would you rate us?", required: true }),
      block("long_answer", { label: "What can we improve?" }),
      block("email", { label: "Email (optional)" }),
    ],
  },
  {
    id: "rsvp",
    name: "Event RSVP",
    description: "Collect attendance and guest details.",
    category: "Events",
    build: () => [
      block("heading_2", { content: "RSVP" }),
      block("short_answer", { label: "Full name", required: true }),
      block("multiple_choice", {
        label: "Will you attend?",
        required: true,
        options: [newOption("Yes"), newOption("No"), newOption("Maybe")],
      }),
      block("number", { label: "Number of guests" }),
    ],
  },
  {
    id: "job-application",
    name: "Job application",
    description: "Candidate details, role and resume link.",
    category: "HR",
    build: () => [
      block("heading_2", { content: "Job application" }),
      block("short_answer", { label: "Full name", required: true }),
      block("email", { label: "Email", required: true }),
      block("phone", { label: "Phone" }),
      block("dropdown", {
        label: "Position",
        required: true,
        options: [newOption("Engineer"), newOption("Designer"), newOption("Product")],
      }),
      block("link", { label: "Resume / portfolio URL" }),
      block("long_answer", { label: "Why are you a good fit?" }),
    ],
  },
];
