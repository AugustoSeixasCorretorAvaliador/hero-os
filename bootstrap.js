import { initLicenseUI, ensureLicense } from "./js/license.js";

async function startApp() {
  initLicenseUI();
  const ok = await ensureLicense();
  if (!ok) return;
  await import("./app.js");
}

startApp();
