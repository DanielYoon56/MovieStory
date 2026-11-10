/**
 * MOVIESTORY AI — INTELLIGENCE QUALITY GATE (MIQG)
 * Cross-Pipeline Quality Assurance & Intelligence Data Models
 */

export type PipelineStage = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type IntelligenceQualityStatus =
  | 'EXCELLENT'          // 90–100 HIGH CONFIDENCE
  | 'READY'              // 80–89 QUALITY VERIFIED
  | 'READY_WITH_WARNINGS'// 70–79
  | 'NEEDS_REVIEW'       // 50–69
  | 'CRITICAL_REPAIR'    // 0–49
  | 'BLOCKED';           // If any BLOCKER exists

export type QualityStatus = 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL';

export type QualitySeverity = 'BLOCKER' | 'WARNING' | 'SUGGESTION';

export type QualityGateType = 'NARRATIVE' | 'CINEMATIC' | 'PRODUCTION' | 'AUDIENCE';

export interface QualityIssue {
  id: string;
  severity: QualitySeverity; // 'BLOCKER' | 'WARNING' | 'SUGGESTION'
  gate: QualityGateType;     // 'NARRATIVE' | 'CINEMATIC' | 'PRODUCTION' | 'AUDIENCE'
  title: string;
  what: string;              // What is wrong?
  where: string;             // Where is it happening (Step / Scene / Shot)?
  why: string;               // Why does it matter?
  how: string;               // How can it improve?
  description: string;       // Unified summary
  relatedStep?: number;
  relatedSceneId?: string | number;
  relatedShotId?: string;
  recommendation?: string;
  isResolved?: boolean;
}

export interface QualityDimensionReport {
  score: number;
  status: QualityStatus;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  metrics: Record<string, number>;
}

export interface EmotionalCurvePoint {
  timeOrPhase: string; // e.g. "Hook (0s)", "Escalation", "Crisis", "Climax", "Resolution"
  intensity: number;   // 1 to 10
  label: string;       // e.g. "호기심 유발 (5/10)", "절정 긴장 (9/10)"
  sceneIndex?: number;
  narrativeFunction: string;
}

export interface CausalChainLink {
  step: 'BECAUSE' | 'BUT' | 'THEREFORE' | 'SO';
  event: string;
  valid: boolean;
  notes?: string;
}

export interface CausalChainReport {
  isLinearAndThen: boolean;
  hasCausalConnectors: boolean;
  score: number; // 0 - 100
  chain: CausalChainLink[];
  brokenLinks: string[];
}

export interface QualityRecommendation {
  id: string;
  gate: QualityGateType;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  actionableStep: string;
  targetStep: number;
  targetLocation?: string;
}

export interface IntelligenceQualityReport {
  id: string;
  projectId: string;
  sourceContentHash: string;
  evaluatedAt: string;
  evaluatedStages: PipelineStage[];
  overallScore: number;
  status: IntelligenceQualityStatus;
  hasBlocker: boolean;
  blockerCount: number;
  warningCount: number;
  suggestionCount: number;

  narrative: QualityDimensionReport;
  cinematic: QualityDimensionReport;
  production: QualityDimensionReport;
  audienceExperience: QualityDimensionReport;

  issues: QualityIssue[];
  topStrengths: string[];
  topRisks: string[];

  emotionalCurve: EmotionalCurvePoint[];
  causalChain?: CausalChainReport;
  recommendations: QualityRecommendation[];

  version: number;
  isOutdated?: boolean;
}
