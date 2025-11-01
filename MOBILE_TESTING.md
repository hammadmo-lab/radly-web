# Mobile Testing Checklist

This document provides a comprehensive testing checklist for the Radly mobile UI implementation. Use this to validate all mobile features before deploying to production or submitting to app stores.

## Test Environment Setup

### iOS Simulator
```bash
# Start dev server
npm run dev

# Open Xcode Simulator
open -a Simulator

# In Simulator, navigate to:
# http://localhost:3000
```

### Android Emulator
```bash
# Start dev server
npm run dev

# Launch Android emulator
emulator -avd YOUR_AVD_NAME

# Open Chrome on emulator, navigate to:
# http://10.0.2.2:3000
```

### Browser DevTools (Quick Testing)
```bash
npm run dev
# Open http://localhost:3000
# Press Cmd+Shift+M (Mac) or F12 (Windows/Linux)
# Toggle device toolbar
```

## 1. Platform Detection Tests

### iOS Detection
- [ ] **Simulator**: Open in iOS Simulator - should show mobile homepage
- [ ] **Browser**: Add `?platform=ios` URL param - should show mobile homepage
- [ ] **User Agent**: Test with iOS user agent spoofing in DevTools

### Android Detection
- [ ] **Emulator**: Open in Android Emulator - should show mobile homepage
- [ ] **Browser**: Add `?platform=android` URL param - should show mobile homepage
- [ ] **User Agent**: Test with Android user agent spoofing in DevTools

### Web Detection
- [ ] **Desktop Browser**: Open normally - should show full AnimatedHomePage
- [ ] **No URL Params**: Ensure no `?platform=` param defaults to web correctly

**Expected Results:**
- Mobile platforms show `MobileHomePage` (compact, 2-3 screens)
- Web platform shows `AnimatedHomePage` (full marketing site)
- No hydration errors in console
- Smooth transition without content flashing

---

## 2. Scrolling Tests

### iOS Safari Scrolling (CRITICAL)
- [ ] **Homepage scrolling**: Swipe up/down - page should scroll smoothly
- [ ] **Momentum scrolling**: Swipe with momentum - should continue scrolling after release
- [ ] **Bottom bounce**: Scroll past bottom - should bounce back
- [ ] **Top bounce**: Scroll past top - should bounce back
- [ ] **Scroll to features**: Can scroll to "Why Radly" section
- [ ] **Scroll to quick actions**: Can scroll to bottom buttons

### Web/Desktop Scrolling
- [ ] **Mouse wheel**: Scroll with mouse wheel works
- [ ] **Trackpad**: Two-finger scroll works
- [ ] **Scrollbar**: Dragging scrollbar works

**Expected Results:**
- All pages use `position: fixed` scroll containers
- `-webkit-overflow-scrolling: touch` provides momentum scrolling
- No scroll freeze or unresponsive areas
- Smooth 60fps scrolling on both iOS and Android

---

## 3. Mobile Homepage Tests

### Visual Design
- [ ] **Logo**: Radly logo displays at 280px width
- [ ] **Headline**: "Draft Reports in Seconds" is centered
- [ ] **Subheadline**: Readable and properly spaced
- [ ] **Get Started button**: Gradient styling, centered text, arrow on right
- [ ] **Features cards**: 3 cards with icons (Zap, Brain, Layers)
- [ ] **Quick actions**: 3 buttons (Create, View Reports, Settings)

### Touch Interactions
- [ ] **Get Started button**: Touch target ≥ 44px, responds to tap
- [ ] **Create New Report**: Touch target ≥ 44px, navigates to `/app/generate`
- [ ] **View My Reports**: Touch target ≥ 44px, navigates to `/app/reports`
- [ ] **Settings**: Touch target ≥ 44px, navigates to `/app/settings`
- [ ] **Hover states**: Cards show hover effect on tap (mobile) or hover (desktop)

### Animations
- [ ] **Hero fade-in**: Logo and headline animate on load
- [ ] **Button animation**: Get Started button animates in
- [ ] **Cards stagger**: Feature cards animate in sequence (0.1s delay each)
- [ ] **Scroll animations**: Animations trigger properly on scroll

**Expected Results:**
- All text is readable (minimum 14px font size)
- All interactive elements have minimum 44px touch targets
- Animations run smoothly without jank
- No layout shift or content jumping

