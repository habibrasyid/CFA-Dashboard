import React from 'react';
import { FinancialData, CalculatedMargins } from '../types';
import { formatCurrency, formatPercent, formatBps } from '../utils/finance';
import { SlidersHorizontal, ArrowUpDown, FileSpreadsheet, RotateCcw, AlertCircle } from 'lucide-react';

interface FinancialDataTableProps {
  data: FinancialData;
  onChange: (updated: FinancialData) => void;
  margins: CalculatedMargins;
  companyName: string;
  setCompanyName: (name: string) => void;
  period1Label: string;
  setPeriod1Label: (val: string) => void;
  period2Label: string;
  setPeriod2Label: (val: string) => void;
  currency: string;
  unit: string;
  onOpenCsvModal: () => void;
  onResetToSample: () => void;
}

export function FinancialDataTable({
  data,
  onChange,
  margins,
  companyName,
  setCompanyName,
  period1Label,
  setPeriod1Label,
  period2Label,
  setPeriod2Label,
  currency,
  unit,
  onOpenCsvModal,
  onResetToSample,
}: FinancialDataTableProps) {
  const updateField = (field: keyof FinancialData, val: string) => {
    const num = parseFloat(val);
    onChange({
      ...data,
      [field]: isNaN(num) ? 0 : num,
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight uppercase">
                Input Data Laporan Keuangan (Dual-Period Comparative)
              </h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                Live Calculator
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Edit nilai numerik di bawah ini untuk melihat simulasi kalkulasi margin seketika.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenCsvModal}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Import CSV / Paste Excel</span>
            </button>

            <button
              type="button"
              onClick={onResetToSample}
              className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs"
              title="Reset ke Data Bawaan"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Company & Period Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-200/80">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Nama Entitas / Perusahaan
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full text-xs font-semibold text-slate-900 px-3 py-1.5 bg-white rounded-md border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
              placeholder="Misal: PT Nusantara Sukses Tbk"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Label Periode Berjalan (Current)
            </label>
            <input
              type="text"
              value={period2Label}
              onChange={(e) => setPeriod2Label(e.target.value)}
              className="w-full text-xs font-medium text-slate-800 px-3 py-1.5 bg-white rounded-md border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
              placeholder="Misal: FY 2024 / Q2 2024"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Label Periode Pembanding (Prior)
            </label>
            <input
              type="text"
              value={period1Label}
              onChange={(e) => setPeriod1Label(e.target.value)}
              className="w-full text-xs font-medium text-slate-800 px-3 py-1.5 bg-white rounded-md border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
              placeholder="Misal: FY 2023 / Q1 2024"
            />
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/90 text-slate-700 font-semibold border-b border-slate-200">
              <th className="py-2.5 px-4 w-1/3">
                <span>Pos Laporan Keuangan</span>
                <span className="block text-[10px] font-normal text-slate-500 font-sans mt-0.5">(Dalam Miliar Rupiah)</span>
              </th>
              <th className="py-2.5 px-4 w-1/5 text-right font-bold text-slate-900 bg-amber-50/50">
                {period2Label} (Current)
              </th>
              <th className="py-2.5 px-4 w-1/5 text-right">{period1Label} (Prior)</th>
              <th className="py-2.5 px-4 w-1/4 text-right">Variansi / Perubahan (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {/* SECTION: INCOME STATEMENT */}
            <tr className="bg-slate-50/50 font-bold text-[11px] text-slate-500 uppercase tracking-wider">
              <td colSpan={4} className="py-2 px-4">
                I. Laporan Laba Rugi (Income Statement)
              </td>
            </tr>

            {/* Revenue */}
            <tr className="hover:bg-slate-50/80">
              <td className="py-2.5 px-4 font-semibold text-slate-900">
                1. Pendapatan Usaha (Gross Revenue)
              </td>
              <td className="py-2 px-4 text-right bg-amber-50/30">
                <input
                  type="number"
                  step="any"
                  value={data.revenueP2}
                  onChange={(e) => updateField('revenueP2', e.target.value)}
                  className="w-28 text-right font-medium px-2 py-1 bg-white rounded border border-amber-300 focus:ring-1 focus:ring-slate-800"
                />
              </td>
              <td className="py-2 px-4 text-right">
                <input
                  type="number"
                  step="any"
                  value={data.revenueP1}
                  onChange={(e) => updateField('revenueP1', e.target.value)}
                  className="w-28 text-right font-medium px-2 py-1 bg-white rounded border border-slate-200 focus:ring-1 focus:ring-slate-800"
                />
              </td>
              <td className="py-2.5 px-4 text-right font-bold">
                <span
                  className={
                    margins.revenueGrowthPct >= 0
                      ? 'text-emerald-700'
                      : 'text-rose-700'
                  }
                >
                  {formatPercent(margins.revenueGrowthPct)}
                </span>
              </td>
            </tr>

            {/* COGS */}
            <tr className="hover:bg-slate-50/80">
              <td className="py-2.5 px-4 text-slate-700 pl-6">
                2. Beban Pokok Pendapatan (COGS)
              </td>
              <td className="py-2 px-4 text-right bg-amber-50/30">
                <input
                  type="number"
                  step="any"
                  value={data.cogsP2}
                  onChange={(e) => updateField('cogsP2', e.target.value)}
                  className="w-28 text-right font-medium px-2 py-1 bg-white rounded border border-amber-300 focus:ring-1 focus:ring-slate-800"
                />
              </td>
              <td className="py-2 px-4 text-right">
                <input
                  type="number"
                  step="any"
                  value={data.cogsP1}
                  onChange={(e) => updateField('cogsP1', e.target.value)}
                  className="w-28 text-right font-medium px-2 py-1 bg-white rounded border border-slate-200 focus:ring-1 focus:ring-slate-800"
                />
              </td>
              <td className="py-2.5 px-4 text-right font-semibold">
                <span
                  className={
                    margins.cogsGrowthPct > margins.revenueGrowthPct
                      ? 'text-rose-600 font-bold'
                      : 'text-slate-600'
                  }
                >
                  {formatPercent(margins.cogsGrowthPct)}
                </span>
              </td>
            </tr>

            {/* Calculated Gross Profit */}
            <tr className="bg-amber-50/40 font-semibold text-slate-900 border-y border-amber-100">
              <td className="py-2.5 px-4">
                = Laba Kotor (Gross Profit)
                <span className="block text-[11px] font-normal text-slate-500">
                  Gross Margin: {margins.grossMarginP2.toFixed(1)}% vs {margins.grossMarginP1.toFixed(1)}%
                </span>
              </td>
              <td className="py-2.5 px-4 text-right font-bold bg-amber-100/40">
                {margins.grossProfitP2.toFixed(2)}
              </td>
              <td className="py-2.5 px-4 text-right font-bold">
                {margins.grossProfitP1.toFixed(2)}
              </td>
              <td className="py-2.5 px-4 text-right font-bold">
                <span
                  className={`inline-block px-2 py-0.5 rounded text-[11px] ${
                    margins.grossMarginDeltaBps >= 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {formatBps(margins.grossMarginDeltaBps)}
                </span>
              </td>
            </tr>

            {/* OPEX Total */}
            <tr className="hover:bg-slate-50/80">
              <td className="py-2.5 px-4 font-semibold text-slate-900">
                3. Beban Operasional Total (Total OPEX)
              </td>
              <td className="py-2 px-4 text-right bg-amber-50/30">
                <input
                  type="number"
                  step="any"
                  value={data.opexP2}
                  onChange={(e) => updateField('opexP2', e.target.value)}
                  className="w-28 text-right font-medium px-2 py-1 bg-white rounded border border-amber-300 focus:ring-1 focus:ring-slate-800"
                />
              </td>
              <td className="py-2 px-4 text-right">
                <input
                  type="number"
                  step="any"
                  value={data.opexP1}
                  onChange={(e) => updateField('opexP1', e.target.value)}
                  className="w-28 text-right font-medium px-2 py-1 bg-white rounded border border-slate-200 focus:ring-1 focus:ring-slate-800"
                />
              </td>
              <td className="py-2.5 px-4 text-right font-semibold">
                <span
                  className={
                    margins.opexGrowthPct > margins.revenueGrowthPct
                      ? 'text-rose-600 font-bold'
                      : 'text-slate-600'
                  }
                >
                  {formatPercent(margins.opexGrowthPct)}
                </span>
              </td>
            </tr>

            {/* OPEX breakdown sub-rows */}
            <tr className="hover:bg-slate-50/50 text-[11px] text-slate-500">
              <td className="py-1.5 px-4 pl-8">• Beban Penjualan & Pemasaran (Marketing/CAC)</td>
              <td className="py-1.5 px-4 text-right bg-amber-50/30">
                <input
                  type="number"
                  step="any"
                  value={data.marketingP2 ?? ''}
                  onChange={(e) => updateField('marketingP2', e.target.value)}
                  className="w-24 text-right px-1.5 py-0.5 bg-white rounded border border-slate-200"
                  placeholder="Opsional"
                />
              </td>
              <td className="py-1.5 px-4 text-right">
                <input
                  type="number"
                  step="any"
                  value={data.marketingP1 ?? ''}
                  onChange={(e) => updateField('marketingP1', e.target.value)}
                  className="w-24 text-right px-1.5 py-0.5 bg-white rounded border border-slate-200"
                  placeholder="Opsional"
                />
              </td>
              <td className="py-1.5 px-4 text-right text-slate-400">Rincian SG&A</td>
            </tr>

            <tr className="hover:bg-slate-50/50 text-[11px] text-slate-500">
              <td className="py-1.5 px-4 pl-8">• Beban Umum & Administrasi (G&A)</td>
              <td className="py-1.5 px-4 text-right bg-amber-50/30">
                <input
                  type="number"
                  step="any"
                  value={data.generalAdminP2 ?? ''}
                  onChange={(e) => updateField('generalAdminP2', e.target.value)}
                  className="w-24 text-right px-1.5 py-0.5 bg-white rounded border border-slate-200"
                  placeholder="Opsional"
                />
              </td>
              <td className="py-1.5 px-4 text-right">
                <input
                  type="number"
                  step="any"
                  value={data.generalAdminP1 ?? ''}
                  onChange={(e) => updateField('generalAdminP1', e.target.value)}
                  className="w-24 text-right px-1.5 py-0.5 bg-white rounded border border-slate-200"
                  placeholder="Opsional"
                />
              </td>
              <td className="py-1.5 px-4 text-right text-slate-400">Rincian Overhead</td>
            </tr>

            {/* Operating Profit EBIT */}
            <tr className="bg-slate-100 font-bold text-slate-900 border-y border-slate-300">
              <td className="py-2.5 px-4">
                = Laba Usaha / Operasional (EBIT)
                <span className="block text-[11px] font-normal text-slate-500">
                  Operating Margin: {margins.operatingMarginP2.toFixed(1)}% vs {margins.operatingMarginP1.toFixed(1)}%
                </span>
              </td>
              <td className="py-2.5 px-4 text-right bg-amber-100/30">
                {margins.operatingProfitP2.toFixed(2)}
              </td>
              <td className="py-2.5 px-4 text-right">
                {margins.operatingProfitP1.toFixed(2)}
              </td>
              <td className="py-2.5 px-4 text-right font-bold">
                <span
                  className={`inline-block px-2 py-0.5 rounded text-[11px] ${
                    margins.operatingMarginDeltaBps >= 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {formatBps(margins.operatingMarginDeltaBps)}
                </span>
              </td>
            </tr>

            {/* D&A */}
            <tr className="hover:bg-slate-50/80">
              <td className="py-2 px-4 text-slate-600 pl-6">
                + Depresiasi & Amortisasi (D&A)
              </td>
              <td className="py-2 px-4 text-right bg-amber-50/30">
                <input
                  type="number"
                  step="any"
                  value={data.deprAmortP2 ?? ''}
                  onChange={(e) => updateField('deprAmortP2', e.target.value)}
                  className="w-28 text-right px-2 py-1 bg-white rounded border border-slate-200"
                  placeholder="0"
                />
              </td>
              <td className="py-2 px-4 text-right">
                <input
                  type="number"
                  step="any"
                  value={data.deprAmortP1 ?? ''}
                  onChange={(e) => updateField('deprAmortP1', e.target.value)}
                  className="w-28 text-right px-2 py-1 bg-white rounded border border-slate-200"
                  placeholder="0"
                />
              </td>
              <td className="py-2 px-4 text-right text-slate-500">
                EBITDA Margin Δ: {formatBps(margins.ebitdaMarginDeltaBps)}
              </td>
            </tr>

            {/* Net Income */}
            <tr className="bg-blue-50/40 font-bold text-slate-900 border-y border-blue-200">
              <td className="py-2.5 px-4">
                = Laba Bersih Tahun Berjalan (Net Income)
                <span className="block text-[11px] font-normal text-slate-500">
                  Net Margin: {margins.netMarginP2.toFixed(1)}% vs {margins.netMarginP1.toFixed(1)}%
                </span>
              </td>
              <td className="py-2 px-4 text-right bg-blue-100/50">
                <input
                  type="number"
                  step="any"
                  value={data.netIncomeP2 ?? margins.netIncomeP2}
                  onChange={(e) => updateField('netIncomeP2', e.target.value)}
                  className="w-28 text-right font-bold px-2 py-1 bg-white rounded border border-blue-300"
                />
              </td>
              <td className="py-2 px-4 text-right">
                <input
                  type="number"
                  step="any"
                  value={data.netIncomeP1 ?? margins.netIncomeP1}
                  onChange={(e) => updateField('netIncomeP1', e.target.value)}
                  className="w-28 text-right font-bold px-2 py-1 bg-white rounded border border-blue-300"
                />
              </td>
              <td className="py-2.5 px-4 text-right font-bold">
                <span
                  className={`inline-block px-2 py-0.5 rounded text-[11px] ${
                    margins.netMarginDeltaBps >= 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {formatBps(margins.netMarginDeltaBps)}
                </span>
              </td>
            </tr>

            {/* SECTION: BALANCE SHEET & CASH FLOW */}
            <tr className="bg-slate-50/50 font-bold text-[11px] text-slate-500 uppercase tracking-wider">
              <td colSpan={4} className="py-2 px-4">
                II. Indikator Likuiditas & Neraca (Balance Sheet & Cash Flow)
              </td>
            </tr>

            {/* OCF */}
            <tr className="hover:bg-slate-50/80">
              <td className="py-2.5 px-4 font-semibold text-slate-800">
                Arus Kas Operasi (Operating Cash Flow / OCF)
              </td>
              <td className="py-2 px-4 text-right bg-amber-50/30">
                <input
                  type="number"
                  step="any"
                  value={data.operatingCashFlowP2 ?? ''}
                  onChange={(e) => updateField('operatingCashFlowP2', e.target.value)}
                  className="w-28 text-right px-2 py-1 bg-white rounded border border-slate-200"
                  placeholder="0"
                />
              </td>
              <td className="py-2 px-4 text-right">
                <input
                  type="number"
                  step="any"
                  value={data.operatingCashFlowP1 ?? ''}
                  onChange={(e) => updateField('operatingCashFlowP1', e.target.value)}
                  className="w-28 text-right px-2 py-1 bg-white rounded border border-slate-200"
                  placeholder="0"
                />
              </td>
              <td className="py-2.5 px-4 text-right">
                {margins.cashConversionAnomaly && (
                  <span className="inline-flex items-center text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Divergensi Kas
                  </span>
                )}
              </td>
            </tr>

            {/* Accounts Receivable */}
            <tr className="hover:bg-slate-50/80">
              <td className="py-2.5 px-4 text-slate-700 pl-6">
                Piutang Usaha (Accounts Receivable)
              </td>
              <td className="py-2 px-4 text-right bg-amber-50/30">
                <input
                  type="number"
                  step="any"
                  value={data.accountsReceivableP2 ?? ''}
                  onChange={(e) => updateField('accountsReceivableP2', e.target.value)}
                  className="w-28 text-right px-2 py-1 bg-white rounded border border-slate-200"
                  placeholder="0"
                />
              </td>
              <td className="py-2 px-4 text-right">
                <input
                  type="number"
                  step="any"
                  value={data.accountsReceivableP1 ?? ''}
                  onChange={(e) => updateField('accountsReceivableP1', e.target.value)}
                  className="w-28 text-right px-2 py-1 bg-white rounded border border-slate-200"
                  placeholder="0"
                />
              </td>
              <td className="py-2.5 px-4 text-right text-slate-500">
                {data.accountsReceivableP1 && data.accountsReceivableP2
                  ? formatPercent(((data.accountsReceivableP2 - data.accountsReceivableP1) / data.accountsReceivableP1) * 100)
                  : '-'}
              </td>
            </tr>

            {/* Inventory */}
            <tr className="hover:bg-slate-50/80">
              <td className="py-2.5 px-4 text-slate-700 pl-6">
                Persediaan (Inventory / Stock)
              </td>
              <td className="py-2 px-4 text-right bg-amber-50/30">
                <input
                  type="number"
                  step="any"
                  value={data.inventoryP2 ?? ''}
                  onChange={(e) => updateField('inventoryP2', e.target.value)}
                  className="w-28 text-right px-2 py-1 bg-white rounded border border-slate-200"
                  placeholder="0"
                />
              </td>
              <td className="py-2 px-4 text-right">
                <input
                  type="number"
                  step="any"
                  value={data.inventoryP1 ?? ''}
                  onChange={(e) => updateField('inventoryP1', e.target.value)}
                  className="w-28 text-right px-2 py-1 bg-white rounded border border-slate-200"
                  placeholder="0"
                />
              </td>
              <td className="py-2.5 px-4 text-right text-slate-500">
                {data.inventoryP1 && data.inventoryP2
                  ? formatPercent(((data.inventoryP2 - data.inventoryP1) / data.inventoryP1) * 100)
                  : '-'}
              </td>
            </tr>

            {/* Cash & Equivalents */}
            <tr className="hover:bg-slate-50/80">
              <td className="py-2.5 px-4 text-slate-700 pl-6">
                Kas & Setara Kas (Cash Reserves)
              </td>
              <td className="py-2 px-4 text-right bg-amber-50/30">
                <input
                  type="number"
                  step="any"
                  value={data.cashEquivalentsP2 ?? ''}
                  onChange={(e) => updateField('cashEquivalentsP2', e.target.value)}
                  className="w-28 text-right px-2 py-1 bg-white rounded border border-slate-200"
                  placeholder="0"
                />
              </td>
              <td className="py-2 px-4 text-right">
                <input
                  type="number"
                  step="any"
                  value={data.cashEquivalentsP1 ?? ''}
                  onChange={(e) => updateField('cashEquivalentsP1', e.target.value)}
                  className="w-28 text-right px-2 py-1 bg-white rounded border border-slate-200"
                  placeholder="0"
                />
              </td>
              <td className="py-2.5 px-4 text-right text-slate-500">
                {data.cashEquivalentsP1 && data.cashEquivalentsP2
                  ? formatPercent(((data.cashEquivalentsP2 - data.cashEquivalentsP1) / data.cashEquivalentsP1) * 100)
                  : '-'}
              </td>
            </tr>

            {/* Total Debt */}
            <tr className="hover:bg-slate-50/80">
              <td className="py-2.5 px-4 text-slate-700 pl-6">
                Total Kewajiban Utang (Total Debt / Bank Facilities)
              </td>
              <td className="py-2 px-4 text-right bg-amber-50/30">
                <input
                  type="number"
                  step="any"
                  value={data.totalDebtP2 ?? ''}
                  onChange={(e) => updateField('totalDebtP2', e.target.value)}
                  className="w-28 text-right px-2 py-1 bg-white rounded border border-slate-200"
                  placeholder="0"
                />
              </td>
              <td className="py-2 px-4 text-right">
                <input
                  type="number"
                  step="any"
                  value={data.totalDebtP1 ?? ''}
                  onChange={(e) => updateField('totalDebtP1', e.target.value)}
                  className="w-28 text-right px-2 py-1 bg-white rounded border border-slate-200"
                  placeholder="0"
                />
              </td>
              <td className="py-2.5 px-4 text-right text-slate-500">
                {data.totalDebtP1 && data.totalDebtP2
                  ? formatPercent(((data.totalDebtP2 - data.totalDebtP1) / data.totalDebtP1) * 100)
                  : '-'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
