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

    append(name, value) {
      const list = this.get(name, []);
      list.push(value);
      this.set(name, list);
      return list;
    },

    remove(name) {
      localStorage.removeItem(key(name));
    },

    removeMany(names = []) {
      names.forEach((n) => localStorage.removeItem(key(n)));
    },

    clearAll() {
      const toDelete = [];
      for (let i = 0; i < localStorage.length; i += 1) {
        const k = localStorage.key(i);
        if (k && k.startsWith(`${namespace}:`)) toDelete.push(k);
      }
      toDelete.forEach((k) => localStorage.removeItem(k));
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
