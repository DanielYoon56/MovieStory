/**
 * MovieStory AI - Data Models and Interfaces
 * Updated with Causal Engine & Narrative Coherence Architecture
 */

export interface MovieItem {
  id: string;
  title: string;
  originalTitle: string;
  year: number;
  country: string;
  director: string;
  genre: string[];
  cast: string[];
  synopsis: string;
  posterUrl: string;
  backdropUrl?: string;
  source: 'curated' | 'user' | 'tmdb';
  notes?: string;
}

export interface StoryTheme {
  core: string;
  humanInsight: string;
  lifeMeaning: string;
  socialMessage: string;
}

export interface EmotionalStructure {
  primary: string[];
  intensity: number; // 1 to 10
  emotionalArc: string;
}

export interface ConflictStructure {
  inner: string;
  interpersonal: string;
  societal: string;
  moralChoice: string;
}

export interface HumanRelationship {
  type: string;
  characters: string;
  dynamic: string;
}

export interface NarrativeElements {
  exposition: string;
  incitingIncident: string;
  risingAction: string;
  climax: string;
  resolution: string;
}

export interface MovieAnalysis {
  id: string;
  movieId: string;
  movieTitle: string;
  theme: StoryTheme;
  emotions: EmotionalStructure;
  conflicts: ConflictStructure;
  relationships: HumanRelationship[];
  narrativeElements: NarrativeElements;
  lifeLessons: string[];
  confidence: 'high' | 'medium' | 'user-assisted';
  evidenceSources: string;
  creativeDirections: string[];
}

// --- Causal Engine STEP 2: Story Seed ---
export interface StorySeed {
  id: string;
  protagonistHint: string;
  currentSituation: string;
  emotionalWound: string;
  disruptiveEvent: string;
  coreChoice: string;
  centralQuestion: string;
  oneSentenceSeed: string;
}

// --- Causal Engine STEP 1: Enhanced Story Motif ---
export interface StoryMotif {
  id: string;
  movieId: string;
  title: string;
  coreEmotion: string[];
  lifeTheme: string;
  conflictStructure: string;
  audienceResonance: string;
  creativeDirection: string;
  recommendedGenre: string | string[];
  recommendedFormat: string;
  originalityReview: {
    abstractionLevel: string;
    separationTip: string;
    isSafe: boolean;
  };
  // Causal Engine V2 Fields
  coreTheme?: string;
  emotionalCore?: string;
  humanQuestion?: string;
  conflictPrinciple?: string;
  storySeed?: StorySeed;
}

// --- Causal Engine STEP 3: Story Premise ---
export interface StoryPremise {
  id: string;
  logline: string;
  dramaticQuestion: string;
  protagonist: string;
  want: string; // What protagonist thinks they want
  need: string; // What protagonist truly needs to grow
  flaw: string;
  centralConflict: string;
  stakes: string;
  transformationPromise: string;
}

// --- Character Arc Engine ---
export interface CharacterArc {
  initialBelief: string;
  flaw: string;
  emotionalWound: string;
  falseSolution: string;
  pressurePoint: string;
  realization: string;
  finalChoice: string;
  finalState: string;
}

export interface BibleCharacterProfile {
  name: string;
  age: string;
  role: string;
  occupation: string;
  occupationNecessity: string; // 왜 반드시 이 직업이어야 하는가?
  appearance: string;
  personality: string;
  internalConflict: string;
  arc?: CharacterArc;
}

export interface StoryRelationship {
  characters: string;
  type: string;
  dynamic: string;
  hiddenTension: string;
}

export interface StorySetting {
  era: string;
  primaryLocation: string;
  locationNecessity: string; // 이 장소가 이야기에 없으면 스토리가 성립하는가?
  atmosphere: string;
}

export interface StoryEvent {
  title: string;
  description: string;
  trigger: string;
}

export interface StoryChoice {
  dilemma: string;
  optionA: string;
  optionB: string;
  chosenOption: string;
  consequence: string;
}

