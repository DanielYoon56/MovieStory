/**
 * ProductionPackageService
 *
 * Implements Step 5: Production Package Builder
 * - Phase 5-1: Real Input Data Connection (ScriptSourcePackage & ScriptProduction)
 * - Phase 5-2: Production Package Data Modeling
 * - Phase 5-3: Production Bible Generator (Character, Location, Prop, Visual Bibles)
 * - Phase 5-4: Shot Breakdown Engine (Scene != Video Clip, 2-8s atomic shots)
 * - Phase 5-5: AI Image & Video Prompt Generator
 * - Phase 5-6: Continuity Engine (Anomalies detection across shots)
 * - Phase 5-7: Production Readiness Audit Engine (Dynamic score calculation)
 *
 * FINAL RULE:
 * STEP 3 DECIDES THE STORY.
 * STEP 4 DECIDES THE CINEMATIC EXPRESSION.
 * STEP 5 DECIDES THE PRODUCTION SPECIFICATION.
 */

import {
  StoryOutput,
  ScriptProduction,
  ScriptScene,
  ScriptSourcePackage,
  ProductionPackage,
  CharacterProfile,
  LocationProfile,
  PropProfile,
  PropState,
  VisualBible,
  ProductionShot,
  CameraInstruction,
  LightingInstruction,
  SoundInstruction,
  ContinuityState,
  ProductionManifest,
  ProductionReadinessReport,
  VideoGenerationProvider,
  PreviewResult,
  VideoResult
} from '../types';
import { CausalEngine } from './CausalEngine';

export class ProductionPackageService {
  /**
   * Builds the comprehensive ProductionPackage from actual Step 3 & Step 4 real project data.
   */
  public static buildProductionPackage(
    projectId: string,
    story: StoryOutput,
    script: ScriptProduction
  ): ProductionPackage {
    const format = script.format === 'cinema' ? 'cinema' : 'shorts';

    // 1. Extract authoritative ScriptSourcePackage from Step 3 / 4
    const pkg: ScriptSourcePackage =
      script.sourcePackage || CausalEngine.buildScriptSourcePackage(story);
    const contentHash =
      script.versionInfo?.contentHash || pkg.contentHash || CausalEngine.computeStoryContentHash(story);

    // 2. Generate the 4 Core Production Bibles
    const characterBible = this.generateCharacterBible(pkg, story, script);
    const locationBible = this.generateLocationBible(pkg, script);
    const propBible = this.generatePropBible(pkg, script);
    const visualBible = this.generateVisualBible(pkg, format);

    // 3. Perform Shot Breakdown (Scene != Video Clip)
    const shotList = this.generateShotBreakdown(
      pkg,
      script.scenes,
      format,
      characterBible,
      locationBible,
      propBible,
      visualBible
    );

    // 4. Run Continuity Analysis across shots
    const continuityErrors = this.auditContinuity(shotList, characterBible, propBible);

    // 5. Generate Production Manifest
    const productionManifest = this.generateManifest(
      projectId,
      story.title,
      format,
      characterBible,
      locationBible,
      propBible,
      shotList,
      script.scenes.length
    );

    // 6. Run Production Readiness Audit
    const readinessReport = this.auditReadiness(
      pkg,
      script,
      characterBible,
      locationBible,
      propBible,
      visualBible,
      shotList,
      continuityErrors
    );

    const packageId = `prod-pkg-${story.id}-${format}-v${story.version || 1}`;

    return {
      packageId,
      projectId,
      sourceStoryId: story.id,
      sourceStoryVersion: story.version || 1,
      sourceContentHash: contentHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      format,
      characterBible,
      locationBible,
      propBible,
      visualBible,
      shotList,
      productionManifest,
      readinessReport
    };
  }

