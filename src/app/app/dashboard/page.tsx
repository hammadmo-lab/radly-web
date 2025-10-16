'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Plus, FileText, BookTemplate, TrendingUp, Clock,
  Sparkles, Zap, ArrowRight, Activity
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import UsageWidget from '@/components/UsageWidget'

export default function DashboardPage() {
  const router = useRouter()

  return (
    <div className="space-y-8 pb-24 md:pb-8">
      {/* USAGE WIDGET - Top Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto lg:mx-0 lg:max-w-none"
      >
        <UsageWidget />
      </motion.div>

      {/* HERO SECTION - Modern & Welcoming */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-violet-50 p-6 sm:p-8 lg:p-12 border-2 border-gray-100"
      >
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            Welcome back
          </span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
          <span className="text-gradient-brand">Generate Reports</span>
          <br />
          <span className="text-gray-900">With AI Speed</span>
        </h1>
        
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mb-6 sm:mb-8">
          Create professional medical reports in seconds. Choose a template, enter patient data, and let AI handle the rest.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Button
            size="lg"
            className="btn-primary h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg w-full sm:w-auto"
            onClick={() => router.push('/app/templates')}
          >
            <Plus className="w-5 h-5 mr-2" />
            Generate New Report
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg border-2 w-full sm:w-auto"
            onClick={() => router.push('/app/templates')}
          >
            <BookTemplate className="w-5 h-5 mr-2" />
            Browse Templates
          </Button>
        </div>
      </motion.div>

      {/* STATS GRID - Animated Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Reports', value: '248', change: '+12 this week', icon: FileText, color: 'emerald' },
          { label: 'Templates', value: '24', change: 'Active', icon: BookTemplate, color: 'violet' },
          { label: 'Avg. Time', value: '32s', change: '8% faster', icon: Clock, color: 'blue' },
          { label: 'This Month', value: '86', change: '+24% growth', icon: TrendingUp, color: 'cyan' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
          >
            <Card className="card-modern">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-${stat.color}-50`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                  <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full font-medium">
                    {stat.change}
                  </span>
                </div>
                <p className="text-sm text-gray-600 font-medium mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* QUICK ACTIONS - Interactive Cards */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Zap className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Plus,
              title: 'Generate New Report',
              description: 'Create a medical report from template',
              href: '/app/templates',
              gradient: 'from-emerald-500 to-teal-500',
            },
            {
              icon: BookTemplate,
              title: 'Browse Templates',
              description: 'View all available report templates',
              href: '/app/templates',
              gradient: 'from-violet-500 to-purple-500',
            },
            {
              icon: Activity,
              title: 'View Reports',
              description: 'Access your generated reports',
              href: '/app/reports',
              gradient: 'from-blue-500 to-cyan-500',
            },
          ].map((action) => (
            <Card 
              key={action.title}
              className="card-interactive group"
              onClick={() => router.push(action.href)}
            >
              <CardContent className="p-6">
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${action.gradient} mb-4 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                  {action.title}
                </h3>
                <p className="text-gray-600 mb-4">{action.description}</p>
                <div className="flex items-center text-primary font-medium">
                  <span>Get started</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
