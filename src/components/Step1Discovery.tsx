/**
 * Step 1: Movie Discovery
 * Allows users to browse curated cinema masterpieces or register their own film.
 * Follows Rule 2.1: Max 2 primary process execution/navigation commands at bottom.
 */

import React, { useState } from 'react';
import { Search, Sparkles, Plus, Film, Globe2, Calendar, User, Check, RefreshCw } from 'lucide-react';
import { MovieItem } from '../types';

interface Step1DiscoveryProps {
  movies: MovieItem[];
  selectedMovie: MovieItem | null;
  loading: boolean;
  onSelectMovie: (movie: MovieItem) => void;
  onSearch: (query: string, filters?: { genre?: string; country?: string }) => void;
  onRegisterCustom: (data: {
    title: string;
    originalTitle?: string;
    year?: number;
    country?: string;
    director?: string;
    genre?: string[];
    synopsis: string;
    notes?: string;
  }) => void;
  onProceedToStep2: () => void;
}

const GENRES = ['전체', '드라마', 'SF', '스릴러', '로맨스', '블랙코미디', '미스터리', '성장', '재난'];
const COUNTRIES = ['전체', '대한민국', '미국', '이탈리아'];

export const Step1Discovery: React.FC<Step1DiscoveryProps> = ({
  movies,
  selectedMovie,
  loading,
  onSelectMovie,
  onSearch,
  onRegisterCustom,
  onProceedToStep2
}) => {
  // Main entry path tab (Path A vs Path B)
  const [entryMode, setEntryMode] = useState<'curated' | 'custom'>('curated');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('전체');
  const [selectedCountry, setSelectedCountry] = useState('전체');

  // Custom movie form fields
  const [customTitle, setCustomTitle] = useState('');
  const [customDirector, setCustomDirector] = useState('');
  const [customYear, setCustomYear] = useState('2023');
  const [customCountry, setCustomCountry] = useState('대한민국');
  const [customGenre, setCustomGenre] = useState('드라마');
  const [customSynopsis, setCustomSynopsis] = useState('');
  const [customNotes, setCustomNotes] = useState('');

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    onSearch(q, {
      genre: selectedGenre !== '전체' ? selectedGenre : undefined,
      country: selectedCountry !== '전체' ? selectedCountry : undefined
    });
  };

  const handleGenreChange = (g: string) => {
    setSelectedGenre(g);
    onSearch(searchQuery, {
      genre: g !== '전체' ? g : undefined,
      country: selectedCountry !== '전체' ? selectedCountry : undefined
    });
  };

  const handleCountryChange = (c: string) => {
    setSelectedCountry(c);
    onSearch(searchQuery, {
      genre: selectedGenre !== '전체' ? selectedGenre : undefined,
      country: c !== '전체' ? c : undefined
    });
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || !customSynopsis.trim()) return;

    onRegisterCustom({
      title: customTitle.trim(),
      director: customDirector.trim() || '감독 미상',
      year: parseInt(customYear, 10) || 2023,
      country: customCountry,
      genre: [customGenre],
      synopsis: customSynopsis.trim(),
      notes: customNotes.trim()
    });

    setEntryMode('curated');
  };

  const selectRandomMovie = () => {
    if (movies.length > 0) {
      const random = movies[Math.floor(Math.random() * movies.length)];
      onSelectMovie(random);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900/90 to-amber-950/30 border border-slate-800 p-6 sm:p-10 shadow-2xl">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI 서사 재창작 스튜디오 Phase 1</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            영화 한 편에는 <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">
              천 가지 인생 이야기
            </span>
            가 숨 쉬고 있습니다.
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            원작의 줄거리를 단순 요약하지 않습니다. 영화 속 인간의 감정, 갈등, 인생의 통찰을 분석하여
            독창적인 새로운 이야기와 대본을 창작합니다.
          </p>
        </div>

        {/* 2 Main Entry Paths Switcher */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
          <button
            type="button"
            onClick={() => setEntryMode('curated')}
            className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition cursor-pointer ${
              entryMode === 'curated'
                ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                entryMode === 'curated' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
              }`}
            >
              <Film className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">A. 명작 영화에서 새로운 이야기 찾기</p>
              <p className="text-xs text-slate-400">검증된 서사 분석과 약 10개의 추천 모티브</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setEntryMode('custom')}
            className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition cursor-pointer ${
              entryMode === 'custom'
                ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                entryMode === 'custom' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
              }`}
            >
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">B. 나만의 이야기 직접 만들기</p>
              <p className="text-xs text-slate-400">기억에 남는 영화 제목과 줄거리 직접 등록</p>
            </div>
          </button>
        </div>
      </div>

      {/* Path A Content: Browse & Filter Movies */}
      {entryMode === 'curated' && (
        <div className="space-y-6">
          {/* Search Bar & Filters */}
          <div className="bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="영화 제목, 감독, 배우, 줄거리 키워드 검색 (예: 기생충, 인터스텔라, 헤어질 결심, 사랑, 시간...)"
                className="w-full pl-12 pr-4 py-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition text-sm"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-medium text-slate-400 mr-1">장르:</span>
              {GENRES.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => handleGenreChange(g)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                    selectedGenre === g
                      ? 'bg-amber-500 text-slate-950 font-semibold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {g}
                </button>
              ))}

              <span className="text-xs font-medium text-slate-400 ml-3 mr-1">국가:</span>
              {COUNTRIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleCountryChange(c)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                    selectedCountry === c
                      ? 'bg-amber-500 text-slate-950 font-semibold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Movie Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {movies.map((movie) => {
              const isSelected = selectedMovie?.id === movie.id;
              return (
                <div
                  key={movie.id}
                  onClick={() => onSelectMovie(movie)}
                  className={`group relative rounded-2xl overflow-hidden border text-left transition duration-200 cursor-pointer flex flex-col ${
                    isSelected
                      ? 'bg-slate-900 border-amber-500 ring-2 ring-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.2)]'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  {/* Poster Header */}
                  <div className="relative h-44 w-full overflow-hidden bg-slate-950">
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500 opacity-80 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

                    {/* Selected badge */}
                    {isSelected && (
                      <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 font-bold px-2.5 py-1 rounded-full text-xs flex items-center gap-1 shadow-md">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>선택됨</span>
                      </div>
                    )}

                    {/* Source tag */}
                    <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-sm text-slate-300 px-2.5 py-0.5 rounded-md text-[11px] border border-slate-700 font-medium">
                      {movie.source === 'curated' ? '큐레이션 명작' : '직접 등록'}
                    </div>

                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-lg font-bold text-white tracking-tight flex items-baseline gap-2">
                        <span>{movie.title}</span>
                        <span className="text-xs text-slate-300 font-normal">
                          {movie.originalTitle} ({movie.year})
                        </span>
                      </h3>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-amber-400" />
                          {movie.director}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Globe2 className="w-3.5 h-3.5 text-slate-400" />
                          {movie.country}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {movie.year}
                        </span>
                      </div>

                      {/* Genre Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {movie.genre.map((g) => (
                          <span
                            key={g}
                            className="px-2 py-0.5 bg-slate-800/80 rounded text-[11px] text-slate-300 border border-slate-700/50"
                          >
                            {g}
                          </span>
                        ))}
                      </div>

                      {/* Synopsis */}
                      <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed pt-1">
                        {movie.synopsis}
                      </p>
                    </div>

                    {/* Bottom notes */}
                    {movie.notes && (
                      <div className="pt-2 border-t border-slate-800/60 text-[11px] text-amber-300/80 italic">
                        💡 {movie.notes}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {movies.length === 0 && !loading && (
            <div className="text-center py-12 bg-slate-900/30 rounded-2xl border border-slate-800">
              <Film className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-300 font-medium">검색 조건에 맞는 영화가 없습니다.</p>
              <p className="text-xs text-slate-500 mt-1">
                직접 등록 탭에서 원하는 영화를 직접 입력하거나 검색어를 초기화해 보세요.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Path B Content: Custom Movie Registration */}
      {entryMode === 'custom' && (
        <form
          onSubmit={handleCustomSubmit}
          className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto space-y-5"
        >
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-400" />
              나만의 영화 직접 등록하기
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              외부 API 연결 없이도 영화 제목과 대략적인 줄거리만 입력하면 AI가 서사를 분석하고 모티브를 발굴합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                영화 제목 <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                required
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="예: 올드보이, 봄날은 간다, 인셉션..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">감독 (선택)</label>
              <input
                type="text"
                value={customDirector}
                onChange={(e) => setCustomDirector(e.target.value)}
                placeholder="예: 박찬욱, 허진호..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">개봉 연도</label>
              <input
                type="number"
                value={customYear}
                onChange={(e) => setCustomYear(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">국가</label>
              <input
                type="text"
                value={customCountry}
                onChange={(e) => setCustomCountry(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">주요 장르</label>
            <select
              value={customGenre}
              onChange={(e) => setCustomGenre(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-amber-500"
            >
              {GENRES.filter((g) => g !== '전체').map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              줄거리 또는 인상 깊었던 서사 요약 <span className="text-amber-400">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={customSynopsis}
              onChange={(e) => setCustomSynopsis(e.target.value)}
              placeholder="영화의 대략적인 줄거리, 인물들의 갈등, 결말의 분위기 등을 자유롭게 적어주세요."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">창작 메모 (선택)</label>
            <input
              type="text"
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="예: 주인공의 죄책감에 집중하고 싶음, SF물로 바꾸고 싶음"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition text-sm cursor-pointer shadow-lg shadow-amber-500/20"
            >
              이 영화 등록하고 즉시 분석하기
            </button>
          </div>
        </form>
      )}

      {/* Selected Movie Summary Floating/Bottom Bar */}
      {selectedMovie && (
        <div className="bg-slate-900 border border-amber-500/50 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <img
              src={selectedMovie.posterUrl}
              alt={selectedMovie.title}
              className="w-12 h-16 object-cover rounded-lg border border-slate-700"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-amber-400">선택된 영화</span>
                <span className="text-xs text-slate-400">• {selectedMovie.genre.join(', ')}</span>
              </div>
              <h4 className="text-base font-bold text-white">
                {selectedMovie.title}{' '}
                <span className="text-xs text-slate-400 font-normal">({selectedMovie.year})</span>
              </h4>
              <p className="text-xs text-slate-300 line-clamp-1">{selectedMovie.synopsis}</p>
            </div>
          </div>
        </div>
      )}

      {/* Primary Action Commands Bar (STRICTLY MAXIMUM 2 BUTTONS as per Rule 2.1) */}
      <div className="sticky bottom-4 z-30 pt-4 border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-md p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl">
        <div className="text-xs text-slate-400 text-center sm:text-left">
          {selectedMovie ? (
            <span className="text-amber-300 font-medium">
              [ {selectedMovie.title} ] 서사 분석 및 모티브 발굴 준비 완료
            </span>
          ) : (
            <span>영화를 선택하면 다음 단계로 이동할 수 있습니다.</span>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Action 1: Random pick or Cancel/Deselect */}
          <button
            type="button"
            onClick={selectRandomMovie}
            className="flex-1 sm:flex-none px-4 py-3 rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>추천작 무작위 선택</span>
          </button>

          {/* Action 2: Primary Proceed Command */}
          <button
            type="button"
            onClick={onProceedToStep2}
            disabled={!selectedMovie}
            className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-lg ${
              selectedMovie
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-amber-500/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>서사 분석 & 모티브 발굴 시작 →</span>
          </button>
        </div>
      </div>
    </div>
  );
};
