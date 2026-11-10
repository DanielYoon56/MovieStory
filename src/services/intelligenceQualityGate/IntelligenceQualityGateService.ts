/**
 * MOVIESTORY AI — MOVIESTORY INTELLIGENCE QUALITY GATE (MIQG)
 * Cross-Pipeline Intelligence & Quality Assurance Layer
 *
 * UNIFIED ORCHESTRATOR SERVICE
 * Operates across STEP 1 through STEP 8.
 *
 * Absolute Authority:
 * OBSERVE -> ANALYZE -> VALIDATE -> DETECT RISKS -> REPORT -> SUGGEST IMPROVEMENTS
 * Never overrides user creativity or autonomous step authorities.
 */

import {
  Project,
  IntelligenceQualityReport,
  QualityIssue,
  PipelineStage,
} from '../../types';
import { NarrativeQualityService } from './NarrativeQualityService';
import { CharacterMotivationService } from './CharacterMotivationService';
import { CausalLogicService } from './CausalLogicService';
import { CinematicQualityService } from './CinematicQualityService';
import { ProductionConsistencyService } from './ProductionConsistencyService';
import { AudienceExperienceService } from './AudienceExperienceService';
import { QualityScoringService } from './QualityScoringService';
import { QualityReportService } from './QualityReportService';

export class IntelligenceQualityGateService {
  /**
   * Main evaluation method across the full pipeline
   */
  static evaluateProject(
    project: Project,
    currentStepOverride?: number
  ): IntelligenceQualityReport {
    const availableStages = QualityReportService.getAvailableStages(project);
    const sourceContentHash = QualityReportService.computeProjectContentHash(project);

    // 1. Gate 1: Narrative Intelligence
    const { report: narrativeReport, issues: narrativeIssues } =
      NarrativeQualityService.evaluate(project, availableStages);

    // Character Motivation inspection
    const { issues: motivationIssues, strengths: motivationStrengths } =
      CharacterMotivationService.inspect(project);

    // Causal Logic inspection
    const { causalReport, issues: causalIssues } =
      CausalLogicService.analyze(project);

    // 2. Gate 2: Cinematic Intelligence
    const { report: cinematicReport, issues: cinematicIssues } =
      CinematicQualityService.evaluate(project, availableStages);

    // 3. Gate 3: Production Consistency
    const { report: productionReport, issues: productionIssues } =
      ProductionConsistencyService.evaluate(project, availableStages);

    // 4. Gate 4: Audience Experience Estimate
    const { report: audienceReport, issues: audienceIssues, emotionalCurve } =
      AudienceExperienceService.evaluate(project, availableStages);

    // Combine all issues
    const allIssues: QualityIssue[] = [
      ...narrativeIssues,
      ...motivationIssues,
      ...causalIssues,
      ...cinematicIssues,
      ...productionIssues,
      ...audienceIssues,
    ];

    // Deduplicate issues by id
    const uniqueIssuesMap = new Map<string, QualityIssue>();
    allIssues.forEach((iss) => {
      if (!uniqueIssuesMap.has(iss.id)) {
        uniqueIssuesMap.set(iss.id, iss);
      }
    });
    const finalIssues = Array.from(uniqueIssuesMap.values());

    // 5. Unified Scoring with Blocker Override
    const scoringResult = QualityScoringService.computeOverallScore(
      narrativeReport,
      cinematicReport,
      productionReport,
      audienceReport,
      finalIssues,
      availableStages
    );

    // 6. Actionable Recommendations
    const recommendations = QualityReportService.generateRecommendations(finalIssues);

    // 7. Compile Top Strengths and Top Risks
    const allStrengths = [
      ...narrativeReport.strengths,
      ...motivationStrengths,
      ...cinematicReport.strengths,
      ...productionReport.strengths,
      ...audienceReport.strengths,
    ];

    const topStrengths = Array.from(new Set(allStrengths)).slice(0, 3);
    const topRisks = finalIssues
      .filter((i) => i.severity === 'BLOCKER' || i.severity === 'WARNING')
      .slice(0, 3)
      .map((i) => `[${i.gate}] ${i.title}: ${i.what}`);

    const existingReport = project.intelligenceQualityReport;
    const version = (existingReport?.version || 0) + 1;

    return {
      id: `miqg-report-${project.id}-v${version}`,
      projectId: project.id,
      sourceContentHash,
      evaluatedAt: new Date().toISOString(),
      evaluatedStages: availableStages,
      overallScore: scoringResult.overallScore,
      status: scoringResult.status,
      hasBlocker: scoringResult.hasBlocker,
      blockerCount: scoringResult.blockerCount,
      warningCount: scoringResult.warningCount,
      suggestionCount: scoringResult.suggestionCount,
      narrative: narrativeReport,
      cinematic: cinematicReport,
      production: productionReport,
      audienceExperience: audienceReport,
      issues: finalIssues,
      topStrengths: topStrengths.length > 0 ? topStrengths : ['전체 파이프라인 정합성 양호'],
      topRisks: topRisks.length > 0 ? topRisks : ['심각한 서사적·제작적 위험 요인 없음'],
      emotionalCurve,
      causalChain: causalReport,
      recommendations,
      version,
      isOutdated: false,
    };
  }

  /**
   * Helper to check if project needs re-evaluation
   */
  static isEvaluationNeeded(project: Project): boolean {
    if (!project.intelligenceQualityReport) return true;
    const currentHash = QualityReportService.computeProjectContentHash(project);
    return project.intelligenceQualityReport.sourceContentHash !== currentHash;
  }
}
