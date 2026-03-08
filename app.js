import { createEngine } from './core/engine.js';
import { createStorage } from './core/storage.js';
import { loadTemplate } from './core/template-loader.js';
import { createInsight } from './core/insight.js';
import { createTrainerUI } from './modules/trainer/trainer-ui.js';

const storage = createStorage('hero-os');
const insight = createInsight();
const engine = createEngine({ storage, insight });

async function bootstrap() {
  const template = await loadTemplate('./modules/trainer/trainer-template.json');
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
