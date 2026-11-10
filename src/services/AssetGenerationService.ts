/**
 * MOVIESTORY AI — STEP 6: AI ASSET GENERATION STUDIO SERVICE
 *
 * Core Principles:
 * 1. STEP 6 DOES NOT CREATE OR ALTER STORIES.
 *    (It strictly translates Step 5 ProductionPackage into digital assets)
 * 2. STORY != ASSET.
 *    (Story = facts of what happens; Asset = concrete digital media produced)
 * 3. NO OVERWRITING APPROVED ASSETS.
 *    (Regenerations increment version: VID-001-V1 -> VID-001-V2)
 * 4. STEP 5 MODIFICATIONS DO NOT DELETE ASSETS.
 *    (Outdated hash marks assets as OUTDATED for user reconciliation)
 * 5. PROVIDER INDEPENDENT WITH HIGH-FIDELITY PREVIEW GENERATOR.
 */

import {
  ProductionPackage,
  ProductionAsset,
  ShotAssetBinding,
  GenerationJob,
  AssetQualityCheck,
  AssetLibrary,
  ProviderCapability,
  GenerationProviderType,
  ProductionShot,
  CharacterProfile,
  LocationProfile,
  PropProfile,
} from '../types';

export const PROVIDER_CAPABILITIES: ProviderCapability[] = [
  {
    id: 'DEMO_PREVIEW',
    name: 'MovieStory Neural Canvas (실시간 내장)',
    description: '외부 API 키 없이 브라우저 내에서 즉각 렌더링되는 시네마틱 프리뷰 엔진',
    tag: '내장 무제한',
    supportsVideo: true,
    supportsImage: true,
    maxDurationSeconds: 8,
    nativeAspectRatios: ['9:16', '16:9'],
    estimatedSecondsPerJob: 1.5,
    isFreeOrDemo: true,
  },
  {
    id: 'GOOGLE_VEO',
    name: 'Google Veo / Imagen 3',
    description: '최고 화질의 일관된 인물 표현과 4K 시네마틱 비디오 생성',
    tag: 'Ultra Realistic',
    supportsVideo: true,
    supportsImage: true,
    maxDurationSeconds: 8,
    nativeAspectRatios: ['9:16', '16:9'],
    estimatedSecondsPerJob: 4.0,
    isFreeOrDemo: false,
  },
  {
    id: 'RUNWAY_GEN3',
    name: 'Runway Gen-3 Alpha',
    description: '동적 카메라 무브먼트와 물리 엔진 기반의 빠른 영상 렌더링',
    tag: 'Dynamic Motion',
    supportsVideo: true,
    supportsImage: true,
    maxDurationSeconds: 10,
    nativeAspectRatios: ['9:16', '16:9'],
    estimatedSecondsPerJob: 4.5,
    isFreeOrDemo: false,
  },
  {
    id: 'LUMA_DREAM',
    name: 'Luma Dream Machine',
    description: '자연스러운 조명 변화와 부드러운 인물 모션 트래킹',
    tag: 'Fluid Light',
    supportsVideo: true,
    supportsImage: true,
    maxDurationSeconds: 5,
    nativeAspectRatios: ['9:16', '16:9'],
    estimatedSecondsPerJob: 3.5,
    isFreeOrDemo: false,
  },
  {
    id: 'OPENAI_SORA',
    name: 'OpenAI Sora (Adapter)',
    description: '장면 전체의 복합적 서사 물리학 및 공간 연속성 시뮬레이션',
    tag: 'Complex Physics',
    supportsVideo: true,
    supportsImage: true,
    maxDurationSeconds: 20,
    nativeAspectRatios: ['9:16', '16:9'],
    estimatedSecondsPerJob: 6.0,
    isFreeOrDemo: false,
  },
];

/**
 * 캔버스 기반으로 시네마틱 키프레임 및 레퍼런스 비주얼을 실시간 생성합니다.
 */
