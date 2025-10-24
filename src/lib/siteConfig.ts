export const siteConfig = {
  name: "Radly Assistant",
  shortName: "Radly",
  tagline: "Voice-supported radiology reporting",
  description:
    "Radly is a voice-supported assistant that helps radiologists draft structured reports quickly while keeping clinicians in full control.",
  verificationDescription:
    "Internal validation highlights transcription accuracy and template coverage. Radly assists, radiologists review and finalize every report.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://radly.app",
  ogImage: "/og-default.png",
  twitterHandle: "@radlyhq",
  email: "support@radly.app",
};

export const marketingPaths = [
  "/",
  "/instructions",
  "/pricing",
  "/templates",
  "/privacy",
  "/terms",
  "/security",
  "/validation",
];
