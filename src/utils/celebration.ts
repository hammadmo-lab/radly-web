import confetti from 'canvas-confetti';

/**
 * Celebration utilities for success animations
 */

/**
 * Trigger confetti celebration
 * @param type - Type of celebration effect
 */
export const triggerCelebration = (type: 'success' | 'complete' | 'burst' = 'success'): void => {
  const colors = ['#10b981', '#14b8a6', '#8b5cf6', '#06b6d4', '#22c55e'];

  switch (type) {
    case 'success':
      // Side cannons
      const count = 200;
      const defaults = {
        origin: { y: 0.7 },
        colors: colors
      };

      function fire(particleRatio: number, opts: confetti.Options) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      }

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
      });

      fire(0.2, {
        spread: 60,
      });

      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
      });

      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
      });

      fire(0.1, {
        spread: 120,
        startVelocity: 45,
      });
      break;

    case 'complete':
      // Continuous rain from top
      const duration = 3 * 1000; // 3 seconds
      const animationEnd = Date.now() + duration;

      (function frame() {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0 },
          colors: colors,
        });

        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0 },
          colors: colors,
        });

        if (Date.now() < animationEnd) {
          requestAnimationFrame(frame);
        }
      })();
      break;

    case 'burst':
      // Single burst from center
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: colors,
      });
      break;
  }
};

/**
 * Create a custom confetti shape (medical cross)
 * Note: Using simple burst instead of custom shape due to TypeScript complexity
 */
export const medicalCrossCelebration = (): void => {
  confetti({
    particleCount: 50,
    spread: 100,
    origin: { y: 0.6 },
    colors: ['#10b981', '#14b8a6', '#8b5cf6'],
    scalar: 2
  });
};

/**
 * Fireworks effect
 */
export const fireworksCelebration = (): void => {
  const duration = 5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ['#10b981', '#14b8a6', '#8b5cf6', '#06b6d4', '#22c55e']
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ['#10b981', '#14b8a6', '#8b5cf6', '#06b6d4', '#22c55e']
    });
  }, 250);
};

/**
 * Clear all active confetti
 */
export const clearCelebration = (): void => {
  confetti.reset();
};

/**
 * Check if celebrations are enabled (respects reduced motion)
 */
export const isCelebrationEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return !mediaQuery.matches;
};
