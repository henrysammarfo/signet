/** Default micropayment price for signals — keeps testnet E2E cheap (1 USDC goes far). */
export const MIN_SIGNAL_PRICE_USDC = 0.01;

/** Analyst agent default; override with SIGNAL_PRICE_USDC env. */
export function getDefaultSignalPriceUsdc(): number {
  const env = process.env.SIGNAL_PRICE_USDC?.trim();
  if (env) {
    const n = Number(env);
    if (Number.isFinite(n) && n >= MIN_SIGNAL_PRICE_USDC) return n;
  }
  return MIN_SIGNAL_PRICE_USDC;
}

export function priceToX402(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
