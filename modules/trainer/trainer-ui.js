const BASE_DAYS = [
  { key: 'monday', label: 'Segunda' },
  { key: 'tuesday', label: 'Terca' },
  { key: 'wednesday', label: 'Quarta' },
  { key: 'thursday', label: 'Quinta' },
  { key: 'friday', label: 'Sexta' },
  { key: 'saturday', label: 'Sabado' },
  { key: 'sunday', label: 'Domingo' }
];

const AUTO_LEVELS = [
  {
    id: 'iniciante',
    label: 'Iniciante',
    description: 'Carga inicial mais conservadora, foco em maquina, estabilidade e adaptacao.'
  },
  {
    id: 'intermediario',
    label: 'Intermediario',
    description: 'Equilibrio entre forca, hipertrofia e cardio com progressao moderada.'
  },
  {
    id: 'avancado',
    label: 'Avancado',
    description: 'Mais compostos, mais volume e intensidade para quem ja treina com constancia.'
  }
];

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

        <h2>Historico</h2>
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

function capitalize(value = '') {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function normalizePlanExerciseId(entry) {
  return typeof entry === 'string' ? entry : entry?.id;
}

export function createTrainerUI({ engine, elements }) {
  let deferredPrompt = null;
  let editingPlan = !engine.hasStoredPlan();
  let planBuilderMode = 'chooser';
  let selectedAutoLevel = 'intermediario';
  let manualDraft = null;

  function resetManualDraft() {
    const plan = engine.getTrainingPlan();
    manualDraft = {};

    BASE_DAYS.forEach((day) => {
      const entry = (plan.trainingDays || []).find((item) => item.day === day.key);
      manualDraft[day.key] = entry ? (entry.exercises || []).map(normalizePlanExerciseId).filter(Boolean) : [];
    });
  }

  function closeBuilder() {
    planBuilderMode = 'chooser';
    editingPlan = false;
    manualDraft = null;
    renderExercises();
  }

  function renderProfile() {
    const profile = engine.getState().profile;
    const filled = Object.values(profile).some(Boolean);

    elements.profileSection.innerHTML = `
      <div class="profile-head">
        <div>
          <h2>Perfil</h2>
          <div class="profile-summary">${filled ? profileSummary(profile) : 'Preencha uma vez. Depois e so treinar.'}</div>
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
        <div class="hint">Quanto mais completo o perfil, melhor o ajuste do IA - AUTO.</div>
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

  function renderAutoBuilder() {
    return `
      <div class="auto-plan-panel">
        <div class="auto-plan-title">Com base no seu perfil, escolha:</div>
        <div class="auto-plan-grid">
          ${AUTO_LEVELS.map(
            (option) => `
              <label class="level-card ${selectedAutoLevel === option.id ? 'active' : ''}">
                <input type="radio" name="autoLevel" value="${option.id}" ${selectedAutoLevel === option.id ? 'checked' : ''} />
                <strong>${option.label}</strong>
                <span>${option.description}</span>
              </label>
            `
          ).join('')}
        </div>
        <div class="hint">A IA monta 7 dias com 5 dias fortes e 2 dias de recuperacao ativa, alternando pernas, superiores, cardio, core e alongamento.</div>
        <div class="inline-row wrap-row">
          <button id="applyAutoPlanBtn" class="auto-btn">Aplicar IA - AUTO</button>
          <button id="backFromAutoBtn" class="secondary">Voltar</button>
          ${engine.hasPlan() ? '<button id="cancelAutoBtn" class="ghost">Fechar</button>' : ''}
        </div>
      </div>
    `;
  }

  function renderManualBuilder(library) {
    if (!manualDraft) resetManualDraft();

    return `
      <div class="manual-plan-panel">
        <div class="small">Selecione os dias e monte o treino manualmente.</div>
        <div class="plan-grid">
          ${BASE_DAYS.map(
            (day) => `
              <div class="plan-day">
                <label>
                  <input type="checkbox" data-day-check="${day.key}" ${manualDraft[day.key].length ? 'checked' : ''}/>
                  ${day.label}
                </label>
                <select data-day-select="${day.key}" multiple size="6" ${manualDraft[day.key].length ? '' : 'disabled'}>
                  ${library
                    .map(
                      (exercise) =>
                        `<option value="${exercise.id}" ${manualDraft[day.key].includes(exercise.id) ? 'selected' : ''}>${exercise.label} (${exercise.category || 'geral'})</option>`
                    )
                    .join('')}
                </select>
              </div>
            `
          ).join('')}
        </div>
        <div class="inline-row wrap-row" style="margin-top:12px;">
          <button id="savePlanBtn">Salvar plano</button>
          <button id="backFromManualBtn" class="secondary">Voltar</button>
          ${engine.hasPlan() ? '<button id="cancelPlanBtn" class="ghost">Fechar</button>' : ''}
        </div>
        <div class="hint">Selecione ao menos um dia com exercicios.</div>
      </div>
    `;
  }

  function renderPlanBuilder() {
    const library = engine.getLibraryList();

    elements.exerciseList.innerHTML = `
      <section class="card">
        <div class="plan-choice-head">
          <div>
            <div class="plan-choice-kicker">HERO Trainer V2</div>
            <h2>Como deseja montar seu plano?</h2>
            <div class="small">Use MANUAL para escolher exercicios fixos ou IA - AUTO para preencher a semana com um template inteligente.</div>
          </div>
          <div class="plan-choice-actions">
            <button id="autoModeBtn" class="auto-btn">IA - AUTO</button>
            <button id="manualModeBtn" class="secondary">MANUAL</button>
          </div>
        </div>
        ${planBuilderMode === 'auto' ? renderAutoBuilder() : ''}
        ${planBuilderMode === 'manual' ? renderManualBuilder(library) : ''}
        ${engine.hasPlan() && planBuilderMode === 'chooser' ? '<div class="hint">Seu plano atual continua salvo ate voce aplicar uma nova versao.</div>' : ''}
      </section>
    `;

    elements.exerciseList.querySelector('#autoModeBtn').onclick = () => {
      planBuilderMode = 'auto';
      renderPlanBuilder();
    };

    elements.exerciseList.querySelector('#manualModeBtn').onclick = () => {
      planBuilderMode = 'manual';
      if (!manualDraft) resetManualDraft();
      renderPlanBuilder();
    };

    if (planBuilderMode === 'auto') {
      elements.exerciseList.querySelectorAll('input[name="autoLevel"]').forEach((node) => {
        node.addEventListener('change', (event) => {
          selectedAutoLevel = event.currentTarget.value;
          renderPlanBuilder();
        });
      });

      elements.exerciseList.querySelector('#applyAutoPlanBtn').onclick = () => {
        engine.applyAutoPlan(selectedAutoLevel);
        editingPlan = false;
        planBuilderMode = 'chooser';
        manualDraft = null;
        renderExercises();
      };

      elements.exerciseList.querySelector('#backFromAutoBtn').onclick = () => {
        planBuilderMode = 'chooser';
        renderPlanBuilder();
      };

      const cancelAutoBtn = elements.exerciseList.querySelector('#cancelAutoBtn');
      if (cancelAutoBtn) cancelAutoBtn.onclick = () => closeBuilder();
    }

    if (planBuilderMode === 'manual') {
      elements.exerciseList.querySelectorAll('[data-day-check]').forEach((checkbox) => {
        checkbox.addEventListener('change', (event) => {
          const dayKey = event.currentTarget.dataset.dayCheck;
          const select = elements.exerciseList.querySelector(`[data-day-select="${dayKey}"]`);
          select.disabled = !event.currentTarget.checked;
          if (!event.currentTarget.checked) {
            manualDraft[dayKey] = [];
            Array.from(select.options).forEach((option) => {
              option.selected = false;
            });
          }
        });
      });

      elements.exerciseList.querySelectorAll('[data-day-select]').forEach((select) => {
        select.addEventListener('change', (event) => {
          const dayKey = event.currentTarget.dataset.daySelect;
          manualDraft[dayKey] = Array.from(event.currentTarget.selectedOptions).map((option) => option.value);
        });
      });

      elements.exerciseList.querySelector('#savePlanBtn').onclick = () => {
        const trainingDays = BASE_DAYS.map((day) => {
          const exerciseIds = manualDraft[day.key] || [];
          if (!exerciseIds.length) return null;
          return {
            day: day.key,
            title: day.label,
            exercises: exerciseIds.map((id) => ({ id, sets: 3, reps: '10-12' }))
          };
        }).filter(Boolean);

        if (!trainingDays.length) {
          alert('Escolha ao menos um dia e seus exercicios.');
          return;
        }

        engine.updatePlan({ mode: 'manual', trainingDays });
        editingPlan = false;
        planBuilderMode = 'chooser';
        manualDraft = null;
        renderExercises();
      };

      elements.exerciseList.querySelector('#backFromManualBtn').onclick = () => {
        planBuilderMode = 'chooser';
        renderPlanBuilder();
      };

      const cancelPlanBtn = elements.exerciseList.querySelector('#cancelPlanBtn');
      if (cancelPlanBtn) cancelPlanBtn.onclick = () => closeBuilder();
    }
  }

  function renderExercises() {
    if (!engine.hasPlan() || editingPlan) {
      elements.completionBadge.textContent = '0%';
      renderPlanBuilder();
      return;
    }

    const current = engine.getState();
    const plan = engine.getTrainingPlan();
    const planModeLabel =
      plan?.mode === 'auto' ? `IA - AUTO • ${capitalize(plan.level || selectedAutoLevel)}` : 'MANUAL';

    elements.completionBadge.textContent = `${engine.completion()}%`;

    if (!current.items.length) {
      elements.exerciseList.innerHTML = `
        <div class="card">
          <strong>${planModeLabel}</strong>
          <div class="hint">Nenhum treino planejado para hoje.</div>
          <div class="inline-row">
            <button class="secondary" data-action="edit-plan">Editar plano</button>
          </div>
        </div>
      `;
      elements.exerciseList.querySelector('[data-action="edit-plan"]').onclick = () => {
        editingPlan = true;
        planBuilderMode = 'chooser';
        manualDraft = null;
        renderExercises();
      };
      return;
    }

    elements.exerciseList.innerHTML =
      `<div class="card plan-banner">
        <div>
          <strong>${planModeLabel}</strong>
          <div class="small">${plan?.mode === 'auto' ? 'Semana preenchida automaticamente com cargas e repeticoes sugeridas.' : 'Plano montado manualmente.'}</div>
        </div>
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
              <div class="exercise-name">${item.done ? 'OK ' : ''}${item.label}</div>
              <div class="small">Series alvo: ${item.sets} x ${item.reps} • Ultimo treino: ${item.lastDate || '-'} • Equipamento: ${item.equipment || '-'}</div>
            </div>
          </div>

          <div class="inline-row wrap-row">
            <button class="icon-btn secondary" data-action="minus" data-id="${item.id}">-</button>
            <div class="load-box">
              <div class="load-value">${item.load} ${item.loadUnit}</div>
              <div class="small">Base: ${item.prescribedLoad} ${item.loadUnit}</div>
            </div>
            <button class="icon-btn secondary" data-action="plus" data-id="${item.id}">+</button>
            <a class="link-btn" href="${item.videoUrl}" target="_blank" rel="noopener noreferrer">Video</a>
          </div>

          <div class="insight"><strong>Insight:</strong> ${item.insight}</div>
          <div class="suggestion"><strong>Proxima carga:</strong> ${item.suggestedLoad} ${item.loadUnit}</div>
          <div class="hint">Recuperacao minima: ${item.recoveryDays || 0} dias</div>
        </article>
      `
        )
        .join('');

    elements.exerciseList.querySelectorAll('[data-action]').forEach((node) => {
      node.addEventListener('click', (event) => {
        const { action, id } = event.currentTarget.dataset;
        if (action === 'edit-plan') {
          editingPlan = true;
          planBuilderMode = 'chooser';
          manualDraft = null;
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
      planBuilderMode = 'chooser';
      manualDraft = null;
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