// --- Causal Engine STEP 4: Story Bible ---
export interface StoryBible {
  premise: StoryPremise;
  protagonist: BibleCharacterProfile;
  antagonistOrForce: string;
  relationships: StoryRelationship[];
  setting: StorySetting;
  theme: string;
  want: string;
  need: string;
  flaw: string;
  emotionalWound: string;
  incitingIncident: StoryEvent;
  centralConflict: string;
  stakes: string;
  midpointShift: StoryEvent;
  pointOfNoReturn: StoryEvent;
  climaxChoice: StoryChoice;
  resolution: string;
  characterArc: CharacterArc;
}

// --- Causal Engine STEP 5: Plot Blueprint & Causal Chain ---
export interface CausalLink {
  eventId: string;
  event: string;
  causedBy: string;
  consequence: string;
  connector: 'BECAUSE' | 'THEREFORE' | 'BUT' | 'SO' | 'UNTIL';
}

export interface PlotAct {
  actNumber: number;
  title: string;
  protagonistGoal: string;
  keyEvent: string;
  consequence: string;
  emotionalShift: string;
  transitionReason: string;
}

export interface PlotBlueprint {
  act1: PlotAct;
  act2: PlotAct;
  act3: PlotAct;
  act4: PlotAct;
  causalChain: CausalLink[];
}

// --- Narrative Coherence Validator ---
export type CoherenceStatus = 'PASS' | 'WARNING' | 'FAIL';

export interface CoherenceCheckItem {
  id: string;
  category:
    | 'job_necessity'
    | 'location_necessity'
    | 'causal_chain'
    | 'genre_integrity'
    | 'protagonist_goal'
    | 'character_change'
    | 'motif_completion';
  title: string;
  question: string;
  status: CoherenceStatus;
  finding: string;
  repairSuggestion?: string;
}

export interface CoherenceReport {
  overallStatus: CoherenceStatus;
  items: CoherenceCheckItem[];
  canProceed: boolean;
  summaryText: string;
}

// --- Creative Distance Review (Replaces raw percentage badges) ---
export type SeparationGrade = 'High' | 'Medium' | 'Needs Revision';

export interface CreativeDistanceReview {
  characterSeparation: SeparationGrade;
  settingSeparation: SeparationGrade;
  plotSeparation: SeparationGrade;
  expressionSeparation: SeparationGrade;
  overallSeparation: SeparationGrade;
  disclaimer: string;
  notes: string[];
}

// --- Story Continuity Memory ---
export interface StoryContinuityMemory {
  projectId: string;
  lockedFacts: string[];
  characterFacts: Record<string, string[]>;
  relationshipFacts: string[];
  locationFacts: string[];
  timelineFacts: string[];
  unresolvedQuestions: string[];
  forbiddenContradictions: string[];
}

// Backward-compatible Character structure
export interface StoryCharacter {
  name: string;
  role: string;
  age: string;
  appearance: string;
  personality: string;
  internalConflict: string;
  occupation?: string;
  occupationNecessity?: string;
}

// Backward-compatible Story DNA Review structure
export interface StoryDnaReview {
  characterDistance: number; // 0-100%
  settingDistance: number;
  plotDistance: number;
  overallOriginalityScore: number;
  safeModeCertified: boolean;
  notes: string[];
}

// --- Final Story Output ---
export interface StoryOutput {
  id: string;
  projectId: string;
  motifId: string;
  motifTitle: string;
  originalMovieTitle: string;
  title: string;
  logline: string;
  coreTheme: string;
  targetGenre: string;
  era: string;
  setting: string;
  tone: string;
  endingType: string;
  characters: StoryCharacter[];
  plot: {
    act1: string;
    act2: string;
    climax: string;
    resolution: string;
  };
  audienceTakeaway: string;
  storyDnaReview: StoryDnaReview;
  version: number;
  createdAt: string;

  // Causal Engine V2 Pipeline Artifacts
  storySeed?: StorySeed;
  storyPremise?: StoryPremise;
  storyBible?: StoryBible;
  plotBlueprint?: PlotBlueprint;
  coherenceReport?: CoherenceReport;
  creativeDistanceReview?: CreativeDistanceReview;
  continuityMemory?: StoryContinuityMemory;
  fullNarrativeText?: string;
}

export interface StoryAct {
  actNumber: number;
  title: string;
  protagonistGoal: string;
  keyEvent: string;
  consequence: string;
  emotionalShift: string;
}

