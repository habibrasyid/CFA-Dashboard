import React, { useState, useMemo, useEffect } from 'react';
import {
  FinancialData,
  CFOAnalysisReport,
  SampleStatement,
  RevenueSegmentItem,
  BalanceSheetData,
} from './types';
import { SAMPLE_STATEMENTS } from './data/sampleStatements';
import { calculateMargins } from './utils/finance';
import { Header, AppTab } from './components/Header';
import { MarginOverviewCards } from './components/MarginOverviewCards';
import { ProfitAndLossView } from './components/ProfitAndLossView';
import { BalanceSheetView } from './components/BalanceSheetView';
import { RevenueSegmentView } from './components/RevenueSegmentView';
import { OperationalDataView } from './components/OperationalDataView';
import { FinancialDashboardView } from './components/FinancialDashboardView';
import { FinancialDataTable } from './components/FinancialDataTable';
import { ExecutiveSummaryView } from './components/ExecutiveSummaryView';
import { AnomalyDetectorView } from './components/AnomalyDetectorView';
import { RecommendationsView } from './components/RecommendationsView';
import { CfoChatModal } from './components/CfoChatModal';
import { CsvImportModal } from './components/CsvImportModal';
import {
  UNTR_OPERATIONAL_FY2024_VS_2023,
  getUntrOperationalDataForPeriodPair,
} from './data/untrOperationalData';
import { OperationalData } from './types';
import {
  Sparkles,
  ArrowRight,
  MessageSquare,
  FileCheck,
  Upload,
} from 'lucide-react';

