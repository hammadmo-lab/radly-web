import { httpGet } from '@/lib/http';

export type TemplateSummary = { template_id: string; name?: string };
export const listTemplates = () => httpGet<TemplateSummary[]>('/v1/templates');
