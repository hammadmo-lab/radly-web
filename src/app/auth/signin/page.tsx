"use client";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-sm rounded-2xl shadow p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <button
          className="w-full rounded-md border px-4 py-2 hover:bg-gray-50 transition-colors"
          onClick={() => signIn("google", { callbackUrl: "/" })}
        >
          Continue with Google
        </button>
        {/* Render Apple button only if APPLE_* envs exist at build time */}
        {process.env.NEXT_PUBLIC_HAS_APPLE === "1" && (
          <button
            className="w-full rounded-md border px-4 py-2 hover:bg-gray-50 transition-colors"
            onClick={() => signIn("apple", { callbackUrl: "/" })}
          >
            Continue with Apple
          </button>
        )}
        {/* Optional: magic link form only if Email provider configured */}
        {process.env.NEXT_PUBLIC_HAS_EMAIL === "1" && (
          <form
            className="space-y-2"
            onSubmit={async (e) => {
              e.preventDefault();
              const email = new FormData(e.currentTarget).get("email") as string;
              await signIn("email", { email, callbackUrl: "/" });
            }}
          >
            <input 
              name="email" 
              type="email" 
              required 
              placeholder="you@example.com" 
              className="w-full rounded-md border px-3 py-2" 
            />
            <button className="w-full rounded-md border px-4 py-2 hover:bg-gray-50 transition-colors">
              Send me a magic link
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
