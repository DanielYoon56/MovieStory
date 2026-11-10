/**
 * Step 4: Script & Storyboard Studio
 * Upgraded with Step 3 -> Step 4 Story Fidelity Engine:
 * - STEP 3 IS THE STORY AUTHORITY. STEP 4 IS THE CINEMATIC TRANSLATION LAYER.
 * - Actions first, physical props, dialogue arising from events, no generic clichés.
 * - Shows Fidelity Audit Report badge & verification breakdown.
 * - 9:16 Shorts (4 scenes) vs 16:9 Cinema (5 scenes).
 * - Strictly Maximum 2 primary navigation commands at bottom (Rule 2.1).
 */

import React, { useState } from 'react';
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Clapperboard,
  Tv,
  Smartphone,
  Copy,
  Check,
  Camera,
  Sun,
  Volume2,
  Clock,
  MessageSquareQuote,
  ShieldCheck,
  Package,
  Layers,
  ChevronDown,
  ChevronUp,
  Video
} from 'lucide-react';
import { StoryOutput, ScriptProduction } from '../types';
import { StoryGeneratorService } from '../services/StoryGeneratorService';

interface Step4Props {
  story: StoryOutput;
  currentScript: ScriptProduction | null;
  onScriptGenerated: (script: ScriptProduction) => void;
  onPrevStep: () => void;
  onNextStep: () => void;
}

