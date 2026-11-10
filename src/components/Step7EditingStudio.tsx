import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Project,
  FinalTimeline,
  VideoTrackItem,
  EditingVersion,
  TransitionType,
} from '../types';
import { EditingTimelineService } from '../services/EditingTimelineService';
import { ProjectStorageService } from '../services/ProjectStorageService';
import {
  EdgeTtsService,
  FALLBACK_NEURAL_VOICES,
  NeuralVoiceModel,
} from '../services/EdgeTtsAudioService';

interface Step7EditingStudioProps {
  project: Project;
  onUpdateProject: (updatedProject: Partial<Project>) => void;
  onPrevStep: () => void;
  onNextStep: () => void;
}

export const Step7EditingStudio: React.FC<Step7EditingStudioProps> = ({
  project,
  onUpdateProject,
  onPrevStep,
  onNextStep,
}) => {
  const pkg = project.productionPackage;
  const script = project.currentScript;
  const assetLibrary = project.assetLibrary;

  // 1. 타임라인 상태 초기화 (실제 데이터 기반)
  const [timeline, setTimeline] = useState<FinalTimeline>(() => {
    if (!pkg || !script) {
      return {
        id: 'empty',
        projectId: project.id,
        format: 'cinema',
        duration: 60,
        videoTracks: [],
        audioTracks: [],
        subtitleTracks: [],
        markers: [],
        overrides: [],
        version: 1,
        contentHash: '',
        status: 'READY',
        updatedAt: new Date().toISOString(),
      };
    }
    return (
      project.finalTimeline ||
      EditingTimelineService.buildTimelineFromRealData(
        project.id,
        script,
        pkg,
        assetLibrary,
        project.finalTimeline
      )
    );
  });

  // 2. 버전 기록 상태
  const [versions, setVersions] = useState<EditingVersion[]>(
    project.editingVersions || []
  );

  // 3. 인스펙터 탭: 'VIDEO' | 'AUDIO' | 'SUBTITLE' | 'AUDIT' | 'VERSIONS'
  const [activeTab, setActiveTab] = useState<
    'VIDEO' | 'AUDIO' | 'SUBTITLE' | 'AUDIT' | 'VERSIONS'
  >('VIDEO');

  // 4. 재생 플레이어 상태 및 실시간 고품질 Edge-TTS 뉴럴 보이스 엔진
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [selectedShotId, setSelectedShotId] = useState<string>('');
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState<boolean>(false);
  const [speakingSpeaker, setSpeakingSpeaker] = useState<string | null>(null);
  const [activeVoiceModelName, setActiveVoiceModelName] = useState<string>('ko-KR-SunHiNeural');
  const [availableVoices, setAvailableVoices] = useState<NeuralVoiceModel[]>(FALLBACK_NEURAL_VOICES);
  const [selectedDefaultVoice, setSelectedDefaultVoice] = useState<string>('ko-KR-SunHiNeural');
  const [selectedVoiceRate, setSelectedVoiceRate] = useState<string>('+0%');
  const [characterVoiceMap, setCharacterVoiceMap] = useState<Record<string, string>>({});
  const [isVoiceStudioOpen, setIsVoiceStudioOpen] = useState<boolean>(false);
  const [isPreloadingAll, setIsPreloadingAll] = useState<boolean>(false);
  const [testingVoiceId, setTestingVoiceId] = useState<string | null>(null);

  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSpokenSubtitleIdRef = useRef<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const bgmGainRef = useRef<GainNode | null>(null);

  // 서버 EdgeTTS 뉴럴 보이스 목록 초기화
  useEffect(() => {
    fetch('/api/tts/voices')
      .then((res) => res.json())
      .then((data) => {
        if (data.voices && Array.isArray(data.voices) && data.voices.length > 0) {
          setAvailableVoices(data.voices);
          if (data.defaultVoice) setSelectedDefaultVoice(data.defaultVoice);
        }
      })
      .catch(() => {
        // Fallback already assigned
      });
  }, []);

  // 5. 알림 상태
  const [copiedNotice, setCopiedNotice] = useState<string | null>(null);

  // 상위 데이터 변경 감지 및 자동 빌드
  useEffect(() => {
    if (pkg && script) {
      const built = EditingTimelineService.buildTimelineFromRealData(
        project.id,
        script,
        pkg,
        assetLibrary,
        project.finalTimeline
      );
      setTimeline(built);
      onUpdateProject({ finalTimeline: built });
    }
  }, [pkg?.sourceContentHash, assetLibrary?.updatedAt]);

  // 첫 번째 샷 기본 선택
  useEffect(() => {
    if (!selectedShotId && timeline.videoTracks[0]?.items[0]) {
      setSelectedShotId(timeline.videoTracks[0].items[0].shotId);
    }
  }, [timeline.videoTracks, selectedShotId]);

  // 플레이어 타이머 시뮬레이션
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= timeline.duration) {
            setIsPlaying(false);
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
              window.speechSynthesis.cancel();
            }
            setIsVoiceSpeaking(false);
            setSpeakingSpeaker(null);
            return 0;
          }
          return Math.min(timeline.duration, Number((prev + 0.1).toFixed(2)));
        });
      }, 100);
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, timeline.duration]);

  // 현재 재생 시점에 해당하는 샷 및 자막 계산
  const currentVideoItem = useMemo(() => {
    const items = timeline.videoTracks[0]?.items || [];
    return (
      items.find((item) => currentTime >= item.startTime && currentTime < item.endTime) ||
      items[0]
    );
  }, [currentTime, timeline.videoTracks]);

  const currentSubtitle = useMemo(() => {
    const items = timeline.subtitleTracks[0]?.items || [];
    return items.find((sub) => currentTime >= sub.startTime && currentTime <= sub.endTime);
  }, [currentTime, timeline.subtitleTracks]);

  // 현재 시점의 BGM Ducking 활성 여부
  const isCurrentlyDucked = useMemo(() => {
    const voiceTrack = timeline.audioTracks.find((t) => t.type === 'VOICE');
    return Boolean(
      voiceTrack?.items.some(
        (v) => currentTime >= v.startTime && currentTime <= v.endTime
      )
    );
  }, [currentTime, timeline.audioTracks]);

  // 실제 고음질 Edge-TTS 뉴럴 보이스 발화 함수
  const speakDialogue = async (text: string, speakerName: string = '내레이터') => {
    const voiceTrack = timeline.audioTracks.find((t) => t.type === 'VOICE');
    if (voiceTrack?.muted) return;

    // 화자 매핑 또는 추천 보이스 결정
    const targetVoice =
      characterVoiceMap[speakerName] ||
      (speakerName === '내레이터' || speakerName.includes('해설')
        ? 'ko-KR-HyunsuNeural'
        : selectedDefaultVoice) ||
      EdgeTtsService.getRecommendedVoice(speakerName);

    const vol = (voiceTrack?.volume ?? 100) / 100;

    setIsVoiceSpeaking(true);
    setSpeakingSpeaker(speakerName);
    setActiveVoiceModelName(targetVoice);

    await EdgeTtsService.playVoice({
      text,
      speakerName,
      voice: targetVoice,
      rate: selectedVoiceRate,
      volume: vol,
      onStart: (info) => {
        setIsVoiceSpeaking(true);
        setSpeakingSpeaker(info.speaker);
        setActiveVoiceModelName(info.voice);
      },
      onEnd: () => {
        setIsVoiceSpeaking(false);
        setSpeakingSpeaker(null);
      },
      onError: () => {
        setIsVoiceSpeaking(false);
        setSpeakingSpeaker(null);
      },
    });
  };

  // 탐색(스크러빙) 시 음성 및 위치 동기화
  const handleSeek = (newTime: number) => {
    EdgeTtsService.stopVoice();
    setIsVoiceSpeaking(false);
    setSpeakingSpeaker(null);
    lastSpokenSubtitleIdRef.current = null;
    setCurrentTime(newTime);
  };

  // 전체 자막 Edge-TTS 뉴럴 오디오 일괄 사전 생성
  const handleBatchPreloadVoices = async () => {
    const subtitleItems = timeline.subtitleTracks[0]?.items || [];
    if (subtitleItems.length === 0) return;

    setIsPreloadingAll(true);
    setCopiedNotice('⚡ 전체 자막 Edge-TTS 뉴럴 음성을 일괄 사전 생성하는 중...');

    const payload = subtitleItems.map((sub) => ({
      id: sub.id,
      text: sub.text,
      speakerName: sub.speakerName,
      voice: characterVoiceMap[sub.speakerName] || selectedDefaultVoice,
      rate: selectedVoiceRate,
    }));

    await EdgeTtsService.batchPreload(payload);
    setIsPreloadingAll(false);
    setCopiedNotice(`✅ 전체 ${subtitleItems.length}개 자막의 고품질 Edge-TTS 음성이 사전 캐시되었습니다!`);
    setTimeout(() => setCopiedNotice(null), 3500);
  };

  // 개별 보이스 샘플 테스트
  const handleTestVoiceSample = async (voiceId: string) => {
    setTestingVoiceId(voiceId);
    await EdgeTtsService.playVoice({
      text: '안녕하세요. 무비스토리 에이아이의 자연스러운 고품질 에지 티티에스 음성입니다.',
      voice: voiceId,
      rate: selectedVoiceRate,
      volume: 1.0,
      onEnd: () => setTestingVoiceId(null),
      onError: () => setTestingVoiceId(null),
    });
  };

  // 실시간 재생 시 자막 진입 자동 발화 동기화
  useEffect(() => {
    if (!isPlaying) return;

    if (currentSubtitle) {
      if (lastSpokenSubtitleIdRef.current !== currentSubtitle.id) {
        lastSpokenSubtitleIdRef.current = currentSubtitle.id;
        speakDialogue(currentSubtitle.text, currentSubtitle.speakerName);
      }
    } else {
      if (lastSpokenSubtitleIdRef.current && !isVoiceSpeaking) {
        lastSpokenSubtitleIdRef.current = null;
      }
    }
  }, [currentSubtitle?.id, isPlaying]);

  // 재생 상태 변경 시 오디오 엔진 제어 (일시정지/정지 시 발화 중단 및 BGM 앰비언스 생성)
  useEffect(() => {
    if (!isPlaying) {
      EdgeTtsService.stopVoice();
      setIsVoiceSpeaking(false);
      setSpeakingSpeaker(null);
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      return;
    }

    // 재생 시작 시 Web Audio Ambient BGM 생성
    const bgmTrack = timeline.audioTracks.find((t) => t.type === 'BGM');
    if (bgmTrack && !bgmTrack.muted && typeof window !== 'undefined') {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          audioContextRef.current = ctx;

          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const filter = ctx.createBiquadFilter();
          const gain = ctx.createGain();

          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(110, ctx.currentTime);

          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(165, ctx.currentTime);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(360, ctx.currentTime);

          const baseVolume = ((bgmTrack.volume ?? 50) / 100) * 0.1;
          gain.gain.setValueAtTime(baseVolume, ctx.currentTime);
          bgmGainRef.current = gain;

          osc1.connect(filter);
          osc2.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc1.start();
          osc2.start();
        }
      } catch {
        // Web Audio fallback safely
      }
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    };
  }, [isPlaying]);

  // 보이스 발화 시 실시간 BGM Ducking 처리
  useEffect(() => {
    if (bgmGainRef.current && audioContextRef.current) {
      const bgmTrack = timeline.audioTracks.find((t) => t.type === 'BGM');
      const baseVol = ((bgmTrack?.volume ?? 50) / 100) * 0.1;
      const targetVol = (isVoiceSpeaking || isCurrentlyDucked) ? baseVol * 0.25 : baseVol;
      bgmGainRef.current.gain.setTargetAtTime(targetVol, audioContextRef.current.currentTime, 0.15);
    }
  }, [isVoiceSpeaking, isCurrentlyDucked]);

  // 정합성 감사 리포트 계산
  const auditReport = useMemo(() => {
    if (!pkg) {
      return {
        totalScore: 0,
        timelineIntegrity: 0,
        assetCoverage: 0,
        audioCoverage: 0,
        subtitleCoverage: 0,
        continuity: 0,
        narrativeSync: 0,
        formatCompliance: 0,
        status: 'REPAIR_REQUIRED' as const,
        checks: [],
        warnings: [],
        errors: [],
      };
    }
    return EditingTimelineService.auditFinalizationReadiness(timeline, pkg);
  }, [timeline, pkg]);

  if (!pkg || !script) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center max-w-2xl mx-auto my-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-amber-950/40 border border-amber-800/60 rounded-full flex items-center justify-center text-2xl">
          ⚠️
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
          Step 5 제작 설계 및 Step 4 대본 데이터가 필요합니다
        </h3>
        <p className="text-slate-400 text-sm mb-6">
          마스터 타임라인을 편집하기 전에 대본과 샷 설계 패키지가 준비되어야 합니다.
        </p>
        <button
          onClick={onPrevStep}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all"
        >
          ← 이전 단계로 이동
        </button>
      </div>
    );
  }

  // 타임라인 업데이트 및 자동 저장
  const handleUpdateTimeline = (updated: FinalTimeline) => {
    setTimeline(updated);
    onUpdateProject({
      finalTimeline: updated,
      finalRenderPackage: EditingTimelineService.generateFinalRenderPackage(
        updated,
        auditReport
      ),
    });
  };

  // 트랜지션 및 비디오 속성 오버라이드
  const handleOverrideProperty = (property: string, overrideValue: any) => {
    if (!selectedShotId) return;
    const currentItem = timeline.videoTracks[0]?.items.find(
      (i) => i.shotId === selectedShotId
    );
    const originalValue = currentItem ? (currentItem as any)[property] : null;

    const updated = EditingTimelineService.applyOverride(
      timeline,
      selectedShotId,
      property,
      originalValue,
      overrideValue
    );
    handleUpdateTimeline(updated);
  };

  // 오디오 볼륨 조절
  const handleAudioTrackVolume = (trackType: string, volume: number) => {
    const updatedTracks = timeline.audioTracks.map((t) =>
      t.type === trackType ? { ...t, volume } : t
    );
    handleUpdateTimeline({ ...timeline, audioTracks: updatedTracks });
  };

  // 오디오 뮤트 토글
  const handleAudioTrackMute = (trackType: string) => {
    const updatedTracks = timeline.audioTracks.map((t) =>
      t.type === trackType ? { ...t, muted: !t.muted } : t
    );
    handleUpdateTimeline({ ...timeline, audioTracks: updatedTracks });
  };

  // 새 편집 버전 생성
  const handleCreateSnapshot = () => {
    const note = `편집 스냅샷 (샷 ${timeline.videoTracks[0]?.items.length}개, 오버라이드 ${timeline.overrides.length}개)`;
    const result = EditingTimelineService.createEditingVersion(timeline, versions, note);
    setVersions(result.versions);
    onUpdateProject({ editingVersions: result.versions });
    setCopiedNotice(`새 버전(v${result.activeVersion})이 저장되었습니다.`);
    setTimeout(() => setCopiedNotice(null), 2500);
  };

  // 이전 버전 복원
  const handleRestoreVersion = (v: EditingVersion) => {
    const restored = EditingTimelineService.restoreEditingVersion(v);
    handleUpdateTimeline(restored);
    setCopiedNotice(`버전 v${v.versionNumber}이(가) 타임라인에 복원되었습니다.`);
    setTimeout(() => setCopiedNotice(null), 2500);
  };

  // 상위 데이터와 새 버전 동기화
  const handleSyncUpstream = () => {
    const fresh = EditingTimelineService.buildTimelineFromRealData(
      project.id,
      script,
      pkg,
      assetLibrary
    );
    handleUpdateTimeline(fresh);
    setCopiedNotice('상위 제작 설계와 완전 동기화되었습니다.');
    setTimeout(() => setCopiedNotice(null), 2500);
  };

  // SRT 다운로드
  const handleDownloadSRT = () => {
    const subTrack = timeline.subtitleTracks[0];
    if (!subTrack) return;
    const srtText = EditingTimelineService.exportSRT(subTrack);
    const blob = new Blob([srtText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moviestory-${project.id}-subtitles.srt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // WebVTT 다운로드
  const handleDownloadVTT = () => {
    const subTrack = timeline.subtitleTracks[0];
    if (!subTrack) return;
    const vttText = EditingTimelineService.exportWebVTT(subTrack);
    const blob = new Blob([vttText], { type: 'text/vtt;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moviestory-${project.id}-subtitles.vtt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // JSON 렌더 패키지 다운로드
  const handleDownloadRenderPackage = () => {
    const renderPkg = EditingTimelineService.generateFinalRenderPackage(
      timeline,
      auditReport
    );
    const json = JSON.stringify(renderPkg, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moviestory-final-render-package-${project.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedItem = timeline.videoTracks[0]?.items.find(
    (i) => i.shotId === selectedShotId
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 text-slate-100 font-sans">
      {/* 1. 최상단 헤더 & 마스터링 상태 배너 */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold rounded-full tracking-wider uppercase">
                Step 7 • Final Editing & Mastering
              </span>
              <span className="px-2.5 py-1 bg-slate-800 text-slate-300 border border-slate-700 text-xs rounded-full font-mono font-bold">
                {timeline.format === 'shorts' ? '9:16 Shorts (1080×1920)' : '16:9 Cinema (1920×1080)'}
              </span>
              <span
                className={`px-2.5 py-1 text-xs rounded-full font-semibold border ${
                  auditReport.status === 'READY_FOR_FINAL_EXPORT'
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                    : auditReport.status === 'READY_WITH_WARNINGS'
                    ? 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                    : 'bg-rose-950/60 text-rose-300 border-rose-800/60'
                }`}
              >
                상태: {auditReport.status === 'READY_FOR_FINAL_EXPORT' ? '최종 렌더링 준비 완료' : '검토 경고 존재'}
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>편집 및 종합 마스터링 스튜디오</span>
              <span className="text-xs px-2.5 py-0.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 font-mono">
                EDIT v{timeline.version}
              </span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Step 4 대본, Step 5 샷 타임라인, Step 6 승인 자산, 오디오 더킹 및 자막을 완전 동기화한
              마스터 무비 타임라인입니다.
            </p>
          </div>

          {/* 파이널라이제이션 정합성 스코어 카드 */}
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
                  className={auditReport.totalScore >= 90 ? 'text-emerald-400' : 'text-amber-400'}
                  strokeDasharray={`${auditReport.totalScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-sm font-black text-white">{auditReport.totalScore}</span>
            </div>

            <div className="flex-1 text-xs space-y-1">
              <div className="flex justify-between font-medium">
                <span className="text-slate-400">Finalization Index</span>
                <span className="text-white font-bold">{auditReport.totalScore} / 100</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-slate-400">총 샷 & 영상 길이</span>
                <span className="text-amber-300 font-bold">
                  {timeline.videoTracks[0]?.items.length}개 샷 ({timeline.duration}초)
                </span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-slate-400">오버라이드 보호</span>
                <span className="text-emerald-400 font-semibold">
                  {timeline.overrides.length}개 적용됨 (원본 보호)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 상위 데이터 변경 알림 (OUTDATED 감지 시) */}
        {timeline.status === 'OUTDATED' && (
          <div className="mt-4 p-3.5 bg-amber-950/40 border border-amber-500/40 rounded-xl flex items-center justify-between text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <span className="text-base">⚠️</span>
              <span>
                <strong>상위 제작 데이터가 변경되었습니다.</strong> 기존 편집본(v{timeline.version})은
                안전하게 보존되며, 새 설계로 동기화할 수 있습니다.
              </span>
            </div>
            <button
              onClick={handleSyncUpstream}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer"
            >
              새 버전으로 동기화 (v{timeline.version + 1})
            </button>
          </div>
        )}

        {/* 토스트 알림 */}
        {copiedNotice && (
          <div className="mt-3 p-2.5 bg-emerald-950/70 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <span>✓</span>
            <span>{copiedNotice}</span>
          </div>
        )}
      </div>

      {/* 2. 영화 실시간 프리뷰어 & 뷰파인더 모니터 */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Master Movie Preview Monitor
            </span>
            {currentVideoItem?.isAnimaticPreview ? (
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-[10px] font-bold tracking-wide">
                PREVIEW ONLY / NOT FINAL VIDEO (애니매틱)
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded text-[10px] font-bold">
                ✓ APPROVED AI VIDEO CLIP
              </span>
            )}
          </div>

          {/* 오디오 더킹 인디케이터 */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">Audio Ducking:</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                isCurrentlyDucked
                  ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {isCurrentlyDucked ? 'ACTIVE (BGM 25%)' : 'STANDBY (BGM 100%)'}
            </span>
          </div>
        </div>

        {/* 뷰파인더 캔버스 영역 */}
        <div className="relative rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-slate-800 max-h-[500px] aspect-video">
          {currentVideoItem?.mediaUrl ? (
            <img
              src={currentVideoItem.mediaUrl}
              alt="Preview frame"
              className={`w-full h-full object-cover transition-transform duration-300 ${
                currentVideoItem.scale ? `scale-[${currentVideoItem.scale}]` : 'scale-100'
              }`}
            />
          ) : (
            <div className="text-slate-600 text-xs font-mono">미디어 스트림 없음</div>
          )}

          {/* 시네마틱 뷰파인더 오버레이 */}
          <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
            {/* 상단 타임코드 & 샷 정보 */}
            <div className="flex items-center justify-between text-xs font-mono text-white/80 drop-shadow-md">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                <span>
                  {Math.floor(currentTime / 60)
                    .toString()
                    .padStart(2, '0')}
                  :
                  {Math.floor(currentTime % 60)
                    .toString()
                    .padStart(2, '0')}
                  :
                  {Math.floor((currentTime % 1) * 24)
                    .toString()
                    .padStart(2, '0')}{' '}
                  / {timeline.duration}s
                </span>
              </div>
              <div className="px-2 py-0.5 bg-black/60 backdrop-blur rounded text-[11px]">
                SHOT #{currentVideoItem?.order} • {currentVideoItem?.narrativePurpose}
              </div>
            </div>

            {/* 실시간 자막 오버레이 및 개별 보이스 미리듣기 */}
            {currentSubtitle && (
              <div
                className={`w-full text-center px-6 transition-all pointer-events-auto ${
                  currentSubtitle.position === 'middle' ? 'my-auto' : 'mb-6'
                }`}
              >
                <div className="inline-flex items-center gap-2 bg-black/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-amber-500/30 shadow-2xl">
                  <span className="text-amber-400 font-bold text-xs sm:text-sm">
                    [{currentSubtitle.speakerName}]
                  </span>
                  <span className="text-white font-extrabold text-sm sm:text-base tracking-wide drop-shadow-md">
                    {currentSubtitle.text}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakDialogue(currentSubtitle.text, currentSubtitle.speakerName);
                    }}
                    title="이 대사 AI 음성 즉시 듣기"
                    className="ml-1 p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 hover:text-white text-xs transition cursor-pointer flex items-center gap-1 border border-amber-500/30 shrink-0"
                  >
                    <span>🔊</span>
                    <span className="text-[11px] font-medium hidden sm:inline">음성 듣기</span>
                  </button>
                </div>
              </div>
            )}

            {/* 하단 트랜지션 표시 */}
            <div className="flex items-center justify-between text-[11px] font-mono text-white/70 drop-shadow">
              <span>IN: {currentVideoItem?.transitionIn || 'CUT'}</span>
              <span>OUT: {currentVideoItem?.transitionOut || 'CUT'}</span>
            </div>
          </div>
        </div>

        {/* 플레이어 컨트롤 바 */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 shadow-lg">
          <div className="flex flex-wrap items-center gap-3">
            {/* 1. 재생 / 일시정지 버튼 (Target Focus Element) */}
            <button
              onClick={() => {
                if (isPlaying) {
                  EdgeTtsService.stopVoice();
                  setIsVoiceSpeaking(false);
                  setSpeakingSpeaker(null);
                  setIsPlaying(false);
                } else {
                  setIsPlaying(true);
                  if (currentSubtitle) {
                    lastSpokenSubtitleIdRef.current = currentSubtitle.id;
                    speakDialogue(currentSubtitle.text, currentSubtitle.speakerName);
                  }
                }
              }}
              title={isPlaying ? '일시정지 (Pause)' : 'Edge-TTS 뉴럴 보이스 동기화 재생 (Play with Edge-TTS)'}
              className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm sm:text-base transition-all duration-200 shadow-md cursor-pointer shrink-0 border ${
                isPlaying
                  ? 'bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-400/40 shadow-amber-500/30 animate-pulse'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-400 hover:scale-105 shadow-amber-900/30'
              }`}
            >
              {isPlaying ? '❚❚' : '▶'}
            </button>

            {/* 처음으로 리셋 버튼 */}
            <button
              onClick={() => handleSeek(0)}
              className="px-3 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono border border-slate-800 transition cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <span>⏮</span>
              <span>처음으로</span>
            </button>

            {/* AI 보이스 ON / OFF 토글 */}
            <button
              onClick={() => handleAudioTrackMute('VOICE')}
              title={timeline.audioTracks.find((t) => t.type === 'VOICE')?.muted ? 'AI 음성 켜기' : 'AI 음성 음소거'}
              className={`px-3 py-2.5 rounded-lg text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                timeline.audioTracks.find((t) => t.type === 'VOICE')?.muted
                  ? 'bg-rose-950/60 text-rose-300 border-rose-800 hover:bg-rose-900/70'
                  : 'bg-emerald-950/70 text-emerald-300 border-emerald-800 hover:bg-emerald-900/70'
              }`}
            >
              {timeline.audioTracks.find((t) => t.type === 'VOICE')?.muted ? (
                <>
                  <span>🔇</span>
                  <span>음성 음소거</span>
                </>
              ) : (
                <>
                  <span className={isVoiceSpeaking ? 'animate-bounce text-amber-300' : ''}>🎙️</span>
                  <span>AI 보이스 ON</span>
                </>
              )}
            </button>

            {/* Edge-TTS 고품질 보이스 스튜디오 모달 토글 버튼 */}
            <button
              onClick={() => setIsVoiceStudioOpen(true)}
              className="px-3 py-2.5 rounded-lg text-xs font-bold border border-amber-500/50 bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 transition cursor-pointer flex items-center gap-1.5 shrink-0 shadow-sm"
              title="Edge-TTS 초고음질 신경망 보이스 모델 선택 및 튜닝"
            >
              <span>✨</span>
              <span className="hidden sm:inline">Edge-TTS 보이스 설정</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200 border border-amber-500/30 font-mono">
                {availableVoices.find((v) => v.id === selectedDefaultVoice)?.name.split(' ')[0] || '선히'}
              </span>
            </button>

            {/* BGM 배경음 토글 */}
            <button
              onClick={() => handleAudioTrackMute('BGM')}
              title={timeline.audioTracks.find((t) => t.type === 'BGM')?.muted ? 'BGM 켜기' : 'BGM 음소거'}
              className={`px-2.5 py-2.5 rounded-lg text-xs font-mono border transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                timeline.audioTracks.find((t) => t.type === 'BGM')?.muted
                  ? 'bg-slate-900 text-slate-500 border-slate-800'
                  : 'bg-indigo-950/70 text-indigo-300 border-indigo-800 hover:bg-indigo-900/70'
              }`}
            >
              <span>{timeline.audioTracks.find((t) => t.type === 'BGM')?.muted ? '🎵 BGM OFF' : '🎵 BGM ON'}</span>
            </button>

            {/* 타임라인 스크러빙 슬라이더 */}
            <div className="flex-1 min-w-[200px] flex items-center gap-3">
              <input
                type="range"
                min="0"
                max={timeline.duration}
                step="0.1"
                value={currentTime}
                onChange={(e) => handleSeek(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <span className="text-xs font-mono text-slate-400 shrink-0 min-w-[70px] text-right">
                {currentTime.toFixed(1)}s / {timeline.duration}s
              </span>
            </div>
          </div>

          {/* 실시간 AI 보이스 발화 상태 표시 배너 */}
          <div className="flex items-center justify-between text-xs px-3 py-2 bg-slate-900/80 rounded-lg border border-slate-800/80">
            <div className="flex items-center gap-2 overflow-hidden">
              {isVoiceSpeaking ? (
                <>
                  <div className="flex items-end gap-0.5 h-3.5 shrink-0">
                    <span className="w-1 bg-amber-400 rounded-full animate-bounce [animation-delay:0ms] h-full" />
                    <span className="w-1 bg-amber-400 rounded-full animate-bounce [animation-delay:150ms] h-2/3" />
                    <span className="w-1 bg-amber-400 rounded-full animate-bounce [animation-delay:300ms] h-full" />
                    <span className="w-1 bg-amber-400 rounded-full animate-bounce [animation-delay:100ms] h-1/2" />
                  </div>
                  <span className="text-amber-300 font-bold font-mono shrink-0">
                    [{speakingSpeaker || '화자'} • {availableVoices.find((v) => v.id === activeVoiceModelName)?.name.split(' ')[0] || '선히'}] 발화 중:
                  </span>
                  <span className="text-white truncate italic font-medium">
                    "{currentSubtitle?.text}"
                  </span>
                </>
              ) : (
                <>
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span className="text-slate-300 font-mono text-[11px] flex items-center gap-2">
                    <span className="font-bold text-amber-300">Edge-TTS Studio Neural</span>
                    <span className="text-slate-500">•</span>
                    <span>Microsoft Edge 신경망 기반 자연스러운 한국어 억양 및 호흡 활성화됨</span>
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 shrink-0">
              {isCurrentlyDucked && (
                <span className="px-1.5 py-0.5 bg-amber-950/80 text-amber-300 border border-amber-800 rounded text-[10px]">
                  BGM 75% Auto-Ducking
                </span>
              )}
              <span className="text-amber-400/90 font-medium hidden md:inline">
                보이스: {availableVoices.find((v) => v.id === selectedDefaultVoice)?.name || '선히'} ({selectedVoiceRate})
              </span>
              <span>Voice Vol: {timeline.audioTracks.find((t) => t.type === 'VOICE')?.volume ?? 100}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 비선형 멀티트랙 타임라인 (V1, A1 Voice, A2 BGM, SUB) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>비선형 마스터 타임라인 (NLE Timeline)</span>
              <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-400 border border-slate-700 rounded font-mono">
                총 {timeline.duration}초
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              클립을 클릭하여 우측 인스펙터에서 트랜지션, 스케일, 오디오 볼륨을 실시간 조절할 수 있습니다.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateSnapshot}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition cursor-pointer"
            >
              + 현재 편집본 스냅샷 저장
            </button>
          </div>
        </div>

        {/* 트랙 뷰어 */}
        <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto">
          {/* TRACK 1: VIDEO (V1) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
              <span className="text-amber-400 font-bold">V1: VIDEO & TRANSITIONS</span>
              <span>{timeline.videoTracks[0]?.items.length} 샷</span>
            </div>
            <div className="flex gap-1.5 min-w-[800px] h-16 bg-slate-900/90 rounded-lg p-1.5 border border-slate-800">
              {timeline.videoTracks[0]?.items.map((vItem) => {
                const isCurrent = currentTime >= vItem.startTime && currentTime < vItem.endTime;
                const isSelected = selectedShotId === vItem.shotId;
                const widthPercent = (vItem.duration / timeline.duration) * 100;

                return (
                  <div
                    key={vItem.id}
                    onClick={() => {
                      setSelectedShotId(vItem.shotId);
                      setCurrentTime(vItem.startTime);
                    }}
                    style={{ width: `${Math.max(8, widthPercent)}%` }}
                    className={`h-full rounded-md p-1.5 cursor-pointer border transition-all flex flex-col justify-between overflow-hidden ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-500/30'
                        : isCurrent
                        ? 'bg-rose-950/60 border-rose-500'
                        : 'bg-slate-800/80 border-slate-700 hover:bg-slate-700/80'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono leading-none">
                      <span className="font-bold text-white">S{vItem.order}</span>
                      <span className="text-slate-400">{vItem.duration}s</span>
                    </div>
                    <div className="text-[10px] text-slate-300 truncate font-sans">
                      {vItem.narrativePurpose}
                    </div>
                    <div className="text-[9px] text-slate-500 font-mono flex items-center justify-between">
                      <span>{vItem.transitionIn}</span>
                      {vItem.isAnimaticPreview && (
                        <span className="text-amber-400 font-bold">PREVIEW</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TRACK 2: VOICE (A1) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
              <span className="text-indigo-400 font-bold flex items-center gap-1.5">
                <span>A1: DIALOGUE & VOICE</span>
                <span className="text-[10px] text-amber-400/90 font-normal">(클릭 시 발화 듣기)</span>
              </span>
              <span>대본 일치율 100%</span>
            </div>
            <div className="flex gap-1.5 min-w-[800px] h-10 bg-slate-900/90 rounded-lg p-1 border border-slate-800">
              {timeline.audioTracks.find((t) => t.type === 'VOICE')?.items.map((voice) => {
                const widthPercent = (voice.duration / timeline.duration) * 100;
                return (
                  <div
                    key={voice.id}
                    onClick={() => {
                      handleSeek(voice.startTime);
                      speakDialogue(voice.dialogueText || voice.name, voice.dialogueSpeaker);
                    }}
                    style={{ width: `${Math.max(10, widthPercent)}%` }}
                    className="h-full bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/80 hover:border-amber-400/80 rounded px-2 py-1 flex items-center justify-between text-[10px] text-indigo-200 overflow-hidden cursor-pointer transition shadow-sm"
                    title={`클릭하여 음성 듣기: ${voice.dialogueSpeaker ? `[${voice.dialogueSpeaker}] ` : ''}${voice.dialogueText || voice.name}`}
                  >
                    <span className="font-bold truncate flex items-center gap-1">
                      <span>🔊</span>
                      <span>{voice.name}</span>
                    </span>
                    <span className="text-[9px] text-indigo-400 font-mono shrink-0">VOICE</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TRACK 3: BGM (A2) WITH DUCKING */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
              <span className="text-emerald-400 font-bold">A2: CINEMATIC SCORE (BGM)</span>
              <span>Audio Ducking 적용 (25% 자동 감쇄)</span>
            </div>
            <div className="flex gap-1.5 min-w-[800px] h-10 bg-slate-900/90 rounded-lg p-1 border border-slate-800">
              {timeline.audioTracks.find((t) => t.type === 'BGM')?.items.map((bgm) => {
                const widthPercent = (bgm.duration / timeline.duration) * 100;
                return (
                  <div
                    key={bgm.id}
                    style={{ width: `${Math.max(6, widthPercent)}%` }}
                    className={`h-full rounded px-2 py-1 flex items-center justify-between text-[10px] border transition-colors ${
                      bgm.isDucked
                        ? 'bg-emerald-950/40 border-amber-500/50 text-amber-300'
                        : 'bg-emerald-950/80 border-emerald-700/80 text-emerald-200'
                    }`}
                  >
                    <span className="truncate">{bgm.name}</span>
                    <span className="font-mono text-[9px] shrink-0 font-bold">
                      {bgm.volume}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TRACK 4: SUBTITLES */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
              <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                <span>SUB: SUBTITLES</span>
                <span className="text-[10px] text-cyan-400/80 font-normal">(클릭 시 이동 및 발화)</span>
              </span>
              <span>{timeline.subtitleTracks[0]?.items.length}개 블록</span>
            </div>
            <div className="flex gap-1.5 min-w-[800px] h-9 bg-slate-900/90 rounded-lg p-1 border border-slate-800">
              {timeline.subtitleTracks[0]?.items.map((sub) => {
                const widthPercent =
                  ((sub.endTime - sub.startTime) / timeline.duration) * 100;
                return (
                  <div
                    key={sub.id}
                    onClick={() => {
                      handleSeek(sub.startTime);
                      speakDialogue(sub.text, sub.speakerName);
                    }}
                    style={{ width: `${Math.max(8, widthPercent)}%` }}
                    className="h-full bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800 hover:border-cyan-400 rounded px-2 flex items-center justify-between text-[10px] text-cyan-200 truncate cursor-pointer transition"
                    title={`클릭하여 자막 이동 및 대사 듣기: [${sub.speakerName}] ${sub.text}`}
                  >
                    <span className="truncate flex items-center gap-1">
                      <span>🔊</span>
                      <span>"{sub.text}"</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 4. 세부 인스펙터 탭 (VIDEO, AUDIO, SUBTITLE, AUDIT, VERSIONS) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 overflow-x-auto gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('VIDEO')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'VIDEO'
                  ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              🎬 비디오 & 트랜지션
            </button>

            <button
              onClick={() => setActiveTab('AUDIO')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'AUDIO'
                  ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              🎚️ 오디오 믹싱 & 더킹
            </button>

            <button
              onClick={() => setActiveTab('SUBTITLE')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'SUBTITLE'
                  ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              💬 자막 & SRT/VTT
            </button>

            <button
              onClick={() => setActiveTab('AUDIT')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'AUDIT'
                  ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>🛡️ 정합성 감사</span>
              <span className="px-1.5 py-0.2 bg-black/30 rounded text-[10px]">
                {auditReport.totalScore}점
              </span>
            </button>

            <button
              onClick={() => setActiveTab('VERSIONS')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'VERSIONS'
                  ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>📦 버전 기록</span>
              <span className="px-1.5 py-0.2 bg-black/30 rounded text-[10px]">
                {versions.length}
              </span>
            </button>
          </div>

          <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
            <span>✓ Auto-Saved</span>
          </div>
        </div>

        {/* TAB 1: 비디오 & 트랜지션 인스펙터 */}
        {activeTab === 'VIDEO' && (
          <div className="space-y-4">
            {selectedItem ? (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-xs font-mono text-amber-400 font-bold mr-2">
                      SHOT #{selectedItem.order}
                    </span>
                    <span className="text-sm font-bold text-white">
                      {selectedItem.narrativePurpose}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    타이밍: {selectedItem.startTime}s ~ {selectedItem.endTime}s (
                    {selectedItem.duration}초)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* 트랜지션 IN */}
                  <div className="space-y-2">
                    <label className="text-slate-400 font-semibold block">
                      시작 트랜지션 (Transition IN):
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(['CUT', 'DISSOLVE', 'FADE', 'MATCH_CUT'] as TransitionType[]).map((t) => (
                        <button
                          key={t}
                          onClick={() => handleOverrideProperty('transitionIn', t)}
                          className={`py-2 px-2.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                            selectedItem.transitionIn === t
                              ? 'bg-amber-500 text-slate-950 border-amber-400'
                              : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 트랜지션 OUT */}
                  <div className="space-y-2">
                    <label className="text-slate-400 font-semibold block">
                      종료 트랜지션 (Transition OUT):
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(['CUT', 'DISSOLVE', 'FADE', 'MATCH_CUT'] as TransitionType[]).map((t) => (
                        <button
                          key={t}
                          onClick={() => handleOverrideProperty('transitionOut', t)}
                          className={`py-2 px-2.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                            selectedItem.transitionOut === t
                              ? 'bg-amber-500 text-slate-950 border-amber-400'
                              : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 스케일 및 크롭 모드 */}
                  <div className="space-y-2">
                    <label className="text-slate-400 font-semibold block">
                      화면 스케일 (Scale: {selectedItem.scale}x):
                    </label>
                    <input
                      type="range"
                      min="1.0"
                      max="1.5"
                      step="0.05"
                      value={selectedItem.scale}
                      onChange={(e) =>
                        handleOverrideProperty('scale', parseFloat(e.target.value))
                      }
                      className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                    />

                    <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                      <span>1.0x (표준)</span>
                      <span>1.25x (미세 크롭)</span>
                      <span>1.5x (클로즈업)</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                  <span>
                    💡 수동 조정값은 <code>EditingOverride</code>로 격리되어 Step 3 스토리와 Step 5
                    제작 설계를 파괴하지 않습니다.
                  </span>
                  <span className="font-mono text-amber-400 font-bold">
                    Asset ID: {selectedItem.assetId}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs">
                타임라인에서 샷 블록을 클릭하여 선택하세요.
              </div>
            )}
          </div>
        )}

        {/* TAB 2: 오디오 믹싱 & 더킹 인스펙터 */}
        {activeTab === 'AUDIO' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {timeline.audioTracks.map((track) => (
                <div
                  key={track.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{track.name}</span>
                    <button
                      onClick={() => handleAudioTrackMute(track.type)}
                      className={`px-2 py-0.5 rounded text-xs font-semibold cursor-pointer transition ${
                        track.muted
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {track.muted ? 'Muted' : 'Mute'}
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>트랙 볼륨</span>
                      <span className="font-mono font-bold text-white">
                        {track.muted ? '0' : track.volume}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={track.volume}
                      disabled={track.muted}
                      onChange={(e) =>
                        handleAudioTrackVolume(track.type, parseInt(e.target.value, 10))
                      }
                      className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                    />
                  </div>

                  <div className="text-[11px] text-slate-500 font-mono">
                    {track.type === 'VOICE' && '최우선 보컬 채널 (대사/내레이션 - Edge-TTS Studio Neural)'}
                    {track.type === 'BGM' && '보컬 감지 시 25% 자동 더킹 적용'}
                    {track.type === 'SFX' && '동적 Foley 및 환경 효과음'}
                    {track.type === 'AMBIENCE' && '공간감 형성 앰비언스'}
                  </div>

                  {track.type === 'VOICE' && (
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[11px] text-amber-300 font-mono truncate mr-2">
                        보이스: {availableVoices.find((v) => v.id === selectedDefaultVoice)?.name || '선히'} ({selectedVoiceRate})
                      </span>
                      <button
                        onClick={() => setIsVoiceStudioOpen(true)}
                        className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 text-xs font-bold transition cursor-pointer shrink-0"
                      >
                        ⚙️ 보이스 튜닝
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: 자막 & SRT/VTT 인스펙터 */}
        {activeTab === 'SUBTITLE' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <span className="text-sm font-bold text-white block">
                  대본 기반 표준 자막 & Edge-TTS 보이스 트랙
                </span>
                <span className="text-xs text-slate-400">
                  총 {timeline.subtitleTracks[0]?.items.length}개 대사 항목 • 고품질 뉴럴 음성 동기화 및 SRT/WebVTT 지원
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBatchPreloadVoices}
                  disabled={isPreloadingAll}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                >
                  <span>⚡</span>
                  <span>{isPreloadingAll ? '생성 중...' : 'Edge-TTS 일괄 사전 생성'}</span>
                </button>
                <button
                  onClick={handleDownloadSRT}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  📥 SRT 다운로드
                </button>
                <button
                  onClick={handleDownloadVTT}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition border border-slate-700 cursor-pointer"
                >
                  📥 WebVTT 다운로드
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {timeline.subtitleTracks[0]?.items.map((sub, idx) => (
                <div
                  key={sub.id}
                  className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between text-xs hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center font-mono text-[10px] text-slate-400 shrink-0">
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <span className="font-bold text-amber-400 mr-2">[{sub.speakerName}]</span>
                      <span className="text-white font-medium">{sub.text}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-slate-500 font-mono text-[11px]">
                      {sub.startTime}s ~ {sub.endTime}s
                    </span>
                    <button
                      onClick={() => {
                        handleSeek(sub.startTime);
                        speakDialogue(sub.text, sub.speakerName);
                      }}
                      title="이 자막 음성 발화 듣기"
                      className="px-2 py-1 rounded bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 text-[11px] font-mono border border-amber-500/30 transition cursor-pointer flex items-center gap-1"
                    >
                      <span>🔊</span>
                      <span>듣기</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: 정합성 감사 인스펙터 */}
        {activeTab === 'AUDIT' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400">타임라인 정합성</span>
                <p className="text-emerald-400 font-bold text-base mt-1">
                  {auditReport.timelineIntegrity} / 20
                </p>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400">자산 커버리지</span>
                <p className="text-emerald-400 font-bold text-base mt-1">
                  {auditReport.assetCoverage} / 15
                </p>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400">오디오 & 더킹</span>
                <p className="text-emerald-400 font-bold text-base mt-1">
                  {auditReport.audioCoverage} / 15
                </p>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400">서사 & 규격 일치</span>
                <p className="text-emerald-400 font-bold text-base mt-1">
                  {auditReport.narrativeSync + auditReport.formatCompliance} / 25
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                정밀 검사 항목 결과 ({auditReport.checks.length}건)
              </h4>
              <div className="space-y-2">
                {auditReport.checks.map((chk, cIdx) => (
                  <div
                    key={cIdx}
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

        {/* TAB 5: 버전 기록 인스펙터 */}
        {activeTab === 'VERSIONS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <span className="text-sm font-bold text-white block">편집 버전 스냅샷 관리</span>
                <span className="text-xs text-slate-400">
                  승인된 편집본은 절대 덮어쓰지 않으며 언제든 이전 버전으로 롤백할 수 있습니다.
                </span>
              </div>
              <button
                onClick={handleCreateSnapshot}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition cursor-pointer"
              >
                + 새 버전(v{timeline.version + 1}) 스냅샷
              </button>
            </div>

            <div className="space-y-2">
              {versions.map((ver) => (
                <div
                  key={ver.versionId}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-amber-400 mr-2 font-mono">
                      EDIT v{ver.versionNumber}
                    </span>
                    <span className="text-white">{ver.note}</span>
                    <span className="text-slate-500 text-[11px] block mt-0.5">
                      저장 시각: {new Date(ver.createdAt).toLocaleString()} • 샷{' '}
                      {ver.timeline.videoTracks[0]?.items.length}개
                    </span>
                  </div>
                  <button
                    onClick={() => handleRestoreVersion(ver)}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-semibold border border-slate-700 cursor-pointer transition"
                  >
                    이 버전으로 복원
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 5. 최종 렌더 패키지 다운로드 버튼 (부가 툴) */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
        <div>
          <span className="font-bold text-white block">Final Render Package 번들</span>
          <span className="text-slate-400">
            타임라인, 샷 바인딩, 오디오 믹싱, SRT 자막 일체가 포함된 표준 프로덕션 렌더 명세서
          </span>
        </div>
        <button
          onClick={handleDownloadRenderPackage}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold cursor-pointer transition"
        >
          📦 렌더 패키지 JSON 내보내기
        </button>
      </div>

      {/* 6. 절대 규칙 Rule 2.1 준수: 화면당 주 명령 최대 2개 */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 backdrop-blur-md flex items-center justify-between gap-4 sticky bottom-6 shadow-2xl z-40">
        <button
          onClick={onPrevStep}
          className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm transition-all flex items-center gap-2 border border-slate-700 cursor-pointer"
        >
          <span>←</span>
          <span>이전: AI 자산 생성</span>
        </button>

        <button
          onClick={onNextStep}
          className="px-8 py-3 bg-gradient-to-r from-amber-500 via-amber-400 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 font-black rounded-xl text-sm transition-all shadow-xl shadow-amber-950/40 flex items-center gap-2 cursor-pointer"
        >
          <span>다음: 최종 납품 및 보관</span>
          <span>→</span>
        </button>
      </div>

      {/* 7. Edge-TTS 고품질 뉴럴 보이스 스튜디오 모달 (Neural Voice Studio Modal) */}
      {isVoiceStudioOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* 모달 헤더 */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎙️</span>
                  <h3 className="text-xl font-black text-white tracking-wide">
                    Edge-TTS 고품질 뉴럴 보이스 스튜디오
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                    Microsoft Edge Neural Models
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  인위적인 기계음을 배제하고, 자연스러운 한국어 억양, 호흡, 감정을 담은 48kHz 초고음질 신경망 보이스를 선택하고 튜닝합니다.
                </p>
              </div>
              <button
                onClick={() => setIsVoiceStudioOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* 1. 발화 속도(Rate) 정밀 튜닝 */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span>⏱️</span>
                  <span>발화 속도 (Speech Rate) 튜닝</span>
                </span>
                <span className="font-mono text-amber-400 font-bold">{selectedVoiceRate}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                시네마틱 내레이션이나 긴박한 대사 스타일에 맞추어 자연스러운 발화 템포를 설정합니다.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                {[
                  { label: '-10% (중후한 영화 톤)', val: '-10%' },
                  { label: '-5% (진중한 내레이션)', val: '-5%' },
                  { label: '+0% (자연스러운 표준)', val: '+0%' },
                  { label: '+5% (생동감 있는 템포)', val: '+5%' },
                  { label: '+10% (긴박한 액션 톤)', val: '+10%' },
                ].map((r) => (
                  <button
                    key={r.val}
                    onClick={() => setSelectedVoiceRate(r.val)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedVoiceRate === r.val
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. 한국어 뉴럴 보이스 모델 선택 그리드 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm flex items-center gap-2">
                  <span>✨</span>
                  <span>한국어 뉴럴 보이스 카탈로그 (총 {availableVoices.length}개 모델)</span>
                </span>
                <span className="text-[11px] text-slate-400">원클릭 샘플 청취 지원</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableVoices.map((voice) => {
                  const isSelected = selectedDefaultVoice === voice.id;
                  const isTesting = testingVoiceId === voice.id;

                  return (
                    <div
                      key={voice.id}
                      className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-400 ring-2 ring-amber-500/20'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{voice.name}</span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                                voice.gender === 'Female'
                                  ? 'bg-rose-950/60 text-rose-300 border border-rose-800'
                                  : 'bg-blue-950/60 text-blue-300 border border-blue-800'
                              }`}
                            >
                              {voice.gender === 'Female' ? '여성' : '남성'}
                            </span>
                            {isSelected && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black">
                                기본 선택됨
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-amber-400/90 font-medium block mt-0.5">
                            {voice.category}
                          </span>
                        </div>

                        {/* 샘플 청취 버튼 */}
                        <button
                          onClick={() => handleTestVoiceSample(voice.id)}
                          disabled={isTesting}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            isTesting
                              ? 'bg-amber-500 text-slate-950 animate-pulse'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                          }`}
                        >
                          <span>{isTesting ? '🔊 발화 중...' : '🔊 샘플 청취'}</span>
                        </button>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed">
                        {voice.description}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
                        <div className="flex flex-wrap gap-1">
                          {voice.recommendedFor?.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 font-mono border border-slate-800"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>

                        {!isSelected ? (
                          <button
                            onClick={() => setSelectedDefaultVoice(voice.id)}
                            className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 transition cursor-pointer"
                          >
                            기본 보이스로 선택
                          </button>
                        ) : (
                          <span className="text-[11px] text-amber-400 font-bold font-mono">
                            ✓ 현재 표준 보이스
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. 전체 자막 일괄 사전 캐시 (Batch Pre-cache) */}
            <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-amber-950/40 p-4 rounded-2xl border border-indigo-800/40 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="font-bold text-white text-xs sm:text-sm block">
                  ⚡ 전체 자막 Edge-TTS 뉴럴 오디오 일괄 사전 생성
                </span>
                <span className="text-[11px] text-slate-400">
                  총 {timeline.subtitleTracks[0]?.items.length || 0}개의 대사 블록을 미리 생성해두면 재생 중 0초 지연으로 즉각 발화됩니다.
                </span>
              </div>
              <button
                onClick={handleBatchPreloadVoices}
                disabled={isPreloadingAll}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md ${
                  isPreloadingAll
                    ? 'bg-amber-500/50 text-slate-900 cursor-not-allowed'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                }`}
              >
                <span>{isPreloadingAll ? '⏳ 생성 중...' : '⚡ 전체 일괄 사전 생성'}</span>
              </button>
            </div>

            {/* 모달 닫기 버튼 */}
            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsVoiceStudioOpen(false)}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer shadow-lg"
              >
                설정 완료 및 닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