  // ==========================================
  // PHASE 5-3-A: Character Bible Generator
  // ==========================================
  private static generateCharacterBible(
    pkg: ScriptSourcePackage,
    story: StoryOutput,
    script: ScriptProduction
  ): CharacterProfile[] {
    const p = pkg.protagonist;
    const isHistorical = pkg.era.includes('조선') || pkg.era.includes('과거') || pkg.genre.some((g) => g.includes('사극'));
    const isSciFi = pkg.era.includes('미래') || pkg.era.includes('우주') || pkg.genre.some((g) => g.includes('SF'));
    const isRomance = pkg.genre.some((g) => g.includes('로맨스') || g.includes('멜로'));

    // Protagonist Profile
    const protagonistProfile: CharacterProfile = {
      characterId: `CHAR_${p.name.replace(/[^a-zA-Z0-9가-힣]/g, '_').toUpperCase()}`,
      name: p.name,
      role: 'protagonist',
      ageRange: typeof p.age === 'number' ? `${p.age}세` : p.age || '30대 중반',
      gender: '남성',
      nationality: isHistorical ? '조선' : isSciFi ? '지구연합 (궤도 거주민)' : '대한민국',
      occupation: p.occupation,
      appearance: {
        face: '정의감이 깃든 단정한 이목구비, 오랜 업무 집중으로 단련된 신중한 인상',
        eyes: '상대의 거짓을 꿰뚫어보는 날카롭고 깊은 흑갈색 눈동자',
        hair: isHistorical ? '단정하게 망건을 쓰고 상투를 튼 흑발' : '단정하게 커트된 짙은 흑발',
        body: '다부진 보통 체격, 규칙적인 일상과 긴장감으로 꼿꼿한 자세',
        distinctiveFeatures: [
          '미간 사이의 옅은 집중 주름',
          isHistorical ? '엄지와 검지에 밴 먹물 자국' : isSciFi ? '손목 안쪽의 데이터 단말기 인터페이스 포트' : '오른손 검지의 정밀 작업 흔적'
        ]
      },
      costume: {
        primary: isHistorical
          ? '남색 사관 도포와 흑색 갓, 가죽 붓주머니'
          : isSciFi
          ? '다크 네이비 테크니컬 유틸리티 슈트와 소매의 보안 인가 패치'
          : isRomance
          ? '차콜 톤의 오버핏 울 코트와 무채색 캐시미어 니트'
          : '짙은 감색 아카이브 작업 셔츠와 회색 유틸리티 조끼',
        secondary: isHistorical
          ? '야간 잠행용 짙은 무명 두루마기'
          : isSciFi
          ? '비상 구역 탈출용 은색 방열 재킷'
          : '비상 탈출용 방수 트렌치코트',
        accessories: isHistorical
          ? ['상아 재질의 호패', '밀봉 인장']
          : isSciFi
          ? ['암호화 키카드 펜던트', '초소형 골전도 이어셋']
          : ['가죽 스트랩 시계', '신분증 목걸이']
      },
      personalityVisualCues: [
        '단서를 검토할 때 양손으로 집어 들고 시선을 고정하는 습관',
        '결단을 내릴 때 코트나 조끼 깃을 매만지며 호흡을 가다듬음',
        '걸음걸이가 침착하며 주변을 경계하듯 신중함'
      ],
      emotionalBaseline: `${p.emotionalWound}에서 기인한 계산된 거리 두기와 억눌린 정의감`,
      visualIdentityPrompt: `${p.name}, a ${p.age || '34-year-old'} Korean ${p.occupation}, intense intelligent eyes, disciplined expression, wearing ${isHistorical ? 'Joseon dynasty dark blue scholar robe' : isSciFi ? 'dark navy futuristic technical work suit' : 'charcoal archive work shirt with utility vest'}, cinematic character concept art, realistic skin texture, 8k photorealistic`,
      continuityRules: [
        '얼굴 골격, 눈매, 흑발 스타일은 모든 샷에서 100% 동일하게 유지되어야 함',
        '의상의 색상과 시그니처 조끼/도포는 스토리상 명확한 사건 없이 바뀌지 않음',
        '주요 소품을 다룰 때의 신중하고 정밀한 손동작 버릇 유지'
      ]
    };

    // Supporting Character Profile
    const secondChar = story.characters[1] || {
      name: isHistorical ? '김사관' : isSciFi ? '강지수 수석연구원' : '강지수 분석관',
      role: '조력자 및 데이터 분석가',
      occupation: '정보 분석 전문가'
    };

    const supportingProfile: CharacterProfile = {
      characterId: `CHAR_${secondChar.name.replace(/[^a-zA-Z0-9가-힣]/g, '_').toUpperCase()}`,
      name: secondChar.name,
      role: 'supporting',
      ageRange: '30대 초반',
      gender: '여성',
      nationality: isHistorical ? '조선' : '대한민국',
      occupation: secondChar.occupation || '정보 분석관',
      appearance: {
        face: '냉철하고 지적인 인상, 날카로운 직관이 엿보이는 표정',
        eyes: '관찰력이 뛰어난 투명한 갈색 눈동자',
        hair: '단정하게 묶어 올린 로우 번 헤어스타일',
        body: '민첩하고 마른 체형',
        distinctiveFeatures: ['귓가에 꽂힌 펜/단말기', '신중하게 다문 입술']
      },
      costume: {
        primary: isHistorical
          ? '옥색 저고리와 감색 치마, 실용적인 덧저고리'
          : isSciFi
          ? '라이트 그레이 연구원 테크웨어 재킷'
          : '블랙 터틀넥과 슬림핏 차콜 재킷',
        accessories: ['휴대용 태블릿/서첩', '보안 열쇠']
      },
      personalityVisualCues: [
        '데이터를 검증할 때 한 손으로 안경이나 턱을 괴는 동작',
        '주인공에게 조언할 때 똑바로 눈을 맞추는 당당함'
      ],
      emotionalBaseline: '진실을 향한 냉철한 집념과 동료를 잃을까 두려워하는 은밀한 연민',
      visualIdentityPrompt: `${secondChar.name}, sharp intelligent 30-year-old Korean female analyst, low bun hair, dressed in professional sleek attire, photorealistic cinematic character portrait`,
      continuityRules: [
        '냉철한 지적 이미지를 일관되게 유지',
        '주인공과의 대면 샷에서 팽팽한 시선 교환 유지'
      ]
    };

    return [protagonistProfile, supportingProfile];
  }