export interface ScriptSourcePackage {
  storyId: string;
  storyVersion: number;
  contentHash: string;
  logline: string;
  synopsis: string;
  protagonist: {
    name: string;
    age?: string | number;
    occupation: string;
    occupationNecessity?: string;
    initialState: string;
    initialBelief: string;
    emotionalWound: string;
    want: string;
    need: string;
    flaw: string;
    finalTransformation: string;
  };
  genre: string[];
  era: string;
  setting: string;
  acts: {
    act1: StoryAct;
    act2: StoryAct;
    act3: StoryAct;
    act4: StoryAct;
  };
  incitingIncident: string;
  centralConflict: string;
  stakes: string;
  climaxChoice: string;
  resolution: string;
  causalChain: CausalLink[];
  characterArc: CharacterArc;
}

export interface StoryToSceneMap {
  sceneNumber: number;
  format: 'shorts' | 'cinema';
  role: 'Hook' | 'Escalation' | 'Choice' | 'Consequence' | 'Prologue' | 'Investigation' | 'Crisis' | 'Climax' | 'Epilogue';
  sourceStoryFact: string; // The concrete fact from Step 3
  physicalAction: string; // Visible action with physical verbs
  propsInvolved: string[]; // Specific physical props
  dramaticPurpose: string;
  dialoguePurpose: string;
  causalConnector: string;
}

export interface FidelityCheckItem {
  id: string;
  aspect:
    | 'protagonist_occupation'
    | 'inciting_incident'
    | 'midpoint_crisis'
    | 'climax_choice'
    | 'resolution'
    | 'dialogue_cliche_free';
  targetStoryFact: string;
  reflectedInScene: number;
  finding: string;
  passed: boolean;
}

export interface StoryFidelityReport {
  score: number; // 0-100%
  passed: boolean;
  checks: FidelityCheckItem[];
  verifiedStoryFacts: string[];
  repairedItems?: string[];
  summary: string;
}

export interface ScriptVersionInfo {
  storyId: string;
  storyVersion: number;
  contentHash: string;
  format: 'shorts' | 'cinema' | 'audio';
  generatedAt: string;
}

export interface DialogueLine {
  speaker: string;
  text: string;
  emotionTag?: string;
}

export interface ScriptScene {
  sceneNumber: number;
  title: string;
  location: string;
  timeOfDay: string;
  characters: string[];
  situation: string;
  action: string;
  dialogue: DialogueLine[];
  emotion: string;
  cameraAngle: string;
  lighting: string;
  audioCue: string;
  soundEffect: string;
  estimatedDurationSeconds: number;
  visualPrompt: string;
  videoPrompt: string;
  causalRole?: 'Hook' | 'Escalation' | 'Choice' | 'Consequence' | 'Prologue' | 'Investigation' | 'Crisis' | 'Climax' | 'Epilogue';
  causalConnector?: string;
  propsInvolved?: string[];
  sourceFact?: string;
}

export interface ScriptProduction {
  id: string;
  storyId: string;
  format: 'shorts' | 'cinema' | 'audio';
  totalDurationSeconds: number;
  scenes: ScriptScene[];
  createdAt: string;
  versionInfo?: ScriptVersionInfo;
  fidelityReport?: StoryFidelityReport;
  sourcePackage?: ScriptSourcePackage;
  sceneMaps?: StoryToSceneMap[];
}

// ==========================================
// STEP 5: PRODUCTION PACKAGE BUILDER TYPES
// ==========================================

export interface CharacterProfile {
  characterId: string;
  name: string;
  role: 'protagonist' | 'supporting' | 'antagonist';
  ageRange: string;
  gender?: string;
  nationality?: string;
  occupation?: string;
  appearance: {
    face: string;
    eyes: string;
    hair: string;
    body: string;
    distinctiveFeatures: string[];
  };
  costume: {
    primary: string;
    secondary?: string;
    accessories: string[];
  };
  personalityVisualCues: string[];
  emotionalBaseline: string;
  visualIdentityPrompt: string;
  continuityRules: string[];
}

export interface LocationProfile {
  locationId: string;
  name: string;
  narrativeFunction: string;
  era: string;
  architecture: string;
  interiorExterior: 'interior' | 'exterior' | 'mixed';
  visualElements: string[];
  permanentProps: string[];
  lightingIdentity: string;
  atmosphere: string;
  locationPrompt: string;
  continuityRules: string[];
}

