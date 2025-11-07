export async function hideSplashSafely() {
  try {
    if (typeof window === 'undefined') return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cap = (window as any).Capacitor
    if (!cap?.isNativePlatform?.()) return
    const { SplashScreen } = await import('@capacitor/splash-screen')
    // Wait 2 seconds (matching launchShowDuration in capacitor.config.ts) before hiding
    // The native splash is shown for 2000ms, we wait that duration before fading it out
    await new Promise(resolve => setTimeout(resolve, 2000))
    // Fade out over 300ms
    await SplashScreen.hide({ fadeOutDuration: 300 })
  } catch (err) {
    // Non-fatal if plugin not present
    console.warn('Splash hide skipped:', err)
  }
}