  // ==========================================
  // PHASE 5-3-B: Location Bible Generator
  // ==========================================
  private static generateLocationBible(
    pkg: ScriptSourcePackage,
    script: ScriptProduction
  ): LocationProfile[] {
    const isHistorical = pkg.era.includes('조선') || pkg.era.includes('과거') || pkg.genre.some((g) => g.includes('사극'));
    const isSciFi = pkg.era.includes('미래') || pkg.era.includes('우주') || pkg.genre.some((g) => g.includes('SF'));

    const locations: LocationProfile[] = [
      {
        locationId: 'LOC_PRIMARY_WORKSPACE',
        name: isHistorical ? '규장각 비밀 서고 (내부)' : isSciFi ? '궤도 기지 통신 복원실 (내부)' : `${pkg.setting} 복원 분석실 (내부)`,
        narrativeFunction: '주인공의 일상적 안전지대이자 최초의 조작 흔적이 발견되는 발단 무대',
        era: pkg.era,
        architecture: isHistorical ? '조선 왕실 목조 서고, 높은 천장과 삼나무 서가' : isSciFi ? '밀폐형 메탈 격실, 곡면 모니터와 서버 랙' : '현대식 철제 선반과 강화유리 파티션',
        interiorExterior: 'interior',
        visualElements: isHistorical
          ? ['천장까지 닿은 고서 서가', '한지 창살 틈으로 드는 달빛', '먹물 냄새']
          : isSciFi
          ? ['서버 랙의 펄스 인디케이터', '투명 OLED 홀로그램 패널', '냉각 파이프']
          : ['디지털 판독 현미경', '바코드 리더기', '문서 보존용 항온항습 캐비닛'],
        permanentProps: ['중앙 정밀 분석 작업대', '데이터 판독 단말기', '문서 보관 궤짝'],
        lightingIdentity: isHistorical ? '창호지 푸른 달빛과 등잔불의 촛불 대비' : '차가운 시안 블루 LED와 국소 스탠드 스포트라이트',
        atmosphere: '적막하고 엄숙하며, 언제든 비밀이 드러날 수 있는 은밀한 긴장감',
        locationPrompt: `Cinematic wide interior establishing shot, ${isHistorical ? 'ancient Joseon royal archive, towering wooden book shelves, soft oil lantern glow' : isSciFi ? 'orbital communication research lab, metallic servers, neon cyan indicators' : 'sleek forensic archive lab, rows of metal document shelves, cold monitor glow'}, moody cinematic atmosphere, volumetric lighting, 8k photorealistic`,
        continuityRules: [
          '중앙 작업대의 위치와 배경 선반의 배치는 모든 씬에서 변함없이 고정',
          '내부 조명의 색온도(시안 4500K / 촛불 2700K)는 샷 간 일치해야 함'
        ]
      },
      {
        locationId: 'LOC_SECRET_MEETING',
        name: isHistorical ? '서고 뒤편 지하 통로' : isSciFi ? '비상 탈출 에어락 통로' : `${pkg.setting} 비상계단 및 지하 통로`,
        narrativeFunction: '외부 감시를 피해 조력자와 접선하고 위협에 직면하여 퇴로가 차단되는 위기 무대',
        era: pkg.era,
        architecture: isHistorical ? '화강암 벽면과 좁은 석조 통로' : isSciFi ? '격벽 도어가 설치된 비상 통로' : '콘크리트 비상계단과 방화문',
        interiorExterior: 'interior',
        visualElements: ['폐쇄적인 좁은 복도', '벽면의 그림자', '점멸하는 비상 조명'],
        permanentProps: ['비상 탈출 방화문', '배선 파이프'],
        lightingIdentity: '어둡고 짙은 암부, 점멸하는 붉은 비상등 또는 촛불 그림자',
        atmosphere: '폐쇄공포와 추격의 서스펜스가 극대화된 압박감',
        locationPrompt: `Claustrophobic cinematic corridor, heavy shadows, emergency lighting casting deep contrasts on metallic and concrete textures, intense thriller atmosphere`,
        continuityRules: ['탈출구 문의 위치와 비상등 점멸 주기를 일정하게 유지']
      },
      {
        locationId: 'LOC_CLIMAX_CONTROL',
        name: isHistorical ? '궐내 중앙 봉수대 및 어전 회랑' : isSciFi ? '궤도 정거장 메인 전송 통제실' : `${pkg.setting} 중앙 송출 통제 센터`,
        narrativeFunction: '거액의 회유를 물리치고 메인 스위치를 올려 진실을 외부에 송출하는 절정의 무대',
        era: pkg.era,
        architecture: isHistorical ? '웅장한 대청마루와 어전 회랑' : isSciFi ? '돔형 전송 제어 센터와 거대 송출 안테나 콘솔' : '대형 전광판과 메인 릴레이 콘솔이 완비된 통제실',
        interiorExterior: 'mixed',
        visualElements: ['거대한 중앙 제어 콘솔', '외부 통신 릴레이 배선', '메인 전원 레버'],
        permanentProps: ['메인 전원 릴레이 스위치', '전역 송출 단말기'],
        lightingIdentity: '눈부신 프로젝터 백색광과 붉은 비상 경보광의 극적인 충돌',
        atmosphere: '폭풍 전야의 팽팽한 결단과 압도적인 카타르시스',
        locationPrompt: `Cinematic control center during climax, massive transmission console illuminated with stark white beams and emergency indicators, high tension, epic scale`,
        continuityRules: ['메인 송출 스위치의 위치와 온/오프 상태가 샷의 인과와 일치할 것']
      },
      {
        locationId: 'LOC_RESOLUTION_HORIZON',
        name: isHistorical ? '궁궐 외곽의 탁 트인 언덕길' : isSciFi ? '우주 정거장 관측창 너머의 지구 지평선' : `${pkg.setting} 건물 너머의 아침 여명 거리`,
        narrativeFunction: '모든 조사를 마치고 법적 책임을 수용하며 진정한 내적 자유를 얻는 결말 무대',
        era: pkg.era,
        architecture: '자연과 문명이 교차하는 개방된 지평선',
        interiorExterior: 'exterior',
        visualElements: ['지평선 너머로 퍼지는 아침 황금빛 햇살', '상쾌한 새벽 공기', '고요해진 거리'],
        permanentProps: ['주인공의 짐가방 또는 신분증'],
        lightingIdentity: '부드럽고 따스하게 감싸는 아침 여명의 골든아워 자연광',
        atmosphere: '오랜 죄책감에서 벗어난 깊은 안도와 인생의 새로운 시작',
        locationPrompt: `Breathtaking cinematic wide sunrise horizon, golden morning light breaking through mist, peaceful open landscape, profound emotional catharsis`,
        continuityRules: ['태양의 위치와 그림자 길이가 평화로운 아침 시간대(06:30~07:00)로 일관될 것']
      }
    ];

    return locations;
  }

