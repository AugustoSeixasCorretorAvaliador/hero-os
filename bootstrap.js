import { initLicenseUI, ensureLicense } from "./js/license.js";
import { startTrainerApp } from "./app.js";

async function startApp() {
  initLicenseUI();
  let activationWatcher = null;
  const watchActivation = () => {
    activationWatcher = window.setInterval(() => {
      try {
        const raw = localStorage.getItem("heroia_activation_v2");
        const activation = raw ? JSON.parse(raw) : null;
        if (activation?.status !== "active") return;
        window.clearInterval(activationWatcher);
        startTrainerApp().catch((error) => console.error("Falha ao iniciar app apos ativacao", error));
      } catch (error) {
        console.error("Falha ao verificar ativacao local", error);
      }
    }, 1200);
  };
  watchActivation();

  const ok = await ensureLicense();
  if (!ok) return;
  if (activationWatcher) window.clearInterval(activationWatcher);
  await startTrainerApp();
}

startApp();
