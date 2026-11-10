/**
 * MOVIESTORY AI — MIQG: QualityIssueCard Component
 * Displays individual quality issues with strict explainability:
 * WHAT is wrong? WHERE is it? WHY does it matter? HOW to fix it?
 */

import React from 'react';
import { AlertOctagon, AlertTriangle, Lightbulb, ArrowRight, MapPin, HelpCircle, Sparkles } from 'lucide-react';
import { QualityIssue, QualitySeverity, QualityGateType } from '../../types';

interface QualityIssueCardProps {
  issue: QualityIssue;
  onNavigateToStep?: (step: number) => void;
}

export const QualityIssueCard: React.FC<QualityIssueCardProps> = ({
  issue,
  onNavigateToStep,
}) => {
  const getSeverityBadge = (severity: QualitySeverity) => {
    switch (severity) {
      case 'BLOCKER':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-950 text-rose-300 border border-rose-600 shadow-sm animate-pulse">
            <AlertOctagon className="w-3 h-3 text-rose-400" />
            <span>치명적 결함 (BLOCKER)</span>
          </span>
        );
      case 'WARNING':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-950 text-amber-300 border border-amber-600">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>품질 위험 (WARNING)</span>
          </span>
        );
      case 'SUGGESTION':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-600">
            <Lightbulb className="w-3 h-3 text-indigo-400" />
            <span>개선 제안 (SUGGESTION)</span>
          </span>
        );
    }
  };

  const getGateLabel = (gate: QualityGateType) => {
    switch (gate) {
      case 'NARRATIVE':
        return { label: '서사 지능 (Gate 1)', color: 'bg-emerald-950/60 text-emerald-300 border-emerald-800' };
      case 'CINEMATIC':
        return { label: '시네마틱 번역 (Gate 2)', color: 'bg-cyan-950/60 text-cyan-300 border-cyan-800' };
      case 'PRODUCTION':
        return { label: '제작 정합성 (Gate 3)', color: 'bg-purple-950/60 text-purple-300 border-purple-800' };
      case 'AUDIENCE':
        return { label: '시청자 경험 (Gate 4)', color: 'bg-amber-950/60 text-amber-300 border-amber-800' };
    }
  };

  const gateInfo = getGateLabel(issue.gate);

  return (
    <div
      className={`p-4 rounded-xl border transition-all text-xs font-sans ${
        issue.severity === 'BLOCKER'
          ? 'bg-rose-950/20 border-rose-800/80 hover:border-rose-600'
          : issue.severity === 'WARNING'
          ? 'bg-amber-950/20 border-amber-800/60 hover:border-amber-600'
          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Header Tags */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          {getSeverityBadge(issue.severity)}
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${gateInfo.color}`}>
            {gateInfo.label}
          </span>
        </div>

        {issue.relatedStep && onNavigateToStep && (
          <button
            onClick={() => onNavigateToStep(issue.relatedStep!)}
            className="flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 transition cursor-pointer"
          >
            <span>Step {issue.relatedStep} 수정 위치로 이동</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Title */}
      <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
        <span>{issue.title}</span>
      </h4>

      {/* Explainability Breakdown (WHAT, WHERE, WHY, HOW) */}
      <div className="space-y-2 mt-3 text-slate-300">
        {/* WHAT */}
        <div className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
          <div>
            <span className="font-bold text-slate-200 block text-[11px]">무엇이 문제인가 (WHAT):</span>
            <span className="text-slate-300 leading-relaxed">{issue.what}</span>
          </div>
        </div>

        {/* WHERE */}
        <div className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
          <MapPin className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
          <div>
            <span className="font-bold text-slate-200 block text-[11px]">발생 위치 (WHERE):</span>
            <span className="text-amber-300 font-mono text-[11px]">{issue.where}</span>
          </div>
        </div>

        {/* WHY */}
        <div className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" />
          <div>
            <span className="font-bold text-slate-200 block text-[11px]">왜 중요한가 (WHY):</span>
            <span className="text-slate-300 leading-relaxed">{issue.why}</span>
          </div>
        </div>

        {/* HOW */}
        <div className="flex items-start gap-2 bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-800/40">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
          <div>
            <span className="font-bold text-emerald-300 block text-[11px]">어떻게 개선하는가 (HOW):</span>
            <span className="text-emerald-200 leading-relaxed">{issue.how}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
