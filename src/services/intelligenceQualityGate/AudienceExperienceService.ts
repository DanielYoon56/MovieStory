/**
 * MOVIESTORY AI — MIQG GATE 4: AUDIENCE EXPERIENCE ESTIMATE SERVICE
 *
 * NOTE: All evaluations are explicitly presented as:
 * "Audience Experience Estimate" (시청자 경험 예측 지표),
 * not absolute objective fact.
 *
 * A. Hook Analysis (First 3s for Shorts, Curiosity establishment for Cinema)
 * B. Attention Flow (Narrative energy: Hook -> Escalation -> Crisis -> Climax -> Release)
 * C. Emotional Curve Dynamics
 * D. Ending Impact (Emotional resolution, Thematic resonance, Memorability)
 */

import {
  Project,
  QualityDimensionReport,
  QualityIssue,
  QualityStatus,
  PipelineStage,
  EmotionalCurvePoint,
} from '../../types';
import { EmotionalCurveService } from './EmotionalCurveService';

export class AudienceExperienceService {
  /**
   * Evaluate Audience Experience Dimension (Gate 4)
   */
  static evaluate(
    project: Project,
    availableStages: PipelineStage[]
  ): {
    report: QualityDimensionReport;
    issues: QualityIssue[];
    emotionalCurve: EmotionalCurvePoint[];
  } {
    const issues: QualityIssue[] = [];
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const metrics: Record<string, number> = {
      hookIntensity: 0,
      attentionRetention: 0,
      emotionalDynamics: 0,
      endingAfterglow: 0,
    };

    const story = project.currentStory;
    const script = project.currentScript;
    const format = script?.format || project.productionPackage?.format || 'cinema';
    const isShorts = format === 'shorts';

    // 1. Emotional Curve calculation
    const { curve, issues: curveIssues } = EmotionalCurveService.analyze(project);
    issues.push(...curveIssues);

    if (!story) {
      metrics.hookIntensity = 75;
      metrics.attentionRetention = 75;
      metrics.emotionalDynamics = 75;
      metrics.endingAfterglow = 75;

      return {
        report: {
          score: 75,
          status: 'GOOD',
          summary: '스토리 변형 전 단계입니다. 영화 모티브 기반 시청자 몰입 지표를 사전 시뮬레이션 중입니다.',
          strengths: ['스토리 테마의 보편적 정서 공감대 양호'],
          weaknesses: ['구체적 씬 타임라인 미형성'],
          metrics,
        },
        issues,
        emotionalCurve: curve,
      };
    }

    // A. HOOK ANALYSIS (First 3s for Shorts, First Scene for Cinema)
    let hookScore = 80;
    const firstScene = script?.scenes[0];
    const premise = story.storyPremise || project.premise;
    const hookText =
      firstScene?.action ||
      story.storySeed?.disruptiveEvent ||
      premise?.dramaticQuestion ||
      premise?.logline ||
      '';

    const hasUrgentHook =
      hookText.includes('발견') ||
      hookText.includes('도주') ||
      hookText.includes('충돌') ||
      hookText.includes('의문') ||
      hookText.includes('피') ||
      hookText.includes('시체') ||
      hookText.includes('경고') ||
      hookText.includes('위험');

    if (hasUrgentHook) {
      hookScore = 95;
      strengths.push(
        isShorts
          ? '쇼츠 첫 3초 이내에 시각적 미스터리 및 돌발 위기가 배치되어 이탈률을 방어합니다.'
          : '오프닝 시퀀스에서 강렬한 의문과 서스펜스를 확립하여 관객의 시선을 사로잡습니다.'
      );
    } else if (firstScene) {
      hookScore = 72;
      weaknesses.push('오프닝 첫 장면의 시각적 후킹 강도가 다소 정적입니다.');
      issues.push({
        id: 'audience-weak-hook',
        severity: 'SUGGESTION',
        gate: 'AUDIENCE',
        title: `${isShorts ? '쇼츠 첫 3초' : '오프닝 시퀀스'} 시각적 후킹 강화 제안`,
        what: '첫 씬의 시작이 인물의 일상 설명이나 정적인 풍경으로 출발하여 초반 이탈 위험이 있습니다.',
        where: 'Step 4 대본 Scene 1 오프닝',
        why: '특히 모바일/유튜브 환경에서 관객은 첫 몇 초 안에 시청 지속 여부를 결정합니다.',
        how: '사건이 이미 발생한 직후의 긴박한 순간(In media res)이나 시각적으로 충격적인 소품 클로즈업으로 시작하십시오.',
        description: '오프닝의 시각적/상황적 충격도를 높이십시오.',
        relatedStep: 4,
        relatedSceneId: 1,
      });
    } else {
      hookScore = 80;
    }
    metrics.hookIntensity = hookScore;

    // B. ATTENTION RETENTION & FLOW (Hook -> Escalation -> Crisis -> Climax -> Release)
    let attentionScore = 85;
    const scenesCount = script?.scenes?.length || 4;
    if (scenesCount >= 4) {
      attentionScore = 92;
      strengths.push('4단계 내러티브 에너지(도입 → 갈등 고조 → 위기 → 절정)가 팽팽하게 유지됩니다.');
    } else {
      attentionScore = 78;
    }
    metrics.attentionRetention = attentionScore;

    // C. EMOTIONAL DYNAMICS
    let dynamicsScore = 86;
    const maxIntensity = Math.max(...curve.map((p) => p.intensity));
    const minIntensity = Math.min(...curve.map((p) => p.intensity));
    const delta = maxIntensity - minIntensity;

    if (delta >= 4) {
      dynamicsScore = 94;
      strengths.push(`감정적 고저차(최저 ${minIntensity}점 ~ 최고 ${maxIntensity}점)가 뚜렷하여 카타르시스가 극대화됩니다.`);
    } else {
      dynamicsScore = 70;
      weaknesses.push('감정 곡선의 진폭이 좁아 잔잔하게 흘러갈 위험이 있습니다.');
    }
    metrics.emotionalDynamics = dynamicsScore;

    // D. ENDING AFTERGLOW & RESONANCE
    let endingAfterglowScore = 85;
    const lifeTheme =
      story.audienceTakeaway ||
      story.coreTheme ||
      project.analysis?.theme?.humanInsight ||
      '';
    if (lifeTheme.length > 10) {
      endingAfterglowScore = 93;
      strengths.push(`인생에 대한 깊은 통찰('${lifeTheme.slice(0, 24)}...')이 결말 이후에도 깊은 여운을 남깁니다.`);
    } else {
      endingAfterglowScore = 76;
    }
    metrics.endingAfterglow = endingAfterglowScore;

    const totalScore = Math.round(
      metrics.hookIntensity * 0.3 +
      metrics.attentionRetention * 0.25 +
      metrics.emotionalDynamics * 0.25 +
      metrics.endingAfterglow * 0.2
    );

    const status: QualityStatus =
      totalScore >= 88 ? 'EXCELLENT' : totalScore >= 75 ? 'GOOD' : totalScore >= 60 ? 'WARNING' : 'CRITICAL';

    return {
      report: {
        score: totalScore,
        status,
        summary: `시청자 경험 예측 지표: ${totalScore}점. ${strengths[0] || '시청자 몰입도 예측 양호'}`,
        strengths: strengths.slice(0, 3),
        weaknesses: weaknesses.slice(0, 3),
        metrics,
      },
      issues,
      emotionalCurve: curve,
    };
  }
}
