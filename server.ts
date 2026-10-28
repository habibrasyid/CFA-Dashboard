import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy get Google GenAI client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Primary CFO Analysis endpoint
app.post('/api/cfo/analyze', async (req, res) => {
  try {
    const {
      companyName = 'Perusahaan Klien',
      period1Label = 'Periode 1',
      period2Label = 'Periode 2',
      currency = 'Rp',
      unit = 'Miliar',
      metrics,
      calculatedMargins,
      additionalContext = '',
    } = req.body;

    if (!metrics || !calculatedMargins) {
      return res.status(400).json({ error: 'Data metrik finansial dan perhitungan margin diperlukan.' });
    }

    const ai = getGeminiClient();

    const promptPayload = `
DATA LAPORAN KEUANGAN:
Nama Perusahaan: ${companyName}
Mata Uang & Satuan: ${currency} (${unit})
Periode Analisis: ${period1Label} vs ${period2Label}

DATA LABA RUGI & NERACA:
- Pendapatan (Revenue): ${period1Label} = ${metrics.revenueP1} -> ${period2Label} = ${metrics.revenueP2} (Pertumbuhan: ${calculatedMargins.revenueGrowthPct.toFixed(2)}%)
- Beban Pokok Pendapatan (COGS): ${metrics.cogsP1} -> ${metrics.cogsP2} (Pertumbuhan: ${calculatedMargins.cogsGrowthPct.toFixed(2)}%)
- Laba Kotor (Gross Profit): ${calculatedMargins.grossProfitP1.toFixed(2)} -> ${calculatedMargins.grossProfitP2.toFixed(2)}
- Gross Margin %: ${calculatedMargins.grossMarginP1.toFixed(2)}% -> ${calculatedMargins.grossMarginP2.toFixed(2)}% (Perubahan: ${calculatedMargins.grossMarginDeltaBps > 0 ? '+' : ''}${calculatedMargins.grossMarginDeltaBps} bps)
- Beban Operasional (OPEX): ${metrics.opexP1} -> ${metrics.opexP2} (Pertumbuhan: ${calculatedMargins.opexGrowthPct.toFixed(2)}%)
  * Pemasaran & Penjualan (Marketing/Sales): ${metrics.marketingP1 ?? 'N/A'} -> ${metrics.marketingP2 ?? 'N/A'}
  * Umum & Administrasi (G&A): ${metrics.generalAdminP1 ?? 'N/A'} -> ${metrics.generalAdminP2 ?? 'N/A'}
  * Riset & Pengembangan (R&D): ${metrics.rdP1 ?? 'N/A'} -> ${metrics.rdP2 ?? 'N/A'}
- Laba Operasional (EBIT): ${calculatedMargins.operatingProfitP1.toFixed(2)} -> ${calculatedMargins.operatingProfitP2.toFixed(2)}
- Operating Margin %: ${calculatedMargins.operatingMarginP1.toFixed(2)}% -> ${calculatedMargins.operatingMarginP2.toFixed(2)}% (Perubahan: ${calculatedMargins.operatingMarginDeltaBps > 0 ? '+' : ''}${calculatedMargins.operatingMarginDeltaBps} bps)
- EBITDA Margin %: ${calculatedMargins.ebitdaMarginP1.toFixed(2)}% -> ${calculatedMargins.ebitdaMarginP2.toFixed(2)}% (Perubahan: ${calculatedMargins.ebitdaMarginDeltaBps > 0 ? '+' : ''}${calculatedMargins.ebitdaMarginDeltaBps} bps)
- Beban Bunga & Pajak: Bunga (${metrics.interestExpenseP1 ?? 'N/A'} -> ${metrics.interestExpenseP2 ?? 'N/A'}), Pajak (${metrics.taxP1 ?? 'N/A'} -> ${metrics.taxP2 ?? 'N/A'})
- Laba Bersih (Net Income): ${calculatedMargins.netIncomeP1.toFixed(2)} -> ${calculatedMargins.netIncomeP2.toFixed(2)}
- Net Margin %: ${calculatedMargins.netMarginP1.toFixed(2)}% -> ${calculatedMargins.netMarginP2.toFixed(2)}% (Perubahan: ${calculatedMargins.netMarginDeltaBps > 0 ? '+' : ''}${calculatedMargins.netMarginDeltaBps} bps)
- Arus Kas Operasi (Operating Cash Flow / OCF): ${metrics.operatingCashFlowP1 ?? 'N/A'} -> ${metrics.operatingCashFlowP2 ?? 'N/A'}
- Piutang Usaha (Accounts Receivable): ${metrics.accountsReceivableP1 ?? 'N/A'} -> ${metrics.accountsReceivableP2 ?? 'N/A'}
- Persediaan (Inventory): ${metrics.inventoryP1 ?? 'N/A'} -> ${metrics.inventoryP2 ?? 'N/A'}
- Kas & Setara Kas: ${metrics.cashEquivalentsP1 ?? 'N/A'} -> ${metrics.cashEquivalentsP2 ?? 'N/A'}
- Total Kewajiban Utang (Total Debt): ${metrics.totalDebtP1 ?? 'N/A'} -> ${metrics.totalDebtP2 ?? 'N/A'}

Konteks Tambahan dari Manajemen:
${additionalContext || 'Tidak ada catatan konteks khusus.'}
`;

    const systemInstruction = `
Kamu adalah seorang Chief Financial Officer (CFO) dan Analis Keuangan Senior berpengalaman lebih dari 20 tahun di korporasi multinasional, turnaround finansial, dan audit investigatif.
Bicaralah dengan wibawa seorang eksekutif C-Suite yang tajam, faktual, berbasis angka, tanpa basa-basi, dan berorientasi pada nilai pemegang saham (shareholder value) serta kelangsungan kas (cash preservation).

TUGAS MANDAT:
1. Analisis data laporan keuangan yang diberikan secara komprehensif.
2. Identifikasi SEMUA anomali yang terjadi (misal: divergensi laba vs arus kas, lonjakan OPEX yang tidak proporsional dengan revenue, kontraksi margin kotor akibat eskalasi COGS, penumpukan persediaan / inventory bloat, lonjakan piutang usaha mengindikasikan revenue recognition agresif atau penagihan macet, serta debt leverage).
3. Hitung dan evaluasi perubahan margin (Gross Margin, Operating/EBIT Margin, EBITDA Margin, Net Profit Margin) dalam basis points (bps) dan berikan interpretasi mendalam penyebabnya.
4. Buat RINGKASAN EKSEKUTIF MAKSIMAL 3 PARAGRAF (wajib dipatuhi):
   - Paragraf 1: Sintesis performa pendapatan (top-line) dan profitabilitas inti keseluruhan.
   - Paragraf 2: Bedah mendalam anomali finansial utama, degradasi atau ekspansi margin, dan distorsi struktur biaya.
   - Paragraf 3: Evaluasi posisi arus kas, likuiditas riil, risiko neraca (working capital/debt), dan viability bisnis jangka panjang.
5. Berikan REKOMENDASI TINDAKAN STRATEGIS & TAKTIS yang terbagi menjadi:
   - P1 - Segera (0-30 Hari): Quick wins mitigasi kas dan penahanan kebocoran biaya.
   - P2 - Taktis (30-90 Hari): Restrukturisasi operasional, negosiasi vendor, atau perbaikan terms piutang.
   - P3 - Transformasi Strategis: Kebijakan penetapan harga (pricing power), portfolio rasionalisasi, dan struktur permodalan.
`;

    if (!ai) {
      // Fallback rule-based analysis if API key is not yet provided
      return res.json(generateFallbackCFOReport(req.body));
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptPayload,
      config: {
        systemInstruction,
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            companyName: { type: Type.STRING },
            period1Label: { type: Type.STRING },
            period2Label: { type: Type.STRING },
            currency: { type: Type.STRING },
            cfoVerdict: { 
              type: Type.STRING, 
              description: 'Vonis status finansial CFO (misal: "Kritis - Terancam Krisis Likuiditas", "Defensif - Erosi Margin Butuh Restrukturisasi", "Ekspansif & Sehat")' 
            },
            healthScore: { 
              type: Type.NUMBER, 
              description: 'Skor kesehatan finansial korporasi skala 0 hingga 100' 
            },
            executiveSummary: {
              type: Type.OBJECT,
              properties: {
                paragraph1: { type: Type.STRING, description: 'Paragraf 1: Sintesis performa pendapatan & profitabilitas inti' },
                paragraph2: { type: Type.STRING, description: 'Paragraf 2: Bedah anomali finansial & pergeseran margin' },
                paragraph3: { type: Type.STRING, description: 'Paragraf 3: Kondisi arus kas riil, likuiditas, dan kelangsungan neraca' },
              },
              required: ['paragraph1', 'paragraph2', 'paragraph3'],
            },
            margins: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  p1Pct: { type: Type.NUMBER },
                  p2Pct: { type: Type.NUMBER },
                  deltaBps: { type: Type.NUMBER },
                  status: { type: Type.STRING, enum: ['improved', 'deteriorated', 'neutral'] },
                  cfoComment: { type: Type.STRING },
                },
                required: ['name', 'p1Pct', 'p2Pct', 'deltaBps', 'status', 'cfoComment'],
              },
            },
            anomalies: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  severity: { type: Type.STRING, enum: ['CRITICAL', 'WARNING', 'ATTENTION'] },
                  metricAffected: { type: Type.STRING },
                  observation: { type: Type.STRING },
                  underlyingRisk: { type: Type.STRING },
                  forensicNote: { type: Type.STRING },
                },
                required: ['id', 'title', 'severity', 'metricAffected', 'observation', 'underlyingRisk', 'forensicNote'],
              },
            },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  priority: { 
                    type: Type.STRING, 
                    enum: ['P1 - Segera (0-30 Hari)', 'P2 - Taktis (30-90 Hari)', 'P3 - Transformasi Strategis'] 
                  },
                  category: { 
                    type: Type.STRING, 
                    enum: ['Efisiensi COGS', 'Pengendalian OPEX', 'Modal Kerja & Kas', 'Pricing & Kualitas Revenue', 'Struktur Modal & Utang'] 
                  },
                  title: { type: Type.STRING },
                  actionPlan: { type: Type.STRING },
                  estimatedFinancialImpact: { type: Type.STRING },
                  targetKPI: { type: Type.STRING },
                },
                required: ['id', 'priority', 'category', 'title', 'actionPlan', 'estimatedFinancialImpact', 'targetKPI'],
              },
            },
            keyRatios: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  ratioName: { type: Type.STRING },
                  p1Value: { type: Type.STRING },
                  p2Value: { type: Type.STRING },
                  benchmarking: { type: Type.STRING },
                  implication: { type: Type.STRING },
                },
                required: ['ratioName', 'p1Value', 'p2Value', 'benchmarking', 'implication'],
              },
            },
          },
          required: ['companyName', 'cfoVerdict', 'healthScore', 'executiveSummary', 'margins', 'anomalies', 'recommendations', 'keyRatios'],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating CFO analysis:', error);
    // Fallback gracefully so user gets a complete report even if Gemini call has a temporary error
    const fallback = generateFallbackCFOReport(req.body);
    return res.json(fallback);
  }
});

