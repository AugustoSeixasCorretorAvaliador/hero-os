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
    forItem(item, lastHistory = null) {
      const today = formatDateISO(new Date());
      const recovery = item.recoveryDays || 7;
      const baseDate = (lastHistory && lastHistory.date) || item.loadDate || today;
      const baseLoad = (lastHistory && lastHistory.load) ?? item.load ?? 0;
      const step = item.progressionStep || 1;

      const eligibleDate = addDays(baseDate, recovery);
      const canProgress = eligibleDate <= today;
      const nextLoad = canProgress ? Number((baseLoad + step).toFixed(1)) : baseLoad;

      const benefit = item.benefit || item.benefitInsight || 'Ajuda na execução consistente e no progresso do treino.';
      const nextDate = eligibleDate;

      return {
        benefit,
        nextLoad,
        nextDate,
        recoveryReminder: canProgress
          ? 'Pronto para progredir hoje.'
          : `Recupere até ${nextDate} antes de aumentar carga.`
      };
    }
  };
}
