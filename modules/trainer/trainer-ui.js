function profileSummary(profile) {
  const parts = [];
  if (profile.name) parts.push(profile.name);
  if (profile.age) parts.push(`${profile.age} anos`);
  if (profile.weight) parts.push(`${profile.weight} kg`);
  if (profile.height) parts.push(`${profile.height} m`);
  if (profile.sex) parts.push(profile.sex);
  return parts.join(' • ');
}

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function createTrainerUI({ engine, state, elements }) {
  let deferredPrompt = null;

  function renderProfile() {
    const profile = engine.getState().profile;
    const filled = Object.values(profile).some(Boolean);

    elements.profileSection.innerHTML = `
      <div class="profile-head">
        <div>
          <h2>Perfil</h2>
          <div class="profile-summary">${filled ? profileSummary(profile) : 'Preencha uma vez. Depois é só treinar.'}</div>
        </div>
        <button id="toggleProfileBtn" class="ghost">${filled ? 'Editar' : 'Cadastrar'}</button>
      </div>
      <div id="profileForm" class="${filled ? 'hidden' : ''}">
        <div class="profile-grid">
          <input id="profileName" placeholder="Nome" value="${profile.name || ''}" />
          <input id="profileAge" type="number" inputmode="numeric" placeholder="Idade" value="${profile.age || ''}" />
          <input id="profileWeight" type="number" inputmode="decimal" step="0.1" placeholder="Peso" value="${profile.weight || ''}" />
          <input id="profileHeight" type="number" inputmode="decimal" step="0.01" placeholder="Altura" value="${profile.height || ''}" />
          <select id="profileSex">
            <option value="">Sexo</option>
            <option value="Masculino" ${profile.sex === 'Masculino' ? 'selected' : ''}>Masculino</option>
            <option value="Feminino" ${profile.sex === 'Feminino' ? 'selected' : ''}>Feminino</option>
            <option value="Outro" ${profile.sex === 'Outro' ? 'selected' : ''}>Outro</option>
          </select>
        </div>
        <button id="saveProfileBtn" style="margin-top:10px;">Salvar perfil</button>
        <div class="hint">Cadastro mínimo. Depois, zero digitação no uso diário.</div>
      </div>
    `;

    elements.profileSection.querySelector('#toggleProfileBtn').onclick = () => {
      elements.profileSection.querySelector('#profileForm').classList.toggle('hidden');
    };

    const saveBtn = elements.profileSection.querySelector('#saveProfileBtn');
    if (saveBtn) {
      saveBtn.onclick = () => {
        engine.updateProfile({
          name: elements.profileSection.querySelector('#profileName').value.trim(),
          age: elements.profileSection.querySelector('#profileAge').value.trim(),
          weight: elements.profileSection.querySelector('#profileWeight').value.trim(),
          height: elements.profileSection.querySelector('#profileHeight').value.trim(),
          sex: elements.profileSection.querySelector('#profileSex').value
        });
        renderProfile();
      };
    }
  }

  function renderExercises() {
    const current = engine.getState();
    elements.completionBadge.textContent = `${engine.completion()}%`;

    elements.exerciseList.innerHTML = current.items.map((item) => `
      <article class="exercise-card ${item.done ? 'done' : ''}" data-id="${item.id}">
        <div class="exercise-top">
          <input type="checkbox" ${item.done ? 'checked' : ''} data-action="toggle" data-id="${item.id}" />
          <div>
            <div class="exercise-name">${item.done ? '✅ ' : ''}${item.label}</div>
            <div class="small">Carga registrada em ${item.loadDate}</div>
          </div>
        </div>

        <div class="inline-row">
          <button class="icon-btn secondary" data-action="minus" data-id="${item.id}">−</button>
          <div class="load-value">${item.load} ${item.loadUnit}</div>
          <button class="icon-btn secondary" data-action="plus" data-id="${item.id}">+</button>
          <a class="link-btn" href="${item.videoUrl}" target="_blank" rel="noopener noreferrer">🔗 Vídeo</a>
        </div>

        <div class="insight"><strong>Insight:</strong> ${item.suggestion.benefit}</div>
        <div class="suggestion"><strong>Próxima sugestão:</strong> ${item.suggestion.nextLoad} ${item.loadUnit} em ${item.suggestion.nextDate}</div>
        <div class="hint">${item.suggestion.recoveryReminder}</div>
      </article>
    `).join('');

    elements.exerciseList.querySelectorAll('[data-action]').forEach((node) => {
      node.addEventListener('click', (event) => {
        const { action, id } = event.currentTarget.dataset;
        if (action === 'toggle') engine.toggleDone(id);
        if (action === 'plus') engine.changeLoad(id, 1);
        if (action === 'minus') engine.changeLoad(id, -1);
        renderExercises();
      });
    });
  }

  function bindFooter() {
    elements.saveWorkoutBtn.onclick = () => engine.save();
    elements.exportJsonBtn.onclick = () => downloadJson('hero-trainer-export.json', engine.exportData());
    elements.resetChecksBtn.onclick = () => {
      engine.resetChecks();
      renderExercises();
    };
  }

  function bindInstall() {
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      deferredPrompt = event;
      elements.installBtn.classList.remove('hidden');
    });

    elements.installBtn.onclick = async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      elements.installBtn.classList.add('hidden');
    };
  }

  renderProfile();
  renderExercises();
  bindFooter();
  bindInstall();

  return {
    rerender() {
      renderProfile();
      renderExercises();
    }
  };
}
