'use client'

import dynamic from 'next/dynamic'

const WebGeneratePage = dynamic(() => import('./web.page'), {
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  ),
  ssr: false,
})

export default function GeneratePage() {
  return <WebGeneratePage />
}

