import { I18N, DEFAULT_LANGUAGE } from '../constants';
import useGameStore from '../store/gameStore';

export function t(key, params) {
  // Hook version for React components
  const lang = useGameStore.getState().meta?.language || DEFAULT_LANGUAGE;
  let str = I18N[lang]?.[key] || I18N[DEFAULT_LANGUAGE][key] || key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      str = str.replace(`{${k}}`, v);
    });
  }
  return str;
}

export function useT() {
  // React hook for translation
  const lang = useGameStore(s => s.meta?.language || DEFAULT_LANGUAGE);
  return (key, params) => {
    let str = I18N[lang]?.[key] || I18N[DEFAULT_LANGUAGE][key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        str = str.replace(`{${k}}`, v);
      });
    }
    return str;
  };
}
