/**
 * MOVIESTORY AI — MIQG: QUALITY REPORT SERVICE
 *
 * Handles report version preservation, content-hash synchronization,
 * outdated detection, and recommendation compilation.
 */

import {
  Project,
  IntelligenceQualityReport,
  QualityIssue,
  QualityRecommendation,
  PipelineStage,
} from '../../types';

export class QualityReportService {
  /**
   * Compute unified content hash covering active pipeline artifacts
   */
  static computeProjectContentHash(project: Project): string {
    const parts = [
      project.id,
      project.selectedMovie?.id || '',
      project.selectedMotifs.map((m) => m.id).sort().join(','),
      project.currentStory?.id || '',
      project.currentStory?.logline || '',
      project.currentStory?.plot?.resolution || '',
      project.currentScript?.id || '',
      project.currentScript?.scenes?.length || 0,
      project.productionPackage?.shotList?.length || 0,
      project.assetLibrary?.approvedAssetsCount || 0,
      project.finalTimeline?.updatedAt || '',
    ];

    const str = parts.join('|');
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return `hash_iqg_${Math.abs(hash).toString(36)}`;
  }

  /**
   * Determine available stages based on project state
   */
  static getAvailableStages(project: Project): PipelineStage[] {
    const stages: PipelineStage[] = [1];
    if (project.selectedMovie) stages.push(2);
    if (project.currentStory) stages.push(3);
    if (project.currentScript && project.currentScript.scenes.length > 0) stages.push(4);
    if (project.productionPackage && project.productionPackage.shotList.length > 0) stages.push(5);
    if (project.assetLibrary && project.assetLibrary.assets.length > 0) stages.push(6);
    if (project.finalTimeline && project.finalTimeline.duration > 0) stages.push(7);
    if (project.finalDelivery && project.finalDelivery.deliveries.length > 0) stages.push(8);
    return stages;
  }

  /**
   * Generate actionable recommendations from issues
   */
  static generateRecommendations(issues: QualityIssue[]): QualityRecommendation[] {
    return issues.map((iss) => {
      let priority: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
      if (iss.severity === 'BLOCKER') priority = 'HIGH';
      else if (iss.severity === 'WARNING') priority = 'MEDIUM';

      return {
        id: `rec-${iss.id}`,
        gate: iss.gate,
        priority,
        title: iss.title,
        actionableStep: iss.how || iss.description,
        targetStep: iss.relatedStep || 3,
        targetLocation: iss.where,
      };
    });
  }

  /**
   * Check if an existing report is outdated compared to current project data
   */
  static isReportOutdated(
    report: IntelligenceQualityReport | undefined,
    currentHash: string
  ): boolean {
    if (!report) return false;
    return report.sourceContentHash !== currentHash;
  }

  /**
   * Append new report to project version history
   */
  static archiveReport(
    currentReport: IntelligenceQualityReport,
    history: IntelligenceQualityReport[] = []
  ): IntelligenceQualityReport[] {
    // Keep past reports marked as outdated if they have a different hash
    const updatedHistory = history.map((item) => ({
      ...item,
      isOutdated: item.sourceContentHash !== currentReport.sourceContentHash,
    }));

    return [currentReport, ...updatedHistory.slice(0, 9)]; // Retain up to 10 versions
  }
}
