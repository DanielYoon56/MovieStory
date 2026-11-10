/**
 * MOVIESTORY AI — MIQG: CAUSAL LOGIC SERVICE
 *
 * Verifies that the narrative adheres to the core law:
 * BECAUSE -> BUT -> THEREFORE -> SO
 * rather than the weak narrative trap:
 * AND THEN -> AND THEN -> AND THEN
 */

import {
  Project,
  CausalChainReport,
  CausalChainLink,
  QualityIssue,
} from '../../types';

export class CausalLogicService {
  /**
   * Analyze causal transitions and connector health across story and script
   */
  static analyze(project: Project): {
    causalReport: CausalChainReport;
    issues: QualityIssue[];
  } {
    const story = project.currentStory;
    const script = project.currentScript;
    const brokenLinks: string[] = [];
    const issues: QualityIssue[] = [];

    const defaultChain: CausalChainLink[] = [
      {
        step: 'BECAUSE',
        event: story?.storySeed?.disruptiveEvent || '균열 사건 발생으로 주인공의 일상이 무너짐',
        valid: true,
        notes: '발단 사건이 주인공의 행동을 강제합니다.',
      },
      {
        step: 'BUT',
        event:
          story?.storyBible?.centralConflict ||
          story?.plot?.act2 ||
          '외부 세력 혹은 내적 트라우마의 강력한 저항',
        valid: true,
        notes: '예상치 못한 장애물로 인해 단순한 해결이 불가능해집니다.',
      },
      {
        step: 'THEREFORE',
        event:
          story?.storyBible?.climaxChoice?.chosenOption ||
          story?.plot?.climax ||
          '가장 두려워하던 것을 마주하고 내리는 최종 선택',
        valid: true,
        notes: '위기를 돌파하기 위해 주인공이 비가역적 결단을 내립니다.',
      },
      {
        step: 'SO',
        event:
          story?.storyBible?.resolution ||
          story?.plot?.resolution ||
          '새로운 질서의 수립 및 내적 변화 확립',
        valid: true,
        notes: '선택의 대가를 치르고 획득된 정당한 결과입니다.',
      },
    ];

    if (!story) {
      return {
        causalReport: {
          isLinearAndThen: false,
          hasCausalConnectors: true,
          score: 80,
          chain: defaultChain,
          brokenLinks: [],
        },
        issues: [],
      };
    }

    const scenes = script?.scenes || [];
    let causalConnectorsCount = 0;
    let andThenCount = 0;

    // Check script scenes for causal roles and transitions
    scenes.forEach((sc, idx) => {
      const connector = sc.causalConnector || '';
      const text = `${sc.situation} ${sc.action}`;

      if (
        connector.includes('Because') ||
        connector.includes('Therefore') ||
        connector.includes('But') ||
        text.includes('때문에') ||
        text.includes('결국') ||
        text.includes('하지만')
      ) {
        causalConnectorsCount++;
      }

      if (text.includes('그리고 나서') || text.includes('이후에') || text.includes('그 다음에')) {
        andThenCount++;
      }

      // Check if Scene 1 to Scene 2 has causal jump
      if (idx > 0 && !sc.situation && !sc.action) {
        brokenLinks.push(`Scene ${sc.sceneNumber}: 원인 모호`);
      }
    });

    const isLinear = andThenCount > causalConnectorsCount;
    let score = 90;

    if (brokenLinks.length > 0) {
      score -= brokenLinks.length * 10;
      issues.push({
        id: 'causal-broken-links',
        severity: 'WARNING',
        gate: 'NARRATIVE',
        title: '장면 간 인과 단절 감지',
        what: `대본의 일부 장면(${brokenLinks.join(', ')})에서 선행 사건의 결과로 이어지는 필연적 이유가 불명확합니다.`,
        where: 'Step 4 대본 연속성',
        why: '인과가 끊어지면 관객은 장면과 장면 사이에서 집중력을 잃고 이야기가 흩어집니다.',
        how: '직전 장면의 마지막 행동이나 발견이 다음 장면의 시작 동기가 되도록 연결 고리를 추가하십시오.',
        description: '장면 간 Because-Therefore 인과를 명확히 하십시오.',
        relatedStep: 4,
      });
    }

    if (isLinear) {
      score -= 15;
      issues.push({
        id: 'causal-linear-and-then',
        severity: 'WARNING',
        gate: 'NARRATIVE',
        title: 'And-Then 단순 나열 구조 감지',
        what: '장면들이 상호 인과관계 없이 시간적 순서로만 진행되는 비중이 높습니다.',
        where: 'Step 4 씬 연결부',
        why: '스릴러나 드라마에서 단순 나열은 서스펜스를 소멸시키는 주원인입니다.',
        how: '"A가 발생했다. 그러자 B가 일어났다" 대신 "A가 실패했기 때문에, 어쩔 수 없이 B를 감행했다"로 바꾸십시오.',
        description: '사건 간의 당위성을 강화하십시오.',
        relatedStep: 4,
      });
    }

    return {
      causalReport: {
        isLinearAndThen: isLinear,
        hasCausalConnectors: causalConnectorsCount > 0,
        score: Math.max(40, Math.min(100, score)),
        chain: defaultChain,
        brokenLinks,
      },
      issues,
    };
  }
}
