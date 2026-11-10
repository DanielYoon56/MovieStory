/**
 * MOVIESTORY AI — MIQG: IntelligenceQualityDashboard Component
 * Central MOVIESTORY INTELLIGENCE QUALITY CENTER modal & dashboard.
 *
 * Adheres strictly to:
 * - Rule 2.1: At most TWO primary process commands per screen.
 * - Explainability: WHAT, WHERE, WHY, HOW.
 * - Blocker override visibility.
 * - Non-destructive: Does NOT alter story, script, or assets automatically.
 */

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  AlertOctagon,
  AlertTriangle,
  Lightbulb,
  RefreshCw,
  Activity,
  CheckCircle2,
  ListFilter,
  Layers,
  History,
  ArrowRight,
} from 'lucide-react';
import {
  Project,
  IntelligenceQualityReport,
  QualitySeverity,
  QualityGateType,
} from '../../types';
import { QualityScoringService } from '../../services/intelligenceQualityGate/QualityScoringService';
import { QualityIssueCard } from './QualityIssueCard';
import { QualityTimeline } from './QualityTimeline';

interface IntelligenceQualityDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  report?: IntelligenceQualityReport | null;
  isOutdated?: boolean;
  onReevaluate: () => void;
  onNavigateToStep?: (step: number) => void;
  onNextStep?: () => void;
}