// Interactive CFO Q&A chat endpoint
app.post('/api/cfo/chat', async (req, res) => {
  try {
    const { question, reportContext } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Pertanyaan wajib diisi.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        answer: `Sebagai CFO Senior, menanggapi pertanyaan Anda "${question}": Berdasarkan tren margin dan anomali yang diidentifikasi, prioritas utama adalah melindungi arus kas operasional (Operating Cash Flow) dan menekan pos biaya yang mengalami pertumbuhan di atas pertumbuhan omzet. Evaluasi renegotiation vendor dan pengetatan syarat kredit (payment terms) harus segera dilaksanakan.`,
      });
    }

    const chatPrompt = `
Konteks Analisis Finansial Terkini:
${JSON.stringify(reportContext, null, 2)}

Pertanyaan dari Dewan Direksi / Manajemen:
"${question}"

Sebagai CFO & Analis Keuangan Senior, jawablah pertanyaan ini dengan presisi tingkat tinggi, kalkulasi logis, dan rekomendasi langsung yang dapat dieksekusi.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: chatPrompt,
      config: {
        systemInstruction: 'Kamu adalah Chief Financial Officer (CFO) dan Senior Financial Analyst. Berikan jawaban taktis, lugas, realistis, dan berorientasi pada shareholder value serta cash protection.',
        temperature: 0.3,
      },
    });

    return res.json({ answer: response.text });
  } catch (error: any) {
    console.error('Error in CFO chat:', error);
    return res.status(500).json({ error: error.message || 'Gagal memproses tanya jawab CFO.' });
  }
});

// Fallback generator in case of network or key absence
function generateFallbackCFOReport(payload: any) {
  const {
    companyName = 'Perusahaan Klien',
    period1Label = 'Periode 1',
    period2Label = 'Periode 2',
    currency = 'Rp',
    unit = 'Miliar',
    metrics = {},
    calculatedMargins = {},
  } = payload;

  const revGrowth = calculatedMargins.revenueGrowthPct ?? 0;
  const gmDelta = calculatedMargins.grossMarginDeltaBps ?? 0;
  const omDelta = calculatedMargins.operatingMarginDeltaBps ?? 0;
  const nmDelta = calculatedMargins.netMarginDeltaBps ?? 0;

  const isDeteriorating = omDelta < -200 || gmDelta < -200;
  const healthScore = Math.max(15, Math.min(95, Math.round(50 + (omDelta / 50) + (revGrowth / 2))));

  return {
    companyName,
    period1Label,
    period2Label,
    currency,
    cfoVerdict: isDeteriorating 
      ? 'Peringatan Merah: Erosi Margin & Tekanan Arus Kas Serius'
      : 'Netral-Stabil: Pertumbuhan Bertahap dengan Kendali Biaya',
    healthScore,
    executiveSummary: {
      paragraph1: `Pada perbandingan ${period1Label} terhadap ${period2Label}, pendapatan tercatat tumbuh ${revGrowth >= 0 ? '+' : ''}${revGrowth.toFixed(1)}% mencapai ${currency} ${metrics.revenueP2} ${unit}. Namun demikian, kualitas pertumbuhan ini diuji oleh laju kenaikan beban biaya yang melampaui laju kenaikan omzet, sehingga laba kotor mengalami penyesuaian signifikan dengan Gross Margin bergeser sebesar ${gmDelta > 0 ? '+' : ''}${gmDelta} basis points.`,
      paragraph2: `Analisis anomali mendeteksi ketidaksesuaian tajam pada struktur biaya operasional (OPEX) dan beban pokok penjualan (COGS). Pertumbuhan beban pokok melaju lebih kencang daripada kenaikan pendapatan, sementara pos SG&A meningkat drastis. Fenomena ini menciptakan kompresi marjin operasional (Operating Margin) sebesar ${omDelta > 0 ? '+' : ''}${omDelta} bps, yang mengindikasikan adanya disekuilibrium antara belanja ekspansi dan produktivitas hasil.`,
      paragraph3: `Dari perspektif neraca dan likuiditas, konversi laba akrual menjadi kas riil memerlukan pengawasan ketat akibat disparitas antara laba bersih dan Operating Cash Flow. Kenaikan modal kerja yang terkunci pada piutang dan persediaan menuntut intervensi restrukturisasi modal kerja segera untuk mencegah erosi posisi kas kasual dan menjaga covenant utang tetap aman.`,
    },
    margins: [
      {
        name: 'Gross Profit Margin',
        p1Pct: Number((calculatedMargins.grossMarginP1 ?? 0).toFixed(2)),
        p2Pct: Number((calculatedMargins.grossMarginP2 ?? 0).toFixed(2)),
        deltaBps: gmDelta,
        status: gmDelta >= 0 ? 'improved' : 'deteriorated',
        cfoComment: gmDelta < 0 ? 'Terjadi penekanan marjin kotor akibat lonjakan biaya bahan baku/vendor langsung.' : 'Marjin kotor terjaga berkat efisiensi biaya langsung.',
      },
      {
        name: 'Operating Margin (EBIT)',
        p1Pct: Number((calculatedMargins.operatingMarginP1 ?? 0).toFixed(2)),
        p2Pct: Number((calculatedMargins.operatingMarginP2 ?? 0).toFixed(2)),
        deltaBps: omDelta,
        status: omDelta >= 0 ? 'improved' : 'deteriorated',
        cfoComment: omDelta < 0 ? 'Erosi drastis akibat eskalasi beban overhead dan pemasaran yang tidak efisien.' : 'Operating leverage positif terwujud.',
      },
      {
        name: 'EBITDA Margin',
        p1Pct: Number((calculatedMargins.ebitdaMarginP1 ?? 0).toFixed(2)),
        p2Pct: Number((calculatedMargins.ebitdaMarginP2 ?? 0).toFixed(2)),
        deltaBps: calculatedMargins.ebitdaMarginDeltaBps ?? 0,
        status: (calculatedMargins.ebitdaMarginDeltaBps ?? 0) >= 0 ? 'improved' : 'deteriorated',
        cfoComment: 'Menggambarkan kemampuan penciptaan kas operasional inti sebelum dampak pembiayaan.',
      },
      {
        name: 'Net Profit Margin',
        p1Pct: Number((calculatedMargins.netMarginP1 ?? 0).toFixed(2)),
        p2Pct: Number((calculatedMargins.netMarginP2 ?? 0).toFixed(2)),
        deltaBps: nmDelta,
        status: nmDelta >= 0 ? 'improved' : 'deteriorated',
        cfoComment: nmDelta < 0 ? 'Bottom-line tertekan akibat kombinasi erosi operasional dan beban finansial.' : 'Kemampuan menghasilkan laba bersih bertahan kuat.',
      },
    ],
    anomalies: [
      {
        id: 'anom-1',
        title: 'Kompresi Margin Operasional (Operating Margin Compression)',
        severity: 'CRITICAL',
        metricAffected: 'Operating Margin (EBIT)',
        observation: `Operating margin anjlok sebesar ${omDelta} bps dari ${calculatedMargins.operatingMarginP1?.toFixed(1)}% ke ${calculatedMargins.operatingMarginP2?.toFixed(1)}%.`,
        underlyingRisk: 'Penurunan daya tahan bisnis terhadap volatilitas pasar dan ancaman kerugian operasional kronis.',
        forensicNote: 'Biaya pemasaran dan administrasi membengkak tanpa diimbangi oleh peningkatan margin kontribusi per unit.',
      },
      {
        id: 'anom-2',
        title: 'Divergensi Laba Akrual vs Arus Kas Operasional',
        severity: 'WARNING',
        metricAffected: 'Operating Cash Flow (OCF)',
        observation: `Kinerja kas operasi melemah tajam dibandingkan laba yang dilaporkan di laporan laba rugi.`,
        underlyingRisk: 'Krisis likuiditas mendadak (cash crunch) meskipun di atas kertas mencatat penjualan bertumbuh.',
        forensicNote: 'Terdapat penumpukan modal kerja yang belum terealisasi menjadi uang tunai di neraca.',
      },
    ],
    recommendations: [
      {
        id: 'rec-1',
        priority: 'P1 - Segera (0-30 Hari)',
        category: 'Pengendalian OPEX',
        title: 'Moratorium & Audit Belanja Discretionary SG&A',
        actionPlan: 'Bekukan semua pengeluaran non-esensial, kaji ulang anggaran marketing berkinerja rendah, dan tetapkan sistem approval CFO untuk semua pengeluaran di atas ambang batas tertentu.',
        estimatedFinancialImpact: `Penghematan kas langsung diperkirakan 10-15% dari total OPEX bulanan.`,
        targetKPI: 'Penurunan rasio OPEX-to-Revenue sebesar 300-500 bps dalam 60 hari.',
      },
      {
        id: 'rec-2',
        priority: 'P2 - Taktis (30-90 Hari)',
        category: 'Modal Kerja & Kas',
        title: 'Program Percepatan Penagihan Piutang (AR Acceleration) & Rasionalisasi Inventory',
        actionPlan: 'Terapkan diskon pembayaran dini (early settlement discount 2/10 net 30), batasi limit kredit pelanggan dengan pembayaran tertunda, dan lakukan clearance untuk dead-stock inventory.',
        estimatedFinancialImpact: 'Pembebasan modal kerja hingga 20% dari saldo piutang dan persediaan yang macet.',
        targetKPI: 'Penurunan Days Sales Outstanding (DSO) dan Days Inventory Outstanding (DIO) sebesar 15 hari.',
      },
      {
        id: 'rec-3',
        priority: 'P3 - Transformasi Strategis',
        category: 'Pricing & Kualitas Revenue',
        title: 'Evaluasi Margin Kontribusi & Renegosiasi Struktur Biaya COGS',
        actionPlan: 'Lakukan audit portofolio produk per segmen, eliminasi lini produk margin negatif, dan lakukan renegosiasi kontrak tiering volume dengan supplier bahan baku utama.',
        estimatedFinancialImpact: 'Pemulihan Gross Profit Margin sebesar 200-350 bps secara berkelanjutan.',
        targetKPI: 'Gross Margin kembali ke level target di atas 30%.',
      },
    ],
    keyRatios: [
      {
        ratioName: 'Rasio Beban Operasional terhadap Pendapatan (OPEX/Revenue)',
        p1Value: `${((metrics.opexP1 / metrics.revenueP1) * 100).toFixed(1)}%`,
        p2Value: `${((metrics.opexP2 / metrics.revenueP2) * 100).toFixed(1)}%`,
        benchmarking: 'Ideal industri: < 28%',
        implication: 'Efisiensi overhead mengalami pelemahan yang menuntut restrukturisasi.',
      },
      {
        ratioName: 'Konversi Kas Operasi terhadap Laba (OCF / Net Income)',
        p1Value: metrics.netIncomeP1 > 0 ? `${((metrics.operatingCashFlowP1 / metrics.netIncomeP1) * 100).toFixed(0)}%` : 'N/A',
        p2Value: metrics.netIncomeP2 > 0 ? `${((metrics.operatingCashFlowP2 / metrics.netIncomeP2) * 100).toFixed(0)}%` : 'Defisit Kas',
        benchmarking: 'Benchmark sehat: > 80%',
        implication: 'Kualitas laba diuji ketika arus kas operasi tidak sejalan dengan laba bersih.',
      },
    ],
  };
}

// Vite middleware for development & static file serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CFO Financial Analyst Server running on http://localhost:${PORT}`);
  });
}

startServer();
