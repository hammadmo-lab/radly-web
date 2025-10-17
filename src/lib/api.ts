// src/lib/api.ts
"use client";

import { createSupabaseBrowser } from "@/utils/supabase/browser";
import { JobDoneResult, PatientBlock } from "@/lib/types";
import { Signature } from "@/types/report";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;
const CLIENT_KEY = process.env.NEXT_PUBLIC_RADLY_CLIENT_KEY!;
const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY!;

export async function apiFetch(path: string, init: RequestInit = {}) {
  const supabase = createSupabaseBrowser();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

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
 * @returns Promise with export response containing download URL
 */
export async function exportReportDocx(
  report: JobDoneResult["report"],
  patient: PatientBlock,
  signature: Signature | undefined,
  includeIdentifiers: boolean,
  filename: string
): Promise<{
  url: string;
  public_url?: string;
  size: number;
  expires_in: number;
}> {
  const response = await apiFetch("/export/docx/link", {
    method: "POST",
    body: JSON.stringify({
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
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(`Export failed: ${response.status} ${errorText}`);
  }

  return response.json();
}