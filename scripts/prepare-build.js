const fs = require('fs')
const path = require('path')

const isCapacitorBuild = process.env.CAPACITOR_BUILD === 'true'

// Auth callback directory
const callbackDir = path.join(__dirname, '../src/app/auth/callback')
const routeWebFile = path.join(callbackDir, 'route.web.ts')
const pageMobileFile = path.join(callbackDir, 'page.mobile.tsx')
const routeFile = path.join(callbackDir, 'route.ts')
const pageFile = path.join(callbackDir, 'page.tsx')

// Pricing directory
const pricingDir = path.join(__dirname, '../src/app/pricing')
const pricingWebFile = path.join(pricingDir, 'page.web.tsx')
const pricingMobileFile = path.join(pricingDir, 'page.mobile.tsx')
const pricingPageFile = path.join(pricingDir, 'page.tsx')

// Sign-in directory
const signinDir = path.join(__dirname, '../src/app/auth/signin')
const signinMobileFile = path.join(signinDir, 'page.mobile.tsx')
const signinPageFile = path.join(signinDir, 'page.tsx')

// Clean up any existing active files
if (fs.existsSync(routeFile)) fs.unlinkSync(routeFile)
if (fs.existsSync(pageFile)) fs.unlinkSync(pageFile)
if (fs.existsSync(pricingPageFile)) fs.unlinkSync(pricingPageFile)
if (fs.existsSync(signinPageFile)) fs.unlinkSync(signinPageFile)

if (isCapacitorBuild) {
  console.log('📱 Preparing Capacitor build')
  console.log('  - Using client-side auth callback')
  console.log('  - Using mobile pricing redirect')
  console.log('  - Using mobile sign-in page')

  // Auth callback: Copy mobile page
  if (fs.existsSync(pageMobileFile)) {
    fs.copyFileSync(pageMobileFile, pageFile)
    console.log('✅ Auth: Copied page.mobile.tsx → page.tsx')
  } else {
    console.error('❌ Error: auth/callback/page.mobile.tsx not found')
    process.exit(1)
  }

  // Pricing: Copy mobile redirect page
  if (fs.existsSync(pricingMobileFile)) {
    fs.copyFileSync(pricingMobileFile, pricingPageFile)
    console.log('✅ Pricing: Copied page.mobile.tsx → page.tsx')
  } else {
    console.error('❌ Error: pricing/page.mobile.tsx not found')
    process.exit(1)
  }

  // Sign-in: Copy mobile page
  if (fs.existsSync(signinMobileFile)) {
    fs.copyFileSync(signinMobileFile, signinPageFile)
    console.log('✅ Sign-in: Copied page.mobile.tsx → page.tsx')
  } else {
    console.error('❌ Error: auth/signin/page.mobile.tsx not found')
    process.exit(1)
  }
} else {
  console.log('🌐 Preparing web build')
  console.log('  - Using server-side auth callback')
  console.log('  - Using dynamic pricing page')
  console.log('  - Using web sign-in page')

  // Auth callback: Copy web route
  if (fs.existsSync(routeWebFile)) {
    fs.copyFileSync(routeWebFile, routeFile)
    console.log('✅ Auth: Copied route.web.ts → route.ts')
  } else {
    console.error('❌ Error: auth/callback/route.web.ts not found')
    process.exit(1)
  }

  // Pricing: Copy web page
  if (fs.existsSync(pricingWebFile)) {
    fs.copyFileSync(pricingWebFile, pricingPageFile)
    console.log('✅ Pricing: Copied page.web.tsx → page.tsx')
  } else {
    console.error('❌ Error: pricing/page.web.tsx not found')
    process.exit(1)
  }

  // Sign-in: Ensure web page is active for build
  if (fs.existsSync(signinDir)) {
    const signinWebFile = path.join(signinDir, 'page.web.tsx')
    if (fs.existsSync(signinWebFile)) {
      fs.copyFileSync(signinWebFile, signinPageFile)
      console.log('✅ Sign-in: Copied page.web.tsx → page.tsx')
    } else {
      console.warn('⚠️  Warning: auth/signin/page.web.tsx not found; skipping copy')
    }
  }
}

console.log('✨ Build preparation complete')