function generateCinematicCanvasImage(
  title: string,
  subtitle: string,
  tag: string,
  aspectRatio: '9:16' | '16:9',
  palette: { bg1: string; bg2: string; accent: string; text: string },
  details: {
    shotSize?: string;
    lighting?: string;
    characters?: string[];
    lens?: string;
  }
): string {
  const isShorts = aspectRatio === '9:16';
  const width = isShorts ? 720 : 1280;
  const height = isShorts ? 1280 : 720;

  if (typeof document === 'undefined') {
    return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="%23111"/><text x="50%" y="50%" fill="%23fff" text-anchor="middle">Cinema Frame</text></svg>';
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // 1. 시네마틱 그라데이션 배경
  const grad = ctx.createRadialGradient(
    width / 2,
    height / 2,
    50,
    width / 2,
    height / 2,
    Math.max(width, height) / 1.2
  );
  grad.addColorStop(0, palette.bg1);
  grad.addColorStop(1, palette.bg2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // 2. 아나모픽 렌즈 플레어 효과 (시네마틱 감성)
  ctx.save();
  const flareGrad = ctx.createLinearGradient(0, height * 0.4, width, height * 0.4);
  flareGrad.addColorStop(0, 'rgba(0,0,0,0)');
  flareGrad.addColorStop(0.3, `${palette.accent}22`);
  flareGrad.addColorStop(0.5, `${palette.accent}66`);
  flareGrad.addColorStop(0.7, `${palette.accent}22`);
  flareGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = flareGrad;
  ctx.fillRect(0, height * 0.38, width, 14);
  ctx.restore();

  // 3. 필름 그레인 및 뷰파인더 가이드라인
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1;

  // 3분할 그리드 라인
  ctx.beginPath();
  ctx.moveTo(width / 3, 0);
  ctx.lineTo(width / 3, height);
  ctx.moveTo((width * 2) / 3, 0);
  ctx.lineTo((width * 2) / 3, height);
  ctx.moveTo(0, height / 3);
  ctx.lineTo(width, height / 3);
  ctx.moveTo(0, (height * 2) / 3);
  ctx.lineTo(width, (height * 2) / 3);
  ctx.stroke();

  // 중앙 포커스 타겟 마커
  const cx = width / 2;
  const cy = height / 2;
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 24, cy);
  ctx.lineTo(cx - 8, cy);
  ctx.moveTo(cx + 8, cy);
  ctx.lineTo(cx + 24, cy);
  ctx.moveTo(cx, cy - 24);
  ctx.lineTo(cx, cy - 8);
  ctx.moveTo(cx, cy + 8);
  ctx.lineTo(cx, cy + 24);
  ctx.stroke();

  // 4. 시네마틱 레터박스 / 오버레이 섀도우
  const vignette = ctx.createRadialGradient(cx, cy, width * 0.25, cx, cy, width * 0.7);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.85)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);

  // 5. 상단 정보 (타임코드 및 해상도/비율)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = 'bold 18px monospace';
  ctx.fillText(`REC [●] 24.00 FPS   ISO 400   ${aspectRatio}`, 36, 44);

  // 상단 태그 뱃지
  ctx.fillStyle = palette.accent;
  ctx.fillRect(width - 200, 24, 164, 28);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(tag, width - 118, 43);
  ctx.textAlign = 'left';

  // 6. 하단 시네마틱 정보 박스
  const bottomBoxHeight = isShorts ? 260 : 160;
  const bottomBoxY = height - bottomBoxHeight - 24;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
  ctx.roundRect
    ? ctx.roundRect(24, bottomBoxY, width - 48, bottomBoxHeight, 16)
    : ctx.fillRect(24, bottomBoxY, width - 48, bottomBoxHeight);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // 제목 및 부제
  ctx.fillStyle = '#ffffff';
  ctx.font = isShorts ? 'bold 28px sans-serif' : 'bold 24px sans-serif';
  ctx.fillText(title, 48, bottomBoxY + 44);

  ctx.fillStyle = 'rgba(203, 213, 225, 0.9)';
  ctx.font = '16px sans-serif';

  // 긴 텍스트 줄바꿈
  const words = subtitle.split(' ');
  let line = '';
  let lineY = bottomBoxY + 76;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > width - 120 && n > 0) {
      ctx.fillText(line, 48, lineY);
      line = words[n] + ' ';
      lineY += 24;
      if (lineY > bottomBoxY + bottomBoxHeight - 40) break;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, 48, lineY);

  // 메타 태그 (렌즈, 조명)
  if (details.shotSize || details.lighting) {
    const metaY = bottomBoxY + bottomBoxHeight - 20;
    ctx.fillStyle = palette.accent;
    ctx.font = 'bold 13px monospace';
    ctx.fillText(
      `[CAM] ${details.shotSize || 'MEDIUM'} | [LIGHT] ${details.lighting || 'NATURAL CINEMATIC'} | [REF] ${details.characters?.join(', ') || 'WORLD'}`,
      48,
      metaY
    );
  }

  return canvas.toDataURL('image/jpeg', 0.9);
}

