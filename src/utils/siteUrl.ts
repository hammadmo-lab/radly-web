// utils/siteUrl.ts
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
