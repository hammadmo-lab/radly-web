'use client';

import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { JobStatusResponse } from '@/lib/jobs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Check, Clock, Code, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReportMetadataSidebarProps {
  jobStatus: JobStatusResponse;
}

export function ReportMetadataSidebar({ jobStatus }: ReportMetadataSidebarProps) {
  const { copy, isCopied } = useCopyToClipboard();
  const result = jobStatus.result;

  if (!result) return null;

  const formatTokens = (tokens?: number | null) =>
    tokens ? `${tokens.toLocaleString()}` : 'N/A';

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const totalTokens = result.metadata.usage?.total_tokens;
  const hasTokenData = Boolean(totalTokens);

  return (
    <div className="space-y-4">
      {/* Job Information */}
      <Card className="aurora-card border border-[rgba(255,255,255,0.08)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Code className="w-4 h-4" />
            Job Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs text-[rgba(207,207,207,0.55)] uppercase mb-1">Job ID</p>
            <div className="flex items-center gap-2">
              <code className="text-xs font-mono bg-[rgba(255,255,255,0.05)] px-2 py-1 rounded flex-1 truncate">
                {jobStatus.job_id}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copy(jobStatus.job_id)}
                className="h-6 w-6 p-0"
              >
                {isCopied ? (
                  <Check className="w-3 h-3 text-green-500" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
            </div>
          </div>

          <div>
            <p className="text-xs text-[rgba(207,207,207,0.55)] uppercase mb-1">Template</p>
            <p className="text-sm font-mono">{result.template_id}</p>
          </div>
        </CardContent>
      </Card>

      {/* Generation Performance */}
      <Card className="aurora-card border border-[rgba(255,255,255,0.08)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs text-[rgba(207,207,207,0.55)] uppercase mb-1">
              Generation Time
            </p>
            <p className="text-sm font-semibold">{formatTime(result.elapsed_ms)}</p>
          </div>

          <div>
            <p className="text-xs text-[rgba(207,207,207,0.55)] uppercase mb-1">Model</p>
            <p className="text-sm">{result.model}</p>
          </div>

          <div>
            <p className="text-xs text-[rgba(207,207,207,0.55)] uppercase mb-1">Provider</p>
            <p className="text-sm capitalize">{result.provider}</p>
          </div>

          {result.metadata.finish_reason && (
            <div>
              <p className="text-xs text-[rgba(207,207,207,0.55)] uppercase mb-1">
                Finish Reason
              </p>
              <p className="text-sm capitalize">{result.metadata.finish_reason}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Token Usage */}
      {hasTokenData && (
        <Card className="aurora-card border border-[rgba(255,255,255,0.08)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              Token Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.metadata.usage?.prompt_tokens !== null &&
              result.metadata.usage?.prompt_tokens !== undefined && (
                <div>
                  <p className="text-xs text-[rgba(207,207,207,0.55)] uppercase mb-1">
                    Prompt Tokens
                  </p>
                  <p className="text-sm font-semibold">
                    {formatTokens(result.metadata.usage.prompt_tokens)}
                  </p>
                </div>
              )}

            {result.metadata.usage?.completion_tokens !== null &&
              result.metadata.usage?.completion_tokens !== undefined && (
                <div>
                  <p className="text-xs text-[rgba(207,207,207,0.55)] uppercase mb-1">
                    Completion Tokens
                  </p>
                  <p className="text-sm font-semibold">
                    {formatTokens(result.metadata.usage.completion_tokens)}
                  </p>
                </div>
              )}

            {totalTokens !== null && totalTokens !== undefined && (
              <div className="pt-2 border-t border-[rgba(255,255,255,0.08)]">
                <p className="text-xs text-[rgba(207,207,207,0.55)] uppercase mb-1">
                  Total Tokens
                </p>
                <p className="text-sm font-bold text-[#3FBF8C]">
                  {formatTokens(totalTokens)}
                </p>
              </div>
            )}

            {result.metadata.usage?.reasoning_tokens !== null &&
              result.metadata.usage?.reasoning_tokens !== undefined &&
              result.metadata.usage.reasoning_tokens > 0 && (
                <div>
                  <p className="text-xs text-[rgba(207,207,207,0.55)] uppercase mb-1">
                    Reasoning Tokens
                  </p>
                  <p className="text-sm font-semibold">
                    {formatTokens(result.metadata.usage.reasoning_tokens)}
                  </p>
                </div>
              )}
          </CardContent>
        </Card>
      )}

      {/* Info Note */}
      <Card className="aurora-card border border-[rgba(75,142,255,0.25)] bg-[rgba(75,142,255,0.08)]">
        <CardContent className="pt-4">
          <p className="text-xs text-[rgba(207,207,207,0.65)] leading-relaxed">
            This metadata provides insights into how your report was generated, including
            generation time, token usage, and model information.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
