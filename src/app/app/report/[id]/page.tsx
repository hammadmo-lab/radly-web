"use client";

import { useParams } from "next/navigation";

import ReportDetailView from "@/components/reports/ReportDetailView";

export const dynamic = 'force-dynamic';

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <ReportDetailView jobId={id} />;
}