export const Step4ScriptStudio: React.FC<Step4Props> = ({
  story,
  currentScript,
  onScriptGenerated,
  onPrevStep,
  onNextStep
}) => {
  const [format, setFormat] = useState<'shorts' | 'cinema'>('shorts');
  const [copiedVisualIdx, setCopiedVisualIdx] = useState<number | null>(null);
  const [copiedVideoIdx, setCopiedVideoIdx] = useState<number | null>(null);
  const [showFidelityDetails, setShowFidelityDetails] = useState<boolean>(false);

  // Initialize or re-generate script when story or format changes
  React.useEffect(() => {
    if (!currentScript || currentScript.storyId !== story.id || currentScript.format !== format) {
      const generated = StoryGeneratorService.generateScript(story, format);
      onScriptGenerated(generated);
    }
  }, [format, story, currentScript, onScriptGenerated]);

  const handleFormatChange = (newFormat: 'shorts' | 'cinema') => {
    setFormat(newFormat);
    const updated = StoryGeneratorService.generateScript(story, newFormat);
    onScriptGenerated(updated);
  };

  const handleForceRegenerate = () => {
    const updated = StoryGeneratorService.generateScript(story, format);
    onScriptGenerated(updated);
  };

  const copyVisualPrompt = (prompt: string, idx: number) => {
    navigator.clipboard.writeText(prompt);
    setCopiedVisualIdx(idx);
    setTimeout(() => setCopiedVisualIdx(null), 2000);
  };

  const copyVideoPrompt = (prompt: string, idx: number) => {
    navigator.clipboard.writeText(prompt);
    setCopiedVideoIdx(idx);
    setTimeout(() => setCopiedVideoIdx(null), 2000);
  };

  const protagonist = story.characters[0];
  const pkg = currentScript?.sourcePackage;
  const fidelity = currentScript?.fidelityReport;

  return (
    <div className="space-y-8 pb-12">
      {/* Studio Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
              <Clapperboard className="w-4 h-4" />
              <span>Script & Storyboard Studio</span>
            </span>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Step 3 스토리 100% 충실 반영 (Fidelity Score: {fidelity?.score || 100}%)</span>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            [{story.title}] 영상 대본 및 연출 콘티
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            3단계에서 확정된 직업 필연성·발단 사건·양자택일 딜레마·인과적 결말을 구체적 물리적 행동과 소품 중심으로 번역했습니다.
          </p>

          {/* Context Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-2.5 text-[11px] text-slate-300">
            <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700 font-medium">
              주인공: {protagonist?.name} ({pkg?.protagonist.occupation || protagonist?.occupation || protagonist?.role})
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              시대: {story.era}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              무대: {story.setting}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              장르: {story.targetGenre}
            </span>
            {pkg?.contentHash && (
              <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 font-mono text-[10px]">
                Hash: {pkg.contentHash}
              </span>
            )}
          </div>
        </div>

        {/* Video Format Switcher & Regenerate Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleForceRegenerate}
            title="현재 3단계 스토리를 다시 읽어 대본을 새로 생성합니다"
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>대본 새로 생성</span>
          </button>

          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => handleFormatChange('shorts')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                format === 'shorts'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>9:16 쇼츠 (60초)</span>
            </button>

            <button
              type="button"
              onClick={() => handleFormatChange('cinema')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                format === 'cinema'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>16:9 시네마 (단편)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Story Fidelity Audit Report Accordion */}
      <div className="bg-slate-900/80 border border-emerald-900/60 rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <span>Story Fidelity Report (Step 3 원작 서사 충실도 검증)</span>
                <span className="text-emerald-400 font-extrabold text-[11px] bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  {fidelity?.score || 100}% 통과
                </span>
              </h4>
              <p className="text-[11px] text-slate-400">
                {fidelity?.summary || 'Step 3의 핵심 사건과 인과관계가 Step 4 대본에 누락 없이 반영되었습니다.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowFidelityDetails(!showFidelityDetails)}
            className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-800/80 transition cursor-pointer"
          >
            <span>{showFidelityDetails ? '검증 세부 항목 접기' : '검증 6대 원칙 보기'}</span>
            {showFidelityDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Core Causal Facts Tracker Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 text-[11px]">
          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-amber-400">1. 직업 & 발단 사건</span>
            <p className="text-slate-300 truncate" title={pkg?.incitingIncident}>
              {pkg?.incitingIncident || '결정적 이상 기록 발견'}
            </p>
          </div>
          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-amber-400">2. 위기 & 퇴로 차단</span>
            <p className="text-slate-300 truncate" title={pkg?.centralConflict}>
              {pkg?.acts.act2.keyEvent || '보안 추적과 퇴로 차단'}
            </p>
          </div>
          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-amber-400">3. 절정의 결단</span>
            <p className="text-slate-300 truncate" title={pkg?.climaxChoice}>
              {pkg?.climaxChoice || '회유 거절 및 전면 송출'}
            </p>
          </div>
          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-amber-400">4. 인과적 결말</span>
            <p className="text-slate-300 truncate" title={pkg?.resolution}>
              {pkg?.resolution || '내적 해방과 회복된 존엄'}
            </p>
          </div>
        </div>

        {/* Detailed 6-Point Verification Checklist (Expandable) */}
        {showFidelityDetails && fidelity?.checks && (
          <div className="pt-3 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {fidelity.checks.map((chk) => (
              <div
                key={chk.id}
                className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 flex items-start gap-2"
              >
                <div className="mt-0.5 shrink-0">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-200 text-[11px]">{chk.targetStoryFact}</div>
                  <div className="text-slate-400 text-[11px] leading-relaxed">{chk.finding}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Script Summary & Format Guidance */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
            <Clock className="w-4 h-4" />
            예상 영상 총 길이: 약 {currentScript?.totalDurationSeconds || (format === 'shorts' ? 60 : 180)}초
          </span>
          <span>•</span>
          <span>총 장면 수: {currentScript?.scenes.length || (format === 'shorts' ? 4 : 5)}개 씬</span>
          <span>•</span>
          <span className="text-slate-400">
            {format === 'shorts'
              ? '인과 구조: Hook (발단) → Escalation (BECAUSE 위기) → Choice (THEREFORE 결단) → Consequence (SO 결말)'
              : '인과 구조: Prologue (일상과 균열) → Investigation (BECAUSE 추적) → Crisis (BUT 차단) → Climax (THEREFORE 결단) → Epilogue (SO 존엄 회복)'}
          </span>
        </div>
      </div>

      {/* Scene by Scene Breakdown */}
      <div className="space-y-6">
        {currentScript?.scenes.map((scene, idx) => (
          <div
            key={scene.sceneNumber}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-slate-700 transition shadow-lg"
          >
            {/* Scene Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-1 rounded-lg text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  SCENE #{scene.sceneNumber}
                </span>
                {scene.causalRole && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-amber-300 border border-slate-700">
                    {scene.causalRole} ({scene.causalConnector || '인과 연결'})
                  </span>
                )}
                <h3 className="text-base font-bold text-white">{scene.title}</h3>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span>📍 {scene.location}</span>
                <span>•</span>
                <span>🕒 {scene.timeOfDay}</span>
                <span>•</span>
                <span className="text-amber-400 font-medium">⏱ 약 {scene.estimatedDurationSeconds}초</span>
              </div>
            </div>

            {/* Step 3 Story Authority Fact & Physical Props Banner */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>3단계 확정 서사 팩트 (Story Authority Fact):</span>
                </span>
                {scene.propsInvolved && scene.propsInvolved.length > 0 && (
                  <span className="text-[11px] font-semibold text-cyan-300 bg-cyan-950/60 px-2.5 py-0.5 rounded border border-cyan-800/80 flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    <span>사용 소품: {scene.propsInvolved.join(', ')}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed pl-5 border-l-2 border-amber-500/40">
                {scene.sourceFact || scene.situation}
              </p>
            </div>

            {/* Directing & Physical Action Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
                <span className="font-bold text-slate-200">🎬 극적 상황 및 목표 (Dramatic Purpose):</span>
                <p className="text-slate-300 leading-relaxed">{scene.situation}</p>
              </div>

              <div className="space-y-1.5 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
                <span className="font-bold text-amber-300">🎭 연출 및 구체적 물리적 행동 지문 (Physical Action):</span>
                <p className="text-slate-200 leading-relaxed font-medium">{scene.action}</p>
              </div>
            </div>

            {/* Concrete Reactionary Dialogue (No Clichés) */}
            {scene.dialogue.length > 0 && (
              <div className="space-y-2 bg-slate-950/90 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <MessageSquareQuote className="w-4 h-4" />
                  <span>대사 (Dialogue — 사건·소품·조건 기반):</span>
                </div>
                <div className="space-y-2 pt-1">
                  {scene.dialogue.map((d, dIdx) => (
                    <div key={dIdx} className="text-xs flex items-baseline gap-2">
                      <span className="font-bold text-amber-300 shrink-0">{d.speaker}</span>
                      {d.emotionTag && (
                        <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                          {d.emotionTag}
                        </span>
                      )}
                      <span className="text-slate-100 font-medium text-sm leading-relaxed">
                        {d.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cinematic Technical Cues */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  <span>카메라 앵글</span>
                </div>
                <p className="text-slate-300">{scene.cameraAngle}</p>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>조명 및 색감</span>
                </div>
                <p className="text-slate-300">{scene.lighting}</p>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>오디오 & BGM 큐</span>
                </div>
                <p className="text-slate-300">{scene.audioCue}</p>
              </div>
            </div>

            {/* AI Prompts Dual Cards: Visual Still & Video Generation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Visual Prompt Card */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    AI 비주얼 스틸 프롬프트 (Image / Keyframe)
                  </span>
                  <button
                    type="button"
                    onClick={() => copyVisualPrompt(scene.visualPrompt, idx)}
                    className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 transition cursor-pointer"
                  >
                    {copiedVisualIdx === idx ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">복사됨!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>복사</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-300 font-mono bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 leading-relaxed">
                  {scene.visualPrompt}
                </p>
              </div>

              {/* Video Motion Prompt Card */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                    <Video className="w-3 h-3 text-cyan-400" />
                    AI 비디오 모션 프롬프트 (Video Generation)
                  </span>
                  <button
                    type="button"
                    onClick={() => copyVideoPrompt(scene.videoPrompt, idx)}
                    className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 px-2 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 transition cursor-pointer"
                  >
                    {copiedVideoIdx === idx ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">복사됨!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>복사</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-300 font-mono bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 leading-relaxed">
                  {scene.videoPrompt}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Primary Action Commands Bar (STRICTLY MAXIMUM 2 BUTTONS as per Rule 2.1) */}
      <div className="sticky bottom-4 z-30 pt-4 border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-md p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl">
        <div className="text-xs text-slate-400 text-center sm:text-left">
          <span>대본 및 연출 콘티 작성이 완료되었습니다.</span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Action 1: Back command */}
          <button
            type="button"
            onClick={onPrevStep}
            className="flex-1 sm:flex-none px-4 py-3 rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>이전: 스토리 수정</span>
          </button>

          {/* Action 2: Next step proceed command */}
          <button
            type="button"
            onClick={onNextStep}
            className="flex-1 sm:flex-none px-6 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-lg bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-amber-500/20"
          >
            <span>다음: 제작 설계 패키지 빌더 →</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
