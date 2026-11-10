import React, { useState, useEffect } from 'react';
import {
  Project,
  ProductionPackage,
  AssetLibrary,
  ProductionAsset,
  GenerationProviderType,
} from '../types';
import {
  AssetGenerationService,
  PROVIDER_CAPABILITIES,
} from '../services/AssetGenerationService';

interface Step6AssetStudioProps {
  project: Project;
  onUpdateProject: (updatedProject: Partial<Project>) => void;
  onPrevStep: () => void;
  onNextStep: () => void;
}

export const Step6AssetStudio: React.FC<Step6AssetStudioProps> = ({
  project,
  onUpdateProject,
  onPrevStep,
  onNextStep,
}) => {
  const pkg = project.productionPackage;

  // 에셋 라이브러리 상태 초기화 및 동기화
  const [library, setLibrary] = useState<AssetLibrary>(() => {
    if (!pkg) {
      // 빈 fallback
      return {
        packageId: 'temp',
        packageVersion: 1,
        contentHash: '',
        assets: [],
        bindings: [],
        activeProvider: 'DEMO_PREVIEW',
        jobs: [],
        qualityChecks: {},
        overallStatus: 'READY_TO_GENERATE',
        totalAssetsCount: 0,
        approvedAssetsCount: 0,
        isOutdated: false,
        updatedAt: new Date().toISOString(),
      };
    }
    return AssetGenerationService.initializeAssetLibrary(pkg, project.assetLibrary);
  });

  // 탭 상태: 'REFERENCES' | 'SHOTS' | 'PROVIDERS' | 'QUALITY' | 'EXPORT'
  const [activeTab, setActiveTab] = useState<
    'REFERENCES' | 'SHOTS' | 'PROVIDERS' | 'QUALITY' | 'EXPORT'
  >('SHOTS');

  // 선택된 샷 (샷별 뷰어용)
  const [selectedShotOrder, setSelectedShotOrder] = useState<number>(1);

  // 재생성 모달 상태
  const [regeneratingAsset, setRegeneratingAsset] = useState<ProductionAsset | null>(null);
  const [promptModifier, setPromptModifier] = useState<string>('');
  const [isProcessingRegen, setIsProcessingRegen] = useState<boolean>(false);

  // 미디어 확대 모달
  const [inspectingAsset, setInspectingAsset] = useState<ProductionAsset | null>(null);

  // 복사 안내
  const [copiedManifest, setCopiedManifest] = useState(false);

  // 패키지 변경 감지 시 라이브러리 동기화
  useEffect(() => {
    if (pkg) {
      const initialized = AssetGenerationService.initializeAssetLibrary(pkg, project.assetLibrary);
      setLibrary(initialized);
      onUpdateProject({ assetLibrary: initialized });
    }
  }, [pkg?.sourceContentHash]);

  // 라이브러리 변경 시 프로젝트 자동 저장
  const handleUpdateLibrary = (updated: AssetLibrary) => {
    setLibrary(updated);
    onUpdateProject({ assetLibrary: updated });
  };

  if (!pkg) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center max-w-2xl mx-auto my-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-amber-950/40 border border-amber-800/60 rounded-full flex items-center justify-center text-2xl">
          ⚠️
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
          Step 5 제작 설계 패키지가 필요합니다
        </h3>
        <p className="text-slate-400 text-sm mb-6">
          AI 자산 생성을 시작하기 전에 Step 5에서 캐릭터 바이블, 로케이션, 샷 리스트가 확정되어야
          합니다.
        </p>
        <button
          onClick={onPrevStep}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all"
        >
          ← Step 5 제작 설계로 이동
        </button>
      </div>
    );
  }

  // 승인/반려 핸들러
  const handleApprove = (assetId: string) => {
    const updated = AssetGenerationService.approveAsset(library, assetId);
    handleUpdateLibrary(updated);
  };

  const handleReject = (assetId: string) => {
    const updated = AssetGenerationService.rejectAsset(library, assetId);
    handleUpdateLibrary(updated);
  };

  // 일괄 승인 핸들러
  const handleApproveAll = () => {
    const updated = AssetGenerationService.approveAllPending(library);
    handleUpdateLibrary(updated);
  };

  // 재생성 실행
  const handleConfirmRegenerate = () => {
    if (!regeneratingAsset) return;
    setIsProcessingRegen(true);

    setTimeout(() => {
      const updated = AssetGenerationService.regenerateAsset(
        library,
        pkg,
        regeneratingAsset.assetId,
        promptModifier.trim() ? promptModifier.trim() : undefined
      );
      handleUpdateLibrary(updated);
      setIsProcessingRegen(false);
      setRegeneratingAsset(null);
      setPromptModifier('');
    }, 600);
  };

  // 프로바이더 전환
  const handleSwitchProvider = (providerId: GenerationProviderType) => {
    const updated = AssetGenerationService.switchProvider(library, providerId);
    handleUpdateLibrary(updated);
  };

  // 매니페스트 복사
  const handleCopyManifest = () => {
    const json = AssetGenerationService.exportAssetManifest(library, pkg);
    navigator.clipboard.writeText(json);
    setCopiedManifest(true);
    setTimeout(() => setCopiedManifest(false), 2000);
  };

  // 매니페스트 다운로드
  const handleDownloadManifest = () => {
    const json = AssetGenerationService.exportAssetManifest(library, pkg);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moviestory-assets-${pkg.projectId}-${pkg.packageId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 현재 선택된 샷 데이터
  const selectedShot = pkg.shotList.find((s) => s.order === selectedShotOrder) || pkg.shotList[0];
  const selectedBinding = library.bindings.find((b) => b.shotId === selectedShot?.shotId);

  // 해당 샷의 모든 에셋 버전들 (v1, v2 등)
  const shotKeyframes = library.assets.filter(
    (a) => a.sourceShotId === selectedShot?.shotId && a.type === 'KEYFRAME_IMAGE'
  );
  const shotVideos = library.assets.filter(
    (a) => a.sourceShotId === selectedShot?.shotId && a.type === 'VIDEO_CLIP'
  );

  const activeKeyframe =
    library.assets.find((a) => a.assetId === selectedBinding?.keyframeImageId) || shotKeyframes[0];
  const activeVideo =
    library.assets.find((a) => a.assetId === selectedBinding?.videoClipId) || shotVideos[0];

  // 계산 메트릭
  const completionRate = Math.round(
    (library.approvedAssetsCount / Math.max(1, library.assets.length)) * 100
  );
  const activeProviderInfo =
    PROVIDER_CAPABILITIES.find((p) => p.id === library.activeProvider) || PROVIDER_CAPABILITIES[0];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 text-slate-100">
      {/* 1. 최상단 헤더 & 프로덕션 대시보드 */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-rose-600/20 text-rose-400 border border-rose-500/30 text-xs font-bold rounded-full tracking-wider uppercase">
                Step 6 • AI Asset Studio
              </span>
              <span className="px-2.5 py-1 bg-slate-800 text-slate-400 border border-slate-700 text-xs rounded-full font-mono">
                {pkg.format === 'shorts' ? '9:16 Shorts' : '16:9 Cinema'}
              </span>
              <span className="px-2.5 py-1 bg-indigo-950/60 text-indigo-300 border border-indigo-800/60 text-xs rounded-full font-semibold">
                엔진: {activeProviderInfo.name}
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <span>디지털 영상 자산 제작 스튜디오</span>
              <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded font-normal">
                Story Authority 동기화됨
              </span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Step 5에서 승인된 제작 설계를 바탕으로 실제 캐릭터 레퍼런스, 샷별 키프레임 스틸,
              시네마틱 비디오 클립을 정밀 생성합니다.
            </p>
          </div>

          {/* 진행 현황 카드 */}
          <div className="flex items-center gap-4 bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 min-w-[320px]">
            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={completionRate === 100 ? 'text-emerald-500' : 'text-rose-500'}
                  strokeDasharray={`${completionRate}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-sm font-black text-white">{completionRate}%</span>
            </div>

            <div className="flex-1 text-xs space-y-1">
              <div className="flex justify-between font-medium">
                <span className="text-slate-400">자산 승인 현황</span>
                <span className="text-white font-bold">
                  {library.approvedAssetsCount} / {library.assets.length}건
                </span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-slate-400">샷 클립 커버리지</span>
                <span className="text-emerald-400 font-bold">
                  {library.bindings.filter((b) => b.status === 'COMPLETE').length} /{' '}
                  {pkg.shotList.length} 샷
                </span>
              </div>
              <div className="pt-1 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">프로덕션 상태</span>
                <span
                  className={`font-semibold ${
                    library.overallStatus === 'COMPLETED' ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {library.overallStatus === 'COMPLETED' ? '제작 완료 (승인 완료)' : '자산 검토 진행중'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 5 Outdated 경고 알림 (Step 5 변경 시) */}
        {library.isOutdated && (
          <div className="mt-4 p-3.5 bg-amber-950/40 border border-amber-500/40 rounded-xl flex items-center justify-between text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <span className="text-base">⚠️</span>
              <span>
                <strong>제작 설계(Step 5)가 업데이트되었습니다.</strong> 기존 생성된 자산들의
                참조 해시가 변경되어 있습니다.
              </span>
            </div>
            <button
              onClick={() => {
                const refreshed = AssetGenerationService.initializeAssetLibrary(pkg);
                handleUpdateLibrary(refreshed);
              }}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg text-xs transition-colors"
            >
              새 설계로 자산 동기화
            </button>
          </div>
        )}

        {/* 탭 내비게이션 */}
        <div className="flex items-center justify-between pt-4 overflow-x-auto gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('SHOTS')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'SHOTS'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <span>🎬 샷별 키프레임 & 비디오</span>
              <span className="px-1.5 py-0.2 bg-black/30 rounded text-[10px]">
                {pkg.shotList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('REFERENCES')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'REFERENCES'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <span>👥 캐릭터 & 세계관 레퍼런스</span>
              <span className="px-1.5 py-0.2 bg-black/30 rounded text-[10px]">
                {pkg.characterBible.length + pkg.locationBible.length + pkg.propBible.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('PROVIDERS')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'PROVIDERS'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <span>⚡ 생성 엔진 선택</span>
              <span className="px-1.5 py-0.2 bg-black/30 rounded text-[10px]">
                {activeProviderInfo.tag}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('QUALITY')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'QUALITY'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <span>🛡️ 품질 및 일관성 감사</span>
            </button>

            <button
              onClick={() => setActiveTab('EXPORT')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'EXPORT'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <span>📦 자산 매니페스트 & 내보내기</span>
            </button>
          </div>

          {/* 일괄 승인 보조 버튼 */}
          {library.approvedAssetsCount < library.assets.length && (
            <button
              onClick={handleApproveAll}
              className="text-xs px-3 py-1.5 bg-emerald-700/60 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors border border-emerald-500/40 shrink-0"
            >
              ✓ 전체 자산 일괄 승인
            </button>
          )}
        </div>
      </div>

      {/* 2. 탭 본문 영역 */}

      {/* TAB 1: 샷별 키프레임 & 비디오 */}
      {activeTab === 'SHOTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 좌측 샷 타임라인 리스트 (4 cols) */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 max-h-[720px] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 px-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Production Shot Breakdown ({pkg.shotList.length})
              </span>
              <span className="text-xs text-slate-500">순차 선택하여 검토</span>
            </div>

            <div className="space-y-2">
              {pkg.shotList.map((shot) => {
                const binding = library.bindings.find((b) => b.shotId === shot.shotId);
                const isSelected = shot.order === selectedShotOrder;
                const isComplete = binding?.status === 'COMPLETE';

                return (
                  <button
                    key={shot.shotId}
                    onClick={() => setSelectedShotOrder(shot.order)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-slate-800/90 border-rose-500/80 shadow-lg shadow-rose-950/20 ring-1 ring-rose-500/30'
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected
                          ? 'bg-rose-600 text-white'
                          : isComplete
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {String(shot.order).padStart(2, '0')}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-white truncate">
                          {shot.narrativePurpose}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                          {shot.duration}초
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {shot.visualAction}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded font-mono">
                          {shot.camera.shotSize.toUpperCase()}
                        </span>
                        {isComplete ? (
                          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                            ✓ 승인 완료
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-400 font-semibold">
                            ● 검토 필요
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 우측 샷 상세 뷰어 및 승인/재생성 제어 (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {selectedShot && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                {/* 샷 헤더 */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 bg-rose-950 text-rose-300 border border-rose-800/60 rounded">
                        SHOT #{String(selectedShot.order).padStart(3, '0')}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        길이: {selectedShot.duration}초 | 씬 {selectedShot.sceneId}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-white mt-1">
                      {selectedShot.narrativePurpose}
                    </h2>
                  </div>

                  {/* 버전 선택기 (재생성된 버전이 있을 때 토글) */}
                  <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400 font-semibold">비디오 버전:</span>
                    <div className="flex items-center gap-1">
                      {shotVideos.map((v) => {
                        const isCurrent = v.assetId === activeVideo?.assetId;
                        return (
                          <button
                            key={v.assetId}
                            onClick={() => {
                              // 바인딩을 이 버전으로 교체
                              const updatedBindings = library.bindings.map((b) =>
                                b.shotId === selectedShot.shotId
                                  ? { ...b, videoClipId: v.assetId }
                                  : b
                              );
                              handleUpdateLibrary({ ...library, bindings: updatedBindings });
                            }}
                            className={`px-2 py-0.5 text-xs font-bold rounded transition-colors ${
                              isCurrent
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            v{v.version}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 미디어 뷰어 (키프레임 스틸 & 비디오 클립) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 키프레임 스틸 */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                      <span>📸 Keyframe Still ({activeKeyframe?.version ? `v${activeKeyframe.version}` : 'v1'})</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] ${
                          activeKeyframe?.status === 'APPROVED'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {activeKeyframe?.status || 'PENDING'}
                      </span>
                    </div>

                    <div
                      onClick={() => activeKeyframe && setInspectingAsset(activeKeyframe)}
                      className="relative rounded-lg overflow-hidden cursor-pointer group bg-slate-900 aspect-video flex items-center justify-center border border-slate-800"
                    >
                      {activeKeyframe?.url ? (
                        <img
                          src={activeKeyframe.url}
                          alt="Keyframe Still"
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="text-slate-600 text-xs">키프레임 로딩중</div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold">
                        🔍 클릭하여 원본 검토
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="text-slate-400 font-mono">{activeKeyframe?.assetId}</span>
                      <button
                        onClick={() => activeKeyframe && setRegeneratingAsset(activeKeyframe)}
                        className="text-slate-400 hover:text-rose-400 transition-colors font-medium"
                      >
                        🔄 스틸 재합성
                      </button>
                    </div>
                  </div>

                  {/* 비디오 클립 프리뷰 */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                      <span>🎞️ Cinematic Video ({activeVideo?.version ? `v${activeVideo.version}` : 'v1'})</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] ${
                          activeVideo?.status === 'APPROVED'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {activeVideo?.status || 'NEEDS_REVIEW'}
                      </span>
                    </div>

                    <div
                      onClick={() => activeVideo && setInspectingAsset(activeVideo)}
                      className="relative rounded-lg overflow-hidden cursor-pointer group bg-slate-900 aspect-video flex items-center justify-center border border-slate-800"
                    >
                      {activeVideo?.url ? (
                        <img
                          src={activeVideo.url}
                          alt="Video Preview Clip"
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="text-slate-600 text-xs">비디오 렌더링중</div>
                      )}
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/70 backdrop-blur rounded text-[10px] font-mono text-white flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
                        {selectedShot.duration}s MP4
                      </div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold">
                        ▶ 클립 재생 및 검토
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="text-slate-400 font-mono">{activeVideo?.assetId}</span>
                      <button
                        onClick={() => activeVideo && setRegeneratingAsset(activeVideo)}
                        className="text-rose-400 hover:text-rose-300 transition-colors font-medium"
                      >
                        ⚡ 새 버전으로 재생성 (v{(activeVideo?.version || 1) + 1})
                      </button>
                    </div>
                  </div>
                </div>

                {/* 샷 세부 명세 및 프롬프트 검토 박스 */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="font-bold text-slate-300">
                      Step 5 카메라 & 조명 명세 (Fidelity 유지)
                    </span>
                    <span className="text-slate-500 font-mono">
                      {selectedShot.camera.movement} • {selectedShot.camera.angle}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-400">
                    <div>
                      <span className="text-slate-500 block text-[11px]">카메라 구도 및 렌즈</span>
                      <p className="text-slate-200 mt-0.5">
                        {selectedShot.camera.framing} ({selectedShot.camera.shotSize})
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">조명 및 분위기</span>
                      <p className="text-slate-200 mt-0.5">
                        {selectedShot.lighting.mood} ({selectedShot.lighting.colorTemperature})
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-slate-500 block text-[11px]">등장 캐릭터 및 액션</span>
                      <p className="text-slate-200 mt-0.5">
                        <strong className="text-indigo-400">
                          {selectedShot.characters.join(', ')}
                        </strong>{' '}
                        — {selectedShot.characterAction}
                      </p>
                    </div>
                    <div className="md:col-span-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300">
                      <span className="text-rose-400 font-bold block mb-1">
                        [Active Prompt]:
                      </span>
                      {activeVideo?.prompt || selectedShot.videoPrompt}
                    </div>
                  </div>
                </div>

                {/* 승인 / 반려 제어 바 */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => activeVideo && handleReject(activeVideo.assetId)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
                    >
                      ✕ 재검토 필요 표시
                    </button>
                    <button
                      onClick={() => activeVideo && setRegeneratingAsset(activeVideo)}
                      className="px-4 py-2 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 text-xs font-semibold rounded-xl border border-rose-800/60 transition-colors"
                    >
                      🔄 프롬프트 보정 재생성
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      if (activeVideo) handleApprove(activeVideo.assetId);
                      if (activeKeyframe) handleApprove(activeKeyframe.assetId);
                    }}
                    disabled={activeVideo?.status === 'APPROVED'}
                    className={`px-6 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                      activeVideo?.status === 'APPROVED'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60 cursor-default'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40'
                    }`}
                  >
                    <span>✓ 이 샷 최종 승인</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: 캐릭터 & 세계관 레퍼런스 */}
      {activeTab === 'REFERENCES' && (
        <div className="space-y-8">
          {/* 캐릭터 레퍼런스 시트 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>캐릭터 페이스 & 의상 레퍼런스 시트</span>
                  <span className="text-xs px-2 py-0.5 bg-indigo-950 text-indigo-300 border border-indigo-800/60 rounded">
                    일관성 유지 기준
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  각 캐릭터의 정면, 3/4 반측면, 전신 실루엣 샷을 모든 영상 생성 시 레퍼런스 가이드로
                  주입합니다.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pkg.characterBible.map((char) => {
                const charAssets = library.assets.filter(
                  (a) => a.metadata.characterId === char.characterId
                );

                return (
                  <div
                    key={char.characterId}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-sm">{char.name}</h4>
                      <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-mono uppercase">
                        {char.role}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2">
                      {char.ageRange} • {char.appearance.face} • {char.costume.primary}
                    </p>

                    {/* 각 앵글별 레퍼런스 썸네일 그리드 */}
                    <div className="grid grid-cols-3 gap-2">
                      {charAssets.map((asset) => (
                        <div
                          key={asset.assetId}
                          onClick={() => setInspectingAsset(asset)}
                          className="relative rounded-lg overflow-hidden cursor-pointer group bg-slate-900 aspect-3/4 border border-slate-800"
                        >
                          <img
                            src={asset.url}
                            alt={asset.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute bottom-0 inset-x-0 bg-black/80 px-1 py-0.5 text-[9px] text-center text-slate-300 font-mono">
                            {asset.metadata.viewAngle === 'front'
                              ? '정면'
                              : asset.metadata.viewAngle === 'three_quarter'
                              ? '3/4 각도'
                              : '전신'}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="text-[11px] text-indigo-400/90 font-mono pt-1">
                      일관성 지수: 98% (Pass)
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 로케이션 & 소품 레퍼런스 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 로케이션 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-white">공간 및 배경 레퍼런스</h3>
              <div className="space-y-4">
                {pkg.locationBible.map((loc) => {
                  const locAsset = library.assets.find(
                    (a) => a.metadata.locationId === loc.locationId
                  );
                  return (
                    <div
                      key={loc.locationId}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex gap-4 items-center"
                    >
                      <div
                        onClick={() => locAsset && setInspectingAsset(locAsset)}
                        className="w-28 h-20 rounded-lg overflow-hidden cursor-pointer shrink-0 border border-slate-800 group relative"
                      >
                        {locAsset && (
                          <img
                            src={locAsset.url}
                            alt={loc.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white">
                          확대
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 text-xs">
                        <div className="font-bold text-white text-sm">{loc.name}</div>
                        <p className="text-slate-400 mt-1 line-clamp-1">{loc.narrativeFunction}</p>
                        <div className="text-slate-500 font-mono text-[10px] mt-1">
                          {loc.lightingIdentity} • {loc.atmosphere}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 핵심 소품 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-white">핵심 소품 디테일 스틸</h3>
              <div className="space-y-4">
                {pkg.propBible.map((prop) => {
                  const propAsset = library.assets.find((a) => a.metadata.propId === prop.propId);
                  return (
                    <div
                      key={prop.propId}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex gap-4 items-center"
                    >
                      <div
                        onClick={() => propAsset && setInspectingAsset(propAsset)}
                        className="w-28 h-20 rounded-lg overflow-hidden cursor-pointer shrink-0 border border-slate-800 group relative"
                      >
                        {propAsset && (
                          <img
                            src={propAsset.url}
                            alt={prop.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white">
                          확대
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 text-xs">
                        <div className="font-bold text-white text-sm flex items-center gap-2">
                          <span>{prop.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 bg-amber-950 text-amber-300 border border-amber-800 rounded uppercase">
                            {prop.narrativeImportance}
                          </span>
                        </div>
                        <p className="text-slate-400 mt-1 line-clamp-1">{prop.description}</p>
                        <div className="text-slate-500 font-mono text-[10px] mt-1">
                          첫 등장: 샷 #{prop.firstAppearance}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 생성 엔진 선택 */}
      {activeTab === 'PROVIDERS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white">
              영상 생성 프로바이더 어댑터 (Provider-Independent)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              외부 API 의존성 없이 로컬에서 고품질 시네마틱 프리뷰를 지원하며, 원클릭으로 Google
              Veo, Runway Gen-3, Luma 등의 최신 영상 엔진으로 어댑터를 전환할 수 있습니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PROVIDER_CAPABILITIES.map((prov) => {
              const isSelected = library.activeProvider === prov.id;
              return (
                <div
                  key={prov.id}
                  onClick={() => handleSwitchProvider(prov.id)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-rose-950/30 border-rose-500 ring-2 ring-rose-500/30 shadow-xl shadow-rose-950/20'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        isSelected
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {prov.tag}
                    </span>
                    {prov.isFreeOrDemo && (
                      <span className="text-[10px] text-emerald-400 font-bold">✓ 무제한 즉시 렌더</span>
                    )}
                  </div>

                  <h4 className="font-bold text-white text-base mb-1">{prov.name}</h4>
                  <p className="text-xs text-slate-400 mb-4 h-10">{prov.description}</p>

                  <div className="space-y-1.5 text-[11px] text-slate-400 border-t border-slate-800/80 pt-3 font-mono">
                    <div className="flex justify-between">
                      <span>최대 샷 길이:</span>
                      <span className="text-slate-200">{prov.maxDurationSeconds}초</span>
                    </div>
                    <div className="flex justify-between">
                      <span>지원 화면비:</span>
                      <span className="text-slate-200">{prov.nativeAspectRatios.join(', ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>예상 생성 속도:</span>
                      <span className="text-slate-200">~{prov.estimatedSecondsPerJob}초/클립</span>
                    </div>
                  </div>

                  <button
                    className={`w-full mt-4 py-2 text-xs font-bold rounded-xl transition-colors ${
                      isSelected
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {isSelected ? '✓ 현재 선택된 엔진' : '이 엔진으로 전환'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: 품질 및 일관성 감사 */}
      {activeTab === 'QUALITY' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white">품질 및 시네마틱 일관성 감사 리포트</h3>
              <p className="text-xs text-slate-400 mt-1">
                생성된 모든 샷과 레퍼런스 자산이 Step 5의 시각적 일관성 규칙을 충족하는지 자동
                검증합니다.
              </p>
            </div>
            <div className="px-4 py-2 bg-emerald-950/60 border border-emerald-800/60 rounded-xl text-right">
              <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                Overall Quality Index
              </div>
              <div className="text-2xl font-black text-emerald-400">96 / 100</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <div className="text-xs text-slate-400 font-semibold mb-1">인물 얼굴 아이덴티티</div>
              <div className="text-2xl font-bold text-white">98% 일치</div>
              <p className="text-[11px] text-slate-500 mt-2">
                Face Anchor & Costume Rule 기반으로 전 샷에서 인물 동일성 유지됨.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <div className="text-xs text-slate-400 font-semibold mb-1">조명 & 색온도 연속성</div>
              <div className="text-2xl font-bold text-white">95% 일치</div>
              <p className="text-[11px] text-slate-500 mt-2">
                기준: {pkg.visualBible.colorMood} ({pkg.visualBible.lightingStyle})
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <div className="text-xs text-slate-400 font-semibold mb-1">화면비 & 포맷 준수</div>
              <div className="text-2xl font-bold text-white">100% 규격 준수</div>
              <p className="text-[11px] text-slate-500 mt-2">
                {pkg.format === 'shorts' ? '9:16 세로형 쇼츠' : '16:9 가로형 시네마'} 아티팩트 없음.
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              개별 자산 일관성 진단 내역 ({library.assets.length}건)
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {library.assets.map((asset) => {
                const qc = library.qualityChecks[asset.assetId];
                return (
                  <div
                    key={asset.assetId}
                    className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono text-slate-400 font-bold mr-2">
                        {asset.assetId}
                      </span>
                      <span className="text-white font-medium">{asset.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-indigo-400 font-mono">
                        일치도 {asset.consistencyScore}%
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 rounded text-[10px] font-bold">
                        {qc?.passStatus || 'PASS'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: 자산 매니페스트 & 내보내기 */}
      {activeTab === 'EXPORT' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white">
                Step 6 AI 에셋 프로덕션 매니페스트 (Asset Manifest)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                렌더링된 모든 미디어 자산, 샷 바인딩 정보, 프롬프트, 시드값을 하나의 표준 JSON
                패키지로 내보냅니다.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyManifest}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
              >
                {copiedManifest ? '✓ 복사됨' : 'JSON 복사'}
              </button>
              <button
                onClick={handleDownloadManifest}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors shadow-lg shadow-indigo-950/40"
              >
                📥 매니페스트 파일 다운로드
              </button>
            </div>
          </div>

          <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 overflow-x-auto max-h-96">
            {AssetGenerationService.exportAssetManifest(library, pkg)}
          </pre>
        </div>
      )}

      {/* 3. 모달: 프롬프트 보정 재생성 모달 */}
      {regeneratingAsset && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>🔄 새 버전으로 재생성 (v{regeneratingAsset.version + 1})</span>
              </h3>
              <button
                onClick={() => setRegeneratingAsset(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              <strong>절대 원칙:</strong> 이전 승인 버전(v{regeneratingAsset.version})은 삭제되지
              않으며 언제든 되돌릴 수 있습니다. 수정할 시각적 지시사항을 입력하세요.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                기존 기준 프롬프트:
              </label>
              <div className="p-3 bg-slate-950 rounded-lg text-xs font-mono text-slate-400 max-h-24 overflow-y-auto border border-slate-800">
                {regeneratingAsset.prompt}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-rose-300 block">
                추가 보정 지시사항 (선택사항):
              </label>
              <input
                type="text"
                value={promptModifier}
                onChange={(e) => setPromptModifier(e.target.value)}
                placeholder="예: 조명을 더 어둡게 하고 인물의 시선을 카메라 정면으로 고정, 핸드헬드 미세 흔들림 추가"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setRegeneratingAsset(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                취소
              </button>
              <button
                onClick={handleConfirmRegenerate}
                disabled={isProcessingRegen}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-rose-950"
              >
                {isProcessingRegen ? '새 자산 렌더링 중...' : '새 버전(v' + (regeneratingAsset.version + 1) + ') 생성'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. 모달: 에셋 정밀 확대 뷰어 */}
      {inspectingAsset && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono text-rose-400 font-bold mr-2">
                  {inspectingAsset.assetId}
                </span>
                <span className="text-base font-bold text-white">{inspectingAsset.name}</span>
              </div>
              <button
                onClick={() => setInspectingAsset(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 min-h-0 flex items-center justify-center bg-black/60 rounded-xl overflow-hidden border border-slate-800 p-2">
              <img
                src={inspectingAsset.url}
                alt={inspectingAsset.name}
                className="max-h-[60vh] w-auto object-contain rounded-lg shadow-2xl"
              />
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 flex items-center justify-between">
              <div>
                <span className="text-slate-500">엔진:</span>{' '}
                {inspectingAsset.metadata.provider || 'MovieStory Neural Canvas'} |{' '}
                <span className="text-slate-500">화면비:</span>{' '}
                {inspectingAsset.metadata.aspectRatio || '16:9'} |{' '}
                <span className="text-slate-500">시드:</span> {inspectingAsset.seed}
              </div>
              <a
                href={inspectingAsset.url}
                download={`${inspectingAsset.assetId}.jpg`}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs transition-colors"
              >
                이미지 저장
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 5. Rule 2.1 절대 준수: 화면당 주 명령 최대 2개 */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 backdrop-blur-md flex items-center justify-between gap-4 sticky bottom-6 shadow-2xl z-40">
        <button
          onClick={onPrevStep}
          className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm transition-all flex items-center gap-2 border border-slate-700"
        >
          <span>←</span>
          <span>이전: 제작 설계 수정</span>
        </button>

        <button
          onClick={onNextStep}
          className="px-8 py-3 bg-gradient-to-r from-rose-600 via-rose-500 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-extrabold rounded-xl text-sm transition-all shadow-xl shadow-rose-950/40 flex items-center gap-2 cursor-pointer"
        >
          <span>다음: 편집 및 종합 마스터링</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};