---

## 4. Navigation Tests

### Bottom Navigation Bar (Mobile Only)
- [ ] **Visibility**: Shows on mobile (`md:` breakpoint), hidden on desktop
- [ ] **Position**: Fixed at bottom with `safe-area-inset-bottom` padding
- [ ] **Active state**: Current route highlighted correctly
- [ ] **Dashboard tab**: Navigates to `/app/dashboard`
- [ ] **Generate tab**: Navigates to `/app/generate`
- [ ] **Reports tab**: Navigates to `/app/reports`
- [ ] **Settings tab**: Navigates to `/app/settings`

### Mobile Header (Mobile Only)
- [ ] **Logo**: Radly logo displays in header
- [ ] **Back button**: Shows on sub-pages, navigates back
- [ ] **Menu button**: Opens hamburger menu
- [ ] **User menu**: Shows user avatar/initial on authenticated pages

### Desktop Navigation
- [ ] **Top navbar**: Shows on desktop (`md:` and above)
- [ ] **Horizontal menu**: All links clickable
- [ ] **User dropdown**: Opens and closes correctly

**Expected Results:**
- Navigation adapts based on viewport size
- Bottom nav doesn't overlap content (pages have `pb-24 md:pb-12`)
- Active states work correctly
- Smooth transitions between routes

---

## 5. Sign-In Page Tests

### Mobile Layout
- [ ] **Marketing copy**: Hidden on mobile (`hidden lg:block`)
- [ ] **Form centered**: Sign-in form is centered on mobile
- [ ] **Starfield effect**: Background animations visible
- [ ] **Aurora effect**: Glassmorphic card styling works
- [ ] **Input fields**: Touch-friendly, proper focus states
- [ ] **OAuth buttons**: Google/Apple buttons display correctly (if enabled)

### Desktop Layout
- [ ] **Two-column layout**: Marketing copy visible on left, form on right
- [ ] **Feature cards**: CheckCircle and Sparkles cards display
- [ ] **Responsive spacing**: Proper padding and gaps

### Functionality
- [ ] **Email input**: Can type email, validation works
- [ ] **Magic link**: Button disabled until valid email entered
- [ ] **OAuth flow**: Google/Apple sign-in initiates correctly
- [ ] **Redirect**: After auth, redirects to intended destination

**Expected Results:**
- Form is usable on smallest mobile viewport (320px)
- All buttons have adequate touch targets
- Focus states are visible and accessible
- No horizontal scroll on any viewport

---

## 6. App Store Compliance Tests

### Pricing Page Restrictions
- [ ] **iOS app**: `/pricing` shows redirect message, no Stripe checkout
- [ ] **Android app**: `/pricing` shows redirect message, no Stripe checkout
- [ ] **Web browser**: `/pricing` shows full page with Stripe checkout
- [ ] **Redirect message**: Clearly directs to App Store/Google Play
- [ ] **No "View Plans"**: Mobile homepage doesn't link to pricing

### In-App Purchase Readiness
- [ ] **Subscription hooks**: `useMobileSubscription` hooks exist
- [ ] **Platform detection**: Correctly identifies iOS/Android for IAP
- [ ] **Capacitor integration**: Code marked with TODOs for Capacitor

**Expected Results:**
- Native apps NEVER show web payment UI (App Store policy compliance)
- Web users can access full pricing and checkout
- Clear messaging for mobile users to use app store

---

## 7. Responsive Breakpoint Tests

Test at these specific viewports:

### iPhone SE (375px width)
- [ ] All content fits without horizontal scroll
- [ ] Text is readable (not too small)
- [ ] Buttons are tappable
- [ ] Bottom nav doesn't overlap content

### iPhone 14 Pro (390px width)
- [ ] Same as iPhone SE tests
- [ ] Logo and images scale properly

### iPad (768px width) - Tablet Breakpoint
- [ ] Navigation transitions from mobile to desktop
- [ ] Bottom nav hidden, top nav visible
- [ ] Grid layouts expand (1 → 2 columns)
- [ ] Proper padding adjustments

### Desktop (1280px+)
- [ ] Full desktop layout active
- [ ] Three/four column grids work
- [ ] Marketing homepage shows full content
- [ ] All hover states work

