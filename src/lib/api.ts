// src/lib/api.ts
"use client";

import { Capacitor } from "@capacitor/core";
import { createSupabaseBrowser } from "@/utils/supabase/browser";
import { JobDoneResult, PatientBlock } from "@/lib/types";
import { Signature } from "@/types/report";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;
const CLIENT_KEY = process.env.NEXT_PUBLIC_RADLY_CLIENT_KEY!;
const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY!;

async function getAccessToken(): Promise<string | null> {
  try {
    if (Capacitor.isNativePlatform()) {
      const { getSupabaseClient } = await import("@/lib/supabase-singleton");
      const supabase = await getSupabaseClient();
      const { data } = await supabase.auth.getSession();
      return data.session?.access_token ?? null;
    }

    const supabase = createSupabaseBrowser();
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  } catch (error) {
    console.error("Failed to resolve auth token:", error);
    return null;
  }
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const token = await getAccessToken();

  const headers = new Headers(init.headers || {});
  if (!headers.has("content-type")) headers.set("content-type", "application/json");
  headers.set("x-client-key", CLIENT_KEY);
  headers.set("X-Request-Id", crypto.randomUUID());
  
  // Add admin key for admin endpoints
  if (path.startsWith('/admin/')) {
    headers.set("x-admin-key", ADMIN_KEY);
  }
  
  if (token) headers.set("authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}/v1${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  // If unauthorized, surface 401 to caller for redirect
  if (res.status === 401) {
    const text = await res.text().catch(() => "");
    throw new Error(`401 Unauthorized: ${text || "missing/invalid token"}`);
  }

  return res;
}

/**
 * Export a report to DOCX format
 * @param report - The report data to export
 * @param patient - Optional patient data to include
 * @param signature - Optional signature data to include
 * @param includeIdentifiers - Whether to include patient identifiers in the export
 * @param filename - The filename for the exported document
 * @param formattingProfileId - Optional formatting profile ID to apply custom formatting
 * @param userId - Optional user ID for formatting profile lookup
 * @returns Promise with export response containing download URL
 */
export async function exportReportDocx(
  report: JobDoneResult["report"],
  patient: PatientBlock,
  signature: Signature | undefined,
  includeIdentifiers: boolean,
  filename: string,
  formattingProfileId?: string | null,
  userId?: string | null
): Promise<{
  url: string;
  public_url?: string;
  size: number;
  expires_in: number;
}> {
  const payload: Record<string, unknown> = {
    report: {
      title: report.title,
      technique: report.technique,
      findings: report.findings,
      impression: report.impression,
      recommendations: report.recommendations,
    },
    patient: {
      name: patient.name,
      age: patient.age,
      sex: patient.sex,
      mrn: patient.mrn,
      dob: patient.dob,
      history: patient.history,
    },
    signature: signature ? {
      name: signature.name,
      date: signature.date,
    } : null,
    include_identifiers: includeIdentifiers,
    filename: filename,
  };

  // Add formatting profile if provided
  if (formattingProfileId) {
    payload.formatting_profile_id = formattingProfileId;
  }
  if (userId) {
    payload.user_id = userId;
  }

  const response = await apiFetch("/export/docx/link", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(`Export failed: ${response.status} ${errorText}`);
  }

  return response.json();
}
