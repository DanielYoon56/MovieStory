/**
 * MOVIESTORY AI — EDGETTS HIGH-FIDELITY NEURAL AUDIO SERVICE
 *
 * Provides studio-quality Microsoft Edge Neural TTS audio generation,
 * caching, character voice persona mapping, and synchronized audio playback.
 */

export interface NeuralVoiceModel {
  id: string;
  name: string;
  gender: 'Female' | 'Male';
  category: string;
  description: string;
  recommendedFor: string[];
  defaultRate: string;
  defaultPitch: string;
}

export interface SpeechGenerateResult {
  success: boolean;
  audioUrl: string;
  duration: number;
  voice: string;
  text: string;
  cached: boolean;
}

export interface CharacterVoiceConfig {
  characterName: string;
  voiceId: string;
  rate: string;
  pitch: string;
}

export const FALLBACK_NEURAL_VOICES: NeuralVoiceModel[] = [
  {
    id: 'ko-KR-SunHiNeural',
    name: '선히 (Sun-Hi)',
    gender: 'Female',
    category: '여성 주연 / 감성 내레이션',
    description: '자연스러운 억양과 감정 호흡, 가장 널리 쓰이는 표준 한국어 여성 뉴럴 보이스',
    recommendedFor: ['여성 주연', '감성 멜로', '해설', '일상'],
    defaultRate: '+0%',
    defaultPitch: '+0Hz',
  },
  {
    id: 'ko-KR-InJoonNeural',
    name: '인준 (In-Joon)',
    gender: 'Male',
    category: '남성 주연 / 신뢰감 있는 내레이션',
    description: '따뜻하고 신뢰감 있는 톤의 표준 한국어 남성 뉴럴 보이스',
    recommendedFor: ['남성 주연', '드라마', '다큐멘터리', '안내'],
    defaultRate: '+0%',
    defaultPitch: '+0Hz',
  },
  {
    id: 'ko-KR-HyunsuNeural',
    name: '현수 (Hyun-Su)',
    gender: 'Male',
    category: '시네마틱 / 다큐멘터리 내레이터',
    description: '중후하고 진중한 톤으로 영화 예고편, 스릴러, 다큐멘터리에 최적화',
    recommendedFor: ['영화 내레이터', '스릴러', '역사극', '예고편'],
    defaultRate: '-3%',
    defaultPitch: '-2Hz',
  },
  {
    id: 'ko-KR-BongJinNeural',
    name: '봉진 (Bong-Jin)',
    gender: 'Male',
    category: '개성파 / 액션 / 거친 톤',
    description: '에너제틱하고 카리스마 있는 남성 캐릭터 및 액션 장면에 적합',
    recommendedFor: ['액션', '형사/악역', '개성 강한 인물'],
    defaultRate: '+2%',
    defaultPitch: '+0Hz',
  },
  {
    id: 'ko-KR-JiMinNeural',
    name: '지민 (Ji-Min)',
    gender: 'Female',
    category: '발랄한 20대 / 로맨틱 코미디',
    description: '생기 있고 밝은 톤으로 청춘물, 코미디, 통통 튀는 캐릭터에 적합',
    recommendedFor: ['청춘물', '로맨틱 코미디', '밝은 여성'],
    defaultRate: '+3%',
    defaultPitch: '+2Hz',
  },
  {
    id: 'ko-KR-SeoHyeonNeural',
    name: '서현 (Seo-Hyeon)',
    gender: 'Female',
    category: '차분하고 지적인 여성',
    description: '차분하고 지적인 어조로 전문직, 내면 독백, 미스터리에 최적화',
    recommendedFor: ['전문직', '미스터리', '독백', '지적 캐릭터'],
    defaultRate: '-2%',
    defaultPitch: '+0Hz',
  },
  {
    id: 'ko-KR-SoonBokNeural',
    name: '순복 (Soon-Bok)',
    gender: 'Female',
    category: '연륜 있는 어르신 / 어머니',
    description: '따뜻한 연륜과 정감이 느껴지는 중년/노년 여성 보이스',
    recommendedFor: ['어머니/할머니', '가족극', '회상'],
    defaultRate: '-4%',
    defaultPitch: '-2Hz',
  },
  {
    id: 'ko-KR-GookMinNeural',
    name: '국민 (Gook-Min)',
    gender: 'Male',
    category: '뉴스 앵커 / 방송 보이스',
    description: '정확하고 명료한 아나운서/앵커 톤',
    recommendedFor: ['뉴스 앵커', '기자', '긴급 방송'],
    defaultRate: '+0%',
    defaultPitch: '+0Hz',
  },
];

