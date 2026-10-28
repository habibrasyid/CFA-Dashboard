import { RevenueSegmentItem, FinancialData, BalanceSheetData } from '../types';

export interface SegmentPeriodPreset {
  id: string;
  name: string;
  category: 'tahunan' | 'kuartalan' | 'semesteran';
  period1Label: string;
  period2Label: string;
  totalRevenueP1: number;
  totalRevenueP2: number;
  segments: RevenueSegmentItem[];
  note: string;
}

export const UNTR_PERIOD_PRESETS: SegmentPeriodPreset[] = [
  {
    id: 'fy-2024-vs-2023',
    name: 'FY 2024 vs FY 2023 (Tahunan Penuh)',
    category: 'tahunan',
    period1Label: 'FY 2023',
    period2Label: 'FY 2024',
    totalRevenueP1: 128583.0,
    totalRevenueP2: 134357.0,
    note: 'Laporan tahunan penuh. Penurunan batubara (-14.8%) terkompensasi ekspansi jasa penambangan (+7.5%) dan lonjakan emas (+90.2%).',
    segments: [
      {
        id: 'untr-seg-1',
        name: 'Kontraktor Penambangan (Mining Contracting)',
        category: 'PAMA & KPP Mining',
        revenueP1: 53978.0,
        revenueP2: 58043.0,
        grossMarginPctP2: 24.5,
        color: '#0284c7',
        description: 'Jasa pemindahan tanah (OB 1.217 jt bcm) & produksi 148 jt ton batubara klien',
      },
      {
        id: 'untr-seg-2',
        name: 'Mesin Konstruksi (Construction Machinery)',
        category: 'Komatsu, Scania & UD Trucks',
        revenueP1: 36634.0,
        revenueP2: 37294.0,
        grossMarginPctP2: 22.8,
        color: '#eab308',
        description: 'Penjualan 4.420 unit alat berat Komatsu, suku cadang dan servis purnajual',
      },
      {
        id: 'untr-seg-3',
        name: 'Pertambangan Batubara (Coal Mining)',
        category: 'Turangga Resources',
        revenueP1: 30526.0,
        revenueP2: 26013.0,
        grossMarginPctP2: 28.0,
        color: '#475569',
        description: 'Penjualan 13,1 jt ton batubara konsolidasian (termasuk 3,2 jt ton batubara metalurgi)',
      },
      {
        id: 'untr-seg-4',
        name: 'Pertambangan Emas & Mineral Lainnya',
        category: 'Agincourt (Martabe) & SJR',
        revenueP1: 5200.0,
        revenueP2: 9891.0,
        grossMarginPctP2: 54.2,
        color: '#f59e0b',
        description: 'Penjualan setara 232 ribu ons emas dari Tambang Martabe (PTAR) & SJR (+90.2% YoY)',
      },
      {
        id: 'untr-seg-5',
        name: 'Industri Konstruksi (Construction Industry)',
        category: 'PT Acset Indonusa Tbk (ACSET)',
        revenueP1: 2245.0,
        revenueP2: 2686.0,
        grossMarginPctP2: 5.8,
        color: '#ec4899',
        description: 'Jasa kontraktor sipil pondasi spesialis dan infrastruktur jalan tol',
      },
      {
        id: 'untr-seg-6',
        name: 'Energi Terbarukan & Lain-lain (Renewable Energy)',
        category: 'Energia Prima Nusantara (EPN)',
        revenueP1: 0.0,
        revenueP2: 430.0,
        grossMarginPctP2: 36.0,
        color: '#10b981',
        description: 'Pembangkit Listrik Tenaga Minihidro (PLTMH), Rooftop Solar PV & Geothermal',
      },
    ],
  },
  {
    id: '9m-2024-vs-2023',
    name: '9M 2024 vs 9M 2023 (Kuartal 3 / 9 Bulan YTD)',
    category: 'kuartalan',
    period1Label: '9M 2023',
    period2Label: '9M 2024',
    totalRevenueP1: 97590.0,
    totalRevenueP2: 99550.0,
    note: 'Kinerja kumulatif 9 bulan: Pendapatan tumbuh +2.0% didorong segmen emas (+66.3%) dan kontraktor penambangan (+9.5%).',
    segments: [
      {
        id: 'untr-seg-1',
        name: 'Kontraktor Penambangan (Mining Contracting)',
        category: 'PAMA & KPP Mining',
        revenueP1: 39800.0,
        revenueP2: 43600.0,
        grossMarginPctP2: 25.0,
        color: '#0284c7',
        description: 'Volume OB removal 925 jt bcm dan batubara 110 jt ton per 9M 2024',
      },
      {
        id: 'untr-seg-2',
        name: 'Mesin Konstruksi (Construction Machinery)',
        category: 'Komatsu, Scania & UD Trucks',
        revenueP1: 27900.0,
        revenueP2: 27500.0,
        grossMarginPctP2: 23.0,
        color: '#eab308',
        description: 'Penjualan 3.322 unit Komatsu per 9M 2024',
      },
      {
        id: 'untr-seg-3',
        name: 'Pertambangan Batubara (Coal Mining)',
        category: 'Turangga Resources',
        revenueP1: 23400.0,
        revenueP2: 19300.0,
        grossMarginPctP2: 29.0,
        color: '#475569',
        description: 'Normalisasi harga batubara global menekan nilai pendapatan sebesar -17.5%',
      },
      {
        id: 'untr-seg-4',
        name: 'Pertambangan Emas & Mineral Lainnya',
        category: 'Agincourt (Martabe) & SJR',
        revenueP1: 4300.0,
        revenueP2: 7150.0,
        grossMarginPctP2: 55.0,
        color: '#f59e0b',
        description: 'Penjualan 165 ribu ons emas didorong rally harga komoditas emas',
      },
      {
        id: 'untr-seg-5',
        name: 'Industri Konstruksi (Construction Industry)',
        category: 'PT Acset Indonusa Tbk (ACSET)',
        revenueP1: 1450.0,
        revenueP2: 1700.0,
        grossMarginPctP2: 6.0,
        color: '#ec4899',
        description: 'Peningkatan proyek struktur dan infrastruktur domestik',
      },
      {
        id: 'untr-seg-6',
        name: 'Energi Terbarukan & Lain-lain (Renewable Energy)',
        category: 'Energia Prima Nusantara (EPN)',
        revenueP1: 140.0,
        revenueP2: 300.0,
        grossMarginPctP2: 38.0,
        color: '#10b981',
        description: 'Penyelesaian proyek minihidro dan solar PV komersial',
      },
    ],
  },
  {
    id: '1h-2024-vs-2023',
    name: '1H 2024 vs 1H 2023 (Semester 1 / 6 Bulan)',
    category: 'semesteran',
    period1Label: '1H 2023',
    period2Label: '1H 2024',
    totalRevenueP1: 68670.0,
    totalRevenueP2: 64510.0,
    note: 'Laporan interim semester 1: Pendapatan terkontraksi -6.1% YoY akibat koreksi harga jual batubara dan penurunan volume Komatsu.',
    segments: [
      {
        id: 'untr-seg-1',
        name: 'Kontraktor Penambangan (Mining Contracting)',
        category: 'PAMA & KPP Mining',
        revenueP1: 24310.0,
        revenueP2: 27950.0,
        grossMarginPctP2: 24.0,
        color: '#0284c7',
        description: 'Kontribusi 43.3% dari total pendapatan interim 1H 2024 (+15.0% YoY)',
      },
      {
        id: 'untr-seg-2',
        name: 'Mesin Konstruksi (Construction Machinery)',
        category: 'Komatsu, Scania & UD Trucks',
        revenueP1: 20340.0,
        revenueP2: 18020.0,
        grossMarginPctP2: 22.5,
        color: '#eab308',
        description: 'Penjualan 2.147 unit Komatsu pada 1H 2024 turun -32% YoY',
      },
      {
        id: 'untr-seg-3',
        name: 'Pertambangan Batubara (Coal Mining)',
        category: 'Turangga Resources',
        revenueP1: 17650.0,
        revenueP2: 12840.0,
        grossMarginPctP2: 27.5,
        color: '#475569',
        description: 'Penjualan batubara Turangga 4.7 jt ton (-27.2% nilai pendapatan)',
      },
      {
        id: 'untr-seg-4',
        name: 'Pertambangan Emas & Mineral Lainnya',
        category: 'Agincourt (Martabe) & SJR',
        revenueP1: 3220.0,
        revenueP2: 4480.0,
        grossMarginPctP2: 53.0,
        color: '#f59e0b',
        description: 'Penjualan 110 ribu ons emas dari Martabe (+39.1% YoY)',
      },
      {
        id: 'untr-seg-5',
        name: 'Industri Konstruksi (Construction Industry)',
        category: 'PT Acset Indonusa Tbk (ACSET)',
        revenueP1: 798.0,
        revenueP2: 1090.0,
        grossMarginPctP2: 5.2,
        color: '#ec4899',
        description: 'Pertumbuhan pendapatan konstruksi 36.6% YoY',
      },
      {
        id: 'untr-seg-6',
        name: 'Energi Terbarukan & Lain-lain (Renewable Energy)',
        category: 'Energia Prima Nusantara (EPN)',
        revenueP1: 52.0,
        revenueP2: 130.0,
        grossMarginPctP2: 35.0,
        color: '#10b981',
        description: 'Operasional PLTMH dan instalasi solar rooftop industri',
      },
    ],
  },
  {
    id: 'q1-2024-vs-2023',
    name: 'Q1 2024 vs Q1 2023 (Kuartal 1 / Tiga Bulan Pertama)',
    category: 'kuartalan',
    period1Label: 'Q1 2023',
    period2Label: 'Q1 2024',
    totalRevenueP1: 34880.0,
    totalRevenueP2: 32410.0,
    note: 'Laporan Kuartal I: PAMA mencatat kenaikan solid (+13.8%), namun penjualan alat berat Komatsu melambat di sektor kehutanan & konstruksi.',
    segments: [
      {
        id: 'untr-seg-1',
        name: 'Kontraktor Penambangan (Mining Contracting)',
        category: 'PAMA & KPP Mining',
        revenueP1: 11720.0,
        revenueP2: 13340.0,
        grossMarginPctP2: 24.8,
        color: '#0284c7',
        description: 'Produksi 32 jt ton batubara klien dan OB removal 286 jt bcm',
      },
      {
        id: 'untr-seg-2',
        name: 'Mesin Konstruksi (Construction Machinery)',
        category: 'Komatsu, Scania & UD Trucks',
        revenueP1: 10610.0,
        revenueP2: 8280.0,
        grossMarginPctP2: 21.5,
        color: '#eab308',
        description: 'Penjualan Komatsu 1.126 unit (-37% volume)',
      },
      {
        id: 'untr-seg-3',
        name: 'Pertambangan Batubara (Coal Mining)',
        category: 'Turangga Resources',
        revenueP1: 9310.0,
        revenueP2: 6920.0,
        grossMarginPctP2: 26.5,
        color: '#475569',
        description: 'Koreksi ASP harga batubara menekan pendapatan kuartalan (-25.7%)',
      },
      {
        id: 'untr-seg-4',
        name: 'Pertambangan Emas & Mineral Lainnya',
        category: 'Agincourt (Martabe) & SJR',
        revenueP1: 1510.0,
        revenueP2: 2370.0,
        grossMarginPctP2: 52.0,
        color: '#f59e0b',
        description: 'Penjualan emas 58 ribu ons didorong harga jual emas tinggi (+57% YoY)',
      },
      {
        id: 'untr-seg-5',
        name: 'Industri Konstruksi (Construction Industry)',
        category: 'PT Acset Indonusa Tbk (ACSET)',
        revenueP1: 390.0,
        revenueP2: 520.0,
        grossMarginPctP2: 4.8,
        color: '#ec4899',
        description: 'Realisasi kontrak jalan tol dan pondasi komersial',
      },
      {
        id: 'untr-seg-6',
        name: 'Energi Terbarukan & Lain-lain (Renewable Energy)',
        category: 'Energia Prima Nusantara (EPN)',
        revenueP1: 30.0,
        revenueP2: 70.0,
        grossMarginPctP2: 34.0,
        color: '#10b981',
        description: 'PLTMH Besai Kemu dan ekspansi solar PV',
      },
    ],
  },
  {
    id: 'fy-2023-vs-2022',
    name: 'FY 2023 vs FY 2022 (Tahunan Historis Siklus Tinggi)',
    category: 'tahunan',
    period1Label: 'FY 2022',
    period2Label: 'FY 2023',
    totalRevenueP1: 123605.0,
    totalRevenueP2: 128583.0,
    note: 'Pembanding siklus komoditas puncak pasca-pandemi: Pendapatan tumbuh +4.0% mencapai rekor Rp 128.6 Triliun.',
    segments: [
      {
        id: 'untr-seg-1',
        name: 'Kontraktor Penambangan (Mining Contracting)',
        category: 'PAMA & KPP Mining',
        revenueP1: 47330.0,
        revenueP2: 53978.0,
        grossMarginPctP2: 25.8,
        color: '#0284c7',
        description: 'Pertumbuhan 14% seiring rekor produksi batubara nasional',
      },
      {
        id: 'untr-seg-2',
        name: 'Mesin Konstruksi (Construction Machinery)',
        category: 'Komatsu, Scania & UD Trucks',
        revenueP1: 36525.0,
        revenueP2: 36634.0,
        grossMarginPctP2: 23.5,
        color: '#eab308',
        description: 'Penjualan 5.270 unit Komatsu pada FY 2023',
      },
      {
        id: 'untr-seg-3',
        name: 'Pertambangan Batubara (Coal Mining)',
        category: 'Turangga Resources',
        revenueP1: 31130.0,
        revenueP2: 30526.0,
        grossMarginPctP2: 31.0,
        color: '#475569',
        description: 'Penjualan 11.8 jt ton batubara dengan margin tinggi',
      },
      {
        id: 'untr-seg-4',
        name: 'Pertambangan Emas & Mineral Lainnya',
        category: 'Agincourt (Martabe) & SJR',
        revenueP1: 7660.0,
        revenueP2: 5200.0,
        grossMarginPctP2: 50.0,
        color: '#f59e0b',
        description: 'Penjualan emas 175 ribu ons terimbas fasilitas tailing',
      },
      {
        id: 'untr-seg-5',
        name: 'Industri Konstruksi (Construction Industry)',
        category: 'PT Acset Indonusa Tbk (ACSET)',
        revenueP1: 949.0,
        revenueP2: 2245.0,
        grossMarginPctP2: 4.5,
        color: '#ec4899',
        description: 'Lonjakan 136.6% pemulihan proyek infrastruktur',
      },
      {
        id: 'untr-seg-6',
        name: 'Energi Terbarukan & Lain-lain (Renewable Energy)',
        category: 'Energia Prima Nusantara (EPN)',
        revenueP1: 11.0,
        revenueP2: 0.0,
        grossMarginPctP2: 30.0,
        color: '#10b981',
        description: 'Fase inisiasi portofolio energi baru terbarukan',
      },
    ],
  },
];

