import Google from "next-auth/providers/google";
import Apple from "next-auth/providers/apple";
import Email from "next-auth/providers/email";
import type { NextAuthOptions } from "next-auth";

const {
  NEXTAUTH_URL,
  NEXTAUTH_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  APPLE_CLIENT_ID,
  APPLE_CLIENT_SECRET,
  EMAIL_SERVER, // optional
  EMAIL_FROM,   // optional
} = process.env;

// Throw readable errors early if critical env is missing.
if (!NEXTAUTH_URL) throw new Error("NEXTAUTH_URL is not set");
if (!NEXTAUTH_SECRET) throw new Error("NEXTAUTH_SECRET is not set");

const google = Google({
  clientId: GOOGLE_CLIENT_ID!,
  clientSecret: GOOGLE_CLIENT_SECRET!,
  // Force proper Authorization Code flow (no implicit token hash)
  authorization: {
    params: {
      prompt: "consent",
      access_type: "offline",
      response_type: "code",
    },
  },
});

const providers = [google];
// Only include Apple if credentials exist
if (APPLE_CLIENT_ID && APPLE_CLIENT_SECRET) {
  providers.push(Apple({ clientId: APPLE_CLIENT_ID, clientSecret: APPLE_CLIENT_SECRET }));
}
// Only include Email if configured
if (EMAIL_SERVER && EMAIL_FROM) {
  providers.push(Email({ server: EMAIL_SERVER, from: EMAIL_FROM }));
}

export const authOptions: NextAuthOptions = {
  secret: NEXTAUTH_SECRET,
  providers,
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  // Keep default callbacks unless project already customizes them.
  session: { strategy: "jwt" },
  // Add minimal debug logging while fixing the issue:
  debug: process.env.NODE_ENV !== "production",
};