export interface PropState {
  sceneOrShot: number;
  state: string;
  description: string;
}

export interface PropProfile {
  propId: string;
  name: string;
  narrativeImportance: 'critical' | 'important' | 'background';
  description: string;
  firstAppearance: number;
  lastRequiredAppearance?: number;
  owner?: string;
  stateHistory: PropState[];
  continuityRules: string[];
  visualPrompt: string;
}

export interface VisualBible {
  aspectRatio: '9:16' | '16:9';
  visualStyle: string;
  realismLevel: string;
  colorMood: string;
  lightingStyle: string;
  cameraStyle: string;
  lensPreference: string;
  depthOfField: string;
  motionStyle: string;
  textureStyle: string;
  negativePrompt?: string;
  globalVisualPrompt: string;
}

export interface CameraInstruction {
  shotSize:
    | 'extreme_close_up'
    | 'close_up'
    | 'medium_close_up'
    | 'medium'
    | 'wide'
    | 'extreme_wide';
  angle: string;
  movement: string;
  speed: string;
  framing: string;
}

export interface LightingInstruction {
  keyLight: string;
  fillLight: string;
  practicalLights: string[];
  colorTemperature: string;
  contrast: string;
  mood: string;
}

export interface SoundInstruction {
  ambience: string[];
  soundEffects: string[];
  musicMood?: string;
  musicIntensity?: number;
}

export interface ContinuityState {
  timeOfDay: string;
  location: string;
  charactersPresent: string[];
  characterStates: Record<string, string>;
  propsPresent: string[];
  propStates: Record<string, string>;
  weather?: string;
  lightingState: string;
  unresolvedConflict: string;
}

export interface ProductionShot {
  shotId: string;
  sceneId: string;
  order: number;
  startTime: number;
  endTime: number;
  duration: number; // 2 to 8 seconds
  characters: string[];
  locationId: string;
  props: string[];
  narrativePurpose: string;
  visualAction: string;
  characterAction: string;
  emotionalState: string;
  camera: CameraInstruction;
  lighting: LightingInstruction;
  sound: SoundInstruction;
  dialogue?: DialogueLine[];
  imagePrompt: string;
  videoPrompt: string;
  negativePrompt?: string;
  continuityState: ContinuityState;
}

export interface ProductionManifest {
  project: {
    id: string;
    title: string;
    format: string;
    aspectRatio: string;
  };
  assets: {
    characters: string[];
    locations: string[];
    props: string[];
  };
  timeline: {
    totalDuration: number;
    scenes: number;
    shots: number;
  };
  generation: {
    imageReady: boolean;
    videoReady: boolean;
    audioReady: boolean;
    subtitleReady: boolean;
  };
}

export interface ProductionReadinessReport {
  score: number; // 0-100
  storySync: boolean;
  characterConsistency: boolean;
  locationConsistency: boolean;
  propContinuity: boolean;
  visualStyleDefined: boolean;
  shotCoverage: boolean;
  promptCompleteness: boolean;
  continuity: boolean;
  errors: string[];
  warnings: string[];
  readyForVideoGeneration: boolean;
}

export interface ProductionSource {
  projectId: string;
  storyId: string;
  storyVersion: number;
  contentHash: string;
  story: ScriptSourcePackage;
  script: {
    format: 'shorts' | 'cinema';
    scenes: ScriptScene[];
  };
}

export interface ProductionPackage {
  packageId: string;
  projectId: string;
  sourceStoryId: string;
  sourceStoryVersion: number;
  sourceContentHash: string;
  createdAt: string;
  updatedAt: string;
  format: 'shorts' | 'cinema';
  characterBible: CharacterProfile[];
  locationBible: LocationProfile[];
  propBible: PropProfile[];
  visualBible: VisualBible;
  shotList: ProductionShot[];
  productionManifest: ProductionManifest;
  readinessReport: ProductionReadinessReport;
}

export interface ProductionVersion {
  sourceStoryVersion: number;
  sourceStoryHash: string;
  sourceScriptVersion: number;
  sourceScriptHash: string;
  productionVersion: number;
}

export interface PreviewResult {
  previewUrl?: string;
  status: 'ready' | 'pending' | 'failed';
  message?: string;
}

