import { httpGet } from '@/lib/http';

export type TemplateListItem = {
  id: string;
  title: string;
  updatedAt: string | null; // ISO string
  // optional metadata the UI may use later:
  modality?: string | null;
  anatomy?: string | null;
  version?: string | number | null;
  description?: string | null;
};

function pick<T, K extends keyof T>(o: T | undefined | null, ...keys: K[]): Partial<T> {
  if (!o) return {};
  const out: Partial<T> = {};
  keys.forEach(k => { (out as Record<string, unknown>)[k as string] = (o as Record<string, unknown>)[k as string]; });
  return out;
}

// Accept multiple backend shapes and emit a consistent item
export function normalizeTemplateListItem(raw: Record<string, unknown>): TemplateListItem {
  const id = String(raw?.id ?? raw?.template_id ?? "");
  const title = String(
    raw?.title ?? raw?.name ?? raw?.label ?? raw?.display_name ?? ""
  ).trim();

  // Prefer updated_at/updatedAt/modified_at; fall back to created date if present
  const updated =
    raw?.updatedAt ?? raw?.updated_at ?? raw?.modified_at ?? raw?.modifiedAt ?? raw?.version_updated ?? raw?.created_at ?? raw?.createdAt ?? null;

  // Pass through some optional metadata if present
  const meta = pick(raw, "modality", "anatomy", "version", "description");

  return {
    id,
    title: title || "(Untitled Template)",
    updatedAt: updated && typeof updated === 'string' ? new Date(updated).toISOString() : null,
    ...meta,
  };
}

export async function fetchTemplates(httpGet: <T=unknown>(url: string) => Promise<T>): Promise<TemplateListItem[]> {
  const data = await httpGet<unknown[]>("/v1/templates");
  if (!Array.isArray(data)) return [];
  return data.map((item: unknown) => normalizeTemplateListItem(item as Record<string, unknown>));
}

// Simple normalizer function as requested
export function normalizeTemplate(raw: Record<string, unknown>) {
  return {
    id: String(raw?.id || raw?.template_id || ''),
    title: String(raw?.title || raw?.name || '(Untitled Template)'),
    updatedAt: raw?.updatedAt || raw?.updated_at || raw?.modified_at || null,
  };
}

// Legacy export for backward compatibility
export type TemplateSummary = { template_id: string; name?: string };
export const listTemplates = () => httpGet<TemplateSummary[]>('/v1/templates');
