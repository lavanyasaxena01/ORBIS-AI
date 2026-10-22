import React, { useState } from 'react';
import { RegionData, ChatMessage } from '../../types/climate';
import { GlassCard } from '../common/GlassCard';
import { ClimateRiskBadge } from '../common/ClimateRiskBadge';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Loader2,
} from 'lucide-react';

interface AIAnalystViewProps {
  region: RegionData;
}

const SAMPLE_QUERIES = [
  'What changed in this region?',
  'Why is this region at high risk?',
  'Explain the vegetation loss.',
  'Summarize the flood impact.',
  'What actions are recommended?',
];

function EvidenceTag({ kind }: { kind: 'observed' | 'calculated' | 'interpreted' }) {
  const styles = {
    observed: 'bg-[#EBF1FB] text-[#1D4ED8] border-[#BCCFEB]',
    calculated: 'bg-[#E9F2EC] text-[#1D6A3E] border-[#BEDCC9]',
    interpreted: 'bg-[#F4F1EA] text-[#7A660A] border-[#E3D9B8]',
  }[kind];
  const labels = {
    observed: 'Observed',
    calculated: 'Calculated',
    interpreted: 'Interpreted',
  }[kind];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wider ${styles}`}>
      {labels[kind]}
    </span>
  );
}

export const AIAnalystView: React.FC<AIAnalystViewProps> = ({ region }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: `Hello — I'm the ORBIS AI analyst, working from the latest satellite observations of **${region.name}** (${region.country}).\n\nHere's what the data shows right now:\n\n- Flood extent: ${region.metrics.floodAreaKm2.toLocaleString()} km²\n- Vegetation change (NDVI): ${region.metrics.ndviChangePercent}%\n- Climate risk: ${region.metrics.riskScore}/100 (${region.metrics.riskLevel})\n\nAsk me anything about what changed, why it matters, or what to do next.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      groundedData: {
        regionName: region.name,
        riskScore: region.metrics.riskScore,
        metrics: {
          floodAreaKm2: region.metrics.floodAreaKm2,
          changedAreaKm2: region.metrics.changedAreaKm2,
          ndviDelta: `${region.metrics.ndviChangePercent}%`,
          populationExposed: region.metrics.populationExposed,
        },
      },
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSend = async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed || isProcessing) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsProcessing(true);

    try {
      const response = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          regionId: region.id,
          query: trimmed,
        }),
      });

      if (!response.ok) {
        throw new Error('Server returned an error');
      }

      const data = await response.json();

      const aiMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        content: data.answer || data.summary,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        groundedData: {
          regionName: region.name,
          riskScore: region.metrics.riskScore,
          metrics: {
            summary: data.summary,
            evidence: (data.evidence || []).join(' · '),
            attribution: data.attribution,
          },
        },
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Failed to query AI analyst:', err);
      const aiMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        content: `**Assessment for ${region.name}:**\n\n${region.aiExplanation}\n\n**Recommended actions:**\n${region.adaptationActions.map((a) => `- ${a}`).join('\n')}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="text-3xl lg:text-4xl font-bold text-[#1B2520] tracking-tight">
            AI Analyst
          </h1>
          <p className="text-[15px] text-[#5D6E64] mt-2 leading-relaxed">
            Why is this happening? Ask questions in plain language — every answer is tied to
            the observed satellite data shown on the right.
          </p>
        </div>
        <ClimateRiskBadge level={region.metrics.riskLevel} score={region.metrics.riskScore} size="md" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Conversation */}
        <div className="lg:col-span-8 flex flex-col h-[580px] bg-white rounded-2xl border border-[#E3E9E3] overflow-hidden shadow-[0_1px_3px_rgba(27,37,32,0.06)]">
          <div className="flex-1 p-5 overflow-y-auto space-y-5" aria-live="polite">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[88%] ${
                  msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === 'user'
                      ? 'bg-[#1E5641] text-white'
                      : 'bg-[#E9F2EC] border border-[#CFE0D3] text-[#1E5641]'
                  }`}
                  aria-hidden="true"
                >
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`p-4 rounded-2xl text-[14px] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#1E5641] text-white rounded-tr-md'
                      : 'bg-[#F7F9F5] border border-[#EDF1EC] text-[#1B2520] rounded-tl-md'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {msg.groundedData && msg.role === 'model' && (
                    <div className="mt-3 pt-2.5 border-t border-[#E3E9E3] flex flex-wrap items-center gap-1.5">
                      <EvidenceTag kind="observed" />
                      <EvidenceTag kind="calculated" />
                      <EvidenceTag kind="interpreted" />
                    </div>
                  )}

                  <div className={`text-[11px] mt-1.5 text-right ${msg.role === 'user' ? 'text-white/60' : 'text-[#93A398]'}`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex gap-2.5 items-center text-[13px] text-[#5D6E64]">
                <Loader2 className="w-4 h-4 animate-spin text-[#1E5641]" aria-hidden="true" />
                <span>Reviewing the satellite evidence…</span>
              </div>
            )}
          </div>

          {/* Suggested questions */}
          <div className="px-3 py-2.5 bg-[#FAFBF8] border-t border-[#EDF1EC] flex items-center gap-2 overflow-x-auto">
            <span className="text-[12px] text-[#5D6E64] shrink-0">Try asking:</span>
            {SAMPLE_QUERIES.map((sample, i) => (
              <button
                key={i}
                onClick={() => handleSend(sample)}
                className="px-3 py-1.5 rounded-full bg-white hover:bg-[#E9F2EC] border border-[#DDE5DD] hover:border-[#1E5641]/40 text-[12px] text-[#1B2520] transition-colors duration-200 cursor-pointer shrink-0 whitespace-nowrap"
              >
                {sample}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-[#EDF1EC] flex items-center gap-2">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(inputQuery)}
              placeholder="Ask about this region…"
              aria-label="Ask the AI analyst a question"
              className="flex-1 bg-[#F7F9F5] border border-[#DDE5DD] rounded-lg px-3.5 py-2.5 text-[14px] text-[#1B2520] placeholder-[#93A398] focus:outline-none focus:border-[#1E5641] focus:ring-1 focus:ring-[#1E5641]"
            />
            <button
              onClick={() => handleSend(inputQuery)}
              disabled={isProcessing || !inputQuery.trim()}
              className="px-4 py-2.5 bg-[#1E5641] hover:bg-[#15402F] disabled:opacity-50 text-white font-semibold rounded-lg text-[13px] flex items-center gap-1.5 transition-colors duration-200 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Ask</span>
            </button>
          </div>
        </div>

        {/* Evidence panel */}
        <div className="lg:col-span-4">
          <GlassCard className="space-y-4 lg:sticky lg:top-24">
            <div className="flex items-center gap-2 pb-3 border-b border-[#EDF1EC]">
              <Sparkles className="w-4 h-4 text-[#1E5641]" aria-hidden="true" />
              <span className="text-[15px] font-semibold text-[#1B2520]">Evidence</span>
            </div>

            <p className="text-[12px] text-[#5D6E64] leading-relaxed">
              Answers are drawn from this region's observed and calculated indicators:
            </p>

            <dl className="space-y-3 text-[13px]">
              <div className="flex items-center justify-between gap-2">
                <dt className="flex items-center gap-2 text-[#5D6E64]">
                  <EvidenceTag kind="observed" /> Flood extent
                </dt>
                <dd className="font-semibold text-[#1B2520] tabular-nums">{region.metrics.floodAreaKm2.toLocaleString()} km²</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="flex items-center gap-2 text-[#5D6E64]">
                  <EvidenceTag kind="observed" /> Changed area
                </dt>
                <dd className="font-semibold text-[#1B2520] tabular-nums">{region.metrics.changedAreaKm2.toLocaleString()} km²</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="flex items-center gap-2 text-[#5D6E64]">
                  <EvidenceTag kind="calculated" /> NDVI change
                </dt>
                <dd className="font-semibold text-[#1B2520] tabular-nums">{region.metrics.ndviChangePercent}%</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="flex items-center gap-2 text-[#5D6E64]">
                  <EvidenceTag kind="calculated" /> NDWI change
                </dt>
                <dd className="font-semibold text-[#1B2520] tabular-nums">+{region.metrics.ndwiChangePercent}%</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="flex items-center gap-2 text-[#5D6E64]">
                  <EvidenceTag kind="calculated" /> Risk score
                </dt>
                <dd className="font-semibold text-[#1B2520] tabular-nums">{region.metrics.riskScore}/100</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="flex items-center gap-2 text-[#5D6E64]">
                  <EvidenceTag kind="interpreted" /> Population exposed
                </dt>
                <dd className="font-semibold text-[#1B2520] tabular-nums">{region.metrics.populationExposed.toLocaleString()}</dd>
              </div>
            </dl>

            <div className="pt-3 border-t border-[#EDF1EC] space-y-1.5 text-[12px] text-[#5D6E64]">
              <div><span className="font-medium text-[#1B2520]">Region:</span> {region.name}</div>
              <div><span className="font-medium text-[#1B2520]">Coordinates:</span> <span className="font-mono">{region.center.join(', ')}</span></div>
              <div><span className="font-medium text-[#1B2520]">Hazard:</span> {region.primaryHazard}</div>
            </div>

            <div className="pt-3 border-t border-[#EDF1EC] text-[12px] text-[#5D6E64] leading-relaxed">
              <span className="font-semibold text-[#1B2520]">How to read labels: </span>
              Observed = measured by satellite · Calculated = derived from observations ·
              Interpreted = AI explanation of what it means.
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
