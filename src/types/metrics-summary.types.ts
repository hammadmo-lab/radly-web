/**
 * src/types/metrics-summary.types.ts
 * TypeScript types for the new database-backed metrics API endpoints
 */

// --- Reports Metrics ---
export interface ReportsMetrics {
    today: number;
    yesterday: number;
    this_week: number;
    this_month: number;
    all_time: number;
    change_vs_yesterday: number;
}

// --- Users Metrics ---
export interface UsersMetrics {
    total: number;
    active_this_week: number;
    new_this_week: number;
}

// --- Subscription Tier Info ---
export interface SubscriptionTierInfo {
    display_name: string;
    count: number;
}

export interface SubscriptionsMetrics {
    free: SubscriptionTierInfo;
    starter: SubscriptionTierInfo;
    professional: SubscriptionTierInfo;
    premium: SubscriptionTierInfo;
}

// --- Revenue Metrics ---
export interface RevenueMetrics {
    this_month: number;
    last_month: number;
    growth_percent: number;
    currency: string;
}

// --- Usage Trend ---
export interface UsageTrendItem {
    date: string;
    count: number;
}

// --- Top Templates ---
export interface TopTemplateItem {
    template: string;
    count: number;
}

// --- Recent Activity ---
export type ActivityType = 'report' | 'signup' | 'subscription_change';

export interface RecentActivityItem {
    type: ActivityType;
    detail: string;
    timestamp: string;
    time_ago: string;
}

// --- System Health ---
export type HealthStatus = 'healthy' | 'degraded' | 'critical';

export interface RedisHealth {
    status: HealthStatus;
    queue_depth: number;
}

export interface DatabaseHealth {
    status: HealthStatus;
}

export interface WorkersHealth {
    status: HealthStatus;
    running_jobs: number;
}

export interface SystemHealthComponents {
    redis: RedisHealth;
    database: DatabaseHealth;
    workers: WorkersHealth;
}

export interface SystemHealth {
    status: HealthStatus;
    components: SystemHealthComponents;
}

// --- Main Summary Response ---
export interface MetricsSummary {
    reports: ReportsMetrics;
    users: UsersMetrics;
    subscriptions: SubscriptionsMetrics;
    revenue: RevenueMetrics;
    top_templates: TopTemplateItem[];
    usage_trend: UsageTrendItem[];
    recent_activity: RecentActivityItem[];
    system_health: SystemHealth;
    generated_at: string;
}

// --- Lightweight Counts Response ---
export interface MetricsCounts {
    reports: {
        total: number;
        last_hour: number;
        last_24h: number;
    };
    jobs: {
        last_hour: number;
        successful_24h: number;
        failed_24h: number;
        success_rate_24h: number;
    };
    subscriptions: {
        active: number;
    };
    timestamp: string;
}
