import { CalculatedMargins } from '../types';
import { TrendingDown, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatBps, formatPercent } from '../utils/finance';

interface MarginOverviewCardsProps {
  margins: CalculatedMargins;
  period1Label: string;
  period2Label: string;
}

export function MarginOverviewCards({
  margins,
  period1Label,
  period2Label,
}: MarginOverviewCardsProps) {
  const cards = [
    {
      label: 'Pertumbuhan Revenue',
      value: formatPercent(margins.revenueGrowthPct),
      subtext: `${period2Label} vs ${period1Label}`,
      isPositive: margins.revenueGrowthPct >= 0,
      delta: null,
      type: 'revenue',
    },
    {
      label: 'Gross Profit Margin',
      value: `${margins.grossMarginP2.toFixed(1)}%`,
      prevValue: `${margins.grossMarginP1.toFixed(1)}%`,
      delta: formatBps(margins.grossMarginDeltaBps),
      isPositive: margins.grossMarginDeltaBps >= 0,
      bps: margins.grossMarginDeltaBps,
    },
    {
      label: 'Operating Margin (EBIT)',
      value: `${margins.operatingMarginP2.toFixed(1)}%`,
      prevValue: `${margins.operatingMarginP1.toFixed(1)}%`,
      delta: formatBps(margins.operatingMarginDeltaBps),
      isPositive: margins.operatingMarginDeltaBps >= 0,
      bps: margins.operatingMarginDeltaBps,
    },
    {
      label: 'Net Profit Margin',
      value: `${margins.netMarginP2.toFixed(1)}%`,
      prevValue: `${margins.netMarginP1.toFixed(1)}%`,
      delta: formatBps(margins.netMarginDeltaBps),
      isPositive: margins.netMarginDeltaBps >= 0,
      bps: margins.netMarginDeltaBps,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
      {cards.map((c, i) => {
        const isWarning = c.delta && c.bps !== undefined && c.bps < -150;
        const isFavorable = c.delta && c.bps !== undefined && c.bps > 50;

        return (
          <div
            key={i}
            className={`p-4 rounded-xl border transition-all ${
              isWarning
                ? 'bg-rose-50/50 border-rose-200'
                : isFavorable
                ? 'bg-emerald-50/50 border-emerald-200'
                : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
              <span>{c.label}</span>
              {c.delta ? (
                <span
                  className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold ${
                    c.isPositive
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {c.isPositive ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {c.delta}
                </span>
              ) : (
                <span
                  className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold ${
                    c.isPositive
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {c.value}
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                {c.value}
              </span>
              {c.prevValue && (
                <span className="text-xs text-slate-400">
                  dari {c.prevValue}
                </span>
              )}
            </div>

            <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-1.5">
              <span>
                {c.subtext || (c.isPositive ? 'Ekspansi margin' : 'Kompresi margin')}
              </span>
              {isWarning && (
                <span className="text-rose-600 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Peringatan CFO
                </span>
              )}
              {isFavorable && (
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Efisiensi Menguat
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
