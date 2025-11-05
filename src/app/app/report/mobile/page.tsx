'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import ReportDetailView from '@/components/reports/ReportDetailView';

export default function MobileReportPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const jobId = searchParams.get('jobId');

  useEffect(() => {
    if (!jobId) {
      router.replace('/app/reports');
    }
  }, [jobId, router]);

  if (!jobId) {
    return null;
  }

  return <ReportDetailView jobId={jobId} />;
}
