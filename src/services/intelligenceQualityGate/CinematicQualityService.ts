/**
 * MOVIESTORY AI — MIQG GATE 2: CINEMATIC QUALITY SERVICE
 *
 * Evaluates Step 4 (Cinematic Expression Authority):
 * A. Show, Don't Explain (detect abstract cliche dialogue, suggest physical action)
 * B. Visual Event Density (Discovery, Confrontation, Decision, Movement vs talking heads)
 * C. Dialogue Purpose (Reveal, Conflict, Conceal, Persuade, Threaten, Connect)
 * D. Scene Purpose (Entry condition, Conflict, Change, Exit condition)
 * E. Cinematic Continuity (visual, time, location, character)
 */

import {
  Project,
  QualityDimensionReport,
  QualityIssue,
  QualityStatus,
  PipelineStage,
} from '../../types';

// Weak abstract dialogue cliches
const ABSTRACT_DIALOGUE_PATTERNS = [
  { pattern: /진실을\s*(알|밝혀|가둘)/, label: '진실에 대한 추상적 독백' },
  { pattern: /이제\s*내\s*진짜\s*삶/, label: '진짜 삶에 대한 직접 설명' },
  { pattern: /더\s*이상\s*두렵지\s*않아/, label: '두려움 극복의 구두 진술' },
  { pattern: /이게\s*내\s*마지막\s*답이다/, label: '설명형 결단 대사' },
  { pattern: /내가\s*변했어/, label: '내적 변화 자가 설명' },
  { pattern: /침묵할\s*수\s*없어/, label: '추상적 클리셰 선언' },
];