  // ==========================================
  // PHASE 5-3-C: Prop Bible Generator
  // ==========================================
  private static generatePropBible(
    pkg: ScriptSourcePackage,
    script: ScriptProduction
  ): PropProfile[] {
    const isHistorical = pkg.era.includes('조선') || pkg.era.includes('과거') || pkg.genre.some((g) => g.includes('사극'));
    const isSciFi = pkg.era.includes('미래') || pkg.era.includes('우주') || pkg.genre.some((g) => g.includes('SF'));

    const props: PropProfile[] = [
      {
        propId: 'PROP_EVIDENCE_RECORD',
        name: isHistorical ? '조작된 비밀 사초철' : isSciFi ? '암호화된 비상 백업 드라이브' : '위조 승인 직인이 찍힌 1차 감사 기록철',
        narrativeImportance: 'critical',
        description: isHistorical
          ? '붉은 어새가 시간보다 앞서 날인된 두루마리 사초, 가장자리가 미세하게 그을림'
          : isSciFi
          ? '티타늄 합금 케이스에 보관된 발광 인디케이터가 달린 64TB 양자 데이터 드라이브'
          : '붉은색 기밀 도장이 찍힌 두꺼운 크라프트지 서류철, 관리자 승인 코드가 위조됨',
        firstAppearance: 1,
        lastRequiredAppearance: script.scenes.length,
        owner: pkg.protagonist.name,
        stateHistory: [
          { sceneOrShot: 1, state: '발견', description: '작업대에서 이상 징후 및 일련번호 불일치 확인' },
          { sceneOrShot: 2, state: '복제 및 은닉', description: '품 안으로 숨겨져 비상구로 이동' },
          { sceneOrShot: 3, state: '증거 제시', description: '상대방의 회유 계약서와 대치하며 전송 준비' },
          { sceneOrShot: 4, state: '송출 완료 및 안전 보관', description: '외부 공개 완료 후 수사관들에게 제출' }
        ],
        continuityRules: [
          '사초의 그을림/드라이브의 시리얼 번호는 클로즈업 샷마다 동일해야 함',
          '주인공의 손에서 갑자기 사라지지 않고 항상 가방이나 안주머니에 위치'
        ],
        visualPrompt: `Extreme close up of ${isHistorical ? 'ancient Joseon scroll with red royal seal' : isSciFi ? 'futuristic encrypted titanium data drive with pulsing blue indicator' : 'confidential archive folder with stamped red serial code'}, tactile realism, micro dust particles, 8k cinematic macro`
      },
      {
        propId: 'PROP_COMPROMISE_DEAL',
        name: isHistorical ? '은폐 대가로 건넨 은화 궤짝' : isSciFi ? '본부의 비밀 귀환 보장 승인서' : '거액의 비밀 합의 계약서와 위로금 수표',
        narrativeImportance: 'critical',
        description: isHistorical
          ? '침묵을 대가로 제공된 백은 500냥이 든 놋쇠 장식 나무 궤짝'
          : isSciFi
          ? '골드 등급 안전 귀환 티켓과 침묵 서약이 명시된 디지털 인증서'
          : '거액의 위로금 수표가 동봉된 비밀 유지 및 퇴직 합의 계약서',
        firstAppearance: 2,
        lastRequiredAppearance: 3,
        owner: '은폐 세력 / 감사관',
        stateHistory: [
          { sceneOrShot: 2, state: '제시', description: '주인공의 앞길을 가로막으며 테이블 위로 들이밈' },
          { sceneOrShot: 3, state: '단호한 거절', description: '주인공에 의해 바닥으로 거칠게 밀쳐져 내동댕이쳐짐' }
        ],
        continuityRules: [
          '제시되는 금액과 계약서 서식은 씬 2와 씬 3에서 연속성을 유지',
          '씬 3에서 밀쳐진 후에는 바닥에 흩어진 상태로 배경에 잔존해야 함'
        ],
        visualPrompt: `Detailed prop still of ${isHistorical ? 'wooden chest overflowing with silver ingots' : 'official sealed non-disclosure settlement document with a signed indemnity check'}, heavy dramatic contrast`
      },
      {
        propId: 'PROP_MAIN_SWITCH',
        name: isHistorical ? '봉수대 점화 횃불 및 전령 밀부' : isSciFi ? '통신망 메인 릴레이 송출 스위치' : '전산실 메인 전송 비상 레버',
        narrativeImportance: 'critical',
        description: isHistorical
          ? '전국 봉수대를 즉시 점화할 수 있는 관인 인장이 새겨진 놋쇠 밀부'
          : isSciFi
          ? '안전 커버로 덮인 묵직한 적색 알루미늄 비상 업링크 레버'
          : '노란색 안전 가드가 장착된 고전압 전송 릴레이 수동 레버',
        firstAppearance: 3,
        lastRequiredAppearance: 3,
        owner: '통제 센터',
        stateHistory: [
          { sceneOrShot: 3, state: '차단 상태', description: '안전 커버가 닫혀 대기 중' },
          { sceneOrShot: 3, state: '가동 완료', description: '커버를 젖히고 위로 끝까지 밀어 올려 송출 시작' }
        ],
        continuityRules: [
          '레버가 올라간 이후 샷에서는 상태 표시등이 적색에서 백색/녹색으로 전환 유지'
        ],
        visualPrompt: `Macro shot of heavy industrial emergency transmission lever being flipped upward, sparks, safety guard swinging open, dramatic backlighting`
      }
    ];

    return props;
  }

