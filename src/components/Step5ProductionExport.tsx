/**
 * Step 5: Production Package Builder & Studio
 *
 * Implements Module 07 (Production Package Builder):
 * - Phase 5-1: Real Input Data Connection (Step 3 Story Authority & Step 4 Script)
 * - Phase 5-2: Complete Production Package Model
 * - Phase 5-3: 4 Core Bibles (Character, Location, Prop, Visual)
 * - Phase 5-4: Shot Breakdown Engine (Scene != Video Clip, atomic 2-8s shots)
 * - Phase 5-5: AI Image & Video Prompt Generator
 * - Phase 5-6: Continuity Engine & Error Diagnostics
 * - Phase 5-7: Production Readiness Audit (Honest 0-100 Score)
 * - Phase 5-8: Clean Cinematic Dark UI with interactive inspection tabs
 * - Phase 5-9: Stale Detection & Auto-sync with Step 3/4 contentHash
 *
 * Strict Rule 2.1: Exactly 2 primary process execution/navigation commands at bottom.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Download,
  ShieldCheck,
  Film,
  FileText,
  Check,
  Camera,
  Sun,
  Volume2,
  Clock,
  MessageSquareQuote,
  Layers,
  Package,
  MapPin,
  Users,
  Eye,
  RefreshCw,
  Play,
  Pause,
  AlertTriangle,
  Video,
  ChevronRight,
  Sliders
} from 'lucide-react';
import { Project, StoryOutput, ScriptProduction, ProductionPackage, ProductionShot } from '../types';
import { ProductionPackageService } from '../services/ProductionPackageService';
import { ProjectStorageService } from '../services/ProjectStorageService';
import { StoryGeneratorService } from '../services/StoryGeneratorService';
import { CausalEngine } from '../services/CausalEngine';

interface Step5Props {
  project: Project;
  story: StoryOutput;
  script: ScriptProduction | null;
  onNewStory: () => void;
  onOpenProjects: () => void;
  onPrevStep?: () => void;
  onNextStep?: () => void;
  onSavePackage?: (pkg: ProductionPackage) => void;
}

export const Step5ProductionExport: React.FC<Step5Props> = ({
  project,
  story,
  script,
  onNewStory,
  onOpenProjects,
  onPrevStep,
  onNextStep,
  onSavePackage
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'characters' | 'locations' | 'props' | 'visual' | 'shots' | 'audit'>('overview');
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [copiedShotPrompt, setCopiedShotPrompt] = useState<string | null>(null);

  // Storyboard Preview Player state
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [previewShotIdx, setPreviewShotIdx] = useState(0);

  // Generate or retrieve Production Package with automatic fallback to project/story
  const currentScript = useMemo(() => {
    if (script && script.scenes && script.scenes.length > 0) return script;
    if (project.currentScript && project.currentScript.scenes && project.currentScript.scenes.length > 0) {
      return project.currentScript;
    }
    if (story) {
      return StoryGeneratorService.generateScript(story, 'cinema');
    }
    return null;
  }, [script?.id, project.currentScript?.id, story?.id]);

  // Check if project already has a valid package for this exact story
  const existingPkg = useMemo(() => {
    if (
      project.productionPackage &&
      project.productionPackage.sourceStoryId === story.id &&
      project.productionPackage.shotList &&
      project.productionPackage.shotList.length > 0
    ) {
      return project.productionPackage;
    }
    return null;
  }, [project.productionPackage?.packageId, story.id]);

  const [productionPkg, setProductionPkg] = useState<ProductionPackage | null>(() => {
    if (existingPkg) return existingPkg;
    if (currentScript && story) {
      try {
        return ProductionPackageService.buildProductionPackage(project.id, story, currentScript);
      } catch (err) {
        console.error('Failed to build initial production package:', err);
        return null;
      }
    }
    return null;
  });

  // Track the last saved package ID using a ref to prevent ANY infinite loops
  const savedPackageIdRef = React.useRef<string | null>(
    project.productionPackage?.packageId || null
  );

  // Sync state if existingPkg changes from props
  useEffect(() => {
    if (existingPkg && (!productionPkg || productionPkg.packageId !== existingPkg.packageId)) {
      setProductionPkg(existingPkg);
      savedPackageIdRef.current = existingPkg.packageId;
    }
  }, [existingPkg?.packageId]);

  // If no package existed yet on mount, create it once and notify parent once
  useEffect(() => {
    if (!productionPkg && currentScript && story) {
      try {
        const fresh = ProductionPackageService.buildProductionPackage(project.id, story, currentScript);
        setProductionPkg(fresh);
        if (savedPackageIdRef.current !== fresh.packageId) {
          savedPackageIdRef.current = fresh.packageId;
          if (onSavePackage) onSavePackage(fresh);
        }
      } catch (err) {
        console.error('Failed to generate initial production package:', err);
      }
    } else if (productionPkg && savedPackageIdRef.current !== productionPkg.packageId) {
      savedPackageIdRef.current = productionPkg.packageId;
      if (onSavePackage) onSavePackage(productionPkg);
    }
  }, [productionPkg?.packageId, currentScript?.id, story?.id]);

  // Check if current package is stale compared to latest script/story contentHash
  const isStale = useMemo(() => {
    if (!productionPkg || !currentScript || !story) return false;
    const currentHash =
      currentScript.versionInfo?.contentHash ||
      currentScript.sourcePackage?.contentHash ||
      CausalEngine.computeStoryContentHash(story);
    return Boolean(
      productionPkg.sourceStoryId !== story.id ||
      (currentHash && productionPkg.sourceContentHash !== currentHash)
    );
  }, [productionPkg?.sourceContentHash, productionPkg?.sourceStoryId, currentScript?.versionInfo?.contentHash, story?.id]);

  const handleForceRegenerate = () => {
    if (!currentScript || !story) return;
    try {
      const freshPkg = ProductionPackageService.buildProductionPackage(project.id, story, currentScript);
      savedPackageIdRef.current = freshPkg.packageId;
      setProductionPkg(freshPkg);
      if (onSavePackage) onSavePackage(freshPkg);
    } catch (e) {
      console.error('Failed to force regenerate production package:', e);
    }
  };

  // Preview Mode Animation Loop
  useEffect(() => {
    let timer: any;
    if (isPlayingPreview && productionPkg && productionPkg.shotList.length > 0) {
      const currentShot = productionPkg.shotList[previewShotIdx];
      const durationMs = (currentShot?.duration || 3) * 1000;

      timer = setTimeout(() => {
        setPreviewShotIdx((prev) => (prev + 1) % productionPkg.shotList.length);
      }, durationMs);
    }
    return () => clearTimeout(timer);
  }, [isPlayingPreview, previewShotIdx, productionPkg]);

  // Export Handlers
  const handleCopyMarkdown = () => {
    if (!productionPkg) return;
    const md = ProjectStorageService.exportProductionPackageAsMarkdown(productionPkg, story);
    navigator.clipboard.writeText(md);
    setCopiedType('markdown');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDownloadMarkdown = () => {
    if (!productionPkg) return;
    const md = ProjectStorageService.exportProductionPackageAsMarkdown(productionPkg, story);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${story.title.replace(/\s+/g, '_')}_제작설계패키지.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    if (!productionPkg) return;
    const exportData = {
      project,
      story,
      script: currentScript,
      productionPackage: productionPkg
    };
    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moviestory_production_${productionPkg.packageId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyPromptText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedShotPrompt(id);
    setTimeout(() => setCopiedShotPrompt(null), 2000);
  };

  if (!productionPkg) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center max-w-lg mx-auto my-12 space-y-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <h3 className="text-base font-bold text-white">Step 5 Production Package를 구성 중입니다...</h3>
        <p className="text-xs text-slate-400">대본과 스토리를 바탕으로 4대 바이블과 샷 리스트를 준비하고 있습니다.</p>
        <button
          type="button"
          onClick={handleForceRegenerate}
          className="mt-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer"
        >
          패키지 즉시 생성 및 새로고침
        </button>
      </div>
    );
  }

  const readiness = productionPkg.readinessReport;
  const manifest = productionPkg.productionManifest;
  const currentPreviewShot = productionPkg.shotList[previewShotIdx] || productionPkg.shotList[0];

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      {/* Celebration & Production Master Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 text-emerald-400 border border-emerald-800 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>STEP 5 COMPLETE — Production Specification</span>
              </span>
              {isStale && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-950/70 text-amber-300 border border-amber-800 text-xs font-semibold">
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  <span>스토리 변경 감지됨 (재생성 권장)</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              [{story.title}] 제작 설계 패키지
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Step 3 서사 권위(Story Authority)와 Step 4 영상 대본을 AI 영상 생성 엔진에 전달 가능한
              <strong> 4대 바이블·{productionPkg.shotList.length}개 원자적 샷 리스트·연속성 검증 설계도</strong>로 완벽 변환했습니다.
            </p>
          </div>

          {/* Quick Regenerate & Package ID Tag */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleForceRegenerate}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span>패키지 새로고침</span>
            </button>
          </div>
        </div>

        {/* 5 Core Package Cards Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-6 relative z-10">
          <div
            onClick={() => setActiveTab('characters')}
            className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 hover:border-amber-500/50 cursor-pointer transition space-y-1 text-center"
          >
            <div className="flex items-center justify-center text-amber-400 gap-1.5 text-xs font-bold">
              <Users className="w-4 h-4" />
              <span>Characters</span>
            </div>
            <div className="text-xl font-extrabold text-white">{productionPkg.characterBible.length} Ready</div>
            <div className="text-[10px] text-slate-400">외형 & 의상 바이블</div>
          </div>

          <div
            onClick={() => setActiveTab('locations')}
            className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 hover:border-amber-500/50 cursor-pointer transition space-y-1 text-center"
          >
            <div className="flex items-center justify-center text-amber-400 gap-1.5 text-xs font-bold">
              <MapPin className="w-4 h-4" />
              <span>Locations</span>
            </div>
            <div className="text-xl font-extrabold text-white">{productionPkg.locationBible.length} Ready</div>
            <div className="text-[10px] text-slate-400">장소 & 조명 정체성</div>
          </div>

          <div
            onClick={() => setActiveTab('props')}
            className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 hover:border-amber-500/50 cursor-pointer transition space-y-1 text-center"
          >
            <div className="flex items-center justify-center text-amber-400 gap-1.5 text-xs font-bold">
              <Package className="w-4 h-4" />
              <span>Critical Props</span>
            </div>
            <div className="text-xl font-extrabold text-white">{productionPkg.propBible.length} Ready</div>
            <div className="text-[10px] text-slate-400">핵심 소품 상태 추적</div>
          </div>

          <div
            onClick={() => setActiveTab('visual')}
            className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 hover:border-amber-500/50 cursor-pointer transition space-y-1 text-center"
          >
            <div className="flex items-center justify-center text-amber-400 gap-1.5 text-xs font-bold">
              <Sliders className="w-4 h-4" />
              <span>Visual Bible</span>
            </div>
            <div className="text-xl font-extrabold text-white">{productionPkg.visualBible.aspectRatio}</div>
            <div className="text-[10px] text-slate-400 truncate">{productionPkg.visualBible.visualStyle.split(' ')[0]}</div>
          </div>

          <div
            onClick={() => setActiveTab('shots')}
            className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 hover:border-amber-500/50 cursor-pointer transition space-y-1 text-center col-span-2 sm:col-span-1"
          >
            <div className="flex items-center justify-center text-amber-400 gap-1.5 text-xs font-bold">
              <Film className="w-4 h-4" />
              <span>Shots</span>
            </div>
            <div className="text-xl font-extrabold text-white">{productionPkg.shotList.length} Ready</div>
            <div className="text-[10px] text-slate-400">총 {manifest.timeline.totalDuration}초 원자적 분해</div>
          </div>
        </div>

        {/* Readiness Meter Bar */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-950/90 border border-slate-800 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-extrabold text-base border border-emerald-500/30">
              {readiness.score}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">Production Readiness Score</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {readiness.readyForVideoGeneration ? 'READY FOR VIDEO GENERATION' : 'READY WITH WARNINGS'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                스토리 동기화 20점 · 인물/장소/소품/비주얼 40점 · 샷/프롬프트 30점 · 연속성 10점 만점 기준
              </p>
            </div>
          </div>

          {/* Quick Export Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              {copiedType === 'markdown' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
              <span>{copiedType === 'markdown' ? '복사됨!' : '전체 복사'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadMarkdown}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>마크다운(.md)</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadJson}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>패키지 JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none text-xs font-bold">
        {[
          { id: 'overview', label: '📊 전체 개요 & 6대 질문', icon: Eye },
          { id: 'characters', label: `🎭 인물 바이블 (${productionPkg.characterBible.length})`, icon: Users },
          { id: 'locations', label: `🏛 장소 바이블 (${productionPkg.locationBible.length})`, icon: MapPin },
          { id: 'props', label: `📦 핵심 소품 (${productionPkg.propBible.length})`, icon: Package },
          { id: 'visual', label: '🎨 비주얼 바이블', icon: Sliders },
          { id: 'shots', label: `🎬 샷 리스트 (${productionPkg.shotList.length})`, icon: Film },
          { id: 'audit', label: `🔍 연속성 & 진단 (${readiness.score}점)`, icon: ShieldCheck }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & 6 CORE QUESTIONS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Storyboard Motion Preview Player Simulation */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">무료 기반 스토리보드 모션 프리뷰 (Preview Simulator)</h3>
                  <p className="text-[11px] text-slate-400">고비용 AI 영상 렌더링 전, 각 샷의 시간·카메라 워크·행동 지문을 시뮬레이션합니다.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlayingPreview(!isPlayingPreview)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    isPlayingPreview
                      ? 'bg-rose-500 text-white'
                      : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                  }`}
                >
                  {isPlayingPreview ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlayingPreview ? '재생 중지' : '모션 시뮬레이션 재생'}</span>
                </button>
              </div>
            </div>

            {/* Simulated Frame */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 flex flex-col md:flex-row items-center gap-6">
              {/* Aspect Ratio Box */}
              <div
                className={`relative bg-slate-900 border border-amber-500/30 rounded-xl overflow-hidden flex flex-col items-center justify-center text-center p-4 shadow-inner shrink-0 ${
                  productionPkg.format === 'shorts' ? 'w-48 h-72' : 'w-72 h-44'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />
                <span className="relative z-10 text-[11px] font-mono text-amber-400 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                  {currentPreviewShot.shotId} ({currentPreviewShot.duration}초)
                </span>
                <span className="relative z-10 text-xs font-bold text-slate-200 mt-2 px-2">
                  {currentPreviewShot.camera.movement}
                </span>
                <span className="relative z-10 text-[10px] text-slate-400 mt-1">
                  [{currentPreviewShot.camera.shotSize}] {currentPreviewShot.camera.angle}
                </span>

                {/* Subtitle simulation */}
                {currentPreviewShot.dialogue && currentPreviewShot.dialogue[0] && (
                  <div className="absolute bottom-3 inset-x-2 z-10 bg-black/80 p-1.5 rounded text-[10px] text-amber-300 font-medium leading-tight">
                    "{currentPreviewShot.dialogue[0].text}"
                  </div>
                )}
              </div>

              {/* Shot Details info */}
              <div className="space-y-3 flex-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                    Shot {currentPreviewShot.order} of {productionPkg.shotList.length}
                  </span>
                  <span className="text-slate-400 font-mono">
                    타임코드: {currentPreviewShot.startTime}초 ~ {currentPreviewShot.endTime}초
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-white mb-1">{currentPreviewShot.narrativePurpose}</h4>
                  <p className="text-slate-300 leading-relaxed font-medium">{currentPreviewShot.visualAction}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-slate-400 font-semibold">인물 모션:</span>
                    <p className="text-slate-200">{currentPreviewShot.characterAction} ({currentPreviewShot.emotionalState})</p>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-slate-400 font-semibold">조명 & 사운드:</span>
                    <p className="text-slate-200">{currentPreviewShot.lighting.keyLight} | {currentPreviewShot.sound.musicMood}</p>
                  </div>
                </div>

                {/* Shot Navigation Slider */}
                <div className="flex items-center gap-2 pt-2">
                  {productionPkg.shotList.map((shot, sIdx) => (
                    <button
                      key={shot.shotId}
                      type="button"
                      onClick={() => setPreviewShotIdx(sIdx)}
                      className={`h-2 flex-1 rounded-full transition cursor-pointer ${
                        previewShotIdx === sIdx ? 'bg-amber-400' : 'bg-slate-800 hover:bg-slate-700'
                      }`}
                      title={`Shot ${shot.order}: ${shot.narrativePurpose}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 6 Essential Production Questions Audit */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Step 5 완료 기준 6대 질문 검증 (Production Complete Gate)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
                <div className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>1. 누가 나오는가?</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  <strong>Character Bible</strong>에 주인공 {productionPkg.characterBible[0]?.name}의 얼굴·체형·시그니처 의상 규격 완비.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
                <div className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>2. 어디에서 일어나는가?</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  <strong>Location Bible</strong>에 {productionPkg.locationBible.length}개 장소의 건축·조명 정체성 및 프롬프트 완비.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
                <div className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>3. 무엇을 사용하는가?</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  <strong>Prop Bible</strong>에 {productionPkg.propBible.map((p) => p.name).join(', ')}의 상태 변화 이력 완비.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
                <div className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>4. 어떤 모습인가?</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  <strong>Visual Bible</strong>에 {productionPkg.visualBible.aspectRatio} 비율, {productionPkg.visualBible.visualStyle} 미학 확립.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
                <div className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>5. 어떤 순서로 촬영하는가?</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  <strong>Shot List</strong>에 {productionPkg.shotList.length}개 샷(총 {manifest.timeline.totalDuration}초)의 카메라 워크 및 순서 완비.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
                <div className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>6. AI에게 무엇을 입력하는가?</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  모든 샷에 정밀 <strong>Image Prompt & Video Prompt</strong> 생성되어 원클릭 복사 준비 완료.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CHARACTER BIBLE */}
      {activeTab === 'characters' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span>Character Bible — 인물 외형 및 연속성 가이드</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                AI 영상 생성 시 장면마다 인물의 얼굴과 의상이 임의로 바뀌는 문제를 방지하기 위해 엄격한 외형 정체성을 고정합니다.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {productionPkg.characterBible.map((char) => (
                <div
                  key={char.characterId}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {char.role}
                      </span>
                      <h4 className="text-base font-bold text-white mt-1">
                        {char.name} ({char.ageRange})
                      </h4>
                      <p className="text-xs text-slate-400">직업: {char.occupation || '미상'}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => copyPromptText(char.visualIdentityPrompt, char.characterId)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 text-[11px] font-semibold border border-slate-800 flex items-center gap-1 cursor-pointer transition"
                    >
                      {copiedShotPrompt === char.characterId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedShotPrompt === char.characterId ? '복사됨!' : '인물 프롬프트'}</span>
                    </button>
                  </div>

                  {/* Appearance Breakdown */}
                  <div className="space-y-2 text-xs">
                    <div className="font-bold text-slate-200">고정 외형 특징:</div>
                    <ul className="space-y-1 text-slate-300 text-[11px] pl-3 list-disc">
                      <li><strong>얼굴/눈매:</strong> {char.appearance.face}, {char.appearance.eyes}</li>
                      <li><strong>헤어/체형:</strong> {char.appearance.hair}, {char.appearance.body}</li>
                      <li><strong>고유 특징:</strong> {char.appearance.distinctiveFeatures.join(', ')}</li>
                    </ul>
                  </div>

                  {/* Costume Specification */}
                  <div className="space-y-2 text-xs">
                    <div className="font-bold text-amber-400">시그니처 의상 (Signature Costume):</div>
                    <p className="text-slate-300 text-[11px] bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                      <strong>기본 의상:</strong> {char.costume.primary}
                      {char.costume.secondary && <span><br /><strong>보조 의상:</strong> {char.costume.secondary}</span>}
                    </p>
                  </div>

                  {/* Continuity Rules */}
                  <div className="space-y-2 text-xs">
                    <div className="font-bold text-emerald-400">연속성 절대 규칙 (Continuity Rules):</div>
                    <ul className="space-y-1 text-slate-400 text-[11px] pl-3 list-disc">
                      {char.continuityRules.map((r, rIdx) => (
                        <li key={rIdx}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LOCATION BIBLE */}
      {activeTab === 'locations' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>Location Bible — 장소별 조명 및 환경 가이드</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                촬영 장소의 기본 건축 양식, 조명 정체성, 고정 소품을 정의하여 샷 전환 시에도 일관된 공간감을 유지합니다.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {productionPkg.locationBible.map((loc) => (
                <div
                  key={loc.locationId}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-cyan-950 text-cyan-300 border border-cyan-800">
                        {loc.interiorExterior}
                      </span>
                      <h4 className="text-base font-bold text-white mt-1">{loc.name}</h4>
                      <p className="text-xs text-slate-400">{loc.narrativeFunction}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => copyPromptText(loc.locationPrompt, loc.locationId)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-400 text-[11px] font-semibold border border-slate-800 flex items-center gap-1 cursor-pointer transition"
                    >
                      {copiedShotPrompt === loc.locationId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedShotPrompt === loc.locationId ? '복사됨!' : '장소 프롬프트'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-slate-400 font-semibold">건축/환경:</span>
                      <p className="text-slate-200 mt-0.5">{loc.architecture}</p>
                    </div>
                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-slate-400 font-semibold">조명 정체성:</span>
                      <p className="text-slate-200 mt-0.5">{loc.lightingIdentity}</p>
                    </div>
                  </div>

                  <div className="text-xs space-y-1">
                    <span className="font-bold text-slate-300">고정 소품 (Permanent Props):</span>
                    <p className="text-slate-400 text-[11px]">{loc.permanentProps.join(', ')}</p>
                  </div>

                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300">
                    {loc.locationPrompt}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PROP BIBLE */}
      {activeTab === 'props' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-400" />
                <span>Critical Prop Bible — 핵심 소품 상태 변화 추적</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                서사의 핵심 사건에 직결되는 주요 소품이 샷 사이에서 갑자기 사라지거나 외형이 변형되지 않도록 상태 이력을 관리합니다.
              </p>
            </div>

            <div className="space-y-4">
              {productionPkg.propBible.map((prop) => (
                <div
                  key={prop.propId}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        중요도: {prop.narrativeImportance}
                      </span>
                      <h4 className="text-base font-bold text-white mt-1">{prop.name}</h4>
                      <p className="text-xs text-slate-400">{prop.description}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => copyPromptText(prop.visualPrompt, prop.propId)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 text-[11px] font-semibold border border-slate-800 flex items-center gap-1 cursor-pointer transition"
                    >
                      {copiedShotPrompt === prop.propId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedShotPrompt === prop.propId ? '복사됨!' : '소품 프롬프트'}</span>
                    </button>
                  </div>

                  {/* State Transition History across shots */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-300">상태 변화 이력 (State History across shots):</span>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      {prop.stateHistory.map((sh, sIdx) => (
                        <div key={sIdx} className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-[11px]">
                          <span className="font-bold text-amber-400">[Scene/Shot {sh.sceneOrShot}] {sh.state}</span>
                          <p className="text-slate-300 mt-1 leading-snug">{sh.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: VISUAL BIBLE */}
      {activeTab === 'visual' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>Visual Bible — 프로젝트 영상 미학 가이드</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                프로젝트 전체의 화각, 렌즈 감도, 조명 콘트라스트, 텍스처 스타일을 정의합니다.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-slate-400 font-semibold">Aspect Ratio (화각)</span>
                <p className="text-white text-sm font-bold">{productionPkg.visualBible.aspectRatio}</p>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-slate-400 font-semibold">Visual Style (영상 미학)</span>
                <p className="text-white text-sm font-bold">{productionPkg.visualBible.visualStyle}</p>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-slate-400 font-semibold">Color Mood (색감 룩)</span>
                <p className="text-white text-sm font-bold">{productionPkg.visualBible.colorMood}</p>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-slate-400 font-semibold">Lens Preference (렌즈 가이드)</span>
                <p className="text-white text-sm font-bold">{productionPkg.visualBible.lensPreference}</p>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-slate-400 font-semibold">Lighting Style (조명 가이드)</span>
                <p className="text-white text-sm font-bold">{productionPkg.visualBible.lightingStyle}</p>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-slate-400 font-semibold">Camera Style (카메라 무빙)</span>
                <p className="text-white text-sm font-bold">{productionPkg.visualBible.cameraStyle}</p>
              </div>
            </div>

            {/* Master Prompts */}
            <div className="space-y-4 pt-2">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-400">Master Global Visual Prompt</span>
                  <button
                    type="button"
                    onClick={() => copyPromptText(productionPkg.visualBible.globalVisualPrompt, 'master-prompt')}
                    className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300"
                  >
                    {copiedShotPrompt === 'master-prompt' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>복사</span>
                  </button>
                </div>
                <p className="text-xs text-slate-300 font-mono bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  {productionPkg.visualBible.globalVisualPrompt}
                </p>
              </div>

              {productionPkg.visualBible.negativePrompt && (
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <span className="font-bold text-rose-400 text-xs">Negative Prompt (방지 키워드)</span>
                  <p className="text-xs text-slate-400 font-mono bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                    {productionPkg.visualBible.negativePrompt}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SHOT LIST & PROMPTS */}
      {activeTab === 'shots' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Film className="w-4 h-4 text-amber-400" />
                  <span>Production Shot List (총 {productionPkg.shotList.length}개 원자적 샷)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  1 씬 = 1 비디오 클립이 아닙니다. 실제 AI 영상 생성 안정성(2~8초)에 맞춰 촬영 가능한 단위로 세분화했습니다.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {productionPkg.shotList.map((shot) => (
                <div
                  key={shot.shotId}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition shadow-lg"
                >
                  {/* Shot Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="px-3 py-1 rounded-lg text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {shot.shotId}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {shot.sceneId}
                      </span>
                      <h4 className="text-sm font-bold text-white">{shot.narrativePurpose}</h4>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="font-mono">{shot.startTime}s - {shot.endTime}s</span>
                      <span>•</span>
                      <span className="text-amber-400 font-bold">⏱ {shot.duration}초</span>
                      <span>•</span>
                      <span>{shot.camera.shotSize}</span>
                    </div>
                  </div>

                  {/* Actions & Directed notes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                      <span className="font-bold text-slate-200">🎬 시각적 행동 (Visual Action):</span>
                      <p className="text-slate-300 leading-relaxed">{shot.visualAction}</p>
                    </div>

                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                      <span className="font-bold text-amber-300">🎭 인물 모션 & 감정 (Character Motion):</span>
                      <p className="text-slate-200 leading-relaxed">{shot.characterAction} ({shot.emotionalState})</p>
                    </div>
                  </div>

                  {/* Dialogue if present in this shot */}
                  {shot.dialogue && shot.dialogue.length > 0 && (
                    <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs space-y-1">
                      <span className="font-bold text-amber-400 flex items-center gap-1.5">
                        <MessageSquareQuote className="w-3.5 h-3.5" />
                        <span>대사 (Dialogue):</span>
                      </span>
                      {shot.dialogue.map((d, dIdx) => (
                        <p key={dIdx} className="text-slate-100 font-medium pl-5">
                          <strong>{d.speaker}:</strong> "{d.text}"
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Dual AI Prompts: Image & Video Generation */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {/* Image Still Prompt */}
                    <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-amber-400 flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3" />
                          AI Image Still Prompt
                        </span>
                        <button
                          type="button"
                          onClick={() => copyPromptText(shot.imagePrompt, `${shot.shotId}-img`)}
                          className="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                        >
                          {copiedShotPrompt === `${shot.shotId}-img` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedShotPrompt === `${shot.shotId}-img` ? '복사됨!' : '이미지 프롬프트'}</span>
                        </button>
                      </div>
                      <p className="text-xs text-slate-300 font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed">
                        {shot.imagePrompt}
                      </p>
                    </div>

                    {/* Video Motion Prompt */}
                    <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                          <Video className="w-3 h-3" />
                          AI Video Motion Prompt
                        </span>
                        <button
                          type="button"
                          onClick={() => copyPromptText(shot.videoPrompt, `${shot.shotId}-vid`)}
                          className="px-2 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                        >
                          {copiedShotPrompt === `${shot.shotId}-vid` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedShotPrompt === `${shot.shotId}-vid` ? '복사됨!' : '비디오 프롬프트'}</span>
                        </button>
                      </div>
                      <p className="text-xs text-slate-300 font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed">
                        {shot.videoPrompt}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: AUDIT & CONTINUITY */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Production Readiness Audit & Continuity Diagnostics</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                데이터의 실제 준비 상태에 따라 동적으로 산출된 검증 점수 및 연속성 검사 결과입니다.
              </p>
            </div>

            {/* Score Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400">Story Synchronization (20)</span>
                <p className="text-emerald-400 font-bold mt-1">{readiness.storySync ? '20 / 20 PASS' : '0 FAIL'}</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400">Character Coverage (10)</span>
                <p className="text-emerald-400 font-bold mt-1">{readiness.characterConsistency ? '10 / 10 PASS' : '0 FAIL'}</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400">Location Coverage (10)</span>
                <p className="text-emerald-400 font-bold mt-1">{readiness.locationConsistency ? '10 / 10 PASS' : '0 FAIL'}</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400">Prop Continuity (10)</span>
                <p className="text-emerald-400 font-bold mt-1">{readiness.propContinuity ? '10 / 10 PASS' : '0 FAIL'}</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400">Visual Definition (10)</span>
                <p className="text-emerald-400 font-bold mt-1">{readiness.visualStyleDefined ? '10 / 10 PASS' : '0 FAIL'}</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400">Shot Coverage (15)</span>
                <p className="text-emerald-400 font-bold mt-1">{readiness.shotCoverage ? '15 / 15 PASS' : '0 FAIL'}</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400">Prompt Completeness (15)</span>
                <p className="text-emerald-400 font-bold mt-1">{readiness.promptCompleteness ? '15 / 15 PASS' : '0 FAIL'}</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400">Continuity Integrity (10)</span>
                <p className="text-emerald-400 font-bold mt-1">{readiness.continuity ? '10 / 10 PASS' : 'WARNINGS FOUND'}</p>
              </div>
            </div>

            {/* Warnings Log if any */}
            {readiness.warnings.length > 0 ? (
              <div className="p-4 bg-amber-950/40 border border-amber-800/80 rounded-2xl text-xs space-y-1">
                <span className="font-bold text-amber-300">연속성 경고 로그:</span>
                <ul className="list-disc pl-4 text-amber-200/90 space-y-1 pt-1 text-[11px]">
                  {readiness.warnings.map((w, wIdx) => (
                    <li key={wIdx}>{w}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="p-4 bg-emerald-950/40 border border-emerald-800/80 rounded-2xl text-xs flex items-center gap-2 text-emerald-300">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>연속성 오류가 전혀 발견되지 않았습니다. 모든 샷이 논리적이고 물리적인 인과를 유지합니다.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Primary Action Commands Bar (STRICTLY MAXIMUM 2 BUTTONS as per Rule 2.1) */}
      <div className="sticky bottom-4 z-30 pt-4 border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-md p-4 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl">
        <div className="text-xs text-slate-400 text-center sm:text-left">
          <span>제작 설계 패키지 완비 — Production Readiness {readiness.score}%</span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Action 1: Back command */}
          <button
            type="button"
            onClick={onPrevStep}
            className="flex-1 sm:flex-none px-5 py-3 rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>이전: 대본 수정</span>
          </button>

          {/* Action 2: Next step proceed command (Proceed to Step 6) */}
          <button
            type="button"
            onClick={() => {
              const pkgToSave = productionPkg;
              if (pkgToSave && onSavePackage) {
                onSavePackage(pkgToSave);
              }
              if (onNextStep) {
                onNextStep();
              } else if (onNewStory) {
                onNewStory();
              }
            }}
            className="flex-1 sm:flex-none px-6 py-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition shadow-lg bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white cursor-pointer shadow-rose-950/40"
          >
            <span>다음: AI 자산 생성</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
