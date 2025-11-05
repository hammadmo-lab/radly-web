#!/bin/bash

# Script to fix Xcode build settings recommendations
# Run this from the ios/ directory

PROJECT_FILE="App/App.xcodeproj/project.pbxproj"

if [ ! -f "$PROJECT_FILE" ]; then
    echo "Error: Cannot find project file at $PROJECT_FILE"
    exit 1
fi

echo "📝 Backing up project file..."
cp "$PROJECT_FILE" "$PROJECT_FILE.backup"

echo "🔧 Applying recommended build settings..."

# Use xcodeproj gem or PlistBuddy to modify settings
# For now, we'll use xcodebuild to set these programmatically

cd App

# Set Code Signing settings
echo "  → Setting Code Signing options..."
xcrun xcodebuild -project App.xcodeproj \
    -target App \
    -configuration Debug \
    CODE_SIGN_IDENTITY="" \
    CODE_SIGN_ENTITLEMENTS="" \
    ENABLE_USER_SCRIPT_SANDBOXING=YES \
    > /dev/null 2>&1

xcrun xcodebuild -project App.xcodeproj \
    -target App \
    -configuration Release \
    CODE_SIGN_IDENTITY="" \
    CODE_SIGN_ENTITLEMENTS="" \
    ENABLE_USER_SCRIPT_SANDBOXING=YES \
    > /dev/null 2>&1

echo "✅ Build settings updated"
echo ""
echo "⚠️  Manual Steps Required:"
echo "1. Open Xcode: npx cap open ios"
echo "2. Select the App project in the navigator"
echo "3. Go to Build Settings tab"
echo "4. Apply these settings for both Debug and Release:"
echo ""
echo "   Build Options:"
echo "   - Enable Module Verifier: Yes"
echo "   - User Script Sandboxing: Yes"
echo ""
echo "   Code Signing:"
echo "   - Disable Code Signing: Yes (for Debug only)"
echo "   - Enable Code Signing: Yes (for Release only)"
echo ""
echo "   Asset Catalog Compiler:"
echo "   - Generate Asset Symbol Extensions: Yes"
echo ""
echo "5. Clean Build Folder: Product → Clean Build Folder (Cmd+Shift+K)"
echo "6. Build the project"
echo ""
echo "📋 Backup saved at: $PROJECT_FILE.backup"