  // ==========================================
  // PHASE 5-3-D: Visual Bible Generator
  // ==========================================
  private static generateVisualBible(
    pkg: ScriptSourcePackage,
    format: 'shorts' | 'cinema'
  ): VisualBible {
    const genreStr = pkg.genre.join(' ');
    const isHistorical = pkg.era.includes('조선') || pkg.era.includes('과거') || genreStr.includes('사극');
    const isSciFi = pkg.era.includes('미래') || pkg.era.includes('우주') || genreStr.includes('SF');
    const isRomance = genreStr.includes('로맨스') || genreStr.includes('멜로');

    const aspectRatio: '9:16' | '16:9' = format === 'shorts' ? '9:16' : '16:9';

    let visualStyle = 'Modern Cinematic Realism with high textural fidelity';
    let colorMood = 'Cold desaturated teal shadows with stark amber practical lights';
    let lightingStyle = 'Low-key chiaroscuro with directional motivated light sources';
    let cameraStyle = 'Deliberate controlled moves, intimate eye-level primes, kinetic handheld during crisis';

    if (isHistorical) {
      visualStyle = 'Classical Period Masterpiece with authentic tactile textures';
      colorMood = 'Deep indigo night atmosphere balanced with rich paper-lantern amber and cold dawn gold';
      lightingStyle = 'Natural firelight and moonlight contrast, volumetric smoke and paper textures';
      cameraStyle = 'Slow formal tracking shots, disciplined low-angle compositions, respectful framing';
    } else if (isSciFi) {
      visualStyle = 'Hard Sci-Fi Neo-Noir with industrial tactile interfaces';
      colorMood = 'Monochromatic steel cyan punctuated by stark crimson emergency alerts';
      lightingStyle = 'Harsh LED directional beams, lens flare, volumetric coolant haze';
      cameraStyle = 'Mechanical sliding dollies, geometric symmetrical framing, intense Dutch angles under stress';
    } else if (isRomance) {
      visualStyle = 'Poetic Cinematic Naturalism with tender emotional intimacy';
      colorMood = 'Soft warm golden-hour glow, muted pastel highlights, deep navy blue twilight';
      lightingStyle = 'Diffused window light, soft rim light, gentle reflective bounce';
      cameraStyle = 'Floating steadycam, tender medium close-ups, shallow focal depth with creamy bokeh';
    }

    const globalVisualPrompt = `Award-winning cinematic still, ${aspectRatio} aspect ratio, ${visualStyle}, ${colorMood}, ${lightingStyle}, 35mm anamorphic lens, realistic film grain, Masterpiece, 8k resolution, shot on Arri Alexa LF`;

    return {
      aspectRatio,
      visualStyle,
      realismLevel: 'Photorealistic film quality, zero CGI look',
      colorMood,
      lightingStyle,
      cameraStyle,
      lensPreference: '35mm & 50mm Anamorphic Prime Lenses, T1.5',
      depthOfField: 'Shallow to medium depth of field with cinematic subject separation',
      motionStyle: 'Restrained, natural human pacing, zero robotic or uncanny jitter',
      textureStyle: 'Tactile surface details, natural skin pores, realistic cloth fibers, atmospheric dust',
      negativePrompt:
        'cgi, 3d render, cartoon, anime, artificial smoothness, deformed hands, extra fingers, plastic skin, oversaturated, blurry, bad anatomy, text watermarks, duplicate objects',
      globalVisualPrompt
    };
  }

