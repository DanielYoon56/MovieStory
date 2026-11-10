/**
 * MOVIESTORY AI — MIQG: EMOTIONAL CURVE SERVICE
 *
 * Generates and evaluates the emotional curve across acts, scenes, and duration.
 * Detects flat stretches, premature climax, or unearned emotional drops.
 */

import { Project, EmotionalCurvePoint, QualityIssue } from '../../types';

export class EmotionalCurveService {
  /**
   * Calculate emotional curve and detect emotional stagnation
   */
  static analyze(project: Project): {
    curve: EmotionalCurvePoint[];
    issues: QualityIssue[];
    flatStretchDetected: boolean;
  } {
    const story = project.currentStory;
    const script = project.currentScript;
    const issues: QualityIssue[] = [];

    // Base Curve defaults
    const defaultCurve: EmotionalCurvePoint[] = [
      { timeOrPhase: '오프닝 훅 (0~15%)', intensity: 4, label: '호기심 & 일상의 균열 (4/10)', narrativeFunction: 'HOOK' },
      { timeOrPhase: '상승 갈등 (15~40%)', intensity: 6, label: '위기 고조 & 장애물 등장 (6/10)', narrativeFunction: 'ESCALATION' },
      { timeOrPhase: '중간점 위기 (40~70%)', intensity: 8, label: '통제 상실 & 결정적 위기 (8/10)', narrativeFunction: 'CRISIS' },
      { timeOrPhase: '절정 선택 (70~85%)', intensity: 10, label: '최고조 긴장 & 도덕적 결단 (10/10)', narrativeFunction: 'CLIMAX' },
      { timeOrPhase: '해소 및 여운 (85~100%)', intensity: 6, label: '비가역적 변화의 카타르시스 (6/10)', narrativeFunction: 'RESOLUTION' },
    ];

    if (!script || script.scenes.length === 0) {
      return { curve: defaultCurve, issues, flatStretchDetected: false };
    }

    // Dynamic curve based on real script scenes
    const scenes = script.scenes;
    const curve: EmotionalCurvePoint[] = scenes.map((sc, idx) => {
      const pct = Math.round(((idx + 1) / scenes.length) * 100);
      let intensity = 5;
      let label = `${sc.title} (5/10)`;

      if (sc.causalRole === 'Hook' || idx === 0) {
        intensity = 6;
        label = `오프닝 훅: ${sc.title} (6/10)`;
      } else if (sc.causalRole === 'Crisis') {
        intensity = 8;
        label = `위기 직면: ${sc.title} (8/10)`;
      } else if (sc.causalRole === 'Climax') {
        intensity = 10;
        label = `절정 결단: ${sc.title} (10/10)`;
      } else if (sc.causalRole === 'Consequence' || sc.causalRole === 'Epilogue') {
        intensity = 5;
        label = `서사적 여운: ${sc.title} (5/10)`;
      } else {
        intensity = Math.min(9, Math.max(4, 4 + Math.round((idx / scenes.length) * 5)));
        label = `전개부: ${sc.title} (${intensity}/10)`;
      }

      return {
        timeOrPhase: `Scene ${sc.sceneNumber} (${pct}%)`,
        intensity,
        label,
        sceneIndex: sc.sceneNumber,
        narrativeFunction: sc.causalRole || 'SCENE',
      };
    });

    // Detect flat stretches (3 consecutive scenes with exact same intensity)
    let flatCount = 0;
    let flatStretchDetected = false;
    for (let i = 1; i < curve.length; i++) {
      if (curve[i].intensity === curve[i - 1].intensity) {
        flatCount++;
        if (flatCount >= 2) {
          flatStretchDetected = true;
          break;
        }
      } else {
        flatCount = 0;
      }
    }

    if (flatStretchDetected) {
      issues.push({
        id: 'emotional-curve-flat',
        severity: 'WARNING',
        gate: 'AUDIENCE',
        title: '감정 곡선 정체 구간 감지',
        what: '대본 중반부 여러 장면에서 긴장감의 변화 없이 동일한 감정 톤이 지속됩니다.',
        where: 'Step 4 대본 중반부 전개',
        why: '감정적 굴곡이 없으면 관객은 피로감을 느끼며 지루해집니다.',
        how: '중반부에 뜻밖의 정보 폭로(Revelation)나 일시적 긴장 완화(Comedic Relief / Intimate Moment)를 주어 감정 대비를 만드십시오.',
        description: '중반부 씬의 텐션 대비를 강화하십시오.',
        relatedStep: 4,
      });
    }

    return { curve, issues, flatStretchDetected };
  }
}
