import React, { useState, useRef } from 'react';
import { FinancialData, RevenueSegmentItem } from '../types';
import * as XLSX from 'xlsx';
import { SAMPLE_STATEMENTS } from '../data/sampleStatements';
import { exportUntrExcelFile } from '../utils/exportUntrExcel';
import {
  X,
  Upload,
  Check,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Copy,
  Layers,
  Sparkles,
  ArrowRight,
  FileText,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: FinancialData, label1?: string, label2?: string) => void;
  onImportSegments?: (segments: RevenueSegmentItem[]) => void;
}

export function CsvImportModal({ isOpen, onClose, onImport, onImportSegments }: CsvImportModalProps) {
  if (!isOpen) return null;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'untr-preset'>('upload');
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  // Sheets handling for uploaded workbook
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [availableSheets, setAvailableSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');

  const [rawText, setRawText] = useState(`Metric,Periode 1 (2023),Periode 2 (2024)
Revenue,128583.0,134357.0
COGS,93865.0,100530.0
OPEX,7850.0,8560.0
Marketing,1350.0,1480.0
GeneralAdmin,5200.0,5620.0
Depreciation,9282.0,10153.0
OperatingCashFlow,25300.0,22100.0
AccountsReceivable,25600.0,28100.0
Inventory,14800.0,16900.0
CashEquivalents,38500.0,35200.0
TotalDebt,18400.0,21800.0`);

  const [parsedPreview, setParsedPreview] = useState<{
    data: FinancialData;
    p1: string;
    p2: string;
  } | null>(null);

  const [parsedSegmentsPreview, setParsedSegmentsPreview] = useState<RevenueSegmentItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Helper to parse matrix of strings/numbers for FinancialData
  const parseMatrixFinancialData = (rows: any[][]): { data: FinancialData; p1: string; p2: string } => {
    if (rows.length < 2) {
      throw new Error('Data harus memiliki minimal baris Header dan 1 baris metrik.');
    }

    let p1 = 'FY 2023';
    let p2 = 'FY 2024';

    // Find header
    let headerIdx = 0;
    for (let i = 0; i < Math.min(rows.length, 5); i++) {
      const rowStr = (rows[i] || []).join(' ').toLowerCase();
      if (rowStr.includes('fy') || rowStr.includes('periode') || rowStr.includes('202') || rowStr.includes('metrik') || rowStr.includes('pos')) {
        headerIdx = i;
        break;
      }
    }

    const header = (rows[headerIdx] || []).map((cell: any) => String(cell || '').trim());
    if (header.length >= 3) {
      if (header[1]) p1 = header[1];
      if (header[2]) p2 = header[2];
    }

    const parsed: Partial<FinancialData> = {};

    for (let i = headerIdx + 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length < 2) continue;

      const rawKey = String(row[0] || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const val1 = typeof row[1] === 'number' ? row[1] : parseFloat(String(row[1]).replace(/[^0-9.-]/g, '')) || 0;
      const val2 = typeof row[2] === 'number' ? row[2] : parseFloat(String(row[2]).replace(/[^0-9.-]/g, '')) || 0;

      if (rawKey.includes('rev') || rawKey.includes('penjualan') || rawKey.includes('pendapatan') || rawKey.includes('omset') || rawKey.includes('sales')) {
        parsed.revenueP1 = val1;
        parsed.revenueP2 = val2;
      } else if (rawKey.includes('cog') || rawKey.includes('pokok') || rawKey.includes('hpp') || rawKey.includes('costofgoods')) {
        parsed.cogsP1 = val1;
        parsed.cogsP2 = val2;
      } else if (rawKey.includes('opex') || rawKey.includes('operasional') || rawKey.includes('overhead') || rawKey.includes('operatingexp')) {
        parsed.opexP1 = val1;
        parsed.opexP2 = val2;
      } else if (rawKey.includes('market') || rawKey.includes('iklan') || rawKey.includes('promosi') || rawKey.includes('salesmarketing')) {
        parsed.marketingP1 = val1;
        parsed.marketingP2 = val2;
      } else if (rawKey.includes('admin') || rawKey.includes('umum') || rawKey.includes('ga') || rawKey.includes('sga')) {
        parsed.generalAdminP1 = val1;
        parsed.generalAdminP2 = val2;
      } else if (rawKey.includes('rd') || rawKey.includes('riset') || rawKey.includes('pengembangan')) {
        parsed.rdP1 = val1;
        parsed.rdP2 = val2;
      } else if (rawKey.includes('depr') || rawKey.includes('amort') || rawKey.includes('penyusutan')) {
        parsed.deprAmortP1 = val1;
        parsed.deprAmortP2 = val2;
      } else if (rawKey.includes('cashflow') || rawKey.includes('ocf') || rawKey.includes('aruskas') || rawKey.includes('operatingcash')) {
        parsed.operatingCashFlowP1 = val1;
        parsed.operatingCashFlowP2 = val2;
      } else if (rawKey.includes('receivable') || rawKey.includes('piutang') || rawKey.includes('ar')) {
        parsed.accountsReceivableP1 = val1;
        parsed.accountsReceivableP2 = val2;
      } else if (rawKey.includes('invent') || rawKey.includes('persediaan') || rawKey.includes('stok')) {
        parsed.inventoryP1 = val1;
        parsed.inventoryP2 = val2;
      } else if (rawKey.includes('cash') || rawKey.includes('kas') || rawKey.includes('setarakas')) {
        parsed.cashEquivalentsP1 = val1;
        parsed.cashEquivalentsP2 = val2;
      } else if (rawKey.includes('debt') || rawKey.includes('utang') || rawKey.includes('liabilitas') || rawKey.includes('pinjaman')) {
        parsed.totalDebtP1 = val1;
        parsed.totalDebtP2 = val2;
      } else if (rawKey.includes('bunga') || rawKey.includes('interest')) {
        parsed.interestExpenseP1 = val1;
        parsed.interestExpenseP2 = val2;
      } else if (rawKey.includes('pajak') || rawKey.includes('tax')) {
        parsed.taxP1 = val1;
        parsed.taxP2 = val2;
      }
    }

    if (!parsed.revenueP1 && !parsed.revenueP2) {
      throw new Error('Kolom atau baris Pendapatan (Revenue) tidak ditemukan dalam sheet.');
    }

    const finalData: FinancialData = {
      revenueP1: parsed.revenueP1 || 128583,
      revenueP2: parsed.revenueP2 || 134357,
      cogsP1: parsed.cogsP1 || 93865,
      cogsP2: parsed.cogsP2 || 100530,
      opexP1: parsed.opexP1 || 7850,
      opexP2: parsed.opexP2 || 8560,
      marketingP1: parsed.marketingP1,
      marketingP2: parsed.marketingP2,
      generalAdminP1: parsed.generalAdminP1,
      generalAdminP2: parsed.generalAdminP2,
      rdP1: parsed.rdP1,
      rdP2: parsed.rdP2,
      deprAmortP1: parsed.deprAmortP1,
      deprAmortP2: parsed.deprAmortP2,
      interestExpenseP1: parsed.interestExpenseP1,
      interestExpenseP2: parsed.interestExpenseP2,
      taxP1: parsed.taxP1,
      taxP2: parsed.taxP2,
      operatingCashFlowP1: parsed.operatingCashFlowP1,
      operatingCashFlowP2: parsed.operatingCashFlowP2,
      accountsReceivableP1: parsed.accountsReceivableP1,
      accountsReceivableP2: parsed.accountsReceivableP2,
      inventoryP1: parsed.inventoryP1,
      inventoryP2: parsed.inventoryP2,
      cashEquivalentsP1: parsed.cashEquivalentsP1,
      cashEquivalentsP2: parsed.cashEquivalentsP2,
      totalDebtP1: parsed.totalDebtP1,
      totalDebtP2: parsed.totalDebtP2,
    };

    return { data: finalData, p1, p2 };
  };

  // Helper to parse Revenue Segment matrix
  const parseMatrixRevenueSegments = (rows: any[][]): RevenueSegmentItem[] => {
    // Find header row with segmen / segment
    let headerIdx = -1;
    for (let i = 0; i < Math.min(rows.length, 6); i++) {
      const rowStr = (rows[i] || []).join(' ').toLowerCase();
      if (rowStr.includes('segmen') || rowStr.includes('segment') || rowStr.includes('lini') || rowStr.includes('business')) {
        headerIdx = i;
        break;
      }
    }

    if (headerIdx === -1) headerIdx = 0;

    const colors = ['#0284c7', '#eab308', '#475569', '#f59e0b', '#ec4899', '#10b981', '#8b5cf6'];
    const segments: RevenueSegmentItem[] = [];

    for (let i = headerIdx + 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length < 2) continue;

      const firstCol = String(row[0] || '').trim();
      const secondCol = String(row[1] || '').trim();

      // Skip total row or empty
      if (
        firstCol.toLowerCase().includes('total') ||
        secondCol.toLowerCase().includes('total') ||
        (!firstCol && !secondCol)
      ) {
        continue;
      }

      // Detect column indices
      let segName = firstCol;
      let category = 'Unit Operasi';
      let revP1 = 0;
      let revP2 = 0;
      let grossMarginPct = 25;
      let desc = '';

      if (row.length >= 4 && (firstCol.toLowerCase().startsWith('untr') || firstCol.toLowerCase().startsWith('seg') || !isNaN(Number(firstCol)))) {
        // format: [id, name, category, p1, p2, ...]
        segName = secondCol;
        category = String(row[2] || 'Unit Operasi');
        revP1 = typeof row[3] === 'number' ? row[3] : parseFloat(String(row[3]).replace(/[^0-9.-]/g, '')) || 0;
        revP2 = typeof row[4] === 'number' ? row[4] : parseFloat(String(row[4]).replace(/[^0-9.-]/g, '')) || 0;
        grossMarginPct = typeof row[7] === 'number' ? row[7] : parseFloat(String(row[7]).replace(/[^0-9.-]/g, '')) || 25;
        desc = String(row[8] || '');
      } else {
        // standard format: [name, p1, p2, ...]
        revP1 = typeof row[1] === 'number' ? row[1] : parseFloat(String(row[1]).replace(/[^0-9.-]/g, '')) || 0;
        revP2 = typeof row[2] === 'number' ? row[2] : parseFloat(String(row[2]).replace(/[^0-9.-]/g, '')) || 0;
        if (row[3] !== undefined) {
          grossMarginPct = typeof row[3] === 'number' ? row[3] : parseFloat(String(row[3]).replace(/[^0-9.-]/g, '')) || 25;
        }
      }

      if (segName && (revP1 > 0 || revP2 > 0)) {
        segments.push({
          id: `seg-import-${segments.length + 1}`,
          name: segName,
          category,
          revenueP1: revP1,
          revenueP2: revP2,
          grossMarginPctP2: grossMarginPct,
          color: colors[segments.length % colors.length],
          description: desc || undefined,
        });
      }
    }

    if (segments.length === 0) {
      throw new Error('Tidak ditemukan baris data segmen yang valid dalam sheet ini.');
    }

    return segments;
  };

  // Process a selected sheet from the workbook
  const processSheet = (wb: XLSX.WorkBook, sheetName: string) => {
    setSelectedSheet(sheetName);
    setError(null);
    const sheet = wb.Sheets[sheetName];
    if (!sheet) return;

    const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    const isSegmentSheet = sheetName.toLowerCase().includes('segment') || sheetName.toLowerCase().includes('segmen');

    if (isSegmentSheet) {
      try {
        const parsedSegs = parseMatrixRevenueSegments(rows);
        setParsedSegmentsPreview(parsedSegs);
        setParsedPreview(null);
      } catch (err: any) {
        setError(err.message || 'Gagal membaca segmen pendapatan.');
      }
    } else {
      try {
        const res = parseMatrixFinancialData(rows);
        setParsedPreview(res);
        setParsedSegmentsPreview(null);
      } catch (err: any) {
        setError(err.message || 'Gagal membaca laporan keuangan.');
      }
    }
  };

  // Handle uploaded file (Excel or CSV)
  const handleFileUpload = async (file: File) => {
    try {
      setError(null);
      setFileName(file.name);
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      setWorkbook(wb);
      setAvailableSheets(wb.SheetNames);

      // Prefer sheet 'Segment - Revenue' if present
      const preferred =
        wb.SheetNames.find((s) => s.toLowerCase().includes('segment - revenue')) ||
        wb.SheetNames.find((s) => s.toLowerCase().includes('segment')) ||
        wb.SheetNames[0];

      processSheet(wb, preferred);
    } catch (err: any) {
      setError(err.message || 'Gagal membaca file spreadsheet.');
      setParsedPreview(null);
      setParsedSegmentsPreview(null);
    }
  };

  // Handle parse from raw text
  const handleParseText = () => {
    try {
      setError(null);
      const lines = rawText.trim().split('\n');
      const matrix = lines.map((l) => l.split(/[\t,;]/).map((c) => c.trim().replace(/^["']|["']$/g, '')));
      const res = parseMatrixFinancialData(matrix);
      setParsedPreview(res);
      setParsedSegmentsPreview(null);
    } catch (err: any) {
      setError(err.message || 'Format teks tidak valid.');
      setParsedPreview(null);
    }
  };

  // Drag & Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Load UNTR preset directly
  const handleLoadUntrPreset = () => {
    const untr = SAMPLE_STATEMENTS.find((s) => s.id === 'case-untr') || SAMPLE_STATEMENTS[0];
    if (untr.revenueSegments && onImportSegments) {
      onImportSegments(untr.revenueSegments);
    }
    onImport(untr.data, untr.period1Label, untr.period2Label);
    onClose();
  };

  // Apply parsed data
  const handleApply = () => {
    if (parsedSegmentsPreview && onImportSegments) {
      onImportSegments(parsedSegmentsPreview);
      onClose();
    } else if (parsedPreview) {
      onImport(parsedPreview.data, parsedPreview.p1, parsedPreview.p2);
      onClose();
    } else {
      handleParseText();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">
                Import Source Data: "Data Financial UNTR"
              </h3>
              <p className="text-[11px] text-slate-400">
                Pilih atau unggah file Excel/CSV, lalu pilih sheet <strong>Segment - Revenue</strong> atau <strong>Profit and Loss</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 sm:px-6 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'upload'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File (.xlsx / .csv)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('untr-preset')}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'untr-preset'
                ? 'border-amber-600 text-amber-900 bg-amber-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Data Financial UNTR (Resmi)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'paste'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Paste Teks / CSV</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: UPLOAD */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-amber-500 bg-amber-50/30'
                    : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />
                <div className="w-12 h-12 rounded-full bg-white shadow-2xs border border-slate-200 flex items-center justify-center mx-auto mb-3 text-slate-700">
                  <Upload className="w-5 h-5 text-slate-600" />
                </div>
                <p className="text-xs font-bold text-slate-800">
                  {fileName ? fileName : 'Klik atau drag-and-drop file Excel / CSV di sini'}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Mendukung .xlsx, .xls, .csv dengan multi-sheet otomatis
                </p>
              </div>

              {/* Sheet selector if workbook has sheets */}
              {availableSheets.length > 0 && workbook && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-blue-600" />
                      Pilih Sheet dari File Spreadsheet:
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {availableSheets.length} sheet ditemukan
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {availableSheets.map((s) => {
                      const isSeg = s.toLowerCase().includes('segment');
                      const isSel = selectedSheet === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => processSheet(workbook, s)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                            isSel
                              ? 'bg-slate-900 text-white shadow-xs'
                              : isSeg
                              ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {isSeg && <Sparkles className="w-3 h-3 text-amber-500" />}
                          <span>{s}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Download UNTR Official Workbook */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100/70 border border-slate-200 text-xs">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span className="text-slate-700 font-medium">
                    Belum punya filenya? Unduh berkas lengkap <strong>Data Financial UNTR.xlsx</strong>:
                  </span>
                </div>
                <button
                  type="button"
                  onClick={exportUntrExcelFile}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span>Download .xlsx</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: UNTR OFFICIAL PRESET */}
          {activeTab === 'untr-preset' && (
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Preset Langsung: PT United Tractors Tbk (UNTR)
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    Data resmi yang diambil dari sheet <strong>Segment - Revenue</strong> berkas Data Financial UNTR:
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-amber-200/80 p-3 space-y-2 text-xs">
                <div className="text-[10px] font-semibold text-amber-800 uppercase tracking-wide">
                  (Dalam Miliar Rupiah)
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Total Revenue FY 2023:</span>
                    <strong className="text-slate-900 font-mono">128.583</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Total Revenue FY 2024:</span>
                    <strong className="text-slate-900 font-mono">134.357 (+4.5%)</strong>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-2">
                  <span className="text-slate-400 text-[10px] block uppercase font-bold mb-1">
                    6 Segmen Usaha Terdaftar (Sheet: Segment - Revenue):
                  </span>
                  <ul className="text-[11px] text-slate-700 space-y-1">
                    <li>1. Kontraktor Penambangan (PAMA & KPP) — <strong>58.043 (43.2%)</strong></li>
                    <li>2. Mesin Konstruksi (Komatsu, Scania) — <strong>37.294 (27.8%)</strong></li>
                    <li>3. Pertambangan Batubara (Turangga Resources) — <strong>26.013 (19.4%)</strong></li>
                    <li>4. Pertambangan Emas (Martabe & SJR) — <strong>9.891 (+90.2% YoY)</strong></li>
                    <li>5. Industri Konstruksi (ACSET) — <strong>2.686 (2.0%)</strong></li>
                    <li>6. Energi Terbarukan (EPN) — <strong>430 (0.3%)</strong></li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={exportUntrExcelFile}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Download Excel File</span>
                </button>
                <button
                  type="button"
                  onClick={handleLoadUntrPreset}
                  className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Muat Sheet Segment - Revenue UNTR Sekarang</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: PASTE */}
          {activeTab === 'paste' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs text-slate-600">
                <span>Tempelkan data CSV / Tab-separated:</span>
                <button
                  type="button"
                  onClick={handleParseText}
                  className="text-blue-600 hover:text-blue-800 font-bold text-[11px]"
                >
                  Parse Teks
                </button>
              </div>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={8}
                className="w-full text-xs font-mono p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="Metric,2023,2024..."
              />
            </div>
          )}

          {/* PARSED PREVIEW FOR SEGMENTS */}
          {parsedSegmentsPreview && (
            <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  {parsedSegmentsPreview.length} Segmen Berhasil Dideteksi dari Sheet: "{selectedSheet}"
                </span>
              </div>
              <div className="max-h-36 overflow-y-auto space-y-1">
                {parsedSegmentsPreview.map((s, idx) => (
                  <div
                    key={s.id || idx}
                    className="flex items-center justify-between text-xs bg-white p-2 rounded border border-blue-100"
                  >
                    <span className="font-semibold text-slate-800">{s.name}</span>
                    <div className="flex items-center gap-3 font-mono text-[11px]">
                      <span className="text-slate-500">P1: {s.revenueP1.toLocaleString()}</span>
                      <span className="font-bold text-slate-900">P2: {s.revenueP2.toLocaleString()}</span>
                      <span className="text-emerald-700 font-semibold">{s.grossMarginPctP2}% Margin</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PARSED PREVIEW FOR FINANCIAL DATA */}
          {parsedPreview && (
            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Metrik Laporan Keuangan Terdeteksi ({parsedPreview.p1} vs {parsedPreview.p2})
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs bg-white p-2.5 rounded-lg border border-emerald-100 font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">Revenue P1:</span>
                  <strong>{parsedPreview.data.revenueP1.toLocaleString()}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Revenue P2:</span>
                  <strong>{parsedPreview.data.revenueP2.toLocaleString()}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">COGS P2:</span>
                  <strong>{parsedPreview.data.cogsP2.toLocaleString()}</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleApply}
            disabled={!parsedPreview && !parsedSegmentsPreview && activeTab !== 'untr-preset'}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <span>Terapkan Data ke CFA Desk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
