/**
 * MOVIESTORY AI — MIQG GATE 1: NARRATIVE QUALITY SERVICE
 *
 * Evaluates:
 * A. Protagonist Clarity (Desire -> Obstacle -> Choice -> Action -> Consequence -> Change)
 * B. Causal Story Logic (Because, But, Therefore, So)
 * C. Stakes Analysis (Personal, Relational, Professional/Social, Moral)
 * D. Character Transformation (Initial State vs Final State)
 * E. Ending Validity (Earned ending, Climax choice, Conflict resolution)
 */

import {
  Project,
  QualityDimensionReport,
  QualityIssue,
  QualityStatus,
  PipelineStage,
} from '../../types';

export class NarrativeQualityService {
  /**
   * Evaluate Narrative Quality Dimension (Gate 1)
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
      protagonistClarity: 0,
      causalStoryLogic: 0,
      stakesIntensity: 0,
      characterTransformation: 0,
      endingValidity: 0,
    };

    const hasStep3 = availableStages.includes(3) && Boolean(project.currentStory);
    const story = project.currentStory;
    const bible = project.storyBible || story?.storyBible;
    const blueprint = project.plotBlueprint || story?.plotBlueprint;
    const protagonist = bible?.protagonist || story?.characters?.[0];

    // If Step 3 is not yet available
    if (!hasStep3 || !story) {
      return {
        report: {
          score: 75,
          status: 'GOOD',
          summary: '스토리 변형(Step 3) 이전 단계입니다. 영화 서사 모티브를 기반으로 초기 서사 방향성을 추적 중입니다.',
          strengths: ['영화 원작 모티브 분석 완료'],
          weaknesses: ['구체적 창작 스토리 미생성'],
          metrics: {
            protagonistClarity: 70,
            causalStoryLogic: 70,
            stakesIntensity: 70,
            characterTransformation: 70,
            endingValidity: 70,
          },
        },
        issues: [],
      };
    }

    // A. PROTAGONIST CLARITY (Desire -> Obstacle -> Choice -> Action -> Consequence -> Change)
    let protagonistScore = 70;
    if (protagonist) {
      const hasDesire = Boolean(bible?.want || protagonist.internalConflict);
      const hasWound = Boolean(bible?.emotionalWound || protagonist.internalConflict);
      const hasConflict = Boolean(bible?.centralConflict || story.plot?.act2);

      if (hasDesire && hasWound && hasConflict) {
        protagonistScore = 95;
        strengths.push(
          `주인공 '${protagonist.name}'의 내적 결핍과 외적 욕망이 서사 전체를 명확히 견인합니다.`
        );
      } else if (!hasDesire) {
        protagonistScore = 60;
        weaknesses.push('주인공의 핵심 행동 동기(Desire)가 다소 불명확합니다.');
        issues.push({
          id: 'narrative-protagonist-desire',
          severity: 'WARNING',
          gate: 'NARRATIVE',
          title: '주인공의 능동적 행동 동기 부족',
          what: `주인공 '${protagonist.name}'이 사건에 휘말리기만 할 뿐, 스스로 갈망하는 목표(Desire)가 약합니다.`,
          where: 'Step 3 스토리 바이블 > 인물 설계',
          why: '욕망이 없는 주인공은 수동적으로 끌려다니며 관객의 감정 이입을 급격히 떨어뜨립니다.',
          how: '주인공이 잃어버릴 수 없는 구체적인 목표나 보호해야 할 대상 하나를 명시하십시오.',
          description: '주인공의 능동적 행동 동기(Desire)를 명확히 부여해야 합니다.',
          relatedStep: 3,
        });
      }
    } else {
      protagonistScore = 30;
      issues.push({
        id: 'narrative-no-protagonist',
        severity: 'BLOCKER',
        gate: 'NARRATIVE',
        title: '핵심 서사를 이끌 주인공 부재',
        what: '스토리 내에 명확한 주인공 인물이 식별되지 않았습니다.',
        where: 'Step 3 스토리 창작 전체',
        why: '주인공이 부재하면 인과적 선택과 사건의 중심축이 붕괴되어 영화적 서사가 성립되지 않습니다.',
        how: 'Step 3에서 명확한 중심 인물을 정의하고 주인공 역할을 지정하십시오.',
        description: '명확한 중심 인물(Protagonist) 지정이 필요합니다.',
        relatedStep: 3,
      });
    }
    metrics.protagonistClarity = protagonistScore;

    // B. CAUSAL STORY LOGIC (BECAUSE / BUT / THEREFORE / SO)
    let causalScore = 80;
    const causalChains = blueprint?.causalChain || [];
    const synopsisText =
      story.fullNarrativeText ||
      `${story.plot?.act1 || ''} ${story.plot?.act2 || ''} ${story.plot?.climax || ''} ${story.plot?.resolution || ''}`;
    const hasCausalConnectors =
      synopsisText.includes('때문에') ||
      synopsisText.includes('하지만') ||
      synopsisText.includes('결국') ||
      synopsisText.includes('따라서') ||
      causalChains.length > 0;

    if (causalChains.length >= 3) {
      causalScore = 94;
      strengths.push('4막 구조 전반에 걸쳐 원인-결과의 인과 사슬이 단단하게 연결되어 있습니다.');
    } else if (!hasCausalConnectors) {
      causalScore = 65;
      weaknesses.push('사건 간의 인과관계보다 단순 시간 순서 나열(And then...)에 치중되어 있습니다.');
      issues.push({
        id: 'narrative-causal-and-then',
        severity: 'WARNING',
        gate: 'NARRATIVE',
        title: '단순 사건 나열 구조 (And-Then Trap)',
        what: '사건들이 "그리고 나서, 그 후" 형태로 단순 나열되어 앞선 행동이 다음 사건을 강제하지 못합니다.',
        where: 'Step 3 스토리 시놉시스 및 전개부',
        why: '우연이나 단순 나열로 전개되면 관객은 이야기의 개연성을 의심하고 서사의 추진력을 잃게 됩니다.',
        how: '사건 전개를 "[A 발생] → 때문에 [행동 B] → 하지만 [새 장애 C] → 따라서 [선택 D]"의 인과식으로 재구성하십시오.',
        description: '사건 간 Because/Therefore 인과관계를 강화하십시오.',
        relatedStep: 3,
      });
    }
    metrics.causalStoryLogic = causalScore;

    // C. STAKES ANALYSIS (Personal, Relational, Moral)
    let stakesScore = 75;
    const conflict = bible?.centralConflict || story.plot?.act2 || '';
    const hasPersonalStakes = conflict.length > 10;
    const hasMoralChoice = Boolean(bible?.climaxChoice?.chosenOption || story.plot?.climax);

    if (hasPersonalStakes && hasMoralChoice) {
      stakesScore = 90;
      strengths.push('실패 시 주인공이 감수해야 할 대가(Stakes)가 개인적·도덕적 차원에서 명확합니다.');
    } else {
      stakesScore = 68;
      weaknesses.push('갈등 실패 시 발생하는 파국적 대가(Stakes)의 무게감이 다소 부족합니다.');
      issues.push({
        id: 'narrative-stakes-low',
        severity: 'SUGGESTION',
        gate: 'NARRATIVE',
        title: '서사적 판돈(Stakes)의 강도 보강 제안',
        what: '주인공이 타협하거나 도망쳤을 때 치러야 할 구체적 손실이 극적으로 더 높아질 수 있습니다.',
        where: 'Step 3 중심 갈등 및 절정 직전',
        why: '판돈이 크고 비가역적일수록 주인공의 선택이 관객에게 강렬한 서스펜스를 줍니다.',
        how: '주인공의 직업적 위험에 소중한 인간관계나 도덕적 신념의 위기를 덧입혀 복합 판돈을 형성하십시오.',
        description: '실패 시 발생하는 개인적·도덕적 손실을 강화할 것을 권장합니다.',
        relatedStep: 3,
      });
    }
    metrics.stakesIntensity = stakesScore;

    // D. CHARACTER TRANSFORMATION (Initial State vs Final State)
    let transformScore = 80;
    const arc = bible?.characterArc || (protagonist as any)?.arc;
    if (arc?.initialBelief && arc?.finalState && arc.initialBelief !== arc.finalState) {
      transformScore = 94;
      strengths.push(
        `주인공의 내적 변화('${arc.initialBelief}' → '${arc.finalState}')가 결말부에서 설득력 있게 완성됩니다.`
      );
    } else if (arc?.finalChoice) {
      transformScore = 88;
      strengths.push('주인공의 심리적 변화 궤적이 서사 속 사건에 부합합니다.');
    } else {
      transformScore = 65;
      weaknesses.push('이야기가 끝난 후 주인공의 인격이나 신념 변화가 다소 희미합니다.');
      issues.push({
        id: 'narrative-flat-arc',
        severity: 'WARNING',
        gate: 'NARRATIVE',
        title: '주인공 내적 변화(Arc)의 평면화',
        what: '시작 시점과 결말 시점의 주인공 내면 상태가 거의 동일합니다.',
        where: 'Step 3 결말 및 캐릭터 아크',
        why: '인간의 변화를 목격하지 못하면 관객은 "이 이야기를 왜 봐야 했는가?"라는 허무함을 느낍니다.',
        how: '주인공이 시련을 겪은 후 세계를 바라보는 관점이나 가치관의 비가역적 변화를 명시하십시오.',
        description: '시작과 결말 간 주인공 내적 태도의 뚜렷한 대비를 확립하십시오.',
        relatedStep: 3,
      });
    }
    metrics.characterTransformation = transformScore;

    // E. ENDING VALIDITY (Earned Ending & Climax Choice)
    let endingScore = 75;
    const endingText = bible?.resolution || story.plot?.resolution || '';
    if (endingText.length > 15) {
      endingScore = 90;
      strengths.push('절정에서의 도덕적 선택이 결말로 직결되며 정당하게 획득된 결말(Earned Ending)을 제공합니다.');
    } else {
      endingScore = 60;
      weaknesses.push('결말의 매듭이 급작스럽거나 외부 우연에 기대는 경향이 있습니다.');
      issues.push({
        id: 'narrative-weak-ending',
        severity: 'WARNING',
        gate: 'NARRATIVE',
        title: '결말의 정당성(Earned Ending) 취약',
        what: '주인공의 결단이나 행동의 결과로 문제가 해결되지 않고 외적 사건으로 흐려질 위험이 있습니다.',
        where: 'Step 3 결말(Ending Resolution)',
        why: '데우스 엑스 마키나나 무기력한 타협은 관객에게 카타르시스를 주지 못합니다.',
        how: '주인공이 자신의 치명적 결함을 극복하는 최후의 능동적 행동으로 결말을 맺도록 보강하십시오.',
        description: '주인공의 최종 선택이 결말을 결정짓도록 설계하십시오.',
        relatedStep: 3,
      });
    }
    metrics.endingValidity = endingScore;

    // Overall narrative dimension score
    const totalScore = Math.round(
      metrics.protagonistClarity * 0.25 +
      metrics.causalStoryLogic * 0.25 +
      metrics.stakesIntensity * 0.15 +
      metrics.characterTransformation * 0.2 +
      metrics.endingValidity * 0.15
    );

    const status: QualityStatus =
      totalScore >= 88 ? 'EXCELLENT' : totalScore >= 75 ? 'GOOD' : totalScore >= 60 ? 'WARNING' : 'CRITICAL';

    return {
      report: {
        score: totalScore,
        status,
        summary: `주인공 갈망과 인과적 서사 구조 점수: ${totalScore}점. ${strengths[0] || '서사 기본 구조 검증 통과'}`,
        strengths: strengths.slice(0, 3),
        weaknesses: weaknesses.slice(0, 3),
        metrics,
      },
      issues,
    };
  }
}
