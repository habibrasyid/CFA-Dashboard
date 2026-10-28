import * as XLSX from 'xlsx';
import { SAMPLE_STATEMENTS } from '../data/sampleStatements';
import { UNTR_PERIOD_PRESETS } from '../data/untrPeriods';

export function exportUntrExcelFile() {
  const untr = SAMPLE_STATEMENTS.find((s) => s.id === 'case-untr') || SAMPLE_STATEMENTS[0];

  const wb = XLSX.utils.book_new();

  // 1. Sheet: Segment - Revenue (Tahunan Penuh & Multi-Periode)
  const segmentData = [
    ['PT UNITED TRACTORS TBK (UNTR) - LAPORAN SEGMEN USAHA'],
    ['Sumber: Data Financial UNTR (Sheet: Segment - Revenue)'],
    ['Satuan: Rp Miliar'],
    [],
    [
      'ID Segmen',
      'Nama Segmen Usaha',
      'Entitas / Merek',
      'FY 2022',
      'FY 2023',
      'FY 2024',
      'Q1 2024',
      '1H 2024',
      '9M 2024',
      'YoY 2024 (%)',
      'Bauran 2024 (%)',
      'Gross Margin Est (%)',
      'Catatan Operasional',
    ],
  ];

  // Map values across presets
  const fy24Preset = UNTR_PERIOD_PRESETS.find((p) => p.id === 'fy-2024-vs-2023');
  const fy23Preset = UNTR_PERIOD_PRESETS.find((p) => p.id === 'fy-2023-vs-2022');
  const q1Preset = UNTR_PERIOD_PRESETS.find((p) => p.id === 'q1-2024-vs-2023');
  const h1Preset = UNTR_PERIOD_PRESETS.find((p) => p.id === '1h-2024-vs-2023');
  const m9Preset = UNTR_PERIOD_PRESETS.find((p) => p.id === '9m-2024-vs-2023');

  fy24Preset?.segments.forEach((seg, idx) => {
    const fy22Val = fy23Preset?.segments[idx]?.revenueP1 || 0;
    const fy23Val = seg.revenueP1;
    const fy24Val = seg.revenueP2;
    const q1Val = q1Preset?.segments[idx]?.revenueP2 || 0;
    const h1Val = h1Preset?.segments[idx]?.revenueP2 || 0;
    const m9Val = m9Preset?.segments[idx]?.revenueP2 || 0;

    const yoy = ((fy24Val - fy23Val) / (fy23Val || 1)) * 100;
    const mix = (fy24Val / (fy24Preset.totalRevenueP2 || 1)) * 100;

    segmentData.push([
      seg.id,
      seg.name,
      seg.category || '-',
      fy22Val.toString(),
      fy23Val.toString(),
      fy24Val.toString(),
      q1Val.toString(),
      h1Val.toString(),
      m9Val.toString(),
      yoy.toFixed(1) + '%',
      mix.toFixed(1) + '%',
      (seg.grossMarginPctP2 || 25).toFixed(1) + '%',
      seg.description || '',
    ]);
  });

  const totalYoY = (((fy24Preset?.totalRevenueP2 || 134357) - (fy24Preset?.totalRevenueP1 || 128583)) / (fy24Preset?.totalRevenueP1 || 128583)) * 100;
  segmentData.push([
    'TOTAL',
    'Total Pendapatan Bersih Segmen Konsolidasian',
    'PT United Tractors Tbk',
    (fy23Preset?.totalRevenueP1 || 123605).toString(),
    (fy24Preset?.totalRevenueP1 || 128583).toString(),
    (fy24Preset?.totalRevenueP2 || 134357).toString(),
    (q1Preset?.totalRevenueP2 || 32410).toString(),
    (h1Preset?.totalRevenueP2 || 64510).toString(),
    (m9Preset?.totalRevenueP2 || 99550).toString(),
    totalYoY.toFixed(1) + '%',
    '100.0%',
    '25.2%',
    'Laporan Resmi Segmen Pendapatan UNTR',
  ]);

  const wsSegment = XLSX.utils.aoa_to_sheet(segmentData);
  XLSX.utils.book_append_sheet(wb, wsSegment, 'Segment - Revenue');

  // 2. Sheet: Segment - Kuartalan & Interim
  const interimData = [
    ['PT UNITED TRACTORS TBK - DETAIL SEGMEN KUARTALAN & INTERIM'],
    ['Satuan: Rp Miliar'],
    [],
    ['Segmen Usaha', 'Q1 2023', 'Q1 2024', '1H 2023', '1H 2024', '9M 2023', '9M 2024', 'FY 2023', 'FY 2024'],
  ];

  fy24Preset?.segments.forEach((seg, idx) => {
    interimData.push([
      seg.name,
      (q1Preset?.segments[idx]?.revenueP1 || 0).toString(),
      (q1Preset?.segments[idx]?.revenueP2 || 0).toString(),
      (h1Preset?.segments[idx]?.revenueP1 || 0).toString(),
      (h1Preset?.segments[idx]?.revenueP2 || 0).toString(),
      (m9Preset?.segments[idx]?.revenueP1 || 0).toString(),
      (m9Preset?.segments[idx]?.revenueP2 || 0).toString(),
      seg.revenueP1.toString(),
      seg.revenueP2.toString(),
    ]);
  });

  const wsInterim = XLSX.utils.aoa_to_sheet(interimData);
  XLSX.utils.book_append_sheet(wb, wsInterim, 'Segment - Kuartalan');

  // 3. Sheet: Profit and Loss
  const pnlData = [
    ['PT UNITED TRACTORS TBK - LAPORAN LABA RUGI KONSOLIDASIAN'],
    ['Satuan: Rp Miliar'],
    [],
    ['Pos Keuangan', 'FY 2023', 'FY 2024', 'Pertumbuhan YoY (%)'],
    ['Pendapatan Bersih (Revenue)', untr.data.revenueP1, untr.data.revenueP2, (((untr.data.revenueP2 - untr.data.revenueP1) / untr.data.revenueP1) * 100).toFixed(1) + '%'],
    ['Beban Pokok Pendapatan (COGS)', untr.data.cogsP1, untr.data.cogsP2, (((untr.data.cogsP2 - untr.data.cogsP1) / untr.data.cogsP1) * 100).toFixed(1) + '%'],
    ['Laba Kotor (Gross Profit)', untr.data.revenueP1 - untr.data.cogsP1, untr.data.revenueP2 - untr.data.cogsP2, ''],
    ['Beban Usaha Operasional (OPEX)', untr.data.opexP1, untr.data.opexP2, ''],
    ['Beban Pemasaran', untr.data.marketingP1 || 0, untr.data.marketingP2 || 0, ''],
    ['Beban Umum dan Administrasi', untr.data.generalAdminP1 || 0, untr.data.generalAdminP2 || 0, ''],
    ['Laba Usaha / Operasi (EBIT)', untr.data.revenueP1 - untr.data.cogsP1 - untr.data.opexP1, untr.data.revenueP2 - untr.data.cogsP2 - untr.data.opexP2, ''],
    ['Penyusutan dan Amortisasi', untr.data.deprAmortP1 || 0, untr.data.deprAmortP2 || 0, ''],
    ['Biaya Bunga Pinjaman', untr.data.interestExpenseP1 || 0, untr.data.interestExpenseP2 || 0, ''],
    ['Beban Pajak Penghasilan', untr.data.taxP1 || 0, untr.data.taxP2 || 0, ''],
    ['Arus Kas Operasi (OCF)', untr.data.operatingCashFlowP1 || 0, untr.data.operatingCashFlowP2 || 0, ''],
  ];

  const wsPnl = XLSX.utils.aoa_to_sheet(pnlData);
  XLSX.utils.book_append_sheet(wb, wsPnl, 'Profit and Loss');

  // 4. Sheet: Balance Sheet
  const bsData = [
    ['PT UNITED TRACTORS TBK - LAPORAN POSISI KEUANGAN (NERACA)'],
    ['Satuan: Rp Miliar'],
    [],
    ['Pos Neraca (Balance Sheet)', 'FY 2023', 'FY 2024'],
    ['ASET LANCAR (CURRENT ASSETS)', '', ''],
    ['Kas dan Setara Kas', untr.balanceSheet?.cashEquivalentsP1 || 0, untr.balanceSheet?.cashEquivalentsP2 || 0],
    ['Piutang Usaha (Accounts Receivable)', untr.balanceSheet?.accountsReceivableP1 || 0, untr.balanceSheet?.accountsReceivableP2 || 0],
    ['Persediaan (Inventories)', untr.balanceSheet?.inventoryP1 || 0, untr.balanceSheet?.inventoryP2 || 0],
    ['Aset Lancar Lainnya', untr.balanceSheet?.otherCurrentAssetsP1 || 0, untr.balanceSheet?.otherCurrentAssetsP2 || 0],
    ['ASET TIDAK LANCAR (NON-CURRENT ASSETS)', '', ''],
    ['Aset Tetap (Property, Plant & Equipment - Net)', untr.balanceSheet?.ppeP1 || 0, untr.balanceSheet?.ppeP2 || 0],
    ['Aset Takberwujud & Goodwill', untr.balanceSheet?.intangiblesP1 || 0, untr.balanceSheet?.intangiblesP2 || 0],
    ['Aset Tidak Lancar Lainnya', untr.balanceSheet?.otherNonCurrentAssetsP1 || 0, untr.balanceSheet?.otherNonCurrentAssetsP2 || 0],
    ['LIABILITAS JANGKA PENDEK', '', ''],
    ['Utang Usaha (Accounts Payable)', untr.balanceSheet?.accountsPayableP1 || 0, untr.balanceSheet?.accountsPayableP2 || 0],
    ['Utang Bank Jangka Pendek', untr.balanceSheet?.shortTermDebtP1 || 0, untr.balanceSheet?.shortTermDebtP2 || 0],
    ['Beban Akrual & Lainnya', untr.balanceSheet?.accruedLiabilitiesP1 || 0, untr.balanceSheet?.accruedLiabilitiesP2 || 0],
    ['LIABILITAS JANGKA PANJANG', '', ''],
    ['Utang Jangka Panjang', untr.balanceSheet?.longTermDebtP1 || 0, untr.balanceSheet?.longTermDebtP2 || 0],
    ['EKUITAS PEMEGANG SAHAM', '', ''],
    ['Modal Saham', untr.balanceSheet?.shareCapitalP1 || 0, untr.balanceSheet?.shareCapitalP2 || 0],
    ['Saldo Laba (Retained Earnings)', untr.balanceSheet?.retainedEarningsP1 || 0, untr.balanceSheet?.retainedEarningsP2 || 0],
  ];

  const wsBs = XLSX.utils.aoa_to_sheet(bsData);
  XLSX.utils.book_append_sheet(wb, wsBs, 'Balance Sheet');

  // 5. Sheet: Data Operational (Kinerja Fisik & Valas)
  const op = untr.operationalData || {
    constructionMachinery: [],
    miningContracting: [],
    coalMining: [],
    goldMining: [],
    kurs: [],
    machineryBrands: [],
  };

  const opData: (string | number)[][] = [
    ['PT UNITED TRACTORS TBK - LAPORAN DATA OPERASIONAL (OPERATIONAL DATA)'],
    ['Sumber: Data Financial & Operational UNTR'],
    [],
    ['Kategori / Metrik Operasional', 'Satuan', 'FY 2024 (Current)', 'FY 2023 (Prior)', 'Perubahan (Δ)', 'Pertumbuhan YoY (%)', 'Catatan Penggerak Lapangan'],
    ['1. CONSTRUCTION MACHINERY (MESIN KONSTRUKSI)', '', '', '', '', '', ''],
  ];

  op.constructionMachinery?.forEach((m) => {
    if (m.isHeader) {
      opData.push([m.name, '', '', '', '', '', '']);
    } else {
      const diff = m.p2 - m.p1;
      const yoy = m.p1 !== 0 ? (((m.p2 - m.p1) / m.p1) * 100).toFixed(1) + '%' : '—';
      opData.push([m.name, m.unit, m.p2, m.p1, diff, yoy, m.notes || '']);
    }
  });

  // Export Machinery by Brand breakdown if available
  if (op.machineryBrands && op.machineryBrands.length > 0) {
    opData.push(
      [],
      ['RINCIAN PENJUALAN MESIN KONSTRUKSI MENURUT BRAND & MODEL', '', '', '', '', '', ''],
      ['Brand / Sub-Brand', 'Kode', 'FY 2024 (Unit)', 'FY 2023 (Unit)', 'Perubahan (Δ)', 'YoY (%)', 'Keterangan Sektor / Breakdown']
    );
    op.machineryBrands.forEach((b) => {
      const diff = b.p2 - b.p1;
      const yoy = b.p1 !== 0 ? (((b.p2 - b.p1) / b.p1) * 100).toFixed(1) + '%' : '—';
      const label = b.isSubBrand ? `   ↳ ${b.brandName} (${b.fullName})` : b.brandName;
      opData.push([label, b.code, b.p2, b.p1, diff, yoy, b.description || '']);
    });
  }

  opData.push([], ['2. MINING CONTRACTING (KONTRAKTOR PENAMBANGAN - PAMA)', '', '', '', '', '', '']);
  op.miningContracting?.forEach((m) => {
    const diff = m.p2 - m.p1;
    const yoy = m.p1 !== 0 ? (((m.p2 - m.p1) / m.p1) * 100).toFixed(1) + '%' : '—';
    opData.push([m.name, m.unit, m.p2, m.p1, diff, yoy, m.notes || '']);
  });

  opData.push([], ['3. COAL MINING (PERTAMBANGAN BATUBARA - TTA)', '', '', '', '', '', '']);
  op.coalMining?.forEach((m) => {
    const diff = m.p2 - m.p1;
    const yoy = m.p1 !== 0 ? (((m.p2 - m.p1) / m.p1) * 100).toFixed(1) + '%' : '—';
    opData.push([m.name, m.unit, m.p2, m.p1, diff, yoy, m.notes || '']);
  });

  opData.push([], ['4. GOLD MINING (PERTAMBANGAN EMAS - AGINCOURT / MARTABE)', '', '', '', '', '', '']);
  op.goldMining?.forEach((m) => {
    const diff = m.p2 - m.p1;
    const yoy = m.p1 !== 0 ? (((m.p2 - m.p1) / m.p1) * 100).toFixed(1) + '%' : '—';
    opData.push([m.name, m.unit, m.p2, m.p1, diff, yoy, m.notes || '']);
  });

  opData.push([], ['5. KURS & NILAI TUKAR (FOREIGN EXCHANGE RATES)', '', '', '', '', '', '']);
  op.kurs?.forEach((m) => {
    const diff = m.p2 - m.p1;
    const yoy = m.p1 !== 0 ? (((m.p2 - m.p1) / m.p1) * 100).toFixed(1) + '%' : '—';
    opData.push([m.name, m.unit, m.p2, m.p1, diff, yoy, m.notes || '']);
  });

  const wsOp = XLSX.utils.aoa_to_sheet(opData);
  XLSX.utils.book_append_sheet(wb, wsOp, 'Data Operational');

  // Trigger download
  XLSX.writeFile(wb, 'Data Financial UNTR.xlsx');
}
