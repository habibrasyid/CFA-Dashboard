import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, ArrowLeftRight, Sparkles } from 'lucide-react';
import {
  UNTR_PERIOD_PRESETS,
  INDIVIDUAL_PERIODS,
  findUntrPeriod,
  getUntrFinancialDataForPeriodPair,
} from '../data/untrPeriods';
import { FinancialData, BalanceSheetData, RevenueSegmentItem } from '../types';

interface PeriodComparisonDropdownBarProps {
  title: string;
  subtitle?: string;
  period1Label: string;
  period2Label: string;
  syncWithDashboard: boolean;
  onToggleSync: (checked: boolean) => void;
  onApplyComparison: (
    p1: string,
    p2: string,
    data?: FinancialData,
    segments?: RevenueSegmentItem[],
    bs?: BalanceSheetData
  ) => void;
  badgeContent?: {
    tag: string;
    mainText: string;
    subText?: string;
    isPositive?: boolean;
    note?: string;
  };
  icon?: React.ReactNode;
}

export function PeriodComparisonDropdownBar({
  title,
  subtitle = 'Pilih paket perbandingan resmi atau tentukan periode berjalan & pembanding melalui menu dropdown',
  period1Label,
  period2Label,
  syncWithDashboard,
  onToggleSync,
  onApplyComparison,
  badgeContent,
  icon,
}: PeriodComparisonDropdownBarProps) {
  // Determine if period matches a known individual period
  const p1Match = findUntrPeriod(period1Label);
  const p2Match = findUntrPeriod(period2Label);

  const [selectedPriorPeriod, setSelectedPriorPeriod] = useState<string>(
    p1Match ? p1Match.id : 'custom'
  );
  const [customPriorText, setCustomPriorText] = useState<string>(period1Label);

  const [selectedCurrentPeriod, setSelectedCurrentPeriod] = useState<string>(
    p2Match ? p2Match.id : 'custom'
  );
  const [customCurrentText, setCustomCurrentText] = useState<string>(period2Label);
  const [showNote, setShowNote] = useState<boolean>(true);

  // Match preset if possible
  const [selectedPresetId, setSelectedPresetId] = useState<string>(() => {
    const found = UNTR_PERIOD_PRESETS.find(
      (pr) =>
        (p1Match && pr.period1Label.toLowerCase() === p1Match.id.toLowerCase()) &&
        (p2Match && pr.period2Label.toLowerCase() === p2Match.id.toLowerCase())
    );
    return found ? found.id : 'fy-2024-vs-2023';
  });

  // Sync internal state when external props change
  useEffect(() => {
    const match1 = findUntrPeriod(period1Label);
    const match2 = findUntrPeriod(period2Label);

    if (match1) {
      setSelectedPriorPeriod(match1.id);
    } else {
      setSelectedPriorPeriod('custom');
      setCustomPriorText(period1Label);
    }

    if (match2) {
      setSelectedCurrentPeriod(match2.id);
    } else {
      setSelectedCurrentPeriod('custom');
      setCustomCurrentText(period2Label);
    }

    const foundPreset = UNTR_PERIOD_PRESETS.find(
      (pr) =>
        (match1 && pr.period1Label.toLowerCase() === match1.id.toLowerCase()) &&
        (match2 && pr.period2Label.toLowerCase() === match2.id.toLowerCase())
    );
    setSelectedPresetId(foundPreset ? foundPreset.id : 'custom');
  }, [period1Label, period2Label]);

  // Handle Preset selection
  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    if (presetId === 'custom') {
      return;
    }

    const preset = UNTR_PERIOD_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setSelectedPriorPeriod(preset.period1Label);
    setSelectedCurrentPeriod(preset.period2Label);

    const result = getUntrFinancialDataForPeriodPair(
      preset.period1Label,
      preset.period2Label
    );

    onApplyComparison(
      preset.period1Label,
      preset.period2Label,
      result.data,
      result.segments,
      result.balanceSheet
    );
  };

  // Handle Prior Period Dropdown change
  const handlePriorPeriodDropdownChange = (val: string) => {
    setSelectedPriorPeriod(val);
    if (val === 'custom') {
      setSelectedPresetId('custom');
      return;
    }

    const targetCurrent =
      selectedCurrentPeriod === 'custom' ? customCurrentText : selectedCurrentPeriod;

    // Check if combo matches preset
    const matchingPreset = UNTR_PERIOD_PRESETS.find(
      (pr) => pr.period1Label === val && pr.period2Label === targetCurrent
    );
    setSelectedPresetId(matchingPreset ? matchingPreset.id : 'custom');

    const result = getUntrFinancialDataForPeriodPair(val, targetCurrent);
    onApplyComparison(
      val,
      targetCurrent,
      result.data,
      result.segments,
      result.balanceSheet
    );
  };

  // Handle Current Period Dropdown change
  const handleCurrentPeriodDropdownChange = (val: string) => {
    setSelectedCurrentPeriod(val);
    if (val === 'custom') {
      setSelectedPresetId('custom');
      return;
    }

    const targetPrior =
      selectedPriorPeriod === 'custom' ? customPriorText : selectedPriorPeriod;

    // Check if combo matches preset
    const matchingPreset = UNTR_PERIOD_PRESETS.find(
      (pr) => pr.period1Label === targetPrior && pr.period2Label === val
    );
    setSelectedPresetId(matchingPreset ? matchingPreset.id : 'custom');

    const result = getUntrFinancialDataForPeriodPair(targetPrior, val);
    onApplyComparison(
      targetPrior,
      val,
      result.data,
      result.segments,
      result.balanceSheet
    );
  };

  // Handle Swap
  const handleSwap = () => {
    const prior =
      selectedPriorPeriod === 'custom' ? customPriorText : selectedPriorPeriod;
    const current =
      selectedCurrentPeriod === 'custom' ? customCurrentText : selectedCurrentPeriod;

    setSelectedPriorPeriod(selectedCurrentPeriod);
    setSelectedCurrentPeriod(selectedPriorPeriod);
    setCustomPriorText(current);
    setCustomCurrentText(prior);

    const matchingPreset = UNTR_PERIOD_PRESETS.find(
      (pr) => pr.period1Label === current && pr.period2Label === prior
    );
    setSelectedPresetId(matchingPreset ? matchingPreset.id : 'custom');

    const result = getUntrFinancialDataForPeriodPair(current, prior);
    onApplyComparison(
      current,
      prior,
      result.data,
      result.segments,
      result.balanceSheet
    );
  };

  const activePrior =
    selectedPriorPeriod === 'custom' ? customPriorText : selectedPriorPeriod;
  const activeCurrent =
    selectedCurrentPeriod === 'custom' ? customCurrentText : selectedCurrentPeriod;

  const currentPreset = UNTR_PERIOD_PRESETS.find((p) => p.id === selectedPresetId);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-4">
      {/* Header Bar with title and sync checkbox */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
            {icon || <Calendar className="w-4 h-4" />}
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <span>{title}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                Mode Dropdown
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">{subtitle}</p>
          </div>
        </div>

        {/* Sync toggle */}
        <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={syncWithDashboard}
            onChange={(e) => onToggleSync(e.target.checked)}
            className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
          />
          <span className="font-medium">Sinkronkan pilihan periode ke seluruh Dashboard</span>
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
              value={selectedCurrentPeriod}
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

          {selectedCurrentPeriod === 'custom' && (
            <input
              type="text"
              value={customCurrentText}
              onChange={(e) => {
                setCustomCurrentText(e.target.value);
                onApplyComparison(activePrior, e.target.value);
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
            onClick={handleSwap}
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
              value={selectedPriorPeriod}
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

          {selectedPriorPeriod === 'custom' && (
            <input
              type="text"
              value={customPriorText}
              onChange={(e) => {
                setCustomPriorText(e.target.value);
                onApplyComparison(e.target.value, activeCurrent);
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
            {currentPreset ? currentPreset.category.toUpperCase() : 'KOMPARASI KUSTOM'}
          </span>
          <span className="text-xs font-bold text-slate-900 font-mono">
            {activeCurrent} (Current) vs {activePrior} (Prior)
          </span>
          {badgeContent && (
            <>
              <span
                className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                  badgeContent.isPositive ?? true
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'text-rose-700 bg-rose-100'
                }`}
              >
                {badgeContent.mainText}
              </span>
              {badgeContent.subText && (
                <span className="text-xs text-slate-500 font-mono">
                  ({badgeContent.subText})
                </span>
              )}
            </>
          )}
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
                {currentPreset
                  ? currentPreset.note
                  : badgeContent?.note ||
                    'Perbandingan antar-periode kustom aktif. Data keuangan disesuaikan secara otomatis berdasarkan basis pelaporan UNTR.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
