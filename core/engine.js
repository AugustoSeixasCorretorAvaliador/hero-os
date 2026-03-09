const DAY_ALIASES = {
  sunday: ['domingo'],
  monday: ['segunda', 'segunda-feira'],
  tuesday: ['terca', 'ter\u00e7a', 'terca-feira', 'ter\u00e7a-feira'],
  wednesday: ['quarta', 'quarta-feira'],
  thursday: ['quinta', 'quinta-feira'],
  friday: ['sexta', 'sexta-feira'],
  saturday: ['sabado', 's\u00e1bado', 'sabado-feira']
};

const DEFAULT_PROFILE = {
  name: '',
  age: '',
  weight: '',
  height: '',
  sex: '',
  trainingDays: []
};

function todayISO(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function normalizeDayName(dayInput) {
  const dayText = (dayInput || '').toString().trim().toLowerCase();
  if (!dayText) return null;
  const plain = dayText.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const isoNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const matchFromAliases = Object.entries(DAY_ALIASES).find(([, aliases]) =>
    aliases.some((alias) => plain.startsWith(alias))
  );
  if (matchFromAliases) return matchFromAliases[0];

  const matchIso = isoNames.find((iso) => plain.startsWith(iso.slice(0, 3)));
  return matchIso || null;
}

function dayKeyFromDate(date = new Date()) {
  const isoNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return isoNames[date.getDay()];
}

function clone(data) {
  return JSON.parse(JSON.stringify(data));
}

function latestHistoryFor(id, history) {
  return history
    .filter((h) => h.exerciseId === id)
    .sort((a, b) => (a.date < b.date ? 1 : -1))[0];
}

function daysBetween(startISO, endISO) {
  const start = new Date(`${startISO}T00:00:00`);
  const end = new Date(`${endISO}T00:00:00`);
  const diff = end.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function indexLibrary(library) {
  const map = {};
  if (!library) return map;
  if (Array.isArray(library.categories)) {
    library.categories.forEach((cat) => {
      (cat.exercises || []).forEach((ex) => {
        map[ex.id] = { ...ex, category: cat.name };
      });
    });
  }
  return map;
}

function exercisesForDay(plan, dayKey) {
  if (!plan) return [];
  const normalizedDay = normalizeDayName(dayKey);

  const list = Array.isArray(plan) ? plan : plan.trainingDays || plan.training_days || [];

  if (Array.isArray(list) && list.length) {
    const entry = list.find((d) => normalizeDayName(d.day) === normalizedDay);
    if (entry) return entry.exercises || [];
  }

  if (plan && typeof plan === 'object') {
    const matchKey = Object.keys(plan).find((k) => normalizeDayName(k) === normalizedDay);
    if (matchKey) return plan[matchKey];
  }

  return [];
}

export function createEngine({ storage, insight, library, trainingPlan }) {
  const libraryMap = indexLibrary(library);
  const planFromStorage = storage.get('trainingPlan', null);
  let history = storage.get('trainingHistory', []);
  let plan = planFromStorage || trainingPlan || { trainingDays: [] };
  let planWasStored = planFromStorage !== null;
  let state = {
    date: todayISO(),
    dayKey: dayKeyFromDate(),
    profile: storage.get('profile', clone(DEFAULT_PROFILE)),
    items: []
  };

  function computeSuggested(meta, lastHistory, today = todayISO()) {
    if (!lastHistory || !lastHistory.date) return meta.defaultLoad ?? 0;
    const gap = daysBetween(lastHistory.date, today);
    const canProgress = gap >= (meta.recoveryDays || 0);
    const step = meta.progressionStep || 0;
    const nextLoad = canProgress ? lastHistory.load + step : lastHistory.load;
    return Number((nextLoad || 0).toFixed(1));
  }

  function buildInsight(meta, lastHistory, suggestedLoad) {
    const benefit = meta.benefit || meta.benefitInsight || 'Prossiga com execu\u00e7\u00e3o controlada.';
    const lastLoad = lastHistory?.load ?? meta.defaultLoad ?? 0;
    const delta = Number((suggestedLoad - lastLoad).toFixed(1));
    return insight.build({
      benefit,
      delta,
      suggestedLoad,
      loadUnit: meta.loadUnit || 'kg'
    });
  }

  function hydrateExercise(id, todayIso) {
    const meta =
      libraryMap[id] ||
      {
        id,
        label: id,
        equipment: 'livre',
        videoUrl: '',
        progressionStep: 1,
        recoveryDays: 2,
        defaultLoad: 0,
        loadUnit: 'kg'
      };

    const last = latestHistoryFor(id, history);
    const currentLoad = last?.load ?? meta.defaultLoad ?? 0;
    const suggestedLoad = computeSuggested(meta, last, todayIso);

    return {
      id: meta.id,
      label: meta.label || meta.id,
      equipment: meta.equipment || 'livre',
      category: meta.category,
      load: Number(currentLoad.toFixed(1)),
      suggestedLoad,
      loadUnit: meta.loadUnit || 'kg',
      progressionStep: meta.progressionStep || 0,
      recoveryDays: meta.recoveryDays || 0,
      videoUrl: meta.videoUrl || '',
      lastDate: last?.date || null,
      done: false,
      insight: buildInsight(meta, last, suggestedLoad)
    };
  }

  function generateWorkout(date = new Date()) {
    history = storage.get('trainingHistory', []);
    const today = todayISO(date);
    const dayKey = dayKeyFromDate(date);

    const exerciseIds = exercisesForDay(plan, dayKey);
    const planSignature = `${dayKey}:${exerciseIds.join('|')}`;

    const saved = storage.get('state');
    const savedSignature =
      saved && saved.items ? `${saved.dayKey}:${saved.items.map((i) => i.id).join('|')}` : null;

    const canReuseSaved = saved && saved.date === today && savedSignature === planSignature;
    if (canReuseSaved) {
      state = saved;
      return state;
    }

    const items = exerciseIds.map((id) => hydrateExercise(id, today));

    state = {
      ...state,
      date: today,
      dayKey,
      items
    };

    storage.set('state', state);
    return state;
  }

  function hasPlan() {
    const list = plan?.trainingDays || plan?.training_days || plan;
    if (Array.isArray(list)) return list.length > 0;
    if (list && typeof list === 'object') return Object.keys(list).length > 0;
    return false;
  }

  function updatePlan(newPlan) {
    plan = newPlan || { trainingDays: [] };
    storage.set('trainingPlan', plan);
    planWasStored = true;
    storage.removeMany(['state', 'trainingHistory']);
    return generateWorkout();
  }

  function resetPlan() {
    plan = { trainingDays: [] };
    planWasStored = false;
    storage.removeMany(['state', 'trainingHistory', 'trainingPlan']);
    state = { ...state, items: [] };
    return state;
  }

  function getTrainingPlan() {
    return plan;
  }

  function getLibraryList() {
    return Object.values(libraryMap).map((item) => ({
      id: item.id,
      label: item.label || item.id,
      category: item.category
    }));
  }

  function hasStoredPlan() {
    return planWasStored;
  }

  function save() {
    storage.set('state', state);
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
      const toggled = { ...item, done: !item.done };
      if (toggled.done) {
        const record = {
          exerciseId: item.id,
          load: toggled.load,
          date: today,
          completed: true
        };
        history = storage.append('trainingHistory', record);
        toggled.lastDate = today;
      }
      const latest = latestHistoryFor(item.id, history) || null;
      const meta = libraryMap[item.id] || item;
      toggled.suggestedLoad = computeSuggested(meta, latest, today);
      toggled.insight = buildInsight(meta, latest, toggled.suggestedLoad);
      return toggled;
    });

    return save();
  }

  function changeLoad(itemId, delta) {
    state.items = state.items.map((item) => {
      if (item.id !== itemId) return item;
      const meta = libraryMap[item.id] || item;
      const step = meta.progressionStep || 1;
      const load = Math.max(0, Number((item.load + delta * step).toFixed(1)));
      const latest = latestHistoryFor(item.id, history) || { load, date: todayISO() };
      const suggestedLoad = computeSuggested(meta, latest, todayISO());
      return {
        ...item,
        load,
        suggestedLoad,
        insight: buildInsight(meta, latest, suggestedLoad)
      };
    });
    return save();
  }

  function resetChecks() {
    state.items = state.items.map((item) => ({ ...item, done: false }));
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
    generateWorkout,
    getState,
    updateProfile,
    toggleDone,
    changeLoad,
    resetChecks,
    completion,
    exportData,
    save,
    hasPlan,
    updatePlan,
    resetPlan,
    getTrainingPlan,
    getLibraryList,
    hasStoredPlan
  };
}
