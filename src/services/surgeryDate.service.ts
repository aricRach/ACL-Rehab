const KEY = 'acl-surgery-date';
const DEFAULT_DATE = '2025-01-19';

export function loadSurgeryDate(): string {
  return localStorage.getItem(KEY) ?? DEFAULT_DATE;
}

export function saveSurgeryDate(date: string) {
  localStorage.setItem(KEY, date);
}