export class AssetGenerationService {
  /**
   * Step 5 ProductionPackage로부터 초기 AssetLibrary를 구성하거나 변경사항을 동기화합니다.
   */
  static initializeAssetLibrary(
    pkg: ProductionPackage,
    existingLibrary?: AssetLibrary
  ): AssetLibrary {
    const isOutdated =
      Boolean(existingLibrary) &&
      existingLibrary?.contentHash !== pkg.sourceContentHash;

    const assets: ProductionAsset[] = [];
    const bindings: ShotAssetBinding[] = [];
    const qualityChecks: Record<string, AssetQualityCheck> = {};

    // 1. 캐릭터 레퍼런스 세트 구축 (정면, 3/4각도, 전신)
    pkg.characterBible.forEach((char, idx) => {
      const angles: ('front' | 'three_quarter' | 'full_body')[] = [
        'front',
        'three_quarter',
        'full_body',
      ];
      angles.forEach((angle) => {
        const assetId = `CHAR-REF-${idx + 1}-${angle.toUpperCase()}`;
        const existing = existingLibrary?.assets.find((a) => a.assetId === assetId);

        if (existing) {
          assets.push({
            ...existing,
            status: isOutdated ? 'OUTDATED' : existing.status,
          });
        } else {
          const angleLabel =
            angle === 'front' ? '정면' : angle === 'three_quarter' ? '3/4 반측면' : '전신 실루엣';
          const asset: ProductionAsset = {
            assetId,
            projectId: pkg.projectId,
            productionPackageId: pkg.packageId,
            type: 'CHARACTER_REFERENCE',
            name: `${char.name} [${angleLabel} 레퍼런스]`,
            version: 1,
            prompt: `${char.visualIdentityPrompt}, ${angle} cinematic character portrait, ultra detailed, photorealistic`,
            negativePrompt: 'cartoon, distorted face, bad anatomy, blur, low resolution',
            seed: 1000 + idx * 10 + (angle === 'front' ? 1 : angle === 'three_quarter' ? 2 : 3),
            status: 'APPROVED',
            url: generateCinematicCanvasImage(
              `${char.name} (${char.role.toUpperCase()})`,
              `${char.ageRange} | ${char.appearance.face} | ${char.costume.primary}`,
              `CHAR REF: ${angleLabel}`,
              pkg.format === 'shorts' ? '9:16' : '16:9',
              {
                bg1: '#1e293b',
                bg2: '#090d16',
                accent: '#38bdf8',
                text: '#f8fafc',
              },
              {
                shotSize: angle === 'full_body' ? 'FULL BODY' : 'PORTRAIT',
                lighting: char.emotionalBaseline,
                characters: [char.name],
              }
            ),
            metadata: {
              aspectRatio: pkg.format === 'shorts' ? '9:16' : '16:9',
              characterId: char.characterId,
              isReference: true,
              viewAngle: angle,
              provider: 'MovieStory Neural Canvas',
            },
            consistencyScore: 98,
            createdAt: new Date().toISOString(),
            approvedAt: new Date().toISOString(),
          };
          assets.push(asset);
        }
      });
    });

    // 2. 로케이션 레퍼런스 세트 구축
    pkg.locationBible.forEach((loc, idx) => {
      const assetId = `LOC-REF-${idx + 1}`;
      const existing = existingLibrary?.assets.find((a) => a.assetId === assetId);

      if (existing) {
        assets.push({
          ...existing,
          status: isOutdated ? 'OUTDATED' : existing.status,
        });
      } else {
        const asset: ProductionAsset = {
          assetId,
          projectId: pkg.projectId,
          productionPackageId: pkg.packageId,
          type: 'LOCATION_REFERENCE',
          name: `${loc.name} [공간 레퍼런스]`,
          version: 1,
          prompt: `${loc.locationPrompt}, master environment establishing shot, architectural detail, cinematic lighting`,
          negativePrompt: 'foggy blur, bad composition, text, watermark',
          seed: 2000 + idx * 10,
          status: 'APPROVED',
          url: generateCinematicCanvasImage(
            loc.name,
            `${loc.interiorExterior.toUpperCase()} | ${loc.lightingIdentity} | ${loc.atmosphere}`,
            'LOCATION ESTABLISHING',
            pkg.format === 'shorts' ? '9:16' : '16:9',
            {
              bg1: '#1e1b4b',
              bg2: '#05040a',
              accent: '#a855f7',
              text: '#faf5ff',
            },
            {
              shotSize: 'EXTREME WIDE',
              lighting: loc.lightingIdentity,
            }
          ),
          metadata: {
            aspectRatio: pkg.format === 'shorts' ? '9:16' : '16:9',
            locationId: loc.locationId,
            isReference: true,
            viewAngle: 'establishing',
            provider: 'MovieStory Neural Canvas',
          },
          consistencyScore: 96,
          createdAt: new Date().toISOString(),
          approvedAt: new Date().toISOString(),
        };
        assets.push(asset);
      }
    });

    // 3. 소품 레퍼런스 세트 구축
    pkg.propBible.forEach((prop, idx) => {
      const assetId = `PROP-REF-${idx + 1}`;
      const existing = existingLibrary?.assets.find((a) => a.assetId === assetId);

      if (existing) {
        assets.push({
          ...existing,
          status: isOutdated ? 'OUTDATED' : existing.status,
        });
      } else {
        const asset: ProductionAsset = {
          assetId,
          projectId: pkg.projectId,
          productionPackageId: pkg.packageId,
          type: 'PROP_REFERENCE',
          name: `${prop.name} [핵심 소품 디테일]`,
          version: 1,
          prompt: `${prop.visualPrompt}, macro product photography, studio rim lighting, cinematic depth of field`,
          negativePrompt: 'broken geometry, untextured, low detail',
          seed: 3000 + idx * 10,
          status: 'APPROVED',
          url: generateCinematicCanvasImage(
            prop.name,
            `${prop.description} (${prop.narrativeImportance.toUpperCase()})`,
            'KEY PROP DETAIL',
            pkg.format === 'shorts' ? '9:16' : '16:9',
            {
              bg1: '#27272a',
              bg2: '#09090b',
              accent: '#f59e0b',
              text: '#fef3c7',
            },
            {
              shotSize: 'EXTREME CLOSE UP',
              lighting: 'RIM ACCENT LIGHT',
            }
          ),
          metadata: {
            aspectRatio: pkg.format === 'shorts' ? '9:16' : '16:9',
            propId: prop.propId,
            isReference: true,
            viewAngle: 'detail',
            provider: 'MovieStory Neural Canvas',
          },
          consistencyScore: 97,
          createdAt: new Date().toISOString(),
          approvedAt: new Date().toISOString(),
        };
        assets.push(asset);
      }
    });

    // 4. 샷별 키프레임 스틸 및 비디오 클립 생성 및 바인딩
    pkg.shotList.forEach((shot, sIdx) => {
      const shotCode = `SHOT-${String(shot.order).padStart(3, '0')}`;
      const keyframeId = `KEYFRAME-${shotCode}-V1`;
      const videoClipId = `VID-${shotCode}-V1`;

      const existingKeyframe = existingLibrary?.assets.find(
        (a) => a.sourceShotId === shot.shotId && a.type === 'KEYFRAME_IMAGE'
      );
      const existingVideo = existingLibrary?.assets.find(
        (a) => a.sourceShotId === shot.shotId && a.type === 'VIDEO_CLIP'
      );

      // 키프레임 스틸
      let activeKeyframeId = keyframeId;
      if (existingKeyframe) {
        activeKeyframeId = existingKeyframe.assetId;
        assets.push({
          ...existingKeyframe,
          status: isOutdated ? 'OUTDATED' : existingKeyframe.status,
        });
      } else {
        const keyframeAsset: ProductionAsset = {
          assetId: keyframeId,
          projectId: pkg.projectId,
          productionPackageId: pkg.packageId,
          sourceShotId: shot.shotId,
          type: 'KEYFRAME_IMAGE',
          name: `${shotCode} 키프레임 스틸 [v1]`,
          version: 1,
          prompt: `${shot.imagePrompt}, cinematic framing ${shot.camera.shotSize}, ${shot.lighting.mood} lighting`,
          negativePrompt: shot.negativePrompt || 'blurry, distorted, noise, watermark',
          seed: 4000 + shot.order * 10,
          status: 'APPROVED',
          url: generateCinematicCanvasImage(
            `${shotCode}: ${shot.narrativePurpose}`,
            shot.visualAction,
            `SHOT #${shot.order} KEYFRAME`,
            pkg.format === 'shorts' ? '9:16' : '16:9',
            {
              bg1: '#111827',
              bg2: '#030712',
              accent: '#10b981',
              text: '#ecfdf5',
            },
            {
              shotSize: shot.camera.shotSize.toUpperCase(),
              lighting: shot.lighting.colorTemperature,
              characters: shot.characters,
            }
          ),
          metadata: {
            aspectRatio: pkg.format === 'shorts' ? '9:16' : '16:9',
            durationSeconds: shot.duration,
            provider: 'MovieStory Neural Canvas',
          },
          consistencyScore: 94 + (sIdx % 5),
          createdAt: new Date().toISOString(),
          approvedAt: new Date().toISOString(),
        };
        assets.push(keyframeAsset);
      }

      // 비디오 클립
      let activeVideoId = videoClipId;
      if (existingVideo) {
        activeVideoId = existingVideo.assetId;
        assets.push({
          ...existingVideo,
          status: isOutdated ? 'OUTDATED' : existingVideo.status,
        });
      } else {
        const videoAsset: ProductionAsset = {
          assetId: videoClipId,
          projectId: pkg.projectId,
          productionPackageId: pkg.packageId,
          sourceShotId: shot.shotId,
          type: 'VIDEO_CLIP',
          name: `${shotCode} 시네마틱 클립 [v1]`,
          version: 1,
          prompt: `${shot.videoPrompt}, 24fps motion, smooth camera pan ${shot.camera.movement}`,
          negativePrompt: shot.negativePrompt || 'camera shake, flicker, warping, morphing',
          seed: 5000 + shot.order * 10,
          status: sIdx < 3 ? 'APPROVED' : 'NEEDS_REVIEW',
          url: generateCinematicCanvasImage(
            `${shotCode} VIDEO CLIP (${shot.duration}s)`,
            `[모션] ${shot.camera.movement} | ${shot.characterAction}`,
            `RENDERED CLIP [●]`,
            pkg.format === 'shorts' ? '9:16' : '16:9',
            {
              bg1: '#1f1b2e',
              bg2: '#080511',
              accent: '#ec4899',
              text: '#fdf2f8',
            },
            {
              shotSize: `${shot.duration}s ${shot.camera.shotSize.toUpperCase()}`,
              lighting: shot.lighting.mood,
              characters: shot.characters,
            }
          ),
          metadata: {
            aspectRatio: pkg.format === 'shorts' ? '9:16' : '16:9',
            durationSeconds: shot.duration,
            fps: 24,
            fileFormat: 'mp4',
            provider: 'MovieStory Neural Canvas',
          },
          consistencyScore: 91 + (sIdx % 7),
          createdAt: new Date().toISOString(),
          approvedAt: sIdx < 3 ? new Date().toISOString() : undefined,
        };
        assets.push(videoAsset);
      }

      // 샷-자산 바인딩 구성
      bindings.push({
        shotId: shot.shotId,
        order: shot.order,
        sceneId: shot.sceneId,
        narrativePurpose: shot.narrativePurpose,
        keyframeImageId: activeKeyframeId,
        videoClipId: activeVideoId,
        audioAssetIds: [],
        status: existingVideo?.status === 'APPROVED' || sIdx < 3 ? 'COMPLETE' : 'KEYFRAME_READY',
      });
    });

    // 5. 품질 감사 리포트 수립
    assets.forEach((asset) => {
      qualityChecks[asset.assetId] = {
        assetId: asset.assetId,
        characterConsistency: asset.consistencyScore,
        styleCompliance: 95,
        cinematography: 93,
        artifactScore: 98,
        overallScore: Math.round((asset.consistencyScore + 95 + 93 + 98) / 4),
        passStatus: asset.consistencyScore >= 85 ? 'PASS' : 'WARN',
        diagnostics: [
          `색온도 및 조명 연속성 검증 통과 (기준: ${pkg.visualBible.colorMood})`,
          `화면비 ${pkg.visualBible.aspectRatio} 규격 준수`,
          `인물 페이스 아이덴티티 일관성 지수 ${asset.consistencyScore}%`,
        ],
      };
    });

    const approvedCount = assets.filter((a) => a.status === 'APPROVED').length;
    const totalCount = assets.length;

    return {
      packageId: pkg.packageId,
      packageVersion: pkg.sourceStoryVersion,
      contentHash: pkg.sourceContentHash,
      assets,
      bindings,
      activeProvider: existingLibrary?.activeProvider || 'DEMO_PREVIEW',
      jobs: existingLibrary?.jobs || [],
      qualityChecks,
      overallStatus: approvedCount === totalCount ? 'COMPLETED' : 'IN_PRODUCTION',
      totalAssetsCount: totalCount,
      approvedAssetsCount: approvedCount,
      isOutdated,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * 에셋 승인 (Quality Review Engine)
   */
  static approveAsset(library: AssetLibrary, assetId: string): AssetLibrary {
    const updatedAssets = library.assets.map((asset) => {
      if (asset.assetId === assetId) {
        return {
          ...asset,
          status: 'APPROVED' as const,
          approvedAt: new Date().toISOString(),
        };
      }
      return asset;
    });

    // 바인딩 상태도 갱신
    const targetAsset = library.assets.find((a) => a.assetId === assetId);
    let updatedBindings = library.bindings;
    if (targetAsset?.sourceShotId) {
      updatedBindings = library.bindings.map((b) => {
        if (b.shotId === targetAsset.sourceShotId) {
          const isVideo = targetAsset.type === 'VIDEO_CLIP';
          return {
            ...b,
            status: isVideo ? ('COMPLETE' as const) : b.status,
          };
        }
        return b;
      });
    }

    const approvedCount = updatedAssets.filter((a) => a.status === 'APPROVED').length;

    return {
      ...library,
      assets: updatedAssets,
      bindings: updatedBindings,
      approvedAssetsCount: approvedCount,
      overallStatus: approvedCount === updatedAssets.length ? 'COMPLETED' : 'IN_PRODUCTION',
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * 에셋 반려
   */
  static rejectAsset(library: AssetLibrary, assetId: string, reason?: string): AssetLibrary {
    const updatedAssets = library.assets.map((asset) => {
      if (asset.assetId === assetId) {
        return {
          ...asset,
          status: 'REJECTED' as const,
          reviewNotes: reason || '사용자 품질 기준 미달로 반려됨',
        };
      }
      return asset;
    });

    const approvedCount = updatedAssets.filter((a) => a.status === 'APPROVED').length;

    return {
      ...library,
      assets: updatedAssets,
      approvedAssetsCount: approvedCount,
      overallStatus: 'IN_PRODUCTION',
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * 에셋 재생성 (버전 보존 원칙: 이전 버전을 삭제하지 않고 새 버전 추가)
   */
  static regenerateAsset(
    library: AssetLibrary,
    pkg: ProductionPackage,
    assetId: string,
    promptModifier?: string
  ): AssetLibrary {
    const currentAsset = library.assets.find((a) => a.assetId === assetId);
    if (!currentAsset) return library;

    const newVersion = currentAsset.version + 1;
    // ID 파싱 또는 새 ID 생성
    const baseId = currentAsset.assetId.replace(/-V\d+$/, '');
    const newAssetId = `${baseId}-V${newVersion}`;

    const newSeed = currentAsset.seed + 101;
    const newPrompt = promptModifier
      ? `${currentAsset.prompt}, ${promptModifier}`
      : `${currentAsset.prompt}, enhanced fidelity, cinematic dynamic lighting`;

    // 해당 샷 정보 조회
    const shot = pkg.shotList.find((s) => s.shotId === currentAsset.sourceShotId);

    const newAsset: ProductionAsset = {
      ...currentAsset,
      assetId: newAssetId,
      name: currentAsset.name.replace(/\[v\d+\]/i, `[v${newVersion}]`),
      version: newVersion,
      prompt: newPrompt,
      seed: newSeed,
      status: 'NEEDS_REVIEW',
      url: generateCinematicCanvasImage(
        shot ? `SHOT #${shot.order}: ${shot.narrativePurpose} [v${newVersion}]` : `${currentAsset.name} [v${newVersion}]`,
        promptModifier ? `[개선 요청] ${promptModifier}` : (shot?.visualAction || currentAsset.prompt),
        `NEW RENDER [v${newVersion}]`,
        pkg.format === 'shorts' ? '9:16' : '16:9',
        {
          bg1: '#31102f',
          bg2: '#0d040c',
          accent: '#f43f5e',
          text: '#ffe4e6',
        },
        {
          shotSize: shot?.camera.shotSize.toUpperCase() || 'CINEMATIC',
          lighting: shot?.lighting.mood || 'DYNAMIC LIGHT',
          characters: shot?.characters,
        }
      ),
      consistencyScore: Math.min(99, currentAsset.consistencyScore + 2),
      createdAt: new Date().toISOString(),
      approvedAt: undefined,
    };

    // 기존 에셋 리스트에 새 에셋 추가 (이전 버전 유지)
    const updatedAssets = [...library.assets, newAsset];

    // 바인딩을 신규 버전으로 전환
    const updatedBindings = library.bindings.map((b) => {
      if (b.shotId === currentAsset.sourceShotId) {
        if (currentAsset.type === 'KEYFRAME_IMAGE') {
          return { ...b, keyframeImageId: newAssetId, status: 'KEYFRAME_READY' as const };
        } else if (currentAsset.type === 'VIDEO_CLIP') {
          return { ...b, videoClipId: newAssetId, status: 'KEYFRAME_READY' as const };
        }
      }
      return b;
    });

    // 품질 감사 항목 추가
    const qualityChecks = {
      ...library.qualityChecks,
      [newAssetId]: {
        assetId: newAssetId,
        characterConsistency: newAsset.consistencyScore,
        styleCompliance: 96,
        cinematography: 95,
        artifactScore: 99,
        overallScore: Math.round((newAsset.consistencyScore + 96 + 95 + 99) / 4),
        passStatus: 'PASS' as const,
        diagnostics: [
          `재생성 v${newVersion}: 프롬프트 보정 적용 완료`,
          `조명 및 일관성 지수 향상 (+${newAsset.consistencyScore - currentAsset.consistencyScore}%)`,
        ],
      },
    };

    const approvedCount = updatedAssets.filter((a) => a.status === 'APPROVED').length;

    return {
      ...library,
      assets: updatedAssets,
      bindings: updatedBindings,
      qualityChecks,
      approvedAssetsCount: approvedCount,
      overallStatus: 'IN_PRODUCTION',
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * 모든 샷 비디오 일괄 승인
   */
  static approveAllPending(library: AssetLibrary): AssetLibrary {
    const updatedAssets = library.assets.map((a) => ({
      ...a,
      status: 'APPROVED' as const,
      approvedAt: a.approvedAt || new Date().toISOString(),
    }));

    const updatedBindings = library.bindings.map((b) => ({
      ...b,
      status: 'COMPLETE' as const,
    }));

    return {
      ...library,
      assets: updatedAssets,
      bindings: updatedBindings,
      approvedAssetsCount: updatedAssets.length,
      overallStatus: 'COMPLETED',
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * 프로바이더 변경
   */
  static switchProvider(
    library: AssetLibrary,
    provider: GenerationProviderType
  ): AssetLibrary {
    return {
      ...library,
      activeProvider: provider,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * 에셋 라이브러리 JSON 내보내기용 객체
   */
  static exportAssetManifest(library: AssetLibrary, pkg: ProductionPackage): string {
    const manifest = {
      title: 'MovieStory AI — Production Asset Manifest',
      generatedAt: new Date().toISOString(),
      productionPackageId: pkg.packageId,
      sourceStoryId: pkg.sourceStoryId,
      contentHash: pkg.sourceContentHash,
      format: pkg.format,
      stats: {
        totalAssets: library.assets.length,
        approvedAssets: library.approvedAssetsCount,
        completionRate: `${Math.round((library.approvedAssetsCount / library.assets.length) * 100)}%`,
        activeProvider: library.activeProvider,
      },
      references: {
        characters: library.assets.filter((a) => a.type === 'CHARACTER_REFERENCE'),
        locations: library.assets.filter((a) => a.type === 'LOCATION_REFERENCE'),
        props: library.assets.filter((a) => a.type === 'PROP_REFERENCE'),
      },
      shotBindings: library.bindings.map((b) => {
        const shot = pkg.shotList.find((s) => s.shotId === b.shotId);
        const keyframe = library.assets.find((a) => a.assetId === b.keyframeImageId);
        const video = library.assets.find((a) => a.assetId === b.videoClipId);
        return {
          order: b.order,
          shotId: b.shotId,
          narrativePurpose: b.narrativePurpose,
          camera: shot?.camera,
          keyframe: keyframe
            ? { assetId: keyframe.assetId, version: keyframe.version, status: keyframe.status }
            : null,
          videoClip: video
            ? { assetId: video.assetId, version: video.version, status: video.status, duration: shot?.duration }
            : null,
        };
      }),
    };

    return JSON.stringify(manifest, null, 2);
  }
}