class EdgeTtsAudioEngine {
  private currentAudio: HTMLAudioElement | null = null;
  private audioCache = new Map<string, SpeechGenerateResult>();
  private preloadedElements = new Map<string, HTMLAudioElement>();

  /**
   * 화자 이름에 기반한 최적의 EdgeTTS 뉴럴 보이스 추천
   */
  public getRecommendedVoice(speakerName?: string): string {
    if (!speakerName) return 'ko-KR-SunHiNeural';
    const s = speakerName.toLowerCase();
    if (s.includes('해설') || s.includes('내레이') || s.includes('나레이') || s.includes('감독')) {
      return 'ko-KR-HyunsuNeural';
    }
    if (
      s.includes('여') ||
      s.includes('수연') ||
      s.includes('지은') ||
      s.includes('소희') ||
      s.includes('어머니') ||
      s.includes('소녀') ||
      s.includes('혜진') ||
      s.includes('유나')
    ) {
      return 'ko-KR-SunHiNeural';
    }
    if (s.includes('형사') || s.includes('악역') || s.includes('괴물') || s.includes('괴한') || s.includes('보스')) {
      return 'ko-KR-BongJinNeural';
    }
    return 'ko-KR-InJoonNeural';
  }

  /**
   * 고품질 EdgeTTS 뉴럴 오디오 생성 및 캐시 요청
   */
  public async generateSpeech(params: {
    text: string;
    voice?: string;
    rate?: string;
    pitch?: string;
    speakerName?: string;
  }): Promise<SpeechGenerateResult> {
    const targetVoice = params.voice || this.getRecommendedVoice(params.speakerName);
    const targetRate = params.rate || '+0%';
    const targetPitch = params.pitch || '+0Hz';
    const cacheKey = `${targetVoice}_${targetRate}_${targetPitch}_${params.text.trim()}`;

    if (this.audioCache.has(cacheKey)) {
      return this.audioCache.get(cacheKey)!;
    }

    try {
      const response = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: params.text,
          voice: targetVoice,
          rate: targetRate,
          pitch: targetPitch,
          speakerName: params.speakerName,
        }),
      });

      if (!response.ok) {
        throw new Error(`EdgeTTS HTTP ${response.status}`);
      }

      const data: SpeechGenerateResult = await response.json();
      this.audioCache.set(cacheKey, data);

      // 브라우저 Audio 객체 사전 로드
      if (typeof window !== 'undefined' && data.audioUrl) {
        const audio = new Audio();
        audio.preload = 'auto';
        audio.src = data.audioUrl;
        this.preloadedElements.set(data.audioUrl, audio);
      }

      return data;
    } catch (err) {
      console.warn('[EdgeTtsAudioService] Failed to generate server neural audio, using fallback:', err);
      // Fallback 구조체 반환
      return {
        success: false,
        audioUrl: '',
        duration: Math.max(2, Number((params.text.length * 0.18).toFixed(1))),
        voice: targetVoice,
        text: params.text,
        cached: false,
      };
    }
  }

  /**
   * 프로젝트 내 전체 자막 일괄 사전 캐시
   */
  public async batchPreload(
    items: Array<{ id: string; text: string; speakerName?: string; voice?: string; rate?: string }>
  ): Promise<Record<string, { audioUrl: string; duration: number }>> {
    if (items.length === 0) return {};
    try {
      const response = await fetch('/api/tts/batch-preload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      if (response.ok) {
        const data = await response.json();
        return data.results || {};
      }
    } catch (err) {
      console.warn('[EdgeTtsAudioService] Batch preload network error:', err);
    }
    return {};
  }

  /**
   * 실시간 고음질 재생 (HTML5 Audio + Web Speech API 하이브리드)
   */
  public async playVoice(params: {
    text: string;
    speakerName?: string;
    voice?: string;
    rate?: string;
    pitch?: string;
    volume?: number; // 0 to 1
    onStart?: (info: { speaker: string; voice: string }) => void;
    onEnd?: () => void;
    onError?: (error: any) => void;
  }): Promise<void> {
    this.stopVoice();

    const voice = params.voice || this.getRecommendedVoice(params.speakerName);
    const volume = params.volume !== undefined ? Math.max(0, Math.min(1, params.volume)) : 1.0;

    // 1. 서버 EdgeTTS 생성 및 재생 시도
    try {
      const speechData = await this.generateSpeech({
        text: params.text,
        speakerName: params.speakerName,
        voice,
        rate: params.rate,
        pitch: params.pitch,
      });

      if (speechData.audioUrl) {
        const audio = new Audio(speechData.audioUrl);
        audio.volume = volume;
        this.currentAudio = audio;

        audio.onplay = () => {
          params.onStart?.({ speaker: params.speakerName || '화자', voice });
        };
        audio.onended = () => {
          this.currentAudio = null;
          params.onEnd?.();
        };
        audio.onerror = (e) => {
          console.warn('[EdgeTTS Audio Play Error] Fallback to SpeechSynthesis', e);
          this.fallbackSpeechSynthesis(params, voice, volume);
        };

        await audio.play();
        return;
      }
    } catch {
      // 서버 호출 실패 시 브라우저 SpeechSynthesis로 폴백
    }

    // 2. 브라우저 SpeechSynthesis 폴백 (자연스러운 억양 세팅)
    this.fallbackSpeechSynthesis(params, voice, volume);
  }

  private fallbackSpeechSynthesis(
    params: {
      text: string;
      speakerName?: string;
      onStart?: (info: { speaker: string; voice: string }) => void;
      onEnd?: () => void;
      onError?: (error: any) => void;
    },
    voiceId: string,
    volume: number
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      params.onEnd?.();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(params.text);
      utterance.lang = 'ko-KR';

      const voices = window.speechSynthesis.getVoices();
      // 가장 자연스러운 한국어 온라인 뉴럴 보이스 우선 선택 (eSpeak/로봇 보이스 배제)
      const bestVoice =
        voices.find(
          (v) =>
            v.lang.startsWith('ko') &&
            (v.name.includes('Natural') ||
              v.name.includes('Online') ||
              v.name.includes('Google') ||
              v.name.includes('Neural'))
        ) ||
        voices.find((v) => v.lang.startsWith('ko')) ||
        null;

      if (bestVoice) {
        utterance.voice = bestVoice;
      }

      // 인위적 피치 왜곡을 제거하여 자연스러운 톤 유지 (1.0 기준)
      utterance.pitch = 1.0;
      utterance.rate = 1.0;
      utterance.volume = volume;

      utterance.onstart = () => {
        params.onStart?.({
          speaker: params.speakerName || '화자',
          voice: bestVoice ? bestVoice.name : voiceId,
        });
      };
      utterance.onend = () => {
        params.onEnd?.();
      };
      utterance.onerror = (err) => {
        params.onError?.(err);
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      params.onError?.(e);
    }
  }

  /**
   * 현재 발화 중인 오디오 즉시 중지
   */
  public stopVoice(): void {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {}
      this.currentAudio = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  }
}

export const EdgeTtsService = new EdgeTtsAudioEngine();