export interface VideoResult {
  videoUrl?: string;
  status: 'ready' | 'pending' | 'failed';
  message?: string;
}

export interface VideoGenerationProvider {
  providerId: string;
  generatePreview(shot: ProductionShot): Promise<PreviewResult>;
  generateVideo(shot: ProductionShot): Promise<VideoResult>;
}

export interface RightsRecord {
  assetType: 'narrative' | 'character' | 'script' | 'prompt';
  source: string;
  license: string;
  commercialUseAllowed: boolean;
  derivationAllowed: boolean;
  attributionRequired: boolean;
  verificationStatus: 'verified_original' | 'creative_commons' | 'user_provided';
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  currentStep: number; // 1: 탐색, 2: 분석 & 모티브, 3: 스토리 변형, 4: 대본, 5: 완료
  selectedMovie?: MovieItem;
  analysis?: MovieAnalysis;
  selectedMotifs: StoryMotif[];
  currentStory?: StoryOutput;
  currentScript?: ScriptProduction;
  safeMode: boolean;
  rightsRecords: RightsRecord[];

  // Causal Engine V2 Artifacts
  storySeed?: StorySeed;
  premise?: StoryPremise;
  storyBible?: StoryBible;
  plotBlueprint?: PlotBlueprint;
  coherenceReport?: CoherenceReport;
  continuityMemory?: StoryContinuityMemory;
  creativeDistanceReview?: CreativeDistanceReview;

  // Step 5 Production Package Artifacts
  productionPackage?: ProductionPackage;

  // Step 6 Asset Generation Studio Artifacts
  assetLibrary?: AssetLibrary;

  // Step 7 Editing & Finalization Studio Artifacts
  finalTimeline?: FinalTimeline;
  editingVersions?: EditingVersion[];
  finalRenderPackage?: FinalRenderPackage;

  // Step 8 Final Delivery & Archive Center Artifacts
  finalDelivery?: FinalDelivery;
  projectArchive?: ProjectArchive;

  // MIQG: Cross-Pipeline Intelligence Quality Gate Artifacts
  intelligenceQualityReport?: import('./intelligenceQuality').IntelligenceQualityReport;
  intelligenceQualityHistory?: import('./intelligenceQuality').IntelligenceQualityReport[];
}

// ==========================================
// STEP 6: AI ASSET GENERATION STUDIO TYPES
// ==========================================

export type AssetType =
  | 'CHARACTER_REFERENCE'
  | 'LOCATION_REFERENCE'
  | 'PROP_REFERENCE'
  | 'KEYFRAME_IMAGE'
  | 'VIDEO_CLIP'
  | 'VOICE_OVER'
  | 'SFX'
  | 'BGM';

export type AssetStatus =
  | 'QUEUED'
  | 'GENERATING'
  | 'APPROVED'
  | 'NEEDS_REVIEW'
  | 'REJECTED'
  | 'OUTDATED'
  | 'FAILED';

export interface ProductionAsset {
  assetId: string;
  projectId: string;
  productionPackageId: string;
  sourceShotId?: string;
  type: AssetType;
  name: string;
  version: number;
  prompt: string;
  negativePrompt?: string;
  seed: number;
  status: AssetStatus;
  url: string;
  thumbnailUrl?: string;
  metadata: {
    width?: number;
    height?: number;
    aspectRatio?: '9:16' | '16:9';
    durationSeconds?: number;
    fps?: number;
    fileFormat?: string;
    provider?: string;
    characterId?: string;
    locationId?: string;
    propId?: string;
    isReference?: boolean;
    viewAngle?: 'front' | 'three_quarter' | 'profile' | 'full_body' | 'establishing' | 'detail';
  };
  consistencyScore: number; // 0 - 100
  reviewNotes?: string;
  createdAt: string;
  approvedAt?: string;
}

export interface ShotAssetBinding {
  shotId: string;
  order: number;
  sceneId: string;
  narrativePurpose: string;
  keyframeImageId?: string;
  videoClipId?: string;
  audioAssetIds: string[];
  status: 'PENDING' | 'KEYFRAME_READY' | 'VIDEO_READY' | 'COMPLETE';
}