**Expected Results:**
- Smooth transitions between breakpoints
- No layout breaks or content overflow
- Proper spacing at all sizes
- Touch targets remain adequate on all devices

---

## 8. Performance Tests

### Load Time
- [ ] **Initial load**: Homepage loads in < 2 seconds on 3G
- [ ] **Time to interactive**: Interactive in < 3 seconds
- [ ] **Code splitting**: Mobile/web versions load separately

### Runtime Performance
- [ ] **Scroll FPS**: Maintains 60fps during scrolling
- [ ] **Animation FPS**: Framer Motion animations smooth
- [ ] **No jank**: No layout shifts during navigation
- [ ] **Memory**: No memory leaks on long sessions

### Bundle Size
- [ ] **Mobile homepage**: Loads minimal JS (no marketing analytics)
- [ ] **Lazy loading**: Heavy components load on-demand
- [ ] **Images**: Next.js Image optimization working

**Tools:**
```bash
# Bundle analysis
npm run analyze

# Lighthouse audit (run on production build)
npm run build
npm run start
# Open Chrome DevTools → Lighthouse → Run audit
```

**Expected Results:**
- Lighthouse Performance score > 90
- First Contentful Paint < 1.5s
- Time to Interactive < 3s
- Total bundle size < 500kb (mobile)

---

## 9. Accessibility Tests

### Keyboard Navigation
- [ ] **Tab order**: Logical tab order through interactive elements
- [ ] **Focus visible**: Clear focus indicators on all elements
- [ ] **Skip links**: Can skip to main content
- [ ] **Form inputs**: Can navigate forms with keyboard only

### Screen Reader Tests
- [ ] **Page titles**: Descriptive titles on all pages
- [ ] **Alt text**: All images have descriptive alt text
- [ ] **ARIA labels**: Buttons have accessible names
- [ ] **Headings**: Proper heading hierarchy (h1 → h2 → h3)

### Touch Targets
- [ ] **Minimum size**: All interactive elements ≥ 44px × 44px
- [ ] **Spacing**: Adequate spacing between touch targets (≥ 8px)
- [ ] **Hit areas**: Touch areas extend beyond visible element

**Tools:**
```bash
# Run axe accessibility audit in browser DevTools
# Or use Lighthouse accessibility audit
```

**Expected Results:**
- No accessibility violations in Lighthouse
- All interactive elements keyboard accessible
- Proper color contrast ratios (≥ 4.5:1 for normal text)

---

## 10. Cross-Browser Tests

### Mobile Browsers
- [ ] **iOS Safari**: Full functionality works
- [ ] **iOS Chrome**: Same as Safari on iOS
- [ ] **Android Chrome**: Full functionality works
- [ ] **Android Firefox**: Full functionality works
- [ ] **Samsung Internet**: Full functionality works

### Desktop Browsers
- [ ] **Chrome**: Full functionality works
- [ ] **Firefox**: Full functionality works
- [ ] **Safari**: Full functionality works
- [ ] **Edge**: Full functionality works

**Expected Results:**
- Consistent behavior across browsers
- No browser-specific bugs
- Fallbacks work for unsupported features

---

## 11. Edge Case Tests

### Network Conditions
- [ ] **Offline**: Graceful handling of network errors
- [ ] **Slow 3G**: App remains usable on slow connections
- [ ] **Flaky connection**: Handles intermittent connectivity

### Device Orientation
- [ ] **Portrait mode**: Primary testing orientation
- [ ] **Landscape mode**: Layout adapts gracefully
- [ ] **Rotation**: Smooth transition between orientations

### System Settings
- [ ] **Large text**: Respects iOS/Android text size settings
- [ ] **Dark mode**: Dark mode styling works correctly
- [ ] **Reduced motion**: Respects prefers-reduced-motion

### Authentication Edge Cases
- [ ] **Session expiry**: Handles expired JWT gracefully
- [ ] **401 errors**: Redirects to sign-in on auth failure
- [ ] **No internet**: Shows appropriate error message

**Expected Results:**
- Graceful degradation on poor network
- Proper error messages for all failure cases
- App remains usable in all orientations

---

## 12. Integration Tests