  // ==========================================
  // PHASE 5-4 & 5-5: Shot Breakdown & Prompt Generator
  // ==========================================
  private static generateShotBreakdown(
    pkg: ScriptSourcePackage,
    scenes: ScriptScene[],
    format: 'shorts' | 'cinema',
    characters: CharacterProfile[],
    locations: LocationProfile[],
    props: PropProfile[],
    visualBible: VisualBible
  ): ProductionShot[] {
    const shots: ProductionShot[] = [];
    const p = pkg.protagonist;
    const isShorts = format === 'shorts';

    let globalOrder = 1;
    let accumulatedTime = 0;

    scenes.forEach((scene, sceneIdx) => {
      const sceneDuration = scene.estimatedDurationSeconds || (isShorts ? 15 : 35);
      // Break each scene into 2 to 4 atomic shots of 2 to 8 seconds each
      const shotsInScene = isShorts ? (sceneIdx === 2 ? 3 : 2) : (sceneIdx === 3 ? 4 : 3);
      const baseDuration = Math.floor(sceneDuration / shotsInScene);
      const remainder = sceneDuration - baseDuration * shotsInScene;

      const locId =
        sceneIdx === 0
          ? locations[0]?.locationId || 'LOC_PRIMARY_WORKSPACE'
          : sceneIdx === 1
          ? locations[1]?.locationId || 'LOC_SECRET_MEETING'
          : sceneIdx === scenes.length - 1
          ? locations[locations.length - 1]?.locationId || 'LOC_RESOLUTION_HORIZON'
          : locations[2]?.locationId || 'LOC_CLIMAX_CONTROL';

      for (let sIdx = 0; sIdx < shotsInScene; sIdx++) {
        const shotDuration = sIdx === shotsInScene - 1 ? baseDuration + remainder : baseDuration;
        const startTime = accumulatedTime;
        const endTime = startTime + shotDuration;
        accumulatedTime = endTime;

        const shotId = `SHOT_${String(globalOrder).padStart(2, '0')}`;

        // Determine Shot Type and Narrative Purpose
        let shotSize: CameraInstruction['shotSize'] = 'medium';
        let cameraMovement = 'slow push-in';
        let narrativePurpose = '';
        let visualAction = '';
        let characterAction = '';
        let emotionalState = '';
        let imagePrompt = '';
        let videoPrompt = '';

        const primaryProp = props[0]?.name || '핵심 기록철';
        const dealProp = props[1]?.name || '합의 각서';
        const switchProp = props[2]?.name || '메인 전송 레버';

        if (sceneIdx === 0) {
          // Scene 1: Hook / Prologue
          if (sIdx === 0) {
            shotSize = 'wide';
            cameraMovement = 'slow tracking dolly past shelves toward workbench';
            narrativePurpose = '주인공의 규칙적인 일상과 작업실 환경 정립 (Establishing)';
            visualAction = `${p.name}이(가) 작업대에서 정밀 집게로 ${primaryProp}을(를) 펼쳐 들고 작업을 시작한다.`;
            characterAction = '규칙적이고 능숙한 손놀림으로 도구를 다룸';
            emotionalState = '업무에 몰입한 차분함 속 잠재된 긴장감';
          } else {
            shotSize = 'close_up';
            cameraMovement = 'rack-focus from character eyes to the tampered barcode';
            narrativePurpose = '3단계 발단 팩트 포착: 조작된 날인과 위조 흔적의 물리적 확인';
            visualAction = `${p.name}이(가) 판독기 화면의 일련번호와 ${primaryProp}의 인장을 번갈아 응시하며 동작을 멈춘다.`;
            characterAction = '눈동자가 확장되고 숨을 멈추며 충격을 억누름';
            emotionalState = '조용한 의문과 충격적인 직업적 각성';
          }
        } else if (sceneIdx === 1) {
          // Scene 2: Escalation / Investigation
          if (sIdx === 0) {
            shotSize = 'medium_close_up';
            cameraMovement = 'tense handheld tracking following fast footsteps';
            narrativePurpose = '퇴로 차단 및 조력자와의 긴급 접선';
            visualAction = `${p.name}이(가) ${primaryProp}을(를) 품에 숨긴 채 비상계단을 내려와 조력자와 마주한다.`;
            characterAction = '주변을 살피며 서류를 숨김';
            emotionalState = '은밀한 공조와 조급함';
          } else {
            shotSize = 'close_up';
            cameraMovement = 'over-the-shoulder push-in toward the compromise document';
            narrativePurpose = '은폐 세력의 회유와 협박 직면';
            visualAction = `맞은편 인물이 테이블 위로 ${dealProp}을(를) 밀어 넣으며 단호하게 경고한다.`;
            characterAction = '서류를 든 손끝이 미세하게 떨림';
            emotionalState = '타협의 유혹과 양심 사이의 극심한 내적 충돌';
          }
        } else if (sceneIdx === 2 || (scenes.length === 5 && sceneIdx === 3)) {
          // Climax Scene: Choice & Break
          if (sIdx === 0) {
            shotSize = 'medium';
            cameraMovement = 'deliberate push-in toward the protagonist';
            narrativePurpose = '거액의 회유 거절 및 결사의 결단';
            visualAction = `${p.name}이(가) 테이블 위의 ${dealProp}을(를) 거칠게 옆으로 밀어내고 통제 콘솔로 돌아선다.`;
            characterAction = '안색이 굳어지고 망설임 없이 손을 뻗음';
            emotionalState = '두려움을 넘어선 온전한 주체적 분노와 확신';
          } else if (sIdx === 1) {
            shotSize = 'extreme_close_up';
            cameraMovement = 'dynamic macro tracking on hand gripping the lever';
            narrativePurpose = '3단계 절정 팩트 실행: 메인 송출 스위치 물리적 가동';
            visualAction = `${p.name}의 손이 ${switchProp}의 안전 커버를 제끼고 위로 강하게 밀어 올린다.`;
            characterAction = '손가락 관절에 힘이 들어가며 레버를 꺾음';
            emotionalState = '모든 기득권을 던진 카타르시스';
          } else {
            shotSize = 'wide';
            cameraMovement = 'low-angle slow pedestal tilt-up';
            narrativePurpose = '전산망/세상 전체로의 전면적 진실 송출 확인';
            visualAction = `콘솔의 백색광이 폭발하듯 켜지고, 모니터 월 전체에 복원된 피해자들의 기록이 투사된다.`;
            characterAction = '화면을 정면으로 응시하며 똑바로 서 있음';
            emotionalState = '압도적인 카타르시스와 승리';
          }
        } else {
          // Final Scene: Consequence / Resolution
          if (sIdx === 0) {
            shotSize = 'medium';
            cameraMovement = 'slow tracking pull-back';
            narrativePurpose = '사건의 여파 수용 및 법적 대면';
            visualAction = `${p.name}이(가) 책상 위에 자신의 신분증을 조용히 내려놓고 가방을 챙긴다.`;
            characterAction = '차분하고 정돈된 손길로 소지품을 챙김';
            emotionalState = '깊은 안도와 회복된 인간적 존엄';
          } else {
            shotSize = 'extreme_wide';
            cameraMovement = 'high crane slow pull-out into golden sunrise';
            narrativePurpose = '내적 해방과 새로운 삶의 시작 (Ending Beat)';
            visualAction = `${p.name}이(가) 문을 열고 나와 황금빛 여명이 비추는 지평선 길목으로 담담히 걸어 나간다.`;
            characterAction = '가볍고 당당한 발걸음';
            emotionalState = '온전한 내적 평온과 자유';
          }
        }

        // Camera Specification
        const camera: CameraInstruction = {
          shotSize,
          angle: shotSize === 'extreme_close_up' || shotSize === 'close_up' ? 'Eye-level' : sIdx === 1 ? 'Slight low-angle' : 'Level',
          movement: cameraMovement,
          speed: sIdx === 1 && sceneIdx === 2 ? 'Fast and decisive' : 'Smooth cinematic',
          framing: shotSize === 'wide' ? 'Rule of thirds establishing' : 'Center-weighted subject isolation'
        };

        // Lighting Specification
        const lighting: LightingInstruction = {
          keyLight: sceneIdx === scenes.length - 1 ? 'Golden morning sunlight at 3200K' : 'Directional cool white key light at 5600K',
          fillLight: 'Ambient soft fill bouncing off neutral interior surfaces',
          practicalLights: sceneIdx === 0 ? ['Desk lamp', 'Terminal monitor'] : sceneIdx === 2 ? ['Emergency red beacon', 'Illuminated console switches'] : ['Morning street ambience'],
          colorTemperature: sceneIdx === scenes.length - 1 ? '3200K Warm Gold' : '5200K Cool Balanced',
          contrast: sceneIdx === 2 ? 'High Contrast 8:1' : 'Cinematic Contrast 4:1',
          mood: emotionalState
        };

        // Sound Specification
        const sound: SoundInstruction = {
          ambience: [scene.soundEffect || 'Room ambience', 'Subtle ventilation'],
          soundEffects: [
            shotSize === 'close_up' || shotSize === 'extreme_close_up'
              ? `Tactile sound of ${primaryProp}`
              : 'Footsteps, distant alarm'
          ],
          musicMood: scene.audioCue,
          musicIntensity: sceneIdx === 2 ? 9 : sceneIdx === 1 ? 6 : 4
        };

        // Continuity State at this Shot
        const continuityState: ContinuityState = {
          timeOfDay: scene.timeOfDay,
          location: scene.location,
          charactersPresent: [p.name],
          characterStates: {
            [p.name]: `Costume: Primary Signature; Emotion: ${emotionalState}`
          },
          propsPresent: [primaryProp],
          propStates: {
            [primaryProp]: sIdx > 0 && sceneIdx === 0 ? 'Inspected' : 'Carried'
          },
          lightingState: lighting.contrast,
          unresolvedConflict: pkg.centralConflict
        };

        // Detailed Prompt Generation (Image & Video)
        imagePrompt = `${visualBible.globalVisualPrompt}, ${shotSize.replace(/_/g, ' ')}, ${p.name} (${p.occupation}) ${visualAction}, ${lighting.keyLight}, ${camera.framing}, atmospheric haze, shallow depth of field, tactile realism`;

        videoPrompt = `Subject: ${p.name} (${p.age || '34'}, ${p.occupation}), wearing signature attire. Action: ${visualAction} with restrained realistic performance. Motion: ${characterAction}. Camera: ${camera.shotSize} with ${camera.movement}. Lighting: ${lighting.keyLight} casting soft shadows. Environment: ${scene.location}, authentic textures. Duration: ${shotDuration}s. Cinematic photorealism, 24fps.`;

        shots.push({
          shotId,
          sceneId: `SCENE_${scene.sceneNumber}`,
          order: globalOrder++,
          startTime,
          endTime,
          duration: shotDuration,
          characters: [p.name],
          locationId: locId,
          props: [primaryProp],
          narrativePurpose,
          visualAction,
          characterAction,
          emotionalState,
          camera,
          lighting,
          sound,
          dialogue: sIdx === shotsInScene - 1 ? scene.dialogue : undefined,
          imagePrompt,
          videoPrompt,
          negativePrompt: visualBible.negativePrompt,
          continuityState
        });
      }
    });

    return shots;
  }

