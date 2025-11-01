# Mobile Dashboard Scrolling Fix

## Issue
The mobile dashboard (`mobile.page.tsx`) was not scrollable, preventing users from accessing content below the fold.

## Root Cause
The original implementation used:
```tsx
<div className="min-h-screen bg-[#0A0E1A] pb-24">
  {/* header */}
  <motion.div className="sticky top-0...">
  </motion.div>

  <div className="px-4 py-6 space-y-6">
    {/* content */}
  </div>
</div>
```

**Problem**: `min-h-screen` only sets a minimum height but doesn't create a scrolling container when content overflows.

## Solution Implemented

Changed the container structure to use **CSS Flexbox** with proper overflow handling:

### Before:
```tsx
<div className="min-h-screen bg-[#0A0E1A] pb-24">
  <motion.div className="sticky top-0...">
  </motion.div>
  <div className="px-4 py-6 space-y-6">
    {/* content */}
  </div>
</div>
```

### After:
```tsx
<div className="h-dvh bg-[#0A0E1A] flex flex-col">
  <motion.div className="sticky top-0 z-10 shrink-0">
  </motion.div>

  <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 pb-24">
    {/* content */}
  </div>
</div>
```

## Key Changes

1. **Outer container**:
   - Changed from `min-h-screen` to `h-dvh flex flex-col`
   - `h-dvh` = 100% of dynamic viewport height
   - `flex flex-col` = Enables flexbox layout

2. **Header**:
   - Added `shrink-0` to prevent shrinking
   - Remains sticky at the top

3. **Content area**:
   - Added `flex-1` to fill remaining space
   - Added `overflow-y-auto` to enable vertical scrolling
   - Kept `pb-24` for bottom navigation spacing

## Why This Works

- **Flexbox**: Creates a proper container that respects viewport boundaries
- **Shrinking prevention**: Header stays at fixed size
- **Flexible content**: Content area expands to fill space and becomes scrollable
- **Overflow handling**: `overflow-y-auto` enables scrolling when content exceeds container height

## Testing

Build completed successfully:
```bash
✓ Compiled successfully in 5.1s
✓ Generating static pages (32/32)
```

## Browser Compatibility

- `h-dvh` - Supported in iOS Safari 14+ and all modern browsers
- Alternative: Can use `h-screen` (100vh) for broader compatibility if needed

## Files Modified

- `/src/app/app/dashboard/mobile.page.tsx` - Fixed scrollable container structure

---

**Date**: 2025-10-31
**Status**: ✅ Complete
**Build**: ✅ Passing
