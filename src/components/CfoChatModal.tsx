import React, { useState } from 'react';
import { CFOAnalysisReport } from '../types';
import { X, Send, Bot, User, Sparkles, MessageSquare } from 'lucide-react';

interface CfoChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: CFOAnalysisReport;
  initialPrompt?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'cfo';
  text: string;
  timestamp: string;
}

export function CfoChatModal({
  isOpen,
  onClose,
  report,
  initialPrompt = '',
}: CfoChatModalProps) {
  if (!isOpen) return null;

  const [input, setInput] = useState(initialPrompt);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'cfo',
      text: `Halo, saya Chief Financial Officer (CFO) & Analis Keuangan Senior Anda. Saya telah menelaah laporan keuangan ${report.companyName} (${report.period1Label} vs ${report.period2Label}). Anda dapat menanyakan implikasi likuiditas, simulasi skenario 'what-if', strategi pengetatan OPEX, atau audit piutang dan persediaan. Apa yang ingin Anda diskusikan?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const quickPrompts = [
    'Bagaimana mitigasi penurunan margin kotor jika COGS naik lagi 5%?',
    'Apakah lonjakan piutang usaha mengindikasikan risiko bad debt parah?',
    'Rincikan langkah 30 hari pertama untuk memulihkan arus kas operasi.',
    'Berapa rasio leverage utang yang aman untuk struktur neraca saat ini?',
  ];

  const handleSend = async (textToSend?: string) => {
    const q = (textToSend || input).trim();
    if (!q || loading) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/cfo/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          reportContext: {
            companyName: report.companyName,
            period1Label: report.period1Label,
            period2Label: report.period2Label,
            cfoVerdict: report.cfoVerdict,
            healthScore: report.healthScore,
            executiveSummary: report.executiveSummary,
            margins: report.margins,
            anomalies: report.anomalies,
          },
        }),
      });

      const data = await res.json();
      const cfoMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'cfo',
        text: data.answer || 'Mohon maaf, terjadi kendala saat merumuskan evaluasi CFO.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, cfoMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'cfo',
        text: 'Terjadi kendala jaringan saat menghubungi meja CFO. Silakan coba kembali.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl flex flex-col h-[640px] max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">
                Meja Konsultasi Senior CFO & Analis Keuangan
              </h3>
              <p className="text-[11px] text-slate-300">
                Sesi Interaktif Diskusi Keuangan • {report.companyName}
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

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'cfo' && (
                <div className="w-7 h-7 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold shadow-2xs">
                  CFO
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-800 shadow-xs'
                }`}
              >
                <p className="whitespace-pre-line">{m.text}</p>
                <span
                  className={`block text-[10px] mt-1.5 ${
                    m.sender === 'user' ? 'text-slate-400 text-right' : 'text-slate-400'
                  }`}
                >
                  {m.timestamp}
                </span>
              </div>
              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-2.5 items-center text-xs text-slate-500">
              <div className="w-7 h-7 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center shrink-0 text-xs font-bold">
                CFO
              </div>
              <div className="bg-white border border-slate-200 px-3 py-2 rounded-xl flex items-center gap-2 shadow-xs">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="font-medium text-slate-600">
                  CFO sedang mengkaji kalkulasi & dampak finansial...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-2 border-t border-slate-100 bg-white overflow-x-auto flex gap-1.5 scrollbar-none">
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(qp)}
              disabled={loading}
              className="text-[11px] whitespace-nowrap bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200 transition-colors shrink-0"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ketik pertanyaan untuk CFO (misal: 'Simulasikan jika COGS naik 5%')..."
              className="flex-1 text-xs px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-slate-800"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-50 transition-colors shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
