import React, { useState } from 'react';
import { RecommendationItem } from '../types';
import { CheckCircle2, Clock, Target, DollarSign, ArrowRight, Layers } from 'lucide-react';

interface RecommendationsViewProps {
  recommendations: RecommendationItem[];
  companyName: string;
}

export function RecommendationsView({ recommendations, companyName }: RecommendationsViewProps) {
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});

  const toggleComplete = (id: string) => {
    setCompletedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getPriorityStyle = (priority: RecommendationItem['priority']) => {
    if (priority.includes('P1')) {
      return {
        badge: 'bg-rose-100 text-rose-800 border-rose-200',
        bar: 'bg-rose-600',
      };
    }
    if (priority.includes('P2')) {
      return {
        badge: 'bg-amber-100 text-amber-800 border-amber-200',
        bar: 'bg-amber-600',
      };
    }
    return {
      badge: 'bg-blue-100 text-blue-800 border-blue-200',
      bar: 'bg-blue-600',
    };
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
              Rekomendasi Tindakan Strategis & Taktis CFO
            </h3>
            <p className="text-xs text-slate-500">
              Rencana aksi prioritas untuk pemulihan margin dan proteksi kas {companyName}
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Progress Roadmap:{' '}
          <span className="font-bold text-slate-900">
            {Object.values(completedMap).filter(Boolean).length} / {recommendations.length} Selesai
          </span>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="p-4 sm:p-5 space-y-4">
        {recommendations.map((rec, idx) => {
          const isDone = !!completedMap[rec.id || String(idx)];
          const pStyle = getPriorityStyle(rec.priority);

          return (
            <div
              key={rec.id || idx}
              className={`p-4 rounded-xl border transition-all ${
                isDone
                  ? 'bg-slate-50/50 border-slate-200 opacity-60'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  {/* Checkbox button */}
                  <button
                    type="button"
                    onClick={() => toggleComplete(rec.id || String(idx))}
                    className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center transition-colors ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : 'border border-slate-300 hover:border-slate-400 bg-white'
                    }`}
                  >
                    {isDone && <CheckCircle2 className="w-4 h-4" />}
                  </button>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${pStyle.badge}`}>
                        {rec.priority}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {rec.category}
                      </span>
                    </div>

                    <h4
                      className={`text-sm font-bold text-slate-900 ${
                        isDone ? 'line-through text-slate-400' : ''
                      }`}
                    >
                      {rec.title}
                    </h4>
                  </div>
                </div>
              </div>

              {/* Action Plan */}
              <div className="mt-3 pl-8">
                <p className="text-xs leading-relaxed text-slate-700 font-normal">
                  {rec.actionPlan}
                </p>

                {/* Impact & Target KPI */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-start gap-2 text-xs">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Estimasi Dampak Finansial
                      </span>
                      <span className="font-semibold text-slate-800">
                        {rec.estimatedFinancialImpact}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-xs">
                    <Target className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Target Metrik / KPI
                      </span>
                      <span className="font-semibold text-slate-800">
                        {rec.targetKPI}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
