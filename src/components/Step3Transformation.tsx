/**
 * Step 3: Story Transformation & Causal Engine
 *
 * Implements:
 * - Story Seed & Premise (Want vs Need)
 * - Story Bible with Inevitability (Job Necessity & Location Necessity)
 * - Plot Blueprint with Causal Chain (BECAUSE, THEREFORE, BUT, SO, UNTIL)
 * - Character Arc (Belief -> Wound -> Flaw -> Crisis -> Realization -> Choice -> Change)
 * - Narrative Coherence Validator (7 Core Questions) & Surgical Repair
 * - Creative Distance Review (High / Medium / Needs Revision with legal notice)
 * - Demo Story Mode tag
 * - Strict Rule 2.1: Exactly 2 primary process execution/navigation commands at bottom.
 */

import React, { useState } from 'react';
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Sliders,
  User,
  Compass,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Link as LinkIcon,
  BookOpen,
  Wrench,
  FileText,
  BadgeAlert
} from 'lucide-react';
import { MovieItem, StoryMotif, StoryOutput, CoherenceReport } from '../types';
import { StoryGeneratorService, TransformationOptions } from '../services/StoryGeneratorService';
import { CausalEngine } from '../services/CausalEngine';

interface Step3Props {
  movie: MovieItem;
  motifs: StoryMotif[];
  currentStory: StoryOutput | null;
  onStoryGenerated: (story: StoryOutput) => void;
  onPrevStep: () => void;
  onNextStep: () => void;
}

const GENRE_OPTIONS = [
  '휴먼 드라마',
  'SF 스릴러',
  '미스터리 서스펜스',
  '로맨틱 멜로',
  '역사 활극 / 사극',
  '블랙코미디',
  '도시 느와르'
];

const ERA_OPTIONS = [
  '현대 대한민국',
  '1980년대 아날로그 시절',
  '조선시대 후기',
  '근미래 2085년 인공지능 시대',
  '심해 해저 기지',
  '외계 성간 우주 정거장'
];

const ENDING_OPTIONS = [
  '감동적인 여운과 화해',
  '충격적인 반전 결말',
  '새로운 질문을 던지는 열린 결말',
  '비극을 딛고 일어선 주체적 성장'
];

const TONE_OPTIONS = [
  '절제된 서정과 깊은 울림',
  '숨 막히는 긴장과 서스펜스',
  '따뜻하고 유쾌한 온기',
  '시니컬하고 날카로운 통찰'
];

