import React, { useState, useEffect } from 'react';
import {
  Project,
  FinalDelivery,
  RenderPresetId,
  DeliveryResult,
  FinalRenderVersion,
  FinalRenderValidationReport,
  PreflightCheckResult,
  RenderJob,
} from '../types';
import {
  FinalDeliveryService,
  RENDER_PROFILES,
} from '../services/FinalDeliveryService';

interface Step8FinalDeliveryProps {
  project: Project;
  onUpdateProject: (updatedProject: Partial<Project>) => void;
  onPrevStep: () => void;
  onNewStory: () => void;
}

export const Step8FinalDelivery: React.FC<Step8FinalDeliveryProps> = ({
  project,
  onUpdateProject,
  onPrevStep,
  onNewStory,
}) => {
  const pkg = project.productionPackage;
  const script = project.currentScript;
  const timeline = project.finalTimeline;

  // 1. FinalDelivery 상태 초기화 (실데이터 기반)
  const [delivery, setDelivery] = useState<FinalDelivery>(() => {
    if (!pkg || !timeline) {
      return {
        id: 'empty',
        projectId: project.id,
        version: 1,
        sourceHash: '',
        selectedPreset: 'CINEMA_16_9',
        activeProfile: RENDER_PROFILES.CINEMA_16_9,
        jobs: [],
        deliveries: [],
        renderVersions: [],
        subtitleFiles: [],
        validation: {
          totalScore: 0,
          timelineIntegrity: 0,
          assetCompleteness: 0,
          audioReadiness: 0,
          subtitleSync: 0,
          videoSpecification: 0,
          outputCompatibility: 0,
          archiveReadiness: 0,
          status: 'REPAIR_REQUIRED',
          checks: [],
          warnings: [],
          errors: [],
        },
        status: 'DRAFT',
        updatedAt: new Date().toISOString(),
      };
    }
    return FinalDeliveryService.initializeFinalDelivery(
      project,
      timeline,
      pkg,
      project.finalDelivery
    );
  });

  // 2. 실제 FFmpeg 렌더링 상태
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [activeJob, setActiveJob] = useState<RenderJob | null>(null);
  const [preflightResult, setPreflightResult] = useState<PreflightCheckResult | null>(null);
  const [activeValidationReport, setActiveValidationReport] = useState<FinalRenderValidationReport | null>(null);

  // 3. Progressive Disclosure: 고급 코덱 설정 펼침 여부
  const [showAdvancedSettings, setShowAdvancedSettings] = useState<boolean>(false);

  // 4. 인스펙터 서브 탭: 'PACKAGES' | 'VERSIONS' | 'QUALITY' | 'SUBTITLES' | 'ARCHIVE'
  const [activeTab, setActiveTab] = useState<
    'PACKAGES' | 'VERSIONS' | 'QUALITY' | 'SUBTITLES' | 'ARCHIVE'
  >('PACKAGES');

  // 5. 토스트 알림 상태
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  // 상위 데이터 변경 감지 시 동기화
  useEffect(() => {
    if (pkg && timeline) {
      const initialized = FinalDeliveryService.initializeFinalDelivery(
        project,
        timeline,
        pkg,
        project.finalDelivery
      );
      setDelivery(initialized);
      onUpdateProject({ finalDelivery: initialized });
    }
  }, [pkg?.sourceContentHash, timeline?.updatedAt]);

  if (!pkg || !timeline || !script) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center max-w-2xl mx-auto my-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-amber-950/40 border border-amber-800/60 rounded-full flex items-center justify-center text-2xl">
          ⚠️
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
          Step 7 최종 마스터 타임라인이 필요합니다
        </h3>
        <p className="text-slate-400 text-sm mb-6">
          최종 납품 영상을 인코딩하기 전에 Step 7에서 타임라인 편집 및 자막 동기화가 확정되어야
          합니다.
        </p>
        <button
          onClick={onPrevStep}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all cursor-pointer"
        >
          ← Step 7 편집 스튜디오로 이동
        </button>
      </div>
    );
  }

  // 렌더 프리셋 변경 핸들러
  const handleSelectPreset = (presetId: RenderPresetId) => {
    const profile = FinalDeliveryService.getRenderProfileWithFFmpeg(presetId, timeline);
    const updated: FinalDelivery = {
      ...delivery,
      selectedPreset: presetId,
      activeProfile: profile,
      updatedAt: new Date().toISOString(),
    };
    setDelivery(updated);
    onUpdateProject({ finalDelivery: updated });
  };

  // Pre-flight 사전 점검 실행
  const runPreflightCheck = async (): Promise<boolean> => {
    const check = await FinalDeliveryService.checkPreflight(
      timeline,
      pkg,
      project.assetLibrary
    );
    setPreflightResult(check);
    if (!check.passed) {
      const failed = check.checks.filter((c: { passed: boolean; critical: boolean; name: string }) => !c.passed && c.critical);
      if (failed.length > 0) {
        setNoticeMessage(`⚠️ Pre-flight 실패: ${failed.map((f: { name: string }) => f.name).join(', ')}`);
        return false;
      }
    }
    return true;
  };

  // 실제 FFmpeg 비디오 렌더링 시작 핸들러
  const handleStartRender = async () => {
    // 1. Pre-flight 검증 선행
    const ok = await runPreflightCheck();
    if (!ok) return;

    setIsRendering(true);
    const newVersionNum = (delivery.renderVersions?.length || 0) + 1;
    setActiveJob({
      jobId: 'init',
      presetId: delivery.selectedPreset,
      profile: delivery.activeProfile,
      status: 'PREPARING',
      progress: 0,
      stage: 'FFmpeg 렌더링 파이프라인 시동 및 프레임 버퍼 생성...',
    });

    try {
      const renderResult = await FinalDeliveryService.executeRealRender(
        timeline,
        delivery.activeProfile,
        newVersionNum,
        project.assetLibrary?.assets || [],
        (jobProgress) => {
          setActiveJob(jobProgress);
          if (jobProgress.jobId) setActiveJobId(jobProgress.jobId);
        }
      );

      // FFmpeg 및 ffprobe 검증 통과
      setActiveValidationReport(renderResult.validationReport);

      // 새 버전 객체 구성 (Version Preservation)
      const newVersion: FinalRenderVersion = {
        id: `ver-${Date.now()}`,
        version: newVersionNum,
        renderProfileId: delivery.activeProfile.id,
        outputPath: `/outputs/${renderResult.outputFileName}`,
        outputFileName: renderResult.outputFileName,
        createdAt: new Date().toISOString(),
        status: 'COMPLETED',
        contentHash: pkg.sourceContentHash,
        duration: renderResult.duration,
        resolution: `${delivery.activeProfile.resolution.width}x${delivery.activeProfile.resolution.height}`,
        fps: delivery.activeProfile.frameRate,
        videoCodec: delivery.activeProfile.videoCodec,
        audioCodec: delivery.activeProfile.audioCodec,
        fileSize: renderResult.fileSizeBytes,
        downloadUrl: renderResult.videoUrl,
        validationReport: renderResult.validationReport,
      };

      const newDeliveryResult: DeliveryResult = {
        deliveryId: `del-${Date.now()}`,
        targetPlatform: delivery.activeProfile.targetPlatform,
        profile: delivery.activeProfile,
        videoUrl: renderResult.videoUrl,
        fileName: renderResult.outputFileName,
        fileSizeBytes: renderResult.fileSizeBytes,
        duration: renderResult.duration,
        subtitleBurnedIn: delivery.activeProfile.subtitleMode === 'BURN_IN',
        completedAt: new Date().toISOString(),
      };

      const updatedDeliveries = [newDeliveryResult, ...delivery.deliveries];
      const updatedVersions = [newVersion, ...(delivery.renderVersions || [])];

      const archive = FinalDeliveryService.createProjectMasterArchive(
        project,
        timeline,
        pkg,
        updatedDeliveries
      );

      const updatedDelivery: FinalDelivery = {
        ...delivery,
        version: newVersionNum,
        deliveries: updatedDeliveries,
        renderVersions: updatedVersions,
        archive,
        status: 'COMPLETED',
        updatedAt: new Date().toISOString(),
      };

      setDelivery(updatedDelivery);
      onUpdateProject({
        finalDelivery: updatedDelivery,
        projectArchive: archive,
      });

      setNoticeMessage(
        `🎉 [FINAL_v${newVersionNum}] ${renderResult.outputFileName} 렌더링 및 ffprobe 검증 통과 (${renderResult.validationReport.score}점)!`
      );
      setTimeout(() => setNoticeMessage(null), 5000);
    } catch (err: any) {
      if (err.message?.includes('취소')) {
        setNoticeMessage('ℹ️ 렌더링이 취소되었습니다. 기존 버전은 안전하게 보존됩니다.');
      } else {
        alert(`렌더링 오류: ${err.message || '알 수 없는 오류'}`);
      }
    } finally {
      setIsRendering(false);
      setActiveJobId(null);
    }
  };

  // 렌더링 취소 핸들러
  const handleCancelRender = async () => {
    if (activeJobId) {
      await FinalDeliveryService.cancelRealRender(activeJobId);
    }
    setIsRendering(false);
    setActiveJob(null);
    setActiveJobId(null);
    setNoticeMessage('■ 렌더링 프로세스를 중단했습니다.');
    setTimeout(() => setNoticeMessage(null), 3000);
  };

  // 프로젝트 마스터 백업 다운로드
  const handleDownloadArchiveJson = () => {
    const archive =
      delivery.archive ||
      FinalDeliveryService.createProjectMasterArchive(
        project,
        timeline,
        pkg,
        delivery.deliveries
      );

    const blob = new Blob([archive.archiveJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MovieStory_Project_Master_${project.id}_v${archive.version}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setNoticeMessage('📦 프로젝트 마스터 아카이브(JSON)가 다운로드되었습니다.');
    setTimeout(() => setNoticeMessage(null), 3000);
  };

  const latestDelivery = delivery.deliveries[0];
  const latestVersion = delivery.renderVersions?.[0];
  const isCompleted = delivery.status === 'COMPLETED' || delivery.deliveries.length > 0;
  const validation = delivery.validation;
  const ffprobeReport = activeValidationReport || latestVersion?.validationReport;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24 text-slate-100 font-sans">
      {/* 1. 최상단 헤더 & 납품 상태 배너 */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold rounded-full tracking-wider uppercase">
                Step 8 • Final Gate & Archive Center
              </span>
              <span className="px-2.5 py-1 bg-slate-800 text-slate-300 border border-slate-700 text-xs rounded-full font-mono font-bold">
                {delivery.activeProfile.aspectRatio} • {delivery.activeProfile.resolution.width}×
                {delivery.activeProfile.resolution.height}
              </span>
              <span
                className={`px-2.5 py-1 text-xs rounded-full font-semibold border ${
                  isCompleted
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                    : validation.status === 'READY_TO_RENDER'
                    ? 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                    : 'bg-rose-950/60 text-rose-300 border-rose-800/60'
                }`}
              >
                {isCompleted
                  ? `납품본 완료 (${delivery.deliveries.length}개 파일 보존)`
                  : validation.status === 'READY_TO_RENDER'
                  ? '실제 렌더링 준비 완료 (READY TO RENDER)'
                  : '경고 확인 필요'}
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>최종 납품 및 검증 렌더링 센터</span>
              <span className="text-xs px-2.5 py-0.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 font-mono">
                FINAL v{delivery.version}
              </span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              확정된 타임라인 데이터를 실제 시스템의 FFmpeg로 인코딩하고 ffprobe 무결성 100점 검증 및
              프로젝트 마스터 아카이브로 최종 패키징합니다.
            </p>
          </div>

          {/* 렌더 검증 인덱스 카드 */}
          <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 min-w-[340px]">
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
                  className={
                    (ffprobeReport ? ffprobeReport.score : validation.totalScore) >= 90
                      ? 'text-emerald-400'
                      : 'text-amber-400'
                  }
                  strokeDasharray={`${
                    ffprobeReport ? ffprobeReport.score : validation.totalScore
                  }, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-sm font-black text-white">
                {ffprobeReport ? ffprobeReport.score : validation.totalScore}
              </span>
            </div>

            <div className="flex-1 text-xs space-y-1">
              <div className="flex justify-between font-medium">
                <span className="text-slate-400">
                  {ffprobeReport ? 'ffprobe Gate Score' : 'Pre-flight Score'}
                </span>
                <span className="text-white font-bold">
                  {ffprobeReport ? ffprobeReport.score : validation.totalScore} / 100
                </span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-slate-400">출력 프로필</span>
                <span className="text-emerald-400 font-bold">{delivery.activeProfile.tag}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-slate-400">보존된 렌더 버전</span>
                <span className="text-amber-300 font-semibold">
                  {delivery.renderVersions?.length || delivery.deliveries.length}개 버전 영구 보존
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* OUTDATED 알림 */}
        {delivery.status === 'OUTDATED' && (
          <div className="mt-4 p-3.5 bg-amber-950/40 border border-amber-500/40 rounded-xl flex items-center justify-between text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <span className="text-base">⚠️</span>
              <span>
                <strong>상위 서사/편집 데이터가 변경되었습니다.</strong> 기존 생성본은 삭제되지
                않으며, 최신 사양으로 새 버전을 렌더링할 수 있습니다.
              </span>
            </div>
          </div>
        )}

        {/* 토스트 알림 */}
        {noticeMessage && (
          <div className="mt-3 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <span>✓</span>
            <span>{noticeMessage}</span>
          </div>
        )}
      </div>

      {/* 2. 중앙 렌더 모니터 & 렌더링 실시간 진행 엔진 */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-white">🎬 Real FFmpeg Master Video Monitor</span>
            {isCompleted && (
              <span className="text-xs px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded font-bold">
                ✓ 렌더링 완료본 준비됨
              </span>
            )}
          </div>
          <span className="text-xs font-mono text-slate-400">
            총 영상 길이: {timeline.duration}초 ({delivery.activeProfile.frameRate} FPS)
          </span>
        </div>

        {/* 모니터 뷰포트 */}
        {isRendering ? (
          <div className="p-8 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center animate-spin text-2xl">
              ⚙️
            </div>
            <div>
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold rounded-full font-mono uppercase">
                {activeJob?.status || 'RENDERING'}
              </span>
              <h3 className="text-lg font-bold text-white mt-2">
                실제 FFmpeg 미디어 프로세스 실행 중...
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                {activeJob?.stage || '인코딩 진행 중...'}
              </p>
            </div>

            {/* 실시간 FFmpeg 텔레메트리 대시보드 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto text-xs font-mono text-slate-300">
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">인코딩 프레임:</span>
                <span className="text-white font-bold">{activeJob?.frame ?? '–'} frames</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">실시간 FPS:</span>
                <span className="text-emerald-400 font-bold">{activeJob?.fps ?? '–'} fps</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">인코딩 속도:</span>
                <span className="text-amber-400 font-bold">{activeJob?.speed ?? '–'}</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">렌더 시간:</span>
                <span className="text-cyan-400 font-bold">
                  {activeJob?.outTimeSeconds ? `${activeJob.outTimeSeconds.toFixed(1)}s` : '–'} /{' '}
                  {timeline.duration}s
                </span>
              </div>
            </div>

            {/* 렌더 큐 프로그레스 바 */}
            <div className="max-w-md mx-auto space-y-2">
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="bg-gradient-to-r from-emerald-500 via-amber-500 to-indigo-500 h-full transition-all duration-200"
                  style={{ width: `${activeJob?.progress || 0}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>{delivery.activeProfile.name}</span>
                <span className="font-bold text-white">{activeJob?.progress || 0}%</span>
              </div>
            </div>
          </div>
        ) : isCompleted && latestDelivery?.videoUrl ? (
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-slate-800 max-h-[480px] aspect-video">
              <video
                src={latestDelivery.videoUrl}
                controls
                autoPlay={false}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
              <div>
                <span className="text-white font-bold block">{latestDelivery.fileName}</span>
                <span className="text-slate-400">
                  용량: {(latestDelivery.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB • 코덱:{' '}
                  {latestDelivery.profile.videoCodec} • 길이: {latestDelivery.duration}초
                </span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={latestDelivery.videoUrl}
                  download={latestDelivery.fileName}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <span>📥 MP4 비디오 다운로드</span>
                </a>
              </div>
            </div>
          </div>
        ) : (
          /* 렌더 전 대기 상태 카드 */
          <div className="p-10 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-3xl">
              🎞️
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">마스터 영상 렌더링 대기 중</h3>
              <p className="text-xs text-slate-400 max-w-lg mx-auto mt-1">
                원하는 프로필을 선택하고 하단의 <strong>[최종 렌더링 시작]</strong>을 누르면
                실제 시스템의 <strong>FFmpeg 엔진</strong>이 구동되어 고화질 MP4 파일 생성 및 ffprobe
                검증을 즉시 수행합니다.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 3. Phase 8-2: Render Profile System (Progressive Disclosure) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white">출력 포맷 및 렌더 프로필 선택</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              원하는 플랫폼 환경에 맞춰 원클릭으로 해상도 및 화면비를 전환할 수 있습니다.
            </p>
          </div>
          <button
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition cursor-pointer"
          >
            {showAdvancedSettings ? '▲ 고급 코덱 설정 숨기기' : '▼ 고급 코덱 및 인코딩 세부 설정'}
          </button>
        </div>

        {/* 3대 기본 프리셋 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Object.keys(RENDER_PROFILES) as RenderPresetId[]).map((presetId) => {
            const profile = RENDER_PROFILES[presetId];
            const isSelected = delivery.selectedPreset === presetId;

            return (
              <div
                key={presetId}
                onClick={() => handleSelectPreset(presetId)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-emerald-950/30 border-emerald-500 ring-2 ring-emerald-500/30 shadow-xl'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded ${
                      isSelected
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {profile.tag}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {profile.resolution.width}×{profile.resolution.height}
                  </span>
                </div>

                <h4 className="font-bold text-white text-base mb-1">{profile.name}</h4>
                <p className="text-xs text-slate-400 mb-4 h-10">{profile.description}</p>

                <div className="space-y-1 text-[11px] text-slate-400 font-mono border-t border-slate-800/80 pt-3">
                  <div className="flex justify-between">
                    <span>화면비 / 프레임:</span>
                    <span className="text-slate-200">
                      {profile.aspectRatio} • {profile.frameRate}fps
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>자막 모드:</span>
                    <span className="text-slate-200">
                      {profile.subtitleMode === 'BURN_IN' ? '영상 영구 삽입 (Burn-in)' : '소프트 자막'}
                    </span>
                  </div>
                </div>

                <button
                  className={`w-full mt-4 py-2 text-xs font-bold rounded-xl transition-colors ${
                    isSelected
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {isSelected ? '✓ 선택된 프로필' : '이 프로필로 선택'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Progressive Disclosure: 고급 코덱 및 FFmpeg 동적 파라미터 설정 (기본 숨김) */}
        {showAdvancedSettings && (
          <div className="mt-4 p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 text-xs font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-amber-400 text-sm flex items-center gap-2">
                <span>⚙️ Dynamic FFmpeg 렌더링 파라미터 구조체</span>
                <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] font-normal">
                  선택 프로필: {delivery.activeProfile.tag}
                </span>
              </span>
              <button
                type="button"
                onClick={() => {
                  const cmd = delivery.activeProfile.ffmpegParams?.command || '';
                  if (cmd) {
                    navigator.clipboard.writeText(cmd);
                    setNoticeMessage('✓ FFmpeg CLI 명령어가 클립보드에 복사되었습니다.');
                    setTimeout(() => setNoticeMessage(null), 3000);
                  }
                }}
                className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                📋 FFmpeg 명령어 복사
              </button>
            </div>

            {/* 인코딩 파라미터 그리드 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-300">
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Video Codec:</span>
                <span className="text-white font-bold">{delivery.activeProfile.ffmpegParams?.videoCodec || delivery.activeProfile.videoCodec}</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">CRF / Preset:</span>
                <span className="text-amber-400 font-bold">
                  CRF {delivery.activeProfile.ffmpegParams?.crf ?? 20} ({delivery.activeProfile.ffmpegParams?.preset || 'slow'})
                </span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Bitrate (Max/Buf):</span>
                <span className="text-white font-bold">
                  {delivery.activeProfile.ffmpegParams?.videoBitrate || delivery.activeProfile.bitrate} ({delivery.activeProfile.ffmpegParams?.maxBitrate || '14M'})
                </span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Pixel Format:</span>
                <span className="text-white font-bold">{delivery.activeProfile.ffmpegParams?.pixelFormat || 'yuv420p'}</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Audio Codec / Sample:</span>
                <span className="text-white font-bold">{delivery.activeProfile.ffmpegParams?.audioCodec || 'aac'} / {delivery.activeProfile.ffmpegParams?.audioSampleRate || 48000}Hz</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Audio Bitrate:</span>
                <span className="text-white font-bold">{delivery.activeProfile.ffmpegParams?.audioBitrate || '320k'} Stereo</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 sm:col-span-2">
                <span className="text-slate-500 block text-[10px]">Subtitle Burn-in Mode:</span>
                <span className="text-emerald-400 font-bold">
                  {delivery.activeProfile.subtitleMode === 'BURN_IN' ? 'Burn-in 활성화 (영상 영구 렌더링)' : 'Soft Subtitle (별도 스트림)'}
                </span>
              </div>
            </div>

            {/* 동적 필터그래프 (Audio Ducking & Scale) */}
            <div className="space-y-1">
              <span className="text-slate-500 text-[10px] block font-bold">
                [Dynamic filter_complex (Scale + Audio Ducking + Subtitle)]:
              </span>
              <pre className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 text-[11px] text-cyan-300 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
                {delivery.activeProfile.ffmpegParams?.filterComplex || 'filter_complex 빌드 대기중'}
              </pre>
            </div>

            {/* 완성된 FFmpeg CLI 명령어 뷰어 */}
            <div className="space-y-1">
              <span className="text-slate-500 text-[10px] block font-bold">
                [Generated FFmpeg CLI Execution String]:
              </span>
              <pre className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 text-[11px] text-amber-300 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
                {delivery.activeProfile.ffmpegParams?.command || 'FFmpeg 명령어 빌드 대기중'}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* 4. 배포본, 버전 보존, ffprobe 품질 게이트, 자막, 마스터 백업 인스펙터 탭 */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 overflow-x-auto gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('PACKAGES')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'PACKAGES'
                  ? 'bg-emerald-600 text-white font-extrabold shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              📦 플랫폼 배포본 ({delivery.deliveries.length})
            </button>

            <button
              onClick={() => setActiveTab('VERSIONS')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'VERSIONS'
                  ? 'bg-emerald-600 text-white font-extrabold shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              🕒 버전 보존 이력 ({delivery.renderVersions?.length || 0})
            </button>

            <button
              onClick={() => setActiveTab('QUALITY')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'QUALITY'
                  ? 'bg-emerald-600 text-white font-extrabold shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>🛡️ ffprobe 품질 게이트</span>
              <span className="px-1.5 py-0.2 bg-black/30 rounded text-[10px]">
                {ffprobeReport ? ffprobeReport.score : validation.totalScore}점
              </span>
            </button>

            <button
              onClick={() => setActiveTab('SUBTITLES')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'SUBTITLES'
                  ? 'bg-emerald-600 text-white font-extrabold shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              💬 자막 번들 (SRT / VTT)
            </button>

            <button
              onClick={() => setActiveTab('ARCHIVE')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'ARCHIVE'
                  ? 'bg-emerald-600 text-white font-extrabold shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              💾 프로젝트 마스터 아카이브
            </button>
          </div>
        </div>

        {/* TAB 1: 플랫폼별 배포본 */}
        {activeTab === 'PACKAGES' && (
          <div className="space-y-4">
            {delivery.deliveries.length > 0 ? (
              <div className="space-y-3">
                {delivery.deliveries.map((del) => (
                  <div
                    key={del.deliveryId}
                    className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{del.fileName}</span>
                        <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded text-[10px] font-mono">
                          {del.targetPlatform}
                        </span>
                      </div>
                      <p className="text-slate-400 mt-1">
                        해상도: {del.profile.resolution.width}×{del.profile.resolution.height} •
                        용량: {(del.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB • 자막 번인:{' '}
                        {del.subtitleBurnedIn ? '포함' : '소프트 자막'}
                      </p>
                    </div>

                    <a
                      href={del.videoUrl}
                      download={del.fileName}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition border border-slate-700 flex items-center gap-1 cursor-pointer"
                    >
                      <span>📥 다운로드</span>
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs">
                아직 렌더링된 배포본이 없습니다. [최종 렌더링 시작]을 눌러 배포본을 생성하세요.
              </div>
            )}
          </div>
        )}

        {/* TAB 2: 버전 보존 이력 (Never Overwrite) */}
        {activeTab === 'VERSIONS' && (
          <div className="space-y-4">
            {delivery.renderVersions && delivery.renderVersions.length > 0 ? (
              <div className="space-y-3">
                {delivery.renderVersions.map((v) => (
                  <div
                    key={v.id}
                    className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs font-mono"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded font-bold text-[11px]">
                          FINAL_v{v.version}
                        </span>
                        <span className="font-bold text-white">{v.outputFileName}</span>
                        <span className="text-emerald-400 text-[10px]">
                          ✓ {v.validationReport?.score ?? 100}점 통과
                        </span>
                      </div>
                      <p className="text-slate-400 mt-1 text-[11px]">
                        규격: {v.resolution} ({v.fps}fps) • 코덱: {v.videoCodec} / {v.audioCodec} •
                        용량: {(v.fileSize / (1024 * 1024)).toFixed(1)} MB • 생성:{' '}
                        {new Date(v.createdAt).toLocaleTimeString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {v.downloadUrl && (
                        <a
                          href={v.downloadUrl}
                          download={v.outputFileName}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition border border-slate-700"
                        >
                          📥 다운로드
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs">
                보존된 렌더링 버전이 없습니다. 렌더링을 실행하면 각 버전이 영구 보존됩니다.
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ffprobe 품질 게이트 검증 (100점 만점) */}
        {activeTab === 'QUALITY' && (
          <div className="space-y-4">
            {ffprobeReport ? (
              <div className="space-y-4">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400">ffprobe Quality Gate 결과</span>
                    <h4 className="text-lg font-black text-white flex items-center gap-2 mt-0.5">
                      <span>{ffprobeReport.score}점</span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                          ffprobeReport.score >= 90
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : ffprobeReport.score >= 70
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}
                      >
                        {ffprobeReport.status === 'READY'
                          ? 'DELIVERY READY (납품 승인)'
                          : ffprobeReport.status === 'WARNING'
                          ? 'READY WITH WARNINGS (경고 확인)'
                          : 'DELIVERY FAILED (납품 실패)'}
                      </span>
                    </h4>
                  </div>
                  <div className="text-right text-xs font-mono text-slate-400">
                    <div>포맷: {ffprobeReport.outputMetadata.format || 'mp4'} (ISO Media)</div>
                    <div>
                      해상도: {ffprobeReport.outputMetadata.width}×
                      {ffprobeReport.outputMetadata.height} ({ffprobeReport.outputMetadata.fps}fps)
                    </div>
                  </div>
                </div>

                {/* 8개 검증 항목 체크리스트 */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    8대 정합성 검증 세부 항목 (100점 만점)
                  </h4>
                  <div className="space-y-2">
                    {ffprobeReport.checks.map((chk, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>{chk.name}</span>
                            <span className="text-[11px] text-amber-400 font-mono">
                              ({chk.score} / {chk.maxScore}점)
                            </span>
                          </div>
                          <div className="text-slate-400 text-[11px] mt-0.5">{chk.detail}</div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            chk.passed
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-rose-950 text-rose-400 border border-rose-800'
                          }`}
                        >
                          {chk.passed ? 'PASS' : 'FAIL'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Pre-flight 기본 검증 뷰 */
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-400">타임라인 무결성</span>
                    <p className="text-emerald-400 font-bold text-base mt-1">
                      {validation.timelineIntegrity} / 20
                    </p>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-400">자산 완성도</span>
                    <p className="text-emerald-400 font-bold text-base mt-1">
                      {validation.assetCompleteness} / 20
                    </p>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-400">오디오 & 자막 싱크</span>
                    <p className="text-emerald-400 font-bold text-base mt-1">
                      {validation.audioReadiness + validation.subtitleSync} / 25
                    </p>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-400">비디오 규격 & 백업</span>
                    <p className="text-emerald-400 font-bold text-base mt-1">
                      {validation.videoSpecification +
                        validation.outputCompatibility +
                        validation.archiveReadiness}{' '}
                      / 35
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    렌더링 전 정합성 점검 항목 ({validation.checks.length}건)
                  </h4>
                  <div className="space-y-2">
                    {validation.checks.map((chk, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-white">{chk.label}</div>
                          <div className="text-slate-400 text-[11px] mt-0.5">{chk.detail}</div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            chk.passed
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}
                        >
                          {chk.passed ? 'PASS' : 'WARN'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: 자막 번들 (SRT / VTT) */}
        {activeTab === 'SUBTITLES' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {delivery.subtitleFiles.map((subFile) => (
                <div
                  key={subFile.type}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white text-sm">
                        {subFile.type} 자막 파일
                      </span>
                      <span className="text-[11px] text-slate-400 block font-mono">
                        {subFile.fileName}
                      </span>
                    </div>
                    {subFile.downloadUrl && (
                      <a
                        href={subFile.downloadUrl}
                        download={subFile.fileName}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                      >
                        📥 다운로드
                      </a>
                    )}
                  </div>

                  <pre className="p-3 bg-slate-900 rounded-lg text-[11px] font-mono text-slate-300 max-h-36 overflow-y-auto border border-slate-800">
                    {subFile.content.slice(0, 300)}...
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: 프로젝트 마스터 아카이브 */}
        {activeTab === 'ARCHIVE' && (
          <div className="space-y-4">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h4 className="font-bold text-white text-base">
                    MovieStory Master Project Archive
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    01_STORY, 02_SCRIPT, 03_PRODUCTION, 04_ASSETS, 05_EDIT, 06_FINAL, MANIFEST가 모두
                    담긴 단일 마스터 JSON 번들입니다.
                  </p>
                </div>
                <button
                  onClick={handleDownloadArchiveJson}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition shadow-md cursor-pointer"
                >
                  📦 전체 프로젝트 백업 다운로드
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">01_STORY</span>
                  Seed, Premise, Bible, Blueprint
                </div>
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">02_SCRIPT</span>
                  {project.currentScript?.scenes.length} Scenes, 대사 전문
                </div>
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">03_PRODUCTION</span>
                  {pkg.shotList.length} Atomic Shots & Bibles
                </div>
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">04_ASSETS</span>
                  {project.assetLibrary?.assets.length} Assets & Prompts
                </div>
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">05_EDIT</span>
                  V1/A1/A2/SUB NLE Timeline
                </div>
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">06_FINAL</span>
                  MP4 Deliveries & Subtitles
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. 절대 규칙 Rule 2.1 준수: 화면당 주 프로세스 명령 최대 2개 */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 backdrop-blur-md flex items-center justify-between gap-4 sticky bottom-6 shadow-2xl z-40">
        {isRendering ? (
          /* 상태 A: 렌더링 진행 중 -> 오직 [■ 렌더링 취소] 주 명령 1개만 노출 */
          <div className="w-full flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span>FFmpeg 렌더링 진행 중... ({activeJob?.progress || 0}%)</span>
            </span>

            <button
              onClick={handleCancelRender}
              className="px-8 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-sm transition-all shadow-xl shadow-rose-950/40 flex items-center gap-2 cursor-pointer"
            >
              <span>■</span>
              <span>렌더링 취소</span>
            </button>
          </div>
        ) : !isCompleted ? (
          /* 상태 B: 렌더링 전 -> 주 명령 2개 ([← 이전: 편집 수정], [🎬 최종 렌더링 시작]) */
          <>
            <button
              onClick={onPrevStep}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm transition-all flex items-center gap-2 border border-slate-700 cursor-pointer"
            >
              <span>←</span>
              <span>이전: 편집 수정</span>
            </button>

            <button
              onClick={handleStartRender}
              className="px-8 py-3 bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 hover:from-emerald-500 hover:to-amber-400 text-slate-950 font-black rounded-xl text-sm transition-all shadow-xl shadow-emerald-950/40 flex items-center gap-2 cursor-pointer"
            >
              <span>🎬 최종 렌더링 시작</span>
              <span>({delivery.activeProfile.tag})</span>
            </button>
          </>
        ) : (
          /* 상태 C: 렌더링 완료 후 -> 주 명령 2개 ([📦 프로젝트 마스터 보관 (JSON)], [✓ 새로운 영화 창작 시작 →]) */
          <>
            <button
              onClick={handleDownloadArchiveJson}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-sm transition-all flex items-center gap-2 border border-slate-700 cursor-pointer"
            >
              <span>📦</span>
              <span>프로젝트 마스터 보관 (JSON)</span>
            </button>

            <button
              onClick={onNewStory}
              className="px-8 py-3 bg-gradient-to-r from-amber-500 via-amber-400 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 font-black rounded-xl text-sm transition-all shadow-xl shadow-amber-950/40 flex items-center gap-2 cursor-pointer"
            >
              <span>✓ 새로운 영화 창작 시작</span>
              <span>→</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
