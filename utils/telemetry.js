// Définir __DEV__ globalement si absent
if (typeof global !== 'undefined' && typeof global.__DEV__ === 'undefined') {
  global.__DEV__ = false;
}

/**
 * BREACH — Télémétrie locale (point d'entrée unique)
 *
 * Cette implémentation est volontairement minimale pour démarrer vite.
 * Quand un backend analytics est branché, il suffira de remplacer le corps
 * de trackEvent sans toucher au code gameplay.
 */

export function trackEvent(name, payload = {}) {
  if (!name) return;

  const event = {
    name,
    payload,
    ts: Date.now(),
  };

  // En dev, laisser une trace lisible dans la console Metro.
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    // eslint-disable-next-line no-console
    console.log('[telemetry]', event);
  }
}
