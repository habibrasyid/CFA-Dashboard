import React, { useState } from 'react';
import { CFOAnalysisReport } from '../types';
import { formatBps } from '../utils/finance';
import {
  FileText,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Percent,
  Compass,
} from 'lucide-react';

interface ExecutiveSummaryViewProps {
  report: CFOAnalysisReport;
  onAskCfo: (initialPrompt?: string) => void;
}

export function ExecutiveSummaryView({ report, onAskCfo }: ExecutiveSummaryViewProps) {
  const [copied, setCopied] = useState(false);

  const fullExecutiveText = `RINGKASAN EKSEKUTIF CFO - ${report.companyName}
Periode: ${report.period1Label} vs ${report.period2Label}
Vonis Finansial: ${report.cfoVerdict} (Skor Kesehatan: ${report.healthScore}/100)

PARAGRAF 1 - KINERJA PENDAPATAN & PROFITABILITAS INTI:
${report.executiveSummary.paragraph1}

PARAGRAF 2 - ANOMALI FINANSIAL & ANALISIS MARGIN:
${report.executiveSummary.paragraph2}

PARAGRAF 3 - ARUS KAS, LIKUIDITAS & RISIKO NERACA:
${report.executiveSummary.paragraph3}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullExecutiveText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getScoreBadge = (score: number) => {
    if (score >= 75) {
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        text: 'Sehat & Solid',
      };
    }
    if (score >= 50) {
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-300',
        text: 'Waspada / Perlu Restrukturisasi',
      };
    }
    return {
      bg: 'bg-rose-50 text-rose-800 border-rose-300',
      text: 'Kritis / Tekanan Likuiditas Parah',
    };
  };

  const scoreBadge = getScoreBadge(report.healthScore);

  return (
    <div className="space-y-6">
      {/* Top Banner: CFO Verdict & Corporate Health */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500">
                Laporan Opini CFO & Diagnostik Finansial
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-bold border ${scoreBadge.bg}`}>
                Skor Kesehatan: {report.healthScore}/100 • {scoreBadge.text}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {report.cfoVerdict}
            </h2>
            <p className="text-xs text-slate-500">
              Analisis Komparatif {report.companyName} ({report.period1Label} vs {report.period2Label})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={copyToClipboard}
              className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Memo Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Memo Eksekutif</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => onAskCfo('Jelaskan langkah prioritas tercepat dalam 30 hari ke depan.')}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Compass className="w-3.5 h-3.5 text-amber-300" />
              <span>Konsultasi CFO</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Section: Ringkasan Eksekutif (Maksimal 3 Paragraf) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
              Ringkasan Eksekutif (Maksimal 3 Paragraf)
            </h3>
          </div>
          <span className="text-[11px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
            Standar Pelaporan C-Suite
          </span>
        </div>

        <div className="p-5 sm:p-6 space-y-5 divide-y divide-slate-100">
          {/* Paragraf 1 */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center">
                1
              </span>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Sintesis Kinerja Pendapatan & Profitabilitas Inti
              </h4>
            </div>
            <p className="text-sm leading-relaxed text-slate-700 pl-7 font-normal">
              {report.executiveSummary.paragraph1}
            </p>
          </div>

          {/* Paragraf 2 */}
          <div className="space-y-1.5 pt-4">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[11px] font-bold flex items-center justify-center">
                2
              </span>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Bedah Anomali Finansial & Dinamika Margin
              </h4>
            </div>
            <p className="text-sm leading-relaxed text-slate-700 pl-7 font-normal">
              {report.executiveSummary.paragraph2}
            </p>
          </div>

          {/* Paragraf 3 */}
          <div className="space-y-1.5 pt-4">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">
                3
              </span>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Likuiditas, Arus Kas & Posisi Kelangsungan Usaha (Going Concern)
              </h4>
            </div>
            <p className="text-sm leading-relaxed text-slate-700 pl-7 font-normal">
              {report.executiveSummary.paragraph3}
            </p>
          </div>
        </div>
      </div>

      {/* Margin Decomposition Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Percent className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
              Tabel Diagnostik Margin & Perubahan Basis Points (bps)
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">100 bps = 1.00%</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-4">Metrik Margin</th>
                <th className="py-2.5 px-3 text-right">{report.period1Label}</th>
                <th className="py-2.5 px-3 text-right">{report.period2Label}</th>
                <th className="py-2.5 px-3 text-right">Perubahan (bps)</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-4">Catatan Analisis CFA Desk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {report.margins.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80">
                  <td className="py-2.5 px-4 font-bold text-slate-900">
                    {m.name}
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-slate-700">
                    {m.p1Pct.toFixed(2)}%
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-slate-900">
                    {m.p2Pct.toFixed(2)}%
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] ${
                        m.deltaBps >= 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {formatBps(m.deltaBps)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {m.status === 'improved' ? (
                      <span className="inline-flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        <TrendingUp className="w-3 h-3 mr-1" /> Ekspansi
                      </span>
                    ) : m.status === 'deteriorated' ? (
                      <span className="inline-flex items-center text-[10px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                        <TrendingDown className="w-3 h-3 mr-1" /> Kompresi
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-500">
                        Stabil
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-xs text-slate-600">
                    {m.cfoComment}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Financial Ratios Benchmarking */}
      {report.keyRatios && report.keyRatios.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/70">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
              Rasio Kunci & Evaluasi Forensik Neraca
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {report.keyRatios.map((ratio, i) => (
              <div key={i} className="p-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{ratio.ratioName}</span>
                  <span className="text-[11px] text-slate-400">{ratio.benchmarking}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-slate-500">
                    {report.period1Label}: <strong className="text-slate-800">{ratio.p1Value}</strong>
                  </span>
                  <span className="text-xs text-slate-400">→</span>
                  <span className="text-xs text-slate-900">
                    {report.period2Label}: <strong className="text-slate-900">{ratio.p2Value}</strong>
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 italic">
                  "{ratio.implication}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
