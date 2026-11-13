export function truncateToTwoDeicmals(value: number): string {
  return Number(value.toFixed(2)).toString();
}
