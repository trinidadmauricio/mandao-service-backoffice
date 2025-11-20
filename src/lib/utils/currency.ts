import currency from 'currency.js';

export type CurrencyCode = 'USD' | 'EUR' | 'MXN' | 'GTQ' | 'CRC' | 'PAB' | 'HNL' | 'NIO' | 'BZD' | 'BMD';

export interface CurrencyFormatOptions {
  symbol?: string;
  separator?: string;
  decimal?: string;
  precision?: number;
}

const currencyConfig: Record<CurrencyCode, CurrencyFormatOptions> = {
  USD: { symbol: '$', separator: ',', decimal: '.', precision: 2 },
  EUR: { symbol: '€', separator: '.', decimal: ',', precision: 2 },
  MXN: { symbol: '$', separator: ',', decimal: '.', precision: 2 },
  GTQ: { symbol: 'Q', separator: ',', decimal: '.', precision: 2 },
  CRC: { symbol: '₡', separator: '.', decimal: ',', precision: 2 },
  PAB: { symbol: 'B/.', separator: ',', decimal: '.', precision: 2 },
  HNL: { symbol: 'L', separator: ',', decimal: '.', precision: 2 },
  NIO: { symbol: 'C$', separator: ',', decimal: '.', precision: 2 },
  BZD: { symbol: '$', separator: ',', decimal: '.', precision: 2 },
  BMD: { symbol: '$', separator: ',', decimal: '.', precision: 2 },
};

export function formatCurrency(
  amount: number,
  currencyCode: CurrencyCode = 'USD',
  options?: CurrencyFormatOptions
): string {
  const config = currencyConfig[currencyCode] || currencyConfig.USD;
  const finalOptions = { ...config, ...options };

  return currency(amount, {
    symbol: finalOptions.symbol,
    separator: finalOptions.separator,
    decimal: finalOptions.decimal,
    precision: finalOptions.precision,
  }).format();
}

export function parseCurrency(value: string, currencyCode: CurrencyCode = 'USD'): number {
  const config = currencyConfig[currencyCode] || currencyConfig.USD;
  const cleaned = value
    .replace(config.symbol || '', '')
    .replace(new RegExp(`\\${config.separator}`, 'g'), '')
    .replace(config.decimal || '.', '.');

  return parseFloat(cleaned) || 0;
}

