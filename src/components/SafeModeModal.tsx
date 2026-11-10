/**
 * SafeModeModal Component
 * Explains the Safe Mode copyright principles, separation of ideas vs expression,
 * and rights management from Part 4 of the Master Prompt.
 */

import React from 'react';
import { X, ShieldCheck, CheckCircle2, AlertTriangle, Scale } from 'lucide-react';

interface SafeModeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafeModeModal: React.FC<SafeModeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                저작권 안심 모드 (SAFE MODE) 안내
              </h3>
              <p className="text-xs text-slate-400">MovieStory AI의 독창성 보장 원칙</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300 leading-relaxed">
          {/* Core Principle */}
          <div className="bg-amber-950/20 border border-amber-800/40 p-4 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <Scale className="w-4 h-4" />
              <span>아이디어와 구체적 표현의 엄격한 분리</span>
            </div>
            <p className="text-slate-300">
              저작권법상 저작권의 보호 대상은 <strong>‘구체적인 표현’</strong>이며, <strong>‘추상적인 아이디어나 감정, 보편적 서사 구조’</strong>는 보호 대상이 아닙니다.
            </p>
            <p className="text-slate-400">
              MovieStory AI는 영화의 대사, 고유 인물명, 시각적 클립을 복제하지 않고, 오직 영화 속에 담긴 추상적인 인생 테마만을 추출하여 완전히 새로운 100% 독립 창작물을 완성합니다.
            </p>
          </div>

          {/* 2 Modes Comparison */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-white">콘텐츠 사용 모드 비교</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-950 rounded-xl border border-emerald-500/30 space-y-1.5">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  SAFE MODE (기본값)
                </span>
                <p className="text-slate-300">
                  AI 독창적 생성 스토리, 고유 캐릭터 설정, 라이선스가 확인된 스톡 및 순수 AI 생성 프롬프트를 사용하여 저작권 위험 없이 안전하게 창작합니다.
                </p>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  CC / 사용자 자료 모드
                </span>
                <p className="text-slate-400">
                  사용자가 직접 제공한 이미지나 CC 라이선스 자료를 활용할 수 있으며, NC(비영리), ND(변경금지) 조건을 철저히 검증 및 안내합니다.
                </p>
              </div>
            </div>
          </div>

          {/* Creative Distance Review */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-white">Creative Distance Review 엔진</h4>
            <p className="text-slate-400">
              스토리가 완성될 때마다 인물(Character), 공간(Setting), 플롯(Plot), 표현(Expression)의 4대 영역에서 원작과의 창작적 분리도를 평가(High / Medium / Needs Revision)합니다.
            </p>
            <div className="p-3 bg-slate-950 rounded-lg border border-amber-900/40 text-amber-300/90 text-[11px] font-medium">
              ⚖️ AI 기반 창작적 분리 검토 결과이며 법률적 저작권 비침해를 보증하지 않습니다.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