export interface IndividualPeriodStatement {
  revenue: number;
  cogs: number;
  opex: number;
  marketing: number;
  generalAdmin: number;
  rd: number;
  deprAmort: number;
  interestExpense: number;
  tax: number;
  netIncome: number;
  operatingCashFlow: number;
  // Balance sheet metrics
  cashEquivalents: number;
  accountsReceivable: number;
  inventory: number;
  otherCurrentAssets: number;
  ppe: number;
  intangibles: number;
  otherNonCurrentAssets: number;
  accountsPayable: number;
  shortTermDebt: number;
  accruedLiabilities: number;
  longTermDebt: number;
  otherNonCurrentLiabilities: number;
  shareCapital: number;
  retainedEarnings: number;
}

export interface IndividualPeriodInfo {
  id: string;
  label: string;
  category: 'tahunan' | 'kuartalan' | 'semesteran';
  totalRevenue: number;
  segments: { [segId: string]: number };
  statement: IndividualPeriodStatement;
}

export const INDIVIDUAL_PERIODS: IndividualPeriodInfo[] = [
  // Tahunan
  {
    id: 'FY 2024',
    label: 'FY 2024 (Full Year 2024)',
    category: 'tahunan',
    totalRevenue: 134357.0,
    segments: {
      'untr-seg-1': 58043.0,
      'untr-seg-2': 37294.0,
      'untr-seg-3': 26013.0,
      'untr-seg-4': 9891.0,
      'untr-seg-5': 2686.0,
      'untr-seg-6': 430.0,
    },
    statement: {
      revenue: 134357.0,
      cogs: 100530.0,
      opex: 8560.0,
      marketing: 1480.0,
      generalAdmin: 5620.0,
      rd: 360.0,
      deprAmort: 10153.0,
      interestExpense: 1620.0,
      tax: 4100.0,
      netIncome: 19547.0,
      operatingCashFlow: 22100.0,
      cashEquivalents: 35200.0,
      accountsReceivable: 28100.0,
      inventory: 16900.0,
      otherCurrentAssets: 6300.0,
      ppe: 53200.0,
      intangibles: 14600.0,
      otherNonCurrentAssets: 11000.0,
      accountsPayable: 31200.0,
      shortTermDebt: 7800.0,
      accruedLiabilities: 7200.0,
      longTermDebt: 14000.0,
      otherNonCurrentLiabilities: 2500.0,
      shareCapital: 2800.0,
      retainedEarnings: 99800.0,
    },
  },
  {
    id: 'FY 2023',
    label: 'FY 2023 (Full Year 2023)',
    category: 'tahunan',
    totalRevenue: 128583.0,
    segments: {
      'untr-seg-1': 53978.0,
      'untr-seg-2': 36634.0,
      'untr-seg-3': 30526.0,
      'untr-seg-4': 5200.0,
      'untr-seg-5': 2245.0,
      'untr-seg-6': 0.0,
    },
    statement: {
      revenue: 128583.0,
      cogs: 93865.0,
      opex: 7850.0,
      marketing: 1350.0,
      generalAdmin: 5200.0,
      rd: 300.0,
      deprAmort: 9282.0,
      interestExpense: 1080.0,
      tax: 5176.0,
      netIncome: 20612.0,
      operatingCashFlow: 25300.0,
      cashEquivalents: 38500.0,
      accountsReceivable: 25600.0,
      inventory: 14800.0,
      otherCurrentAssets: 5300.0,
      ppe: 48500.0,
      intangibles: 12800.0,
      otherNonCurrentAssets: 9000.0,
      accountsPayable: 28400.0,
      shortTermDebt: 6400.0,
      accruedLiabilities: 7800.0,
      longTermDebt: 12000.0,
      otherNonCurrentLiabilities: 2800.0,
      shareCapital: 2800.0,
      retainedEarnings: 94300.0,
    },
  },
  {
    id: 'FY 2022',
    label: 'FY 2022 (Full Year 2022)',
    category: 'tahunan',
    totalRevenue: 123605.0,
    segments: {
      'untr-seg-1': 47330.0,
      'untr-seg-2': 36525.0,
      'untr-seg-3': 31130.0,
      'untr-seg-4': 7660.0,
      'untr-seg-5': 949.0,
      'untr-seg-6': 11.0,
    },
    statement: {
      revenue: 123605.0,
      cogs: 88420.0,
      opex: 7200.0,
      marketing: 1220.0,
      generalAdmin: 4800.0,
      rd: 250.0,
      deprAmort: 8450.0,
      interestExpense: 920.0,
      tax: 5630.0,
      netIncome: 21435.0,
      operatingCashFlow: 24100.0,
      cashEquivalents: 41200.0,
      accountsReceivable: 23800.0,
      inventory: 13200.0,
      otherCurrentAssets: 4700.0,
      ppe: 44100.0,
      intangibles: 11200.0,
      otherNonCurrentAssets: 8200.0,
      accountsPayable: 26100.0,
      shortTermDebt: 5500.0,
      accruedLiabilities: 7100.0,
      longTermDebt: 10800.0,
      otherNonCurrentLiabilities: 2400.0,
      shareCapital: 2800.0,
      retainedEarnings: 91700.0,
    },
  },
  // Kuartalan (9M & Q1)
  {
    id: '9M 2024',
    label: '9M 2024 (Kuartal III / 9 Bulan YTD)',
    category: 'kuartalan',
    totalRevenue: 99550.0,
    segments: {
      'untr-seg-1': 43600.0,
      'untr-seg-2': 27500.0,
      'untr-seg-3': 19300.0,
      'untr-seg-4': 7150.0,
      'untr-seg-5': 1700.0,
      'untr-seg-6': 300.0,
    },
    statement: {
      revenue: 99550.0,
      cogs: 74660.0,
      opex: 6420.0,
      marketing: 1110.0,
      generalAdmin: 4215.0,
      rd: 270.0,
      deprAmort: 7615.0,
      interestExpense: 1215.0,
      tax: 3075.0,
      netIncome: 14180.0,
      operatingCashFlow: 16800.0,
      cashEquivalents: 34100.0,
      accountsReceivable: 27400.0,
      inventory: 16200.0,
      otherCurrentAssets: 5900.0,
      ppe: 51800.0,
      intangibles: 14100.0,
      otherNonCurrentAssets: 10500.0,
      accountsPayable: 30500.0,
      shortTermDebt: 7200.0,
      accruedLiabilities: 6800.0,
      longTermDebt: 13500.0,
      otherNonCurrentLiabilities: 2600.0,
      shareCapital: 2800.0,
      retainedEarnings: 96600.0,
    },
  },
  {
    id: '9M 2023',
    label: '9M 2023 (Kuartal III / 9 Bulan YTD)',
    category: 'kuartalan',
    totalRevenue: 97590.0,
    segments: {
      'untr-seg-1': 39800.0,
      'untr-seg-2': 27900.0,
      'untr-seg-3': 23400.0,
      'untr-seg-4': 4300.0,
      'untr-seg-5': 1450.0,
      'untr-seg-6': 140.0,
    },
    statement: {
      revenue: 97590.0,
      cogs: 71240.0,
      opex: 5880.0,
      marketing: 1010.0,
      generalAdmin: 3900.0,
      rd: 225.0,
      deprAmort: 6960.0,
      interestExpense: 810.0,
      tax: 3880.0,
      netIncome: 15780.0,
      operatingCashFlow: 18900.0,
      cashEquivalents: 37200.0,
      accountsReceivable: 25100.0,
      inventory: 14300.0,
      otherCurrentAssets: 5100.0,
      ppe: 47200.0,
      intangibles: 12400.0,
      otherNonCurrentAssets: 8700.0,
      accountsPayable: 27600.0,
      shortTermDebt: 6100.0,
      accruedLiabilities: 7400.0,
      longTermDebt: 11500.0,
      otherNonCurrentLiabilities: 2700.0,
      shareCapital: 2800.0,
      retainedEarnings: 91900.0,
    },
  },
  // Semesteran (1H)
  {
    id: '1H 2024',
    label: '1H 2024 (Semester I / 6 Bulan)',
    category: 'semesteran',
    totalRevenue: 64510.0,
    segments: {
      'untr-seg-1': 27950.0,
      'untr-seg-2': 18020.0,
      'untr-seg-3': 12840.0,
      'untr-seg-4': 4480.0,
      'untr-seg-5': 1090.0,
      'untr-seg-6': 130.0,
    },
    statement: {
      revenue: 64510.0,
      cogs: 48380.0,
      opex: 4280.0,
      marketing: 740.0,
      generalAdmin: 2810.0,
      rd: 180.0,
      deprAmort: 5076.0,
      interestExpense: 810.0,
      tax: 2050.0,
      netIncome: 8990.0,
      operatingCashFlow: 11200.0,
      cashEquivalents: 33500.0,
      accountsReceivable: 26800.0,
      inventory: 15900.0,
      otherCurrentAssets: 5700.0,
      ppe: 50900.0,
      intangibles: 13800.0,
      otherNonCurrentAssets: 10100.0,
      accountsPayable: 29800.0,
      shortTermDebt: 7000.0,
      accruedLiabilities: 6500.0,
      longTermDebt: 13000.0,
      otherNonCurrentLiabilities: 2500.0,
      shareCapital: 2800.0,
      retainedEarnings: 95100.0,
    },
  },
  {
    id: '1H 2023',
    label: '1H 2023 (Semester I / 6 Bulan)',
    category: 'semesteran',
    totalRevenue: 68670.0,
    segments: {
      'untr-seg-1': 24310.0,
      'untr-seg-2': 20340.0,
      'untr-seg-3': 17650.0,
      'untr-seg-4': 3220.0,
      'untr-seg-5': 798.0,
      'untr-seg-6': 52.0,
    },
    statement: {
      revenue: 68670.0,
      cogs: 50120.0,
      opex: 3920.0,
      marketing: 675.0,
      generalAdmin: 2600.0,
      rd: 150.0,
      deprAmort: 4640.0,
      interestExpense: 540.0,
      tax: 2740.0,
      netIncome: 11350.0,
      operatingCashFlow: 13500.0,
      cashEquivalents: 36800.0,
      accountsReceivable: 24900.0,
      inventory: 14100.0,
      otherCurrentAssets: 4900.0,
      ppe: 46500.0,
      intangibles: 12100.0,
      otherNonCurrentAssets: 8500.0,
      accountsPayable: 27200.0,
      shortTermDebt: 5900.0,
      accruedLiabilities: 7200.0,
      longTermDebt: 11200.0,
      otherNonCurrentLiabilities: 2600.0,
      shareCapital: 2800.0,
      retainedEarnings: 90800.0,
    },
  },
  // Kuartal I (Q1)
  {
    id: 'Q1 2024',
    label: 'Q1 2024 (Kuartal I / Tiga Bulan Pertama)',
    category: 'kuartalan',
    totalRevenue: 32410.0,
    segments: {
      'untr-seg-1': 13340.0,
      'untr-seg-2': 8280.0,
      'untr-seg-3': 6920.0,
      'untr-seg-4': 2370.0,
      'untr-seg-5': 520.0,
      'untr-seg-6': 70.0,
    },
    statement: {
      revenue: 32410.0,
      cogs: 24310.0,
      opex: 2140.0,
      marketing: 370.0,
      generalAdmin: 1405.0,
      rd: 90.0,
      deprAmort: 2538.0,
      interestExpense: 405.0,
      tax: 1025.0,
      netIncome: 4530.0,
      operatingCashFlow: 5400.0,
      cashEquivalents: 35800.0,
      accountsReceivable: 26200.0,
      inventory: 15500.0,
      otherCurrentAssets: 5500.0,
      ppe: 49800.0,
      intangibles: 13400.0,
      otherNonCurrentAssets: 9700.0,
      accountsPayable: 29100.0,
      shortTermDebt: 6800.0,
      accruedLiabilities: 6700.0,
      longTermDebt: 12800.0,
      otherNonCurrentLiabilities: 2500.0,
      shareCapital: 2800.0,
      retainedEarnings: 92500.0,
    },
  },
  {
    id: 'Q1 2023',
    label: 'Q1 2023 (Kuartal I / Tiga Bulan Pertama)',
    category: 'kuartalan',
    totalRevenue: 34880.0,
    segments: {
      'untr-seg-1': 11720.0,
      'untr-seg-2': 10610.0,
      'untr-seg-3': 9310.0,
      'untr-seg-4': 1510.0,
      'untr-seg-5': 390.0,
      'untr-seg-6': 30.0,
    },
    statement: {
      revenue: 34880.0,
      cogs: 25460.0,
      opex: 1960.0,
      marketing: 340.0,
      generalAdmin: 1300.0,
      rd: 75.0,
      deprAmort: 2320.0,
      interestExpense: 270.0,
      tax: 1390.0,
      netIncome: 5800.0,
      operatingCashFlow: 6200.0,
      cashEquivalents: 39200.0,
      accountsReceivable: 24500.0,
      inventory: 13800.0,
      otherCurrentAssets: 4800.0,
      ppe: 45600.0,
      intangibles: 11800.0,
      otherNonCurrentAssets: 8300.0,
      accountsPayable: 26800.0,
      shortTermDebt: 5800.0,
      accruedLiabilities: 7500.0,
      longTermDebt: 11000.0,
      otherNonCurrentLiabilities: 2500.0,
      shareCapital: 2800.0,
      retainedEarnings: 91600.0,
    },
  },
];

