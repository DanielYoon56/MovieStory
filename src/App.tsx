/**
 * MovieStory AI - Main Application Entry
 *
 * Implements:
 * - 5-Step Production Pipeline (Discovery → Analysis & Motifs → Transformation → Script Studio → Production & Export)
 * - Cinema Dark Theme with high contrast and sleek typography
 * - Strict Rule 2.1: At most 2 primary process execution/navigation commands per screen
 * - Real-time auto-saving with LocalStorage persistence
 * - Seamless integration of MockDataService & useMovieData hook
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Step1Discovery } from './components/Step1Discovery';
import { Step2IntelligenceAndMotifs } from './components/Step2IntelligenceAndMotifs';
import { Step3Transformation } from './components/Step3Transformation';
import { Step4ScriptStudio } from './components/Step4ScriptStudio';
import { Step5ProductionExport } from './components/Step5ProductionExport';
import { Step6AssetStudio } from './components/Step6AssetStudio';
import { Step7EditingStudio } from './components/Step7EditingStudio';
import { Step8FinalDelivery } from './components/Step8FinalDelivery';
import { ProjectsModal } from './components/ProjectsModal';
import { SafeModeModal } from './components/SafeModeModal';
import { useMovieData } from './hooks/useMovieData';
import { ProjectStorageService } from './services/ProjectStorageService';
import { StoryGeneratorService } from './services/StoryGeneratorService';
import { ProductionPackageService } from './services/ProductionPackageService';
import { CausalEngine } from './services/CausalEngine';
import { Project, StoryOutput, ScriptProduction, MovieItem, ProductionPackage } from './types';
import { IntelligenceQualityDashboard } from './components/intelligence/IntelligenceQualityDashboard';
import { QualityReportPanel } from './components/intelligence/QualityReportPanel';
import { useIntelligenceQualityGate } from './hooks/useIntelligenceQualityGate';

export default function App() {
  const {
    loading,
    movies,
    selectedMovie,
    analysis,
    motifs,
    selectedMotifs,
    searchMovies,
    selectMovie,
    toggleMotifSelection,
    registerCustomMovie,
    clearSelection,
    error: movieDataError
  } = useMovieData();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [currentStory, setCurrentStory] = useState<StoryOutput | null>(null);
  const [currentScript, setCurrentScript] = useState<ScriptProduction | null>(null);

  // Modals
  const [projectsModalOpen, setProjectsModalOpen] = useState<boolean>(false);
  const [safeModeModalOpen, setSafeModeModalOpen] = useState<boolean>(false);
  const [qualityDashboardOpen, setQualityDashboardOpen] = useState<boolean>(false);
  const [projectsList, setProjectsList] = useState<Project[]>([]);

  // Refresh projects list from storage
  const reloadProjectsList = useCallback(() => {
    const list = ProjectStorageService.getAllProjects();
    setProjectsList(list);
  }, []);

  const handleUpdateActiveProject = useCallback(
    (updatedFields: Partial<Project>) => {
      if (!activeProject) return;
      const updated = { ...activeProject, ...updatedFields };
      setActiveProject(updated);
      ProjectStorageService.saveProject(updated);
      reloadProjectsList();
    },
    [activeProject, reloadProjectsList]
  );

  // MIQG: Intelligence Quality Gate Cross-Pipeline Hook
  const {
    report: qualityReport,
    isEvaluating: isQualityEvaluating,
    isOutdated: isQualityOutdated,
    runEvaluation: runQualityEvaluation,
  } = useIntelligenceQualityGate(activeProject, handleUpdateActiveProject);

  // Initialize or restore active project on load
  useEffect(() => {
    reloadProjectsList();
    const activeId = ProjectStorageService.getActiveProjectId();
    if (activeId) {
      const found = ProjectStorageService.getProject(activeId);
      if (found) {
        setActiveProject(found);
        setCurrentStep(found.currentStep || 1);
        if (found.selectedMovie) {
          selectMovie(found.selectedMovie);
        }
        if (found.currentStory) {
          setCurrentStory(found.currentStory);
        }
        if (found.currentScript) {
          setCurrentScript(found.currentScript);
        }
        return;
      }
    }

    // Otherwise create initial project
    const newProj = ProjectStorageService.createNewProject('첫 번째 시네마 스토리');
    setActiveProject(newProj);
    reloadProjectsList();
  }, [selectMovie, reloadProjectsList]);

  // Synchronize and auto-save active project state
  useEffect(() => {
    if (!activeProject) return;

    const updated: Project = {
      ...activeProject,
      currentStep,
      selectedMovie: selectedMovie || undefined,
      analysis: analysis || undefined,
      selectedMotifs,
      currentStory: currentStory || undefined,
      currentScript: currentScript || undefined,
      storySeed: currentStory?.storySeed || activeProject.storySeed,
      premise: currentStory?.storyPremise || activeProject.premise,
      storyBible: currentStory?.storyBible || activeProject.storyBible,
      plotBlueprint: currentStory?.plotBlueprint || activeProject.plotBlueprint,
      coherenceReport: currentStory?.coherenceReport || activeProject.coherenceReport,
      creativeDistanceReview: currentStory?.creativeDistanceReview || activeProject.creativeDistanceReview,
      continuityMemory: currentStory?.continuityMemory || activeProject.continuityMemory
    };

    ProjectStorageService.saveProject(updated);
    reloadProjectsList();
  }, [
    currentStep,
    selectedMovie,
    analysis,
    selectedMotifs,
    currentStory,
    currentScript,
    reloadProjectsList
  ]);

  // Project Management Handlers
  const handleStartNewProject = () => {
    const newProj = ProjectStorageService.createNewProject();
    setActiveProject(newProj);
    clearSelection();
    setCurrentStory(null);
    setCurrentScript(null);
    setCurrentStep(1);
    reloadProjectsList();
  };

  const handleSelectProjectFromModal = (id: string) => {
    const proj = ProjectStorageService.getProject(id);
    if (!proj) return;

    setActiveProject(proj);
    setCurrentStep(proj.currentStep || 1);
    if (proj.selectedMovie) {
      selectMovie(proj.selectedMovie);
    } else {
      clearSelection();
    }
    setCurrentStory(proj.currentStory || null);
    setCurrentScript(proj.currentScript || null);
    reloadProjectsList();
  };

  const handleDuplicateProject = (id: string) => {
    const copy = ProjectStorageService.duplicateProject(id);
    if (copy) {
      reloadProjectsList();
    }
  };

  const handleDeleteProject = (id: string) => {
    ProjectStorageService.deleteProject(id);
    reloadProjectsList();
    if (activeProject?.id === id) {
      handleStartNewProject();
    }
  };

  // Step transitions
  const handleProceedToStep2 = () => {
    if (!selectedMovie) return;
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedToStep3 = () => {
    if (selectedMotifs.length === 0) return;
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStoryGenerated = (story: StoryOutput) => {
    setCurrentStory(story);
    const formatType = currentScript?.format === 'cinema' ? 'cinema' : 'shorts';
    const newScript = StoryGeneratorService.generateScript(story, formatType);
    setCurrentScript(newScript);
  };

  const handleProceedToStep4 = () => {
    if (!currentStory) return;
    const formatType = currentScript?.format === 'cinema' ? 'cinema' : 'shorts';
    const currentHash = currentScript?.versionInfo?.contentHash || currentScript?.sourcePackage?.contentHash;
    const storyHash = CausalEngine.computeStoryContentHash(currentStory);

    if (!currentScript || currentScript.storyId !== currentStory.id || currentHash !== storyHash) {
      const generated = StoryGeneratorService.generateScript(currentStory, formatType);
      setCurrentScript(generated);
    }
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveProductionPackage = useCallback((pkg: ProductionPackage) => {
    setActiveProject((prev) => {
      if (!prev) return prev;
      if (prev.productionPackage?.packageId === pkg.packageId) {
        return prev;
      }
      const updated: Project = { ...prev, productionPackage: pkg };
      ProjectStorageService.saveProject(updated);
      return updated;
    });
  }, []);

  const handleProceedToStep5 = () => {
    if (currentStory) {
      let scriptToUse = currentScript || activeProject?.currentScript;
      if (!scriptToUse || scriptToUse.storyId !== currentStory.id) {
        scriptToUse = StoryGeneratorService.generateScript(currentStory, 'cinema');
        setCurrentScript(scriptToUse);
      }
      if (activeProject) {
        const pkg =
          activeProject.productionPackage &&
          activeProject.productionPackage.sourceStoryId === currentStory.id
            ? activeProject.productionPackage
            : ProductionPackageService.buildProductionPackage(
                activeProject.id,
                currentStory,
                scriptToUse
              );
        const updated: Project = {
          ...activeProject,
          currentStep: 5,
          currentStory,
          currentScript: scriptToUse,
          productionPackage: pkg,
        };
        setActiveProject(updated);
        ProjectStorageService.saveProject(updated);
      }
    }
    setCurrentStep(5);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedToStep6 = () => {
    if (activeProject && currentStory) {
      let scriptToUse = currentScript || activeProject.currentScript;
      if (!scriptToUse) {
        scriptToUse = StoryGeneratorService.generateScript(currentStory, 'cinema');
        setCurrentScript(scriptToUse);
      }
      let pkg = activeProject.productionPackage;
      if (!pkg || pkg.sourceStoryId !== currentStory.id) {
        pkg = ProductionPackageService.buildProductionPackage(
          activeProject.id,
          currentStory,
          scriptToUse
        );
      }
      const updated: Project = {
        ...activeProject,
        currentStep: 6,
        currentStory,
        currentScript: scriptToUse,
        productionPackage: pkg,
      };
      setActiveProject(updated);
      ProjectStorageService.saveProject(updated);
    }
    setCurrentStep(6);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedToStep7 = () => {
    setCurrentStep(7);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedToStep8 = () => {
    setCurrentStep(8);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Header with Step indicator & Safe Mode trigger */}
      <Header
        currentStep={currentStep}
        onStepClick={(step) => {
          setCurrentStep(step);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenProjects={() => setProjectsModalOpen(true)}
        onOpenSafeMode={() => setSafeModeModalOpen(true)}
        onNewProject={handleStartNewProject}
        activeProject={activeProject}
        onOpenQualityGate={() => setQualityDashboardOpen(true)}
        qualityReport={qualityReport}
        isQualityOutdated={isQualityOutdated}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {movieDataError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
            {movieDataError}
          </div>
        )}

        {/* MIQG Inline Quality Assurance Panel (Step 2 ~ Step 8) */}
        {activeProject && currentStep >= 2 && (
          <div className="mb-6">
            <QualityReportPanel
              report={qualityReport}
              isOutdated={isQualityOutdated}
              onOpenDashboard={() => setQualityDashboardOpen(true)}
              onReevaluate={runQualityEvaluation}
            />
          </div>
        )}

        {/* STEP 1: Movie Discovery */}
        {currentStep === 1 && (
          <Step1Discovery
            movies={movies}
            selectedMovie={selectedMovie}
            loading={loading}
            onSelectMovie={(movie) => selectMovie(movie)}
            onSearch={searchMovies}
            onRegisterCustom={(data) => registerCustomMovie(data)}
            onProceedToStep2={handleProceedToStep2}
          />
        )}

        {/* STEP 2: Movie Intelligence & Motifs */}
        {currentStep === 2 && selectedMovie && (
          <Step2IntelligenceAndMotifs
            movie={selectedMovie}
            analysis={analysis}
            motifs={motifs}
            selectedMotifs={selectedMotifs}
            loading={loading}
            onToggleMotif={toggleMotifSelection}
            onPrevStep={() => {
              setCurrentStep(1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNextStep={handleProceedToStep3}
          />
        )}

        {/* STEP 3: Story Transformation & Generator */}
        {currentStep === 3 && selectedMovie && (
          <Step3Transformation
            movie={selectedMovie}
            motifs={selectedMotifs.length > 0 ? selectedMotifs : motifs}
            currentStory={currentStory}
            onStoryGenerated={handleStoryGenerated}
            onPrevStep={() => {
              setCurrentStep(2);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNextStep={handleProceedToStep4}
          />
        )}

        {/* STEP 4: Script & Storyboard Studio */}
        {currentStep === 4 && currentStory && (
          <Step4ScriptStudio
            story={currentStory}
            currentScript={currentScript}
            onScriptGenerated={(script) => setCurrentScript(script)}
            onPrevStep={() => {
              setCurrentStep(3);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNextStep={handleProceedToStep5}
          />
        )}

        {/* STEP 5: Final Production Specification */}
        {currentStep === 5 && activeProject && (
          currentStory ? (
            <Step5ProductionExport
              project={activeProject}
              story={currentStory}
              script={currentScript}
              onNewStory={handleStartNewProject}
              onOpenProjects={() => setProjectsModalOpen(true)}
              onPrevStep={() => {
                setCurrentStep(4);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onNextStep={handleProceedToStep6}
              onSavePackage={handleSaveProductionPackage}
            />
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center max-w-2xl mx-auto my-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-amber-950/40 border border-amber-800/60 rounded-full flex items-center justify-center text-2xl">
                ⚠️
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Step 3 스토리가 필요합니다
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                제작 설계를 진행하기 전에 먼저 Step 3에서 스토리를 확정하고 대본을 생성해야 합니다.
              </p>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl text-sm transition-all cursor-pointer"
              >
                ← Step 3 스토리 생성으로 이동
              </button>
            </div>
          )
        )}

        {/* STEP 6: AI Digital Asset Generation Studio */}
        {currentStep === 6 && activeProject && (
          <Step6AssetStudio
            project={activeProject}
            onUpdateProject={(updatedFields) => {
              const updated = { ...activeProject, ...updatedFields };
              setActiveProject(updated);
              ProjectStorageService.saveProject(updated);
            }}
            onPrevStep={() => {
              setCurrentStep(5);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNextStep={handleProceedToStep7}
          />
        )}

        {/* STEP 7: Editing & Finalization Studio */}
        {currentStep === 7 && activeProject && (
          <Step7EditingStudio
            project={activeProject}
            onUpdateProject={(updatedFields) => {
              const updated = { ...activeProject, ...updatedFields };
              setActiveProject(updated);
              ProjectStorageService.saveProject(updated);
            }}
            onPrevStep={() => {
              setCurrentStep(6);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNextStep={handleProceedToStep8}
          />
        )}

        {/* STEP 8: Final Delivery & Archive Center */}
        {currentStep === 8 && activeProject && (
          <Step8FinalDelivery
            project={activeProject}
            onUpdateProject={(updatedFields) => {
              const updated = { ...activeProject, ...updatedFields };
              setActiveProject(updated);
              ProjectStorageService.saveProject(updated);
            }}
            onPrevStep={() => {
              setCurrentStep(7);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNewStory={handleStartNewProject}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>MovieStory AI — Every Movie Has a Thousand Stories</p>
        <p className="mt-1 text-[11px] text-slate-600">
          본 플랫폼은 영화의 추상적 인생 서사를 독창적 이야기로 재창작하는 독립 창작 스튜디오입니다. (Safe Mode 활성화)
        </p>
      </footer>

      {/* Modals */}
      <ProjectsModal
        isOpen={projectsModalOpen}
        onClose={() => setProjectsModalOpen(false)}
        projects={projectsList}
        activeProjectId={activeProject?.id}
        onSelectProject={handleSelectProjectFromModal}
        onDuplicateProject={handleDuplicateProject}
        onDeleteProject={handleDeleteProject}
      />

      <SafeModeModal
        isOpen={safeModeModalOpen}
        onClose={() => setSafeModeModalOpen(false)}
      />

      {/* MIQG: Intelligence Quality Center Modal */}
      {activeProject && (
        <IntelligenceQualityDashboard
          isOpen={qualityDashboardOpen}
          onClose={() => setQualityDashboardOpen(false)}
          project={activeProject}
          report={qualityReport}
          isOutdated={isQualityOutdated}
          onReevaluate={runQualityEvaluation}
          onNavigateToStep={(step) => {
            setCurrentStep(step);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNextStep={() => {
            if (currentStep < 8) {
              setCurrentStep(currentStep + 1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        />
      )}
    </div>
  );
}