export const IntelligenceQualityDashboard: React.FC<IntelligenceQualityDashboardProps> = ({
  isOpen,
  onClose,
  project,
  report,
  isOutdated,
  onReevaluate,
  onNavigateToStep,
  onNextStep,
}) => {
  const [activeTab, setActiveTab] = useState<'ISSUES' | 'TIMELINE' | 'METRICS' | 'HISTORY'>('ISSUES');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | QualitySeverity>('ALL');
  const [gateFilter, setGateFilter] = useState<'ALL' | QualityGateType>('ALL');

  if (!isOpen) return null;

  if (!report) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">품질 분석 데이터 준비 중</h3>
          <p className="text-xs text-slate-400">
            프로젝트 서사 및 제작 데이터를 종합 분석하는 MIQG 엔진을 시동합니다.
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition cursor-pointer"
            >
              닫기
            </button>
            <button
              onClick={onReevaluate}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer"
            >
              지금 분석 실행
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = QualityScoringService.getStatusLabel(report.status);

  // Filter issues
  const filteredIssues = report.issues.filter((iss) => {
    if (severityFilter !== 'ALL' && iss.severity !== severityFilter) return false;
    if (gateFilter !== 'ALL' && iss.gate !== gateFilter) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-sans text-slate-100">
        {/* 1. Modal Header */}
        <div className="p-5 sm:p-6 bg-slate-950 border-b border-slate-800 flex items-start justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold rounded-full uppercase tracking-wider">
                Cross-Pipeline Intelligence Layer
              </span>
              <span className="px-2.5 py-1 bg-slate-800 text-slate-300 border border-slate-700 text-xs rounded-full font-mono font-bold">
                MIQG REPORT v{report.version}
              </span>
              {isOutdated && (
                <span className="px-2.5 py-1 bg-amber-950 text-amber-300 border border-amber-500/60 text-xs rounded-full font-semibold animate-pulse">
                  ⚠️ 서사 변경됨 (재검사 필요)
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>MovieStory Intelligence Quality Center</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Step 1부터 Step 8까지의 서사 개연성, 시네마틱 번역, 제작 일관성, 시청자 몰입도를 종합
              진단합니다.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition border border-slate-700 cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Executive Summary Hero Card */}
          <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Score Radial */}
            <div className="flex items-center gap-5 shrink-0">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={
                      report.hasBlocker
                        ? 'text-rose-500'
                        : report.overallScore >= 80
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }
                    strokeDasharray={`${report.overallScore}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-xl font-black text-white">{report.overallScore}</span>
                  <span className="text-[9px] text-slate-500 block">/ 100</span>
                </div>
              </div>

              <div>
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-full border inline-block mb-1.5 ${statusInfo.badgeColor} ${statusInfo.borderColor}`}
                >
                  {statusInfo.title}
                </span>
                <p className="text-xs text-slate-300 max-w-sm leading-relaxed">
                  {statusInfo.description}
                </p>
              </div>
            </div>

            {/* 4 Dimension Score Pillars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto font-mono text-xs">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 text-[10px] block">서사 지능 (35%)</span>
                <span className="text-emerald-400 font-bold text-base mt-0.5 block">
                  {report.narrative.score}점
                </span>
                <span className="text-[10px] text-slate-500">{report.narrative.status}</span>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 text-[10px] block">시네마틱 (25%)</span>
                <span className="text-cyan-400 font-bold text-base mt-0.5 block">
                  {report.cinematic.score}점
                </span>
                <span className="text-[10px] text-slate-500">{report.cinematic.status}</span>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 text-[10px] block">제작 일관성 (25%)</span>
                <span className="text-purple-400 font-bold text-base mt-0.5 block">
                  {report.production.score}점
                </span>
                <span className="text-[10px] text-slate-500">{report.production.status}</span>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 text-[10px] block">시청자 경험 (15%)</span>
                <span className="text-amber-400 font-bold text-base mt-0.5 block">
                  {report.audienceExperience.score}점
                </span>
                <span className="text-[10px] text-slate-500">
                  {report.audienceExperience.status}
                </span>
              </div>
            </div>
          </div>

          {/* Top Strengths & Risks Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-emerald-950/20 border border-emerald-900/60 rounded-xl space-y-2">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>검증된 핵심 강점 (Top Strengths)</span>
              </span>
              <ul className="space-y-1.5 text-slate-300">
                {report.topStrengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-amber-950/20 border border-amber-900/60 rounded-xl space-y-2">
              <span className="text-amber-400 font-bold flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>주요 관리 위험 (Main Risks)</span>
              </span>
              <ul className="space-y-1.5 text-slate-300">
                {report.topRisks.map((risk, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">!</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 overflow-x-auto gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('ISSUES')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'ISSUES'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>진단 이슈 및 개선 제안</span>
                <span className="px-1.5 py-0.2 bg-black/30 rounded text-[10px]">
                  {report.issues.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('TIMELINE')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'TIMELINE'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>감정 곡선 & 인과 사슬</span>
              </button>

              <button
                onClick={() => setActiveTab('METRICS')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'METRICS'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>4대 차원 세부 지표</span>
              </button>

              <button
                onClick={() => setActiveTab('HISTORY')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'HISTORY'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>품질 리포트 버전 이력</span>
              </button>
            </div>
          </div>

          {/* TAB 1: ISSUES LIST & FILTERS */}
          {activeTab === 'ISSUES' && (
            <div className="space-y-4">
              {/* Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono">
                {/* Severity Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 text-[11px]">심각도:</span>
                  {(['ALL', 'BLOCKER', 'WARNING', 'SUGGESTION'] as const).map((sev) => (
                    <button
                      key={sev}
                      onClick={() => setSeverityFilter(sev)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                        severityFilter === sev
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      {sev === 'ALL'
                        ? '전체'
                        : sev === 'BLOCKER'
                        ? `치명적 (${report.blockerCount})`
                        : sev === 'WARNING'
                        ? `경고 (${report.warningCount})`
                        : `제안 (${report.suggestionCount})`}
                    </button>
                  ))}
                </div>

                {/* Gate Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 text-[11px]">영역:</span>
                  {(['ALL', 'NARRATIVE', 'CINEMATIC', 'PRODUCTION', 'AUDIENCE'] as const).map(
                    (g) => (
                      <button
                        key={g}
                        onClick={() => setGateFilter(g)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                          gateFilter === g
                            ? 'bg-slate-700 text-white font-black'
                            : 'bg-slate-900 text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {g === 'ALL'
                          ? '전체'
                          : g === 'NARRATIVE'
                          ? '서사'
                          : g === 'CINEMATIC'
                          ? '시네마틱'
                          : g === 'PRODUCTION'
                          ? '제작'
                          : '시청자'}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Issues Grid */}
              {filteredIssues.length > 0 ? (
                <div className="space-y-3">
                  {filteredIssues.map((issue) => (
                    <QualityIssueCard
                      key={issue.id}
                      issue={issue}
                      onNavigateToStep={(step) => {
                        onClose();
                        onNavigateToStep?.(step);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-950 rounded-2xl border border-slate-800 text-slate-400 text-xs">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
                  <p className="font-bold text-white text-sm">해당 조건에 해당하는 품질 결함이 없습니다.</p>
                  <p className="text-slate-500 mt-1">스토리 및 제작 정합성이 안정적으로 유지되고 있습니다.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TIMELINE (Emotional Curve & Causal Chain) */}
          {activeTab === 'TIMELINE' && (
            <QualityTimeline
              curve={report.emotionalCurve}
              causalChain={report.causalChain}
            />
          )}

          {/* TAB 3: 4 DIMENSIONS METRIC DETAILS */}
          {activeTab === 'METRICS' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Narrative Metrics */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-emerald-400 text-sm">Gate 1 • 서사 지능 (35%)</span>
                    <span className="font-mono font-bold text-white">{report.narrative.score}점</span>
                  </div>
                  <div className="space-y-2 text-xs font-mono">
                    {Object.entries(report.narrative.metrics).map(([key, val]) => (
                      <div key={key} className="flex justify-between text-slate-300">
                        <span className="text-slate-400">{key}:</span>
                        <span className="font-bold text-white">{val}점</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Cinematic Metrics */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-cyan-400 text-sm">Gate 2 • 시네마틱 번역 (25%)</span>
                    <span className="font-mono font-bold text-white">{report.cinematic.score}점</span>
                  </div>
                  <div className="space-y-2 text-xs font-mono">
                    {Object.entries(report.cinematic.metrics).map(([key, val]) => (
                      <div key={key} className="flex justify-between text-slate-300">
                        <span className="text-slate-400">{key}:</span>
                        <span className="font-bold text-white">{val}점</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Production Metrics */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-purple-400 text-sm">Gate 3 • 제작 일관성 (25%)</span>
                    <span className="font-mono font-bold text-white">{report.production.score}점</span>
                  </div>
                  <div className="space-y-2 text-xs font-mono">
                    {Object.entries(report.production.metrics).map(([key, val]) => (
                      <div key={key} className="flex justify-between text-slate-300">
                        <span className="text-slate-400">{key}:</span>
                        <span className="font-bold text-white">{val}점</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Audience Experience Metrics */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-amber-400 text-sm">Gate 4 • 시청자 경험 예측 (15%)</span>
                    <span className="font-mono font-bold text-white">{report.audienceExperience.score}점</span>
                  </div>
                  <div className="space-y-2 text-xs font-mono">
                    {Object.entries(report.audienceExperience.metrics).map(([key, val]) => (
                      <div key={key} className="flex justify-between text-slate-300">
                        <span className="text-slate-400">{key}:</span>
                        <span className="font-bold text-white">{val}점</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: VERSION HISTORY */}
          {activeTab === 'HISTORY' && (
            <div className="space-y-3">
              {project.intelligenceQualityHistory && project.intelligenceQualityHistory.length > 0 ? (
                project.intelligenceQualityHistory.map((h, i) => (
                  <div
                    key={h.id || i}
                    className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-slate-800 rounded text-amber-300 font-bold">
                          MIQG_REPORT_v{h.version}
                        </span>
                        <span className="text-white font-bold">{h.overallScore}점 ({h.status})</span>
                        {h.isOutdated && (
                          <span className="text-slate-500 text-[10px]">● 이전 버전</span>
                        )}
                      </div>
                      <span className="text-slate-400 text-[11px] mt-1 block">
                        평가 시각: {new Date(h.evaluatedAt).toLocaleString()} • 결함 {h.issues.length}건
                      </span>
                    </div>

                    <span className="text-slate-400 text-[10px]">
                      단계: {h.evaluatedStages.map((s) => `S${s}`).join(', ')}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono">
                  <span className="text-amber-300 font-bold">MIQG_REPORT_v1 (현재 버전)</span>
                  <p className="text-slate-400 mt-1">
                    평가 시각: {new Date(report.evaluatedAt).toLocaleString()} • 총 {report.issues.length}건 진단됨
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. Sticky Footer Action Bar (Rule 2.1: Exactly TWO primary process actions) */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-4 shrink-0">
          {/* Action 1: Re-evaluate / Refresh */}
          <button
            onClick={onReevaluate}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs sm:text-sm transition flex items-center gap-2 border border-slate-700 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-amber-400" />
            <span>품질 검사 재실행</span>
          </button>

          {/* Action 2: Proceed or Close */}
          {onNextStep && !report.hasBlocker ? (
            <button
              onClick={() => {
                onClose();
                onNextStep();
              }}
              className="px-8 py-2.5 bg-gradient-to-r from-amber-500 via-amber-400 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 font-black rounded-xl text-xs sm:text-sm transition shadow-lg shadow-amber-950/40 flex items-center gap-2 cursor-pointer"
            >
              <span>품질 확인 및 다음 단계 진행</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-8 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm transition shadow-lg shadow-amber-950/40 cursor-pointer"
            >
              확인 및 대시보드 닫기
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