export const SEGMENT_METADATA: {
  [id: string]: {
    name: string;
    category: string;
    color: string;
    defaultMargin: number;
    description: string;
  };
} = {
  'untr-seg-1': {
    name: 'Kontraktor Penambangan (Mining Contracting)',
    category: 'PAMA & KPP Mining',
    color: '#0284c7',
    defaultMargin: 24.5,
    description: 'Jasa pemindahan tanah (OB removal) & produksi batubara klien',
  },
  'untr-seg-2': {
    name: 'Mesin Konstruksi (Construction Machinery)',
    category: 'Komatsu, Scania & UD Trucks',
    color: '#eab308',
    defaultMargin: 22.8,
    description: 'Penjualan alat berat Komatsu, suku cadang & servis purnajual',
  },
  'untr-seg-3': {
    name: 'Pertambangan Batubara (Coal Mining)',
    category: 'Turangga Resources',
    color: '#475569',
    defaultMargin: 28.0,
    description: 'Penjualan batubara konsolidasian (termal & metalurgi coking coal)',
  },
  'untr-seg-4': {
    name: 'Pertambangan Emas & Mineral Lainnya',
    category: 'Agincourt (Martabe) & SJR',
    color: '#f59e0b',
    defaultMargin: 54.2,
    description: 'Penjualan emas Tambang Martabe (PTAR) & mineral terkait',
  },
  'untr-seg-5': {
    name: 'Industri Konstruksi (Construction Industry)',
    category: 'PT Acset Indonusa Tbk (ACSET)',
    color: '#ec4899',
    defaultMargin: 5.8,
    description: 'Jasa konstruksi pondasi, struktur sipil & infrastruktur jalan tol',
  },
  'untr-seg-6': {
    name: 'Energi Terbarukan & Lain-lain (Renewable Energy)',
    category: 'Energia Prima Nusantara (EPN)',
    color: '#10b981',
    defaultMargin: 36.0,
    description: 'Pembangkit Listrik Tenaga Minihidro (PLTMH), Rooftop Solar PV & Geothermal',
  },
};

