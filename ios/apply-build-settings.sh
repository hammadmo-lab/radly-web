#!/bin/bash

# Script to apply Radly build settings to Xcode project
# This applies the RadlyBuildSettings.xcconfig file to the project

set -e

echo "🔧 Applying Radly Build Settings to Xcode Project"
echo "=================================================="
echo ""

# Check if we're in the right directory
if [ ! -d "App/App.xcodeproj" ]; then
    echo "❌ Error: Must run this script from the ios/ directory"
    echo "   Usage: cd ios && bash apply-build-settings.sh"
    exit 1
fi

# Check if xcconfig file exists
XCCONFIG_FILE="App/App/RadlyBuildSettings.xcconfig"
if [ ! -f "$XCCONFIG_FILE" ]; then
    echo "❌ Error: RadlyBuildSettings.xcconfig not found at $XCCONFIG_FILE"
    exit 1
fi

echo "✅ Found RadlyBuildSettings.xcconfig"
echo ""

# Backup the project file
PROJECT_FILE="App/App.xcodeproj/project.pbxproj"
BACKUP_FILE="${PROJECT_FILE}.backup-$(date +%Y%m%d-%H%M%S)"

echo "💾 Creating backup..."
cp "$PROJECT_FILE" "$BACKUP_FILE"
echo "   Backup saved: $BACKUP_FILE"
echo ""

echo "📝 To apply these settings, you need to:"
echo ""
echo "1. Open Xcode:"
echo "   npx cap open ios"
echo ""
echo "2. Select 'App' project (blue icon) in the Project Navigator"
echo ""
echo "3. Go to the 'Info' tab"
echo ""
echo "4. Under 'Configurations', expand both Debug and Release"
echo ""
echo "5. Click the '+' button to add configuration file:"
echo "   - For Debug: Based on configuration file 'RadlyBuildSettings'"
echo "   - For Release: Based on configuration file 'RadlyBuildSettings'"
echo ""
echo "6. Or manually in Build Settings, you can:"
echo "   - Search for each setting name"
echo "   - Apply the values from RadlyBuildSettings.xcconfig"
echo ""
echo "🔍 The xcconfig file contains:"
grep -E "^[A-Z_]+.*=.*" "$XCCONFIG_FILE" | head -20
echo ""
echo "📖 For detailed instructions, see: ios/XCODE_SETTINGS_GUIDE.md"
echo ""
echo "⚠️  Alternative: Quick Apply via xcodebuild"
echo ""
read -p "Would you like to try applying via xcodebuild? (y/N) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Attempting to apply settings via xcodebuild..."
    echo ""

    cd App

    # Apply for Debug configuration
    echo "  Applying to Debug configuration..."
    xcrun xcodebuild -project App.xcodeproj \
        -target App \
        -configuration Debug \
        ENABLE_USER_SCRIPT_SANDBOXING=YES \
        ASSETCATALOG_COMPILER_GENERATE_ASSET_SYMBOL_EXTENSIONS=YES \
        ENABLE_MODULE_VERIFIER=NO \
        DEAD_CODE_STRIPPING=NO \
        GCC_OPTIMIZATION_LEVEL=0 \
        SWIFT_OPTIMIZATION_LEVEL=-Onone \
        ENABLE_TESTABILITY=YES \
        > /dev/null 2>&1

    # Apply for Release configuration
    echo "  Applying to Release configuration..."
    xcrun xcodebuild -project App.xcodeproj \
        -target App \
        -configuration Release \
        ENABLE_USER_SCRIPT_SANDBOXING=YES \
        ASSETCATALOG_COMPILER_GENERATE_ASSET_SYMBOL_EXTENSIONS=YES \
        ENABLE_MODULE_VERIFIER=YES \
        DEAD_CODE_STRIPPING=YES \
        GCC_OPTIMIZATION_LEVEL=s \
        SWIFT_OPTIMIZATION_LEVEL=-O \
        STRIP_SWIFT_SYMBOLS=YES \
        > /dev/null 2>&1

    cd ..

    echo ""
    echo "✅ Settings applied via xcodebuild"
    echo ""
    echo "⚠️  Note: xcodebuild may not persist all settings."
    echo "   It's recommended to also apply via Xcode UI for persistence."
else
    echo ""
    echo "⏭️  Skipping automatic application"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Open Xcode: npx cap open ios"
echo "2. Clean Build Folder: Product → Clean Build Folder (⇧⌘K)"
echo "3. Build: Product → Build (⌘B)"
echo "4. Verify warnings are resolved"
echo ""
echo "📊 To verify current settings:"
echo "cd ios/App && xcodebuild -project App.xcodeproj -target App -showBuildSettings | grep -E '(ENABLE_USER_SCRIPT|ASSETCATALOG_COMPILER_GENERATE|ENABLE_MODULE_VERIFIER)'"
echo ""
echo "✨ Done!"
