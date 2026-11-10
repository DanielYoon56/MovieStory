/**
 * useMovieData
 * Custom React hook consuming MockDataService.
 * Provides loading, error, and data states for Movie Discovery, Analysis, and Motif Generation flows.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { MockDataService } from '../services/MockDataService';
import { MovieItem, MovieAnalysis, StoryMotif } from '../types';

export interface UseMovieDataReturn {
  // State
  loading: boolean;
  analyzing: boolean;
  motifsLoading: boolean;
  error: string | null;
  movies: MovieItem[];
  selectedMovie: MovieItem | null;
  analysis: MovieAnalysis | null;
  motifs: StoryMotif[];
  selectedMotifs: StoryMotif[];

  // Actions
  searchMovies: (query: string, filters?: { genre?: string; country?: string; year?: number }) => Promise<void>;
  selectMovie: (movieOrId: MovieItem | string) => Promise<void>;
  analyzeCurrentMovie: () => Promise<MovieAnalysis | null>;
  loadMotifsForMovie: (movie?: MovieItem, currentAnalysis?: MovieAnalysis) => Promise<StoryMotif[]>;
  toggleMotifSelection: (motif: StoryMotif) => void;
  selectSingleMotif: (motif: StoryMotif) => void;
  registerCustomMovie: (customMovie: {
    title: string;
    originalTitle?: string;
    year?: number;
    country?: string;
    director?: string;
    genre?: string[];
    synopsis: string;
    notes?: string;
  }) => Promise<MovieItem>;
  clearSelection: () => void;
  resetAll: () => void;
}

export function useMovieData(): UseMovieDataReturn {
  const service = useMemo(() => MockDataService.getInstance(), []);

  const [loading, setLoading] = useState<boolean>(false);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [motifsLoading, setMotifsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<MovieItem | null>(null);
  const [analysis, setAnalysis] = useState<MovieAnalysis | null>(null);
  const [motifs, setMotifs] = useState<StoryMotif[]>([]);
  const [selectedMotifs, setSelectedMotifs] = useState<StoryMotif[]>([]);

  // Initial load of movies
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    service
      .searchMovies('')
      .then((data) => {
        if (mounted) {
          setMovies(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err?.message || '영화 목록을 불러오는 중 오류가 발생했습니다.');
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [service]);

  // Search movies
  const searchMovies = useCallback(
    async (query: string, filters?: { genre?: string; country?: string; year?: number }) => {
      setLoading(true);
      setError(null);
      try {
        const results = await service.searchMovies(query, filters);
        setMovies(results);
      } catch (err: any) {
        setError(err?.message || '영화 검색 중 문제가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    },
    [service]
  );

  // Select movie and automatically trigger analysis & motifs preparation
  const selectMovie = useCallback(
    async (movieOrId: MovieItem | string) => {
      setError(null);
      let targetMovie: MovieItem | null = null;

      if (typeof movieOrId === 'string') {
        targetMovie = await service.getMovieById(movieOrId);
      } else {
        targetMovie = movieOrId;
      }

      if (!targetMovie) {
        setError('선택한 영화 정보를 찾을 수 없습니다.');
        return;
      }

      setSelectedMovie(targetMovie);
      setAnalysis(null);
      setMotifs([]);
      setSelectedMotifs([]);

      // Automatically fetch analysis & motifs
      setAnalyzing(true);
      try {
        const resultAnalysis = await service.getMovieAnalysis(targetMovie);
        setAnalysis(resultAnalysis);

        setMotifsLoading(true);
        const resultMotifs = await service.getStoryMotifs(targetMovie, resultAnalysis);
        setMotifs(resultMotifs);

        // Pre-select the first motif by default for smooth UX
        if (resultMotifs.length > 0) {
          setSelectedMotifs([resultMotifs[0]]);
        }
      } catch (err: any) {
        setError(err?.message || '서사 분석 또는 모티브 생성 중 오류가 발생했습니다.');
      } finally {
        setAnalyzing(false);
        setMotifsLoading(false);
      }
    },
    [service]
  );

  // Re-run analysis for current movie
  const analyzeCurrentMovie = useCallback(async (): Promise<MovieAnalysis | null> => {
    if (!selectedMovie) {
      setError('분석할 영화가 선택되지 않았습니다.');
      return null;
    }

    setAnalyzing(true);
    setError(null);
    try {
      const res = await service.getMovieAnalysis(selectedMovie);
      setAnalysis(res);
      return res;
    } catch (err: any) {
      setError(err?.message || '영화 서사 분석에 실패했습니다.');
      return null;
    } finally {
      setAnalyzing(false);
    }
  }, [service, selectedMovie]);

  // Load motifs for movie
  const loadMotifsForMovie = useCallback(
    async (movie?: MovieItem, currentAnalysis?: MovieAnalysis): Promise<StoryMotif[]> => {
      const target = movie || selectedMovie;
      if (!target) {
        setError('모티브를 발굴할 영화가 필요합니다.');
        return [];
      }

      setMotifsLoading(true);
      setError(null);
      try {
        const list = await service.getStoryMotifs(target, currentAnalysis || analysis || undefined);
        setMotifs(list);
        if (list.length > 0 && selectedMotifs.length === 0) {
          setSelectedMotifs([list[0]]);
        }
        return list;
      } catch (err: any) {
        setError(err?.message || '스토리 모티브 발굴에 실패했습니다.');
        return [];
      } finally {
        setMotifsLoading(false);
      }
    },
    [service, selectedMovie, analysis, selectedMotifs.length]
  );

  // Toggle motif multi-selection
  const toggleMotifSelection = useCallback((motif: StoryMotif) => {
    setSelectedMotifs((prev) => {
      const exists = prev.some((m) => m.id === motif.id);
      if (exists) {
        // Keep at least one motif selected
        if (prev.length <= 1) return prev;
        return prev.filter((m) => m.id !== motif.id);
      } else {
        return [...prev, motif];
      }
    });
  }, []);

  // Single select
  const selectSingleMotif = useCallback((motif: StoryMotif) => {
    setSelectedMotifs([motif]);
  }, []);

  // Register custom movie
  const registerCustomMovie = useCallback(
    async (customMovie: {
      title: string;
      originalTitle?: string;
      year?: number;
      country?: string;
      director?: string;
      genre?: string[];
      synopsis: string;
      notes?: string;
    }): Promise<MovieItem> => {
      const added = service.registerCustomMovie(customMovie);
      setMovies((prev) => [added, ...prev]);
      await selectMovie(added);
      return added;
    },
    [service, selectMovie]
  );

  // Clear selections
  const clearSelection = useCallback(() => {
    setSelectedMovie(null);
    setAnalysis(null);
    setMotifs([]);
    setSelectedMotifs([]);
  }, []);

  // Reset all
  const resetAll = useCallback(() => {
    clearSelection();
    setError(null);
    service.searchMovies('').then(setMovies);
  }, [clearSelection, service]);

  return {
    loading,
    analyzing,
    motifsLoading,
    error,
    movies,
    selectedMovie,
    analysis,
    motifs,
    selectedMotifs,
    searchMovies,
    selectMovie,
    analyzeCurrentMovie,
    loadMotifsForMovie,
    toggleMotifSelection,
    selectSingleMotif,
    registerCustomMovie,
    clearSelection,
    resetAll
  };
}