export function getSegmentsForPeriodPair(
  p1Id: string,
  p2Id: string
): {
  segments: RevenueSegmentItem[];
  totalRevenueP1: number;
  totalRevenueP2: number;
} {
  const p1 = INDIVIDUAL_PERIODS.find((p) => p.id === p1Id);
  const p2 = INDIVIDUAL_PERIODS.find((p) => p.id === p2Id);

  const segIds = Object.keys(SEGMENT_METADATA);
  const segments: RevenueSegmentItem[] = segIds.map((id) => {
    const meta = SEGMENT_METADATA[id];
    const r1 = p1 ? p1.segments[id] ?? 0 : 0;
    const r2 = p2 ? p2.segments[id] ?? 0 : 0;
    return {
      id,
      name: meta.name,
      category: meta.category,
      color: meta.color,
      grossMarginPctP2: meta.defaultMargin,
      description: meta.description,
      revenueP1: r1,
      revenueP2: r2,
    };
  });

  const tot1 = p1 ? p1.totalRevenue : segments.reduce((s, x) => s + x.revenueP1, 0);
  const tot2 = p2 ? p2.totalRevenue : segments.reduce((s, x) => s + x.revenueP2, 0);

  return { segments, totalRevenueP1: tot1, totalRevenueP2: tot2 };
}

