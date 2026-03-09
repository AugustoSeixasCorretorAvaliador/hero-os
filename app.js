import { createEngine } from './core/engine.js';
import { createStorage } from './core/storage.js';
import { loadTemplate } from './core/template-loader.js';
import { createInsight } from './core/insight.js';
import { createTrainerUI } from './modules/trainer/trainer-ui.js';

const storage = createStorage('hero-os');
const insight = createInsight();
const engine = createEngine({ storage, insight });

function todayName() {
  const days = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  return days[new Date().getDay()];
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function flattenLibrary(library) {
  const map = {};
  library.categories.forEach((category) => {
    category.exercises.forEach((ex) => {
      map[ex.id] = { ...ex, category: category.name };
    });
  });
  return map;
}

function buildTemplate(library, plan) {
  const libraryMap = flattenLibrary(library);
  const currentDay = todayName();
  const dayPlan = plan.trainingDays.find((d) => d.day === currentDay) || plan.trainingDays[0];

  const items = (dayPlan?.exercises || []).map((id) => {
    const ex = libraryMap[id] || { id, label: id, progressionStep: 1, recoveryDays: 3, videoUrl: '' };
    return {
      id: ex.id,
      label: ex.label || ex.id,
      load: ex.defaultLoad ?? 0,
      loadUnit: ex.loadUnit || 'kg',
      loadDate: todayISO(),
      videoUrl: ex.videoUrl,
      benefitInsight: ex.benefit,
      progressionStep: ex.progressionStep,
      recoveryDays: ex.recoveryDays,
      done: false
    };
  });

  return {
    module: 'trainer',
    title: dayPlan ? `Treino ${dayPlan.title || dayPlan.day}` : 'Treino do dia',
    profile: {
      name: '',
      age: '',
      weight: '',
      height: '',
      sex: ''
    },
    items
  };
}

async function bootstrap() {
  const [library, plan] = await Promise.all([
    loadTemplate('./exercise-library.json'),
    loadTemplate('./user-training-plan.json')
  ]);

  const template = buildTemplate(library, plan);
  const state = engine.init(template);

  createTrainerUI({
    engine,
    state,
    elements: {
      profileSection: document.getElementById('profileSection'),
      exerciseList: document.getElementById('exerciseList'),
      completionBadge: document.getElementById('completionBadge'),
      saveWorkoutBtn: document.getElementById('saveWorkoutBtn'),
      exportJsonBtn: document.getElementById('exportJsonBtn'),
      resetChecksBtn: document.getElementById('resetChecksBtn'),
      installBtn: document.getElementById('installBtn')
    }
  });
}

bootstrap();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js'));
}
