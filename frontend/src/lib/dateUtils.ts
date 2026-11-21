export function calculateNextInstallmentDate(startDate: Date | string, installmentIndex: number): Date {
  const date = new Date(startDate);
  date.setMonth(date.getMonth() + installmentIndex);
  return date;
}

export function isPastDueDate(dueDate: Date | string): boolean {
  return new Date(dueDate).getTime() < Date.now();
}

export function formatDaysRemaining(dueDate: Date | string): string {
  const diffTime = new Date(dueDate).getTime() - Date.now();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return ${Math.abs(diffDays)} days overdue;
  if (diffDays === 0) return 'Due today';
  return ${diffDays} days remaining;
}