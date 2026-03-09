function profileSummary(profile) {
  const parts = [];
  if (profile.name) parts.push(profile.name);
  if (profile.age) parts.push(`${profile.age} anos`);
  if (profile.weight) parts.push(`${profile.weight} kg`);
  if (profile.height) parts.push(`${profile.height} m`);
  if (profile.sex) parts.push(profile.sex);
  return parts.join(' • ');
}

function exportPdf(filename, data) {
  const printable = `
    <html>
      <head>
        <title>${filename}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #0b1220; }
          h1 { margin: 0 0 8px; }
          h2 { margin: 16px 0 8px; }
          .muted { color: #4b5563; font-size: 13px; }
          pre { background: #f3f4f6; padding: 12px; border-radius: 8px; overflow: auto; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          td { padding: 6px 4px; border-bottom: 1px solid #e5e7eb; }
        </style>
      </head>
      <body>
        <h1>HERO Trainer - Export</h1>
        <div class="muted">Gerado em ${new Date().toLocaleString()}</div>

        <h2>Perfil</h2>
        <table>
          <tr><td>Nome</td><td>${data.state.profile.name || '-'}</td></tr>
          <tr><td>Idade</td><td>${data.state.profile.age || '-'}</td></tr>
          <tr><td>Peso</td><td>${data.state.profile.weight || '-'}</td></tr>
          <tr><td>Altura</td><td>${data.state.profile.height || '-'}</td></tr>
          <tr><td>Sexo</td><td>${data.state.profile.sex || '-'}</td></tr>
        </table>

        <h2>Estado atual</h2>
        <pre>${JSON.stringify(data.state, null, 2)}</pre>

        <h2>Histórico</h2>
        <pre>${JSON.stringify(data.history, null, 2)}</pre>

        <h2>Storage</h2>
        <pre>${JSON.stringify(data.storage, null, 2)}</pre>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Pop-up bloqueado: permita pop-ups para exportar PDF.');
    return;
  }
  printWindow.document.open();
  printWindow.document.write(printable);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

export function createTrainerUI({ engine, elements }) {
  let deferredPrompt = null;
  let editingPlan = !engine.hasStoredPlan();

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

  function renderPlanBuilder() {
    const library = engine.getLibraryList();
    const plan = engine.getTrainingPlan();
    const draft = {};

    const baseDays = [
      { key: 'monday', label: 'Segunda' },
      { key: 'tuesday', label: 'Terça' },
      { key: 'wednesday', label: 'Quarta' },
      { key: 'thursday', label: 'Quinta' },
      { key: 'friday', label: 'Sexta' },
      { key: 'saturday', label: 'Sábado' },
      { key: 'sunday', label: 'Domingo' }
    ];

    baseDays.forEach((d) => {
      const entry = (plan.trainingDays || []).find((p) => p.day === d.key);
      draft[d.key] = entry ? [...(entry.exercises || [])] : [];
    });

    elements.exerciseList.innerHTML = `
      <section class="card">
        <div class="profile-head" style="margin-bottom:8px;">
          <div>
            <h2>Plano semanal</h2>
            <div class="small">Escolha os dias e atribua exercícios fixos.</div>
          </div>
        </div>
        <div class="plan-grid">
          ${baseDays
            .map(
              (d) => `
            <div class="plan-day">
              <label>
                <input type="checkbox" data-day-check="${d.key}" ${draft[d.key].length ? 'checked' : ''}/>
                ${d.label}
              </label>
              <select data-day-select="${d.key}" multiple size="5" ${draft[d.key].length ? '' : 'disabled'}>
                ${library
                  .map(
                    (ex) =>
                      `<option value="${ex.id}" ${draft[d.key].includes(ex.id) ? 'selected' : ''}>${ex.label} (${
                        ex.category || 'geral'
                      })</option>`
                  )
                  .join('')}
              </select>
            </div>
          `
            )
            .join('')}
        </div>
        <div class="inline-row" style="margin-top:12px;">
          <button id="savePlanBtn">Salvar plano</button>
          <button id="cancelPlanBtn" class="secondary">Cancelar</button>
        </div>
        <div class="hint">Selecione ao menos um dia com exercícios.</div>
      </section>
    `;

    elements.exerciseList.querySelectorAll('[data-day-check]').forEach((cb) => {
      cb.addEventListener('change', (e) => {
        const day = e.currentTarget.dataset.dayCheck;
        const select = elements.exerciseList.querySelector(`[data-day-select="${day}"]`);
        select.disabled = !e.currentTarget.checked;
        if (!e.currentTarget.checked) draft[day] = [];
      });
    });

    elements.exerciseList.querySelectorAll('[data-day-select]').forEach((sel) => {
      sel.addEventListener('change', (e) => {
        const day = e.currentTarget.dataset.daySelect;
        draft[day] = Array.from(e.currentTarget.selectedOptions).map((o) => o.value);
      });
    });

    elements.exerciseList.querySelector('#savePlanBtn').onclick = () => {
      const trainingDays = baseDays
        .map((d) => (draft[d.key]?.length ? { day: d.key, title: d.label, exercises: draft[d.key] } : null))
        .filter(Boolean);
      if (!trainingDays.length) {
        alert('Escolha ao menos um dia e seus exercícios.');
        return;
      }
      engine.updatePlan({ trainingDays });
      editingPlan = false;
      renderExercises();
    };

    elements.exerciseList.querySelector('#cancelPlanBtn').onclick = () => {
      editingPlan = false;
      renderExercises();
    };
  }

  function renderExercises() {
    if (!engine.hasPlan() || editingPlan) {
      elements.completionBadge.textContent = '0%';
      renderPlanBuilder();
      return;
    }

    const current = engine.getState();
    elements.completionBadge.textContent = `${engine.completion()}%`;

    if (!current.items.length) {
      elements.exerciseList.innerHTML = '<div class="card">Nenhum treino planejado para hoje.</div>';
      return;
    }

    elements.exerciseList.innerHTML =
      `<div class="card inline-row" style="justify-content: space-between;">
        <strong>Plano semanal</strong>
        <div>
          <button class="secondary" data-action="edit-plan">Editar plano</button>
        </div>
      </div>` +
      current.items
      .map(
        (item) => `
      <article class="exercise-card ${item.done ? 'done' : ''}" data-id="${item.id}">
        <div class="exercise-top">
          <input type="checkbox" ${item.done ? 'checked' : ''} data-action="toggle" data-id="${item.id}" />
          <div>
            <div class="exercise-name">${item.done ? '✅ ' : ''}${item.label}</div>
            <div class="small">Último treino: ${item.lastDate || '—'} • Equipamento: ${item.equipment || '—'}</div>
          </div>
        </div>

        <div class="inline-row">
          <button class="icon-btn secondary" data-action="minus" data-id="${item.id}">−</button>
          <div class="load-value">${item.load} ${item.loadUnit}</div>
          <button class="icon-btn secondary" data-action="plus" data-id="${item.id}">+</button>
          <a class="link-btn" href="${item.videoUrl}" target="_blank" rel="noopener noreferrer">📺 Vídeo</a>
        </div>

        <div class="insight"><strong>Insight:</strong> ${item.insight}</div>
        <div class="suggestion"><strong>Próxima carga:</strong> ${item.suggestedLoad} ${item.loadUnit}</div>
        <div class="hint">Recuperação mínima: ${item.recoveryDays || 0} dias</div>
      </article>
    `
      )
      .join('');

    elements.exerciseList.querySelectorAll('[data-action]').forEach((node) => {
      node.addEventListener('click', (event) => {
        const { action, id } = event.currentTarget.dataset;
        if (action === 'edit-plan') {
          editingPlan = true;
          renderExercises();
          return;
        }
        if (action === 'toggle') engine.toggleDone(id);
        if (action === 'plus') engine.changeLoad(id, 1);
        if (action === 'minus') engine.changeLoad(id, -1);
        renderExercises();
      });
    });
  }

  function bindFooter() {
    elements.saveWorkoutBtn.onclick = () => engine.save();
    elements.exportJsonBtn.textContent = 'Exportar PDF';
    elements.exportJsonBtn.onclick = () => exportPdf('hero-trainer-export.pdf', engine.exportData());
    elements.resetChecksBtn.onclick = () => {
      engine.resetChecks();
      renderExercises();
    };

    // Botão de reset do plano semanal
    let resetPlanBtn = document.getElementById('resetPlanBtn');
    if (!resetPlanBtn) {
      resetPlanBtn = document.createElement('button');
      resetPlanBtn.id = 'resetPlanBtn';
      resetPlanBtn.className = 'secondary danger';
      resetPlanBtn.textContent = 'Resetar plano semanal';
      elements.resetChecksBtn.parentNode.appendChild(resetPlanBtn);
    }
    resetPlanBtn.onclick = () => {
      engine.resetPlan();
      editingPlan = true;
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
