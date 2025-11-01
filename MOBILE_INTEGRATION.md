# Mobile Integration Guide

This guide explains how the Radly frontend integrates with Capacitor for native iOS and Android app deployment, with special focus on mobile subscriptions and push notifications.

## Table of Contents

1. [Platform Detection](#platform-detection)
2. [Mobile Subscriptions](#mobile-subscriptions)
3. [Push Notifications](#push-notifications)
4. [Capacitor Setup](#capacitor-setup)
5. [Testing on Devices](#testing-on-devices)
6. [Troubleshooting](#troubleshooting)

---

## Platform Detection

The app automatically detects if it's running on web, iOS, or Android and adjusts the UI accordingly.

### How It Works

```typescript
import { usePlatform } from '@/hooks/usePlatform'

function MyComponent() {
  const {
    platform,           // 'web' | 'ios' | 'android'
    isNativeApp,        // boolean
    isWebApp,           // boolean
    shouldShowWebSubscriptions,
    shouldShowMobileSubscriptions
  } = usePlatform()

  if (isNativeApp) {
    return <div>Native app UI</div>
  }
  return <div>Web app UI</div>
}
```

### Platform-Specific Behavior

| Feature | Web | iOS | Android |
|---------|-----|-----|---------|
| Pricing page | ✅ Full | ❌ Hidden | ❌ Hidden |
| Checkout | ✅ Full | ❌ Redirects to App Store | ❌ Redirects to Google Play |
| Subscriptions | ✅ Stripe | ✅ App Store IAP | ✅ Google Play IAP |
| Push notifications | ⚠️ Graceful degradation | ✅ FCM | ✅ FCM |

---

## Mobile Subscriptions

### Supported Stores

- **iOS**: Apple App Store (StoreKit 2)
- **Android**: Google Play Billing Library

### Product IDs

Standard format for both platforms:
```
radly_starter_monthly
radly_professional_monthly
radly_premium_monthly
radly_starter_yearly
radly_professional_yearly
radly_premium_yearly
```

### Subscription Flow

#### 1. User Makes Purchase

User completes purchase in app store (StoreKit 2 or Google Play Billing).

#### 2. App Receives Receipt/Token

```typescript
// iOS (via Capacitor/StoreKit 2)
const receipt = await getReceiptFromStoreKit()

// Android (via Capacitor/Google Play)
const purchaseToken = await getPurchaseTokenFromGooglePlay()
```

#### 3. App Verifies with Backend

```typescript
import { useVerifyAppleReceipt, useVerifyGooglePurchase } from '@/hooks/useMobileSubscription'

// iOS
const { mutate: verifyReceipt } = useVerifyAppleReceipt()
verifyReceipt({
  receipt_data: receipt,
  product_id: 'radly_professional_monthly'
})

// Android
const { mutate: verifyPurchase } = useVerifyGooglePurchase()
verifyPurchase({
  purchase_token: token,
  product_id: 'radly_professional_monthly'
})
```

#### 4. Backend Updates Subscription

Backend verifies with Apple/Google and creates/updates subscription in database.

#### 5. Frontend Shows Updated Status

```typescript
import { useSubscriptionStatus } from '@/hooks/useSubscription'

function SubscriptionPage() {
  const { data } = useSubscriptionStatus()

  if (data?.current_tier.platform === 'ios') {
    return <div>Active iOS subscription</div>
  }
}
```

### Restore Purchases

When user logs in on a new device or reinstalls:

```typescript
import { useRestorePurchases } from '@/hooks/useMobileSubscription'

const { mutate: restore } = useRestorePurchases()

// iOS
restore({
  platform: 'ios',
  receipt_data: latestReceipt
})

// Android
restore({
  platform: 'android',
  purchase_tokens: allPurchaseTokens
})
```

### Sync Subscriptions

Manually refresh subscription status from stores:

```typescript
import { useSyncSubscriptions } from '@/hooks/useMobileSubscription'

const { mutate: sync, isPending } = useSyncSubscriptions({
  onSuccess: (data) => {
    console.log(`Synced ${data.synced_count} subscriptions`)
  }
})

sync()
```

### Multi-Platform Subscriptions

Users can have subscriptions on multiple platforms simultaneously. The app shows the **highest tier**:

```typescript
const { data } = useSubscriptionStatus()

// If user has Professional on iOS and Starter on Android:
// - active_subscriptions: [Professional (iOS), Starter (Android)]
// - current_tier: Professional (iOS) ← Used for access control
```

---

## Push Notifications

### Firebase Cloud Messaging (FCM)

Push notifications use FCM to send alerts to mobile devices:
- Report generation complete
- Report generation failed
- Usage limit warnings
- Subscription expiring soon

### Permission Flow

On native apps, users see a permission prompt:

```
┌─────────────────────────┐
│  Enable Notifications   │
│                         │
│  Get notified when:     │
│  • Report ready         │
│  • Approaching limit    │
│  • Subscription exp.    │
│                         │
│  [Enable]  [Not Now]   │
└─────────────────────────┘
```

The prompt:
- Shows **once** on first app launch
- Remembers user's choice
- Can be reset manually

### Registration Flow

```typescript
import { useRegisterFCMToken } from '@/hooks/useNotifications'

const { mutate: register, isPending } = useRegisterFCMToken({
  onSuccess: () => {
    console.log('Push notifications enabled!')
  }
})

register({
  fcm_token: 'token_from_firebase',
  platform: 'ios',  // or 'android'
  device_name: 'iPhone 14 Pro'
})
```

### Handling Notifications

When user receives a notification, they can:
1. **Tap notification** - Opens app to relevant screen
2. **See toast** - In-app notification if app is open

```typescript
// Automatic handling in NotificationHandler.tsx
// No action needed from developers - fully integrated in layout
```

### Test Notifications

Send test notification to verify setup:

```typescript
import { useSendTestNotification } from '@/hooks/useNotifications'

const { mutate: sendTest } = useSendTestNotification()
sendTest()  // Sends to first registered token
```

### Unregister Device

Stop notifications on a device:

```typescript
import { useUnregisterFCMToken } from '@/hooks/useNotifications'

const { mutate: unregister } = useUnregisterFCMToken()
unregister({ fcm_token: 'token_to_remove' })
```

---

## Capacitor Setup

### Prerequisites

- Node.js 18+
- iOS: Xcode 14+ with iOS 13+ SDK
- Android: Android Studio with API 24+

### Installation Steps

#### 1. Install Capacitor

```bash
npm install @capacitor/core @capacitor/cli
npx cap init
```

#### 2. Add Platforms

```bash
# iOS
npx cap add ios

# Android
npx cap add android
```

#### 3. Install Push Notifications Plugin

```bash
npm install @capacitor/push-notifications
npx cap sync
```

#### 4. iOS: Configure APNS

1. Open `ios/App/App.xcworkspace` in Xcode
2. Go to Project → Signing & Capabilities
3. Add "Push Notifications" capability
4. Configure with your APNS certificate

#### 5. Android: Configure FCM

1. Create Firebase project at https://console.firebase.google.com
2. Download `google-services.json`
3. Place in `android/app/google-services.json`
4. Configure Firebase in `MainActivity.java`

#### 6. Uncomment Integration Code

The notification system is ready with Capacitor TODO markers:

**File: `src/components/notifications/NotificationPermissionPrompt.tsx` (Lines 56-90)**

```typescript
// TODO: When Capacitor is integrated, replace with:
const { PushNotifications } = await import('@capacitor/push-notifications')
// ... permission request code
```

**File: `src/components/notifications/NotificationHandler.tsx` (Lines 82-130)**

```typescript
// TODO: When Capacitor is integrated, replace with:
const { PushNotifications } = await import('@capacitor/push-notifications')
// ... listener setup code
```

Simply find these comments and uncomment the code blocks.

---

## Testing on Devices

### Simulator Testing

#### iOS Simulator

```bash
# Build and run on simulator
cd ios
open App.xcworkspace
# Select simulator and press Play
```

#### Android Emulator

```bash
# Build and run on emulator
cd android
./gradlew installDebug
```

### Device Testing

#### iOS Device

```bash
# Build for device
cd ios
xcodebuild -scheme App -configuration Debug -derivedDataPath build -destination 'generic/platform=iOS'

# Or use Xcode UI: Select device and press Play
```

#### Android Device

```bash
# Connect device via USB (enable USB debugging)
cd android
./gradlew installDebug

# Grant permissions on device when prompted
```

### Testing Subscriptions

1. **Use sandbox environment**:
   - iOS: StoreKit configuration in Xcode
   - Android: Test purchases in Google Play Console

2. **Complete purchase**:
   - Select product in app
   - Confirm purchase (free in sandbox)

3. **Verify on backend**:
   - Receipt/token sent to backend
   - Subscription created in database
   - Status updated in UI

4. **Test restore**:
   - Uninstall app
   - Reinstall and log in
   - Tap "Restore Purchases"
   - Previous subscription should reappear

### Testing Notifications

1. **Register device**:
   - App requests permission
   - User grants permission
   - FCM token registered

2. **Send test notification**:
   ```bash
   curl -X POST https://api.radly.app/v1/notifications/test \
     -H "Authorization: Bearer YOUR_JWT" \
     -H "Content-Type: application/json"
   ```

3. **Verify receipt**:
   - Notification appears on device
   - Tapping notification opens app
   - Toast appears if app is open

---

## Troubleshooting

### "Platform is not native"

**Problem**: `isNativeApp()` returns false on actual device

**Solution**:
- Verify Capacitor is installed and synced: `npx cap sync`
- Check `android/app/build.gradle` includes Capacitor dependencies
- Check iOS `Podfile` is properly configured

### "Subscription verification failed"

**Problem**: Receipt/token verification error

**Solution**:
- Verify using sandbox credentials
- Check backend logs for Apple/Google API errors
- Ensure product IDs match exactly (case-sensitive)
- Verify server has app credentials configured

### "Push notifications not received"

**Problem**: No notifications appearing on device

**Solutions**:

1. **Check permission**:
   ```typescript
   const { data } = useNotificationTokens()
   console.log('Registered tokens:', data?.tokens)
   ```

2. **Test notification**:
   ```bash
   curl -X POST https://api.radly.app/v1/notifications/test \
     -H "Authorization: Bearer YOUR_JWT"
   ```

3. **Check Firebase**:
   - Verify `google-services.json` is in correct location
   - Check Firebase credentials in backend `.env`
   - Verify device has internet connection

4. **Reset FCM token**:
   ```typescript
   const { mutate: unregister } = useUnregisterFCMToken()
   const { mutate: register } = useRegisterFCMToken()

   // Re-register
   await unregister({ fcm_token: oldToken })
   await register({ fcm_token: newToken, platform: 'ios' })
   ```

### "Can't connect to backend"

**Problem**: API requests failing

**Solution**:
- Verify `NEXT_PUBLIC_API_BASE` in build: `printenv | grep NEXT_PUBLIC_API_BASE`
- Check backend is running and accessible
- Verify CORS settings allow your app domain
- Check network connectivity on device

### "Restore purchases not working"

**Problem**: Previously purchased subscriptions not restored

**Solution**:
- Verify user is logged in with same account
- Check sandbox/production environment matches
- For iOS: Verify receipt is latest (not old)
- For Android: Verify all purchase tokens are provided
- Check backend can access store APIs

---

## Common Patterns

### Checking Subscription in Components

```typescript
import { useSubscriptionStatus } from '@/hooks/useSubscription'

function PremiumFeature() {
  const { data } = useSubscriptionStatus()
  const tier = data?.current_tier?.tier_name

  if (tier === 'premium' || tier === 'professional') {
    return <div>Premium feature content</div>
  }

  return <div>Upgrade to use this</div>
}
```

### Conditionally Showing Mobile-Specific UI

```typescript
import { usePlatform } from '@/hooks/usePlatform'

function SubscriptionCard() {
  const { isNativeApp, shouldShowMobileSubscriptions } = usePlatform()

  return (
    <div>
      {shouldShowMobileSubscriptions && isNativeApp ? (
        <button>Manage in App Store</button>
      ) : (
        <button>Change Plan</button>
      )}
    </div>
  )
}
```

### Registering for Notifications on App Start

```typescript
// Already done in NotificationHandler.tsx
// Just make sure it's rendered in app layout:

import { NotificationHandler } from '@/components/notifications/NotificationHandler'

export default function Layout() {
  return (
    <>
      {/* Other layout content */}
      <NotificationHandler autoRegister={true} />
    </>
  )
}
```

---

## API Reference

### Endpoints Used

See main documentation:
- `API_MOBILE_SUBSCRIPTIONS.md` - Subscription endpoints
- `API_NOTIFICATIONS.md` - Notification endpoints

### Key Hooks

**Subscriptions**:
- `useSubscriptionStatus()` - Get cross-platform subscription
- `useVerifyAppleReceipt()` - Verify Apple receipt
- `useVerifyGooglePurchase()` - Verify Google purchase
- `useRestorePurchases()` - Restore purchases
- `useSyncSubscriptions()` - Sync with stores

**Notifications**:
- `useRegisterFCMToken()` - Register for notifications
- `useUnregisterFCMToken()` - Unregister device
- `useNotificationTokens()` - List registered tokens
- `useSendTestNotification()` - Send test notification
- `useNotifications()` - Combined hook

---

## Next Steps

1. ✅ Frontend code is ready
2. ⏳ Set up Capacitor (follow steps above)
3. ⏳ Configure iOS APNS and Android FCM
4. ⏳ Build and test on simulators
5. ⏳ Test on real devices
6. ⏳ Submit to App Store and Google Play

## Support

For issues or questions:
- Check troubleshooting section
- Review backend API docs
- Check Capacitor documentation: https://capacitorjs.com/docs
