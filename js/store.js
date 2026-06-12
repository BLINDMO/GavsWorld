/* Gavin's World — local storage layer. Everything saves on-device. */
const Store = (() => {
  const NS = 'gw:';
  const get = (key, fallback) => {
    try {
      const raw = localStorage.getItem(NS + key);
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  };
  const set = (key, value) => {
    try { localStorage.setItem(NS + key, JSON.stringify(value)); } catch {}
  };
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

  return {
    uid,
    getScrolls: () => get('scrolls', []),
    setScrolls: (v) => set('scrolls', v),
    getWheels:  () => get('wheels', []),
    setWheels:  (v) => set('wheels', v),
    getArmory:  () => get('armory', []),
    setArmory:  (v) => set('armory', v),
    getAvatar:  () => get('avatar', null),
    setAvatar:  (v) => set('avatar', v),
  };
})();
