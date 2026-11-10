/**
 * MOVIESTORY AI — useIntelligenceQualityGate Hook
 * React Hook for seamless cross-pipeline quality evaluation and reporting.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Project, IntelligenceQualityReport } from '../types';
import { IntelligenceQualityGateService } from '../services/intelligenceQualityGate/IntelligenceQualityGateService';
import { QualityReportService } from '../services/intelligenceQualityGate/QualityReportService';

export function useIntelligenceQualityGate(
  project: Project | null,
  onUpdateProject?: (updated: Partial<Project>) => void
) {
  const [report, setReport] = useState<IntelligenceQualityReport | null>(
    project?.intelligenceQualityReport || null
  );
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  // Compute current hash to check if report is outdated
  const currentHash = useMemo(() => {
    if (!project) return '';
    return QualityReportService.computeProjectContentHash(project);
  }, [project]);

  const isOutdated = useMemo(() => {
    if (!report || !currentHash) return false;
    return report.sourceContentHash !== currentHash;
  }, [report, currentHash]);

  // Execute quality gate evaluation
  const runEvaluation = useCallback(() => {
    if (!project) return;
    setIsEvaluating(true);

    try {
      const newReport = IntelligenceQualityGateService.evaluateProject(project);
      const history = QualityReportService.archiveReport(
        newReport,
        project.intelligenceQualityHistory || []
      );

      setReport(newReport);
      if (onUpdateProject) {
        onUpdateProject({
          intelligenceQualityReport: newReport,
          intelligenceQualityHistory: history,
        });
      }
    } finally {
      setIsEvaluating(false);
    }
  }, [project, onUpdateProject]);

  // Synchronize on load or project switch
  useEffect(() => {
    if (project?.intelligenceQualityReport) {
      setReport(project.intelligenceQualityReport);
    } else if (project) {
      // Run initial evaluation if none exists
      runEvaluation();
    }
  }, [project?.id]);

  return {
    report,
    isEvaluating,
    isOutdated,
    runEvaluation,
  };
}
