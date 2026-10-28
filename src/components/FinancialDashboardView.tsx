import React, { useState, useMemo } from 'react';
import { FinancialData, CalculatedMargins, CFOAnalysisReport } from '../types';
import { formatCurrency, formatPercent, formatBps } from '../utils/finance';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Layers,
  ArrowRight,
  ShieldAlert,
  Sliders,
  RotateCcw,
  Zap,
  Info,
  CheckCircle2,
  Scale,
  CreditCard,
  Building,
} from 'lucide-react';

interface FinancialDashboardViewProps {
  data: FinancialData;
  margins: CalculatedMargins;
  report: CFOAnalysisReport | null;
  period1Label: string;
  period2Label: string;
  currency: string;
  unit: string;
  onApplyScenario?: (simulatedData: Partial<FinancialData>) => void;
}

export function FinancialDashboardView({
  data,
  margins,
  report,
  period1Label,
  period2Label,
  currency,
  unit,
  onApplyScenario,
}: FinancialDashboardViewProps) {
  // Sensitivity / What-If state
  const [revenueDeltaPct, setRevenueDeltaPct] = useState<number>(0);
  const [cogsDeltaPct, setCogsDeltaPct] = useState<number>(0);
  const [opexDeltaPct, setOpexDeltaPct] = useState<number>(0);

  // Computed simulation based on Period 2 baseline
  const simulation = useMemo(() => {
    const baseRev = data.revenueP2 || 1;
    const baseCogs = data.cogsP2 || 0;
    const baseOpex = data.opexP2 || 0;
    const baseInterest = data.interestExpenseP2 || 0;
    const baseTax = data.taxP2 || 0;

    const simRev = baseRev * (1 + revenueDeltaPct / 100);
    const simCogs = baseCogs * (1 + cogsDeltaPct / 100);
    const simGrossProfit = simRev - simCogs;
    const simGrossMargin = (simGrossProfit / simRev) * 100;

    const simOpex = baseOpex * (1 + opexDeltaPct / 100);
    const simEbit = simGrossProfit - simOpex;
    const simEbitMargin = (simEbit / simRev) * 100;

    const simNet = simEbit - baseInterest - baseTax;
    const simNetMargin = (simNet / simRev) * 100;

    const netIncomeDiff = simNet - (margins.netIncomeP2 || 0);

    return {
      simRev,
      simCogs,
      simGrossProfit,
      simGrossMargin,
      simOpex,
      simEbit,
      simEbitMargin,
      simNet,
      simNetMargin,
      netIncomeDiff,
    };
  }, [data, margins, revenueDeltaPct, cogsDeltaPct, opexDeltaPct]);

  const resetSimulation = () => {
    setRevenueDeltaPct(0);
    setCogsDeltaPct(0);
    setOpexDeltaPct(0);
  };

  // Waterfall bars computation
  const waterfallP2 = useMemo(() => {
    const rev = data.revenueP2 || 100;
    const cogs = data.cogsP2 || 60;
    const gp = rev - cogs;
    const opex = data.opexP2 || 25;
    const ebit = gp - opex;
    const other = (data.interestExpenseP2 || 0) + (data.taxP2 || 0);
    const net = ebit - other;

    const maxVal = Math.max(rev, 1);

    return [
      {
        label: 'Pendapatan (Revenue)',
        amount: rev,
        pctOfRev: 100,
        type: 'positive',
        desc: 'Basis penjualan bruto',
      },
      {
        label: '(-) Beban Pokok (COGS)',
        amount: -cogs,
        pctOfRev: (cogs / rev) * 100,
        type: 'deduction',
        desc: 'Biaya langsung produksi/layanan',
      },
      {
        label: '(=) Laba Kotor (Gross Profit)',
        amount: gp,
        pctOfRev: (gp / rev) * 100,
        type: 'subtotal',
        desc: 'Margin kontribusi produk',
      },
      {
        label: '(-) Beban Operasional (OPEX)',
        amount: -opex,
        pctOfRev: (opex / rev) * 100,
        type: 'deduction',
        desc: 'SG&A, Pemasaran, Gaji & Admin',
      },
      {
        label: '(=) Laba Operasi (EBIT)',
        amount: ebit,
        pctOfRev: (ebit / rev) * 100,
        type: 'subtotal',
        desc: 'Profitabilitas operasional inti',
      },
      {
        label: '(-) Bunga & Pajak',
        amount: -other,
        pctOfRev: (other / rev) * 100,
        type: 'deduction',
        desc: 'Kewajiban finansial & fiskal',
      },
      {
        label: '(=) Laba Bersih (Net Income)',
        amount: net,
        pctOfRev: (net / rev) * 100,
        type: 'final',
        desc: 'Laba bersih pemegang saham',
      },
    ];
  }, [data]);

  // Working Capital metrics
  const arP1 = data.accountsReceivableP1 ?? 0;
  const arP2 = data.accountsReceivableP2 ?? 0;
  const arGrowth = arP1 > 0 ? ((arP2 - arP1) / arP1) * 100 : 0;

  const invP1 = data.inventoryP1 ?? 0;
  const invP2 = data.inventoryP2 ?? 0;
  const invGrowth = invP1 > 0 ? ((invP2 - invP1) / invP1) * 100 : 0;

  const cashP1 = data.cashEquivalentsP1 ?? 0;
  const cashP2 = data.cashEquivalentsP2 ?? 0;
  const cashDelta = cashP2 - cashP1;

  const debtP1 = data.totalDebtP1 ?? 0;
  const debtP2 = data.totalDebtP2 ?? 0;

  const ocf2 = data.operatingCashFlowP2 ?? 0;
  const net2 = margins.netIncomeP2 || 1;
  const cashConversionRatio = net2 > 0 ? (ocf2 / net2) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* 1. Visual Financial Waterfall / Profit Bridge */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-900 text-white">
              <Layers className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                P&L Financial Waterfall & Profit Bridge ({period2Label})
              </h3>
              <p className="text-xs text-slate-500">
                Dekomposisi aliran laba dari Pendapatan Bruto hingga Laba Bersih Akhir
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-600 bg-white px-3 py-1 rounded-md border border-slate-200 font-mono">
            Basis: <strong className="text-slate-900">{formatCurrency(data.revenueP2, currency, unit)}</strong> (100%)
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="space-y-3.5">
            {waterfallP2.map((item, idx) => {
              const isDeduction = item.type === 'deduction';
              const isFinal = item.type === 'final';
              const isSubtotal = item.type === 'subtotal';
              const absAmount = Math.abs(item.amount);

              // Bar width relative to revenue
              const barWidth = Math.min(100, Math.max(3, item.pctOfRev));

              let barColor = 'bg-slate-900 text-white';
              if (isDeduction) barColor = 'bg-rose-500 text-white';
              if (isSubtotal) barColor = 'bg-slate-700 text-white';
              if (isFinal) {
                barColor = item.amount >= 0 ? 'bg-emerald-600 text-white' : 'bg-rose-700 text-white';
              }

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold ${
                          isFinal
                            ? 'text-slate-900 font-extrabold text-sm'
                            : isSubtotal
                            ? 'text-slate-900 font-bold'
                            : isDeduction
                            ? 'text-rose-700'
                            : 'text-slate-700'
                        }`}
                      >
                        {item.label}
                      </span>
                      <span className="text-[11px] text-slate-400 hidden md:inline">
                        • {item.desc}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 font-mono">
                      <span className="text-slate-500 text-[11px]">
                        {item.pctOfRev.toFixed(1)}% dari Rev
                      </span>
                      <span
                        className={`font-bold text-xs sm:text-sm ${
                          isFinal
                            ? item.amount >= 0
                              ? 'text-emerald-700'
                              : 'text-rose-700'
                            : isDeduction
                            ? 'text-rose-600'
                            : 'text-slate-900'
                        }`}
                      >
                        {item.amount < 0 ? '-' : ''}
                        {formatCurrency(absAmount, currency, unit)}
                      </span>
                    </div>
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${barColor}`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Margin Expansion / Compression Gauges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Margin Diagnostic Progress */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight">
                Margin Komparatif ({period2Label} vs {period1Label})
              </h4>
            </div>
            <span className="text-[11px] font-mono text-slate-500">100 bps = 1.00%</span>
          </div>

          <div className="space-y-4 pt-1">
            {/* Gross Margin */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Gross Profit Margin</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-mono">
                    <strong className="text-slate-900">{margins.grossMarginP2.toFixed(1)}%</strong> vs {margins.grossMarginP1.toFixed(1)}%
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                      margins.grossMarginDeltaBps >= 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {formatBps(margins.grossMarginDeltaBps)}
                  </span>
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex gap-0.5">
                <div
                  className={`h-full rounded-l-full ${
                    margins.grossMarginDeltaBps >= 0 ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, margins.grossMarginP2))}%` }}
                />
                <div
                  className="bg-slate-400 h-full rounded-r-full"
                  style={{ width: `${Math.min(100, Math.max(0, margins.grossMarginP1))}%` }}
                />
              </div>
            </div>

            {/* Operating Margin */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Operating Margin (EBIT)</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-mono">
                    <strong className="text-slate-900">{margins.operatingMarginP2.toFixed(1)}%</strong> vs {margins.operatingMarginP1.toFixed(1)}%
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                      margins.operatingMarginDeltaBps >= 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {formatBps(margins.operatingMarginDeltaBps)}
                  </span>
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex gap-0.5">
                <div
                  className={`h-full rounded-l-full ${
                    margins.operatingMarginDeltaBps >= 0 ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, margins.operatingMarginP2))}%` }}
                />
                <div
                  className="bg-slate-400 h-full rounded-r-full"
                  style={{ width: `${Math.min(100, Math.max(0, margins.operatingMarginP1))}%` }}
                />
              </div>
            </div>

            {/* EBITDA Margin */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">EBITDA Margin</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-mono">
                    <strong className="text-slate-900">{margins.ebitdaMarginP2.toFixed(1)}%</strong> vs {margins.ebitdaMarginP1.toFixed(1)}%
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                      margins.ebitdaMarginDeltaBps >= 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {formatBps(margins.ebitdaMarginDeltaBps)}
                  </span>
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex gap-0.5">
                <div
                  className={`h-full rounded-l-full ${
                    margins.ebitdaMarginDeltaBps >= 0 ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, margins.ebitdaMarginP2))}%` }}
                />
                <div
                  className="bg-slate-400 h-full rounded-r-full"
                  style={{ width: `${Math.min(100, Math.max(0, margins.ebitdaMarginP1))}%` }}
                />
              </div>
            </div>

            {/* Net Profit Margin */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Net Profit Margin</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-mono">
                    <strong className="text-slate-900">{margins.netMarginP2.toFixed(1)}%</strong> vs {margins.netMarginP1.toFixed(1)}%
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                      margins.netMarginDeltaBps >= 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {formatBps(margins.netMarginDeltaBps)}
                  </span>
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex gap-0.5">
                <div
                  className={`h-full rounded-l-full ${
                    margins.netMarginDeltaBps >= 0 ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, margins.netMarginP2))}%` }}
                />
                <div
                  className="bg-slate-400 h-full rounded-r-full"
                  style={{ width: `${Math.min(100, Math.max(0, margins.netMarginP1))}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Working Capital & Cash Health Radar */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-600" />
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight">
                Diagnostik Modal Kerja & Likuiditas Kas
              </h4>
            </div>
            <span className="text-[11px] font-semibold text-slate-600">Audit Neraca</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Piutang Usaha */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                <span>Piutang Usaha (AR)</span>
                <span
                  className={`font-bold ${
                    arGrowth > margins.revenueGrowthPct + 5 ? 'text-rose-600' : 'text-slate-700'
                  }`}
                >
                  {formatPercent(arGrowth)}
                </span>
              </div>
              <div className="text-sm font-bold text-slate-900 font-mono">
                {formatCurrency(arP2, currency, unit)}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                {arGrowth > margins.revenueGrowthPct
                  ? '⚠️ Tumbuh melebihi omzet (risiko penagihan macet)'
                  : 'Pertumbuhan piutang terkendali'}
              </p>
            </div>

            {/* Persediaan */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                <span>Persediaan (Inventory)</span>
                <span
                  className={`font-bold ${
                    invGrowth > 20 ? 'text-amber-600' : 'text-slate-700'
                  }`}
                >
                  {formatPercent(invGrowth)}
                </span>
              </div>
              <div className="text-sm font-bold text-slate-900 font-mono">
                {formatCurrency(invP2, currency, unit)}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                {invGrowth > 20
                  ? '⚠️ Penumpukan persediaan (risiko dead-stock)'
                  : 'Perputaran stok terpantau normal'}
              </p>
            </div>

            {/* Posisi Kas */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                <span>Kas & Setara Kas</span>
                <span
                  className={`font-bold ${cashDelta < 0 ? 'text-rose-600' : 'text-emerald-600'}`}
                >
                  {cashDelta < 0 ? '-' : '+'}
                  {formatCurrency(Math.abs(cashDelta), currency, unit)}
                </span>
              </div>
              <div className="text-sm font-bold text-slate-900 font-mono">
                {formatCurrency(cashP2, currency, unit)}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                {cashDelta < 0 ? 'Arus kas tergerus pada periode ini' : 'Cadangan kas bertambah'}
              </p>
            </div>

            {/* Beban Utang */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                <span>Total Kewajiban Utang</span>
                <span className="font-bold text-slate-700">
                  {debtP2 > debtP1 ? 'Leverage +' : 'Leverage -'}
                </span>
              </div>
              <div className="text-sm font-bold text-slate-900 font-mono">
                {formatCurrency(debtP2, currency, unit)}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Porsi liabilitas berbunga terhadap struktur modal
              </p>
            </div>
          </div>

          {/* Cash Conversion Alert Banner */}
          {margins.cashConversionAnomaly && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">
                  Divergensi Kritis: Kualitas Laba vs Kas Operasional (OCF)
                </span>
                <p className="text-[11px] text-rose-700 leading-relaxed mt-0.5">
                  Laba bersih dilaporkan positif ({formatCurrency(margins.netIncomeP2, currency, unit)}), namun Arus Kas Operasi hanya{' '}
                  {formatCurrency(ocf2, currency, unit)} ({cashConversionRatio.toFixed(0)}% konversi). Uang kas tersangkut di modal kerja.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Interactive "What-If" Sensitivity Simulator */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500 text-white">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                Simulator Sensitivitas Finansial & Skenario "What-If" CFO
              </h3>
              <p className="text-xs text-slate-500">
                Uji dampak perubahan variabel terhadap Laba Bersih dan Margin secara real-time
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetSimulation}
              className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-white text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Skenario</span>
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sliders Area */}
          <div className="lg:col-span-2 space-y-5">
            {/* Slider 1: Pendapatan */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-800">
                  Perubahan Pertumbuhan Pendapatan / Pricing Power
                </label>
                <span
                  className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                    revenueDeltaPct >= 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {revenueDeltaPct > 0 ? '+' : ''}
                  {revenueDeltaPct}%
                </span>
              </div>
              <input
                type="range"
                min="-20"
                max="30"
                step="1"
                value={revenueDeltaPct}
                onChange={(e) => setRevenueDeltaPct(Number(e.target.value))}
                className="w-full accent-slate-900 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>-20% (Kontraksi Pasar)</span>
                <span>0% (Baseline {period2Label})</span>
                <span>+30% (Kenaikan Harga/Volume)</span>
              </div>
            </div>

            {/* Slider 2: COGS */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-800">
                  Efisiensi / Inflasi Beban Pokok Penjualan (COGS)
                </label>
                <span
                  className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                    cogsDeltaPct <= 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {cogsDeltaPct > 0 ? '+' : ''}
                  {cogsDeltaPct}%
                </span>
              </div>
              <input
                type="range"
                min="-20"
                max="20"
                step="1"
                value={cogsDeltaPct}
                onChange={(e) => setCogsDeltaPct(Number(e.target.value))}
                className="w-full accent-slate-900 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>-20% (Negosiasi Vendor Sukses)</span>
                <span>0% (Status Quo)</span>
                <span>+20% (Lonjakan Bahan Baku)</span>
              </div>
            </div>

            {/* Slider 3: OPEX */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-800">
                  Rasionalisasi / Pengetatan Beban Operasional (OPEX / SG&A)
                </label>
                <span
                  className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                    opexDeltaPct <= 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {opexDeltaPct > 0 ? '+' : ''}
                  {opexDeltaPct}%
                </span>
              </div>
              <input
                type="range"
                min="-30"
                max="20"
                step="1"
                value={opexDeltaPct}
                onChange={(e) => setOpexDeltaPct(Number(e.target.value))}
                className="w-full accent-slate-900 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>-30% (Penghematan Agresif)</span>
                <span>0% (Baseline)</span>
                <span>+20% (Ekspansi Tim & Iklan)</span>
              </div>
            </div>
          </div>

          {/* Simulation Output Card */}
          <div className="bg-slate-900 text-white rounded-xl p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-bold uppercase tracking-wider text-amber-400">
                  Hasil Simulasi Proyeksi
                </span>
                <span className="font-mono text-[11px]">Model Dinamis</span>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="block text-[11px] text-slate-400">Proyeksi Laba Bersih Baru</span>
                  <div className="text-2xl font-black font-mono tracking-tight text-white">
                    {formatCurrency(simulation.simNet, currency, unit)}
                  </div>
                  <span
                    className={`inline-block text-xs font-bold mt-0.5 ${
                      simulation.netIncomeDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {simulation.netIncomeDiff >= 0 ? '▲ Tambahan Laba: +' : '▼ Penurunan Laba: '}
                    {formatCurrency(Math.abs(simulation.netIncomeDiff), currency, unit)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Gross Margin</span>
                    <span className="font-bold font-mono text-white text-sm">
                      {simulation.simGrossMargin.toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Operating Margin</span>
                    <span className="font-bold font-mono text-white text-sm">
                      {simulation.simEbitMargin.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800">
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {simulation.netIncomeDiff > 0
                  ? `Skenario ini menghasilkan tambahan kas bebas sekitar ${formatCurrency(
                      simulation.netIncomeDiff,
                      currency,
                      unit
                    )} untuk reinvestasi atau pembayaran utang.`
                  : 'Peringatan: Skenario ini mempersempit margin proteksi laba dan meningkatkan risiko defisit kas.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
