// apps/web/lib/form-builder/templates.ts
import type { Block } from "./schema";
import { createBlock } from "./field-config";

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  // factory so each insert gets fresh block instances
  build: () => Block[];
}

/** Helper to make a configured block quickly. */
function block(type: Parameters<typeof createBlock>[0], patch: Partial<Block> = {}): Block {
  return { ...createBlock(type), ...patch } as Block;
}

export const TEMPLATES: FormTemplate[] = [
  {
    id: "contact",
    name: "Contact form",
    description: "Name, email and message — the essentials.",
    category: "General",
    build: () => [
      block("short_answer", { label: "Your name", required: true } as Partial<Block>),
      block("email", { label: "Email address", required: true } as Partial<Block>),
      block("long_answer", { label: "Message", required: true } as Partial<Block>),
    ],
  },
  {
    id: "feedback",
    name: "Customer feedback",
    description: "Rating + open feedback to learn what users think.",
    category: "Feedback",
    build: () => [
      block("rating", { label: "How would you rate us?", required: true } as Partial<Block>),
      block("long_answer", { label: "What can we improve?" } as Partial<Block>),
      block("email", { label: "Email (optional)" } as Partial<Block>),
    ],
  },
  {
    id: "rsvp",
    name: "Event RSVP",
    description: "Collect attendance and guest details.",
    category: "Events",
    build: () => [
      block("short_answer", { label: "Full name", required: true } as Partial<Block>),
      block("multiple_choice", {
        label: "Will you attend?",
        required: true,
        options: [
          { id: "yes", label: "Yes" },
          { id: "no", label: "No" },
          { id: "maybe", label: "Maybe" },
        ],
      } as Partial<Block>),
      block("number", { label: "Number of guests" } as Partial<Block>),
    ],
  },
];