export interface GenerationJob {
  jobId: string;
  assetId: string;
  targetType: AssetType;
  sourceShotId?: string;
  status: 'QUEUED' | 'PREPARING' | 'GENERATING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress: number; // 0 - 100
  provider: string;
  prompt: string;
  error?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface AssetQualityCheck {
  assetId: string;
  characterConsistency: number; // 0 - 100
  styleCompliance: number; // 0 - 100
  cinematography: number; // 0 - 100
  artifactScore: number; // 0 - 100 (100 is artifact-free)
  overallScore: number; // 0 - 100
  passStatus: 'PASS' | 'WARN' | 'FAIL';
  diagnostics: string[];
}

export type GenerationProviderType =
  | 'DEMO_PREVIEW'
  | 'GOOGLE_VEO'
  | 'RUNWAY_GEN3'
  | 'LUMA_DREAM'
  | 'OPENAI_SORA';

export interface ProviderCapability {
  id: GenerationProviderType;
  name: string;
  description: string;
  tag: string;
  supportsVideo: boolean;
  supportsImage: boolean;
  maxDurationSeconds: number;
  nativeAspectRatios: ('9:16' | '16:9')[];
  estimatedSecondsPerJob: number;
  isFreeOrDemo: boolean;
}

export interface AssetLibrary {
  packageId: string;
  packageVersion: number;
  contentHash: string;
  assets: ProductionAsset[];
  bindings: ShotAssetBinding[];
  activeProvider: GenerationProviderType;
  jobs: GenerationJob[];
  qualityChecks: Record<string, AssetQualityCheck>;
  overallStatus: 'READY_TO_GENERATE' | 'IN_PRODUCTION' | 'COMPLETED';
  totalAssetsCount: number;
  approvedAssetsCount: number;
  isOutdated: boolean;
  updatedAt: string;
}

export interface MovieDataProvider {
  searchMovies(query: string, filters?: { genre?: string; country?: string; year?: number }): Promise<MovieItem[]>;
  getMovieById(id: string): Promise<MovieItem | null>;
  getMovieAnalysis(movie: MovieItem): Promise<MovieAnalysis>;
  getStoryMotifs(movie: MovieItem, analysis?: MovieAnalysis): Promise<StoryMotif[]>;
}

// ==========================================
// STEP 7: EDITING & FINALIZATION STUDIO TYPES
// ==========================================

export type TransitionType = 'CUT' | 'DISSOLVE' | 'FADE' | 'MATCH_CUT';

export interface EditingOverride {
  shotId: string;
  property: string;
  originalValue: any;
  overrideValue: any;
  updatedAt: string;
}

export interface VideoTrackItem {
  id: string;
  assetId: string;
  shotId: string;
  sceneId: string;
  order: number;
  startTime: number;
  endTime: number;
  duration: number;
  cropMode: 'cover' | 'contain' | 'original';
  scale: number;
  position: { x: number; y: number };
  opacity: number;
  transitionIn: TransitionType;
  transitionOut: TransitionType;
  status: 'READY' | 'MISSING_ASSET' | 'OUTDATED';
  isAnimaticPreview: boolean; // True if keyframe still image used instead of video clip
  mediaUrl: string;
  narrativePurpose: string;
}

export interface VideoTrack {
  id: string;
  name: string;
  items: VideoTrackItem[];
}

export type AudioTrackType = 'VOICE' | 'BGM' | 'SFX' | 'AMBIENCE';

export interface AudioTrackItem {
  id: string;
  assetId?: string;
  shotId?: string;
  trackType: AudioTrackType;
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
  volume: number; // 0 to 100
  fadeIn: number; // seconds
  fadeOut: number; // seconds
  pan: number; // -100 to 100
  priority: number;
  isDucked: boolean;
  duckedVolume?: number;
  isVoicePreview?: boolean; // TTS placeholder indicator
  dialogueSpeaker?: string;
  dialogueText?: string;
}

export interface AudioTrack {
  id: string;
  type: AudioTrackType;
  name: string;
  volume: number; // master volume 0 to 100
  muted: boolean;
  items: AudioTrackItem[];
}

export interface SubtitleItem {
  id: string;
  shotId: string;
  speakerId: string;
  speakerName: string;
  startTime: number;
  endTime: number;
  text: string;
  emphasis: boolean;
  position: 'bottom' | 'top' | 'middle';
}

export interface SubtitleTrack {
  id: string;
  language: string;
  style: 'SHORTS' | 'CINEMA';
  items: SubtitleItem[];
}

export interface TimelineMarker {
  time: number;
  label: string;
  shotId: string;
  type: 'SHOT_BOUNDARY' | 'KEY_EVENT' | 'CLIMAX';
}

export interface FinalTimeline {
  id: string;
  projectId: string;
  format: 'shorts' | 'cinema';
  duration: number;
  videoTracks: VideoTrack[];
  audioTracks: AudioTrack[];
  subtitleTracks: SubtitleTrack[];
  markers: TimelineMarker[];
  overrides: EditingOverride[];
  version: number;
  contentHash: string;
  status: 'READY' | 'WARNING' | 'OUTDATED';
  updatedAt: string;
}

export interface EditingVersion {
  versionId: string;
  versionNumber: number;
  timeline: FinalTimeline;
  createdAt: string;
  contentHash: string;
  note: string;
}

export interface FinalizationReadinessReport {
  totalScore: number; // 0 - 100
  timelineIntegrity: number; // max 20
  assetCoverage: number; // max 15
  audioCoverage: number; // max 15
  subtitleCoverage: number; // max 10
  continuity: number; // max 15
  narrativeSync: number; // max 15
  formatCompliance: number; // max 10
  status: 'READY_FOR_FINAL_EXPORT' | 'READY_WITH_WARNINGS' | 'REPAIR_REQUIRED';
  checks: { label: string; passed: boolean; detail: string }[];
  warnings: string[];
  errors: string[];
}

export interface EditingSourcePackage {
  projectId: string;
  storyId: string;
  contentHash: string;
  scriptProduction: ScriptProduction;
  productionPackage: ProductionPackage;
  approvedAssets: ProductionAsset[];
  shotAssetBindings: ShotAssetBinding[];
  format: 'shorts' | 'cinema';
  timelineDuration: number;
}

export interface FinalRenderPackage {
  packageId: string;
  projectId: string;
  format: 'shorts' | 'cinema';
  resolution: { width: number; height: number };
  frameRate: number;
  totalDuration: number;
  timeline: FinalTimeline;
  videoClipsCount: number;
  animaticClipsCount: number;
  audioTracksCount: number;
  subtitlesCount: number;
  readinessScore: number;
  exportedAt: string;
}

// ==========================================
// STEP 8: FINAL DELIVERY & ARCHIVE CENTER TYPES
// ==========================================

export type RenderPresetId = 'CINEMA_16_9' | 'SHORTS_9_16' | 'HIGH_QUALITY_4K';

export interface FFmpegRenderParameters {
  command: string;
  args: string[];
  videoCodec: string;
  crf: number;
  preset: string;
  pixelFormat: string;
  videoBitrate: string;
  maxBitrate?: string;
  bufsize?: string;
  audioCodec: string;
  audioBitrate: string;
  audioSampleRate: number;
  audioChannels: number;
  filterComplex: string;
  outputOptions: Record<string, string | number | boolean>;
  containerFormat: string;
}

export interface RenderProfile {
  id: RenderPresetId;
  name: string;
  description: string;
  tag: string;
  aspectRatio: '16:9' | '9:16';
  resolution: { width: number; height: number };
  frameRate: number;
  format: 'MP4' | 'WEBM';
  videoCodec: string;
  audioCodec: string;
  bitrate: string;
  subtitleMode: 'BURN_IN' | 'SOFT_SUB' | 'NONE';
  targetPlatform: 'YOUTUBE_CINEMA' | 'YOUTUBE_SHORTS' | 'TIKTOK' | 'INSTAGRAM_REELS' | 'UNIVERSAL_MASTER';
  ffmpegParams?: FFmpegRenderParameters;
}

export type RenderJobStatus =
  | 'IDLE'
  | 'PREPARING'
  | 'READY'
  | 'QUEUED'
  | 'RENDERING'
  | 'VALIDATING'
  | 'PACKAGING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface FinalRenderVersion {
  id: string;
  version: number;
  renderProfileId: string;
  outputPath: string;
  outputFileName: string;
  createdAt: string;
  status: 'RENDERING' | 'VALIDATING' | 'COMPLETED' | 'FAILED' | 'OUTDATED';
  contentHash: string;
  duration: number;
  resolution: string;
  fps: number;
  videoCodec: string;
  audioCodec: string;
  fileSize: number;
  downloadUrl?: string;
  validationReport?: FinalRenderValidationReport;
}

