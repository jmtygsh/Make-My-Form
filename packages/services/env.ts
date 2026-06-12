import { z } from "zod";

const envSchema = z.object({
  // GOOGLE_OAUTH_CLIENT_ID: z.string(),
  // GOOGLE_OAUTH_CLIENT_SECRET: z.string(),
  // GOOGLE_OAUTH_REDIRECT_URI: z.string(),

  JWT_SECRET: z.string().describe("secret key for JWT secret"),

  BASE_URL: z.string().describe("base url for the application"),
  // Frontend web app URL — used to build absolute links in transactional
  // emails (e.g. "View responses" in owner-notification emails). The Next.js
  // app reads this on its side as well; we keep it duplicated here so the
  // services package can build deep-links without depending on web envs.
  FRONTEND_URL: z.string().describe("public URL of the web app"),
  // mail config
  SMTP_HOST: z.string().describe("smtp host"),
  SMTP_PORT: z.coerce.number().describe("smtp port"),
  SMTP_SECURE: z.coerce.boolean().describe("smtp secure"),
  SMTP_USER: z.string().describe("smtp user"),
  SMTP_PASS: z.string().describe("smtp pass"),
  SMTP_FROM: z.string().describe("from address; domain must be verified in the mail provider"),
  NEXT_PUBLIC_UNSPLASH_ACCESS_KEY: z.string().describe("unsplash public access key")

});

function createEnv(env: NodeJS.ProcessEnv) {
  const safeParseResult = envSchema.safeParse(env);
  if (!safeParseResult.success) throw new Error(safeParseResult.error.message);
  return safeParseResult.data;
}

export const env = createEnv(process.env);
