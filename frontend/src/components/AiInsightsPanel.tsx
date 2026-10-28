import React, { useState, useEffect, useRef } from 'react';
import { PassVector, Player } from '../types';
import { AiInsightResponse, generateMockAiInsight, PRESET_CHAT_ANSWERS } from '../data/aiInsightsMock';

interface AiInsightsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  vectors: PassVector[];
  allPlayers: Player[];
  homeTeamName: string;
  awayTeamName: string;
  onDeleteVector?: (index: number) => void;
  onSelectPlayer?: (id: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text?: string;
  insight?: AiInsightResponse;
  timestamp: string;
}

export const AiInsightsPanel: React.FC<AiInsightsPanelProps> = ({
  isOpen,
  onClose,
  vectors,
  allPlayers,
  homeTeamName,
  awayTeamName,
  onDeleteVector,
  onSelectPlayer
}) => {
  const [insight, setInsight] = useState<AiInsightResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom when new messages or insights appear
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, insight, isLoading]);

  if (!isOpen) return null;

  const getPlayer = (id: string) => allPlayers.find((p) => p.id === id);

  const handleGenerateInsights = () => {
    setIsLoading(true);
    setTimeout(() => {
      const generated = generateMockAiInsight(vectors, allPlayers, homeTeamName, awayTeamName);
      setInsight(generated);
      setIsLoading(false);
    }, 750);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = inputValue.trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputValue('');

    // Generate responsive response
    setTimeout(() => {
      let reply = PRESET_CHAT_ANSWERS.default;
      const lower = query.toLowerCase();
      if (lower.includes('risk') || lower.includes('turnover') || lower.includes('danger')) {
        reply = PRESET_CHAT_ANSWERS.risk;
      } else if (lower.includes('press') || lower.includes('counter') || lower.includes('defend')) {
        reply = PRESET_CHAT_ANSWERS.press;
      } else if (lower.includes('alternative') || lower.includes('option') || lower.includes('else')) {
        reply = PRESET_CHAT_ANSWERS.alternative;
      } else {
        reply = `Analysis of this ${vectors.length}-pass sequence indicates high tactical value. The pass network achieves superior spatial progression while limiting defensive congestion.`;
      }

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages((prev) => [...prev, aiMsg]);
    }, 600);
  };

  const handleQuickPrompt = (promptText: string) => {
    setInputValue(promptText);
    setTimeout(() => {
      const userMsg: ChatMessage = {
        id: `usr_${Date.now()}`,
        sender: 'user',
        text: promptText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages((prev) => [...prev, userMsg]);

      setTimeout(() => {
        let reply = PRESET_CHAT_ANSWERS.default;
        const lower = promptText.toLowerCase();
        if (lower.includes('risk')) reply = PRESET_CHAT_ANSWERS.risk;
        else if (lower.includes('press')) reply = PRESET_CHAT_ANSWERS.press;
        else if (lower.includes('alternative')) reply = PRESET_CHAT_ANSWERS.alternative;

        setChatMessages((prev) => [
          ...prev,
          {
            id: `ai_${Date.now()}`,
            sender: 'ai',
            text: reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }, 500);
    }, 50);
  };

  return (
    <aside className="w-full md:w-[420px] lg:w-[460px] shrink-0 bg-white border-l border-[#eaedff] flex flex-col h-[calc(100vh-4rem)] sticky top-16 z-30 shadow-[-4px_0_16px_rgba(0,0,0,0.04)] select-none">
      {/* Top Panel Header */}
      <div className="p-3.5 border-b border-[#eaedff] bg-[#f2f3ff]/90 backdrop-blur flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#2d6a4f] text-white flex items-center justify-center shadow-xs">
            <span className="material-symbols-outlined text-lg">psychology</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-display text-sm font-bold text-[#131b2e]">Tactical AI Insights</span>
              <span className="font-mono-data text-[9px] px-1.5 py-0.2 rounded bg-[#0f5238] text-white font-bold">
                PRO v4.2
              </span>
            </div>
            <span className="font-mono-data text-[10px] text-[#707973]">
              {vectors.length} pass vector{vectors.length === 1 ? '' : 's'} recorded
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-7 h-7 rounded-md text-[#404943] hover:bg-[#e2e7ff] hover:text-[#131b2e] flex items-center justify-center transition-colors"
          title="Close AI Insights"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>

      {/* Main Chat / Feed Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Sequence Log Introductory Banner */}
        <div className="bg-[#eaedff]/60 border border-[#dae2fd] rounded-lg p-2.5 flex items-start gap-2.5">
          <span className="material-symbols-outlined text-sm text-[#0051d5] mt-0.5">schema</span>
          <div className="flex flex-col">
            <span className="font-sans text-xs font-semibold text-[#131b2e]">
              Passing Sequence Vector Log
            </span>
            <span className="font-sans text-[11px] text-[#707973] leading-snug">
              Every pass vector drawn on the Pitch Workbench is logged below in chronological order.
            </span>
          </div>
        </div>

        {/* Empty state if no vectors */}
        {vectors.length === 0 && (
          <div className="p-6 text-center rounded-xl border border-dashed border-[#dae2fd] bg-[#f2f3ff]/50 flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#eaedff] flex items-center justify-center text-[#707973]">
              <span className="material-symbols-outlined text-xl">timeline</span>
            </div>
            <span className="font-display text-xs font-bold text-[#131b2e]">No Pass Vectors Drawn</span>
            <p className="font-sans text-[11px] text-[#707973] max-w-xs leading-relaxed">
              Click a player on the Pitch Workbench and then click another player to log passes, or switch to Move Player mode.
            </p>
          </div>
        )}

        {/* List of Small Vector Cards */}
        {vectors.map((vec, idx) => {
          const pFrom = getPlayer(vec.from);
          const pTo = getPlayer(vec.to);
          const isKey = insight?.keyPass.index === idx + 1;

          const typeBadgeColor =
            vec.type === 'aerial'
              ? 'bg-[#dbe1ff] text-[#003ea8] border-[#b4c5ff]'
              : vec.type === 'through'
              ? 'bg-[#ffdad6] text-[#93000b] border-[#ffb4ab]'
              : 'bg-[#b1f0ce] text-[#002114] border-[#95d4b3]';

          const typeLabel =
            vec.type === 'aerial'
              ? 'Aerial Cross'
              : vec.type === 'through'
              ? 'Through Run'
              : 'Ground Pass';

          return (
            <div
              key={vec.id || idx}
              className={`p-3 rounded-xl border transition-all flex flex-col gap-2 ${
                isKey
                  ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-300/40 shadow-xs'
                  : 'bg-white hover:bg-[#f2f3ff]/60 border-[#eaedff] shadow-2xs'
              }`}
            >
              {/* Pass Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono-data text-[10px] font-bold text-[#707973] px-1.5 py-0.5 rounded bg-[#f2f3ff] border border-[#eaedff]">
                    #{idx + 1}
                  </span>
                  <span className={`font-mono-data text-[9px] font-bold px-1.5 py-0.5 rounded border ${typeBadgeColor}`}>
                    {typeLabel}
                  </span>
                  {isKey && (
                    <span className="font-mono-data text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-400 text-slate-900 flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[10px]">star</span>
                      KEY PASS
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono-data text-xs font-bold text-[#0f5238]">
                    {vec.xt} xT
                  </span>
                  {onDeleteVector && (
                    <button
                      onClick={() => onDeleteVector(idx)}
                      className="text-[#707973] hover:text-[#ba1a1a] p-0.5 rounded transition-colors"
                      title="Delete this pass vector"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Passer -> Receiver Nodes */}
              <div className="flex items-center gap-2 bg-[#f2f3ff] p-2 rounded-lg border border-[#eaedff]/60 text-xs">
                {/* Passer */}
                <button
                  onClick={() => pFrom && onSelectPlayer && onSelectPlayer(pFrom.id)}
                  className="flex items-center gap-1.5 hover:underline text-left"
                >
                  <span className="w-5 h-5 rounded-full bg-[#0284c7] text-white font-mono-data text-[9px] font-bold flex items-center justify-center shrink-0">
                    {pFrom?.num || '?'}
                  </span>
                  <span className="font-semibold text-[#131b2e] truncate max-w-[90px]">
                    {pFrom?.name || 'Passer'}
                  </span>
                  <span className="font-mono-data text-[9px] text-[#707973]">
                    {pFrom?.pos}
                  </span>
                </button>

                <span className="material-symbols-outlined text-xs text-[#707973]">arrow_forward</span>

                {/* Receiver */}
                <button
                  onClick={() => pTo && onSelectPlayer && onSelectPlayer(pTo.id)}
                  className="flex items-center gap-1.5 hover:underline text-left"
                >
                  <span className="w-5 h-5 rounded-full bg-[#0051d5] text-white font-mono-data text-[9px] font-bold flex items-center justify-center shrink-0">
                    {pTo?.num || '?'}
                  </span>
                  <span className="font-semibold text-[#131b2e] truncate max-w-[90px]">
                    {pTo?.name || 'Receiver'}
                  </span>
                  <span className="font-mono-data text-[9px] text-[#707973]">
                    {pTo?.pos}
                  </span>
                </button>
              </div>

              {/* Tactical Metrics Bar */}
              <div className="flex items-center justify-between text-[11px] font-mono-data text-[#707973] px-1">
                <span>Distance: <strong className="text-[#131b2e]">{vec.dist}</strong></span>
                <span>Velocity: <strong className="text-[#131b2e]">{vec.vel}</strong></span>
              </div>
            </div>
          );
        })}

        {/* "Get AI Insights" CTA Button - Positioned right after the last logged vector */}
        {vectors.length > 0 && (
          <div className="pt-1">
            <button
              onClick={handleGenerateInsights}
              disabled={isLoading}
              className={`w-full py-2.5 px-4 rounded-xl font-display text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 ${
                isLoading
                  ? 'bg-[#eaedff] text-[#707973] cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#0f5238] to-[#2d6a4f] hover:from-[#1b4332] hover:to-[#0f5238] text-white shadow-emerald-900/20'
              }`}
            >
              <span className="material-symbols-outlined text-base animate-pulse">
                {isLoading ? 'progress_activity' : 'smart_toy'}
              </span>
              <span>
                {isLoading
                  ? 'Synthesizing Tactical Engine...'
                  : insight
                  ? 'Regenerate Tactical AI Insights'
                  : 'Get AI Insights'}
              </span>
            </button>
          </div>
        )}

        {/* AI Natural Language Insights Block */}
        {insight && (
          <div className="bg-[#f2f3ff] rounded-2xl p-4 border border-[#dae2fd] shadow-sm flex flex-col gap-3.5 mt-2 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#dae2fd] pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#0f5238] text-white flex items-center justify-center text-xs">
                  <span className="material-symbols-outlined text-sm">neurology</span>
                </div>
                <span className="font-display text-xs font-bold text-[#131b2e]">
                  Match Intelligence Report
                </span>
              </div>
              <span className="font-mono-data text-[10px] text-[#707973]">
                {insight.timestamp}
              </span>
            </div>

            {/* Headline & Overview */}
            <div>
              <h4 className="font-display text-sm font-bold text-[#131b2e] leading-snug">
                {insight.headline}
              </h4>
              <p className="font-sans text-xs text-[#404943] leading-relaxed mt-1.5">
                {insight.summary}
              </p>
            </div>

            {/* Key Pass Highlight */}
            {insight.keyPass.index > 0 && (
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-amber-600 text-sm">stars</span>
                    <span className="font-display text-xs font-bold text-amber-900">
                      Key Pass Highlight (Pass #{insight.keyPass.index})
                    </span>
                  </div>
                  <span className="font-mono-data text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                    {insight.keyPass.xt} xT
                  </span>
                </div>

                <div className="font-sans text-xs font-semibold text-amber-950">
                  {insight.keyPass.passer} → {insight.keyPass.receiver} ({insight.keyPass.dist}, {insight.keyPass.type})
                </div>

                <p className="font-sans text-[11px] text-amber-900 leading-relaxed">
                  {insight.keyPass.reason}
                </p>
              </div>
            )}

            {/* KPI Metrics Matrix Strip */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white p-2 rounded-lg border border-[#eaedff]">
                <span className="font-mono-data text-[9px] text-[#707973] block">TOTAL NET xT</span>
                <span className="font-mono-data text-xs font-bold text-[#0f5238]">
                  {insight.metrics.totalXt}
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-[#eaedff]">
                <span className="font-mono-data text-[9px] text-[#707973] block">LINE BREAKS</span>
                <span className="font-mono-data text-xs font-bold text-[#0051d5]">
                  {insight.metrics.lineBreaks} Defensive Lines
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-[#eaedff]">
                <span className="font-mono-data text-[9px] text-[#707973] block">EFFICIENCY</span>
                <span className="font-mono-data text-xs font-bold text-[#131b2e]">
                  {insight.metrics.passingEfficiency}
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-[#eaedff]">
                <span className="font-mono-data text-[9px] text-[#707973] block">TURNOVER RISK</span>
                <span className="font-mono-data text-xs font-bold text-emerald-600">
                  {insight.metrics.turnoverRisk} (Low)
                </span>
              </div>
            </div>

            {/* Tactical Flaw Exploited */}
            <div className="bg-white p-3 rounded-xl border border-[#eaedff] flex flex-col gap-1">
              <span className="font-mono-data text-[10px] text-[#c00815] font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">warning</span>
                Defensive Structure Exploited
              </span>
              <p className="font-sans text-xs text-[#404943] leading-relaxed">
                {insight.tacticalFlawExploited}
              </p>
            </div>

            {/* Analyst Directives */}
            <div className="flex flex-col gap-1.5">
              <span className="font-mono-data text-[10px] text-[#0f5238] font-bold uppercase tracking-wider">
                Coach Recommendations
              </span>
              <ul className="space-y-1">
                {insight.recommendations.map((rec, rIdx) => (
                  <li
                    key={rIdx}
                    className="font-sans text-xs text-[#404943] flex items-start gap-1.5 leading-snug"
                  >
                    <span className="text-[#0f5238] font-bold">›</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Follow-up User/AI Messages */}
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} gap-1`}
          >
            <div
              className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-[#0f5238] text-white rounded-tr-none'
                  : 'bg-[#f2f3ff] text-[#131b2e] border border-[#dae2fd] rounded-tl-none shadow-2xs'
              }`}
            >
              {msg.text}
            </div>
            <span className="font-mono-data text-[9px] text-[#707973] px-1">
              {msg.timestamp}
            </span>
          </div>
        ))}

        <div ref={chatBottomRef} />
      </div>

      {/* Quick Question Prompts */}
      <div className="px-3 pt-2 pb-1 border-t border-[#eaedff] bg-white flex flex-wrap gap-1.5">
        <button
          onClick={() => handleQuickPrompt('What was the turnover risk?')}
          className="px-2 py-0.5 rounded-full bg-[#f2f3ff] hover:bg-[#eaedff] text-[10px] font-sans text-[#404943] border border-[#eaedff] transition-colors"
        >
          What was the turnover risk?
        </button>
        <button
          onClick={() => handleQuickPrompt('How should the opposition press this?')}
          className="px-2 py-0.5 rounded-full bg-[#f2f3ff] hover:bg-[#eaedff] text-[10px] font-sans text-[#404943] border border-[#eaedff] transition-colors"
        >
          How should opposition press this?
        </button>
        <button
          onClick={() => handleQuickPrompt('Alternative tactical play?')}
          className="px-2 py-0.5 rounded-full bg-[#f2f3ff] hover:bg-[#eaedff] text-[10px] font-sans text-[#404943] border border-[#eaedff] transition-colors"
        >
          Alternative play?
        </button>
      </div>

      {/* Chat Input Bar */}
      <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-[#eaedff] flex items-center gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask tactical question about this sequence..."
          className="flex-1 bg-[#f2f3ff] border border-[#dae2fd] rounded-lg px-3 py-2 text-xs font-sans text-[#131b2e] focus:outline-hidden focus:border-[#0f5238] transition-colors"
        />
        <button
          type="submit"
          disabled={!inputValue.trim()}
          className="w-8 h-8 rounded-lg bg-[#0f5238] disabled:bg-[#eaedff] disabled:text-[#707973] text-white flex items-center justify-center transition-colors shadow-xs"
        >
          <span className="material-symbols-outlined text-sm">send</span>
        </button>
      </form>
    </aside>
  );
};
