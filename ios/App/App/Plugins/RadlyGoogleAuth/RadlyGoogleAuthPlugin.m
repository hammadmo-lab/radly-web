#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

// Define the plugin using CAP_PLUGIN Macro, and expose the plugin methods
CAP_PLUGIN(RadlyGoogleAuth, "RadlyGoogleAuth",
  CAP_PLUGIN_METHOD(signIn, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(signOut, CAPPluginReturnPromise);
)