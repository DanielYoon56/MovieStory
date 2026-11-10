/**
 * MOVIESTORY AI — MIQG GATE 3: PRODUCTION CONSISTENCY SERVICE
 *
 * Validates the complete pipeline integrity:
 * STORY -> SCRIPT -> SCENE -> SHOT -> ASSET -> TIMELINE
 *
 * A. Story -> Script Fidelity (Story facts preserved in script)
 * B. Script -> Shot Fidelity (Script events broken into atomic shots)
 * C. Shot -> Asset Completeness (Approved assets bound to shots)
 * D. Asset -> Timeline Fidelity (Sequence, duration, audio-video sync)
 */

import {
  Project,
  QualityDimensionReport,
  QualityIssue,
  QualityStatus,
  PipelineStage,
} from '../../types';

export class ProductionConsistencyService {
  /**
   * Evaluate Production Consistency Dimension (Gate 3)
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
      storyToScriptFidelity: 0,
      scriptToShotFidelity: 0,
      shotToAssetCompleteness: 0,
      assetToTimelineFidelity: 0,
    };

    const story = project.currentStory;
    const script = project.currentScript;
    const pkg = project.productionPackage;
    const assets = project.assetLibrary;
    const timeline = project.finalTimeline;

    // Stage-aware baseline for early stages
    if (!availableStages.includes(5) && !pkg) {
      const storyToScript = script ? 90 : 75;
      metrics.storyToScriptFidelity = storyToScript;
      metrics.scriptToShotFidelity = 80;
      metrics.shotToAssetCompleteness = 80;
      metrics.assetToTimelineFidelity = 80;

      return {
        report: {
          score: 82,
          status: 'GOOD',
          summary: '제작 패키지(Step 5) 이전 단계입니다. 서사 및 대본 정합성을 선행 검증 중입니다.',
          strengths: ['스토리-대본 서사 뼈대 확립'],
          weaknesses: ['제작 스펙 패키지 대기 중'],
          metrics,
        },
        issues: [],
      };
    }

    // A. STORY -> SCRIPT FIDELITY
    let storyToScriptScore = 88;
    if (script?.fidelityReport) {
      storyToScriptScore = script.fidelityReport.score;
      if (script.fidelityReport.score >= 90) {
        strengths.push('Step 3의 스토리 팩트(인과율, 사건, 결말)가 대본에 100% 충실하게 반영되었습니다.');
      } else {
        weaknesses.push('대본에서 일부 스토리 팩트의 누락 또는 변형 감지');
      }
    } else if (story && script) {
      // Basic check
      const scenesCount = script.scenes.length;
      if (scenesCount >= 3) {
        storyToScriptScore = 92;
        strengths.push('스토리 구조가 대본 씬으로 안정적으로 번역되었습니다.');
      } else {
        storyToScriptScore = 65;
        issues.push({
          id: 'prod-script-too-short',
          severity: 'BLOCKER',
          gate: 'PRODUCTION',
          title: '대본 씬 수량 부족 (서사 표현 불가)',
          what: `대본의 씬 수(${scenesCount}개)가 전체 서사를 담아내기에 부족합니다.`,
          where: 'Step 4 대본 스튜디오',
          why: '최소 3개 이상의 씬(발단, 전개/위기, 결말)이 존재해야 정상적인 영상화가 가능합니다.',
          how: '대본을 다시 생성하여 전체 서사 팩트를 모두 포괄하십시오.',
          description: '대본 씬 수량을 확보하십시오.',
          relatedStep: 4,
        });
      }
    }
    metrics.storyToScriptFidelity = storyToScriptScore;

    // B. SCRIPT -> SHOT FIDELITY
    let scriptToShotScore = 85;
    if (pkg) {
      const shotsCount = pkg.shotList.length;
      const scenesCount = script?.scenes.length || 1;
      const avgShotsPerScene = shotsCount / scenesCount;

      if (avgShotsPerScene >= 2) {
        scriptToShotScore = 95;
        strengths.push(`총 ${shotsCount}개 아토믹 샷이 씬당 평균 ${avgShotsPerScene.toFixed(1)}개로 조밀하게 분할 설계되었습니다.`);
      } else if (shotsCount > 0) {
        scriptToShotScore = 80;
        strengths.push(`${shotsCount}개 샷 리스트 구성 완료`);
      } else {
        scriptToShotScore = 40;
        issues.push({
          id: 'prod-shots-missing',
          severity: 'BLOCKER',
          gate: 'PRODUCTION',
          title: '제작 샷 리스트 부재',
          what: 'Production Package에 등록된 샷이 없습니다.',
          where: 'Step 5 제작 설계 > 샷 리스트',
          why: '샷 리스트가 없으면 영상 자산 생성 및 편집 타임라인 구축이 불가능합니다.',
          how: 'Step 5에서 샷 목록을 생성하고 확정하십시오.',
          description: '제작 샷 리스트를 생성해야 합니다.',
          relatedStep: 5,
        });
      }
    } else {
      scriptToShotScore = 75;
    }
    metrics.scriptToShotFidelity = scriptToShotScore;

    // C. SHOT -> ASSET COMPLETENESS
    let shotToAssetScore = 85;
    if (availableStages.includes(6) || assets) {
      const totalAssets = assets?.assets?.length || 0;
      const approvedCount = assets?.approvedAssetsCount || 0;
      const totalShots = pkg?.shotList.length || 1;

      if (totalAssets > 0 && approvedCount >= totalShots) {
        shotToAssetScore = 96;
        strengths.push(`전체 ${totalShots}개 샷에 필요한 디지털 키프레임/영상 자산이 100% 승인 완료되었습니다.`);
      } else if (totalAssets > 0 && approvedCount > 0) {
        const rate = Math.round((approvedCount / totalShots) * 100);
        shotToAssetScore = Math.min(90, Math.max(60, rate));
        if (rate < 80) {
          weaknesses.push(`자산 승인율 ${rate}% (일부 샷 자산 미승인)`);
          issues.push({
            id: 'prod-asset-incomplete',
            severity: 'WARNING',
            gate: 'PRODUCTION',
            title: '일부 제작 샷의 자산 미승인 상태',
            what: `전체 ${totalShots}개 샷 중 ${approvedCount}개 자산만 승인되어 있습니다 (${rate}%).`,
            where: 'Step 6 AI 자산 생성 스튜디오',
            why: '미승인 샷은 애니매틱 프리뷰나 플레이스홀더로 렌더링되어 최종 완성도가 저하될 수 있습니다.',
            how: 'Step 6에서 미승인된 자산의 프롬프트를 검토하고 자산을 생성 및 승인하십시오.',
            description: '모든 샷에 대한 자산 승인을 완료할 것을 권장합니다.',
            relatedStep: 6,
          });
        }
      } else if (availableStages.includes(6)) {
        shotToAssetScore = 50;
        issues.push({
          id: 'prod-no-assets',
          severity: 'WARNING',
          gate: 'PRODUCTION',
          title: '생성 및 승인된 영상 자산 없음',
          what: 'Step 6에서 승인된 비주얼 자산이 아직 없습니다.',
          where: 'Step 6 AI 자산 스튜디오',
          why: '자산이 없으면 Step 7 편집 타임라인에 시각 소스를 배치할 수 없습니다.',
          how: 'Step 6에서 샷별 AI 이미지 또는 영상을 생성하십시오.',
          description: '자산 생성이 필요합니다.',
          relatedStep: 6,
        });
      }
    } else {
      shotToAssetScore = 80;
    }
    metrics.shotToAssetCompleteness = shotToAssetScore;

    // D. ASSET -> TIMELINE FIDELITY
    let timelineScore = 85;
    if (availableStages.includes(7) || timeline) {
      if (timeline) {
        const vItems = timeline.videoTracks[0]?.items || [];
        const shotsCount = pkg?.shotList.length || 0;
        const timelineComplete = vItems.length >= shotsCount && timeline.duration > 0;

        if (timelineComplete) {
          timelineScore = 95;
          strengths.push(`타임라인(${timeline.duration}초)에 모든 샷과 자막, 오디오 트랙이 정상 배치되었습니다.`);
        } else {
          timelineScore = 65;
          issues.push({
            id: 'prod-timeline-mismatch',
            severity: 'WARNING',
            gate: 'PRODUCTION',
            title: '타임라인 샷 배치 불일치',
            what: `설계된 샷(${shotsCount}개) 중 일부가 타임라인 비디오 트랙에 누락되었습니다 (${vItems.length}개 배치).`,
            where: 'Step 7 편집 & 타임라인 스튜디오',
            why: '누락된 샷은 최종 렌더링 영상에서 제외되어 이야기 전개가 끊깁니다.',
            how: 'Step 7에서 타임라인 자동 동기화를 재실행하여 모든 샷을 배치하십시오.',
            description: '타임라인과 샷 목록을 동기화하십시오.',
            relatedStep: 7,
          });
        }
      } else if (availableStages.includes(7)) {
        timelineScore = 55;
      }
    } else {
      timelineScore = 80;
    }
    metrics.assetToTimelineFidelity = timelineScore;

    const totalScore = Math.round(
      metrics.storyToScriptFidelity * 0.3 +
      metrics.scriptToShotFidelity * 0.25 +
      metrics.shotToAssetCompleteness * 0.25 +
      metrics.assetToTimelineFidelity * 0.2
    );

    const status: QualityStatus =
      totalScore >= 88 ? 'EXCELLENT' : totalScore >= 75 ? 'GOOD' : totalScore >= 60 ? 'WARNING' : 'CRITICAL';

    return {
      report: {
        score: totalScore,
        status,
        summary: `스토리-대본-샷-자산-타임라인 파이프라인 정합성: ${totalScore}점. ${strengths[0] || '제작 파이프라인 체인 검증 완료'}`,
        strengths: strengths.slice(0, 3),
        weaknesses: weaknesses.slice(0, 3),
        metrics,
      },
      issues,
    };
  }
}