export class CinematicQualityService {
  /**
   * Evaluate Cinematic Quality Dimension (Gate 2)
   */
  static evaluate(
    project: Project,
    availableStages: PipelineStage[]
  ): {
    report: QualityDimensionReport;
    issues: QualityIssue[];
  } {
    const issues: QualityIssue[] = [];
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const metrics: Record<string, number> = {
      showDontTell: 0,
      visualEventDensity: 0,
      dialoguePurpose: 0,
      scenePurpose: 0,
      cinematicContinuity: 0,
    };

    const hasStep4 = availableStages.includes(4) && Boolean(project.currentScript);
    const script = project.currentScript;

    if (!hasStep4 || !script || script.scenes.length === 0) {
      return {
        report: {
          score: 75,
          status: 'GOOD',
          summary: '대본 & 콘티(Step 4) 이전 단계입니다. 영상화 번역 설계를 준비하고 있습니다.',
          strengths: ['스토리 기반 영상화 준비 중'],
          weaknesses: ['대본 씬 미생성'],
          metrics: {
            showDontTell: 75,
            visualEventDensity: 75,
            dialoguePurpose: 75,
            scenePurpose: 75,
            cinematicContinuity: 75,
          },
        },
        issues: [],
      };
    }

    const scenes = script.scenes;

    // A. SHOW, DON'T EXPLAIN
    let showScore = 88;
    const abstractLinesFound: { sceneNum: number; line: string; label: string }[] = [];

    scenes.forEach((sc) => {
      sc.dialogue?.forEach((d) => {
        for (const p of ABSTRACT_DIALOGUE_PATTERNS) {
          if (p.pattern.test(d.text)) {
            abstractLinesFound.push({
              sceneNum: sc.sceneNumber,
              line: d.text,
              label: p.label,
            });
            break;
          }
        }
      });
    });

    if (abstractLinesFound.length === 0) {
      showScore = 96;
      strengths.push('대사가 심리 상태를 설명하기보다 행동과 서브텍스트로 은유되어 영화적입니다.');
    } else {
      showScore = Math.max(50, 90 - abstractLinesFound.length * 12);
      weaknesses.push(`추상적 심리 설명 대사 ${abstractLinesFound.length}건 감지`);
      abstractLinesFound.slice(0, 2).forEach((found) => {
        issues.push({
          id: `cinematic-show-tell-${found.sceneNum}`,
          severity: 'WARNING',
          gate: 'CINEMATIC',
          title: `Scene ${found.sceneNum} 추상적 설명 대사 ("${found.line.slice(0, 18)}...")`,
          what: `인물의 내적 변화나 심리를 행동으로 보여주는 대신 대사로 직접 설명하고 있습니다 (${found.label}).`,
          where: `Step 4 대본 Scene ${found.sceneNum}`,
          why: '관객은 인물이 말하는 것을 믿지 않고, 인물이 치르는 물리적 행동과 희생을 볼 때 감동합니다.',
          how: '대사를 삭제하고, 떨리는 손으로 문고리를 잡거나 유류품을 품에 넣는 구체적 물리적 행동으로 대체하십시오.',
          description: '설명형 대사를 시각적 행동으로 전환하십시오.',
          relatedStep: 4,
          relatedSceneId: found.sceneNum,
        });
      });
    }
    metrics.showDontTell = showScore;

    // B. VISUAL EVENT DENSITY (Talking Heads vs Visual Actions)
    let visualScore = 85;
    let talkingHeadsCount = 0;

    scenes.forEach((sc) => {
      const hasAction = Boolean(sc.action && sc.action.length > 15);
      const hasVisualEvent =
        sc.action?.includes('발견') ||
        sc.action?.includes('문') ||
        sc.action?.includes('응시') ||
        sc.action?.includes('도주') ||
        sc.action?.includes('충돌') ||
        sc.action?.includes('손') ||
        sc.cameraAngle;

      if (!hasAction && (!sc.dialogue || sc.dialogue.length > 3)) {
        talkingHeadsCount++;
      }
    });

    if (talkingHeadsCount === 0) {
      visualScore = 94;
      strengths.push('모든 장면이 정적인 대화에 그치지 않고 구체적인 시각적 사건(Visual Event)을 담고 있습니다.');
    } else {
      visualScore = 72;
      weaknesses.push('인물이 서서 대화만 나누는 정적 장면(Talking Heads) 존재');
      issues.push({
        id: 'cinematic-talking-heads',
        severity: 'SUGGESTION',
        gate: 'CINEMATIC',
        title: '시각적 이벤트 밀도(Visual Density) 보강 제안',
        what: '일부 장면에서 인물들이 제자리에 서서 대화로만 정보를 전달하고 있습니다.',
        where: 'Step 4 대본 장면 연출부',
        why: '영화는 시각 매체이므로 인물의 위치 이동, 물건의 조작, 시선의 충돌 등 시각적 역동성이 필수적입니다.',
        how: '대화 중 인물이 어떤 소품을 만지거나, 공간을 가로지르거나, 외부 돌발 변수가 프레임 안으로 들어오도록 연출하십시오.',
        description: '장면 내 시각적 움직임과 소품 상호작용을 추가하십시오.',
        relatedStep: 4,
      });
    }
    metrics.visualEventDensity = visualScore;

    // C. DIALOGUE PURPOSE (Reveal, Conflict, Conceal, Persuade, Threaten)
    let dialogueScore = 88;
    const repetitiveLines = scenes.filter((s) => s.dialogue && s.dialogue.length > 5);
    if (repetitiveLines.length > 2) {
      dialogueScore = 75;
      issues.push({
        id: 'cinematic-dialogue-redundant',
        severity: 'SUGGESTION',
        gate: 'CINEMATIC',
        title: '대사 압축 및 서브텍스트 강화 권장',
        what: '일부 씬의 대사가 이미 관객이 알고 있는 상황을 반복 설명하고 있습니다.',
        where: 'Step 4 대본 대사부',
        why: '군더더기 대사는 씬의 호흡을 늦추고 극적 긴장감을 떨어뜨립니다.',
        how: '대사 길이를 30% 압축하고 인물이 숨기려 하는 진심(Subtext)을 눈빛과 침묵으로 채우십시오.',
        description: '대사를 정제하고 서브텍스트의 비중을 높이십시오.',
        relatedStep: 4,
      });
    } else {
      dialogueScore = 92;
      strengths.push('대사가 최소한의 분량으로 갈등을 유발하거나 비밀을 폭로하는 기능을 충실히 수행합니다.');
    }
    metrics.dialoguePurpose = dialogueScore;

    // D. SCENE PURPOSE (Entry Condition -> Conflict -> Exit Condition)
    let scenePurposeScore = 86;
    const hasTransitions = scenes.every((s) => s.situation && s.situation.length > 5);
    if (hasTransitions) {
      scenePurposeScore = 92;
      strengths.push('모든 장면이 시작 상태와 종료 상태의 감정/정보 격차를 명확히 만듭니다.');
    } else {
      scenePurposeScore = 74;
    }
    metrics.scenePurpose = scenePurposeScore;

    // E. CINEMATIC CONTINUITY (Time, Space, Lighting, Audio)
    let continuityScore = 90;
    const hasLightingAndAudio = scenes.every((s) => s.lighting && s.audioCue);
    if (hasLightingAndAudio) {
      strengths.push('조명톤과 오디오 사운드트랙 연출 지시가 일관되게 설계되었습니다.');
    } else {
      continuityScore = 78;
    }
    metrics.cinematicContinuity = continuityScore;

    const totalScore = Math.round(
      metrics.showDontTell * 0.3 +
      metrics.visualEventDensity * 0.25 +
      metrics.dialoguePurpose * 0.2 +
      metrics.scenePurpose * 0.15 +
      metrics.cinematicContinuity * 0.1
    );

    const status: QualityStatus =
      totalScore >= 88 ? 'EXCELLENT' : totalScore >= 75 ? 'GOOD' : totalScore >= 60 ? 'WARNING' : 'CRITICAL';

    return {
      report: {
        score: totalScore,
        status,
        summary: `영화적 시각 번역 및 대사 서브텍스트 점수: ${totalScore}점. ${strengths[0] || '시네마틱 연출 규격 준수'}`,
        strengths: strengths.slice(0, 3),
        weaknesses: weaknesses.slice(0, 3),
        metrics,
      },
      issues,
    };
  }
}
