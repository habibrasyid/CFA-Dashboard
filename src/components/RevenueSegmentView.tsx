import React, { useState, useMemo } from 'react';
import { RevenueSegmentItem, FinancialData, BalanceSheetData } from '../types';
import { formatCurrency, formatPercent } from '../utils/finance';
import { exportUntrExcelFile } from '../utils/exportUntrExcel';
import { SAMPLE_STATEMENTS } from '../data/sampleStatements';
import {
  UNTR_PERIOD_PRESETS,
  SegmentPeriodPreset,
  INDIVIDUAL_PERIODS,
  getSegmentsForPeriodPair,
  getUntrFinancialDataForPeriodPair,
} from '../data/untrPeriods';
import {
  PieChart,
  TrendingUp,
  Layers,
  Plus,
  Trash2,
  AlertCircle,
  BarChart3,
  Percent,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Download,
  FileSpreadsheet,
  Building2,
  ArrowUpRight,
  ShieldCheck,
  Coins,
  Truck,
  Flame,
  Zap,
  HardHat,
  Pickaxe,
  Calendar,
  ArrowLeftRight,
  Clock,
  SlidersHorizontal,
  Check,
  ChevronDown,
} from 'lucide-react';

interface RevenueSegmentViewProps {
  segments: RevenueSegmentItem[];
  onChangeSegments: (segments: RevenueSegmentItem[]) => void;
  totalRevenueP1: number;
  totalRevenueP2: number;
  period1Label: string;
  period2Label: string;
  currency: string;
  unit: string;
  companyName: string;
  onUpdatePeriodLabels?: (p1: string, p2: string) => void;
  onUpdateTotalRevenue?: (p1: number, p2: number) => void;
  onApplyPeriodComparison?: (
    p1: string,
    p2: string,
    newData?: FinancialData,
    newSegments?: RevenueSegmentItem[],
    newBs?: BalanceSheetData
  ) => void;
}

