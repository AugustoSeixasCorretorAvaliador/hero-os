function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function clone(data) {
  return JSON.parse(JSON.stringify(data));
}

function latestHistoryFor(id, history) {
  return history
    .filter((h) => h.exerciseId === id)
    .sort((a, b) => (a.date < b.date ? 1 : -1))[0];
}

export function createEngine({ storage, insight }) {
  let state = null;
  let history = [];

  function withInsights(current) {
    current.items = current.items.map((item) => {
      const lastHist = latestHistoryFor(item.id, history);
      return {
        ...item,
        suggestion: insight.forItem(item, lastHist)
      };
    });
    return current;
  }

  function save() {
    storage.set('state', state);
    return state;
  }

  function init(template) {
    const saved = storage.get('state');
    history = storage.get('training-history', []);
    const savedProfile = storage.get('profile');

    const isSameDay = saved && saved.date === todayISO();

    const baseTemplate = {
      module: template.module,
      title: template.title,
      date: todayISO(),
      profile: savedProfile || clone(template.profile),
      items: clone(template.items)
    };

    const mergeHistory = (items) =>
      items.map((item) => {
        const lastHist = latestHistoryFor(item.id, history);
        const load = (lastHist && lastHist.load) ?? item.load ?? item.defaultLoad ?? 0;
        const loadDate = (lastHist && lastHist.date) ?? item.loadDate ?? todayISO();
        return { ...item, load, loadDate, done: false };
      });

    state = isSameDay ? saved : { ...baseTemplate, items: mergeHistory(baseTemplate.items) };
    state = withInsights(state);

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
    const today = todayISO();

    state.items = state.items.map((item) => {
      if (item.id !== itemId) return item;
      const toggled = { ...item, done: !item.done, completedAt: !item.done ? today : null };
      if (!item.done) {
        const record = {
          exerciseId: item.id,
          load: item.load,
          date: today,
          completed: true
        };
        history = storage.append('training-history', record);
        toggled.loadDate = today;
      }
      toggled.suggestion = insight.forItem(toggled, latestHistoryFor(item.id, history));
      return toggled;
    });

    return save();
  }

  function changeLoad(itemId, delta) {
    state.items = state.items.map((item) => {
      if (item.id !== itemId) return item;
      const step = item.progressionStep || 1;
      const load = Math.max(0, Number((item.load + delta * step).toFixed(1)));
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
      storage: storage.export(),
      history
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
