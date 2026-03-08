export function createStorage(namespace = 'hero-os') {
  const key = (name) => `${namespace}:${name}`;

  return {
    get(name, fallback = null) {
      try {
        const raw = localStorage.getItem(key(name));
        return raw ? JSON.parse(raw) : fallback;
      } catch {
        return fallback;
      }
    },

    set(name, value) {
      localStorage.setItem(key(name), JSON.stringify(value));
    },

    remove(name) {
      localStorage.removeItem(key(name));
    },

    export() {
      const dump = {};
      for (let i = 0; i < localStorage.length; i += 1) {
        const k = localStorage.key(i);
        if (k && k.startsWith(`${namespace}:`)) {
          dump[k.replace(`${namespace}:`, '')] = JSON.parse(localStorage.getItem(k));
        }
      }
      return dump;
    }
  };
}
