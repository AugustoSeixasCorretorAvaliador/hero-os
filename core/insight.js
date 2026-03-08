function formatDateISO(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(dateText, days) {
  const base = new Date(`${dateText}T00:00:00`);
  base.setDate(base.getDate() + days);
  return formatDateISO(base);
}

export function createInsight() {
  return {
    forItem(item) {
      const nextLoad = item.loadUnit === 'kg'
        ? Number((item.load + Math.max(1, item.progressionStep || 1)).toFixed(1))
        : item.load;

      const nextDate = addDays(item.loadDate || formatDateISO(new Date()), item.recoveryDays || 7);

      return {
        benefit: item.benefitInsight || 'Ajuda na execução consistente e no progresso do treino.',
        nextLoad,
        nextDate
      };
    }
  };
}
