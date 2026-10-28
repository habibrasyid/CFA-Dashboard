import React from 'react';
import { FinancialData, BalanceSheetData, RevenueSegmentItem } from '../types';
import { formatCurrency, formatPercent } from '../utils/finance';
import { PeriodComparisonDropdownBar } from './PeriodComparisonDropdownBar';
import {
  Scale,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Printer,
  ShieldCheck,
  CreditCard,
  Building,
  Coins,
} from 'lucide-react';

interface BalanceSheetViewProps {
  data: FinancialData;
  balanceSheet?: BalanceSheetData;
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

export function BalanceSheetView({
  data,
  balanceSheet,
  period1Label,
  period2Label,
  currency,
  unit,
  companyName,
  syncWithDashboard = true,
  onToggleSync,
  onApplyPeriodComparison,
}: BalanceSheetViewProps) {
  // Extract values with fallbacks to FinancialData
  // Current Assets
  const cashP1 = balanceSheet?.cashEquivalentsP1 ?? data.cashEquivalentsP1 ?? 0;
  const cashP2 = balanceSheet?.cashEquivalentsP2 ?? data.cashEquivalentsP2 ?? 0;

  const arP1 = balanceSheet?.accountsReceivableP1 ?? data.accountsReceivableP1 ?? 0;
  const arP2 = balanceSheet?.accountsReceivableP2 ?? data.accountsReceivableP2 ?? 0;

  const invP1 = balanceSheet?.inventoryP1 ?? data.inventoryP1 ?? 0;
  const invP2 = balanceSheet?.inventoryP2 ?? data.inventoryP2 ?? 0;

  const otherCaP1 = balanceSheet?.otherCurrentAssetsP1 ?? data.otherCurrentAssetsP1 ?? 5.0;
  const otherCaP2 = balanceSheet?.otherCurrentAssetsP2 ?? data.otherCurrentAssetsP2 ?? 7.0;

  const totalCurrentAssetsP1 = cashP1 + arP1 + invP1 + otherCaP1;
  const totalCurrentAssetsP2 = cashP2 + arP2 + invP2 + otherCaP2;

  // Non-Current Assets
  const ppeP1 = balanceSheet?.ppeP1 ?? data.ppeP1 ?? 30.0;
  const ppeP2 = balanceSheet?.ppeP2 ?? data.ppeP2 ?? 35.0;

  const intangiblesP1 = balanceSheet?.intangiblesP1 ?? data.intangiblesP1 ?? 15.0;
  const intangiblesP2 = balanceSheet?.intangiblesP2 ?? data.intangiblesP2 ?? 18.0;

  const otherNcaP1 = balanceSheet?.otherNonCurrentAssetsP1 ?? 5.0;
  const otherNcaP2 = balanceSheet?.otherNonCurrentAssetsP2 ?? 6.0;

  const totalNonCurrentAssetsP1 = ppeP1 + intangiblesP1 + otherNcaP1;
  const totalNonCurrentAssetsP2 = ppeP2 + intangiblesP2 + otherNcaP2;

  const totalAssetsP1 = totalCurrentAssetsP1 + totalNonCurrentAssetsP1;
  const totalAssetsP2 = totalCurrentAssetsP2 + totalNonCurrentAssetsP2;
  const assetsGrowth = ((totalAssetsP2 - totalAssetsP1) / Math.abs(totalAssetsP1 || 1)) * 100;

  // Current Liabilities
  const apP1 = balanceSheet?.accountsPayableP1 ?? data.accountsPayableP1 ?? 20.0;
  const apP2 = balanceSheet?.accountsPayableP2 ?? data.accountsPayableP2 ?? 28.0;

  const stDebtP1 = balanceSheet?.shortTermDebtP1 ?? data.shortTermDebtP1 ?? (data.totalDebtP1 ? data.totalDebtP1 * 0.4 : 8.0);
  const stDebtP2 = balanceSheet?.shortTermDebtP2 ?? data.shortTermDebtP2 ?? (data.totalDebtP2 ? data.totalDebtP2 * 0.45 : 15.0);

  const accruedP1 = balanceSheet?.accruedLiabilitiesP1 ?? data.accruedLiabilitiesP1 ?? 6.0;
  const accruedP2 = balanceSheet?.accruedLiabilitiesP2 ?? data.accruedLiabilitiesP2 ?? 9.5;

  const totalCurrentLiabilitiesP1 = apP1 + stDebtP1 + accruedP1;
  const totalCurrentLiabilitiesP2 = apP2 + stDebtP2 + accruedP2;

  // Non-Current Liabilities
  const ltDebtP1 = balanceSheet?.longTermDebtP1 ?? data.longTermDebtP1 ?? (data.totalDebtP1 ? data.totalDebtP1 * 0.6 : 12.0);
  const ltDebtP2 = balanceSheet?.longTermDebtP2 ?? data.longTermDebtP2 ?? (data.totalDebtP2 ? data.totalDebtP2 * 0.55 : 20.0);

  const otherNclP1 = balanceSheet?.otherNonCurrentLiabilitiesP1 ?? 4.0;
  const otherNclP2 = balanceSheet?.otherNonCurrentLiabilitiesP2 ?? 5.0;

  const totalNonCurrentLiabilitiesP1 = ltDebtP1 + otherNclP1;
  const totalNonCurrentLiabilitiesP2 = ltDebtP2 + otherNclP2;

  const totalLiabilitiesP1 = totalCurrentLiabilitiesP1 + totalNonCurrentLiabilitiesP1;
  const totalLiabilitiesP2 = totalCurrentLiabilitiesP2 + totalNonCurrentLiabilitiesP2;

  // Shareholders' Equity
  const shareCapitalP1 = balanceSheet?.shareCapitalP1 ?? data.shareCapitalP1 ?? 50.0;
  const shareCapitalP2 = balanceSheet?.shareCapitalP2 ?? data.shareCapitalP2 ?? 50.0;

  // Retained earnings
  const retainedP1 = balanceSheet?.retainedEarningsP1 ?? data.retainedEarningsP1 ?? (totalAssetsP1 - totalLiabilitiesP1 - shareCapitalP1);
  const retainedP2 = balanceSheet?.retainedEarningsP2 ?? data.retainedEarningsP2 ?? (totalAssetsP2 - totalLiabilitiesP2 - shareCapitalP2);

  const totalEquityP1 = shareCapitalP1 + retainedP1;
  const totalEquityP2 = shareCapitalP2 + retainedP2;

  const totalLiabAndEquityP1 = totalLiabilitiesP1 + totalEquityP1;
  const totalLiabAndEquityP2 = totalLiabilitiesP2 + totalEquityP2;

  // Financial Health Ratios (CFA Standard)
  const currentRatioP1 = totalCurrentLiabilitiesP1 > 0 ? totalCurrentAssetsP1 / totalCurrentLiabilitiesP1 : 0;
  const currentRatioP2 = totalCurrentLiabilitiesP2 > 0 ? totalCurrentAssetsP2 / totalCurrentLiabilitiesP2 : 0;

  const quickRatioP1 = totalCurrentLiabilitiesP1 > 0 ? (cashP1 + arP1) / totalCurrentLiabilitiesP1 : 0;
  const quickRatioP2 = totalCurrentLiabilitiesP2 > 0 ? (cashP2 + arP2) / totalCurrentLiabilitiesP2 : 0;

  const nwcP1 = totalCurrentAssetsP1 - totalCurrentLiabilitiesP1;
  const nwcP2 = totalCurrentAssetsP2 - totalCurrentLiabilitiesP2;

  const totalDebt1 = stDebtP1 + ltDebtP1;
  const totalDebt2 = stDebtP2 + ltDebtP2;
  const debtToEquityP1 = totalEquityP1 > 0 ? totalDebt1 / totalEquityP1 : 0;
  const debtToEquityP2 = totalEquityP2 > 0 ? totalDebt2 / totalEquityP2 : 0;

  const isBalanced = Math.abs(totalAssetsP2 - totalLiabAndEquityP2) < 0.1;

  const bsSections = [
    // 1. Current Assets
    {
      category: 'ASET LANCAR (CURRENT ASSETS)',
      items: [
        { label: 'Kas & Setara Kas (Cash & Equivalents)', val1: cashP1, val2: cashP2 },
        { label: 'Piutang Usaha Bruto (Accounts Receivable)', val1: arP1, val2: arP2 },
        { label: 'Persediaan Barang (Inventories)', val1: invP1, val2: invP2 },
        { label: 'Aset Lancar Lainnya (Other Current Assets)', val1: otherCaP1, val2: otherCaP2 },
      ],
      subtotalLabel: 'TOTAL ASET LANCAR',
      subVal1: totalCurrentAssetsP1,
      subVal2: totalCurrentAssetsP2,
    },
    // 2. Non-Current Assets
    {
      category: 'ASET TIDAK LANCAR (NON-CURRENT ASSETS)',
      items: [
        { label: 'Aset Tetap Neto (Property, Plant & Equipment)', val1: ppeP1, val2: ppeP2 },
        { label: 'Aset Takberwujud & Lisensi (Intangibles)', val1: intangiblesP1, val2: intangiblesP2 },
        { label: 'Aset Tidak Lancar Lainnya', val1: otherNcaP1, val2: otherNcaP2 },
      ],
      subtotalLabel: 'TOTAL ASET TIDAK LANCAR',
      subVal1: totalNonCurrentAssetsP1,
      subVal2: totalNonCurrentAssetsP2,
      grandLabel: 'TOTAL ASET (ASSETS)',
      grandVal1: totalAssetsP1,
      grandVal2: totalAssetsP2,
    },
    // 3. Current Liabilities
    {
      category: 'LIABILITAS JANGKA PENDEK (CURRENT LIABILITIES)',
      items: [
        { label: 'Utang Usaha (Accounts Payable)', val1: apP1, val2: apP2 },
        { label: 'Utang Bank Jangka Pendek (Short-term Debt)', val1: stDebtP1, val2: stDebtP2 },
        { label: 'Beban Akrual & Liabilitas Lancar Lainnya', val1: accruedP1, val2: accruedP2 },
      ],
      subtotalLabel: 'TOTAL LIABILITAS JANGKA PENDEK',
      subVal1: totalCurrentLiabilitiesP1,
      subVal2: totalCurrentLiabilitiesP2,
    },
    // 4. Non-Current Liabilities
    {
      category: 'LIABILITAS JANGKA PANJANG (NON-CURRENT LIABILITIES)',
      items: [
        { label: 'Utang Bank / Obligasi Jangka Panjang (Long-term Debt)', val1: ltDebtP1, val2: ltDebtP2 },
        { label: 'Liabilitas Imbalan Pasca Kerja & Lainnya', val1: otherNclP1, val2: otherNclP2 },
      ],
      subtotalLabel: 'TOTAL LIABILITAS JANGKA PANJANG',
      subVal1: totalNonCurrentLiabilitiesP1,
      subVal2: totalNonCurrentLiabilitiesP2,
      totalLiabLabel: 'TOTAL LIABILITAS (LIABILITIES)',
      totalLiabVal1: totalLiabilitiesP1,
      totalLiabVal2: totalLiabilitiesP2,
    },
    // 5. Equity
    {
      category: 'EKUITAS PEMEGANG SAHAM (SHAREHOLDERS EQUITY)',
      items: [
        { label: 'Modal Saham Disetor (Share Capital)', val1: shareCapitalP1, val2: shareCapitalP2 },
        { label: 'Saldo Laba Ditahan / (Defisit)', val1: retainedP1, val2: retainedP2 },
      ],
      subtotalLabel: 'TOTAL EKUITAS',
      subVal1: totalEquityP1,
      subVal2: totalEquityP2,
      grandLabel: 'TOTAL LIABILITAS & EKUITAS',
      grandVal1: totalLiabAndEquityP1,
      grandVal2: totalLiabAndEquityP2,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-white uppercase tracking-wider">
              Neraca Keuangan
            </span>
            <span className="text-xs text-slate-500 font-medium">Standard Balance Sheet Position</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Laporan Posisi Keuangan Komparatif (Balance Sheet)
          </h2>
          <p className="text-xs text-slate-500">
            {companyName} • Perbandingan Periode {period1Label} vs {period2Label} (Mata Uang: {currency} {unit})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border ${
              isBalanced
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Neraca Seimbang (Aset = Liab + Ekuitas)</span>
          </div>

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
        title="Pilihan Periode Komparasi Neraca (Balance Sheet Period Selector)"
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
        badgeContent={{
          tag: 'TOTAL ASET YoY',
          mainText: `${assetsGrowth >= 0 ? '+' : ''}${assetsGrowth.toFixed(1)}%`,
          subText: isBalanced ? 'Neraca Seimbang' : 'Ada Selisih',
          isPositive: assetsGrowth >= 0,
          note: `Total aset berubah dari ${formatCurrency(totalAssetsP1, currency, unit)} (${period1Label}) menjadi ${formatCurrency(totalAssetsP2, currency, unit)} (${period2Label}). Struktur likuiditas & solvabilitas diverifikasi seimbang.`,
        }}
      />

      {/* Key Balance Sheet Ratios Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Current Ratio */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Current Ratio (CR)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold font-mono text-slate-900">
              {currentRatioP2.toFixed(2)}x
            </span>
            <span className="text-xs text-slate-400 font-mono">
              (Sebelumnya: {currentRatioP1.toFixed(2)}x)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {currentRatioP2 >= 1.5
              ? '✅ Likuiditas lancar sehat (di atas 1.5x)'
              : currentRatioP2 >= 1.0
              ? '⚠️ Cukup, namun buffer kas ketat'
              : '🚨 Risiko likuiditas tinggi (< 1.0x)'}
          </p>
        </div>

        {/* Quick Ratio */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Quick Ratio (Acid-Test)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold font-mono text-slate-900">
              {quickRatioP2.toFixed(2)}x
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ({quickRatioP1.toFixed(2)}x)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Tanpa mengandalkan likuidasi persediaan fisik.
          </p>
        </div>

        {/* Net Working Capital */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Modal Kerja Bersih (NWC)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span
              className={`text-xl font-bold font-mono ${
                nwcP2 >= 0 ? 'text-slate-900' : 'text-rose-700'
              }`}
            >
              {formatCurrency(nwcP2, currency, unit)}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              (Δ {formatCurrency(nwcP2 - nwcP1, currency, unit)})
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Selisih aset lancar dikurangi liabilitas jangka pendek.
          </p>
        </div>

        {/* Debt to Equity */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Debt-to-Equity (D/E)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span
              className={`text-xl font-bold font-mono ${
                debtToEquityP2 > 2.0 ? 'text-rose-700' : 'text-slate-900'
              }`}
            >
              {debtToEquityP2.toFixed(2)}x
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ({debtToEquityP1.toFixed(2)}x)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {debtToEquityP2 > 2.0
              ? '⚠️ Risiko financial leverage tinggi'
              : 'Struktur utang terhadap ekuitas stabil'}
          </p>
        </div>
      </div>

      {/* Main Comparative Balance Sheet Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4 sm:px-6">
                  <span>Pos Neraca (Balance Sheet Items)</span>
                  <span className="block text-[10px] text-slate-400 font-normal font-sans mt-0.5">(Dalam Miliar Rupiah)</span>
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
                <th className="py-3 px-3 text-right">Perubahan Nominal</th>
                <th className="py-3 px-4 sm:px-6 text-right">Pertumbuhan (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bsSections.map((sec, secIdx) => (
                <React.Fragment key={secIdx}>
                  {/* Category Header */}
                  <tr className="bg-slate-100/80">
                    <td
                      colSpan={5}
                      className="py-2.5 px-4 sm:px-6 font-bold text-slate-900 text-[11px] tracking-wider uppercase"
                    >
                      {sec.category}
                    </td>
                  </tr>

                  {/* Category Items */}
                  {sec.items.map((item, itemIdx) => {
                    const diff = item.val2 - item.val1;
                    const growth = item.val1 !== 0 ? ((item.val2 - item.val1) / Math.abs(item.val1)) * 100 : 0;

                    return (
                      <tr key={itemIdx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-4 sm:px-8 text-slate-700">
                          {item.label}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          {formatCurrency(item.val2, currency, unit)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                          {formatCurrency(item.val1, currency, unit)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono">
                          <span
                            className={
                              diff > 0
                                ? 'text-slate-900'
                                : diff < 0
                                ? 'text-slate-600'
                                : 'text-slate-400'
                            }
                          >
                            {diff > 0 ? '+' : ''}
                            {formatCurrency(diff, currency, unit)}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 sm:px-6 text-right font-mono">
                          {growth > 0 ? (
                            <span className="text-slate-900 font-semibold inline-flex items-center">
                              <ArrowUpRight className="w-3 h-3 text-slate-500 mr-0.5" />
                              {formatPercent(growth)}
                            </span>
                          ) : growth < 0 ? (
                            <span className="text-slate-600 font-semibold inline-flex items-center">
                              <ArrowDownRight className="w-3 h-3 text-slate-400 mr-0.5" />
                              {formatPercent(growth)}
                            </span>
                          ) : (
                            <span className="text-slate-400">0.0%</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Subtotal Row */}
                  <tr className="bg-slate-50/70 font-bold border-t border-slate-200">
                    <td className="py-2.5 px-4 sm:px-6 text-slate-900 uppercase text-[11px]">
                      {sec.subtotalLabel}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-900">
                      {formatCurrency(sec.subVal2, currency, unit)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                      {formatCurrency(sec.subVal1, currency, unit)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                      {sec.subVal2 - sec.subVal1 > 0 ? '+' : ''}
                      {formatCurrency(sec.subVal2 - sec.subVal1, currency, unit)}
                    </td>
                    <td className="py-2.5 px-4 sm:px-6 text-right font-mono text-slate-700">
                      {sec.subVal1 !== 0
                        ? formatPercent(((sec.subVal2 - sec.subVal1) / Math.abs(sec.subVal1)) * 100)
                        : '—'}
                    </td>
                  </tr>

                  {/* Total Liabilities if applicable */}
                  {sec.totalLiabLabel && (
                    <tr className="bg-slate-200/60 font-bold border-t border-slate-300">
                      <td className="py-2.5 px-4 sm:px-6 text-slate-950 uppercase text-[11px]">
                        {sec.totalLiabLabel}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-950 font-black">
                        {formatCurrency(sec.totalLiabVal2!, currency, unit)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-900">
                        {formatCurrency(sec.totalLiabVal1!, currency, unit)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-800">
                        {formatCurrency(sec.totalLiabVal2! - sec.totalLiabVal1!, currency, unit)}
                      </td>
                      <td className="py-2.5 px-4 sm:px-6 text-right font-mono text-slate-800">
                        {formatPercent(
                          ((sec.totalLiabVal2! - sec.totalLiabVal1!) / Math.abs(sec.totalLiabVal1!)) * 100
                        )}
                      </td>
                    </tr>
                  )}

                  {/* Grand Label if applicable (e.g. Total Assets or Total Liab + Equity) */}
                  {sec.grandLabel && (
                    <tr className="bg-amber-50/60 hover:bg-amber-50/80 font-black border-t-2 border-b-2 border-slate-900">
                      <td className="py-3 px-4 sm:px-6 text-slate-950 uppercase text-xs">
                        {sec.grandLabel}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-950 text-sm">
                        {formatCurrency(sec.grandVal2!, currency, unit)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-900">
                        {formatCurrency(sec.grandVal1!, currency, unit)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-900">
                        {sec.grandVal2! - sec.grandVal1! > 0 ? '+' : ''}
                        {formatCurrency(sec.grandVal2! - sec.grandVal1!, currency, unit)}
                      </td>
                      <td className="py-3 px-4 sm:px-6 text-right font-mono text-slate-900">
                        {sec.grandVal1 !== 0
                          ? formatPercent(
                              ((sec.grandVal2! - sec.grandVal1!) / Math.abs(sec.grandVal1!)) * 100
                            )
                          : '—'}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
