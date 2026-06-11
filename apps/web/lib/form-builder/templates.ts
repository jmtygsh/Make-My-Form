// apps/web/lib/form-builder/templates.ts
import type { Block, FormTheme } from "./schema";
import { createBlock, newOption } from "./field-config";

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  /** Factory → fresh block instances on every use. */
  build: () => Block[];
  /** Optional theme overrides for the template */
  theme?: Partial<FormTheme>;
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
  {
    id: "employee-onboarding",
    name: "Employee Onboarding",
    description: "Collect personal details and hardware preferences for new hires.",
    category: "HR",
    theme: {
      showCover: true,
      coverUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
      showLogo: true,
      logoUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=AcmeCorp&backgroundColor=000000",
      bgColor: "#f8fafc",
      accentColor: "#2563eb", // blue-600
      btnBgColor: "#2563eb",
    },
    build: () => [
      block("text", { content: "Welcome to the team! Please fill out your details below." }),
      block("short_answer", { label: "Full Legal Name", required: true }),
      block("date", { label: "Date of Birth", required: true }),
      block("email", { label: "Personal Email Address", required: true }),
      block("phone", { label: "Phone Number", required: true }),
      block("divider"),
      block("dropdown", {
        label: "Laptop Preference",
        required: true,
        options: [newOption("MacBook Pro"), newOption("Dell XPS"), newOption("ThinkPad")],
      }),
      block("checkboxes", {
        label: "Required Accessories",
        options: [newOption("External Monitor"), newOption("Mechanical Keyboard"), newOption("Wireless Mouse"), newOption("Noise-cancelling Headset")],
      }),
    ],
  },
  {
    id: "bug-report",
    name: "Software Bug Report",
    description: "Detailed bug reporting with severity, environment, and reproduction steps.",
    category: "Engineering",
    build: () => [
      block("dropdown", {
        label: "Severity",
        required: true,
        options: [newOption("Low"), newOption("Medium"), newOption("High"), newOption("Critical")],
      }),
      block("multi_select", {
        label: "Environment",
        required: true,
        options: [newOption("Windows"), newOption("macOS"), newOption("Linux"), newOption("iOS"), newOption("Android"), newOption("Web")],
      }),
      block("short_answer", { label: "Bug Title", required: true }),
      block("long_answer", { label: "Steps to Reproduce", required: true }),
      block("long_answer", { label: "Expected vs Actual Behavior" }),
      block("link", { label: "Screenshot / Video URL" }),
    ],
  },
  {
    id: "patient-intake",
    name: "Medical Patient Intake",
    description: "Secure collection of patient details and medical history.",
    category: "Healthcare",
    theme: {
      showCover: true,
      coverUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
      showLogo: true,
      logoUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=Health&backgroundColor=14b8a6",
      bgColor: "#f0fdfa", // teal-50
      accentColor: "#0f766e", // teal-700
      btnBgColor: "#0f766e",
    },
    build: () => [
      block("short_answer", { label: "Full Name", required: true }),
      block("date", { label: "Date of Birth", required: true }),
      block("phone", { label: "Primary Phone", required: true }),
      block("divider"),
      block("checkboxes", {
        label: "Existing Conditions",
        options: [newOption("Diabetes"), newOption("Hypertension"), newOption("Asthma"), newOption("None")],
      }),
      block("long_answer", { label: "Current Medications & Allergies" }),
      block("divider"),
      block("short_answer", { label: "Contact Name", required: true }),
      block("phone", { label: "Contact Phone", required: true }),
    ],
  },
  {
    id: "cancellation-survey",
    name: "Cancellation Survey",
    description: "Gather insights when a user cancels their subscription.",
    category: "Customer Success",
    build: () => [
      block("text", { content: "We're sad to see you go. Please let us know how we can improve." }),
      block("dropdown", {
        label: "Primary reason for leaving",
        required: true,
        options: [newOption("Too expensive"), newOption("Missing features"), newOption("Found an alternative"), newOption("Hard to use"), newOption("Other")],
      }),
      block("rating", { label: "Rate your overall experience with us", required: true }),
      block("multiple_choice", {
        label: "Would you consider using our service again in the future?",
        options: [newOption("Yes"), newOption("No"), newOption("Maybe")],
      }),
      block("long_answer", { label: "Elaborate on your feedback (Optional)" }),
      block("short_answer", { label: "What alternative are you switching to?" }),
    ],
  },
  {
    id: "project-brief",
    name: "Freelance Project Brief",
    description: "Collect client requirements, budget, and timeline for new projects.",
    category: "Agency",
    build: () => [
      block("short_answer", { label: "Company / Client Name", required: true }),
      block("email", { label: "Contact Email", required: true }),
      block("divider"),
      block("dropdown", {
        label: "Project Type",
        required: true,
        options: [newOption("Web Design"), newOption("SEO Optimization"), newOption("Content Creation"), newOption("Custom Development")],
      }),
      block("long_answer", { label: "Project Goals & Scope", required: true }),
      block("multiple_choice", {
        label: "Estimated Budget",
        required: true,
        options: [newOption("< $1,000"), newOption("$1,000 - $5,000"), newOption("$5,000 - $10,000"), newOption("$10,000+")],
      }),
      block("date", { label: "Desired Deadline" }),
      block("multi_select", {
        label: "Required Deliverables",
        options: [newOption("Figma Designs"), newOption("Source Code"), newOption("Copywriting"), newOption("Analytics Setup")],
      }),
    ],
  },
  {
    id: "feature-request",
    name: "Product Feature Request",
    description: "Capture detailed user stories and criticality for new product ideas.",
    category: "Product",
    build: () => [
      block("text", { content: "Help us shape the roadmap by describing your idea." }),
      block("short_answer", { label: "Feature Name", required: true }),
      block("long_answer", { label: "User Story / Use Case", required: true }),
      block("multi_select", {
        label: "Target Audience",
        options: [newOption("Admins"), newOption("Regular Users"), newOption("Guests")],
      }),
      block("rating", { label: "How critical is this feature for your workflow?", required: true }),
      block("long_answer", { label: "Current Workarounds (if any)" }),
    ],
  },
  {
    id: "workshop-registration",
    name: "Workshop Registration",
    description: "Event registration combined with a pre-workshop knowledge survey.",
    category: "Events",
    theme: {
      showCover: true,
      coverUrl: "https://images.unsplash.com/photo-1544928147-79a2dbc1f389?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
      bgColor: "#fdf4ff", // fuchsia-50
      accentColor: "#c026d3", // fuchsia-600
      btnBgColor: "#c026d3",
    },
    build: () => [
      block("short_answer", { label: "Full Name", required: true }),
      block("email", { label: "Email Address", required: true }),
      block("dropdown", {
        label: "Preferred Session Time",
        required: true,
        options: [newOption("Morning (9 AM - 12 PM)"), newOption("Afternoon (1 PM - 4 PM)"), newOption("Evening (6 PM - 9 PM)")],
      }),
      block("divider"),
      block("rating", { label: "Rate your current knowledge on this topic", required: true }),
      block("long_answer", { label: "What do you hope to learn the most?" }),
      block("checkboxes", {
        label: "Dietary Requirements (for catered lunch)",
        options: [newOption("Vegetarian"), newOption("Vegan"), newOption("Gluten-Free"), newOption("Nut Allergy"), newOption("None")],
      }),
    ],
  },
  {
    id: "property-listing",
    name: "Property Listing Details",
    description: "Standardized form for real estate agents to list new properties.",
    category: "Real Estate",
    theme: {
      showCover: true,
      coverUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
      showLogo: true,
      logoUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=RealEstate&backgroundColor=1e293b",
      bgColor: "#f4f4f5",
      accentColor: "#d97706",
      btnBgColor: "#d97706",
    },
    build: () => [
      block("dropdown", {
        label: "Property Type",
        required: true,
        options: [newOption("Apartment"), newOption("Single Family House"), newOption("Townhouse"), newOption("Commercial")],
      }),
      block("short_answer", { label: "Full Address", required: true }),
      block("number", { label: "Asking Price ($)", required: true }),
      block("divider"),
      block("number", { label: "Number of Bedrooms", required: true }),
      block("number", { label: "Number of Bathrooms", required: true }),
      block("number", { label: "Square Footage", required: true }),
      block("date", { label: "Available From Date" }),
      block("checkboxes", {
        label: "Amenities",
        options: [newOption("Swimming Pool"), newOption("Gym"), newOption("Parking Garage"), newOption("Balcony / Patio"), newOption("In-unit Washer/Dryer")],
      }),
    ],
  },
  {
    id: "course-evaluation",
    name: "Course Evaluation",
    description: "Anonymous feedback form for university or training courses.",
    category: "Education",
    build: () => [
      block("text", { content: "Your feedback is completely anonymous and helps us improve." }),
      block("short_answer", { label: "Course Code / Name", required: true }),
      block("divider"),
      block("rating", { label: "Rate the difficulty of the course (1 = Too Easy, 5 = Too Hard)", required: true }),
      block("rating", { label: "Rate the quality of the course materials", required: true }),
      block("divider"),
      block("rating", { label: "Instructor's communication and clarity", required: true }),
      block("rating", { label: "Instructor's responsiveness to questions", required: true }),
      block("long_answer", { label: "What could be improved for next semester?" }),
    ],
  },
  {
    id: "vendor-security",
    name: "Vendor Security Assessment",
    description: "Compliance questionnaire to evaluate third-party software vendors.",
    category: "Compliance",
    build: () => [
      block("short_answer", { label: "Company Name", required: true }),
      block("link", { label: "Company Website URL", required: true }),
      block("email", { label: "Security Contact Email", required: true }),
      block("divider"),
      block("multiple_choice", {
        label: "Do you have an active SOC2 Type II report?",
        required: true,
        options: [newOption("Yes"), newOption("No"), newOption("In Progress")],
      }),
      block("multiple_choice", {
        label: "Is customer data encrypted at rest and in transit?",
        required: true,
        options: [newOption("Yes"), newOption("No")],
      }),
      block("checkboxes", {
        label: "Select all compliance certifications you hold",
        options: [newOption("ISO 27001"), newOption("GDPR Compliant"), newOption("HIPAA Compliant"), newOption("PCI-DSS")],
      }),
    ],
  },
];