export interface ValidationCheck {
  name: string;
  passed: boolean;
  detail: string;
  expected?: string | number;
  actual?: string | number;
  score: number;
  maxScore: number;
}

export interface OutputMetadata {
  format?: string;
  videoStream?: boolean;
  audioStream?: boolean;
  width?: number;
  height?: number;
  fps?: number;
  duration?: number;
  sizeBytes?: number;
  videoCodec?: string;
  audioCodec?: string;
  pixFmt?: string;
}

export interface FinalRenderValidationReport {
  score: number; // 0 - 100
  status: 'READY' | 'WARNING' | 'FAILED';
  checks: ValidationCheck[];
  outputMetadata: OutputMetadata;
  warnings: string[];
  errors: string[];
}

export interface PreflightCheckResult {
  passed: boolean;
  timelinePassed: boolean;
  assetsPassed: boolean;
  ffmpegPassed: boolean;
  storagePassed: boolean;
  checks: { name: string; passed: boolean; message: string; critical: boolean }[];
}

export interface RenderJob {
  jobId: string;
  presetId: RenderPresetId;
  profile: RenderProfile;
  status: RenderJobStatus;
  progress: number; // 0 - 100
  stage: string;
  frame?: number;
  fps?: number;
  outTimeSeconds?: number;
  speed?: string;
  outputUrl?: string;
  outputPath?: string;
  fileSizeBytes?: number;
  renderDurationSeconds?: number;
  error?: string;
  startedAt?: string;
  completedAt?: string;
  validationReport?: FinalRenderValidationReport;
}

