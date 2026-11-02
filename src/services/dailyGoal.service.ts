const KEY = 'acl-daily-goal';
export const DEFAULT_DAILY_GOAL = 35;

// Minutes of training per day that count as optimal
export function loadDailyGoal(): number {
  const value = Number(localStorage.getItem(KEY));
  return value > 0 ? value : DEFAULT_DAILY_GOAL;
}

export function saveDailyGoal(minutes: number) {
  localStorage.setItem(KEY, String(minutes));
}
