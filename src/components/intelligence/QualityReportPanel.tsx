/**
 * MOVIESTORY AI — MIQG: QualityReportPanel Component
 * Compact progressive disclosure panel for inline viewing within Steps.
 */

import React, { useState } from 'react';
import { ShieldCheck, ChevronRight, Sparkles, AlertTriangle, AlertOctagon, RefreshCw } from 'lucide-react';
import { IntelligenceQualityReport } from '../../types';
import { QualityScoringService } from '../../services/intelligenceQualityGate/QualityScoringService';

interface QualityReportPanelProps {
  report?: IntelligenceQualityReport | null;
  isOutdated?: boolean;
  onOpenDashboard: () => void;
  onReevaluate?: () => void;
}

export const QualityReportPanel: React.FC<QualityReportPanelProps> = ({
  report,
  isOutdated,
  onOpenDashboard,
  onReevaluate,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  if (!report) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-slate-300 font-medium">MovieStory Intelligence Quality Gate (MIQG)</span>
        </div>
        <button
          onClick={onReevaluate || onOpenDashboard}
          className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition cursor-pointer"
        >
          품질 분석 실행
        </button>
      </div>
    );
  }

  const statusInfo = QualityScoringService.getStatusLabel(report.status);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-md shadow-lg space-y-3">
      {/* 1. Header Line */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide">
                Intelligence Quality Gate
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusInfo.badgeColor} ${statusInfo.borderColor}`}
              >
                {report.status}
              </span>
              {isOutdated && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40">
                  ● 갱신 필요
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">{statusInfo.title}</p>
          </div>
        </div>

        {/* Score & Actions */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-mono">OVERALL SCORE</span>
            <span className="text-xl font-black text-white leading-none">
              {report.overallScore} <span className="text-xs text-slate-500">/ 100</span>
            </span>
          </div>

          <button
            onClick={onOpenDashboard}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition flex items-center gap-1 cursor-pointer"
          >
            <span>상세 분석 보기</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. 4 Dimensions Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        <div className="p-2 bg-slate-950 rounded-lg border border-slate-800/80">
          <div className="flex justify-between text-slate-400 text-[10px]">
            <span>서사 지능 (35%)</span>
            <span className="text-white font-bold">{report.narrative.score}점</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${report.narrative.score}%` }}
            ></div>
          </div>
        </div>

        <div className="p-2 bg-slate-950 rounded-lg border border-slate-800/80">
          <div className="flex justify-between text-slate-400 text-[10px]">
            <span>시네마틱 (25%)</span>
            <span className="text-white font-bold">{report.cinematic.score}점</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div
              className="bg-cyan-500 h-full rounded-full"
              style={{ width: `${report.cinematic.score}%` }}
            ></div>
          </div>
        </div>

        <div className="p-2 bg-slate-950 rounded-lg border border-slate-800/80">
          <div className="flex justify-between text-slate-400 text-[10px]">
            <span>제작 일관성 (25%)</span>
            <span className="text-white font-bold">{report.production.score}점</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div
              className="bg-purple-500 h-full rounded-full"
              style={{ width: `${report.production.score}%` }}
            ></div>
          </div>
        </div>

        <div className="p-2 bg-slate-950 rounded-lg border border-slate-800/80">
          <div className="flex justify-between text-slate-400 text-[10px]">
            <span>시청자 경험 (15%)</span>
            <span className="text-white font-bold">{report.audienceExperience.score}점</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full"
              style={{ width: `${report.audienceExperience.score}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 3. Top Strength & Main Risk (Progressive Disclosure) */}
      <div className="pt-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        <div className="text-slate-300 truncate max-w-xl">
          {report.topRisks.length > 0 && report.hasBlocker ? (
            <span className="text-rose-400 flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
              <strong className="font-bold shrink-0">주요 결함:</strong>
              <span className="truncate">{report.topRisks[0]}</span>
            </span>
          ) : report.topRisks.length > 0 ? (
            <span className="text-amber-300/90 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
              <strong className="font-bold shrink-0">개선 권고:</strong>
              <span className="truncate">{report.topRisks[0]}</span>
            </span>
          ) : (
            <span className="text-emerald-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
              <strong className="font-bold shrink-0">핵심 강점:</strong>
              <span className="truncate">{report.topStrengths[0]}</span>
            </span>
          )}
        </div>

        {isOutdated && onReevaluate && (
          <button
            onClick={onReevaluate}
            className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition shrink-0"
          >
            <RefreshCw className="w-3 h-3" />
            <span>최신 데이터로 재검사</span>
          </button>
        )}
      </div>
    </div>
  );
};