export default function App() {
  const initialSample = SAMPLE_STATEMENTS[0];

  const [currentSampleId, setCurrentSampleId] = useState<string>(initialSample.id);
  const [companyName, setCompanyName] = useState<string>(initialSample.companyName);
  const [period1Label, setPeriod1Label] = useState<string>(initialSample.period1Label);
  const [period2Label, setPeriod2Label] = useState<string>(initialSample.period2Label);
  const [currency, setCurrency] = useState<string>(initialSample.currency);
  const [unit, setUnit] = useState<string>(initialSample.unit);
  const [financialData, setFinancialData] = useState<FinancialData>(initialSample.data);
  const [additionalContext, setAdditionalContext] = useState<string>(initialSample.contextNote);

  // New state for Revenue Segments and Balance Sheet
  const [revenueSegments, setRevenueSegments] = useState<RevenueSegmentItem[]>(
    initialSample.revenueSegments || []
  );
  const [balanceSheetData, setBalanceSheetData] = useState<BalanceSheetData | undefined>(
    initialSample.balanceSheet
  );
  const [operationalData, setOperationalData] = useState<OperationalData>(
    initialSample.operationalData || UNTR_OPERATIONAL_FY2024_VS_2023
  );

  // Default active tab: Revenue Segment as requested for UNTR dataset
  const [activeTab, setActiveTab] = useState<AppTab>('segments');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [cfoReport, setCfoReport] = useState<CFOAnalysisReport | null>(null);

  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatPrompt, setChatPrompt] = useState<string>('');
  const [isCsvModalOpen, setIsCsvModalOpen] = useState<boolean>(false);

  // Dynamically calculate margins
  const margins = useMemo(() => calculateMargins(financialData), [financialData]);

  // Handle switching sample case
  const handleSelectSample = (sample: SampleStatement | null) => {
    if (sample) {
      setCurrentSampleId(sample.id);
      setCompanyName(sample.companyName);
      setPeriod1Label(sample.period1Label);
      setPeriod2Label(sample.period2Label);
      setCurrency(sample.currency);
      setUnit(sample.unit);
      setFinancialData(sample.data);
      setAdditionalContext(sample.contextNote);
      setRevenueSegments(sample.revenueSegments || []);
      setBalanceSheetData(sample.balanceSheet);
      if (sample.operationalData) {
        setOperationalData(sample.operationalData);
      }
    } else {
      setCurrentSampleId('custom');
    }
  };

  const [syncWithDashboard, setSyncWithDashboard] = useState<boolean>(true);

  const handleApplyPeriodComparison = (
    p1: string,
    p2: string,
    newData?: FinancialData,
    newSegments?: RevenueSegmentItem[],
    newBs?: BalanceSheetData
  ) => {
    setPeriod1Label(p1);
    setPeriod2Label(p2);
    if (syncWithDashboard) {
      if (newData) setFinancialData(newData);
      if (newSegments) setRevenueSegments(newSegments);
      if (newBs) setBalanceSheetData(newBs);
      const newOp = getUntrOperationalDataForPeriodPair(p1, p2);
      setOperationalData(newOp);
    }
  };

  // Run CFO Analysis API
  const runCfoAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/cfo/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          period1Label,
          period2Label,
          currency,
          unit,
          metrics: financialData,
          calculatedMargins: margins,
          additionalContext,
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal menghasilkan analisis CFA Desk dari server.');
      }

      const report: CFOAnalysisReport = await response.json();
      setCfoReport(report);
    } catch (err) {
      console.error('Analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Initial trigger so the user lands with an active analysis report
  useEffect(() => {
    runCfoAnalysis();
  }, []);

  const openChatWithPrompt = (prompt?: string) => {
    setChatPrompt(prompt || '');
    setIsChatOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans antialiased selection:bg-amber-100 selection:text-amber-900">
      {/* Top App Header with CFA Desk Branding */}
      <Header
        currentSampleId={currentSampleId}
        onSelectSample={handleSelectSample}
        onAnalyze={runCfoAnalysis}
        isAnalyzing={isAnalyzing}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenImport={() => setIsCsvModalOpen(true)}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
        {/* Margin Overview Quick Stats (Always Visible at Top) */}
        <MarginOverviewCards
          margins={margins}
          period1Label={period1Label}
          period2Label={period2Label}
        />

        {/* Tab 1: Profit and Loss (Laba Rugi) */}
        {activeTab === 'pnl' && (
          <ProfitAndLossView
            data={financialData}
            margins={margins}
            period1Label={period1Label}
            period2Label={period2Label}
            currency={currency}
            unit={unit}
            companyName={companyName}
            syncWithDashboard={syncWithDashboard}
            onToggleSync={setSyncWithDashboard}
            onApplyPeriodComparison={handleApplyPeriodComparison}
          />
        )}

        {/* Tab 2: Balance Sheet (Neraca) */}
        {activeTab === 'balancesheet' && (
          <BalanceSheetView
            data={financialData}
            balanceSheet={balanceSheetData}
            period1Label={period1Label}
            period2Label={period2Label}
            currency={currency}
            unit={unit}
            companyName={companyName}
            syncWithDashboard={syncWithDashboard}
            onToggleSync={setSyncWithDashboard}
            onApplyPeriodComparison={handleApplyPeriodComparison}
          />
        )}

        {/* Tab 3: Revenue Segment (Segmentasi Pendapatan) */}
        {activeTab === 'segments' && (
          <RevenueSegmentView
            segments={revenueSegments}
            onChangeSegments={setRevenueSegments}
            totalRevenueP1={financialData.revenueP1}
            totalRevenueP2={financialData.revenueP2}
            period1Label={period1Label}
            period2Label={period2Label}
            currency={currency}
            unit={unit}
            companyName={companyName}
            onUpdatePeriodLabels={(p1, p2) => {
              setPeriod1Label(p1);
              setPeriod2Label(p2);
            }}
            onUpdateTotalRevenue={(p1, p2) => {
              setFinancialData((prev) => ({
                ...prev,
                revenueP1: p1,
                revenueP2: p2,
              }));
            }}
            onApplyPeriodComparison={handleApplyPeriodComparison}
          />
        )}

        {/* Tab 4: Operational Data (Data Operasional) */}
        {activeTab === 'operational' && (
          <OperationalDataView
            operationalData={operationalData}
            onChangeOperationalData={setOperationalData}
            period1Label={period1Label}
            period2Label={period2Label}
            companyName={companyName}
            syncWithDashboard={syncWithDashboard}
            onToggleSync={setSyncWithDashboard}
            onApplyPeriodComparison={handleApplyPeriodComparison}
          />
        )}

        {/* Tab 5: Dashboard Eksekutif & Waterfall Bridge */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <FinancialDashboardView
              data={financialData}
              margins={margins}
              report={cfoReport}
              period1Label={period1Label}
              period2Label={period2Label}
              currency={currency}
              unit={unit}
            />

            {/* Quick Navigation Footer */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-slate-600 font-medium">
                Pindah ke laporan spesifik atau baca ringkasan opini eksekutif:
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('pnl')}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold transition-colors"
                >
                  Buka Profit & Loss →
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('balancesheet')}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold transition-colors"
                >
                  Buka Balance Sheet →
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('summary')}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors"
                >
                  Buka Ringkasan 3 Paragraf →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Ringkasan Eksekutif CFO (Maksimal 3 Paragraf) */}
        {activeTab === 'summary' && (
          <div className="space-y-6">
            {cfoReport ? (
              <ExecutiveSummaryView
                report={cfoReport}
                onAskCfo={openChatWithPrompt}
              />
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-500">
                  <FileCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Ringkasan CFO Sedang Diproses...
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
                  Klik tombol di bawah untuk menjalankan diagnosis keuangan komparatif, deteksi anomali, dan kalkulasi margin.
                </p>
                <button
                  type="button"
                  onClick={runCfoAnalysis}
                  disabled={isAnalyzing}
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Jalankan Analisis CFA Desk Sekarang</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 6: Deteksi Anomali Finansial & Rekomendasi Tindakan */}
        {activeTab === 'anomalies' && (
          <div className="space-y-6">
            {cfoReport ? (
              <>
                <AnomalyDetectorView
                  anomalies={cfoReport.anomalies}
                  companyName={cfoReport.companyName}
                />
                <RecommendationsView
                  recommendations={cfoReport.recommendations}
                  companyName={cfoReport.companyName}
                />
              </>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <p className="text-xs text-slate-500">Belum ada laporan analisis aktif.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 7: Financial Data & Workspace Input */}
        {activeTab === 'input' && (
          <div className="space-y-6">
            <FinancialDataTable
              data={financialData}
              onChange={setFinancialData}
              margins={margins}
              companyName={companyName}
              setCompanyName={setCompanyName}
              period1Label={period1Label}
              setPeriod1Label={setPeriod1Label}
              period2Label={period2Label}
              setPeriod2Label={setPeriod2Label}
              currency={currency}
              unit={unit}
              onOpenCsvModal={() => setIsCsvModalOpen(true)}
              onResetToSample={() => {
                const s =
                  SAMPLE_STATEMENTS.find((x) => x.id === currentSampleId) ||
                  SAMPLE_STATEMENTS[0];
                handleSelectSample(s);
              }}
            />

            {/* Additional Management Context & Action Bar */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Catatan Konteks Manajemen / Informasi Lapangan (Opsional)
                </label>
                <input
                  type="text"
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  placeholder="Misal: Perusahaan sedang ekspansi pasar agresif, ada kenaikan tarif vendor impor, dsb."
                  className="w-full text-xs px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-slate-900 text-slate-800"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCsvModalOpen(true)}
                  className="px-3.5 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-2"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload File</span>
                </button>

                <button
                  type="button"
                  onClick={runCfoAnalysis}
                  disabled={isAnalyzing}
                  className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Menganalisis Forensik...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Perbarui Analisis CFA Desk</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating CFA / CFO Assistant Button */}
      {cfoReport && (
        <div className="fixed bottom-5 right-5 z-40">
          <button
            type="button"
            onClick={() => openChatWithPrompt()}
            className="px-4 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-xl hover:shadow-2xl transition-all border border-slate-700 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-amber-300" />
            <span>Tanya CFA Desk</span>
          </button>
        </div>
      )}

      {/* Modals */}
      {cfoReport && (
        <CfoChatModal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          report={cfoReport}
          initialPrompt={chatPrompt}
        />
      )}

      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onImport={(newData, p1, p2) => {
          setFinancialData(newData);
          if (p1) setPeriod1Label(p1);
          if (p2) setPeriod2Label(p2);
          setCurrentSampleId('custom');
          setActiveTab('pnl');
          setTimeout(runCfoAnalysis, 100);
        }}
        onImportSegments={(newSegments) => {
          setRevenueSegments(newSegments);
          setActiveTab('segments');
        }}
      />
    </div>
  );
}
