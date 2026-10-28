import { FinancialData, CalculatedMargins } from '../types';

export function calculateMargins(data: FinancialData): CalculatedMargins {
  const rev1 = data.revenueP1 || 0;
  const rev2 = data.revenueP2 || 0;
  const cogs1 = data.cogsP1 || 0;
  const cogs2 = data.cogsP2 || 0;
  const opex1 = data.opexP1 || 0;
  const opex2 = data.opexP2 || 0;

  // Gross profit
  const grossProfitP1 = rev1 - cogs1;
  const grossProfitP2 = rev2 - cogs2;
  const grossMarginP1 = rev1 > 0 ? (grossProfitP1 / rev1) * 100 : 0;
  const grossMarginP2 = rev2 > 0 ? (grossProfitP2 / rev2) * 100 : 0;
  const grossMarginDeltaBps = Math.round((grossMarginP2 - grossMarginP1) * 100);

  // Operating profit (EBIT)
  const operatingProfitP1 = grossProfitP1 - opex1;
  const operatingProfitP2 = grossProfitP2 - opex2;
  const operatingMarginP1 = rev1 > 0 ? (operatingProfitP1 / rev1) * 100 : 0;
  const operatingMarginP2 = rev2 > 0 ? (operatingProfitP2 / rev2) * 100 : 0;
  const operatingMarginDeltaBps = Math.round((operatingMarginP2 - operatingMarginP1) * 100);

  // EBITDA
  const da1 = data.deprAmortP1 || 0;
  const da2 = data.deprAmortP2 || 0;
  const ebitdaP1 = operatingProfitP1 + da1;
  const ebitdaP2 = operatingProfitP2 + da2;
  const ebitdaMarginP1 = rev1 > 0 ? (ebitdaP1 / rev1) * 100 : 0;
  const ebitdaMarginP2 = rev2 > 0 ? (ebitdaP2 / rev2) * 100 : 0;
  const ebitdaMarginDeltaBps = Math.round((ebitdaMarginP2 - ebitdaMarginP1) * 100);

  // Net income (default to operatingProfit - interest - tax if not explicitly provided)
  const netIncomeP1 = data.netIncomeP1 !== undefined 
    ? data.netIncomeP1 
    : (operatingProfitP1 - (data.interestExpenseP1 || 0) - (data.taxP1 || 0));
  const netIncomeP2 = data.netIncomeP2 !== undefined 
    ? data.netIncomeP2 
    : (operatingProfitP2 - (data.interestExpenseP2 || 0) - (data.taxP2 || 0));
  
  const netMarginP1 = rev1 > 0 ? (netIncomeP1 / rev1) * 100 : 0;
  const netMarginP2 = rev2 > 0 ? (netIncomeP2 / rev2) * 100 : 0;
  const netMarginDeltaBps = Math.round((netMarginP2 - netMarginP1) * 100);

  // Growth percentages
  const revenueGrowthPct = rev1 > 0 ? ((rev2 - rev1) / rev1) * 100 : 0;
  const cogsGrowthPct = cogs1 > 0 ? ((cogs2 - cogs1) / cogs1) * 100 : 0;
  const opexGrowthPct = opex1 > 0 ? ((opex2 - opex1) / opex1) * 100 : 0;

  // Anomaly signal: Positive net income but negative or plummeting operating cash flow
  const ocf2 = data.operatingCashFlowP2 ?? 0;
  const cashConversionAnomaly = (netIncomeP2 > 0 && ocf2 < 0) || (netIncomeP2 > 0 && ocf2 < netIncomeP2 * 0.4);

  return {
    grossProfitP1,
    grossProfitP2,
    grossMarginP1,
    grossMarginP2,
    grossMarginDeltaBps,

    operatingProfitP1,
    operatingProfitP2,
    operatingMarginP1,
    operatingMarginP2,
    operatingMarginDeltaBps,

    ebitdaP1,
    ebitdaP2,
    ebitdaMarginP1,
    ebitdaMarginP2,
    ebitdaMarginDeltaBps,

    netIncomeP1,
    netIncomeP2,
    netMarginP1,
    netMarginP2,
    netMarginDeltaBps,

    revenueGrowthPct,
    cogsGrowthPct,
    opexGrowthPct,
    cashConversionAnomaly,
  };
}

export function formatCurrency(value: number, currency: string = '', unit: string = ''): string {
  return formatFinancialNumber(value, 0, true);
}

export function formatFinancialNumber(
  value: number,
  decimals: number = 0,
  useParensForNegative: boolean = true
): string {
  const isNegative = value < 0;
  const abs = Math.abs(value);
  const formatted = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 1,
    minimumFractionDigits: decimals,
  }).format(abs);

  if (isNegative) {
    return useParensForNegative ? `(${formatted})` : `-${formatted}`;
  }
  return formatted;
}

export function formatPercent(value: number, decimals: number = 2): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

export function formatBps(bps: number): string {
  const sign = bps > 0 ? '+' : '';
  return `${sign}${bps} bps`;
}
