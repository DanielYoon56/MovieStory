/**
 * Step 2: Movie Intelligence & Story Motif Generator
 * Displays Module 02 (Deep Narrative Analysis) and Module 03 (Creative Story Motifs).
 * Strict Rule 2.1: Exactly 2 primary process execution/navigation commands at bottom.
 */

import React, { useState } from 'react';
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  Heart,
  Swords,
  Users,
  Compass,
  Lightbulb,
  Check,
  Film
} from 'lucide-react';
import { MovieItem, MovieAnalysis, StoryMotif } from '../types';

interface Step2Props {
  movie: MovieItem;
  analysis: MovieAnalysis | null;
  motifs: StoryMotif[];
  selectedMotifs: StoryMotif[];
  loading: boolean;
  onToggleMotif: (motif: StoryMotif) => void;
  onPrevStep: () => void;
  onNextStep: () => void;
}

export const Step2IntelligenceAndMotifs: React.FC<Step2Props> = ({
  movie,
  analysis,
  motifs,
  selectedMotifs,
  loading,
  onToggleMotif,
  onPrevStep,
  onNextStep
}) => {
  const [activeTab, setActiveTab] = useState<'motifs' | 'analysis'>('motifs');

  return (
    <div className="space-y-8 pb-12">
      {/* Movie Banner Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-start shadow-xl">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-28 h-40 sm:w-36 sm:h-52 object-cover rounded-xl border border-slate-700 shadow-md shrink-0"
        />
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
              서사 분석 완료
            </span>
            <span className="text-xs text-slate-400">
              {movie.country} • {movie.year} • {movie.director} 감독
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            {movie.title}{' '}
            <span className="text-base font-normal text-slate-400">({movie.originalTitle})</span>
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
            {movie.synopsis}
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {movie.genre.map((g) => (
              <span
                key={g}
                className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-medium border border-slate-700"
              >
                {g}
              </span>
            ))}
            <div className="flex items-center gap-1.5 ml-auto text-xs text-amber-400">
              <Sparkles className="w-4 h-4" />
              <span>발굴된 창작 모티브: {motifs.length}개</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation (Filter/View controls don't count towards command limit) */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('motifs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
              activeTab === 'motifs'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            <span>창작 스토리 모티브 발굴 ({motifs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analysis')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
              activeTab === 'analysis'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>영화 심층 서사 분석</span>
          </button>
        </div>

        <div className="text-xs text-slate-400 hidden sm:block">
          마음에 드는 모티브를 1개 이상 선택해 다음 단계로 진행하세요.
        </div>
      </div>

      {/* TAB 1: Story Motifs List */}
      {activeTab === 'motifs' && (
        <div className="space-y-4">
          <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
              <p className="text-xs text-slate-300">
                <strong className="text-amber-300">원작 분리 원칙(Creative Separation):</strong> 원작의
                인물 이름이나 대사가 아닌, 영화에 담긴 보편적 감정과 인간 갈등의 테마만 추출하여
                100% 독창적인 새 이야기로 재창작합니다.
              </p>
            </div>
            <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md shrink-0 ml-4 hidden md:inline">
              선택됨: {selectedMotifs.length}개
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {motifs.map((motif, idx) => {
              const isSelected = selectedMotifs.some((m) => m.id === motif.id);

              return (
                <div
                  key={motif.id}
                  onClick={() => onToggleMotif(motif)}
                  className={`p-5 rounded-2xl border text-left transition duration-200 cursor-pointer flex flex-col justify-between space-y-4 relative ${
                    isSelected
                      ? 'bg-slate-900 border-amber-500 ring-2 ring-amber-500/50 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header line with checkbox */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center border border-slate-700">
                          {idx + 1}
                        </span>
                        <h3 className="text-base font-bold text-white tracking-tight">
                          {motif.title}
                        </h3>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center border transition ${
                          isSelected
                            ? 'bg-amber-500 border-amber-500 text-slate-950 font-bold'
                            : 'border-slate-700 bg-slate-800 text-transparent'
                        }`}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    </div>

                    {/* Emotion tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {motif.coreEmotion.map((emo) => (
                        <span
                          key={emo}
                          className="px-2 py-0.5 rounded text-[11px] font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20"
                        >
                          #{emo}
                        </span>
                      ))}
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {motif.recommendedGenre}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300">
                        {motif.recommendedFormat}
                      </span>
                    </div>

                    {/* Life Theme & Conflict */}
                    <div className="space-y-1.5 text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                      <div>
                        <span className="text-amber-400 font-semibold mr-1.5">인생의 주제:</span>
                        {motif.lifeTheme}
                      </div>
                      <div>
                        <span className="text-amber-400 font-semibold mr-1.5">갈등 구조:</span>
                        {motif.conflictStructure}
                      </div>
                    </div>

                    {/* Creative Direction */}
                    <div className="text-xs text-slate-400 leading-relaxed">
                      <strong className="text-slate-200">새로운 이야기 발전 방향: </strong>
                      {motif.creativeDirection}
                    </div>
                  </div>

                  {/* Originality Guard Note */}
                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 text-emerald-400 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {motif.originalityReview.abstractionLevel}
                    </span>
                    <span className="text-slate-400">{motif.audienceResonance.slice(0, 20)}...</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Deep Narrative Analysis (Intelligence) */}
      {activeTab === 'analysis' && analysis && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Core Theme */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <BookOpen className="w-4 h-4" />
                <span>Story Theme (중심 주제 및 인간 통찰)</span>
              </div>
              <p className="text-base font-semibold text-white leading-relaxed">
                {analysis.theme.core}
              </p>
              <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                <p>
                  <strong className="text-slate-200">인간에 대한 통찰:</strong>{' '}
                  {analysis.theme.humanInsight}
                </p>
                <p>
                  <strong className="text-slate-200">인생의 의미:</strong>{' '}
                  {analysis.theme.lifeMeaning}
                </p>
                <p>
                  <strong className="text-slate-200">사회적 메시지:</strong>{' '}
                  {analysis.theme.socialMessage}
                </p>
              </div>
            </div>

            {/* Emotional Structure */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <Heart className="w-4 h-4" />
                <span>Emotional Structure (감정 구조)</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.emotions.primary.map((emo) => (
                  <span
                    key={emo}
                    className="px-3 py-1 bg-rose-500/10 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold"
                  >
                    {emo}
                  </span>
                ))}
                <span className="px-3 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold">
                  감정 강도: {analysis.emotions.intensity}/10
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-slate-800">
                <strong className="text-slate-200">감정 변화 곡선:</strong>{' '}
                {analysis.emotions.emotionalArc}
              </p>
            </div>

            {/* Conflict Structure */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Swords className="w-4 h-4" />
                <span>Conflict Structure (갈등 구조)</span>
              </div>
              <div className="space-y-2 text-xs text-slate-300">
                <p>
                  <strong className="text-slate-200">내면적 갈등:</strong>{' '}
                  {analysis.conflicts.inner}
                </p>
                <p>
                  <strong className="text-slate-200">인간관계 갈등:</strong>{' '}
                  {analysis.conflicts.interpersonal}
                </p>
                <p>
                  <strong className="text-slate-200">사회적 갈등:</strong>{' '}
                  {analysis.conflicts.societal}
                </p>
                <p>
                  <strong className="text-slate-200">도덕적 선택:</strong>{' '}
                  {analysis.conflicts.moralChoice}
                </p>
              </div>
            </div>

            {/* Human Relationships */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Users className="w-4 h-4" />
                <span>Human Relationships (인간관계 특징)</span>
              </div>
              <div className="space-y-3">
                {analysis.relationships.map((rel, i) => (
                  <div key={i} className="text-xs p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="font-semibold text-cyan-300">
                      [{rel.type}] {rel.characters}
                    </span>
                    <p className="text-slate-300">{rel.dynamic}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 5 Narrative Elements */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Compass className="w-4 h-4" />
              <span>Narrative Arc (서사 5단계 구조)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                <span className="font-bold text-amber-400">1. 발단</span>
                <p className="text-slate-300">{analysis.narrativeElements.exposition}</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                <span className="font-bold text-amber-400">2. 사건 촉발</span>
                <p className="text-slate-300">{analysis.narrativeElements.incitingIncident}</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                <span className="font-bold text-amber-400">3. 위기 고조</span>
                <p className="text-slate-300">{analysis.narrativeElements.risingAction}</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                <span className="font-bold text-amber-400">4. 절정</span>
                <p className="text-slate-300">{analysis.narrativeElements.climax}</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                <span className="font-bold text-amber-400">5. 결말</span>
                <p className="text-slate-300">{analysis.narrativeElements.resolution}</p>
              </div>
            </div>
          </div>

          {/* Life Lessons */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <h4 className="font-bold text-sm text-amber-400">💡 영화가 건네는 인생의 교훈</h4>
            <ul className="space-y-2 text-xs text-slate-300">
              {analysis.lifeLessons.map((lesson, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold shrink-0">•</span>
                  <span>{lesson}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Primary Action Commands Bar (STRICTLY MAXIMUM 2 BUTTONS as per Rule 2.1) */}
      <div className="sticky bottom-4 z-30 pt-4 border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-md p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl">
        <div className="text-xs text-slate-400 text-center sm:text-left">
          {selectedMotifs.length > 0 ? (
            <span className="text-amber-300 font-medium">
              선택된 모티브: <strong>{selectedMotifs[0].title}</strong>{' '}
              {selectedMotifs.length > 1 && `외 ${selectedMotifs.length - 1}개`}
            </span>
          ) : (
            <span className="text-rose-400">최소 1개의 창작 모티브를 선택해 주세요.</span>
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
            <span>이전: 영화 다시 선택</span>
          </button>

          {/* Action 2: Next step proceed command */}
          <button
            type="button"
            onClick={onNextStep}
            disabled={selectedMotifs.length === 0}
            className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-lg ${
              selectedMotifs.length > 0
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-amber-500/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
            }`}
          >
            <span>스토리 변형 및 생성 시작 →</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
