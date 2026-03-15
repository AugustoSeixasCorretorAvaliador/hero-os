import { createEngine } from './core/engine.js';
import { createStorage } from './core/storage.js';
import { loadTemplate } from './core/template-loader.js';
import { createInsight } from './core/insight.js';
import { createTrainerUI } from './modules/trainer/trainer-ui.js';

let appInstance = null;

export async function startTrainerApp() {
  if (appInstance) return appInstance;

  const [library, userPlan] = await Promise.all([
    loadTemplate('./exercise-library.json'),
    loadTemplate('./user-training-plan.json')
  ]);

  const storage = createStorage('hero-trainer');
  const insight = createInsight();
  const engine = createEngine({
    storage,
    insight,
    library,
    trainingPlan: userPlan
  });

  engine.generateWorkout();

  appInstance = createTrainerUI({
    engine,
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

  return appInstance;
}

if ('serviceWorker' in navigator) {
  const registerServiceWorker = () => navigator.serviceWorker.register('./service-worker.js');

  if (document.readyState === 'complete') registerServiceWorker();
  else window.addEventListener('load', registerServiceWorker, { once: true });
}
