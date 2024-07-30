export function currencyFormat(value: number): string {
  return value.toLocaleString('en-AU', {
    style: 'currency',
    currency: 'AUD'
  });
}

export function toTimeStr(date: Date): string {
  return new Date(date).toLocaleTimeString([], {
    timeStyle: 'short'
  });
}
