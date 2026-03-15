const LEVEL_CONFIG = {
  iniciante: {
    label: 'Iniciante',
    loadMultiplier: 0.9,
    profileWeight: 0.35,
    compoundSets: 3,
    compoundReps: '12-15',
    accessorySets: 3,
    accessoryReps: '12-15',
    coreSets: 3,
    coreReps: '12-20',
    timedCore: '25-35 s',
    cardioSets: 1,
    cardioReps: '10-14 min',
    mobilitySets: 2,
    mobilityReps: '30 s',
    stretchSets: 2,
    stretchReps: '30 s'
  },
  intermediario: {
    label: 'Intermediario',
    loadMultiplier: 1.05,
    profileWeight: 0.45,
    compoundSets: 4,
    compoundReps: '8-12',
    accessorySets: 3,
    accessoryReps: '10-12',
    coreSets: 4,
    coreReps: '12-15',
    timedCore: '35-45 s',
    cardioSets: 1,
    cardioReps: '14-18 min',
    mobilitySets: 2,
    mobilityReps: '35 s',
    stretchSets: 2,
    stretchReps: '35 s'
  },
  avancado: {
    label: 'Avancado',
    loadMultiplier: 1.15,
    profileWeight: 0.55,
    compoundSets: 5,
    compoundReps: '6-10',
    accessorySets: 4,
    accessoryReps: '8-12',
    coreSets: 4,
    coreReps: '15-18',
    timedCore: '45-60 s',
    cardioSets: 1,
    cardioReps: '18-22 min',
    mobilitySets: 2,
    mobilityReps: '40 s',
    stretchSets: 2,
    stretchReps: '40 s'
  }
};

