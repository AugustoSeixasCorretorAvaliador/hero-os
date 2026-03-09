function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function clone(data) {
  return JSON.parse(JSON.stringify(data));
}

export function createEngine({ storage, insight }) {
  let state = null;

  function withInsights(current) {
    current.items = current.items.map((item) => ({
      ...item,
      suggestion: insight.forItem(item)
    }));
    return current;
  }

  function save() {
    storage.set('state', state);
    return state;
  }

  function init(template) {
    const saved = storage.get('state');
    const savedProfile = storage.get('profile');

    const isSameDay = saved && saved.date === todayISO();

    state = isSameDay
      ? withInsights(saved)
      : withInsights({
          module: template.module,
          title: template.title,
          date: todayISO(),
          profile: savedProfile || clone(template.profile),
          items: clone(template.items)
        });

    return state;
  }

  function getState() {
    return state;
  }

  function updateProfile(profile) {
    state.profile = { ...state.profile, ...profile };
    storage.set('profile', state.profile);
    return save();
  }

  function toggleDone(itemId) {
    state.items = state.items.map((item) =>
      item.id === itemId ? { ...item, done: !item.done, completedAt: !item.done ? todayISO() : null } : item
    );
    return save();
  }

  function changeLoad(itemId, delta) {
    state.items = state.items.map((item) => {
      if (item.id !== itemId) return item;
      const load = Math.max(0, Number((item.load + delta).toFixed(1)));
      const updated = { ...item, load, loadDate: todayISO() };
      updated.suggestion = insight.forItem(updated);
      return updated;
    });
    return save();
  }

  function resetChecks() {
    state.items = state.items.map((item) => ({ ...item, done: false, completedAt: null }));
    return save();
  }

  function completion() {
    const total = state.items.length || 1;
    const done = state.items.filter((item) => item.done).length;
    return Math.round((done / total) * 100);
  }

  function exportData() {
    return {
      exportedAt: new Date().toISOString(),
      state,
      storage: storage.export()
    };
  }

  return {
    init,
    getState,
    updateProfile,
    toggleDone,
    changeLoad,
    resetChecks,
    completion,
    exportData,
    save
  };
}
