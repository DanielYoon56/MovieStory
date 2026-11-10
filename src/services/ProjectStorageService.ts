/**
 * ProjectStorageService
 * Handles LocalStorage persistence, auto-save, project management, and exporting.
 */

import { Project, StoryOutput, ScriptProduction, MovieItem, MovieAnalysis, StoryMotif, ProductionPackage } from '../types';

const STORAGE_KEY = 'moviestory_ai_projects_v1';
const CURRENT_PROJECT_ID_KEY = 'moviestory_ai_active_project_id';

export class ProjectStorageService {
  private static memoryStore: Record<string, string> = {};

  private static getStorageItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
      return this.memoryStore[key] || null;
    } catch {
      return this.memoryStore[key] || null;
    }
  }

  private static setStorageItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
      this.memoryStore[key] = value;
    } catch {
      this.memoryStore[key] = value;
    }
  }

  public static getAllProjects(): Project[] {
    try {
      const raw = this.getStorageItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to load projects from storage', e);
      return [];
    }
  }

  public static getProject(id: string): Project | null {
    const list = this.getAllProjects();
    return list.find((p) => p.id === id) || null;
  }

  public static getActiveProjectId(): string | null {
    try {
      return this.getStorageItem(CURRENT_PROJECT_ID_KEY);
    } catch {
      return null;
    }
  }

  public static setActiveProjectId(id: string): void {
    try {
      this.setStorageItem(CURRENT_PROJECT_ID_KEY, id);
    } catch (e) {
      console.error(e);
    }
  }

  private static removeStorageItem(key: string): void {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
      delete this.memoryStore[key];
    } catch {
      delete this.memoryStore[key];
    }
  }

  public static saveProject(project: Project): void {
    try {
      const list = this.getAllProjects();
      const updated = {
        ...project,
        updatedAt: new Date().toISOString()
      };

      const index = list.findIndex((p) => p.id === project.id);
      if (index >= 0) {
        list[index] = updated;
      } else {
        list.unshift(updated);
      }

      this.setStorageItem(STORAGE_KEY, JSON.stringify(list));
      this.setActiveProjectId(project.id);
    } catch (e) {
      console.error('Failed to save project', e);
    }
  }

  public static deleteProject(id: string): void {
    try {
      const list = this.getAllProjects().filter((p) => p.id !== id);
      this.setStorageItem(STORAGE_KEY, JSON.stringify(list));
      if (this.getActiveProjectId() === id) {
        this.removeStorageItem(CURRENT_PROJECT_ID_KEY);
      }
    } catch (e) {
      console.error('Failed to delete project', e);
    }
  }

  public static duplicateProject(id: string): Project | null {
    const orig = this.getProject(id);
    if (!orig) return null;

    const copy: Project = {
      ...orig,
      id: `proj-${Date.now()}`,
      name: `${orig.name} (사본)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.saveProject(copy);
    return copy;
  }

  public static createNewProject(initialName?: string): Project {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name: initialName || `새 창작 프로젝트 #${Math.floor(Math.random() * 900 + 100)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      currentStep: 1,
      selectedMotifs: [],
      safeMode: true,
      rightsRecords: [
        {
          assetType: 'narrative',
          source: 'MovieStory AI Abstract Transformation Engine',
          license: '100% Original Derivative Work',
          commercialUseAllowed: true,
          derivationAllowed: true,
          attributionRequired: false,
          verificationStatus: 'verified_original'
        }
      ]
    };

    this.saveProject(newProj);
    return newProj;
  }

  public static exportScriptAsMarkdown(story?: StoryOutput, script?: ScriptProduction): string {
    if (!story) return '';

    let md = `# ${story.title}\n\n`;
    md += `> **로그라인**: ${story.logline}\n\n`;
    md += `- **영감을 받은 영화**: ${story.originalMovieTitle}\n`;
    md += `- **선택된 창작 모티브**: ${story.motifTitle}\n`;
    md += `- **장르**: ${story.targetGenre} | **시대/배경**: ${story.era} (${story.setting})\n`;
    md += `- **핵심 인생 주제**: ${story.coreTheme}\n`;

    if (story.creativeDistanceReview) {
      md += `- **Creative Distance Review**: 인물 [${story.creativeDistanceReview.characterSeparation}], 공간 [${story.creativeDistanceReview.settingSeparation}], 서사 [${story.creativeDistanceReview.plotSeparation}]\n`;
      md += `  *고지: ${story.creativeDistanceReview.disclaimer}*\n\n`;
    } else {
      md += `- **독창성 점수**: ${story.storyDnaReview.overallOriginalityScore}% (Safe Mode)\n\n`;
    }

    if (story.storyPremise) {
      md += `## 1. Story Premise & 중심 질문\n\n`;
      md += `- **핵심 질문 (Dramatic Question)**: ${story.storyPremise.dramaticQuestion}\n`;
      md += `- **주인공의 Want (표면적 욕망)**: ${story.storyPremise.want}\n`;
      md += `- **주인공의 Need (진정한 성장 결핍)**: ${story.storyPremise.need}\n`;
      md += `- **치명적 결점 (Flaw)**: ${story.storyPremise.flaw}\n`;
      md += `- **중심 갈등**: ${story.storyPremise.centralConflict}\n\n`;
    }

    if (story.storyBible) {
      md += `## 2. Story Bible & 직업·공간 필연성\n\n`;
      md += `### ${story.storyBible.protagonist.name} (${story.storyBible.protagonist.occupation})\n`;
      md += `- **직업의 필연성**: ${story.storyBible.protagonist.occupationNecessity}\n`;
      md += `- **무대 공간의 필연성**: ${story.storyBible.setting.locationNecessity}\n`;
      md += `- **인물의 내적 변화 (Arc)**:\n`;
      md += `  * 시작 신념: ${story.storyBible.characterArc.initialBelief}\n`;
      md += `  * 결정적 깨달음: ${story.storyBible.characterArc.realization}\n`;
      md += `  * 최종 선택: ${story.storyBible.characterArc.finalChoice}\n`;
      md += `  * 최종 변화: ${story.storyBible.characterArc.finalState}\n\n`;
    } else {
      md += `## 주요 인물 구성\n\n`;
      story.characters.forEach((c) => {
        md += `### ${c.name} (${c.role}, ${c.age})\n`;
        md += `- **외모**: ${c.appearance}\n`;
        md += `- **성격**: ${c.personality}\n`;
        md += `- **내적 갈등**: ${c.internalConflict}\n\n`;
      });
    }

    if (story.plotBlueprint && story.plotBlueprint.causalChain.length > 0) {
      md += `## 3. Causal Chain (사건 인과 체인)\n\n`;
      story.plotBlueprint.causalChain.forEach((link, idx) => {
        md += `**[${idx + 1}] [${link.connector}]** ${link.event}\n`;
        md += `  - *원인*: ${link.causedBy}\n`;
        md += `  - *결과*: ${link.consequence}\n\n`;
      });
    }

    md += `## 4. 4막 서사 전개\n\n`;
    md += `**[발단]**\n${story.plot.act1}\n\n`;
    md += `**[전개]**\n${story.plot.act2}\n\n`;
    md += `**[절정]**\n${story.plot.climax}\n\n`;
    md += `**[결말]**\n${story.plot.resolution}\n\n`;

    if (story.fullNarrativeText) {
      md += `## 5. 완결 서사 본문 (Full Narrative)\n\n${story.fullNarrativeText}\n\n`;
    }

    if (script && script.scenes.length > 0) {
      md += `\n---\n\n## 6. 인과적 영상 대본 및 스토리보드 (${script.format === 'shorts' ? '60초 쇼츠' : '16:9 시네마'})\n\n`;
      script.scenes.forEach((s) => {
        md += `### Scene ${s.sceneNumber}. ${s.title} [${s.causalRole || 'Scene'}]\n`;
        md += `- **인과 연결**: ${s.causalConnector || 'NORMAL'}\n`;
        md += `- **장소/시간**: ${s.location} (${s.timeOfDay}) | **예상 길이**: 약 ${s.estimatedDurationSeconds}초\n`;
        md += `- **상황**: ${s.situation}\n`;
        md += `- **연출/지문**: ${s.action}\n`;
        md += `- **카메라/조명**: ${s.cameraAngle} / ${s.lighting}\n`;
        md += `- **사운드**: BGM: ${s.audioCue} | SFX: ${s.soundEffect}\n\n`;
        md += `**대사:**\n`;
        s.dialogue.forEach((d) => {
          md += `> **${d.speaker}** (${d.emotionTag || '차분히'}): ${d.text}\n`;
        });
        md += `\n**AI 비주얼 생성 프롬프트:**\n\`\`\`\n${s.visualPrompt}\n\`\`\`\n\n`;
      });
    }

    return md;
  }

  public static exportProductionPackageAsMarkdown(
    pkg: ProductionPackage,
    story?: StoryOutput
  ): string {
    let md = `# [MovieStory AI] Production Specification Package\n\n`;
    md += `**작품명**: ${story?.title || '작품'} (${pkg.format === 'shorts' ? '9:16 세로형 쇼츠 60초' : '16:9 와이드 시네마 180초'})\n`;
    md += `- **Package ID**: \`${pkg.packageId}\`\n`;
    md += `- **Content Hash**: \`${pkg.sourceContentHash}\`\n`;
    md += `- **Production Readiness**: **${pkg.readinessReport.score}점** (${pkg.readinessReport.readyForVideoGeneration ? 'READY FOR PRODUCTION' : 'AUDIT REQUIRED'})\n\n`;

    md += `---\n\n## 1. Production Manifest & 타임라인\n\n`;
    md += `- **총 러닝타임**: 약 ${pkg.productionManifest.timeline.totalDuration}초\n`;
    md += `- **씬 수**: ${pkg.productionManifest.timeline.scenes}개 씬\n`;
    md += `- **샷 수**: ${pkg.productionManifest.timeline.shots}개 샷 (원자적 분해 완료)\n`;
    md += `- **비주얼 화각**: ${pkg.visualBible.aspectRatio}\n`;
    md += `- **영상 스타일**: ${pkg.visualBible.visualStyle}\n`;
    md += `- **컬러 무드**: ${pkg.visualBible.colorMood}\n\n`;

    md += `## 2. Character Bible (인물 외형 및 연속성 가이드)\n\n`;
    pkg.characterBible.forEach((char) => {
      md += `### [${char.role.toUpperCase()}] ${char.name} (${char.ageRange})\n`;
      md += `- **직업**: ${char.occupation || '미지정'}\n`;
      md += `- **얼굴/외모**: ${char.appearance.face}, ${char.appearance.eyes}\n`;
      md += `- **헤어/체형**: ${char.appearance.hair}, ${char.appearance.body}\n`;
      md += `- **시그니처 의상**: ${char.costume.primary}\n`;
      if (char.costume.accessories.length > 0) {
        md += `- **주요 액세서리**: ${char.costume.accessories.join(', ')}\n`;
      }
      md += `- **감정 기저선**: ${char.emotionalBaseline}\n`;
      md += `- **인물 연속성 규칙**:\n`;
      char.continuityRules.forEach((r) => (md += `  * ${r}\n`));
      md += `\n**인물 비주얼 프롬프트:**\n\`\`\`\n${char.visualIdentityPrompt}\n\`\`\`\n\n`;
    });

    md += `## 3. Location Bible (장소별 조명 및 환경 가이드)\n\n`;
    pkg.locationBible.forEach((loc) => {
      md += `### ${loc.name} [${loc.interiorExterior.toUpperCase()}]\n`;
      md += `- **서사적 기능**: ${loc.narrativeFunction}\n`;
      md += `- **건축 양식**: ${loc.architecture}\n`;
      md += `- **조명 정체성**: ${loc.lightingIdentity}\n`;
      md += `- **분위기**: ${loc.atmosphere}\n`;
      md += `- **고정 소품**: ${loc.permanentProps.join(', ')}\n`;
      md += `\n**장소 프롬프트:**\n\`\`\`\n${loc.locationPrompt}\n\`\`\`\n\n`;
    });

    md += `## 4. Critical Prop Bible (핵심 소품 상태 추적)\n\n`;
    pkg.propBible.forEach((prop) => {
      md += `### ${prop.name} [중요도: ${prop.narrativeImportance}]\n`;
      md += `- **상세 묘사**: ${prop.description}\n`;
      md += `- **첫 등장**: Scene ${prop.firstAppearance}\n`;
      md += `- **상태 변화 추적**:\n`;
      prop.stateHistory.forEach((sh) => (md += `  * [${sh.sceneOrShot}] ${sh.state}: ${sh.description}\n`));
      md += `\n**소품 프롬프트:**\n\`\`\`\n${prop.visualPrompt}\n\`\`\`\n\n`;
    });

    md += `## 5. Visual Bible & Aesthetic Guide\n\n`;
    md += `- **Aspect Ratio**: ${pkg.visualBible.aspectRatio}\n`;
    md += `- **Lens Preference**: ${pkg.visualBible.lensPreference}\n`;
    md += `- **Lighting Style**: ${pkg.visualBible.lightingStyle}\n`;
    md += `- **Camera Style**: ${pkg.visualBible.cameraStyle}\n`;
    md += `- **Texture Style**: ${pkg.visualBible.textureStyle}\n`;
    md += `- **Negative Prompt**: \`${pkg.visualBible.negativePrompt || 'N/A'}\`\n\n`;
    md += `**마스터 글로벌 비주얼 프롬프트:**\n\`\`\`\n${pkg.visualBible.globalVisualPrompt}\n\`\`\`\n\n`;

    md += `## 6. Production Shot List (총 ${pkg.shotList.length}개 샷)\n\n`;
    pkg.shotList.forEach((shot) => {
      md += `### [Shot ${shot.order}] ${shot.shotId} | [${shot.sceneId}] (${shot.startTime}s - ${shot.endTime}s, 길이: ${shot.duration}초)\n`;
      md += `- **서사적 목적**: ${shot.narrativePurpose}\n`;
      md += `- **카메라**: ${shot.camera.shotSize} | ${shot.camera.angle} | ${shot.camera.movement}\n`;
      md += `- **조명**: ${shot.lighting.keyLight} (${shot.lighting.contrast})\n`;
      md += `- **사운드**: ${shot.sound.ambience.join(', ')} | SFX: ${shot.sound.soundEffects.join(', ')}\n`;
      md += `- **시각적 행동**: ${shot.visualAction}\n`;
      md += `- **인물 모션**: ${shot.characterAction} (${shot.emotionalState})\n`;
      if (shot.dialogue && shot.dialogue.length > 0) {
        shot.dialogue.forEach((d) => (md += `> **${d.speaker}**: ${d.text}\n`));
      }
      md += `\n**AI 이미지 스틸 프롬프트 (Image Prompt):**\n\`\`\`\n${shot.imagePrompt}\n\`\`\`\n`;
      md += `\n**AI 비디오 모션 프롬프트 (Video Prompt):**\n\`\`\`\n${shot.videoPrompt}\n\`\`\`\n\n`;
    });

    md += `## 7. Production Readiness Audit\n\n`;
    md += `- **최종 준비도 점수**: ${pkg.readinessReport.score} / 100\n`;
    md += `- **스토리 동기화**: ${pkg.readinessReport.storySync ? '통과 (20/20)' : '미흡'}\n`;
    md += `- **인물 일관성**: ${pkg.readinessReport.characterConsistency ? '통과 (10/10)' : '미흡'}\n`;
    md += `- **장소 일관성**: ${pkg.readinessReport.locationConsistency ? '통과 (10/10)' : '미흡'}\n`;
    md += `- **소품 연속성**: ${pkg.readinessReport.propContinuity ? '통과 (10/10)' : '미흡'}\n`;
    md += `- **비주얼 바이블**: ${pkg.readinessReport.visualStyleDefined ? '통과 (10/10)' : '미흡'}\n`;
    md += `- **샷 커버리지**: ${pkg.readinessReport.shotCoverage ? '통과 (15/15)' : '미흡'}\n`;
    md += `- **프롬프트 완성도**: ${pkg.readinessReport.promptCompleteness ? '통과 (15/15)' : '미흡'}\n`;
    md += `- **연속성 검사**: ${pkg.readinessReport.continuity ? '무결 (10/10)' : '주의 항목 발견'}\n`;

    return md;
  }
}

