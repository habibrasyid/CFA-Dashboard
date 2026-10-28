import React, { useState, useMemo } from 'react';
import {
  OperationalData,
  OperationalMetricItem,
  MachineryBrandItem,
  FinancialData,
  RevenueSegmentItem,
  BalanceSheetData,
} from '../types';
import {
  Truck,
  Flame,
  Coins,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  Edit3,
  Check,
  RotateCcw,
  Info,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Filter,
  ShieldCheck,
  Cpu,
  Boxes,
  HelpCircle,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { PeriodComparisonDropdownBar } from './PeriodComparisonDropdownBar';
import {
  getUntrOperationalData,
  getUntrOperationalDataForPeriodPair,
  UNTR_OPERATIONAL_FY2024_VS_2023,
} from '../data/untrOperationalData';
import { exportUntrExcelFile } from '../utils/exportUntrExcel';

interface OperationalDataViewProps {
  operationalData: OperationalData;
  onChangeOperationalData?: (data: OperationalData) => void;
  period1Label: string;
  period2Label: string;
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

type SectionKey =
  | 'all'
  | 'constructionMachinery'
  | 'miningContracting'
  | 'coalMining'
  | 'goldMining'
  | 'nickelMining'
  | 'kurs';

type ChartMode = 'bar' | 'donut' | 'komatsuFocus' | 'growth';

export function OperationalDataView({
  operationalData,
  onChangeOperationalData,
  period1Label,
  period2Label,
  companyName,
  syncWithDashboard = true,
  onToggleSync,
  onApplyPeriodComparison,
}: OperationalDataViewProps) {
  const [activeSection, setActiveSection] = useState<SectionKey>('all');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [chartMode, setChartMode] = useState<ChartMode>('bar');
  const [donutPeriod, setDonutPeriod] = useState<'current' | 'prior'>('current');
  const [showNotes, setShowNotes] = useState<boolean>(true);

  // Format numbers nicely
  const formatMetricVal = (val: number, format?: string, unit?: string): string => {
    if (val === null || val === undefined || isNaN(val)) return '—';
    if (format === 'percent') {
      return `${val.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
    }
    if (format === 'ratio') {
      return `${val.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}x`;
    }
    if (format === 'currency') {
      if (unit?.includes('USD')) {
        return `$${val.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`;
      }
      return val.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
    }
    // Default number
    return val.toLocaleString('id-ID', {
      minimumFractionDigits: Number.isInteger(val) ? 0 : 1,
      maximumFractionDigits: 2,
    });
  };

  // Machinery brands fallback to default if not present
  const brandsList: MachineryBrandItem[] = useMemo(() => {
    if (operationalData.machineryBrands && operationalData.machineryBrands.length > 0) {
      return operationalData.machineryBrands;
    }
    return UNTR_OPERATIONAL_FY2024_VS_2023.machineryBrands || [];
  }, [operationalData.machineryBrands]);

  // Primary brands (Komatsu as single parent brand, Bomag, UD Trucks, Scania, Tadano, Unit Used)
  const primaryBrands = useMemo(() => {
    return brandsList.filter((b) => !b.isSubBrand && b.code !== 'KOMATSU_TOTAL');
  }, [brandsList]);

  // Komatsu sub-brands breakdown (KCMS and KCMB)
  const komatsuSubBrands = useMemo(() => {
    return brandsList.filter((b) => b.isSubBrand || b.code === 'KCMS' || b.code === 'KCMB');
  }, [brandsList]);

  const komatsuParent = useMemo(() => {
    return (
      brandsList.find((b) => b.code === 'KOMATSU' && !b.isSubBrand) ||
      brandsList.find((b) => b.code === 'KOMATSU_TOTAL') || {
        code: 'KOMATSU',
        brandName: 'Komatsu',
        shortName: 'Komatsu',
        brandLabel: 'Komatsu',
        fullName: 'Brand Komatsu (Total KCMS + KCMB)',
        p1: 5270,
        p2: 4420,
        unit: 'Unit',
        color: '#d97706',
        category: 'Mesin Konstruksi',
      }
    );
  }, [brandsList]);

  // Total units calculation based on primary brands (prevents double counting)
  const totalUnitsP1 = useMemo(() => {
    return primaryBrands.reduce((acc, curr) => acc + curr.p1, 0);
  }, [primaryBrands]);

  const totalUnitsP2 = useMemo(() => {
    return primaryBrands.reduce((acc, curr) => acc + curr.p2, 0);
  }, [primaryBrands]);

  const totalUnitsGrowth = totalUnitsP1 > 0 ? ((totalUnitsP2 - totalUnitsP1) / totalUnitsP1) * 100 : 0;

  // Komatsu total growth
  const komatsuGrowth =
    komatsuParent.p1 > 0
      ? ((komatsuParent.p2 - komatsuParent.p1) / komatsuParent.p1) * 100
      : 0;

  // State for Bar Chart display: whether to show primary brands or include breakdown
  const [barBreakdownMode, setBarBreakdownMode] = useState<'grouped' | 'detailed'>('grouped');

  // Chart data for Grouped Bar Chart
  const barChartData = useMemo(() => {
    const listToUse =
      barBreakdownMode === 'grouped'
        ? primaryBrands
        : brandsList.filter((b) => b.code !== 'KOMATSU_TOTAL');

    return listToUse.map((b) => {
      const diff = b.p2 - b.p1;
      const yoy = b.p1 > 0 ? ((diff / b.p1) * 100).toFixed(1) : '0.0';
      const shareP2 = totalUnitsP2 > 0 ? ((b.p2 / totalUnitsP2) * 100).toFixed(1) : '0.0';
      return {
        code: b.code,
        shortName: b.shortName,
        brandName: b.brandName,
        brandLabel: b.brandLabel,
        fullName: b.fullName,
        color: b.color,
        isSubBrand: b.isSubBrand,
        [period1Label]: b.p1,
        [period2Label]: b.p2,
        diff,
        yoy: `${Number(yoy) >= 0 ? '+' : ''}${yoy}%`,
        share: `${shareP2}%`,
      };
    });
  }, [barBreakdownMode, primaryBrands, brandsList, period1Label, period2Label, totalUnitsP2]);

  // Chart data for Donut Chart (Primary brands so Komatsu is 1 single brand slice)
  const donutChartData = useMemo(() => {
    const isCurrent = donutPeriod === 'current';
    const totalRef = isCurrent ? totalUnitsP2 : totalUnitsP1;
    return primaryBrands.map((b) => {
      const val = isCurrent ? b.p2 : b.p1;
      const pct = totalRef > 0 ? ((val / totalRef) * 100).toFixed(1) : '0.0';
      return {
        name: b.shortName,
        fullName: b.fullName,
        code: b.code,
        value: val,
        percentage: `${pct}%`,
        color: b.color,
      };
    });
  }, [primaryBrands, donutPeriod, totalUnitsP1, totalUnitsP2]);

  // Komatsu Focus Chart Data (KCMS vs KCMB)
  const komatsuFocusData = useMemo(() => {
    const kcmb = komatsuSubBrands.find((b) => b.code === 'KCMB');
    const kcms = komatsuSubBrands.find((b) => b.code === 'KCMS');
    return [
      {
        period: period2Label,
        'KCMS (Unit Kecil & Menengah)': kcms?.p2 || 0,
        'KCMB (Unit Besar / Mining)': kcmb?.p2 || 0,
      },
      {
        period: period1Label,
        'KCMS (Unit Kecil & Menengah)': kcms?.p1 || 0,
        'KCMB (Unit Besar / Mining)': kcmb?.p1 || 0,
      },
    ];
  }, [komatsuSubBrands, period1Label, period2Label]);

  // Growth Ranking Data (using primary brands)
  const growthRankingData = useMemo(() => {
    return primaryBrands
      .map((b) => {
        const growth = b.p1 > 0 ? ((b.p2 - b.p1) / b.p1) * 100 : 0;
        return {
          name: b.shortName,
          code: b.code,
          growth: parseFloat(growth.toFixed(1)),
          p1: b.p1,
          p2: b.p2,
          color: growth >= 0 ? '#10b981' : '#f59e0b',
        };
      })
      .sort((a, b) => b.growth - a.growth);
  }, [primaryBrands]);

  // Handle updates to metrics
  const handleUpdateItem = (
    section: keyof Omit<OperationalData, 'summaryNotes' | 'machineryBrands'>,
    index: number,
    field: 'p1' | 'p2' | 'notes',
    value: any
  ) => {
    if (!onChangeOperationalData) return;
    const updated = { ...operationalData };
    const sectionList = [...updated[section]];
    sectionList[index] = {
      ...sectionList[index],
      [field]: field === 'notes' ? value : parseFloat(value) || 0,
    };
    updated[section] = sectionList;
    onChangeOperationalData(updated);
  };

  // Handle updates to machinery brand items
  const handleUpdateBrand = (
    index: number,
    field: 'p1' | 'p2' | 'description',
    value: any
  ) => {
    if (!onChangeOperationalData) return;
    const updatedBrands = [...brandsList];
    const parsedVal = field === 'description' ? value : parseFloat(value) || 0;
    updatedBrands[index] = {
      ...updatedBrands[index],
      [field]: parsedVal,
    };

    // If KCMS or KCMB sub-brand was updated, automatically recompute parent KOMATSU
    const targetBrand = updatedBrands[index];
    if (targetBrand.code === 'KCMS' || targetBrand.code === 'KCMB') {
      const komatsuIdx = updatedBrands.findIndex((b) => b.code === 'KOMATSU' && !b.isSubBrand);
      if (komatsuIdx >= 0) {
        const kcms = updatedBrands.find((b) => b.code === 'KCMS');
        const kcmb = updatedBrands.find((b) => b.code === 'KCMB');
        if (kcms && kcmb) {
          if (field === 'p1') {
            updatedBrands[komatsuIdx] = { ...updatedBrands[komatsuIdx], p1: kcms.p1 + kcmb.p1 };
          } else if (field === 'p2') {
            updatedBrands[komatsuIdx] = { ...updatedBrands[komatsuIdx], p2: kcms.p2 + kcmb.p2 };
          }
        }
      }
    }

    onChangeOperationalData({
      ...operationalData,
      machineryBrands: updatedBrands,
    });
  };

  const handleReset = () => {
    if (onChangeOperationalData) {
      const resetData = getUntrOperationalDataForPeriodPair(period1Label, period2Label);
      onChangeOperationalData(resetData);
    }
  };

  // Section configs
  const sectionsConfig: {
    key: keyof Omit<OperationalData, 'summaryNotes' | 'machineryBrands'>;
    title: string;
    subtitle: string;
    badge: string;
    icon: React.ReactNode;
    colorClass: string;
  }[] = [
    {
      key: 'constructionMachinery',
      title: 'Construction Machinery (Mesin Konstruksi)',
      subtitle: 'Tabel metrik operasional terperinci, pangsa pasar, suku cadang & servis',
      badge: 'Alat Berat & Suku Cadang',
      icon: <Truck className="w-4 h-4 text-amber-600" />,
      colorClass: 'border-amber-200 bg-amber-50/50',
    },
    {
      key: 'miningContracting',
      title: 'Mining Contracting (Kontraktor Penambangan - PAMA)',
      subtitle: 'Jasa penambangan batubara terintegrasi PT Pamapersada Nusantara',
      badge: 'OB Removal & Produksi Batubara',
      icon: <Layers className="w-4 h-4 text-sky-600" />,
      colorClass: 'border-sky-200 bg-sky-50/50',
    },
    {
      key: 'coalMining',
      title: 'Coal Mining (Pertambangan Batubara - TTA)',
      subtitle: 'Penjualan batubara konsolidasi PT Tuah Turangga Agung (Termal & Metalurgi)',
      badge: 'Volume Batubara & ASP ($/ton)',
      icon: <Flame className="w-4 h-4 text-slate-700" />,
      colorClass: 'border-slate-300 bg-slate-50/70',
    },
    {
      key: 'goldMining',
      title: 'Gold Mining (Pertambangan Emas - Martabe)',
      subtitle: 'Eksploitasi Tambang Emas Martabe (PT Agincourt Resources) & SJR',
      badge: 'Volume Ons Troy & ASP Emas',
      icon: <Coins className="w-4 h-4 text-yellow-600" />,
      colorClass: 'border-yellow-200 bg-yellow-50/50',
    },
    {
      key: 'nickelMining',
      title: 'Nickel Mining (Pertambangan Nikel)',
      subtitle: 'Produksi bijih Limonite (HPAL) & Saprolite (RKEF) serta ASP Nikel',
      badge: 'Limonite, Saprolite & ASP ($/ton)',
      icon: <Zap className="w-4 h-4 text-emerald-600" />,
      colorClass: 'border-emerald-200 bg-emerald-50/50',
    },
    {
      key: 'kurs',
      title: 'Kurs (Nilai Tukar Valas & FX Sensitivity)',
      subtitle: 'Pergerakan kurs USD/IDR dan JPY/IDR serta dampak translasi kas operasional',
      badge: 'Sensitivitas Nilai Tukar',
      icon: <DollarSign className="w-4 h-4 text-emerald-600" />,
      colorClass: 'border-emerald-200 bg-emerald-50/50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-white uppercase tracking-wider">
              Data Operasional
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Physical Operational Metrics & Brand Performance
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              Komatsu Market Share 28%
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Kinerja Operasional Fisik & Breakdown Brand Alat Berat
          </h2>
          <p className="text-xs text-slate-500">
            {companyName} • Perbandingan Periode {period2Label} (Current) vs {period1Label} (Prior)
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => exportUntrExcelFile()}
            className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            title="Download seluruh laporan operasional dan finansial dalam format Microsoft Excel (.xlsx)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Excel</span>
          </button>

          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
              isEditing
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {isEditing ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Selesai Edit</span>
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                <span>Edit Data Operasional</span>
              </>
            )}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Reset ke data default periode ini"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* DROPDOWN PERIOD COMPARISON SELECTOR (SAMA SEPERTI BAGAN LAINNYA) */}
      <PeriodComparisonDropdownBar
        title="Pilihan Periode Komparasi Data Operasional (Operational Period Selector)"
        subtitle="Pilih periode berjalan (Current) dan pembanding (Prior) melalui menu dropdown untuk memperbarui data volume fisik & grafik brand"
        period1Label={period1Label}
        period2Label={period2Label}
        syncWithDashboard={syncWithDashboard}
        onToggleSync={onToggleSync || (() => {})}
        onApplyComparison={(p1, p2, newData, newSegments, newBs) => {
          // Resolve operational data for the selected period pair
          const newOpData = getUntrOperationalDataForPeriodPair(p1, p2);
          if (onChangeOperationalData) {
            onChangeOperationalData(newOpData);
          }
          if (onApplyPeriodComparison) {
            onApplyPeriodComparison(p1, p2, newData, newSegments, newBs);
          }
        }}
        badgeContent={{
          tag: 'KOMATSU TOTAL YoY',
          mainText: `${komatsuGrowth >= 0 ? '+' : ''}${komatsuGrowth.toFixed(1)}%`,
          subText: `${komatsuParent.p2.toLocaleString('id-ID')} vs ${komatsuParent.p1.toLocaleString('id-ID')} unit`,
          isPositive: komatsuGrowth >= 0,
          note: `Data operasional membandingkan volume alat berat Komatsu (${period2Label} vs ${period1Label}), OB removal PAMA, produksi batubara, dan emas Martabe.`,
        }}
      />

      {/* ========================================================================= */}
      {/* SECTION KHUSUS: CONSTRUCTION MACHINERY BY BRAND (GRAFIK & BREAKDOWN BRAND) */}
      {/* ========================================================================= */}
      {(activeSection === 'all' || activeSection === 'constructionMachinery') && (
        <div className="bg-white rounded-xl border border-amber-200/80 shadow-xs overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-amber-50/90 via-amber-50/40 to-white px-5 py-4 border-b border-amber-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-slate-900">
                    Segment Construction Machinery: Grafik & Breakdown Menurut Brand
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    Komatsu (KCMS & KCMB), Bomag, UD Trucks, Scania, Tadano, Unit Used
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visualisasi grafik penjualan alat berat brand Komatsu (KCMS unit kecil & KCMB unit besar), Bomag (BOM), UD Trucks (NHT), Scania (SCN), Tadano (THC), dan Unit Used (USE).
                </p>
              </div>
            </div>

            {/* Chart View Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 self-start md:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setChartMode('bar')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  chartMode === 'bar'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-amber-600" />
                <span>Grafik Batang</span>
              </button>
              <button
                type="button"
                onClick={() => setChartMode('donut')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  chartMode === 'donut'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <PieChartIcon className="w-3.5 h-3.5 text-amber-600" />
                <span>Komposisi (%)</span>
              </button>
              <button
                type="button"
                onClick={() => setChartMode('komatsuFocus')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  chartMode === 'komatsuFocus'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Boxes className="w-3.5 h-3.5 text-amber-600" />
                <span>Breakdown Komatsu</span>
              </button>
              <button
                type="button"
                onClick={() => setChartMode('growth')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  chartMode === 'growth'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                <span>Pertumbuhan YoY</span>
              </button>
            </div>
          </div>

          {/* Brand KPI Snapshot Cards */}
          <div className="p-5 border-b border-slate-100 bg-slate-50/40">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>Ringkasan Volume Penjualan Berdasarkan Brand (Units Sold)</span>
              <span className="text-slate-500 font-normal">
                Total Portofolio: {totalUnitsP2.toLocaleString('id-ID')} unit ({period2Label}) vs{' '}
                {totalUnitsP1.toLocaleString('id-ID')} unit ({period1Label}) [
                <span className={totalUnitsGrowth >= 0 ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>
                  {totalUnitsGrowth >= 0 ? '+' : ''}
                  {totalUnitsGrowth.toFixed(1)}%
                </span>
                ]
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {primaryBrands.map((brand) => {
                const diff = brand.p2 - brand.p1;
                const growth = brand.p1 > 0 ? ((diff / brand.p1) * 100).toFixed(1) : '0.0';
                const isPos = diff >= 0;
                const isKomatsu = brand.code === 'KOMATSU';
                const kcmsItem = komatsuSubBrands.find((b) => b.code === 'KCMS');
                const kcmbItem = komatsuSubBrands.find((b) => b.code === 'KCMB');

                return (
                  <div
                    key={brand.code}
                    className={`bg-white p-3 rounded-xl border shadow-2xs flex flex-col justify-between transition-colors ${
                      isKomatsu
                        ? 'border-amber-300 ring-1 ring-amber-200/60 bg-gradient-to-b from-amber-50/30 to-white'
                        : 'border-slate-200 hover:border-amber-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span
                          className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white tracking-wide"
                          style={{ backgroundColor: brand.color }}
                        >
                          {brand.code}
                        </span>
                        <span
                          className={`text-[10px] font-bold flex items-center gap-0.5 ${
                            isPos ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          {isPos ? (
                            <ArrowUpRight className="w-2.5 h-2.5 text-emerald-600" />
                          ) : (
                            <ArrowDownRight className="w-2.5 h-2.5 text-amber-600" />
                          )}
                          {isPos ? '+' : ''}
                          {growth}%
                        </span>
                      </div>
                      <span className="text-xs font-bold text-slate-800 block truncate" title={brand.brandName}>
                        {brand.shortName}
                      </span>
                      {isKomatsu && (
                        <div className="mt-1 flex flex-col gap-0.5 text-[9px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
                          <div className="flex justify-between">
                            <span>KCMS (Kecil):</span>
                            <span className="font-bold">{kcmsItem?.p2.toLocaleString('id-ID')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>KCMB (Besar):</span>
                            <span className="font-bold">{kcmbItem?.p2.toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-baseline justify-between">
                      <span className="text-base font-bold text-slate-900">
                        {brand.p2.toLocaleString('id-ID')}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        vs {brand.p1.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* MAIN CHART VISUALIZATION CANVAS */}
          <div className="p-5">
            {/* 1. GROUPED BAR CHART */}
            {chartMode === 'bar' && (
              <div>
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Grafik Komparasi Volume Penjualan per Brand ({period1Label} vs {period2Label})
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Menampilkan unit penjualan brand Komatsu (KCMS & KCMB), Bomag, UD Trucks, Scania, Tadano, dan Unit Used.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* View breakdown mode toggle */}
                    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setBarBreakdownMode('grouped')}
                        className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                          barBreakdownMode === 'grouped'
                            ? 'bg-white text-slate-900 shadow-2xs font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        1 Brand Komatsu
                      </button>
                      <button
                        type="button"
                        onClick={() => setBarBreakdownMode('detailed')}
                        className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                          barBreakdownMode === 'detailed'
                            ? 'bg-white text-slate-900 shadow-2xs font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Detail KCMS & KCMB
                      </button>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-xs bg-amber-500" />
                        <span>{period2Label} (Current)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-xs bg-slate-300" />
                        <span>{period1Label} (Prior)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barChartData}
                      margin={{ top: 15, right: 15, left: 0, bottom: 25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="shortName"
                        tick={{ fontSize: 11, fill: '#475569', fontWeight: 500 }}
                        axisLine={{ stroke: '#cbd5e1' }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        axisLine={{ stroke: '#cbd5e1' }}
                        tickLine={false}
                        tickFormatter={(val) => val.toLocaleString('id-ID')}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload || !payload.length) return null;
                          const d = payload[0].payload;
                          return (
                            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-lg text-xs min-w-[220px]">
                              <div className="flex items-center gap-2 mb-1.5 pb-1 border-b border-slate-100">
                                <span
                                  className="w-2.5 h-2.5 rounded-full"
                                  style={{ backgroundColor: d.color }}
                                />
                                <span className="font-bold text-slate-900">{d.fullName}</span>
                              </div>
                              <div className="space-y-1 text-slate-600 text-[11px]">
                                <div className="flex justify-between">
                                  <span>{period2Label} (Current):</span>
                                  <span className="font-bold text-slate-900">
                                    {d[period2Label]?.toLocaleString('id-ID')} unit
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>{period1Label} (Prior):</span>
                                  <span className="font-medium text-slate-700">
                                    {d[period1Label]?.toLocaleString('id-ID')} unit
                                  </span>
                                </div>
                                <div className="flex justify-between pt-1 border-t border-slate-100">
                                  <span>Perubahan (Δ):</span>
                                  <span
                                    className={`font-bold ${
                                      d.diff >= 0 ? 'text-emerald-600' : 'text-amber-600'
                                    }`}
                                  >
                                    {d.diff >= 0 ? '+' : ''}
                                    {d.diff?.toLocaleString('id-ID')} unit ({d.yoy})
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Pangsa Volume ({period2Label}):</span>
                                  <span className="font-semibold text-slate-800">{d.share}</span>
                                </div>
                              </div>
                            </div>
                          );
                        }}
                      />
                      <Bar
                        dataKey={period2Label}
                        fill="#f59e0b"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={38}
                      />
                      <Bar
                        dataKey={period1Label}
                        fill="#cbd5e1"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={38}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* 2. DONUT / PIE CHART (KOMPOSISI PORTOFOLIO) */}
            {chartMode === 'donut' && (
              <div>
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Komposisi Portofolio Alat Berat Menurut Brand (% Share)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Distribusi kontribusi setiap brand terhadap total penjualan peralatan konstruksi.
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                    <button
                      type="button"
                      onClick={() => setDonutPeriod('current')}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                        donutPeriod === 'current'
                          ? 'bg-white text-slate-900 shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {period2Label} (Current)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDonutPeriod('prior')}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                        donutPeriod === 'prior'
                          ? 'bg-white text-slate-900 shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {period1Label} (Prior)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div className="h-72 w-full md:col-span-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={donutChartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={105}
                          paddingAngle={3}
                        >
                          {donutChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload || !payload.length) return null;
                            const d = payload[0].payload;
                            return (
                              <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-md text-xs">
                                <div className="flex items-center gap-2 mb-1">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{ backgroundColor: d.color }}
                                  />
                                  <span className="font-bold text-slate-900">{d.fullName}</span>
                                </div>
                                <div className="text-slate-600">
                                  <span>Volume: </span>
                                  <span className="font-bold text-slate-900">
                                    {d.value.toLocaleString('id-ID')} unit
                                  </span>{' '}
                                  ({d.percentage})
                                </div>
                              </div>
                            );
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legend list */}
                  <div className="space-y-2 border-l border-slate-100 pl-4">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Rincian Pangsa {donutPeriod === 'current' ? period2Label : period1Label}
                    </span>
                    {donutChartData.map((item) => (
                      <div key={item.code} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-slate-700 font-medium truncate">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2 font-semibold">
                          <span className="text-slate-900">{item.value.toLocaleString('id-ID')}</span>
                          <span className="text-slate-400 text-[10px]">({item.percentage})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 3. KOMATSU FOCUS CHART (KCMB VS KCMS) */}
            {chartMode === 'komatsuFocus' && (
              <div>
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Fokus Brand Komatsu: KCMB (Unit Besar) vs KCMS (Unit Kecil)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Pergeseran bauran antara alat berat pertambangan berat (KCMB &gt;100t) dan alat berat agro/konstruksi (KCMS).
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-medium">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-xs bg-[#b45309]" />
                      <span className="text-slate-700">KCMB (Unit Besar / Mining)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-xs bg-[#f59e0b]" />
                      <span className="text-slate-700">KCMS (Unit Kecil / Non-Mining)</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                  <div className="h-72 w-full lg:col-span-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={komatsuFocusData}
                        margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="period"
                          tick={{ fontSize: 12, fill: '#1e293b', fontWeight: 600 }}
                          axisLine={{ stroke: '#cbd5e1' }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: '#64748b' }}
                          axisLine={{ stroke: '#cbd5e1' }}
                          tickLine={false}
                          tickFormatter={(val) => val.toLocaleString('id-ID')}
                        />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (!active || !payload || !payload.length) return null;
                            const total = payload.reduce((acc, p) => acc + (Number(p.value) || 0), 0);
                            return (
                              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-lg text-xs min-w-[220px]">
                                <span className="font-bold text-slate-900 block mb-1 pb-1 border-b border-slate-100">
                                  Komatsu Periode {label}
                                </span>
                                {payload.map((p) => (
                                  <div key={p.name} className="flex justify-between py-0.5 text-slate-600">
                                    <span className="flex items-center gap-1.5">
                                      <span
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: p.color }}
                                      />
                                      {p.name}:
                                    </span>
                                    <span className="font-bold text-slate-900">
                                      {Number(p.value).toLocaleString('id-ID')} unit (
                                      {total > 0 ? ((Number(p.value) / total) * 100).toFixed(1) : 0}%)
                                    </span>
                                  </div>
                                ))}
                                <div className="mt-1 pt-1 border-t border-slate-100 flex justify-between font-bold text-slate-900">
                                  <span>Total Komatsu:</span>
                                  <span>{total.toLocaleString('id-ID')} unit</span>
                                </div>
                              </div>
                            );
                          }}
                        />
                        <Bar
                          dataKey="KCMB (Unit Besar >100t)"
                          stackId="komatsu"
                          fill="#b45309"
                          maxBarSize={60}
                        />
                        <Bar
                          dataKey="KCMS (Unit Kecil & Menengah)"
                          stackId="komatsu"
                          fill="#f59e0b"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={60}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Explanatory cards */}
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/60 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1">
                        <Info className="w-3.5 h-3.5 text-amber-700" />
                        <span>KCMB (Komatsu Unit Besar)</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">
                        Meliputi ekskavator tambang raksasa (PC2000, PC1250) dan heavy mining dump trucks
                        (HD785). Penjualan sangat sensitif terhadap belanja modal (Capex) kontraktor batubara.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/80 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-1">
                        <Info className="w-3.5 h-3.5 text-slate-600" />
                        <span>KCMS (Komatsu Unit Kecil & Menengah)</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">
                        Ekskavator serbaguna kelas 20 ton (PC200, PC130), bulldozer (D85), dan motor grader
                        untuk sektor perkebunan kelapa sawit (agro), kehutanan (forestry), dan proyek infrastruktur jalan.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. GROWTH PERFORMANCE RANKING */}
            {chartMode === 'growth' && (
              <div>
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Peringkat Pertumbuhan Volume Penjualan per Brand (% YoY)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Evaluasi resiliensi dan performa relatif masing-masing brand alat berat selama periode komparasi.
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 max-w-2xl">
                  {growthRankingData.map((b) => {
                    const isPositive = b.growth >= 0;
                    return (
                      <div
                        key={b.code}
                        className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between gap-4 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-[160px]">
                          <span className="w-14 font-bold text-slate-900">{b.code}</span>
                          <span className="text-slate-600 font-medium truncate">{b.name}</span>
                        </div>

                        <div className="flex-1 hidden sm:block">
                          <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isPositive ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                              style={{
                                width: `${Math.min(Math.abs(b.growth) * 2, 100)}%`,
                              }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-slate-500 font-mono text-[11px]">
                            {b.p2.toLocaleString('id-ID')} vs {b.p1.toLocaleString('id-ID')}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-bold ${
                              isPositive
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {isPositive ? '+' : ''}
                            {b.growth}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* TABEL DATA OPERASIONAL BERDASARKAN BRAND */}
          <div className="border-t border-slate-200">
            <div className="bg-slate-50/70 px-5 py-2.5 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Tabel Rincian Penjualan Mesin Konstruksi Menurut Brand (Brand-Level Table)
              </span>
              <span className="text-[11px] text-slate-500">Satuan: Unit Peralatan</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-4 w-20">Kode</th>
                    <th className="py-2.5 px-4">Nama Lengkap Brand & Model</th>
                    <th className="py-2.5 px-4 text-right w-28 bg-amber-50/50">
                      {period2Label} (Current)
                    </th>
                    <th className="py-2.5 px-4 text-right w-28">{period1Label} (Prior)</th>
                    <th className="py-2.5 px-4 text-right w-24">Selisih (Δ)</th>
                    <th className="py-2.5 px-4 text-right w-24">YoY (%)</th>
                    <th className="py-2.5 px-4 text-right w-20">Bauran (%)</th>
                    {showNotes && <th className="py-2.5 px-4">Catatan Operasional & Sektor Pengguna</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {brandsList
                    .filter((brand) => brand.code !== 'KOMATSU_TOTAL')
                    .map((brand) => {
                      const idx = brandsList.findIndex((b) => b.code === brand.code);
                      const diff = brand.p2 - brand.p1;
                      const growth = brand.p1 > 0 ? ((diff / brand.p1) * 100).toFixed(1) : '0.0';
                      const isKomatsuParent = brand.code === 'KOMATSU' && !brand.isSubBrand;
                      const isSub = brand.isSubBrand;
                      const share =
                        totalUnitsP2 > 0
                          ? ((brand.p2 / totalUnitsP2) * 100).toFixed(1)
                          : '—';
                      const shareOfKomatsu =
                        isSub && komatsuParent.p2 > 0
                          ? ((brand.p2 / komatsuParent.p2) * 100).toFixed(1)
                          : null;

                      return (
                        <tr
                          key={brand.code}
                          className={`transition-colors ${
                            isKomatsuParent
                              ? 'bg-amber-50/50 font-bold text-slate-900 border-t border-amber-200 hover:bg-amber-50/70'
                              : isSub
                              ? 'bg-amber-50/15 text-slate-700 hover:bg-amber-50/30'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-1.5">
                              {isSub && <span className="text-amber-500 font-bold text-xs">↳</span>}
                              <span
                                className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white tracking-wide shrink-0"
                                style={{ backgroundColor: brand.color }}
                              >
                                {brand.code}
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 px-4">
                            <div className={isSub ? 'pl-2' : ''}>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`block ${
                                    isKomatsuParent
                                      ? 'font-bold text-slate-900 text-[13px]'
                                      : isSub
                                      ? 'font-semibold text-slate-800'
                                      : 'font-semibold text-slate-900'
                                  }`}
                                >
                                  {brand.brandName}
                                </span>
                                {isKomatsuParent && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-200/70 text-amber-900">
                                    Brand Utama (Parent)
                                  </span>
                                )}
                                {isSub && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-amber-100 text-amber-800 border border-amber-200/50">
                                    Breakdown Komatsu
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* P2 (Current) */}
                          <td
                            className={`py-2.5 px-4 text-right ${
                              isKomatsuParent
                                ? 'font-bold text-slate-900 bg-amber-100/40 text-[13px]'
                                : 'font-semibold text-slate-900 bg-amber-50/20'
                            }`}
                          >
                            {isEditing ? (
                              <input
                                type="number"
                                value={brand.p2}
                                onChange={(e) => handleUpdateBrand(idx, 'p2', e.target.value)}
                                className="w-20 px-1.5 py-0.5 text-right text-xs bg-white border border-amber-400 rounded focus:outline-hidden"
                              />
                            ) : (
                              brand.p2.toLocaleString('id-ID')
                            )}
                          </td>

                          {/* P1 (Prior) */}
                          <td
                            className={`py-2.5 px-4 text-right ${
                              isKomatsuParent ? 'font-bold text-slate-800' : 'text-slate-700'
                            }`}
                          >
                            {isEditing ? (
                              <input
                                type="number"
                                value={brand.p1}
                                onChange={(e) => handleUpdateBrand(idx, 'p1', e.target.value)}
                                className="w-20 px-1.5 py-0.5 text-right text-xs bg-white border border-slate-300 rounded focus:outline-hidden"
                              />
                            ) : (
                              brand.p1.toLocaleString('id-ID')
                            )}
                          </td>

                          {/* Diff */}
                          <td
                            className={`py-2.5 px-4 text-right font-semibold ${
                              diff >= 0 ? 'text-emerald-700' : 'text-amber-700'
                            }`}
                          >
                            {diff >= 0 ? '+' : ''}
                            {diff.toLocaleString('id-ID')}
                          </td>

                          {/* YoY */}
                          <td
                            className={`py-2.5 px-4 text-right font-bold ${
                              Number(growth) >= 0 ? 'text-emerald-700' : 'text-amber-700'
                            }`}
                          >
                            {Number(growth) >= 0 ? '+' : ''}
                            {growth}%
                          </td>

                          {/* Share */}
                          <td className="py-2.5 px-4 text-right text-slate-600 font-medium">
                            <div>
                              <span>{share !== '—' ? `${share}%` : '—'}</span>
                              {shareOfKomatsu && (
                                <span className="block text-[9px] text-amber-700 font-normal">
                                  ({shareOfKomatsu}% Komatsu)
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Notes */}
                          {showNotes && (
                            <td className="py-2.5 px-4 text-slate-500 text-[11px]">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={brand.description || ''}
                                  onChange={(e) => handleUpdateBrand(idx, 'description', e.target.value)}
                                  className="w-full px-1.5 py-0.5 text-xs bg-white border border-slate-300 rounded focus:outline-hidden"
                                />
                              ) : (
                                brand.description || '—'
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}

                  {/* Grand Total Row */}
                  <tr className="bg-slate-100/90 font-bold text-slate-900 border-t-2 border-slate-300">
                    <td className="py-3 px-4">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-slate-800 text-white tracking-wide">
                        TOTAL
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-black text-slate-900 block text-xs">
                        Total Penjualan Alat Berat Mesin Konstruksi (Seluruh Brand)
                      </span>
                      <span className="text-[10px] text-slate-500 block font-normal">
                        Komatsu (KCMS + KCMB) + Bomag + UD Trucks + Scania + Tadano + Unit Used
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-900 bg-amber-100/50 text-[13px]">
                      {totalUnitsP2.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-800">
                      {totalUnitsP1.toLocaleString('id-ID')}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-bold ${
                        totalUnitsP2 - totalUnitsP1 >= 0 ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {totalUnitsP2 - totalUnitsP1 >= 0 ? '+' : ''}
                      {(totalUnitsP2 - totalUnitsP1).toLocaleString('id-ID')}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-black ${
                        totalUnitsGrowth >= 0 ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {totalUnitsGrowth >= 0 ? '+' : ''}
                      {totalUnitsGrowth.toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-right text-slate-900 font-black">100.0%</td>
                    {showNotes && (
                      <td className="py-3 px-4 text-slate-600 text-[11px] font-normal">
                        Konsolidasi resmi 6 brand alat berat mesin konstruksi UNTR
                      </td>
                    )}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FILTER TABS UNTUK SEGMEN OPERASIONAL LAINNYA */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSection('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSection === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Semua Segmen Operasional
          </button>
          {sectionsConfig.map((sec) => (
            <button
              key={sec.key}
              type="button"
              onClick={() => setActiveSection(sec.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeSection === sec.key
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {sec.icon}
              <span>{sec.title.split(' (')[0]}</span>
            </button>
          ))}
        </div>

        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 cursor-pointer select-none shrink-0 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs self-start sm:self-auto">
          <input
            type="checkbox"
            checked={showNotes}
            onChange={(e) => setShowNotes(e.target.checked)}
            className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-3.5 h-3.5"
          />
          <span>Tampilkan Catatan</span>
        </label>
      </div>

      {/* ========================================================================= */}
      {/* TABULAR SECTIONS FOR ALL OPERATIONAL METRICS */}
      {/* ========================================================================= */}
      <div className="space-y-6">
        {sectionsConfig.map((sec) => {
          if (activeSection !== 'all' && activeSection !== sec.key) return null;
          const items = operationalData[sec.key] as OperationalMetricItem[];

          return (
            <div
              key={sec.key}
              className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                    {sec.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{sec.title}</h3>
                    <p className="text-xs text-slate-500">{sec.subtitle}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-slate-700 border border-slate-200 self-start sm:self-auto">
                  {sec.badge}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/60 text-slate-600 font-bold border-b border-slate-200">
                      <th className="py-2.5 px-4">Metrik Operasional</th>
                      <th className="py-2.5 px-4 w-28">Satuan</th>
                      <th className="py-2.5 px-4 text-right w-32 bg-slate-100/90 font-black text-slate-900">
                        {period2Label} (Current)
                      </th>
                      <th className="py-2.5 px-4 text-right w-32">{period1Label} (Prior)</th>
                      <th className="py-2.5 px-4 text-right w-28">Perubahan (Δ)</th>
                      <th className="py-2.5 px-4 text-right w-24">Pertumbuhan (%)</th>
                      {showNotes && <th className="py-2.5 px-4">Catatan Operasional Lapangan</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item, idx) => {
                      if (item.isHeader) {
                        return (
                          <tr key={item.id} className="bg-slate-50/80 font-bold text-slate-800">
                            <td colSpan={showNotes ? 7 : 6} className="py-2 px-4 text-[11px] uppercase tracking-wider">
                              {item.name}
                            </td>
                          </tr>
                        );
                      }

                      const diff = item.p2 - item.p1;
                      const growth = item.p1 !== 0 ? ((diff / item.p1) * 100).toFixed(1) : '—';
                      const isPositive = diff > 0;
                      const isZero = diff === 0;

                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-slate-50 transition-colors ${
                            item.indent ? 'bg-slate-50/20' : ''
                          }`}
                        >
                          <td className="py-2.5 px-4 font-medium text-slate-800">
                            <span style={{ paddingLeft: `${(item.indent || 0) * 16}px` }}>
                              {item.name}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px]">
                            {item.unit || '—'}
                          </td>

                          {/* P2 Value */}
                          <td className="py-2.5 px-4 text-right font-bold text-slate-900 bg-slate-50/50">
                            {isEditing ? (
                              <input
                                type="number"
                                step="any"
                                value={item.p2}
                                onChange={(e) =>
                                  handleUpdateItem(sec.key, idx, 'p2', e.target.value)
                                }
                                className="w-24 px-1.5 py-0.5 text-right text-xs bg-white border border-amber-400 rounded focus:outline-hidden"
                              />
                            ) : (
                              formatMetricVal(item.p2, item.format, item.unit)
                            )}
                          </td>

                          {/* P1 Value */}
                          <td className="py-2.5 px-4 text-right text-slate-700">
                            {isEditing ? (
                              <input
                                type="number"
                                step="any"
                                value={item.p1}
                                onChange={(e) =>
                                  handleUpdateItem(sec.key, idx, 'p1', e.target.value)
                                }
                                className="w-24 px-1.5 py-0.5 text-right text-xs bg-white border border-slate-300 rounded focus:outline-hidden"
                              />
                            ) : (
                              formatMetricVal(item.p1, item.format, item.unit)
                            )}
                          </td>

                          {/* Delta */}
                          <td
                            className={`py-2.5 px-4 text-right font-semibold ${
                              isZero
                                ? 'text-slate-400'
                                : isPositive
                                ? 'text-emerald-600'
                                : 'text-amber-600'
                            }`}
                          >
                            {isZero ? '0' : `${isPositive ? '+' : ''}${formatMetricVal(diff, item.format, item.unit)}`}
                          </td>

                          {/* Growth % */}
                          <td
                            className={`py-2.5 px-4 text-right font-bold ${
                              growth === '—' || isZero
                                ? 'text-slate-400'
                                : Number(growth) > 0
                                ? 'text-emerald-700'
                                : 'text-amber-700'
                            }`}
                          >
                            {growth !== '—' && !isZero ? `${Number(growth) > 0 ? '+' : ''}${growth}%` : '—'}
                          </td>

                          {/* Notes */}
                          {showNotes && (
                            <td className="py-2.5 px-4 text-slate-500 text-[11px]">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={item.notes || ''}
                                  onChange={(e) =>
                                    handleUpdateItem(sec.key, idx, 'notes', e.target.value)
                                  }
                                  className="w-full px-1.5 py-0.5 text-xs bg-white border border-slate-300 rounded focus:outline-hidden"
                                />
                              ) : (
                                item.notes || '—'
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Integrated Section Bar Chart Visualization (or Line Chart for Kurs, or ComposedChart for Mining Contracting) */}
              <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    {sec.key === 'kurs' ? (
                      <LineChartIcon className="w-4 h-4 text-amber-600" />
                    ) : sec.key === 'miningContracting' ? (
                      <BarChart3 className="w-4 h-4 text-amber-600" />
                    ) : (
                      <BarChart3 className="w-4 h-4 text-amber-600" />
                    )}
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      {sec.key === 'kurs' 
                        ? `Tren Kurs Tengah USD/IDR (${period1Label} vs ${period2Label})`
                        : sec.key === 'miningContracting'
                        ? `Grafik Overburden Removal (Column) & Stripping Ratio (Line)`
                        : sec.key === 'coalMining'
                        ? `Grafik Volume Batubara (Thermal & Met Stacked) & Harga/Biaya (Line)`
                        : sec.key === 'goldMining'
                        ? `Grafik Volume Penjualan Emas (Column) & Rata-rata Harga Emas (Line)`
                        : sec.key === 'nickelMining'
                        ? `Grafik Volume Nikel (Limonite & Saprolite Stacked) & Harga Jual ASP (Line)`
                        : `Grafik Komparasi ${sec.title.split(' (')[0]} (${period1Label} vs ${period2Label})`}
                    </h4>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-medium text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-xs bg-amber-500" />
                      <span>{period2Label} (Current)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-xs bg-slate-400" />
                      <span>{period1Label} (Prior)</span>
                    </div>
                  </div>
                </div>

                <div className="w-full h-64 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                  <ResponsiveContainer width="100%" height="100%">
                    {sec.key === 'kurs' ? (
                      <LineChart
                        data={items.filter(i => !i.isHeader).map(i => ({
                          name: i.name.replace(/^[•\s↳\s]+/, '').replace(' (Kurs Tengah USD/IDR)', '').replace('Kurs Tengah USD/IDR', '').trim(),
                          fullName: i.name,
                          unit: i.unit,
                          [period2Label]: i.p2,
                          [period1Label]: i.p1,
                          diff: i.p2 - i.p1,
                          yoy: i.p1 !== 0 ? (((i.p2 - i.p1) / i.p1) * 100).toFixed(1) + '%' : '—',
                        }))}
                        margin={{ top: 10, right: 15, left: 0, bottom: 25 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 10, fill: '#475569', fontWeight: 500 }}
                          axisLine={{ stroke: '#cbd5e1' }}
                          tickLine={false}
                          interval={0}
                          height={25}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: '#64748b' }}
                          axisLine={{ stroke: '#cbd5e1' }}
                          tickLine={false}
                          domain={['auto', 'auto']}
                          tickFormatter={(val) => val.toLocaleString('id-ID')}
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload || !payload.length) return null;
                            const d = payload[0].payload;
                            return (
                              <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-lg text-xs min-w-[200px]">
                                <div className="font-bold text-slate-900 mb-1 pb-1 border-b border-slate-100">
                                  {d.fullName}
                                </div>
                                <div className="space-y-1 text-slate-600 text-[11px]">
                                  <div className="flex justify-between">
                                    <span>{period2Label}:</span>
                                    <span className="font-bold text-slate-900">
                                      Rp {d[period2Label]?.toLocaleString('id-ID')}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>{period1Label}:</span>
                                    <span className="font-medium text-slate-700">
                                      Rp {d[period1Label]?.toLocaleString('id-ID')}
                                    </span>
                                  </div>
                                  <div className="flex justify-between pt-1 border-t border-slate-100 font-semibold">
                                    <span>Selisih:</span>
                                    <span className={d.diff >= 0 ? 'text-amber-600' : 'text-emerald-600'}>
                                      {d.diff >= 0 ? '+' : ''}{d.diff?.toLocaleString('id-ID')} ({d.yoy})
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey={period2Label}
                          stroke="#f59e0b"
                          strokeWidth={2.5}
                          dot={{ r: 4, fill: '#f59e0b' }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey={period1Label}
                          stroke="#94a3b8"
                          strokeWidth={2}
                          strokeDasharray="4 4"
                          dot={{ r: 3, fill: '#94a3b8' }}
                        />
                      </LineChart>
                    ) : sec.key === 'miningContracting' ? (
                      <>
                        <ComposedChart
                        data={[
                          {
                            periodName: period1Label,
                            overburdenRemoval: items.find(i => i.id === 'mc-ob-removal')?.p1 || 0,
                            strippingRatio: items.find(i => i.id === 'mc-stripping-ratio')?.p1 || 0,
                            periodType: 'Prior',
                          },
                          {
                            periodName: period2Label,
                            overburdenRemoval: items.find(i => i.id === 'mc-ob-removal')?.p2 || 0,
                            strippingRatio: items.find(i => i.id === 'mc-stripping-ratio')?.p2 || 0,
                            periodType: 'Current',
                          },
                        ]}
                        margin={{ top: 15, right: 30, left: 0, bottom: 25 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="periodName"
                          tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                          axisLine={{ stroke: '#cbd5e1' }}
                          tickLine={false}
                        />
                        <YAxis
                          yAxisId="left"
                          orientation="left"
                          tick={{ fontSize: 10, fill: '#64748b' }}
                          axisLine={{ stroke: '#cbd5e1' }}
                          tickLine={false}
                          tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(0)}k` : val.toLocaleString('id-ID')}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          domain={[0, 15]}
                          tick={{ fontSize: 10, fill: '#0284c7' }}
                          axisLine={{ stroke: '#0284c7' }}
                          tickLine={false}
                          tickFormatter={(val) => `${val}x`}
                        />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (!active || !payload || !payload.length) return null;
                            const d = payload[0].payload;
                            return (
                              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-lg text-xs min-w-[220px]">
                                <div className="font-bold text-slate-900 mb-1.5 pb-1 border-b border-slate-100 flex items-center justify-between">
                                  <span>Periode: {label}</span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                                    {d.periodType}
                                  </span>
                                </div>
                                <div className="space-y-1.5 text-slate-600 text-[11px]">
                                  <div className="flex justify-between items-center">
                                    <span className="flex items-center gap-1.5">
                                      <span className="w-2.5 h-2.5 rounded-xs bg-amber-500" />
                                      Overburden Removal:
                                    </span>
                                    <span className="font-bold text-slate-900">
                                      {d.overburdenRemoval?.toLocaleString('id-ID')} Juta BCM
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                                    <span className="flex items-center gap-1.5">
                                      <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
                                      Stripping Ratio:
                                    </span>
                                    <span className="font-bold text-sky-700">
                                      {d.strippingRatio}x
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          }}
                        />
                        <Bar
                          yAxisId="left"
                          dataKey="overburdenRemoval"
                          fill="#f59e0b"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={75}
                          name="Overburden Removal (Juta BCM)"
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="strippingRatio"
                          stroke="#0284c7"
                          strokeWidth={3}
                          dot={{ r: 6, fill: '#0284c7', strokeWidth: 2, stroke: '#ffffff' }}
                          activeDot={{ r: 8 }}
                          name="Stripping Ratio (x)"
                        />
                      </ComposedChart>
                      <div className="flex items-center justify-center gap-6 mt-3 pt-2 border-t border-slate-100 text-[11px] font-medium text-slate-600 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-xs bg-[#f59e0b]" />
                          <span>Overburden Removal (Juta BCM) [Sumbu Kiri]</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-1 bg-[#0284c7] rounded-full" />
                          <span>Stripping Ratio (x) [Sumbu Kanan]</span>
                        </div>
                      </div>
                      </>
                    ) : sec.key === 'coalMining' ? (
                      <>
                      <ComposedChart
                        data={[
                          {
                            periodName: period1Label,
                            thermalCoal: items.find(i => i.id === 'coal-thermal-vol')?.p1 || 0,
                            metCoal: items.find(i => i.id === 'coal-met-vol')?.p1 || 0,
                            asp: items.find(i => i.id === 'coal-asp')?.p1 || 0,
                            cashCost: items.find(i => i.id === 'coal-cash-cost')?.p1 || 0,
                            periodType: 'Prior',
                          },
                          {
                            periodName: period2Label,
                            thermalCoal: items.find(i => i.id === 'coal-thermal-vol')?.p2 || 0,
                            metCoal: items.find(i => i.id === 'coal-met-vol')?.p2 || 0,
                            asp: items.find(i => i.id === 'coal-asp')?.p2 || 0,
                            cashCost: items.find(i => i.id === 'coal-cash-cost')?.p2 || 0,
                            periodType: 'Current',
                          },
                        ]}
                        margin={{ top: 15, right: 30, left: 0, bottom: 25 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="periodName"
                          tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                          axisLine={{ stroke: '#cbd5e1' }}
                          tickLine={false}
                        />
                        <YAxis
                          yAxisId="left"
                          orientation="left"
                          tick={{ fontSize: 10, fill: '#64748b' }}
                          axisLine={{ stroke: '#cbd5e1' }}
                          tickLine={false}
                          tickFormatter={(val) => `${val} jt ton`}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          domain={[0, 160]}
                          tick={{ fontSize: 10, fill: '#0284c7' }}
                          axisLine={{ stroke: '#0284c7' }}
                          tickLine={false}
                          tickFormatter={(val) => `$${val}`}
                        />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (!active || !payload || !payload.length) return null;
                            const d = payload[0].payload;
                            const totalVol = (d.thermalCoal + d.metCoal).toFixed(1);
                            return (
                              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-lg text-xs min-w-[240px]">
                                <div className="font-bold text-slate-900 mb-1.5 pb-1 border-b border-slate-100 flex items-center justify-between">
                                  <span>Periode: {label}</span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                                    {d.periodType}
                                  </span>
                                </div>
                                <div className="space-y-1.5 text-slate-600 text-[11px]">
                                  <div className="text-slate-900 font-semibold">Volume Penjualan Batubara:</div>
                                  <div className="flex justify-between pl-2">
                                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-amber-500" /> Thermal Coal:</span>
                                    <span className="font-bold text-slate-900">{d.thermalCoal} Juta Ton</span>
                                  </div>
                                  <div className="flex justify-between pl-2">
                                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-[#b45309]" /> Metallurgical Coal:</span>
                                    <span className="font-bold text-slate-900">{d.metCoal} Juta Ton</span>
                                  </div>
                                  <div className="flex justify-between pl-2 pt-1 border-t border-slate-100 font-bold text-slate-900">
                                    <span>Total Konsolidasian:</span>
                                    <span>{totalVol} Juta Ton</span>
                                  </div>
                                  <div className="text-slate-900 font-semibold pt-2 border-t border-slate-100">Harga & Biaya (USD / Ton):</div>
                                  <div className="flex justify-between pl-2">
                                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-600" /> Harga Jual (ASP):</span>
                                    <span className="font-bold text-sky-700">${d.asp} / ton</span>
                                  </div>
                                  <div className="flex justify-between pl-2">
                                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Biaya Produksi:</span>
                                    <span className="font-bold text-emerald-700">${d.cashCost} / ton</span>
                                  </div>
                                </div>
                              </div>
                            );
                          }}
                        />
                        <Bar
                          yAxisId="left"
                          dataKey="thermalCoal"
                          stackId="coalVol"
                          fill="#f59e0b"
                          name="Thermal Coal (Juta Ton)"
                          maxBarSize={65}
                        />
                        <Bar
                          yAxisId="left"
                          dataKey="metCoal"
                          stackId="coalVol"
                          fill="#b45309"
                          radius={[6, 6, 0, 0]}
                          name="Metallurgical Coal (Juta Ton)"
                          maxBarSize={65}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="asp"
                          stroke="#0284c7"
                          strokeWidth={3}
                          dot={{ r: 6, fill: '#0284c7', strokeWidth: 2, stroke: '#ffffff' }}
                          activeDot={{ r: 8 }}
                          name="Harga Jual (ASP USD/Ton)"
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="cashCost"
                          stroke="#10b981"
                          strokeWidth={2.5}
                          strokeDasharray="4 4"
                          dot={{ r: 5, fill: '#10b981' }}
                          activeDot={{ r: 7 }}
                          name="Biaya Tunai Produksi (USD/Ton)"
                        />
                      </ComposedChart>
                      <div className="flex items-center justify-center gap-5 mt-3 pt-2 border-t border-slate-100 text-[11px] font-medium text-slate-600 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-xs bg-[#f59e0b]" />
                          <span>Thermal Coal</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-xs bg-[#b45309]" />
                          <span>Metallurgical Coal</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-1 bg-[#0284c7] rounded-full" />
                          <span>Harga Jual (ASP)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-1 bg-[#10b981] border border-dashed border-[#10b981] rounded-full" />
                          <span>Biaya Tunai (Cash Cost)</span>
                        </div>
                      </div>
                      </>
                    ) : sec.key === 'goldMining' ? (
                      <>
                      <ComposedChart
                        data={[
                          {
                            periodName: period1Label,
                            goldSalesVol: items.find(i => i.id === 'gold-sales-vol')?.p1 || 0,
                            goldAsp: items.find(i => i.id === 'gold-asp')?.p1 || 0,
                            periodType: 'Prior',
                          },
                          {
                            periodName: period2Label,
                            goldSalesVol: items.find(i => i.id === 'gold-sales-vol')?.p2 || 0,
                            goldAsp: items.find(i => i.id === 'gold-asp')?.p2 || 0,
                            periodType: 'Current',
                          },
                        ]}
                        margin={{ top: 15, right: 30, left: 0, bottom: 25 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="periodName"
                          tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                          axisLine={{ stroke: '#cbd5e1' }}
                          tickLine={false}
                        />
                        <YAxis
                          yAxisId="left"
                          orientation="left"
                          tick={{ fontSize: 10, fill: '#64748b' }}
                          axisLine={{ stroke: '#cbd5e1' }}
                          tickLine={false}
                          tickFormatter={(val) => `${val} k oz`}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          domain={[1500, 3000]}
                          tick={{ fontSize: 10, fill: '#0284c7' }}
                          axisLine={{ stroke: '#0284c7' }}
                          tickLine={false}
                          tickFormatter={(val) => `$${val}`}
                        />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (!active || !payload || !payload.length) return null;
                            const d = payload[0].payload;
                            return (
                              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-lg text-xs min-w-[220px]">
                                <div className="font-bold text-slate-900 mb-1.5 pb-1 border-b border-slate-100 flex items-center justify-between">
                                  <span>Periode: {label}</span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                                    {d.periodType}
                                  </span>
                                </div>
                                <div className="space-y-1.5 text-slate-600 text-[11px]">
                                  <div className="flex justify-between items-center">
                                    <span className="flex items-center gap-1.5">
                                      <span className="w-2.5 h-2.5 rounded-xs bg-amber-500" />
                                      Volume Emas (k oz):
                                    </span>
                                    <span className="font-bold text-slate-900">
                                      {d.goldSalesVol?.toLocaleString('id-ID')} k oz
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                                    <span className="flex items-center gap-1.5">
                                      <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
                                      Harga Emas (ASP):
                                    </span>
                                    <span className="font-bold text-sky-700">
                                      ${d.goldAsp} / oz
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          }}
                        />
                        <Bar
                          yAxisId="left"
                          dataKey="goldSalesVol"
                          fill="#f59e0b"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={75}
                          name="Volume Emas (k oz)"
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="goldAsp"
                          stroke="#0284c7"
                          strokeWidth={3}
                          dot={{ r: 6, fill: '#0284c7', strokeWidth: 2, stroke: '#ffffff' }}
                          activeDot={{ r: 8 }}
                          name="Rata-rata Harga Emas (USD/oz)"
                        />
                      </ComposedChart>
                      <div className="flex items-center justify-center gap-6 mt-3 pt-2 border-t border-slate-100 text-[11px] font-medium text-slate-600 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-xs bg-[#f59e0b]" />
                          <span>Volume Penjualan Emas (k oz) [Sumbu Kiri]</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-1 bg-[#0284c7] rounded-full" />
                          <span>Rata-rata Harga Emas / ASP (USD/oz) [Sumbu Kanan]</span>
                        </div>
                      </div>
                      </>
                    ) : sec.key === 'nickelMining' ? (
                      <>
                      <ComposedChart
                        data={[
                          {
                            periodName: period1Label,
                            limonite: items.find(i => i.id === 'nickel-limonite-vol')?.p1 || 0,
                            saprolite: items.find(i => i.id === 'nickel-saprolite-vol')?.p1 || 0,
                            asp: items.find(i => i.id === 'nickel-asp')?.p1 || 0,
                            periodType: 'Prior',
                          },
                          {
                            periodName: period2Label,
                            limonite: items.find(i => i.id === 'nickel-limonite-vol')?.p2 || 0,
                            saprolite: items.find(i => i.id === 'nickel-saprolite-vol')?.p2 || 0,
                            asp: items.find(i => i.id === 'nickel-asp')?.p2 || 0,
                            periodType: 'Current',
                          },
                        ]}
                        margin={{ top: 15, right: 30, left: 0, bottom: 25 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="periodName"
                          tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                          axisLine={{ stroke: '#cbd5e1' }}
                          tickLine={false}
                        />
                        <YAxis
                          yAxisId="left"
                          orientation="left"
                          tick={{ fontSize: 10, fill: '#64748b' }}
                          axisLine={{ stroke: '#cbd5e1' }}
                          tickLine={false}
                          tickFormatter={(val) => `${val} jt ton`}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          domain={[0, 25000]}
                          tick={{ fontSize: 10, fill: '#0284c7' }}
                          axisLine={{ stroke: '#0284c7' }}
                          tickLine={false}
                          tickFormatter={(val) => `$${val.toLocaleString('id-ID')}`}
                        />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (!active || !payload || !payload.length) return null;
                            const d = payload[0].payload;
                            const totalVol = (d.limonite + d.saprolite).toFixed(2);
                            return (
                              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-lg text-xs min-w-[240px]">
                                <div className="font-bold text-slate-900 mb-1.5 pb-1 border-b border-slate-100 flex items-center justify-between">
                                  <span>Periode: {label}</span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                                    {d.periodType}
                                  </span>
                                </div>
                                <div className="space-y-1.5 text-slate-600 text-[11px]">
                                  <div className="text-slate-900 font-semibold">Volume Penjualan Nikel:</div>
                                  <div className="flex justify-between pl-2">
                                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" /> Limonite (HPAL):</span>
                                    <span className="font-bold text-slate-900">{d.limonite} Juta Ton</span>
                                  </div>
                                  <div className="flex justify-between pl-2">
                                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-[#047857]" /> Saprolite (RKEF):</span>
                                    <span className="font-bold text-slate-900">{d.saprolite} Juta Ton</span>
                                  </div>
                                  <div className="flex justify-between pl-2 pt-1 border-t border-slate-100 font-bold text-slate-900">
                                    <span>Total Volume Nikel:</span>
                                    <span>{totalVol} Juta Ton</span>
                                  </div>
                                  <div className="text-slate-900 font-semibold pt-2 border-t border-slate-100">Harga Jual (ASP):</div>
                                  <div className="flex justify-between pl-2">
                                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-600" /> ASP Nikel:</span>
                                    <span className="font-bold text-sky-700">${d.asp?.toLocaleString('id-ID')} / ton</span>
                                  </div>
                                </div>
                              </div>
                            );
                          }}
                        />
                        <Bar
                          yAxisId="left"
                          dataKey="limonite"
                          stackId="nickelVol"
                          fill="#10b981"
                          name="Limonite (HPAL Juta Ton)"
                          maxBarSize={65}
                        />
                        <Bar
                          yAxisId="left"
                          dataKey="saprolite"
                          stackId="nickelVol"
                          fill="#047857"
                          radius={[6, 6, 0, 0]}
                          name="Saprolite (RKEF Juta Ton)"
                          maxBarSize={65}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="asp"
                          stroke="#0284c7"
                          strokeWidth={3}
                          dot={{ r: 6, fill: '#0284c7', strokeWidth: 2, stroke: '#ffffff' }}
                          activeDot={{ r: 8 }}
                          name="Harga Jual ASP (USD/Ton)"
                        />
                      </ComposedChart>
                      <div className="flex items-center justify-center gap-5 mt-3 pt-2 border-t border-slate-100 text-[11px] font-medium text-slate-600 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-xs bg-[#10b981]" />
                          <span>Limonite (HPAL Juta Ton)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-xs bg-[#047857]" />
                          <span>Saprolite (RKEF Juta Ton)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-1 bg-[#0284c7] rounded-full" />
                          <span>Harga Jual ASP Nikel (USD/Ton) [Sumbu Kanan]</span>
                        </div>
                      </div>
                      </>
                    ) : (
                      <BarChart
                        data={items.filter(i => !i.isHeader).map(i => ({
                          name: i.name.replace(/^[•\s↳\s]+/, '').substring(0, 32),
                          fullName: i.name,
                          unit: i.unit,
                          [period2Label]: i.p2,
                          [period1Label]: i.p1,
                          diff: i.p2 - i.p1,
                          yoy: i.p1 !== 0 ? (((i.p2 - i.p1) / i.p1) * 100).toFixed(1) + '%' : '—',
                        }))}
                        margin={{ top: 10, right: 10, left: 0, bottom: 35 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 10, fill: '#475569', fontWeight: 500 }}
                          axisLine={{ stroke: '#cbd5e1' }}
                          tickLine={false}
                          interval={0}
                          angle={-15}
                          textAnchor="end"
                          height={35}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: '#64748b' }}
                          axisLine={{ stroke: '#cbd5e1' }}
                          tickLine={false}
                          tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(0)}k` : val.toLocaleString('id-ID')}
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload || !payload.length) return null;
                            const d = payload[0].payload;
                            return (
                              <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-lg text-xs min-w-[200px]">
                                <div className="font-bold text-slate-900 mb-1 pb-1 border-b border-slate-100">
                                  {d.fullName}
                                </div>
                                <div className="space-y-1 text-slate-600 text-[11px]">
                                  <div className="flex justify-between">
                                    <span>{period2Label}:</span>
                                    <span className="font-bold text-slate-900">
                                      {d[period2Label]?.toLocaleString('id-ID')} {d.unit}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>{period1Label}:</span>
                                    <span className="font-medium text-slate-700">
                                      {d[period1Label]?.toLocaleString('id-ID')} {d.unit}
                                    </span>
                                  </div>
                                  <div className="flex justify-between pt-1 border-t border-slate-100 font-semibold">
                                    <span>Pertumbuhan:</span>
                                    <span className={d.diff >= 0 ? 'text-emerald-600' : 'text-amber-600'}>
                                      {d.diff >= 0 ? '+' : ''}{d.yoy}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          }}
                        />
                        <Bar dataKey={period2Label} fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={32} />
                        <Bar dataKey={period1Label} fill="#cbd5e1" radius={[4, 4, 0, 0]} maxBarSize={32} />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* SUMMARY TAKEAWAYS & OPERATIONAL NOTES */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Intisari Hubungan Kinerja Fisik & Laporan Keuangan (CFO Operational Takeaways)
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 font-bold text-[10px]">
              1
            </span>
            <p className="leading-relaxed">
              <strong>Construction Machinery Resilience:</strong> Meskipun unit besar pertambangan (KCMB) mengalami normalisasi pasca-rekor 2022-2023, penjualan KCMS (agro/konstruksi) dan pendapatan suku cadang &amp; servis purnajual memberikan <em>recurring cash flow</em> yang stabil dengan gross margin segmen ~22.8%.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center shrink-0 font-bold text-[10px]">
              2
            </span>
            <p className="leading-relaxed">
              <strong>PAMA Mining Contracting Power:</strong> Rekor volume overburden removal (1.250M BCM) dan produksi batubara (144M ton) berhasil mengimbangi penurunan harga batubara termal konsolidasian di pasar internasional.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-yellow-100 text-yellow-800 flex items-center justify-center shrink-0 font-bold text-[10px]">
              3
            </span>
            <p className="leading-relaxed">
              <strong>Gold Mining Windfall (Tambang Martabe):</strong> Kenaikan harga emas dunia ke level $2.380/oz memperlebar margin kas bersih (spread ASP - AISC mencapai $1.540/oz), menjadikannya kontributor laba operasional paling menguntungkan per unit.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 font-bold text-[10px]">
              4
            </span>
            <p className="leading-relaxed">
              <strong>Dampak Nilai Tukar (FX Effect):</strong> Pelemahan kurs Rupiah terhadap USD (+3.9%) menguntungkan pendapatan ekspor, sementara depresiasi Yen Jepang (JPY) membantu meringankan beban biaya impor alat berat Komatsu dari pabrikan di Jepang.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