  // ==========================================
  // PHASE 5-6: Continuity Engine
  // ==========================================
  private static auditContinuity(
    shots: ProductionShot[],
    characters: CharacterProfile[],
    props: PropProfile[]
  ): string[] {
    const warnings: string[] = [];

    // Check 1: Time continuity
    for (let i = 1; i < shots.length; i++) {
      const prev = shots[i - 1];
      const curr = shots[i];
      if (prev.endTime !== curr.startTime) {
        warnings.push(`타임라인 불일치: 샷 ${prev.shotId}(${prev.endTime}초)과 샷 ${curr.shotId}(${curr.startTime}초)의 시간이 연속되지 않습니다.`);
      }
    }

    // Check 2: Character presence consistency
    const mainCharName = characters[0]?.name;
    if (mainCharName) {
      const missingMain = shots.some((s) => !s.characters.includes(mainCharName) && s.order < shots.length - 1);
      if (missingMain) {
        warnings.push(`인물 연속성 주의: 주인공 [${mainCharName}]이(가) 사전 설명 없이 일부 샷에서 제외되었습니다.`);
      }
    }

    // Check 3: Prop presence consistency
    const criticalProp = props[0]?.name;
    if (criticalProp) {
      const propAppearsInShot1 = shots[0]?.props.includes(criticalProp);
      if (!propAppearsInShot1) {
        warnings.push(`핵심 소품 연속성: 1번 샷에서 핵심 소품 [${criticalProp}]이 명시적으로 연결되지 않았습니다.`);
      }
    }

    return warnings;
  }

