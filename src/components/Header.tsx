import React from 'react';
import { SAMPLE_STATEMENTS } from '../data/sampleStatements';
import { SampleStatement } from '../types';
import {
  FileText,
  ShieldAlert,
  TrendingUp,
  Sparkles,
  Building2,
  Layers,
  Sliders,
  Upload,
  CheckCircle2,
  Scale,
  PieChart,
  BarChart2,
  FileSpreadsheet,
  Activity,
} from 'lucide-react';

export type AppTab =
  | 'pnl'
  | 'balancesheet'
  | 'segments'
  | 'operational'
  | 'dashboard'
  | 'summary'
  | 'anomalies'
  | 'input';

interface HeaderProps {
  currentSampleId: string;
  onSelectSample: (sample: SampleStatement | null) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  onOpenImport: () => void;
}

export function Header({
  currentSampleId,
  onSelectSample,
  onAnalyze,
  isAnalyzing,
  activeTab,
  setActiveTab,
  onOpenImport,
}: HeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-3 gap-3">
          {/* Brand & Persona: CFA Desk */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
              <Building2 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  CFA Desk
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  Institutional Suite
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-1">
                Balance Sheet • Profit & Loss • Revenue Segment • Forensic Anomalies & Margins
              </p>
            </div>
          </div>

          {/* Quick Controls & Case Picker */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Case selector dropdown */}
            <div className="flex items-center bg-slate-50 rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-700">
              <span className="text-slate-400 mr-1.5 font-medium">Dataset:</span>
              <select
                className="bg-transparent font-medium text-slate-800 focus:outline-hidden cursor-pointer"
                value={currentSampleId}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'custom') {
                    onSelectSample(null);
                  } else {
                    const match = SAMPLE_STATEMENTS.find((s) => s.id === val);
                    if (match) onSelectSample(match);
                  }
                }}
              >
                {SAMPLE_STATEMENTS.map((sample) => (
                  <option key={sample.id} value={sample.id}>
                    {sample.companyName}
                  </option>
                ))}
                <option value="custom">✏️ Data Kustom / Manual</option>
              </select>
            </div>

            {/* Direct Import Excel/CSV Button */}
            <button
              type="button"
              onClick={onOpenImport}
              className="px-2.5 py-1 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5 text-slate-600" />
              <span>Import Excel/CSV</span>
            </button>

            {/* Run Analysis Button */}
            <button
              type="button"
              onClick={onAnalyze}
              disabled={isAnalyzing}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all flex items-center gap-1.5 shadow-xs ${
                isAnalyzing
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-slate-900 hover:bg-slate-800 active:scale-98'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Menganalisis...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Jalankan Analisis CFA Desk</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Primary CFA Navigation Tabs */}
        <div className="flex border-t border-slate-100 overflow-x-auto gap-1 py-1.5 scrollbar-none">
          {/* Tab 1: Profit & Loss */}
          <button
            type="button"
            onClick={() => setActiveTab('pnl')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'pnl'
                ? 'bg-slate-900 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Profit & Loss (Laba Rugi)</span>
          </button>

          {/* Tab 2: Balance Sheet */}
          <button
            type="button"
            onClick={() => setActiveTab('balancesheet')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'balancesheet'
                ? 'bg-slate-900 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Balance Sheet (Neraca)</span>
          </button>

          {/* Tab 3: Revenue Segment */}
          <button
            type="button"
            onClick={() => setActiveTab('segments')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'segments'
                ? 'bg-slate-900 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Revenue Segment</span>
          </button>

          {/* Tab 4: Operational Data */}
          <button
            type="button"
            onClick={() => setActiveTab('operational')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'operational'
                ? 'bg-slate-900 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>Operational Data</span>
          </button>

          {/* Tab 5: Dashboard & Waterfall */}
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'dashboard'
                ? 'bg-slate-900 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Dashboard & Waterfall</span>
          </button>

          {/* Tab 5: Executive Summary */}
          <button
            type="button"
            onClick={() => setActiveTab('summary')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'summary'
                ? 'bg-slate-900 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Ringkasan Eksekutif (3 Paragraf)</span>
          </button>

          {/* Tab 6: Anomalies & Recommendations */}
          <button
            type="button"
            onClick={() => setActiveTab('anomalies')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'anomalies'
                ? 'bg-slate-900 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
            <span>Anomali & Rekomendasi</span>
          </button>

          {/* Tab 7: Raw Data Input */}
          <button
            type="button"
            onClick={() => setActiveTab('input')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'input'
                ? 'bg-slate-900 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Input Data & Metrik</span>
          </button>
        </div>
      </div>
    </header>
  );
}
