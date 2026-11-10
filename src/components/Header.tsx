/**
 * Header Component
 * Cinema Dark Studio theme with breadcrumb step progression,
 * Safe Mode badge, and auto-save indicator.
 */

import React from 'react';
import { Film, ShieldCheck, FolderKanban, PlusCircle, CheckCircle2 } from 'lucide-react';
import { Project, IntelligenceQualityReport } from '../types';
import { QualityGateBadge } from './intelligence/QualityGateBadge';

interface HeaderProps {
  currentStep: number;
  onStepClick: (step: number) => void;
  onOpenProjects: () => void;
  onOpenSafeMode: () => void;
  onNewProject: () => void;
  activeProject?: Project | null;
  onOpenQualityGate?: () => void;
  qualityReport?: IntelligenceQualityReport | null;
  isQualityOutdated?: boolean;
}

const STEPS = [
  { step: 1, label: '영화 탐색' },
  { step: 2, label: '서사 & 모티브' },
  { step: 3, label: '스토리 변형' },
  { step: 4, label: '대본 & 콘티' },
  { step: 5, label: '제작 설계' },
  { step: 6, label: '자산 생성' },
  { step: 7, label: '편집 & 완성' },
  { step: 8, label: '납품 & 보관' }
];

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  onStepClick,
  onOpenProjects,
  onOpenSafeMode,
  onNewProject,
  activeProject,
  onOpenQualityGate,
  qualityReport,
  isQualityOutdated,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onStepClick(1)}
              className="flex items-center gap-2.5 text-left group transition"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)] group-hover:scale-105 transition">
                <Film className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg tracking-wider text-slate-100 group-hover:text-amber-400 transition">
                    MovieStory <span className="text-amber-500">AI</span>
                  </span>
                  <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    Cinema Studio
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Every Movie Has a Thousand Stories
                </p>
              </div>
            </button>
          </div>

          {/* Stepper Navigation (Progress Tracker) */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800">
            {STEPS.map((s, idx) => {
              const isCurrent = currentStep === s.step;
              const isPast = currentStep > s.step;
              const isClickable = isPast || isCurrent;

              return (
                <React.Fragment key={s.step}>
                  <button
                    onClick={() => isClickable && onStepClick(s.step)}
                    disabled={!isClickable}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition ${
                      isCurrent
                        ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                        : isPast
                        ? 'text-amber-300 hover:text-amber-200 cursor-pointer'
                        : 'text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isCurrent
                          ? 'bg-slate-950 text-amber-400'
                          : isPast
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {s.step}
                    </span>
                    <span>{s.label}</span>
                  </button>
                  {idx < STEPS.length - 1 && (
                    <span className="text-slate-700 text-xs">/</span>
                  )}
                </React.Fragment>
              );
            })}
          </nav>

          {/* Utility Tools */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* MIQG Quality Gate Badge */}
            <QualityGateBadge
              report={qualityReport}
              isOutdated={isQualityOutdated}
              onClick={onOpenQualityGate}
            />

            {/* Auto-save Status */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-800/40">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>실시간 자동 저장됨</span>
            </div>

            {/* Safe Mode Badge / Modal Trigger */}
            <button
              onClick={onOpenSafeMode}
              className="flex items-center gap-1.5 text-xs font-medium text-amber-300 hover:text-amber-200 bg-amber-950/30 hover:bg-amber-900/40 px-3 py-1.5 rounded-lg border border-amber-800/50 transition cursor-pointer"
              title="저작권 안심 모드 (SAFE MODE)"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Safe Mode</span>
            </button>

            {/* My Projects */}
            <button
              onClick={onOpenProjects}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/60 transition cursor-pointer"
            >
              <FolderKanban className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">보관함</span>
            </button>

            {/* New Project */}
            <button
              onClick={onNewProject}
              className="flex items-center gap-1.5 text-xs font-medium text-amber-400 hover:text-amber-300 bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/60 transition cursor-pointer"
              title="새 창작 시작"
            >
              <PlusCircle className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">새 작업</span>
            </button>
          </div>
        </div>

        {/* Mobile Stepper bar */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-slate-900 text-xs text-slate-400 overflow-x-auto">
          {STEPS.map((s) => (
            <button
              key={s.step}
              onClick={() => (currentStep >= s.step ? onStepClick(s.step) : null)}
              className={`px-2 py-0.5 rounded whitespace-nowrap ${
                currentStep === s.step
                  ? 'text-amber-400 font-bold'
                  : currentStep > s.step
                  ? 'text-slate-300'
                  : 'text-slate-600'
              }`}
            >
              {s.step}. {s.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
