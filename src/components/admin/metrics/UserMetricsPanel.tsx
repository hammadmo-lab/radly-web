/**
 * src/components/admin/metrics/UserMetricsPanel.tsx
 * User-level metrics and success rates
 */
import React from 'react';
import { Users, XCircle, TrendingUp } from 'lucide-react';
import { parsePrometheusResult, formatPercentage } from '@/lib/metrics-helpers';
import { PrometheusResult } from '@/lib/admin-metrics';
import { MetricCard } from './MetricCard';

interface UserMetricsPanelProps {
  userJobSuccess: PrometheusResult;
  rateLimits: PrometheusResult;
}

export function UserMetricsPanel({ userJobSuccess, rateLimits }: UserMetricsPanelProps) {
  const successData = parsePrometheusResult(userJobSuccess);
  const rateLimitData = parsePrometheusResult(rateLimits);
  
  const successRate = successData[0]?.value || 0;
  const totalRateLimits = rateLimitData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6">
      {/* User Success Rate */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Users className="h-5 w-5 mr-2" />
            User Job Success Rate
          </h3>
          <div className="text-3xl font-bold text-gray-900">
            {formatPercentage(successRate)}
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${
              successRate >= 95 ? 'bg-green-500' : 
              successRate >= 85 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(successRate, 100)}%` }}
          ></div>
        </div>
        
        <div className="mt-3 flex justify-between text-sm text-gray-600">
          <span>0%</span>
          <span className="font-medium">
            {successRate >= 95 ? 'Excellent' : 
             successRate >= 85 ? 'Good' : 'Needs Attention'}
          </span>
          <span>100%</span>
        </div>
      </div>

      {/* Rate Limits Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricCard
          title="Rate Limits Hit"
          value={totalRateLimits.toLocaleString()}
          unit="requests"
          status={totalRateLimits > 100 ? 'warning' : 'success'}
          icon={<XCircle className="h-5 w-5" />}
        />
        
        <MetricCard
          title="Success Rate Trend"
          value="+2.3%"
          status="success"
          change={2.3}
          period="vs last hour"
          icon={<TrendingUp className="h-5 w-5" />}
          description="Change in job success rate compared to previous period"
        />
      </div>

      {/* Rate Limits by Provider */}
      {rateLimitData.length > 0 && (
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Rate Limits by Provider</h3>
          <div className="space-y-3">
            {rateLimitData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                  <span className="font-medium">{item.name}</span>
                </div>
                <span className="text-sm text-gray-600">
                  {item.value.toLocaleString()} hits
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
