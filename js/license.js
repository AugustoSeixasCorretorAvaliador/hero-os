const API_BASE = "https://heroia-full-nuven-1.onrender.com";
const DEVICE_ID_KEY = "heroia_device_id";
const ACTIVATION_KEY = "heroia_activation_v2";

const pillEl = () => document.getElementById("license-pill");
const cardEl = () => document.getElementById("license-card");
const mainEl = () => document.querySelector("main.container");
const deviceIdEl = () => document.getElementById("device-id");
const copyDeviceBtn = () => document.getElementById("copy-device");
const licenseForm = () => document.getElementById("license-form");
const licenseKeyInput = () => document.getElementById("license-key");
const licenseEmailInput = () => document.getElementById("license-email");
const licenseStatusEl = () => document.getElementById("license-status");
const btnActivate = () => document.getElementById("btn-activate");

const maskKeyView = (key = "") => {
  const clean = String(key || "").trim();
  if (clean.length <= 8) return clean;
  return `${clean.slice(0, 4)}******${clean.slice(-4)}`;
};

function generateDeviceId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return `dev-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

export function getDeviceId() {
  const existing = localStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;
  const created = generateDeviceId();
  localStorage.setItem(DEVICE_ID_KEY, created);
  return created;
}

export function loadActivation() {
  try {
    const raw = localStorage.getItem(ACTIVATION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn("Falha ao ler ativação local", err);
    return null;
  }
}

function saveActivation(data) {
  localStorage.setItem(ACTIVATION_KEY, JSON.stringify(data));
}

function renderActivation(state, message) {
  const pill = pillEl();
  const statusText = licenseStatusEl();
  const status = state?.status || "pending";
  const expires = state?.expires_at || state?.expiresAt || null;

  let text = "Licença não validada";
  let pillClass = "license-pill";
  if (status === "active") {
    text = "Licença válida" + (expires ? ` • expira em ${new Date(expires).toLocaleDateString()}` : "");
    pillClass += " success";
  } else if (status === "blocked") {
    text = "Licença bloqueada";
    pillClass += " danger";
  } else if (status === "error") {
    text = "Erro de licença";
    pillClass += " danger";
  }

  if (pill) {
    pill.textContent = text;
    pill.className = pillClass;
  }
  if (statusText) statusText.textContent = message || text;
}

function showApp() {
  const card = cardEl();
  const main = mainEl();
  card?.classList.add("hidden");
  main?.classList.remove("hidden");
}

function showLicenseScreen(message) {
  const card = cardEl();
  const main = mainEl();
  if (main) main.classList.add("hidden");
  if (card) {
    card.classList.remove("hidden");
    if (message) renderActivation({ status: "pending" }, message);
    return;
  }
  // fallback: bloquear tudo
  document.body.innerHTML = `
    <div class="license-lock">
      <div>
        <h1>HERO Trainer</h1>
        <p>Licença necessária</p>
        <button onclick="window.location.reload()">Ativar licença</button>
      </div>
    </div>
  `;
}

export function requireActiveLicense() {
  const state = loadActivation();
  if (!state || state.status !== "active") {
    throw new Error("Ative sua licença para usar o HERO Trainer.");
  }
  return state;
}

async function activateLicense(event) {
  event?.preventDefault?.();
  const keyInput = licenseKeyInput();
  const emailInput = licenseEmailInput();
  const button = btnActivate();

  const inputKey = keyInput?.value?.trim() || "";
  const license_key = (inputKey.includes("•") || inputKey.includes("*")) && keyInput?.dataset.rawKey
    ? keyInput.dataset.rawKey
    : inputKey;
  const email = emailInput?.value?.trim() || "";

  if (!license_key || !email) {
    renderActivation({ status: "error" }, "Preencha license key e e-mail.");
    return;
  }

  if (button) {
    button.disabled = true;
    button.dataset.label = button.textContent;
    button.textContent = "Validando...";
  }

  const device_id = getDeviceId();

  try {
    const res = await fetch(`${API_BASE}/api/license/activate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ license_key, email, device_id, notes: "HERO Trainer", source: "HERO Trainer" })
    });

    const payload = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(payload.error || `Erro ${res.status}`);

    const state = {
      license_key,
      email,
      device_id,
      status: payload.status,
      expires_at: payload.expires_at || null
    };
    saveActivation(state);
    if (keyInput) {
      keyInput.dataset.rawKey = license_key;
      keyInput.value = maskKeyView(license_key);
    }
    if (emailInput) emailInput.value = email;
    renderActivation(state, "Licença ativada neste dispositivo.");
    showApp();
  } catch (err) {
    console.error("Ativação falhou", err);
    renderActivation({ status: "error" }, err.message || "Erro ao ativar");
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = button.dataset.label || "Ativar / Validar licença";
    }
  }
}

export async function ensureLicense() {
  // PWA friendly: se offline, segue fluxo local
  if (!navigator.onLine) {
    renderActivation(loadActivation(), "Modo offline - licença não verificada agora.");
    showApp();
    return true;
  }

  const existing = loadActivation();
  if (existing?.status === "active") {
    renderActivation(existing);
    showApp();
    return true;
  }

  showLicenseScreen("Licença necessária para usar o HERO Trainer.");
  return false;
}

export function initLicenseUI() {
  const deviceId = getDeviceId();
  if (deviceIdEl()) deviceIdEl().textContent = deviceId;

  const card = cardEl();
  const main = mainEl();
  // Oculta app até validar
  if (card && main) main.classList.add("hidden");

  const existing = loadActivation();
  if (existing) {
    if (licenseKeyInput()) {
      licenseKeyInput().dataset.rawKey = existing.license_key || "";
      licenseKeyInput().value = maskKeyView(existing.license_key || "");
    }
    if (licenseEmailInput()) licenseEmailInput().value = existing.email || "";
    renderActivation(existing);
  }

  licenseForm()?.addEventListener("submit", activateLicense);
  copyDeviceBtn()?.addEventListener("click", () => {
    navigator.clipboard?.writeText(deviceId).then(() => {
      renderActivation(loadActivation(), "Device ID copiado.");
    }).catch(() => renderActivation(loadActivation(), "Copie manualmente: " + deviceId));
  });
}