export interface SubtitleFile {
  type: 'SRT' | 'VTT';
  fileName: string;
  content: string;
  downloadUrl?: string;
}

export interface FinalValidationReport {
  totalScore: number; // 0 - 100
  timelineIntegrity: number; // 20
  assetCompleteness: number; // 20
  audioReadiness: number; // 15
  subtitleSync: number; // 10
  videoSpecification: number; // 15
  outputCompatibility: number; // 10
  archiveReadiness: number; // 10
  status: 'READY_TO_RENDER' | 'READY_WITH_WARNINGS' | 'REPAIR_REQUIRED';
  checks: { label: string; passed: boolean; detail: string }[];
  warnings: string[];
  errors: string[];
}

export interface DeliveryResult {
  deliveryId: string;
  targetPlatform: 'YOUTUBE_CINEMA' | 'YOUTUBE_SHORTS' | 'TIKTOK' | 'INSTAGRAM_REELS' | 'UNIVERSAL_MASTER';
  profile: RenderProfile;
  videoUrl: string;
  fileName: string;
  fileSizeBytes: number;
  duration: number;
  subtitleBurnedIn: boolean;
  completedAt: string;
}

export interface ProjectArchive {
  archiveId: string;
  projectId: string;
  projectName: string;
  version: number;
  sourceContentHash: string;
  createdAt: string;
  archivedAt: string;
  manifest: {
    story: { id: string; title: string; logline: string };
    script: { scenesCount: number; duration: number };
    production: { shotsCount: number; charactersCount: number };
    assets: { totalAssets: number; approvedAssets: number };
    edit: { timelineId: string; duration: number };
    deliveries: DeliveryResult[];
  };
  archiveJson: string; // MovieStory_Project.json string
}

export interface FinalDelivery {
  id: string;
  projectId: string;
  version: number;
  sourceHash: string;
  selectedPreset: RenderPresetId;
  activeProfile: RenderProfile;
  jobs: RenderJob[];
  deliveries: DeliveryResult[];
  renderVersions?: FinalRenderVersion[];
  subtitleFiles: SubtitleFile[];
  validation: FinalValidationReport;
  archive?: ProjectArchive;
  status: 'DRAFT' | 'RENDERING' | 'COMPLETED' | 'ARCHIVED' | 'OUTDATED';
  updatedAt: string;
}

// Re-export MIQG Types
export * from './intelligenceQuality';
