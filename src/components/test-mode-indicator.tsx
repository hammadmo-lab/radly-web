'use client'

import { useState } from 'react'
import { isTestMode } from '@/lib/test-mode'

export function TestModeIndicator() {
  const [showIndicator] = useState(() => isTestMode())

  if (!showIndicator || process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-500 text-black px-4 py-2 rounded-lg shadow-lg z-50 text-sm font-semibold">
      🧪 Test Mode Active
    </div>
  )
}
