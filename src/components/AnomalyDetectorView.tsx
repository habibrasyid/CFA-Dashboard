import React, { useState } from 'react';
import { AnomalyItem } from '../types';
import { AlertOctagon, AlertTriangle, Info, CheckCircle2, ShieldAlert } from 'lucide-react';

interface AnomalyDetectorViewProps {
  anomalies: AnomalyItem[];
  companyName: string;
}

export function AnomalyDetectorView({ anomalies, companyName }: AnomalyDetectorViewProps) {
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING'>('ALL');

  const filtered = anomalies.filter((a) => {
    if (filter === 'ALL') return true;
    return a.severity === filter;
  });

  const getSeverityStyle = (sev: AnomalyItem['severity']) => {
    switch (sev) {
      case 'CRITICAL':
        return {
          cardBg: 'bg-rose-50/40 border-rose-200',
          badge: 'bg-rose-100 text-rose-800 border-rose-200',
          icon: <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />,
          label: 'Anomali Kritis (Tingkat Risiko Tinggi)',
        };
      case 'WARNING':
        return {
          cardBg: 'bg-amber-50/40 border-amber-200',
          badge: 'bg-amber-100 text-amber-800 border-amber-200',
          icon: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />,
          label: 'Peringatan Operasional (Perhatian Khusus)',
        };
      case 'ATTENTION':
      default:
        return {
          cardBg: 'bg-slate-50/70 border-slate-200',
          badge: 'bg-slate-200 text-slate-800 border-slate-300',
          icon: <Info className="w-4 h-4 text-blue-600 shrink-0" />,
          label: 'Observasi Finansial (Monitoring)',
        };
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-rose-100 text-rose-700">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
              Identifikasi Anomali Laporan Keuangan
            </h3>
            <p className="text-xs text-slate-500">
              Ditemukan {anomalies.length} anomali / disekuilibrium metrik pada {companyName}
            </p>
          </div>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-1 bg-slate-200/70 p-0.5 rounded-lg text-xs font-semibold">
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Semua ({anomalies.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('CRITICAL')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filter === 'CRITICAL' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            Kritis ({anomalies.filter((a) => a.severity === 'CRITICAL').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('WARNING')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filter === 'WARNING' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            Warning ({anomalies.filter((a) => a.severity === 'WARNING').length})
          </button>
        </div>
      </div>

      {/* Anomalies List */}
      <div className="p-4 sm:p-5 space-y-3.5">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
            <p className="text-xs">Tidak ditemukan anomali pada filter ini.</p>
          </div>
        ) : (
          filtered.map((anomaly, idx) => {
            const style = getSeverityStyle(anomaly.severity);

            return (
              <div
                key={anomaly.id || idx}
                className={`p-4 rounded-xl border ${style.cardBg} transition-all space-y-2`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {style.icon}
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      {anomaly.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-mono text-slate-500">
                      Metrik: <strong className="text-slate-800">{anomaly.metricAffected}</strong>
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${style.badge}`}>
                      {anomaly.severity}
                    </span>
                  </div>
                </div>

                {/* Observation & Risk */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                  <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200/80">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                      Observasi Empiris
                    </span>
                    <p className="text-slate-800 font-medium leading-relaxed">
                      {anomaly.observation}
                    </p>
                  </div>

                  <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200/80">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-rose-600 mb-0.5">
                      Potensi Risiko & Dampak Finansial
                    </span>
                    <p className="text-slate-800 font-medium leading-relaxed">
                      {anomaly.underlyingRisk}
                    </p>
                  </div>
                </div>

                {/* Forensic Note */}
                <div className="bg-slate-900 text-slate-200 px-3 py-2 rounded-lg text-xs font-mono flex items-start gap-2">
                  <span className="text-amber-400 font-bold shrink-0">CFO Audit:</span>
                  <p className="text-slate-300 font-normal leading-relaxed">
                    {anomaly.forensicNote}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
