export async function hideSplashSafely() {
  try {
    if (typeof window === 'undefined') return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cap = (window as any).Capacitor
    if (!cap?.isNativePlatform?.()) return
    const { SplashScreen } = await import('@capacitor/splash-screen')
    // Fade out quickly once the app is ready
    await SplashScreen.hide({ fadeOutDuration: 300 })
  } catch (err) {
    // Non-fatal if plugin not present
    console.warn('Splash hide skipped:', err)
  }
}

