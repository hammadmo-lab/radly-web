# Xcode Build Settings - Recommended Fixes

This guide addresses the build settings warnings shown in Xcode.

## Quick Fix via Xcode UI

### 1. Open the project
```bash
npx cap open ios
```

### 2. Select "App" project in the navigator (blue icon at the top)

### 3. Go to "Build Settings" tab (at the top)

### 4. Make sure "All" and "Combined" are selected (filters at the top)

### 5. Apply these settings:

## Critical Settings to Change

### A. User Script Sandboxing (HIGH PRIORITY - Security)
**Current:** `NO`
**Recommended:** `YES`

**How to fix:**
1. Search for "User Script Sandboxing" or "ENABLE_USER_SCRIPT_SANDBOXING"
2. Set to **"Yes"** for both Debug and Release
3. This secures build scripts

### B. Code Signing Settings

#### For Debug Configuration:
1. Click "Debug" under "Configurations"
2. Search for "Code Signing"
3. Set these:
   - **Code Sign Identity:** "Don't Code Sign" (or leave as "Apple Development")
   - **Code Sign Style:** Automatic

#### For Release Configuration:
1. Click "Release" under "Configurations"
2. Set these:
   - **Code Sign Identity:** "Apple Distribution" (or "Apple Development" for testing)
   - **Code Sign Style:** Automatic

### C. Asset Catalog Compiler Settings
**Search for:** "ASSETCATALOG_COMPILER_GENERATE_ASSET_SYMBOL_EXTENSIONS"

**Current:** Not set
**Recommended:** `YES`

**How to fix:**
1. Search for "Generate Asset Symbol Extensions"
2. Set to **"Yes"** for both Debug and Release
3. This generates type-safe asset references

### D. Clang Module Verifier
**Search for:** "ENABLE_MODULE_VERIFIER"

**Current:** Not explicitly set
**Recommended:** `YES`

**How to fix:**
1. Search for "Enable Module Verifier"
2. Set to **"Yes"** for Release configuration
3. Can be "No" for Debug for faster builds

### E. Dead Code Stripping (Performance)
**Search for:** "DEAD_CODE_STRIPPING"

**Recommended:**
- Debug: `NO` (for better debugging)
- Release: `YES` (for smaller binary size)

## Step-by-Step Application

### Method 1: Using Xcode UI (Recommended)

1. **Open Xcode:**
   ```bash
   cd radly-frontend
   npx cap open ios
   ```

2. **Select the Project:**
   - Click on "App" (the blue icon) in the Project Navigator (left sidebar)
   - NOT the "App" folder, but the project itself

3. **Select Build Settings:**
   - Click the "Build Settings" tab at the top
   - Make sure "All" is selected (not "Basic")
   - Make sure "Combined" is selected (not "Levels")

4. **Apply Settings One by One:**

   **User Script Sandboxing:**
   - Type "sandboxing" in the search box
   - Find "User Script Sandboxing"
   - Click on the value and select "Yes"
   - Apply to both Debug and Release

   **Asset Catalog:**
   - Clear search, type "asset symbol"
   - Find "Generate Asset Symbol Extensions"
   - Set to "Yes" for both configurations

   **Module Verifier:**
   - Clear search, type "module verifier"
   - Find "Enable Module Verifier"
   - Set to "Yes" for Release (can leave "No" for Debug)

   **Dead Code Stripping:**
   - Clear search, type "dead code"
   - Find "Dead Code Stripping"
   - Debug: No
   - Release: Yes

5. **Clean and Build:**
   - Go to Product → Clean Build Folder (Cmd+Shift+K)
   - Go to Product → Build (Cmd+B)

### Method 2: Using xcconfig files (Advanced)

Create a file at `ios/App/App/BuildSettings.xcconfig`:

```xcconfig
// Radly iOS Build Settings
// Security and Performance optimizations

// User Script Sandboxing - Security
ENABLE_USER_SCRIPT_SANDBOXING = YES

// Asset Catalog Compiler
ASSETCATALOG_COMPILER_GENERATE_ASSET_SYMBOL_EXTENSIONS = YES
ASSETCATALOG_COMPILER_GENERATE_SWIFT_ASSET_SYMBOL_EXTENSIONS = YES

// Module Verifier
ENABLE_MODULE_VERIFIER[config=Release] = YES
ENABLE_MODULE_VERIFIER[config=Debug] = NO

// Dead Code Stripping
DEAD_CODE_STRIPPING[config=Release] = YES
DEAD_CODE_STRIPPING[config=Debug] = NO

// Optimization Level
GCC_OPTIMIZATION_LEVEL[config=Release] = s
GCC_OPTIMIZATION_LEVEL[config=Debug] = 0

// Swift Optimization
SWIFT_OPTIMIZATION_LEVEL[config=Release] = -O
SWIFT_OPTIMIZATION_LEVEL[config=Debug] = -Onone
```

Then in Xcode:
1. Select the project
2. Go to Info tab
3. Under Configurations, set this xcconfig file for both Debug and Release

## Verification

After applying settings, verify with:

```bash
cd ios/App
xcodebuild -project App.xcodeproj -target App -showBuildSettings | grep -E "(ENABLE_USER_SCRIPT|ASSETCATALOG_COMPILER_GENERATE|ENABLE_MODULE_VERIFIER|DEAD_CODE_STRIPPING)"
```

You should see:
```
ENABLE_USER_SCRIPT_SANDBOXING = YES
ASSETCATALOG_COMPILER_GENERATE_ASSET_SYMBOL_EXTENSIONS = YES
ENABLE_MODULE_VERIFIER = YES (for Release)
DEAD_CODE_STRIPPING = YES (for Release)
```

## Why These Settings Matter

### 🔒 User Script Sandboxing (ENABLE_USER_SCRIPT_SANDBOXING)
- **Security:** Prevents build scripts from accessing arbitrary files
- **Impact:** Required for modern Xcode projects
- **Build Time:** Minimal impact

### 🎨 Asset Symbol Generation (ASSETCATALOG_COMPILER_GENERATE_*)
- **Type Safety:** Generates Swift/ObjC code for assets
- **Developer Experience:** Autocomplete for image/color names
- **Impact:** Compile-time checking of asset names

### ✅ Module Verifier (ENABLE_MODULE_VERIFIER)
- **Reliability:** Catches module-related build issues early
- **Recommended:** Enable for Release builds
- **Build Time:** Slight increase in Release builds

### 🗑️ Dead Code Stripping (DEAD_CODE_STRIPPING)
- **App Size:** Removes unused code from binary
- **Performance:** Slightly faster launch times
- **Recommended:** Enable for Release only (disable for Debug for better debugging)

## Troubleshooting

### "Build script is not sandboxed" error
If you get sandboxing errors after enabling `ENABLE_USER_SCRIPT_SANDBOXING`:

1. Go to Build Phases
2. For each "Run Script" phase:
   - Check "For install builds only" if it's a post-build script
   - Or add input/output files to sandbox the script properly

### Code signing issues
If you get code signing errors:
- Make sure you have a valid Apple Developer account
- Select "Automatically manage signing" in the Signing & Capabilities tab
- For local testing, you can use "Sign to Run Locally"

## Capacitor Compatibility

These settings are compatible with Capacitor. After making changes:

```bash
# Sync changes
npx cap sync ios

# Rebuild
npx cap open ios
# Then build in Xcode
```

## Notes

- These warnings don't prevent builds but are best practices
- Apply them gradually if you encounter issues
- Test your app thoroughly after applying all settings
- The settings persist through `npx cap sync` operations
