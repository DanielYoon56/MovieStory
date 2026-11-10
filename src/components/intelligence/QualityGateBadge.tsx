/**
 * MOVIESTORY AI — MIQG: QualityGateBadge Component
 * Compact quality badge for headers and step navigation.
 */

import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, RefreshCw, Sparkles } from 'lucide-react';
import { IntelligenceQualityReport } from '../../types';
import { QualityScoringService } from '../../services/intelligenceQualityGate/QualityScoringService';

interface QualityGateBadgeProps {
  report?: IntelligenceQualityReport | null;
  isOutdated?: boolean;
  onClick?: () => void;
  compact?: boolean;
}

export const QualityGateBadge: React.FC<QualityGateBadgeProps> = ({
  report,
  isOutdated,
  onClick,
  compact = false,
}) => {
  if (!report) {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700 hover:text-white transition cursor-pointer"
        title="품질 게이트 검사 실행"
      >
        <Sparkles className="w-3.5 h-3.5 text-slate-400" />
        <span>MIQG 검사</span>
      </button>
    );
  }

  const { status, overallScore, hasBlocker } = report;
  const statusInfo = QualityScoringService.getStatusLabel(status);

  // Outdated state
  if (isOutdated) {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/60 text-amber-300 border border-amber-600/60 hover:bg-amber-900/60 transition cursor-pointer"
        title="상위 서사가 변경되었습니다. 품질 검사를 다시 실행하세요."
      >
        <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
        <span>{overallScore}점</span>
        <span className="text-[10px] text-amber-400/80 font-normal">● 갱신 필요</span>
      </button>
    );
  }

  // Blocker active state
  if (hasBlocker) {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-950/80 text-rose-300 border border-rose-500 hover:bg-rose-900/80 transition cursor-pointer shadow-sm animate-pulse"
        title="치명적 정합성 결함이 감지되었습니다."
      >
        <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
        <span>BLOCKED</span>
        {!compact && <span className="text-[10px] text-rose-300/80 font-normal">({report.blockerCount}건)</span>}
      </button>
    );
  }

  // Warning state
  if (status === 'READY_WITH_WARNINGS' || status === 'NEEDS_REVIEW') {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-950/40 text-amber-300 border border-amber-500/50 hover:bg-amber-900/50 transition cursor-pointer"
        title={`${statusInfo.title} - ${report.warningCount}건 권고`}
      >
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
        <span>{overallScore}점</span>
        {!compact && <span className="text-[10px] text-amber-400 font-normal">검토 권고</span>}
      </button>
    );
  }

  // Verified / Excellent state
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950/50 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-900/50 transition cursor-pointer shadow-sm"
      title={`${statusInfo.title} (품질 검증 통과)`}
    >
      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
      <span>{overallScore}점</span>
      {!compact && (
        <span className="text-[10px] text-emerald-400 font-normal">
          {status === 'EXCELLENT' ? 'EXCELLENT' : 'VERIFIED'}
        </span>
      )}
    </button>
  );
};