  // ==========================================
  // PHASE 5-7: Production Readiness Audit
  // ==========================================
  private static auditReadiness(
    pkg: ScriptSourcePackage,
    script: ScriptProduction,
    characters: CharacterProfile[],
    locations: LocationProfile[],
    props: PropProfile[],
    visualBible: VisualBible,
    shots: ProductionShot[],
    continuityWarnings: string[]
  ): ProductionReadinessReport {
    const errors: string[] = [];
    const warnings: string[] = [...continuityWarnings];

    // Story Sync Check (20 pts)
    const storySync = Boolean(pkg && pkg.storyId && pkg.logline && pkg.climaxChoice);
    if (!storySync) errors.push('Step 3 스토리 권위 데이터가 완전히 전달되지 않았습니다.');

    // Character Coverage (10 pts)
    const characterConsistency = characters.length > 0 && characters.every((c) => c.appearance && c.costume.primary);
    if (!characterConsistency) errors.push('주요 등장인물의 외형 및 시그니처 의상 정의가 누락되었습니다.');

    // Location Coverage (10 pts)
    const locationConsistency = locations.length >= 3 && locations.every((l) => l.locationPrompt);
    if (!locationConsistency) warnings.push('장소 바이블의 필수 장면 커버리지가 부족합니다.');

    // Prop Coverage (10 pts)
    const propContinuity = props.length >= 2 && props.every((p) => p.stateHistory.length > 0);
    if (!propContinuity) warnings.push('핵심 소품의 상태 변화 추적이 불완전합니다.');

    // Visual Style Defined (10 pts)
    const visualStyleDefined = Boolean(visualBible.aspectRatio && visualBible.visualStyle && visualBible.colorMood);
    if (!visualStyleDefined) errors.push('전체 영상의 비주얼 스타일 가이드가 정의되지 않았습니다.');

    // Shot Coverage (15 pts)
    const shotCoverage = shots.length >= script.scenes.length * 2;
    if (!shotCoverage) warnings.push('각 씬별 샷 분해 수가 충분하지 않습니다.');

    // Prompt Completeness (15 pts)
    const promptCompleteness = shots.every(
      (s) => s.imagePrompt && s.videoPrompt && s.videoPrompt.includes('Camera:') && s.videoPrompt.includes('Action:')
    );
    if (!promptCompleteness) errors.push('일부 샷의 AI 이미지/비디오 프롬프트가 필수 규격을 충족하지 못했습니다.');

    // Continuity (10 pts)
    const continuity = continuityWarnings.length === 0;

    // Score Calculation:
    // StorySync: 20, Character: 10, Location: 10, Prop: 10, Visual: 10, Shot: 15, Prompt: 15, Continuity: 10 = 100
    let score = 0;
    if (storySync) score += 20;
    if (characterConsistency) score += 10;
    if (locationConsistency) score += 10;
    if (propContinuity) score += 10;
    if (visualStyleDefined) score += 10;
    if (shotCoverage) score += 15;
    if (promptCompleteness) score += 15;
    if (continuity) score += 10;

    const readyForVideoGeneration = score >= 90 && errors.length === 0;

    return {
      score,
      storySync,
      characterConsistency,
      locationConsistency,
      propContinuity,
      visualStyleDefined,
      shotCoverage,
      promptCompleteness,
      continuity,
      errors,
      warnings,
      readyForVideoGeneration
    };
  }

  // ==========================================
  // Production Manifest Generator
  // ==========================================
  private static generateManifest(
    projectId: string,
    title: string,
    format: 'shorts' | 'cinema',
    characters: CharacterProfile[],
    locations: LocationProfile[],
    props: PropProfile[],
    shots: ProductionShot[],
    sceneCount: number
  ): ProductionManifest {
    const totalDuration = shots.reduce((acc, s) => acc + s.duration, 0);

    return {
      project: {
        id: projectId,
        title,
        format,
        aspectRatio: format === 'shorts' ? '9:16' : '16:9'
      },
      assets: {
        characters: characters.map((c) => c.name),
        locations: locations.map((l) => l.name),
        props: props.map((p) => p.name)
      },
      timeline: {
        totalDuration,
        scenes: sceneCount,
        shots: shots.length
      },
      generation: {
        imageReady: true,
        videoReady: true,
        audioReady: false, // Ready for Phase 3 external API
        subtitleReady: true
      }
    };
  }

  /**
   * Mock Video Provider for Free-first Preview Mode.
   */
  public static getMockProvider(): VideoGenerationProvider {
    return {
      providerId: 'mock-storyboard-renderer',
      generatePreview: async (shot: ProductionShot): Promise<PreviewResult> => {
        return {
          status: 'ready',
          previewUrl: `https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80`,
          message: `Shot ${shot.shotId} storyboard motion preview compiled.`
        };
      },
      generateVideo: async (shot: ProductionShot): Promise<VideoResult> => {
        return {
          status: 'pending',
          message: `Shot ${shot.shotId} queued for Phase 3 Cloud GPU rendering.`
        };
      }
    };
  }
}