export function findUntrPeriod(idOrLabel: string): IndividualPeriodInfo | undefined {
  if (!idOrLabel) return undefined;
  const clean = idOrLabel.trim().toLowerCase();
  return INDIVIDUAL_PERIODS.find(
    (p) =>
      p.id.toLowerCase() === clean ||
      p.label.toLowerCase() === clean ||
      clean.startsWith(p.id.toLowerCase()) ||
      p.label.toLowerCase().includes(clean)
  );
}

export function getUntrFinancialDataForPeriodPair(
  p1Label: string,
  p2Label: string
): {
  data: FinancialData;
  balanceSheet: BalanceSheetData;
  segments: RevenueSegmentItem[];
  matchedPreset?: SegmentPeriodPreset;
} {
  const p1 = findUntrPeriod(p1Label) || INDIVIDUAL_PERIODS[1]; // fallback FY 2023
  const p2 = findUntrPeriod(p2Label) || INDIVIDUAL_PERIODS[0]; // fallback FY 2024

  const s1 = p1.statement;
  const s2 = p2.statement;

  const data: FinancialData = {
    revenueP1: s1.revenue,
    revenueP2: s2.revenue,
    cogsP1: s1.cogs,
    cogsP2: s2.cogs,
    opexP1: s1.opex,
    opexP2: s2.opex,
    marketingP1: s1.marketing,
    marketingP2: s2.marketing,
    generalAdminP1: s1.generalAdmin,
    generalAdminP2: s2.generalAdmin,
    rdP1: s1.rd,
    rdP2: s2.rd,
    deprAmortP1: s1.deprAmort,
    deprAmortP2: s2.deprAmort,
    interestExpenseP1: s1.interestExpense,
    interestExpenseP2: s2.interestExpense,
    taxP1: s1.tax,
    taxP2: s2.tax,
    netIncomeP1: s1.netIncome,
    netIncomeP2: s2.netIncome,
    operatingCashFlowP1: s1.operatingCashFlow,
    operatingCashFlowP2: s2.operatingCashFlow,
    accountsReceivableP1: s1.accountsReceivable,
    accountsReceivableP2: s2.accountsReceivable,
    inventoryP1: s1.inventory,
    inventoryP2: s2.inventory,
    cashEquivalentsP1: s1.cashEquivalents,
    cashEquivalentsP2: s2.cashEquivalents,
    totalDebtP1: s1.shortTermDebt + s1.longTermDebt,
    totalDebtP2: s2.shortTermDebt + s2.longTermDebt,
    otherCurrentAssetsP1: s1.otherCurrentAssets,
    otherCurrentAssetsP2: s2.otherCurrentAssets,
    ppeP1: s1.ppe,
    ppeP2: s2.ppe,
    intangiblesP1: s1.intangibles,
    intangiblesP2: s2.intangibles,
    accountsPayableP1: s1.accountsPayable,
    accountsPayableP2: s2.accountsPayable,
    shortTermDebtP1: s1.shortTermDebt,
    shortTermDebtP2: s2.shortTermDebt,
    accruedLiabilitiesP1: s1.accruedLiabilities,
    accruedLiabilitiesP2: s2.accruedLiabilities,
    longTermDebtP1: s1.longTermDebt,
    longTermDebtP2: s2.longTermDebt,
    shareCapitalP1: s1.shareCapital,
    shareCapitalP2: s2.shareCapital,
  };

  const balanceSheet: BalanceSheetData = {
    cashEquivalentsP1: s1.cashEquivalents,
    cashEquivalentsP2: s2.cashEquivalents,
    accountsReceivableP1: s1.accountsReceivable,
    accountsReceivableP2: s2.accountsReceivable,
    inventoryP1: s1.inventory,
    inventoryP2: s2.inventory,
    otherCurrentAssetsP1: s1.otherCurrentAssets,
    otherCurrentAssetsP2: s2.otherCurrentAssets,
    ppeP1: s1.ppe,
    ppeP2: s2.ppe,
    intangiblesP1: s1.intangibles,
    intangiblesP2: s2.intangibles,
    otherNonCurrentAssetsP1: s1.otherNonCurrentAssets,
    otherNonCurrentAssetsP2: s2.otherNonCurrentAssets,
    accountsPayableP1: s1.accountsPayable,
    accountsPayableP2: s2.accountsPayable,
    shortTermDebtP1: s1.shortTermDebt,
    shortTermDebtP2: s2.shortTermDebt,
    accruedLiabilitiesP1: s1.accruedLiabilities,
    accruedLiabilitiesP2: s2.accruedLiabilities,
    longTermDebtP1: s1.longTermDebt,
    longTermDebtP2: s2.longTermDebt,
    otherNonCurrentLiabilitiesP1: s1.otherNonCurrentLiabilities,
    otherNonCurrentLiabilitiesP2: s2.otherNonCurrentLiabilities,
    shareCapitalP1: s1.shareCapital,
    shareCapitalP2: s2.shareCapital,
    retainedEarningsP1: s1.retainedEarnings,
    retainedEarningsP2: s2.retainedEarnings,
  };

  const { segments } = getSegmentsForPeriodPair(p1.id, p2.id);

  // Check matched preset
  const matchedPreset = UNTR_PERIOD_PRESETS.find(
    (pr) =>
      (pr.period1Label.toLowerCase() === p1.id.toLowerCase() ||
        p1.id.toLowerCase().includes(pr.period1Label.toLowerCase())) &&
      (pr.period2Label.toLowerCase() === p2.id.toLowerCase() ||
        p2.id.toLowerCase().includes(pr.period2Label.toLowerCase()))
  );

  return { data, balanceSheet, segments, matchedPreset };
}


