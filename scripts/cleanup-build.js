const fs = require('fs')
const path = require('path')

// Auth callback directory
const callbackDir = path.join(__dirname, '../src/app/auth/callback')
const pageWebFile = path.join(callbackDir, 'page.web.tsx')
const pageFile = path.join(callbackDir, 'page.tsx')
const routeWebFile = path.join(callbackDir, 'route.web.ts')
const routeFile = path.join(callbackDir, 'route.ts')

// Pricing directory
const pricingDir = path.join(__dirname, '../src/app/pricing')
const pricingWebFile = path.join(pricingDir, 'page.web.tsx')
const pricingPageFile = path.join(pricingDir, 'page.tsx')

// Sign-in directory
const signinDir = path.join(__dirname, '../src/app/auth/signin')
const signinWebFile = path.join(signinDir, 'page.web.tsx')
const signinPageFile = path.join(signinDir, 'page.tsx')

// Restore web versions after mobile build
if (fs.existsSync(pageWebFile)) {
  fs.copyFileSync(pageWebFile, pageFile)
  console.log('🧹 Restored auth/callback/page.tsx from .web version')
} else {
  // Remove page.tsx if no web version exists (to avoid conflict with route.ts)
  if (fs.existsSync(pageFile)) {
    fs.unlinkSync(pageFile)
    console.log('🧹 Removed auth/callback/page.tsx (no web version found)')
  }
}

if (fs.existsSync(routeWebFile)) {
  fs.copyFileSync(routeWebFile, routeFile)
  console.log('🧹 Restored auth/callback/route.ts from .web version')
}

if (fs.existsSync(pricingWebFile)) {
  fs.copyFileSync(pricingWebFile, pricingPageFile)
  console.log('🧹 Restored pricing/page.tsx from .web version')
}

if (fs.existsSync(signinWebFile)) {
  fs.copyFileSync(signinWebFile, signinPageFile)
  console.log('🧹 Restored auth/signin/page.tsx from .web version')
}

console.log('✨ Web files restored after mobile build')