export const Step3Transformation: React.FC<Step3Props> = ({
  movie,
  motifs,
  currentStory,
  onStoryGenerated,
  onPrevStep,
  onNextStep
}) => {
  const activeMotif = motifs[0];

  const [targetGenre, setTargetGenre] = useState(
    Array.isArray(activeMotif?.recommendedGenre)
      ? activeMotif.recommendedGenre[0]
      : activeMotif?.recommendedGenre || '휴먼 드라마'
  );
  const [era, setEra] = useState('현대 대한민국');
  const [setting, setSetting] = useState('오래된 아날로그 기록 복원소와 대도시 디지털 아카이브');
  const [tone, setTone] = useState('절제된 서정과 깊은 울림');
  const [endingType, setEndingType] = useState('감동적인 여운과 화해');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeViewTab, setActiveViewTab] = useState<'narrative' | 'blueprint' | 'coherence'>('narrative');

  // Auto-generate story on initial load if none exists
  React.useEffect(() => {
    if (!currentStory && activeMotif) {
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMotif]);

  const handleGenerate = (customEnding?: string) => {
    if (!activeMotif) return;
    setIsGenerating(true);

    const options: TransformationOptions = {
      targetGenre,
      era,
      setting,
      tone,
      endingType: customEnding || endingType,
      audienceTarget: '전 세대 공감 서사'
    };

    setTimeout(() => {
      const nextVersion = currentStory ? currentStory.version + 1 : 1;
      const newStory = StoryGeneratorService.generateStory(movie, activeMotif, options, nextVersion);
      onStoryGenerated(newStory);
      setIsGenerating(false);
    }, 350);
  };

  const handleRemix = () => {
    const randomGenre = GENRE_OPTIONS[Math.floor(Math.random() * GENRE_OPTIONS.length)];
    const randomEra = ERA_OPTIONS[Math.floor(Math.random() * ERA_OPTIONS.length)];
    setTargetGenre(randomGenre);
    setEra(randomEra);

    if (randomGenre.includes('SF')) {
      setSetting('고립된 성간 통신 기지와 사이버네틱스 데이터 허브');
    } else if (randomGenre.includes('역사')) {
      setSetting('조선 후기 한양의 은밀한 사설 서고와 저잣거리');
    } else {
      setSetting('도심 속 옥상 온실과 심야 라디오 스튜디오');
    }

    handleGenerate();
  };

  // Surgical Repair Handler
  const handleRepairStructure = () => {
    if (!currentStory?.storyBible || !currentStory?.plotBlueprint) return;
    setIsGenerating(true);

    const failedOrWarnItem = currentStory.coherenceReport?.items.find((i) => i.status !== 'PASS');
    const itemId = failedOrWarnItem?.id || 'check-causal';

    const repaired = CausalEngine.repairStoryStructure(
      currentStory.storyBible,
      currentStory.plotBlueprint,
      itemId,
      failedOrWarnItem?.repairSuggestion || '인과관계 보완'
    );

    const fullNarrativeText = CausalEngine.generateFullCoherentNarrative(
      repaired.bible,
      repaired.blueprint
    );

    const updatedStory: StoryOutput = {
      ...currentStory,
      storyBible: repaired.bible,
      plotBlueprint: repaired.blueprint,
      coherenceReport: repaired.report,
      fullNarrativeText,
      version: currentStory.version + 1
    };

    setTimeout(() => {
      onStoryGenerated(updatedStory);
      setIsGenerating(false);
    }, 300);
  };

  const bible = currentStory?.storyBible;
  const blueprint = currentStory?.plotBlueprint;
  const coherence = currentStory?.coherenceReport;
  const distance = currentStory?.creativeDistanceReview;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner with Demo Mode & Motif Origin */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold px-2 py-0.5 rounded bg-amber-500 text-slate-950">
              창작 모티브 확정
            </span>
            <span className="text-xs text-slate-400">영감의 원천: 영화 [{movie.title}]</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-amber-300 bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-800/80">
              데모 스토리 모드 (Causal Engine v2)
            </span>
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-4 h-4" />
              Creative Distance: High
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            {activeMotif?.title || '창작 모티브'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            <strong>핵심 테마:</strong> {activeMotif?.lifeTheme || activeMotif?.coreTheme}
          </p>
          <p className="text-xs text-slate-400">
            <strong>갈등 원리:</strong> {activeMotif?.conflictStructure || activeMotif?.conflictPrinciple}
          </p>
        </div>
      </div>

      {/* Story Transformation Knobs */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Sliders className="w-4 h-4" />
            <span>Story Transformation Engine (세계관 및 서사 설정)</span>
          </div>
          <p className="text-xs text-slate-400">
            인과관계 파이프라인: Seed → Premise → Bible → Plot Blueprint → Narrative Coherence
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Target Genre */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">재창작 장르</label>
            <select
              value={targetGenre}
              onChange={(e) => setTargetGenre(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            >
              {GENRE_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Era / Universe */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">시대 및 세계관</label>
            <select
              value={era}
              onChange={(e) => setEra(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            >
              {ERA_OPTIONS.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>

          {/* Ending Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">결말 방향</label>
            <select
              value={endingType}
              onChange={(e) => setEndingType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            >
              {ENDING_OPTIONS.map((end) => (
                <option key={end} value={end}>
                  {end}
                </option>
              ))}
            </select>
          </div>

          {/* Tone */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">감정 톤</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            >
              {TONE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Setting detail input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">주요 무대 및 배경 공간</label>
          <input
            type="text"
            value={setting}
            onChange={(e) => setSetting(e.target.value)}
            placeholder="이야기가 펼쳐질 구체적인 장소를 입력해 보세요."
            className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Transform / Remix Control */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="text-xs text-slate-400">
            {currentStory && (
              <span>
                현재 서사 엔진 버전: <strong className="text-amber-400">v{currentStory.version} (Causal Engine)</strong>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRemix}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span>다른 세계관으로 무작위 리믹스 (Remix)</span>
            </button>
            <button
              type="button"
              onClick={() => handleGenerate()}
              disabled={isGenerating}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>설정값으로 서사 재생성</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-View Tabs: Narrative, Blueprint/Bible, Coherence */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveViewTab('narrative')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeViewTab === 'narrative'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>완결된 서사 본문 (Final Story)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveViewTab('blueprint')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeViewTab === 'blueprint'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <LinkIcon className="w-4 h-4" />
          <span>인과 체인 & Story Bible (Causal Chain)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveViewTab('coherence')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeViewTab === 'coherence'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>이야기 구조 점검 (Coherence Validator)</span>
          {coherence?.overallStatus === 'PASS' ? (
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block ml-1" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block ml-1" />
          )}
        </button>
      </div>

      {/* VIEW 1: Final Story Narrative & Core Premise */}
      {activeViewTab === 'narrative' && currentStory && (
        <div className="space-y-6">
          {/* Main Story Container */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            {/* Header info */}
            <div className="space-y-2 border-b border-slate-800 pb-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500 text-slate-950">
                  {currentStory.targetGenre}
                </span>
                <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  {currentStory.era}
                </span>
                <span className="text-xs text-slate-400">
                  무대: {currentStory.setting}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {currentStory.title}
              </h3>

              <p className="text-sm sm:text-base text-amber-200/90 font-medium italic">
                “{currentStory.logline}”
              </p>
            </div>

            {/* Story Seed & Premise Summary */}
            {currentStory.storySeed && currentStory.storyPremise && (
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <Sparkles className="w-4 h-4" />
                  <span>Story Seed & 중심 질문 (Dramatic Question)</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {currentStory.storySeed.oneSentenceSeed}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs border-t border-slate-800/60">
                  <div>
                    <span className="text-amber-400 font-semibold mr-1.5">Want (표면적 목표):</span>
                    <span className="text-slate-300">{currentStory.storyPremise.want}</span>
                  </div>
                  <div>
                    <span className="text-emerald-400 font-semibold mr-1.5">Need (진정한 성장):</span>
                    <span className="text-slate-300">{currentStory.storyPremise.need}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Full Narrative Text (Connected Prose) */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>완결 서사 본문 (Full Coherent Prose)</span>
              </h4>
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed space-y-4 whitespace-pre-line font-sans">
                {currentStory.fullNarrativeText || (
                  <p>
                    {currentStory.plot.act1}
                    <br /><br />
                    {currentStory.plot.act2}
                    <br /><br />
                    {currentStory.plot.climax}
                    <br /><br />
                    {currentStory.plot.resolution}
                  </p>
                )}
              </div>
            </div>

            {/* Audience Takeaway */}
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs text-amber-200/90 leading-relaxed">
              <strong className="text-amber-300 block mb-0.5">시청자에게 남기는 인생 메시지:</strong>
              {currentStory.audienceTakeaway}
            </div>
          </div>

          {/* Creative Distance Review (Audited & Disclaimed) */}
          {distance && (
            <div className="bg-slate-900 border border-emerald-800/40 rounded-2xl p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h4 className="font-bold text-sm text-white">
                    Creative Distance Review (창작적 분리 검토)
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">종합 분리도 평가:</span>
                  <span className="text-xs font-bold text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-800">
                    {distance.overallSeparation} (충분히 분리됨)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400">인물 분리</span>
                  <p className="text-emerald-400 font-bold">{distance.characterSeparation}</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400">공간/시대 분리</span>
                  <p className="text-emerald-400 font-bold">{distance.settingSeparation}</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400">플롯 인과 분리</span>
                  <p className="text-emerald-400 font-bold">{distance.plotSeparation}</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400">표현/대사 분리</span>
                  <p className="text-emerald-400 font-bold">{distance.expressionSeparation}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <p className="font-medium text-amber-300/90">⚖️ {distance.disclaimer}</p>
                <p>본 평가는 추상적 서사 테마 추출과 원작 고유 대사/캐릭터의 완전한 배제를 확인한 알고리즘 검토 결과입니다.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: Causal Chain & Story Bible (Inevitabilities) */}
      {activeViewTab === 'blueprint' && bible && blueprint && (
        <div className="space-y-6">
          {/* Causal Chain Display */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <LinkIcon className="w-4 h-4 text-amber-400" />
                <span>Causal Chain Engine (인과적 사건 연결 체인)</span>
              </div>
              <span className="text-xs text-slate-400">
                BECAUSE → THEREFORE → BUT → SO → UNTIL
              </span>
            </div>

            <div className="space-y-3">
              {blueprint.causalChain.map((link, idx) => (
                <div
                  key={link.eventId}
                  className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded font-extrabold text-[11px] ${
                        link.connector === 'BECAUSE'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : link.connector === 'THEREFORE'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : link.connector === 'BUT'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : link.connector === 'SO'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      }`}
                    >
                      {link.connector} ({link.connector === 'BECAUSE' ? '왜냐하면' : link.connector === 'THEREFORE' ? '그러므로' : link.connector === 'BUT' ? '그러나' : link.connector === 'SO' ? '그래서' : '마침내'})
                    </span>
                    <span className="font-bold text-slate-100 text-sm">{link.event}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 pt-1">
                    <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                      <strong className="text-amber-400 block mb-0.5">발생 원인 (Cause):</strong>
                      {link.causedBy}
                    </div>
                    <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                      <strong className="text-emerald-400 block mb-0.5">필연적 결과 (Consequence):</strong>
                      {link.consequence}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Job & Location Inevitability Check */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 text-xs">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <User className="w-4 h-4" />
                <span>직업의 필연성 (Why this occupation?)</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-200 font-bold text-sm">
                  {bible.protagonist.name} — {bible.protagonist.occupation}
                </span>
                <p className="text-slate-300 leading-relaxed pt-1">
                  {bible.protagonist.occupationNecessity}
                </p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 text-xs">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Compass className="w-4 h-4" />
                <span>공간의 필연성 (Why this location?)</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-200 font-bold text-sm">
                  {bible.setting.primaryLocation} ({bible.setting.era})
                </span>
                <p className="text-slate-300 leading-relaxed pt-1">
                  {bible.setting.locationNecessity}
                </p>
              </div>
            </div>
          </div>

          {/* Character Arc Engine */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Character Arc Engine (인물의 7단계 내적 변화)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 font-semibold">1. 시작 신념</span>
                <p className="text-slate-300">{bible.characterArc.initialBelief}</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 font-semibold">2. 감정적 상처 & 결함</span>
                <p className="text-rose-300">{bible.characterArc.emotionalWound}</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 font-semibold">3. 결정적 깨달음</span>
                <p className="text-amber-300">{bible.characterArc.realization}</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 font-semibold">4. 최종 선택 & 변화</span>
                <p className="text-emerald-300">{bible.characterArc.finalChoice}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: Narrative Coherence Validator (7 Core Questions) */}
      {activeViewTab === 'coherence' && coherence && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  이야기 구조 점검 리포트 (Narrative Coherence)
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">{coherence.summaryText}</p>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    coherence.overallStatus === 'PASS'
                      ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                      : 'bg-amber-950/60 text-amber-300 border-amber-800'
                  }`}
                >
                  {coherence.overallStatus === 'PASS' ? '전체 항목 PASS (인과 정합)' : '구조 보완 가능 (WARNING)'}
                </span>

                {coherence.overallStatus !== 'PASS' && (
                  <button
                    type="button"
                    onClick={handleRepairStructure}
                    className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>AI 구조 보완하기</span>
                  </button>
                )}
              </div>
            </div>

            {/* 7 Core Checklist Items */}
            <div className="space-y-3">
              {coherence.items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {item.status === 'PASS' ? '🟢' : item.status === 'WARNING' ? '🟡' : '🔴'}
                      </span>
                      <span className="font-bold text-slate-200 text-sm">{item.title}</span>
                      <span className="text-slate-500">• {item.question}</span>
                    </div>
                    <p className="text-slate-300 pl-6">{item.finding}</p>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded font-extrabold text-[11px] shrink-0 self-end sm:self-center ${
                      item.status === 'PASS'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Primary Action Commands Bar (STRICTLY MAXIMUM 2 BUTTONS as per Rule 2.1) */}
      <div className="sticky bottom-4 z-30 pt-4 border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-md p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl">
        <div className="text-xs text-slate-400 text-center sm:text-left">
          {currentStory ? (
            <span className="text-amber-300 font-medium">
              인과 체인 완성: [ {currentStory.title} ]
            </span>
          ) : (
            <span>인과 서사 생성 중입니다...</span>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Action 1: Back command */}
          <button
            type="button"
            onClick={onPrevStep}
            className="flex-1 sm:flex-none px-4 py-3 rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>이전: 모티브 다시 선택</span>
          </button>

          {/* Action 2: Next step proceed command */}
          <button
            type="button"
            onClick={onNextStep}
            disabled={!currentStory}
            className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-lg ${
              currentStory
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-amber-500/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
            }`}
          >
            <span>다음: 대본 및 장면 구성 →</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