### Auth Flow
- [ ] **Sign in**: Complete sign-in flow from mobile homepage
- [ ] **Redirect**: After auth, redirect to intended destination works
- [ ] **Session persist**: Session survives page refresh
- [ ] **Sign out**: Sign out button works, clears session

### Report Generation
- [ ] **Create report**: Navigate from homepage → generate → create report
- [ ] **View reports**: Navigate to reports list, see created reports
- [ ] **Report details**: Open report, view full content

### Settings
- [ ] **Profile update**: Edit profile information
- [ ] **Preferences**: Toggle settings, save successfully
- [ ] **Navigation**: Settings page accessible from multiple routes

**Expected Results:**
- Complete user flows work end-to-end
- No navigation errors
- State persists correctly across pages

---

## Quick Smoke Test (5 minutes)

For rapid validation before deployments:

1. [ ] **Load homepage** - Mobile homepage loads correctly on simulator
2. [ ] **Scroll test** - Can scroll smoothly on iOS
3. [ ] **Platform detection** - Web shows web version, mobile shows mobile version
4. [ ] **Navigation** - Bottom nav works, navigates to dashboard
5. [ ] **Sign-in** - Sign-in page displays correctly on mobile
6. [ ] **Pricing blocked** - Pricing page shows redirect on mobile
7. [ ] **Build passes** - `npm run build` succeeds with no errors
8. [ ] **No console errors** - Browser console is clean (no errors or warnings)

---

## Automated Testing

### Unit Tests
```bash
npm run test
```
- Component rendering tests
- Hook behavior tests
- Utility function tests

### E2E Tests (Playwright)
```bash
npm run test:e2e
```
- Full user flow tests
- Multi-browser testing (Chromium, Firefox, WebKit)
- Mobile viewport tests

---

## Known Issues / Limitations

### Current Limitations
1. **Capacitor not installed**: Push notifications and IAP code ready but requires Capacitor installation
2. **Test mode only**: Some E2E tests require `NEXT_PUBLIC_TEST_MODE=true`
3. **Mock auth**: E2E tests use `NEXT_PUBLIC_BYPASS_AUTH=true` for testing

### Future Enhancements
1. **Capacitor integration**: Install Capacitor for native device features
2. **Push notifications**: Enable FCM token registration (code ready)
3. **In-app purchases**: Implement Apple/Google IAP (hooks ready)
4. **Offline support**: Add service worker for offline functionality
5. **Progressive Web App**: Full PWA implementation

---

## Deployment Checklist

Before deploying to production:

### Pre-Deployment Tests
- [ ] All critical smoke tests pass
- [ ] Production build succeeds (`npm run build`)
- [ ] No TypeScript errors (`npm run lint`)
- [ ] E2E tests pass (`npm run test:e2e`)
- [ ] Lighthouse audit scores > 90

### Environment Variables
- [ ] `NEXT_PUBLIC_API_BASE` set correctly
- [ ] `NEXT_PUBLIC_SUPABASE_URL` set correctly
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set correctly
- [ ] `NEXT_PUBLIC_RADLY_CLIENT_KEY` set correctly
- [ ] `NEXT_PUBLIC_SITE_URL` set correctly

### Mobile App Submission
- [ ] Test on real iOS device (not just simulator)
- [ ] Test on real Android device (not just emulator)
- [ ] App Store screenshots prepared
- [ ] Privacy policy updated
- [ ] App Store metadata filled out
- [ ] IAP products configured in App Store Connect / Google Play Console

---

## Bug Reporting Template

When reporting issues found during testing:

```markdown
**Issue**: [Brief description]

**Platform**: iOS Simulator 17.0 / Android Emulator / Desktop Chrome

**Steps to Reproduce**:
1. Navigate to...
2. Tap/Click...
3. Observe...

**Expected Behavior**: [What should happen]

**Actual Behavior**: [What actually happens]

**Screenshots**: [If applicable]

**Console Errors**: [Copy any errors from browser console]

**Additional Context**: [Any other relevant details]
```

---

## Testing Sign-Off

Once all tests pass, document the results:

**Tested By**: ___________________
**Date**: ___________________
**Version**: ___________________
**Platform(s)**: iOS / Android / Web

**Status**:
- [ ] All critical tests passed
- [ ] All non-critical tests passed
- [ ] Known issues documented
- [ ] Ready for production deployment

**Notes**: ___________________
