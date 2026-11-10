/**
 * MOVIESTORY AI — MIQG: QUALITY SCORING SERVICE
 *
 * Implements weighted scoring, blocker override, and stage-aware normalization.
 *
 * Weighted formula:
 * Narrative Quality              35%
 * Cinematic Quality              25%
 * Production Consistency         25%
 * Audience Experience Estimate   15%
 *
 * CRITICAL RULE:
 * If ANY issue is marked 'BLOCKER', status is overridden to 'BLOCKED',
 * even if the numerical score is high.
 */

import {
  QualityDimensionReport,
  QualityIssue,
  IntelligenceQualityStatus,
  PipelineStage,
} from '../../types';

export class QualityScoringService {
  /**
   * Compute overall intelligence score, status, and blocker override
   */
  static computeOverallScore(
    narrative: QualityDimensionReport,
    cinematic: QualityDimensionReport,
    production: QualityDimensionReport,
    audience: QualityDimensionReport,
    issues: QualityIssue[],
    availableStages: PipelineStage[]
  ): {
    overallScore: number;
    status: IntelligenceQualityStatus;
    hasBlocker: boolean;
    blockerCount: number;
    warningCount: number;
    suggestionCount: number;
  } {
    const blockerCount = issues.filter((i) => i.severity === 'BLOCKER').length;
    const warningCount = issues.filter((i) => i.severity === 'WARNING').length;
    const suggestionCount = issues.filter((i) => i.severity === 'SUGGESTION').length;
    const hasBlocker = blockerCount > 0;

    // Stage-aware dynamic weight adjustment
    const maxStage = Math.max(...availableStages, 1);
    let nWeight = 0.35;
    let cWeight = 0.25;
    let pWeight = 0.25;
    let aWeight = 0.15;

    if (maxStage <= 3) {
      // Step 1-3: Narrative takes primary focus
      nWeight = 0.55;
      cWeight = 0.15;
      pWeight = 0.15;
      aWeight = 0.15;
    } else if (maxStage === 4) {
      // Step 4: Narrative & Cinematic translation
      nWeight = 0.40;
      cWeight = 0.35;
      pWeight = 0.10;
      aWeight = 0.15;
    }

    const rawScore =
      narrative.score * nWeight +
      cinematic.score * cWeight +
      production.score * pWeight +
      audience.score * aWeight;

    const overallScore = Math.round(Math.min(100, Math.max(0, rawScore)));

    // Status determination with BLOCKER override
    let status: IntelligenceQualityStatus = 'READY';

    if (hasBlocker) {
      status = 'BLOCKED';
    } else if (overallScore >= 90) {
      status = 'EXCELLENT';
    } else if (overallScore >= 80) {
      status = 'READY';
    } else if (overallScore >= 70) {
      status = 'READY_WITH_WARNINGS';
    } else if (overallScore >= 50) {
      status = 'NEEDS_REVIEW';
    } else {
      status = 'CRITICAL_REPAIR';
    }

    return {
      overallScore,
      status,
      hasBlocker,
      blockerCount,
      warningCount,
      suggestionCount,
    };
  }

  /**
   * Human-readable label for IntelligenceQualityStatus
   */
  static getStatusLabel(status: IntelligenceQualityStatus): {
    title: string;
    description: string;
    badgeColor: string;
    textColor: string;
    borderColor: string;
  } {
    switch (status) {
      case 'EXCELLENT':
        return {
          title: 'EXCELLENT — HIGH CONFIDENCE',
          description: '모든 서사적·영화적 기준을 완벽히 충족하며 최고 수준의 관객 경험이 예상됩니다.',
          badgeColor: 'bg-emerald-500/20 text-emerald-300',
          textColor: 'text-emerald-400',
          borderColor: 'border-emerald-500/40',
        };
      case 'READY':
        return {
          title: 'READY — QUALITY VERIFIED',
          description: '품질 게이트 검증을 안정적으로 통과하여 다음 제작 단계로 진행 가능합니다.',
          badgeColor: 'bg-teal-500/20 text-teal-300',
          textColor: 'text-teal-400',
          borderColor: 'border-teal-500/40',
        };
      case 'READY_WITH_WARNINGS':
        return {
          title: 'READY WITH WARNINGS',
          description: '기본 요건을 통과했으나 일부 캐릭터 동기나 시각적 설명 대사에 대한 개선 권고가 있습니다.',
          badgeColor: 'bg-amber-500/20 text-amber-300',
          textColor: 'text-amber-400',
          borderColor: 'border-amber-500/40',
        };
      case 'NEEDS_REVIEW':
        return {
          title: 'NEEDS REVIEW',
          description: '인과관계나 제작 자산 연결에 일부 결함이 있어 검토 및 수정이 필요합니다.',
          badgeColor: 'bg-orange-500/20 text-orange-300',
          textColor: 'text-orange-400',
          borderColor: 'border-orange-500/40',
        };
      case 'CRITICAL_REPAIR':
        return {
          title: 'CRITICAL REPAIR REQUIRED',
          description: '서사 뼈대나 핵심 샷 설계에 심각한 오류가 감지되어 수정이 요구됩니다.',
          badgeColor: 'bg-rose-500/20 text-rose-300',
          textColor: 'text-rose-400',
          borderColor: 'border-rose-500/40',
        };
      case 'BLOCKED':
        return {
          title: 'BLOCKED — CRITICAL ISSUE DETECTED',
          description: '치명적 결함(주인공 부재, 샷 누락 등)이 감지되어 다음 단계 진행이 제한됩니다.',
          badgeColor: 'bg-red-500/30 text-red-200',
          textColor: 'text-red-400',
          borderColor: 'border-red-500/60',
        };
    }
  }
}
