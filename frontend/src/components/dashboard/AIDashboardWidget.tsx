import React, { useState } from 'react';
import { Bot, Send, Sparkles, HelpCircle, ArrowRight, Loader2 } from 'lucide-react';

interface AIDashboardWidgetProps {
  onAskAI: (prompt: string) => void;
}

export const AIDashboardWidget: React.FC<AIDashboardWidgetProps> = ({ onAskAI }) => {
  const [inputPrompt, setInputPrompt] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const suggestedQuestions = [
    "Why are settlements lower than revenue?",
    "Where is my pending money?",
    "Show today's reconciliation issues.",
    "Which provider has the highest failure rate?",
    "What should I investigate first?",
  ];

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputPrompt.trim()) return;
    setSubmitting(true);
    onAskAI(inputPrompt.trim());
    setInputPrompt('');
    setTimeout(() => setSubmitting(false), 500);
  };

  const handleSelectQuestion = (q: string) => {
    setSubmitting(true);
    onAskAI(q);
    setTimeout(() => setSubmitting(false), 500);
  };

  return (
    <div className="bg-[#141414] border border-[#252525] rounded-2xl p-6 shadow-xl space-y-5 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#252525] pb-4 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#00D09C] flex items-center justify-center shadow-lg shadow-[#00D09C]/20">
            <Bot className="w-6 h-6 text-black" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-extrabold text-white font-['Outfit'] tracking-tight">AI Finance Controller</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#00D09C]/10 text-[#00D09C] border border-[#00D09C]/30 px-2 py-0.5 rounded-full flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-[#00D09C] animate-pulse" />
                <span>Deterministic DB Reasoning</span>
              </span>
            </div>
            <p className="text-xs text-gray-400">Ask questions about your business finances.</p>
          </div>
        </div>

        <div className="text-xs text-gray-400 flex items-center space-x-1">
          <HelpCircle className="w-4 h-4 text-[#00D09C]" />
          <span>Real-time database tools & live verification</span>
        </div>
      </div>

      {/* Prominent Input Box */}
      <form onSubmit={handleSubmit} className="relative z-10">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Ask about your finances... (e.g. 'Why is there a ₹5,000 mismatch in Razorpay?')"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            className="w-full bg-[#0B0B0B] border border-[#252525] hover:border-[#00D09C]/40 focus:border-[#00D09C] rounded-xl py-3.5 pl-4 pr-28 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#00D09C]/30 shadow-inner transition font-medium"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || submitting}
            className="absolute right-2 bg-[#00D09C] hover:bg-[#00B88A] text-black font-semibold px-4 py-2 rounded-lg text-xs flex items-center space-x-1.5 shadow-md transition disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin text-black" />
            ) : (
              <>
                <span>Ask AI</span>
                <Send className="w-3.5 h-3.5 text-black" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Suggested Questions Pills */}
      <div className="space-y-2 relative z-10">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Suggested Questions</span>
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectQuestion(q)}
              className="bg-[#1E1E1E] hover:bg-[#252525] border border-[#252525] hover:border-[#00D09C]/40 text-gray-200 hover:text-white px-3.5 py-1.5 rounded-xl text-xs flex items-center space-x-1.5 transition shadow-sm group"
            >
              <span>"{q}"</span>
              <ArrowRight className="w-3 h-3 text-[#00D09C] group-hover:translate-x-0.5 transition-transform" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
