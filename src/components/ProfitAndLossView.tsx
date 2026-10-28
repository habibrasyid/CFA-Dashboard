import React from 'react';
import { FinancialData, CalculatedMargins, BalanceSheetData, RevenueSegmentItem } from '../types';
import { formatCurrency, formatFinancialNumber, formatPercent, formatBps } from '../utils/finance';
import { PeriodComparisonDropdownBar } from './PeriodComparisonDropdownBar';
import {
  TrendingUp,
  TrendingDown,
  FileText,
  DollarSign,
  Download,
  Printer,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';

interface ProfitAndLossViewProps {
  data: FinancialData;
  margins: CalculatedMargins;
  period1Label: string;
  period2Label: string;
  currency: string;
  unit: string;
  companyName: string;
  syncWithDashboard?: boolean;
  onToggleSync?: (checked: boolean) => void;
  onApplyPeriodComparison?: (
    p1: string,
    p2: string,
    newData?: FinancialData,
    newSegments?: RevenueSegmentItem[],
    newBs?: BalanceSheetData
  ) => void;
}

export function ProfitAndLossView({
  data,
  margins,
  period1Label,
  period2Label,
  currency,
  unit,
  companyName,
  syncWithDashboard = true,
  onToggleSync,
  onApplyPeriodComparison,
}: ProfitAndLossViewProps) {
  const rev1 = data.revenueP1 || 1;
  const rev2 = data.revenueP2 || 1;

  // Calculation helpers
  const marketing1 = data.marketingP1 ?? 0;
  const marketing2 = data.marketingP2 ?? 0;
  const admin1 = data.generalAdminP1 ?? 0;
  const admin2 = data.generalAdminP2 ?? 0;
  const rd1 = data.rdP1 ?? 0;
  const rd2 = data.rdP2 ?? 0;
  const depr1 = data.deprAmortP1 ?? 0;
  const depr2 = data.deprAmortP2 ?? 0;

  const otherOpex1 = Math.max(0, data.opexP1 - (marketing1 + admin1 + rd1));
  const otherOpex2 = Math.max(0, data.opexP2 - (marketing2 + admin2 + rd2));

  const interest1 = data.interestExpenseP1 ?? 0;
  const interest2 = data.interestExpenseP2 ?? 0;
  const tax1 = data.taxP1 ?? 0;
  const tax2 = data.taxP2 ?? 0;

  // Rows definition
  const pnlRows = [
    {
      label: 'Pendapatan Usaha (Revenue)',
      val1: data.revenueP1,
      val2: data.revenueP2,
      isBold: true,
      isSubtotal: false,
      indent: 0,
      showMargin: false,
    },
    {
      label: '(-) Beban Pokok Penjualan (COGS / HPP)',
      val1: -data.cogsP1,
      val2: -data.cogsP2,
      isBold: false,
      isSubtotal: false,
      indent: 1,
      showMargin: false,
    },
    {
      label: '(=) Laba Kotor (Gross Profit)',
      val1: margins.grossProfitP1,
      val2: margins.grossProfitP2,
      isBold: true,
      isSubtotal: true,
      indent: 0,
      showMargin: true,
      marginP1: margins.grossMarginP1,
      marginP2: margins.grossMarginP2,
      deltaBps: margins.grossMarginDeltaBps,
    },
    {
      label: 'Beban Operasional (Operating Expenses):',
      val1: null,
      val2: null,
      isHeader: true,
      indent: 0,
    },
    {
      label: '• Beban Pemasaran, Iklan & Penjualan',
      val1: marketing1 > 0 ? -marketing1 : null,
      val2: marketing2 > 0 ? -marketing2 : null,
      isBold: false,
      indent: 1,
    },
    {
      label: '• Beban Umum & Administrasi (G&A)',
      val1: admin1 > 0 ? -admin1 : null,
      val2: admin2 > 0 ? -admin2 : null,
      isBold: false,
      indent: 1,
    },
    {
      label: '• Riset & Pengembangan (R&D)',
      val1: rd1 > 0 ? -rd1 : null,
      val2: rd2 > 0 ? -rd2 : null,
      isBold: false,
      indent: 1,
    },
    ...(otherOpex1 > 0 || otherOpex2 > 0
      ? [
          {
            label: '• Beban Operasional Lainnya',
            val1: -otherOpex1,
            val2: -otherOpex2,
            isBold: false,
            indent: 1,
          },
        ]
      : []),
    {
      label: 'Total Beban Operasional (OPEX)',
      val1: -data.opexP1,
      val2: -data.opexP2,
      isBold: true,
      isSubtotal: true,
      indent: 1,
      pctP1: (data.opexP1 / rev1) * 100,
      pctP2: (data.opexP2 / rev2) * 100,
    },
    {
      label: '(=) Laba Usaha / Operasi (EBIT)',
      val1: margins.operatingProfitP1,
      val2: margins.operatingProfitP2,
      isBold: true,
      isSubtotal: true,
      indent: 0,
      showMargin: true,
      marginP1: margins.operatingMarginP1,
      marginP2: margins.operatingMarginP2,
      deltaBps: margins.operatingMarginDeltaBps,
    },
    {
      label: '(+) Penyusutan & Amortisasi (Non-Cash)',
      val1: depr1 > 0 ? depr1 : null,
      val2: depr2 > 0 ? depr2 : null,
      isBold: false,
      indent: 1,
    },
    {
      label: '(=) EBITDA (Earnings Before Int, Tax, Depr & Amort)',
      val1: margins.ebitdaP1,
      val2: margins.ebitdaP2,
      isBold: true,
      isSubtotal: true,
      indent: 0,
      showMargin: true,
      marginP1: margins.ebitdaMarginP1,
      marginP2: margins.ebitdaMarginP2,
      deltaBps: margins.ebitdaMarginDeltaBps,
    },
    {
      label: '(-) Beban Bunga & Keuangan',
      val1: interest1 > 0 ? -interest1 : null,
      val2: interest2 > 0 ? -interest2 : null,
      isBold: false,
      indent: 1,
    },
    {
      label: '(-) Beban Pajak Penghasilan',
      val1: tax1 > 0 ? -tax1 : null,
      val2: tax2 > 0 ? -tax2 : null,
      isBold: false,
      indent: 1,
    },
    {
      label: '(=) Laba / (Rugi) Bersih Tahun Berjalan (Net Income)',
      val1: margins.netIncomeP1,
      val2: margins.netIncomeP2,
      isBold: true,
      isFinal: true,
      indent: 0,
      showMargin: true,
      marginP1: margins.netMarginP1,
      marginP2: margins.netMarginP2,
      deltaBps: margins.netMarginDeltaBps,
    },
  ];

  const revGrowth = ((data.revenueP2 - data.revenueP1) / Math.abs(data.revenueP1 || 1)) * 100;
  const net1 = data.netIncomeP1 ?? margins.netIncomeP1;
  const net2 = data.netIncomeP2 ?? margins.netIncomeP2;
  const netGrowth = ((net2 - net1) / Math.abs(net1 || 1)) * 100;

  const pnlBadge = {
    tag: 'NET PROFIT YoY',
    mainText: `${netGrowth >= 0 ? '+' : ''}${netGrowth.toFixed(1)}%`,
    subText: `Rev ${revGrowth >= 0 ? '+' : ''}${revGrowth.toFixed(1)}%`,
    isPositive: netGrowth >= 0,
    note: `Laba bersih berubah dari ${formatFinancialNumber(net1)} (${period1Label}) menjadi ${formatFinancialNumber(net2)} (${period2Label}) miliar Rupiah. Evaluasi dampak margin operasional dan pos beban terhadap bottom-line.`,
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Company Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-white uppercase tracking-wider">
              Laporan Keuangan Resmi
            </span>
            <span className="text-xs text-slate-500 font-medium">Standard CFA / IFRS Format</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Laporan Laba Rugi Komparatif (Profit & Loss Statement)
          </h2>
          <p className="text-xs text-slate-500">
            {companyName} • Periode {period1Label} vs {period2Label} • dalam miliar Rupiah
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Cetak / PDF</span>
          </button>
        </div>
      </div>

      {/* Dropdown Period Comparison Selector */}
      <PeriodComparisonDropdownBar
        title="Pilihan Periode Komparasi Laba Rugi (P&L Period Comparison)"
        subtitle="Ganti periode pembanding (Prior) dan berjalan (Current) secara fleksibel dengan pilihan dropdown kuartalan maupun tahunan"
        period1Label={period1Label}
        period2Label={period2Label}
        syncWithDashboard={syncWithDashboard}
        onToggleSync={onToggleSync || (() => {})}
        onApplyComparison={(p1, p2, newData, newSegments, newBs) => {
          if (onApplyPeriodComparison) {
            onApplyPeriodComparison(p1, p2, newData, newSegments, newBs);
          }
        }}
        badgeContent={pnlBadge}
      />

      {/* Main Comparative Statement Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4 sm:px-6">
                  <span className="block text-xs font-bold tracking-wider text-white">PROFIT AND LOSS</span>
                  <span className="block text-[10px] font-normal normal-case text-slate-400 font-sans mt-0.5">
                    dalam miliar Rupiah
                  </span>
                </th>
                <th className="py-3 px-3 text-right">
                  {period2Label}
                  <span className="block text-[10px] text-slate-300 font-normal font-sans">
                    (Current)
                  </span>
                </th>
                <th className="py-3 px-3 text-right">
                  {period1Label}
                  <span className="block text-[10px] text-slate-400 font-normal font-sans">
                    (Prior)
                  </span>
                </th>
                <th className="py-3 px-3 text-right">Pertumbuhan YoY</th>
                <th className="py-3 px-4 sm:px-6 text-right">Dampak Margin (bps)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pnlRows.map((row, idx) => {
                if (row.isHeader) {
                  return (
                    <tr key={idx} className="bg-slate-50/70">
                      <td
                        colSpan={5}
                        className="py-2 px-4 sm:px-6 font-bold text-slate-700 text-[11px] uppercase tracking-wider"
                      >
                        {row.label}
                      </td>
                    </tr>
                  );
                }

                if (row.val1 === null && row.val2 === null) return null;

                const v1 = row.val1 ?? 0;
                const v2 = row.val2 ?? 0;
                const diff = v2 - v1;
                const growth = v1 !== 0 ? ((v2 - v1) / Math.abs(v1)) * 100 : 0;

                const pctRev1 = (v1 / rev1) * 100;
                const pctRev2 = (v2 / rev2) * 100;

                let rowBg = 'hover:bg-slate-50/70';
                if (row.isFinal) rowBg = 'bg-amber-50/50 hover:bg-amber-50 font-black';
                else if (row.isSubtotal) rowBg = 'bg-slate-50/40 hover:bg-slate-100/50';

                return (
                  <tr key={idx} className={`${rowBg} transition-colors`}>
                    <td
                      className={`py-2.5 px-4 sm:px-6 ${
                        row.isFinal
                          ? 'text-slate-950 font-black text-sm'
                          : row.isBold
                          ? 'text-slate-900 font-bold'
                          : 'text-slate-700'
                      }`}
                      style={{ paddingLeft: `${1.5 + (row.indent || 0) * 1.25}rem` }}
                    >
                      {row.label}
                    </td>

                    {/* Period 2 (Current) */}
                    <td className="py-2.5 px-3 text-right font-mono">
                      <span
                        className={`font-bold ${
                          row.isFinal
                            ? v2 >= 0
                              ? 'text-emerald-700 font-black text-sm'
                              : 'text-rose-700 font-black text-sm'
                            : 'text-slate-900'
                        }`}
                      >
                        {formatFinancialNumber(v2)}
                      </span>
                      <span className="block text-[10px] text-slate-400 font-sans">
                        {pctRev2.toFixed(1)}% rev
                      </span>
                    </td>

                    {/* Period 1 (Prior) */}
                    <td className="py-2.5 px-3 text-right font-mono">
                      <span className="font-bold text-slate-900">
                        {formatFinancialNumber(v1)}
                      </span>
                      <span className="block text-[10px] text-slate-400 font-sans">
                        {pctRev1.toFixed(1)}% rev
                      </span>
                    </td>

                    {/* Growth YoY */}
                    <td className="py-2.5 px-3 text-right font-mono">
                      <div className="inline-flex items-center gap-1 font-bold">
                        {growth > 0 ? (
                          <span className="text-emerald-700 flex items-center">
                            <ArrowUpRight className="w-3 h-3 inline" />
                            {formatPercent(growth)}
                          </span>
                        ) : growth < 0 ? (
                          <span className="text-rose-700 flex items-center">
                            <ArrowDownRight className="w-3 h-3 inline" />
                            {formatPercent(growth)}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal">0.0%</span>
                        )}
                      </div>
                      <span className="block text-[10px] text-slate-400 font-sans">
                        Δ {formatFinancialNumber(diff, 0, false)}
                      </span>
                    </td>

                    {/* Margin Impact (bps) */}
                    <td className="py-2.5 px-4 sm:px-6 text-right font-mono">
                      {row.showMargin && row.deltaBps !== undefined ? (
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                            row.deltaBps >= 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {formatBps(row.deltaBps)}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* P&L Key Observations for Analysts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Pertumbuhan Top-line vs Biaya
          </span>
          <div className="text-lg font-bold text-slate-900 font-mono">
            {formatPercent(margins.revenueGrowthPct)} Rev vs {formatPercent(margins.cogsGrowthPct)} COGS
          </div>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            {margins.cogsGrowthPct > margins.revenueGrowthPct
              ? '⚠️ Biaya produksi tumbuh lebih cepat dari omzet, menandakan inefisiensi pengadaan atau pelemahan pricing power.'
              : 'Pertumbuhan pendapatan mampu mengimbangi laju beban pokok penjualan.'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Operating Leverage (EBIT / Revenue)
          </span>
          <div className="text-lg font-bold text-slate-900 font-mono">
            {margins.operatingMarginP2.toFixed(1)}% EBIT Margin
          </div>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Perubahan margin operasional sebesar{' '}
            <strong className="text-slate-800">{formatBps(margins.operatingMarginDeltaBps)}</strong>.
            Menunjukkan elastisitas laba terhadap penambahan skala operasional.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Konversi Laba Bersih (Net Margin)
          </span>
          <div
            className={`text-lg font-bold font-mono ${
              margins.netIncomeP2 >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {formatFinancialNumber(margins.netIncomeP2)} ({margins.netMarginP2.toFixed(1)}%)
          </div>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            {margins.netIncomeP2 >= 0
              ? 'Perusahaan membukukan laba bersih positif untuk tahun buku berjalan.'
              : 'Perusahaan mengalami rugi bersih tahun berjalan akibat tingginya beban operasional & pembiayaan.'}
          </p>
        </div>
      </div>
    </div>
  );
}
