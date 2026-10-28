export interface RevenueSegmentItem {
  id: string;
  name: string;
  category?: string;
  revenueP1: number;
  revenueP2: number;
  grossMarginPctP2?: number; // Estimated Gross Margin % of this segment
  color?: string;
  description?: string;
}

export interface BalanceSheetData {
  // Current Assets
  cashEquivalentsP1: number;
  cashEquivalentsP2: number;
  accountsReceivableP1: number;
  accountsReceivableP2: number;
  inventoryP1: number;
  inventoryP2: number;
  otherCurrentAssetsP1: number;
  otherCurrentAssetsP2: number;

  // Non-Current Assets
  ppeP1: number; // Property, Plant & Equipment (Net)
  ppeP2: number;
  intangiblesP1: number;
  intangiblesP2: number;
  otherNonCurrentAssetsP1: number;
  otherNonCurrentAssetsP2: number;

  // Current Liabilities
  accountsPayableP1: number;
  accountsPayableP2: number;
  shortTermDebtP1: number;
  shortTermDebtP2: number;
  accruedLiabilitiesP1: number;
  accruedLiabilitiesP2: number;

  // Non-Current Liabilities
  longTermDebtP1: number;
  longTermDebtP2: number;
  otherNonCurrentLiabilitiesP1: number;
  otherNonCurrentLiabilitiesP2: number;

  // Shareholders' Equity
  shareCapitalP1: number;
  shareCapitalP2: number;
  retainedEarningsP1: number;
  retainedEarningsP2: number;
}

export interface FinancialData {
  revenueP1: number;
  revenueP2: number;
  cogsP1: number;
  cogsP2: number;
  opexP1: number;
  opexP2: number;
  marketingP1?: number;
  marketingP2?: number;
  generalAdminP1?: number;
  generalAdminP2?: number;
  rdP1?: number;
  rdP2?: number;
  deprAmortP1?: number;
  deprAmortP2?: number;
  interestExpenseP1?: number;
  interestExpenseP2?: number;
  taxP1?: number;
  taxP2?: number;
  netIncomeP1?: number;
  netIncomeP2?: number;
  operatingCashFlowP1?: number;
  operatingCashFlowP2?: number;
  accountsReceivableP1?: number;
  accountsReceivableP2?: number;
  inventoryP1?: number;
  inventoryP2?: number;
  cashEquivalentsP1?: number;
  cashEquivalentsP2?: number;
  totalDebtP1?: number;
  totalDebtP2?: number;

  // Optional expanded Balance Sheet metrics
  otherCurrentAssetsP1?: number;
  otherCurrentAssetsP2?: number;
  ppeP1?: number;
  ppeP2?: number;
  intangiblesP1?: number;
  intangiblesP2?: number;
  accountsPayableP1?: number;
  accountsPayableP2?: number;
  shortTermDebtP1?: number;
  shortTermDebtP2?: number;
  accruedLiabilitiesP1?: number;
  accruedLiabilitiesP2?: number;
  longTermDebtP1?: number;
  longTermDebtP2?: number;
  shareCapitalP1?: number;
  shareCapitalP2?: number;
  retainedEarningsP1?: number;
  retainedEarningsP2?: number;

  // Revenue segmentation
  revenueSegments?: RevenueSegmentItem[];
}

export interface CalculatedMargins {
  grossProfitP1: number;
  grossProfitP2: number;
  grossMarginP1: number;
  grossMarginP2: number;
  grossMarginDeltaBps: number;

  operatingProfitP1: number;
  operatingProfitP2: number;
  operatingMarginP1: number;
  operatingMarginP2: number;
  operatingMarginDeltaBps: number;

  ebitdaP1: number;
  ebitdaP2: number;
  ebitdaMarginP1: number;
  ebitdaMarginP2: number;
  ebitdaMarginDeltaBps: number;

  netIncomeP1: number;
  netIncomeP2: number;
  netMarginP1: number;
  netMarginP2: number;
  netMarginDeltaBps: number;

  revenueGrowthPct: number;
  cogsGrowthPct: number;
  opexGrowthPct: number;
  cashConversionAnomaly: boolean;
}

export interface AnomalyItem {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'WARNING' | 'ATTENTION';
  metricAffected: string;
  observation: string;
  underlyingRisk: string;
  forensicNote: string;
}

export interface RecommendationItem {
  id: string;
  priority: 'P1 - Segera (0-30 Hari)' | 'P2 - Taktis (30-90 Hari)' | 'P3 - Transformasi Strategis';
  category: 'Efisiensi COGS' | 'Pengendalian OPEX' | 'Modal Kerja & Kas' | 'Pricing & Kualitas Revenue' | 'Struktur Modal & Utang';
  title: string;
  actionPlan: string;
  estimatedFinancialImpact: string;
  targetKPI: string;
}

export interface MarginDiagnostic {
  name: string;
  p1Pct: number;
  p2Pct: number;
  deltaBps: number;
  status: 'improved' | 'deteriorated' | 'neutral';
  cfoComment: string;
}

export interface CFOAnalysisReport {
  companyName: string;
  period1Label: string;
  period2Label: string;
  currency: string;
  cfoVerdict: string;
  healthScore: number; // 0 - 100
  executiveSummary: {
    paragraph1: string; // Kinerja Pendapatan & Profitabilitas Inti
    paragraph2: string; // Bedah Anomali & Erosi/Kenaikan Margin
    paragraph3: string; // Likuiditas, Arus Kas, & Posisi Neraca
  };
  margins: MarginDiagnostic[];
  anomalies: AnomalyItem[];
  recommendations: RecommendationItem[];
  keyRatios: {
    ratioName: string;
    p1Value: string;
    p2Value: string;
    benchmarking: string;
    implication: string;
  }[];
}

export interface OperationalMetricItem {
  id: string;
  name: string;
  unit: string;
  p1: number;
  p2: number;
  format?: 'number' | 'currency' | 'percent' | 'ratio';
  notes?: string;
  isHeader?: boolean;
  indent?: number;
}

export interface MachineryBrandItem {
  code: string; // 'KOMATSU' | 'KCMS' | 'KCMB' | 'BOM' | 'NHT' | 'SCN' | 'THC' | 'USE'
  brandName: string; // e.g. "Komatsu", "Bomag", "UD Trucks", "Scania", "Tadano", "Unit Used"
  shortName: string; // e.g. "Komatsu", "Bomag", "UD Trucks", "Scania", "Tadano", "Unit Used"
  brandLabel: string; // e.g. "Komatsu"
  fullName: string; // e.g. "Brand Komatsu (Total Unit Alat Berat)"
  p1: number;
  p2: number;
  unit: string;
  color: string;
  category: string;
  description?: string;
  isSubBrand?: boolean;
  parentBrandCode?: string;
}

export interface OperationalData {
  constructionMachinery: OperationalMetricItem[];
  machineryBrands?: MachineryBrandItem[];
  miningContracting: OperationalMetricItem[];
  coalMining: OperationalMetricItem[];
  goldMining: OperationalMetricItem[];
  nickelMining?: OperationalMetricItem[];
  kurs: OperationalMetricItem[];
  summaryNotes?: string[];
}

export interface SampleStatement {
  id: string;
  companyName: string;
  industry: string;
  currency: string;
  unit: string;
  period1Label: string;
  period2Label: string;
  description: string;
  data: FinancialData;
  contextNote: string;
  revenueSegments?: RevenueSegmentItem[];
  balanceSheet?: BalanceSheetData;
  operationalData?: OperationalData;
}
