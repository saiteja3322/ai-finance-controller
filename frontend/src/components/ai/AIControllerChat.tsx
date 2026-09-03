import React, { useState, useEffect } from 'react';
import { ChatMessage } from '../../types';
import { Bot, Send, User, Sparkles, Database, ShieldCheck, RefreshCw } from 'lucide-react';

interface AIControllerChatProps {
  onSendMessage: (prompt: string) => Promise<ChatMessage>;
  initialPrompt?: string;
}

export const AIControllerChat: React.FC<AIControllerChatProps> = ({ onSendMessage, initialPrompt }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: `Hello! I am your **AI Finance Controller**. I analyze your unified financial ledger across Razorpay, PhonePe, GPay, Paytm, Bank, and POS systems.

All numerical figures are calculated deterministically directly from your database. Ask me any question about sales, settlement gaps, provider performance, or cash-flow forecasts.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const sampleQuestions = [
    "Why are settlements lower than revenue?",
    "Where is my pending money?",
    "Show today's reconciliation issues.",
    "Which provider has the highest failure rate?",
    "What should I investigate first?",
  ];

  const handleSend = async (textToSend?: string) => {
    const messageText = textToSend || prompt;
    if (!messageText.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setPrompt('');
    setLoading(true);

    try {
      const aiResponse = await onSendMessage(messageText);
      setMessages((prev) => [...prev, aiResponse]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          sender: 'ai',
          text: '⚠️ Unable to process query. Please check your backend connection.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Process initial prompt if passed
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSend(initialPrompt);
    }
  }, [initialPrompt]);

  return (
    <div className="bg-[#141414] border border-[#252525] rounded-2xl h-[calc(100vh-8.5rem)] flex flex-col justify-between shadow-xl overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-[#252525] bg-[#0B0B0B] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#00D09C] flex items-center justify-center text-black shadow-lg shadow-[#00D09C]/20">
            <Bot className="w-6 h-6 text-black" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-white font-['Outfit']">AI Finance Controller Assistant</h3>
              <span className="text-[10px] font-semibold bg-[#00D09C]/10 text-[#00D09C] border border-[#00D09C]/30 px-2 py-0.5 rounded-full flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-[#00D09C]" />
                <span>Verified DB Tools Engine</span>
              </span>
            </div>
            <p className="text-xs text-gray-400">Zero Hallucinations • Function Calling • Real-time DB Queries</p>
          </div>
        </div>

        <button
          onClick={() => setMessages(messages.slice(0, 1))}
          className="text-xs text-gray-400 hover:text-gray-200 flex items-center space-x-1 bg-[#1E1E1E] border border-[#252525] px-2.5 py-1 rounded-lg transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Message History */}
      <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold shadow-md shrink-0 ${
                msg.sender === 'user'
                  ? 'bg-[#00D09C] text-black'
                  : 'bg-[#1E1E1E] text-[#00D09C] border border-[#00D09C]/30'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4 text-black" /> : <Bot className="w-4 h-4 text-[#00D09C]" />}
            </div>

            <div
              className={`max-w-2xl rounded-2xl p-4 leading-relaxed font-sans ${
                msg.sender === 'user'
                  ? 'bg-[#00D09C] text-black font-medium rounded-tr-none'
                  : 'bg-[#1E1E1E] border border-[#252525] text-gray-100 rounded-tl-none space-y-3'
              }`}
            >
              {/* Tool Execution Badges */}
              {msg.toolsExecuted && msg.toolsExecuted.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-[#252525] text-[10px] font-mono text-[#00D09C]">
                  <Database className="w-3.5 h-3.5 text-[#00D09C]" />
                  <span className="text-gray-400 font-bold">Executed DB Tools:</span>
                  {msg.toolsExecuted.map((tool, idx) => (
                    <span key={idx} className="bg-[#00D09C]/10 border border-[#00D09C]/30 px-2 py-0.5 rounded text-[#00D09C]">
                      {tool}
                    </span>
                  ))}
                </div>
              )}

              <div className="whitespace-pre-wrap">{msg.text}</div>

              <div className={`text-[10px] text-right mt-1 font-mono ${msg.sender === 'user' ? 'text-black/70' : 'text-gray-500'}`}>
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#00D09C] flex items-center justify-center text-black">
              <Bot className="w-4 h-4 animate-spin text-black" />
            </div>
            <div className="bg-[#1E1E1E] border border-[#252525] rounded-xl px-4 py-3 text-xs text-[#00D09C] flex items-center space-x-2">
              <Sparkles className="w-4 h-4 animate-pulse text-[#00D09C]" />
              <span>Querying verified financial database tools...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Questions & Input Bar */}
      <div className="p-4 border-t border-[#252525] bg-[#0B0B0B] space-y-3">
        {/* Sample Questions Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
          <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider whitespace-nowrap">
            Suggested:
          </span>
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="bg-[#1E1E1E] hover:bg-[#252525] text-gray-300 hover:text-white border border-[#252525] px-3 py-1 rounded-full text-xs whitespace-nowrap transition"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Ask AI Finance Controller (e.g., 'Why are settlements lower than revenue?')"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-[#141414] border border-[#252525] rounded-xl px-4 py-2.5 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#00D09C]"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !prompt.trim()}
            className="bg-[#00D09C] hover:bg-[#00B88A] disabled:opacity-50 text-black font-semibold px-4 py-2.5 rounded-xl text-xs shadow-md transition flex items-center space-x-1.5"
          >
            <Send className="w-4 h-4 text-black" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
