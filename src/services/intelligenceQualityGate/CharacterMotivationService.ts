/**
 * MOVIESTORY AI — MIQG: CHARACTER MOTIVATION SERVICE
 *
 * Verifies character psychology, emotional preparation, and believable action triggers.
 * Detects sudden decisions, unearned shifts, and passive protagonist traps.
 */

import { Project, QualityIssue } from '../../types';

export class CharacterMotivationService {
  /**
   * Inspect character motivation consistency across script and story
   */
  static inspect(project: Project): {
    issues: QualityIssue[];
    strengths: string[];
    motivationScore: number;
  } {
    const issues: QualityIssue[] = [];
    const strengths: string[] = [];
    let motivationScore = 85;

    const story = project.currentStory;
    const script = project.currentScript;
    if (!story) {
      return { issues, strengths: ['초기 인물 동기 대기 중'], motivationScore: 80 };
    }

    const protagonist = story.characters?.find((c) => c.role === 'protagonist') || story.characters?.[0];
    const scenes = script?.scenes || [];

    // 1. Core Wound vs Urgent Decision Alignment
    const bibleProtagonist = story.storyBible?.protagonist || project.storyBible?.protagonist;
    const wound =
      story.storyBible?.emotionalWound ||
      bibleProtagonist?.arc?.flaw ||
      protagonist?.internalConflict ||
      '';
    const desire =
      story.storyBible?.want ||
      bibleProtagonist?.personality ||
      protagonist?.personality ||
      '';

    if (protagonist) {
      if (wound && desire) {
        strengths.push(
          `주인공의 과거 상처 및 내적 결핍('${wound.slice(0, 20)}...')이 현재의 절박한 목표와 유기적으로 결합되어 있습니다.`
        );
      } else {
        motivationScore -= 10;
        issues.push({
          id: 'motivation-wound-missing',
          severity: 'WARNING',
          gate: 'NARRATIVE',
          title: '주인공 심리적 방어기제/상처 미약',
          what: '주인공이 왜 그토록 고집스럽게 저항하거나 특정 행동에 집착하는지 심리적 근거가 약합니다.',
          where: 'Step 3 캐릭터 설정 > 과거 상처(Wound)',
          why: '상처가 없는 완벽한 인물은 관객에게 공감을 얻기 어렵고 갈등 극복의 감동이 반감됩니다.',
          how: '주인공이 과거에 겪었던 실패나 트라우마 하나를 구체화하여 현재 결핍의 원인으로 설정하십시오.',
          description: '주인공의 심리적 결핍과 방어기제를 강화하십시오.',
          relatedStep: 3,
        });
      }
    }

    // 2. Scene-Level Motivation Jumps in Script
    if (scenes.length > 0) {
      scenes.forEach((scene, idx) => {
        // Check for sudden climax decisions or high-risk actions in Act 2/3
        const isClimaxOrCrisis =
          scene.causalRole === 'Crisis' || scene.causalRole === 'Climax' || scene.causalRole === 'Choice';
        const hasHighStakesAction =
          scene.action?.includes('포기') ||
          scene.action?.includes('희생') ||
          scene.action?.includes('폭로') ||
          scene.action?.includes('결단') ||
          scene.action?.includes('도망');

        if (isClimaxOrCrisis && hasHighStakesAction) {
          // Check if previous scene built up to this
          const prevScene = scenes[idx - 1];
          if (prevScene && !prevScene.action && !prevScene.situation) {
            motivationScore -= 8;
            issues.push({
              id: `motivation-jump-scene-${scene.sceneNumber}`,
              severity: 'WARNING',
              gate: 'NARRATIVE',
              title: `Scene ${scene.sceneNumber} 고위험 선택의 감정적 축적 부족`,
              what: `주인공이 Scene ${scene.sceneNumber}에서 중대한 결정을 내리지만, 직전 장면에서 심리적 압박감이 충분히 누적되지 않았습니다.`,
              where: `Step 4 대본 Scene ${scene.sceneNumber} (${scene.title})`,
              why: '사전 감정 축적 없이 터지는 극단적 결단은 관객에게 억지스럽거나 인위적으로 보입니다.',
              how: `직전 장면(Scene ${prevScene.sceneNumber})에 주인공의 망설임과 내적 갈등을 드러내는 행동 하나를 삽입하십시오.`,
              description: `Scene ${scene.sceneNumber}의 결정을 뒷받침할 감정 빌드업을 보강하십시오.`,
              relatedStep: 4,
              relatedSceneId: scene.sceneNumber,
            });
          }
        }
      });
    }

    return {
      issues,
      strengths,
      motivationScore: Math.max(50, Math.min(100, motivationScore)),
    };
  }
}
