/**
 * Haptic feedback utilities for mobile devices
 * Provides tactile feedback for user interactions
 */

export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

/**
 * Trigger haptic feedback on supported devices
 * @param type - The intensity/type of haptic feedback
 */
export const triggerHaptic = (type: HapticType = 'light'): void => {
  // Check if vibration API is supported
  if (!('vibrate' in navigator)) {
    return;
  }

  // Define vibration patterns for different feedback types
  const patterns: Record<HapticType, number | number[]> = {
    light: 10,
    medium: 20,
    heavy: 30,
    success: [10, 50, 10],
    warning: [20, 100, 20],
    error: [30, 50, 30, 50, 30],
  };

  try {
    navigator.vibrate(patterns[type]);
  } catch (error) {
    // Silently fail if vibration is not supported or blocked
    console.debug('Haptic feedback not available:', error);
  }
};

/**
 * Cancel any ongoing vibration
 */
export const cancelHaptic = (): void => {
  if ('vibrate' in navigator) {
    navigator.vibrate(0);
  }
};

/**
 * Check if haptic feedback is available
 */
export const isHapticAvailable = (): boolean => {
  return 'vibrate' in navigator;
};