const TEMPLATE_MAP = {
  iniciante: [
    {
      day: 'monday',
      title: 'Segunda - Pernas base',
      exercises: [
        { id: 'leg-press', role: 'compound' },
        { id: 'cadeira-extensora', role: 'accessory' },
        { id: 'cadeira-flexora', role: 'accessory' },
        { id: 'panturrilha-em-pe', role: 'accessory' },
        { id: 'alongamento-flexor-quadril', role: 'stretch' }
      ]
    },
    {
      day: 'tuesday',
      title: 'Terca - Peito e triceps',
      exercises: [
        { id: 'supino-halter', role: 'compound' },
        { id: 'crucifixo-halter', role: 'accessory' },
        { id: 'elevacao-lateral', role: 'accessory' },
        { id: 'triceps-pulley', role: 'accessory' },
        { id: 'alongamento-peitoral-parede', role: 'stretch' }
      ]
    },
    {
      day: 'wednesday',
      title: 'Quarta - Costas e cardio',
      exercises: [
        { id: 'puxada-frente', role: 'compound' },
        { id: 'remada-baixa', role: 'compound' },
        { id: 'rosca-direta', role: 'accessory' },
        { id: 'bicicleta', role: 'cardio' },
        { id: 'alongamento-isquiotibiais', role: 'stretch' }
      ]
    },
    {
      day: 'thursday',
      title: 'Quinta - Pernas e core',
      exercises: [
        { id: 'agachamento-sumo-kb', role: 'compound' },
        { id: 'afundo', role: 'compound' },
        { id: 'subida-escada', role: 'cardio' },
        { id: 'prancha', role: 'core' },
        { id: 'alongamento-gluteo-fig4', role: 'stretch' }
      ]
    },
    {
      day: 'friday',
      title: 'Sexta - Superior misto',
      exercises: [
        { id: 'cross-over', role: 'accessory' },
        { id: 'remada-unilateral-halter', role: 'compound' },
        { id: 'rosca-martelo', role: 'accessory' },
        { id: 'abdominal-maquina', role: 'core' },
        { id: 'alongamento-triceps-cabeca', role: 'stretch' }
      ]
    },
    {
      day: 'saturday',
      title: 'Sabado - Recuperacao ativa',
      exercises: [
        { id: 'esteira', role: 'cardio' },
        { id: 'eliptico', role: 'cardio' },
        { id: 'dead-bug', role: 'core' },
        { id: 'mobilidade-ombro-bastao', role: 'mobility' },
        { id: 'alongamento-peitoral-parede', role: 'stretch' }
      ]
    },
    {
      day: 'sunday',
      title: 'Domingo - Mobilidade',
      exercises: [
        { id: 'corrida-leve', role: 'cardio' },
        { id: 'polichinelo', role: 'mobility' },
        { id: 'prancha-lateral', role: 'core' },
        { id: 'mobilidade-quadril-circulos', role: 'mobility' },
        { id: 'alongamento-isquiotibiais', role: 'stretch' }
      ]
    }
  ],
  intermediario: [
    {
      day: 'monday',
      title: 'Segunda - Pernas forca',
      exercises: [
        { id: 'agachamento-livre', role: 'compound' },
        { id: 'leg-press', role: 'compound' },
        { id: 'stiff-halter', role: 'compound' },
        { id: 'panturrilha-em-pe', role: 'accessory' },
        { id: 'alongamento-flexor-quadril', role: 'stretch' }
      ]
    },
    {
      day: 'tuesday',
      title: 'Terca - Push',
      exercises: [
        { id: 'supino-reto', role: 'compound' },
        { id: 'supino-inclinado', role: 'compound' },
        { id: 'desenvolvimento-halter', role: 'compound' },
        { id: 'triceps-testa', role: 'accessory' },
        { id: 'alongamento-peitoral-parede', role: 'stretch' }
      ]
    },
    {
      day: 'wednesday',
      title: 'Quarta - Pull e cardio',
      exercises: [
        { id: 'barra-fixa', role: 'compound' },
        { id: 'remada-curvada', role: 'compound' },
        { id: 'face-pull', role: 'accessory' },
        { id: 'air-bike', role: 'cardio' },
        { id: 'alongamento-isquiotibiais', role: 'stretch' }
      ]
    },
    {
      day: 'thursday',
      title: 'Quinta - Pernas unilateral',
      exercises: [
        { id: 'hack-machine', role: 'compound' },
        { id: 'afundo-bulgaro', role: 'compound' },
        { id: 'elevacao-pelvica-barra', role: 'compound' },
        { id: 'prancha', role: 'core' },
        { id: 'alongamento-gluteo-fig4', role: 'stretch' }
      ]
    },
    {
      day: 'friday',
      title: 'Sexta - Superior misto',
      exercises: [
        { id: 'supino-halter', role: 'compound' },
        { id: 'remada-unilateral-halter', role: 'compound' },
        { id: 'rosca-scott', role: 'accessory' },
        { id: 'triceps-pulley', role: 'accessory' },
        { id: 'alongamento-triceps-cabeca', role: 'stretch' }
      ]
    },
    {
      day: 'saturday',
      title: 'Sabado - Recuperacao ativa',
      exercises: [
        { id: 'bicicleta', role: 'cardio' },
        { id: 'eliptico', role: 'cardio' },
        { id: 'ab-wheel', role: 'core' },
        { id: 'mobilidade-ombro-bastao', role: 'mobility' },
        { id: 'alongamento-peitoral-parede', role: 'stretch' }
      ]
    },
    {
      day: 'sunday',
      title: 'Domingo - Mobilidade',
      exercises: [
        { id: 'corrida-leve', role: 'cardio' },
        { id: 'polichinelo', role: 'mobility' },
        { id: 'prancha-lateral', role: 'core' },
        { id: 'mobilidade-quadril-circulos', role: 'mobility' },
        { id: 'alongamento-isquiotibiais', role: 'stretch' }
      ]
    }
  ],
  avancado: [
    {
      day: 'monday',
      title: 'Segunda - Pernas pesada',
      exercises: [
        { id: 'agachamento-livre', role: 'compound' },
        { id: 'hack-machine', role: 'compound' },
        { id: 'stiff-halter', role: 'compound' },
        { id: 'panturrilha-em-pe', role: 'accessory' },
        { id: 'alongamento-flexor-quadril', role: 'stretch' }
      ]
    },
    {
      day: 'tuesday',
      title: 'Terca - Push pesado',
      exercises: [
        { id: 'supino-reto', role: 'compound' },
        { id: 'supino-inclinado', role: 'compound' },
        { id: 'arnold-press', role: 'compound' },
        { id: 'paralelas-peito', role: 'compound' },
        { id: 'alongamento-peitoral-parede', role: 'stretch' }
      ]
    },
    {
      day: 'wednesday',
      title: 'Quarta - Pull e condicionamento',
      exercises: [
        { id: 'barra-fixa', role: 'compound' },
        { id: 'remada-curvada', role: 'compound' },
        { id: 'pullover-cabo', role: 'accessory' },
        { id: 'air-bike', role: 'cardio' },
        { id: 'alongamento-isquiotibiais', role: 'stretch' }
      ]
    },
    {
      day: 'thursday',
      title: 'Quinta - Gluteos e posterior',
      exercises: [
        { id: 'afundo-bulgaro', role: 'compound' },
        { id: 'elevacao-pelvica-barra', role: 'compound' },
        { id: 'agachamento-sumo-kb', role: 'compound' },
        { id: 'subida-escada', role: 'cardio' },
        { id: 'alongamento-gluteo-fig4', role: 'stretch' }
      ]
    },
    {
      day: 'friday',
      title: 'Sexta - Superior e bracos',
      exercises: [
        { id: 'desenvolvimento-halter', role: 'compound' },
        { id: 'remada-unilateral-halter', role: 'compound' },
        { id: 'rosca-direta', role: 'accessory' },
        { id: 'mergulho-paralela', role: 'compound' },
        { id: 'alongamento-triceps-cabeca', role: 'stretch' }
      ]
    },
    {
      day: 'saturday',
      title: 'Sabado - Conditioning',
      exercises: [
        { id: 'air-bike', role: 'cardio' },
        { id: 'esteira', role: 'cardio' },
        { id: 'ab-wheel', role: 'core' },
        { id: 'face-pull', role: 'accessory' },
        { id: 'alongamento-peitoral-parede', role: 'stretch' }
      ]
    },
    {
      day: 'sunday',
      title: 'Domingo - Recuperacao inteligente',
      exercises: [
        { id: 'eliptico', role: 'cardio' },
        { id: 'prancha-lateral', role: 'core' },
        { id: 'dead-bug', role: 'core' },
        { id: 'mobilidade-quadril-circulos', role: 'mobility' },
        { id: 'alongamento-isquiotibiais', role: 'stretch' }
      ]
    }
  ]
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeLevel(level = 'intermediario') {
  const plain = String(level || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  if (plain === 'iniciante') return 'iniciante';
  if (plain === 'avancado') return 'avancado';
  return 'intermediario';
}

function parseNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(String(value).replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

function roundByStep(value, step) {
  if (!step || step <= 0) return Number(value.toFixed(1));
  return Number((Math.round(value / step) * step).toFixed(1));
}

function profileFactor(profile, config) {
  let factor = 1;
  const weight = parseNumber(profile?.weight);
  const age = parseNumber(profile?.age);
  const sex = String(profile?.sex || '').toLowerCase();

  if (weight !== null) {
    const normalizedWeight = clamp((weight - 70) / 40, -0.2, 0.2);
    factor += normalizedWeight * config.profileWeight;
  }
  if (age !== null) {
    if (age >= 60) factor -= 0.12;
    else if (age >= 45) factor -= 0.06;
    else if (age <= 25) factor += 0.04;
  }
  if (sex === 'feminino') factor -= 0.08;
  if (sex === 'masculino') factor += 0.04;

  return clamp(factor, 0.78, 1.22);
}

function buildPrescription(meta, role, config) {
  const timedUnit = meta.loadUnit === 'segundos' || meta.loadUnit === 'minutos';

  if (role === 'stretch') return { sets: config.stretchSets, reps: config.stretchReps };
  if (role === 'mobility') return { sets: config.mobilitySets, reps: config.mobilityReps };
  if (role === 'cardio') return { sets: config.cardioSets, reps: config.cardioReps };
  if (role === 'core') {
    return {
      sets: config.coreSets,
      reps: timedUnit || meta.loadUnit === 'bodyweight' ? config.timedCore : config.coreReps
    };
  }
  if (role === 'compound') return { sets: config.compoundSets, reps: config.compoundReps };
  return { sets: config.accessorySets, reps: config.accessoryReps };
}

function computeLoad(meta, role, profile, config) {
  const base = Number(meta.defaultLoad ?? 0);
  if (!base) return base;

  const factor = profileFactor(profile, config);
  const roleFactor =
    role === 'compound' ? 1 : role === 'accessory' ? 0.92 : role === 'cardio' ? 1.05 : 1;
  const rawLoad = base * config.loadMultiplier * factor * roleFactor;

  if (meta.loadUnit === 'minutos' || meta.loadUnit === 'segundos' || meta.loadUnit === 'reps') {
    return Math.max(1, Math.round(rawLoad));
  }
  if (meta.loadUnit === 'km/h') {
    return Math.max(1, Number(rawLoad.toFixed(1)));
  }
  if (meta.loadUnit === 'bodyweight') {
    return base;
  }

  return Math.max(0, roundByStep(rawLoad, meta.progressionStep || 0.5));
}

export function buildAutoTrainingPlan({ level, profile, libraryMap }) {
  const normalizedLevel = normalizeLevel(level);
  const config = LEVEL_CONFIG[normalizedLevel];
  const template = TEMPLATE_MAP[normalizedLevel];

  const trainingDays = template.map((day) => ({
    day: day.day,
    title: day.title,
    exercises: day.exercises.map((entry) => {
      const meta = libraryMap[entry.id];
      if (!meta) throw new Error(`Exercicio nao encontrado para plano automatico: ${entry.id}`);

      return {
        id: entry.id,
        role: entry.role,
        sets: buildPrescription(meta, entry.role, config).sets,
        reps: buildPrescription(meta, entry.role, config).reps,
        load: computeLoad(meta, entry.role, profile, config)
      };
    })
  }));

  return {
    mode: 'auto',
    level: normalizedLevel,
    generatedAt: new Date().toISOString(),
    trainingDays
  };
}

export function listAutoPlanLevels() {
  return Object.entries(LEVEL_CONFIG).map(([key, value]) => ({
    id: key,
    label: value.label
  }));
}
