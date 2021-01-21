export function dateToFinancialYear(date: Date): number {
  // January up to and including June
  if (date.getMonth() < 6) {
    return date.getFullYear();
  }
  return date.getFullYear() + 1;
}