export function RevenueSegmentView({
  segments,
  onChangeSegments,
  totalRevenueP1,
  totalRevenueP2,
  period1Label,
  period2Label,
  currency,
  unit,
  companyName,
  onUpdatePeriodLabels,
  onUpdateTotalRevenue,
  onApplyPeriodComparison,
}: RevenueSegmentViewProps) {
  // Active period preset & dropdown selections
  const [selectedPresetId, setSelectedPresetId] = useState<string>('fy-2024-vs-2023');
  const [selectedPriorPeriod, setSelectedPriorPeriod] = useState<string>(period1Label || 'FY 2023');
  const [selectedCurrentPeriod, setSelectedCurrentPeriod] = useState<string>(period2Label || 'FY 2024');

  // Custom text overrides if user wants free-form label
  const [isCustomPrior, setIsCustomPrior] = useState<boolean>(false);
  const [isCustomCurrent, setIsCustomCurrent] = useState<boolean>(false);
  const [customPriorText, setCustomPriorText] = useState<string>(period1Label || 'FY 2023');
  const [customCurrentText, setCustomCurrentText] = useState<string>(period2Label || 'FY 2024');

  const [isEditing, setIsEditing] = useState(false);
  const [syncWithDashboard, setSyncWithDashboard] = useState(true);
  const [showNote, setShowNote] = useState<boolean>(true);

  // Fallback / default segments
  const untrSample = SAMPLE_STATEMENTS.find((s) => s.id === 'case-untr');
  const currentSegments =
    segments && segments.length > 0
      ? segments
      : untrSample?.revenueSegments || UNTR_PERIOD_PRESETS[0].segments;

  // Active Preset Object if matched
  const activePreset = UNTR_PERIOD_PRESETS.find((p) => p.id === selectedPresetId);

  // Effective labels
  const activePriorLabel = isCustomPrior ? customPriorText : selectedPriorPeriod;
  const activeCurrentLabel = isCustomCurrent ? customCurrentText : selectedCurrentPeriod;

  // Calculations
  const sumSegRevP1 = currentSegments.reduce((acc, s) => acc + s.revenueP1, 0) || 1;
  const sumSegRevP2 = currentSegments.reduce((acc, s) => acc + s.revenueP2, 0) || 1;

  // Segment with largest contribution
  const sortedByP2 = [...currentSegments].sort((a, b) => b.revenueP2 - a.revenueP2);
  const topSegment = sortedByP2[0];
  const topShareP2 = topSegment ? (topSegment.revenueP2 / sumSegRevP2) * 100 : 0;

  // Find fast growing segment
  const fastestGrowthSegment = [...currentSegments]
    .filter((s) => s.revenueP1 > 0)
    .sort((a, b) => (b.revenueP2 - b.revenueP1) / b.revenueP1 - (a.revenueP2 - a.revenueP1) / a.revenueP1)[0];

  // 1. Handle selection from Preset Dropdown
  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    if (presetId === 'custom') {
      setIsCustomPrior(true);
      setIsCustomCurrent(true);
      return;
    }

    const preset = UNTR_PERIOD_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setIsCustomPrior(false);
    setIsCustomCurrent(false);
    setSelectedPriorPeriod(preset.period1Label);
    setSelectedCurrentPeriod(preset.period2Label);
    setCustomPriorText(preset.period1Label);
    setCustomCurrentText(preset.period2Label);
    onChangeSegments(preset.segments);

    if (syncWithDashboard && onUpdatePeriodLabels) {
      onUpdatePeriodLabels(preset.period1Label, preset.period2Label);
    }
    if (syncWithDashboard && onUpdateTotalRevenue) {
      onUpdateTotalRevenue(preset.totalRevenueP1, preset.totalRevenueP2);
    }
    if (syncWithDashboard && onApplyPeriodComparison) {
      const full = getUntrFinancialDataForPeriodPair(preset.period1Label, preset.period2Label);
      onApplyPeriodComparison(preset.period1Label, preset.period2Label, full.data, preset.segments, full.balanceSheet);
    }
  };

  // 2. Handle selection from Prior Period Dropdown
  const handlePriorPeriodDropdownChange = (val: string) => {
    if (val === 'custom') {
      setIsCustomPrior(true);
      setSelectedPresetId('custom');
      return;
    }

    setIsCustomPrior(false);
    setSelectedPriorPeriod(val);
    setCustomPriorText(val);

    // Check if (val, selectedCurrentPeriod) matches any preset
    const match = UNTR_PERIOD_PRESETS.find(
      (p) => p.period1Label === val && p.period2Label === selectedCurrentPeriod
    );

    if (match) {
      setSelectedPresetId(match.id);
      onChangeSegments(match.segments);
      if (syncWithDashboard && onUpdatePeriodLabels) onUpdatePeriodLabels(match.period1Label, match.period2Label);
      if (syncWithDashboard && onUpdateTotalRevenue) onUpdateTotalRevenue(match.totalRevenueP1, match.totalRevenueP2);
      if (syncWithDashboard && onApplyPeriodComparison) {
        const full = getUntrFinancialDataForPeriodPair(match.period1Label, match.period2Label);
        onApplyPeriodComparison(match.period1Label, match.period2Label, full.data, match.segments, full.balanceSheet);
      }
    } else {
      // Dynamic pair comparison
      setSelectedPresetId('custom');
      const pair = getSegmentsForPeriodPair(val, selectedCurrentPeriod);
      onChangeSegments(pair.segments);
      if (syncWithDashboard && onUpdatePeriodLabels) onUpdatePeriodLabels(val, selectedCurrentPeriod);
      if (syncWithDashboard && onUpdateTotalRevenue) onUpdateTotalRevenue(pair.totalRevenueP1, pair.totalRevenueP2);
      if (syncWithDashboard && onApplyPeriodComparison) {
        const full = getUntrFinancialDataForPeriodPair(val, selectedCurrentPeriod);
        onApplyPeriodComparison(val, selectedCurrentPeriod, full.data, pair.segments, full.balanceSheet);
      }
    }
  };

  // 3. Handle selection from Current Period Dropdown
  const handleCurrentPeriodDropdownChange = (val: string) => {
    if (val === 'custom') {
      setIsCustomCurrent(true);
      setSelectedPresetId('custom');
      return;
    }

    setIsCustomCurrent(false);
    setSelectedCurrentPeriod(val);
    setCustomCurrentText(val);

    // Check if (selectedPriorPeriod, val) matches any preset
    const match = UNTR_PERIOD_PRESETS.find(
      (p) => p.period1Label === selectedPriorPeriod && p.period2Label === val
    );

    if (match) {
      setSelectedPresetId(match.id);
      onChangeSegments(match.segments);
      if (syncWithDashboard && onUpdatePeriodLabels) onUpdatePeriodLabels(match.period1Label, match.period2Label);
      if (syncWithDashboard && onUpdateTotalRevenue) onUpdateTotalRevenue(match.totalRevenueP1, match.totalRevenueP2);
      if (syncWithDashboard && onApplyPeriodComparison) {
        const full = getUntrFinancialDataForPeriodPair(match.period1Label, match.period2Label);
        onApplyPeriodComparison(match.period1Label, match.period2Label, full.data, match.segments, full.balanceSheet);
      }
    } else {
      // Dynamic pair comparison
      setSelectedPresetId('custom');
      const pair = getSegmentsForPeriodPair(selectedPriorPeriod, val);
      onChangeSegments(pair.segments);
      if (syncWithDashboard && onUpdatePeriodLabels) onUpdatePeriodLabels(selectedPriorPeriod, val);
      if (syncWithDashboard && onUpdateTotalRevenue) onUpdateTotalRevenue(pair.totalRevenueP1, pair.totalRevenueP2);
      if (syncWithDashboard && onApplyPeriodComparison) {
        const full = getUntrFinancialDataForPeriodPair(selectedPriorPeriod, val);
        onApplyPeriodComparison(selectedPriorPeriod, val, full.data, pair.segments, full.balanceSheet);
      }
    }
  };

  // 4. Handle Swap Prior & Current
  const handleSwapPeriods = () => {
    const oldP1 = activePriorLabel;
    const oldP2 = activeCurrentLabel;

    // Check if swapped pair exists in presets
    const match = UNTR_PERIOD_PRESETS.find(
      (p) => p.period1Label === oldP2 && p.period2Label === oldP1
    );

    if (match) {
      setSelectedPresetId(match.id);
      setSelectedPriorPeriod(oldP2);
      setSelectedCurrentPeriod(oldP1);
      setCustomPriorText(oldP2);
      setCustomCurrentText(oldP1);
      onChangeSegments(match.segments);
      if (syncWithDashboard && onUpdatePeriodLabels) onUpdatePeriodLabels(oldP2, oldP1);
      if (syncWithDashboard && onUpdateTotalRevenue) onUpdateTotalRevenue(match.totalRevenueP1, match.totalRevenueP2);
      if (syncWithDashboard && onApplyPeriodComparison) {
        const full = getUntrFinancialDataForPeriodPair(oldP2, oldP1);
        onApplyPeriodComparison(oldP2, oldP1, full.data, match.segments, full.balanceSheet);
      }
    } else {
      const swapped = currentSegments.map((s) => ({
        ...s,
        revenueP1: s.revenueP2,
        revenueP2: s.revenueP1,
      }));
      onChangeSegments(swapped);

      setSelectedPriorPeriod(oldP2);
      setSelectedCurrentPeriod(oldP1);
      setCustomPriorText(oldP2);
      setCustomCurrentText(oldP1);
      setSelectedPresetId('custom');

      if (syncWithDashboard && onUpdatePeriodLabels) onUpdatePeriodLabels(oldP2, oldP1);
      if (syncWithDashboard && onUpdateTotalRevenue) onUpdateTotalRevenue(sumSegRevP2, sumSegRevP1);
      if (syncWithDashboard && onApplyPeriodComparison) {
        const full = getUntrFinancialDataForPeriodPair(oldP2, oldP1);
        onApplyPeriodComparison(oldP2, oldP1, full.data, swapped, full.balanceSheet);
      }
    }
  };

  // Handlers for modifying segments manually
  const handleUpdateSegment = (id: string, field: keyof RevenueSegmentItem, value: any) => {
    const updated = currentSegments.map((s) => (s.id === id ? { ...s, [field]: value } : s));
    onChangeSegments(updated);
    setSelectedPresetId('custom');
  };

  const handleAddSegment = () => {
    const newId = `seg-${Date.now()}`;
    const colors = ['#0284c7', '#eab308', '#475569', '#f59e0b', '#ec4899', '#10b981'];
    const newSeg: RevenueSegmentItem = {
      id: newId,
      name: `Lini Bisnis Baru ${currentSegments.length + 1}`,
      category: 'Unit Bisnis',
      revenueP1: 1000,
      revenueP2: 1500,
      grossMarginPctP2: 30,
      color: colors[currentSegments.length % colors.length],
      description: 'Deskripsi operasional segmen baru',
    };
    onChangeSegments([...currentSegments, newSeg]);
    setSelectedPresetId('custom');
  };

  const handleDeleteSegment = (id: string) => {
    if (currentSegments.length <= 1) return;
    onChangeSegments(currentSegments.filter((s) => s.id !== id));
    setSelectedPresetId('custom');
  };

  // Helper icon for segment category
  const getSegmentIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('kontraktor') || n.includes('pama')) return <Pickaxe className="w-4 h-4 text-sky-600" />;
    if (n.includes('mesin') || n.includes('komatsu') || n.includes('truck')) return <Truck className="w-4 h-4 text-amber-500" />;
    if (n.includes('batubara') || n.includes('coal')) return <Flame className="w-4 h-4 text-slate-700" />;
    if (n.includes('emas') || n.includes('gold') || n.includes('mineral')) return <Coins className="w-4 h-4 text-amber-500" />;
    if (n.includes('konstruksi') || n.includes('acset')) return <HardHat className="w-4 h-4 text-rose-500" />;
    if (n.includes('energi') || n.includes('plts') || n.includes('hydro')) return <Zap className="w-4 h-4 text-emerald-500" />;
    return <Layers className="w-4 h-4 text-blue-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner with Source Identification */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-slate-900 text-white uppercase tracking-wider flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
              Source: Data Financial UNTR
            </span>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
              Sheet: Segment - Revenue
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
              PT United Tractors Tbk
            </span>
          </div>

          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Laporan Segmentasi Pendapatan ({activePriorLabel} vs {activeCurrentLabel})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dekomposisi lini bisnis UNTR dengan opsi pemilihan periode komparatif yang fleksibel (Tahunan, Kuartalan, Semesteran, atau Kustom)
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={exportUntrExcelFile}
            className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            title="Download file Excel Data Financial UNTR.xlsx"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .xlsx</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const defaultPreset = UNTR_PERIOD_PRESETS[0];
              handleSelectPreset(defaultPreset.id);
              setIsEditing(false);
            }}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Kembali ke Periode Penuh FY 2024 vs FY 2023"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset ke FY 24/23</span>
          </button>

          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer ${
              isEditing
                ? 'bg-amber-600 text-white hover:bg-amber-700'
                : 'border border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Selesai Edit' : 'Edit Nilai Segmen'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE PERIOD SELECTOR (DROPDOWN-DRIVEN)                             */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <span>Pilihan Periode Laporan Segmen (Dropdown Selector)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                  Mode Dropdown
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Pilih paket perbandingan atau tentukan periode pembanding & berjalan melalui menu dropdown
              </p>
            </div>
          </div>

          {/* Sync toggle */}
          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={syncWithDashboard}
              onChange={(e) => setSyncWithDashboard(e.target.checked)}
              className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
            />
            <span className="font-medium">Sinkronkan label periode ke seluruh Dashboard</span>
          </label>
        </div>

        {/* 3 Dropdown Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          {/* 1. Preset Dropdown */}
          <div className="md:col-span-5 space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Paket Komparasi Periode (Preset)</span>
            </label>
            <div className="relative">
              <select
                value={selectedPresetId}
                onChange={(e) => handleSelectPreset(e.target.value)}
                className="w-full appearance-none bg-white border border-slate-300 hover:border-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 shadow-2xs transition-colors cursor-pointer pr-9"
              >
                <optgroup label="Tahunan (Annual / Full Year)">
                  <option value="fy-2024-vs-2023">FY 2024 vs FY 2023 (Tahunan Penuh)</option>
                  <option value="fy-2023-vs-2022">FY 2023 vs FY 2022 (Tahunan Puncak Siklus Batubara)</option>
                </optgroup>
                <optgroup label="Kuartalan (Quarterly / Interim)">
                  <option value="9m-2024-vs-2023">9M 2024 vs 9M 2023 (Kuartal 3 / 9 Bulan YTD)</option>
                  <option value="q1-2024-vs-2023">Q1 2024 vs Q1 2023 (Kuartal 1 / Tiga Bulan Pertama)</option>
                </optgroup>
                <optgroup label="Semesteran (Semi-Annual / 1H)">
                  <option value="1h-2024-vs-2023">1H 2024 vs 1H 2023 (Semester 1 / 6 Bulan)</option>
                </optgroup>
                <optgroup label="Kombinasi Mandiri">
                  <option value="custom">⚙️ Kustom / Kombinasi Bebas</option>
                </optgroup>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* 2. Current Period Dropdown (Periode Berjalan - KIRI) */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              Periode Berjalan (Current)
            </label>
            <div className="relative">
              <select
                value={isCustomCurrent ? 'custom' : selectedCurrentPeriod}
                onChange={(e) => handleCurrentPeriodDropdownChange(e.target.value)}
                className="w-full appearance-none bg-white border border-slate-300 hover:border-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 shadow-2xs transition-colors cursor-pointer pr-9"
              >
                <optgroup label="Tahunan">
                  <option value="FY 2024">FY 2024</option>
                  <option value="FY 2023">FY 2023</option>
                  <option value="FY 2022">FY 2022</option>
                </optgroup>
                <optgroup label="Kuartalan">
                  <option value="9M 2024">9M 2024 (9 Bulan)</option>
                  <option value="Q1 2024">Q1 2024 (3 Bulan)</option>
                  <option value="9M 2023">9M 2023</option>
                  <option value="Q1 2023">Q1 2023</option>
                </optgroup>
                <optgroup label="Semesteran">
                  <option value="1H 2024">1H 2024 (6 Bulan)</option>
                  <option value="1H 2023">1H 2023</option>
                </optgroup>
                <optgroup label="Manual">
                  <option value="custom">Tulis Label Kustom...</option>
                </optgroup>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            {isCustomCurrent && (
              <input
                type="text"
                value={customCurrentText}
                onChange={(e) => {
                  setCustomCurrentText(e.target.value);
                  if (syncWithDashboard && onUpdatePeriodLabels) {
                    onUpdatePeriodLabels(activePriorLabel, e.target.value);
                  }
                }}
                className="mt-1 w-full px-2.5 py-1.5 text-xs font-bold text-slate-900 bg-amber-50/50 border border-amber-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                placeholder="Ketik nama periode..."
              />
            )}
          </div>

          {/* Swap Button */}
          <div className="md:col-span-1 flex justify-center pb-1">
            <button
              type="button"
              onClick={handleSwapPeriods}
              className="p-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 transition-colors shadow-2xs cursor-pointer flex items-center justify-center w-full md:w-auto"
              title="Tukar Periode Berjalan & Pembanding (Swap)"
            >
              <ArrowLeftRight className="w-4 h-4 text-slate-700" />
            </button>
          </div>

          {/* 3. Prior Period Dropdown (Periode Pembanding - KANAN) */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              Periode Pembanding (Prior)
            </label>
            <div className="relative">
              <select
                value={isCustomPrior ? 'custom' : selectedPriorPeriod}
                onChange={(e) => handlePriorPeriodDropdownChange(e.target.value)}
                className="w-full appearance-none bg-white border border-slate-300 hover:border-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 shadow-2xs transition-colors cursor-pointer pr-9"
              >
                <optgroup label="Tahunan">
                  <option value="FY 2023">FY 2023</option>
                  <option value="FY 2022">FY 2022</option>
                  <option value="FY 2024">FY 2024</option>
                </optgroup>
                <optgroup label="Kuartalan">
                  <option value="9M 2023">9M 2023 (9 Bulan)</option>
                  <option value="Q1 2023">Q1 2023 (3 Bulan)</option>
                  <option value="9M 2024">9M 2024</option>
                  <option value="Q1 2024">Q1 2024</option>
                </optgroup>
                <optgroup label="Semesteran">
                  <option value="1H 2023">1H 2023 (6 Bulan)</option>
                  <option value="1H 2024">1H 2024</option>
                </optgroup>
                <optgroup label="Manual">
                  <option value="custom">Tulis Label Kustom...</option>
                </optgroup>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            {isCustomPrior && (
              <input
                type="text"
                value={customPriorText}
                onChange={(e) => {
                  setCustomPriorText(e.target.value);
                  if (syncWithDashboard && onUpdatePeriodLabels) {
                    onUpdatePeriodLabels(e.target.value, activeCurrentLabel);
                  }
                }}
                className="mt-1 w-full px-2.5 py-1.5 text-xs font-bold text-slate-900 bg-amber-50/50 border border-amber-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                placeholder="Ketik nama periode..."
              />
            )}
          </div>
        </div>

        {/* Dynamic Context & Comparison Status Banner */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide bg-blue-100 text-blue-800 border border-blue-200">
              {activePreset ? activePreset.category.toUpperCase() : 'KOMPARASI KUSTOM'}
            </span>
            <span className="text-xs font-bold text-slate-900 font-mono">
              {activeCurrentLabel} (Current) vs {activePriorLabel} (Prior)
            </span>
            <span
              className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                sumSegRevP2 >= sumSegRevP1 ? 'bg-emerald-100 text-emerald-800' : 'text-rose-700 bg-rose-100'
              }`}
            >
              {(((sumSegRevP2 - sumSegRevP1) / (sumSegRevP1 || 1)) * 100) >= 0 ? '+' : ''}
              {(((sumSegRevP2 - sumSegRevP1) / (sumSegRevP1 || 1)) * 100).toFixed(1)}% YoY
            </span>
            <span className="text-xs text-slate-500 font-mono">
              ({formatCurrency(sumSegRevP1, currency, unit)} vs {formatCurrency(sumSegRevP2, currency, unit)})
            </span>
          </div>

          <div className="flex items-center gap-4 flex-wrap justify-end">
            <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showNote}
                onChange={(e) => setShowNote(e.target.checked)}
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-3.5 h-3.5"
              />
              <span>Tampilkan Catatan</span>
            </label>

            {showNote && (
              <div className="text-xs text-slate-600 max-w-lg text-left md:text-right">
                <p className="text-[11px] text-slate-600 line-clamp-2">
                  {activePreset
                    ? activePreset.note
                    : 'Perbandingan antar-periode kustom aktif. Data segmen disesuaikan secara otomatis berdasarkan basis pelaporan UNTR.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Overview Cards for Current vs Prior Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Segment Revenue */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4">
          <span className="text-[11px] font-semibold text-slate-400 block uppercase">
            Total Revenue Segmen ({activeCurrentLabel})
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-extrabold text-slate-950 font-mono">
              {formatCurrency(sumSegRevP2, currency, unit)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-700">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>
              {(((sumSegRevP2 - sumSegRevP1) / sumSegRevP1) * 100) >= 0 ? '+' : ''}
              {(((sumSegRevP2 - sumSegRevP1) / sumSegRevP1) * 100).toFixed(1)}% YoY Growth
            </span>
            <span className="text-slate-400 text-[11px] font-normal">
              (vs {formatCurrency(sumSegRevP1, currency, unit)})
            </span>
          </div>
        </div>

        {/* Core Anchor Segment */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4">
          <span className="text-[11px] font-semibold text-slate-400 block uppercase">
            Penyumbang Terbesar ({activeCurrentLabel})
          </span>
          <div className="mt-1">
            <span className="text-sm font-bold text-slate-900 block truncate" title={topSegment?.name}>
              {topSegment?.name || 'Kontraktor Penambangan'}
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg font-bold text-sky-800 font-mono">
                {topShareP2.toFixed(1)}%
              </span>
              <span className="text-xs text-slate-500 font-mono">
                ({formatCurrency(topSegment?.revenueP2 || 0, currency, unit)})
              </span>
            </div>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1 line-clamp-1">
            {topSegment?.category} • Kontrak jangka panjang
          </span>
        </div>

        {/* Highest Growth Segment */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4">
          <span className="text-[11px] font-semibold text-slate-400 block uppercase">
            Pertumbuhan Tertinggi ({activePriorLabel} $\rightarrow$ {activeCurrentLabel})
          </span>
          <div className="mt-1">
            <span className="text-sm font-bold text-slate-900 block truncate">
              {fastestGrowthSegment?.name || 'Pertambangan Emas'}
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg font-bold text-amber-600 font-mono">
                {(
                  ((fastestGrowthSegment.revenueP2 - fastestGrowthSegment.revenueP1) /
                    (fastestGrowthSegment.revenueP1 || 1)) *
                  100
                ) >= 0 ? '+' : ''}
                {(
                  ((fastestGrowthSegment.revenueP2 - fastestGrowthSegment.revenueP1) /
                    (fastestGrowthSegment.revenueP1 || 1)) *
                  100
                ).toFixed(1)}
                %
              </span>
              <span className="text-xs text-slate-500 font-mono">
                ({formatCurrency(fastestGrowthSegment.revenueP2, currency, unit)})
              </span>
            </div>
          </div>
          <span className="text-[11px] text-emerald-700 font-medium block mt-1">
            {fastestGrowthSegment?.category || 'Driver Portofolio'}
          </span>
        </div>

        {/* Strategic Diversification Status */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4">
          <span className="text-[11px] font-semibold text-slate-400 block uppercase">
            Profil Bauran & Diversifikasi
          </span>
          <div className="mt-1">
            <span className="text-sm font-bold text-emerald-900 block">
              Multi-Sektor Konglomerasi
            </span>
            <span className="text-xs text-slate-600 mt-0.5 block">
              6 Lini Operasi Terkonsolidasi
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Hedge alami siklus batubara via emas & jasa</span>
          </div>
        </div>
      </div>

      {/* Visual Revenue Mix Bridge / Distribution Bars */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight">
              Bauran Pendapatan ({activeCurrentLabel} vs {activePriorLabel})
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">File:</span>
            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
              Data Financial UNTR.xlsx [Sheet: Segment - Revenue]
            </span>
          </div>
        </div>

        {/* Visual Stacked Bar Comparison */}
        <div className="space-y-4">
          {/* Period 2 Stacked Bar */}
          <div>
            <div className="flex justify-between text-xs text-slate-700 mb-1.5 font-medium">
              <span className="font-bold">Bauran Pendapatan {activeCurrentLabel} (Total: {formatCurrency(sumSegRevP2, currency, unit)})</span>
              <span className="font-mono text-slate-900 font-black">100.0%</span>
            </div>
            <div className="w-full h-8 rounded-xl overflow-hidden flex shadow-2xs border border-slate-200/80">
              {currentSegments.map((seg) => {
                const pct = (seg.revenueP2 / sumSegRevP2) * 100;
                return (
                  <div
                    key={seg.id}
                    style={{ width: `${pct}%`, backgroundColor: seg.color || '#3b82f6' }}
                    className="h-full flex items-center justify-center text-white text-[11px] font-bold overflow-hidden px-1 truncate transition-all duration-300 hover:opacity-90 cursor-pointer"
                    title={`${seg.name}: ${pct.toFixed(1)}% (${formatCurrency(seg.revenueP2, currency, unit)})`}
                  >
                    {pct >= 14 ? `${seg.name.split('(')[0]} (${pct.toFixed(0)}%)` : pct >= 6 ? `${pct.toFixed(0)}%` : ''}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Period 1 Stacked Bar */}
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1.5 font-medium">
              <span>Bauran Pendapatan {activePriorLabel} (Total: {formatCurrency(sumSegRevP1, currency, unit)})</span>
              <span className="font-mono text-slate-600 font-semibold">100.0%</span>
            </div>
            <div className="w-full h-6 rounded-lg overflow-hidden flex bg-slate-100 opacity-85 border border-slate-200/50">
              {currentSegments.map((seg) => {
                const pct = (seg.revenueP1 / sumSegRevP1) * 100;
                return (
                  <div
                    key={seg.id}
                    style={{ width: `${pct}%`, backgroundColor: seg.color || '#3b82f6' }}
                    className="h-full flex items-center justify-center text-white text-[10px] font-medium overflow-hidden px-1 truncate"
                    title={`${seg.name} (${activePriorLabel}): ${pct.toFixed(1)}%`}
                  >
                    {pct >= 15 ? `${pct.toFixed(0)}%` : ''}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {currentSegments.map((seg) => {
            const share = (seg.revenueP2 / sumSegRevP2) * 100;
            return (
              <div
                key={seg.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs"
              >
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: seg.color || '#3b82f6' }}
                />
                <div className="min-w-0">
                  <span className="font-bold text-slate-800 block truncate text-[11px]" title={seg.name}>
                    {seg.name.split('(')[0]}
                  </span>
                  <span className="text-slate-500 font-mono text-[10px]">
                    {share.toFixed(1)}% • {formatCurrency(seg.revenueP2, currency, unit)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Forensic CFO Insight Box on UNTR Segments */}
      <div className="p-4 sm:p-5 rounded-xl bg-linear-to-r from-slate-900 to-slate-800 text-white shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
            Analisis CFA & CFO: Dinamika Portofolio Segmen UNTR ({activePriorLabel} vs {activeCurrentLabel})
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300 leading-relaxed">
          <div className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-1">
            <strong className="text-white block font-semibold text-xs">
              1. Pertumbuhan Kontraktor Tambang (PAMA)
            </strong>
            <p className="text-[11px] text-slate-300">
              Segmen Kontraktor Penambangan mencatat pertumbuhan konsisten berkat peningkatan volume produksi batubara klien dan efisiensi armada pemindahan tanah.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-1">
            <strong className="text-white block font-semibold text-xs">
              2. Dampak Siklus Komoditas Batubara
            </strong>
            <p className="text-[11px] text-slate-300">
              Pendapatan batubara Turangga berfluktuasi mengikuti indeks harga global batubara termal (Newcastle) dan metalurgi, menuntut pengendalian biaya operasional kas yang ketat.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-1">
            <strong className="text-white block font-semibold text-xs">
              3. Kontribusi Margin Tinggi Emas (Martabe & SJR)
            </strong>
            <p className="text-[11px] text-slate-300">
              Segmen Emas memberikan kontribusi margin kotor superior (&gt;50%) yang menstabilkan marjin laba kotor konsolidasian saat lini batubara mengalami normalisasi.
            </p>
          </div>
        </div>
      </div>

      {/* Segments Detailed Table from Sheet: Segment - Revenue */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <span>Data Tabel Segmen ({activeCurrentLabel} vs {activePriorLabel})</span>
              <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                Sheet: Segment - Revenue
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Perbandingan metrik finansial, bauran, margin kotor, dan operasional per segmen usaha
            </p>
          </div>

          {isEditing && (
            <button
              type="button"
              onClick={handleAddSegment}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Baris Segmen</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4 sm:px-6">
                  <span>Lini Bisnis / Segmen Usaha</span>
                  <span className="block text-[10px] text-slate-400 font-normal font-sans mt-0.5">(Dalam Miliar Rupiah)</span>
                </th>
                <th className="py-3 px-3">Entitas / Merek Utama</th>
                <th className="py-3 px-3 text-right">
                  {activeCurrentLabel}
                  <span className="block text-[10px] text-slate-300 font-normal font-sans">
                    (Current)
                  </span>
                </th>
                <th className="py-3 px-3 text-right">
                  {activePriorLabel}
                  <span className="block text-[10px] text-slate-400 font-normal font-sans">
                    (Prior)
                  </span>
                </th>
                <th className="py-3 px-3 text-right">YoY (%)</th>
                <th className="py-3 px-3 text-right">Bauran (%)</th>
                <th className="py-3 px-3 text-right">Gross Margin</th>
                {showNote && <th className="py-3 px-4 sm:px-6">Deskripsi & Catatan Volume Operasional</th>}
                {isEditing && <th className="py-3 px-3 text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentSegments.map((seg) => {
                const growth =
                  seg.revenueP1 > 0
                    ? ((seg.revenueP2 - seg.revenueP1) / seg.revenueP1) * 100
                    : 0;
                const shareP2 = (seg.revenueP2 / sumSegRevP2) * 100;

                return (
                  <tr key={seg.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Name & Icon */}
                    <td className="py-3 px-4 sm:px-6">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded bg-slate-100 shrink-0">
                          {getSegmentIcon(seg.name)}
                        </div>
                        {isEditing ? (
                          <input
                            type="text"
                            value={seg.name}
                            onChange={(e) => handleUpdateSegment(seg.id, 'name', e.target.value)}
                            className="text-xs px-2 py-1 border border-slate-300 rounded bg-white w-48 font-semibold"
                          />
                        ) : (
                          <div>
                            <span className="font-bold text-slate-900 block">{seg.name}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3 text-slate-600">
                      {isEditing ? (
                        <input
                          type="text"
                          value={seg.category || ''}
                          onChange={(e) => handleUpdateSegment(seg.id, 'category', e.target.value)}
                          className="text-xs px-2 py-1 border border-slate-300 rounded bg-white w-28"
                        />
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium whitespace-nowrap">
                          {seg.category || 'General'}
                        </span>
                      )}
                    </td>

                    {/* Current Period Revenue */}
                    <td className="py-3 px-3 text-right font-mono">
                      {isEditing ? (
                        <input
                          type="number"
                          value={seg.revenueP2}
                          onChange={(e) =>
                            handleUpdateSegment(seg.id, 'revenueP2', parseFloat(e.target.value) || 0)
                          }
                          className="text-xs px-2 py-1 border border-slate-300 rounded bg-white w-24 text-right font-mono font-bold"
                        />
                      ) : (
                        <span className="font-bold text-slate-900">
                          {formatCurrency(seg.revenueP2, currency, unit)}
                        </span>
                      )}
                    </td>

                    {/* Prior Period Revenue */}
                    <td className="py-3 px-3 text-right font-mono">
                      {isEditing ? (
                        <input
                          type="number"
                          value={seg.revenueP1}
                          onChange={(e) =>
                            handleUpdateSegment(seg.id, 'revenueP1', parseFloat(e.target.value) || 0)
                          }
                          className="text-xs px-2 py-1 border border-slate-300 rounded bg-white w-24 text-right font-mono"
                        />
                      ) : (
                        <span className="text-slate-700">
                          {formatCurrency(seg.revenueP1, currency, unit)}
                        </span>
                      )}
                    </td>

                    {/* Growth */}
                    <td className="py-3 px-3 text-right font-mono">
                      <span
                        className={`font-bold ${
                          growth >= 0 ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {formatPercent(growth)}
                      </span>
                    </td>

                    {/* Share */}
                    <td className="py-3 px-3 text-right font-mono">
                      <span className="font-semibold text-slate-800">
                        {shareP2.toFixed(1)}%
                      </span>
                    </td>

                    {/* Gross Margin */}
                    <td className="py-3 px-3 text-right font-mono">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <input
                            type="number"
                            value={seg.grossMarginPctP2 ?? 25}
                            onChange={(e) =>
                              handleUpdateSegment(
                                seg.id,
                                'grossMarginPctP2',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="text-xs px-2 py-1 border border-slate-300 rounded bg-white w-16 text-right font-mono"
                          />
                          <span>%</span>
                        </div>
                      ) : (
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            (seg.grossMarginPctP2 ?? 0) >= 40
                              ? 'bg-amber-100 text-amber-900'
                              : (seg.grossMarginPctP2 ?? 0) >= 20
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {(seg.grossMarginPctP2 ?? 0).toFixed(1)}%
                        </span>
                      )}
                    </td>

                    {/* Description */}
                    {showNote && (
                      <td className="py-3 px-4 sm:px-6 text-slate-600 text-[11px] max-w-xs">
                        {isEditing ? (
                          <input
                            type="text"
                            value={seg.description || ''}
                            onChange={(e) => handleUpdateSegment(seg.id, 'description', e.target.value)}
                            className="text-xs px-2 py-1 border border-slate-300 rounded bg-white w-full"
                          />
                        ) : (
                          <span>{seg.description || '-'}</span>
                        )}
                      </td>
                    )}

                    {/* Actions if editing */}
                    {isEditing && (
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteSegment(seg.id)}
                          disabled={currentSegments.length <= 1}
                          className="p-1 rounded text-rose-500 hover:bg-rose-50 disabled:opacity-30 cursor-pointer"
                          title="Hapus segmen"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}

              {/* Total Row */}
              <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                <td colSpan={2} className="py-3 px-4 sm:px-6 uppercase text-slate-900 text-xs">
                  TOTAL PENDAPATAN BERSIH SEGMEN KONSOLIDASI (UNTR)
                </td>
                <td className="py-3 px-3 text-right font-mono text-slate-950 font-black">
                  {formatCurrency(sumSegRevP2, currency, unit)}
                </td>
                <td className="py-3 px-3 text-right font-mono text-slate-800">
                  {formatCurrency(sumSegRevP1, currency, unit)}
                </td>
                <td className="py-3 px-3 text-right font-mono text-slate-900">
                  {formatPercent(((sumSegRevP2 - sumSegRevP1) / sumSegRevP1) * 100)}
                </td>
                <td className="py-3 px-3 text-right font-mono text-slate-900">100.0%</td>
                <td className="py-3 px-3 text-right font-mono text-slate-700">~25.2%</td>
                <td className="py-3 px-4 sm:px-6 text-[11px] text-slate-500 italic">
                  Perbandingan {activePriorLabel} vs {activeCurrentLabel}
                </td>
                {isEditing && <td></td>}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
