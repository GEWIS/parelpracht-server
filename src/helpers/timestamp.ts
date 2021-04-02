/**
 * Get the financial year of a given date
 * @param date Date to convert
 */
export function dateToFinancialYear(date: Date): number {
  // January up to and including June
  if (date.getMonth() < 6) {
    return date.getFullYear();
  }
  return date.getFullYear() + 1;
}

/**
 * Get the current financial year
 */
export function currentFinancialYear(): number {
  const now = new Date();
  now.setMonth(now.getMonth() + 8);
  return now.getFullYear();
}
