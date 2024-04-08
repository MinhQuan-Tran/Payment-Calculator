export function currencyFormat(value: number): string {
  return value.toLocaleString('en-AU', {
    style: 'currency',
    currency: 'AUD'
  });
}
