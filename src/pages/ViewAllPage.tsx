"use client";

import { useState, useEffect, useContext } from 'react';
import '../styles/ViewAllPage.css';
import MovieCard, { Movie } from '../components/MovieCard';
import FilterSelect from '../components/FilterSelect';
import { sortOptions, yearOptions, genreOptions } from '../data/filterOptions';
import { LanguageContext } from '../context/LanguageContext';

interface ViewAllPageProps {
  title: string;
  endpoint: string;
  onBack: () => void;
}

const ViewAllPage = ({ title, endpoint, onBack }: ViewAllPageProps) => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("ViewAllPage must be used within a LanguageProvider");
  }
  const { selectedLanguage, t } = context;

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const [appliedFilters, setAppliedFilters] = useState({
    sort: ['popularity.desc'],
    year: [''],
    genres: [''],
  });

  const [tempFilters, setTempFilters] = useState({
    sort: ['popularity.desc'],
    year: [''],
    genres: [''],
  });

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const apiKey = import.meta.env.VITE_TMDB_API_KEY;
  const baseUrl = import.meta.env.VITE_TMDB_BASE_URL;
  const mediaType = endpoint.includes('movie') ? 'movie' : 'tv';

  const handleApplyFilters = () => {
    setAppliedFilters(tempFilters);
    setPage(1);
    setMovies([]);
    setOpenDropdown(null);
  };

  const handleLoadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  useEffect(() => {
    const fetchMovies = async () => {
      if (!apiKey || !baseUrl) {
        setError(t("missing_api_config"));
        setLoading(false);
        return;
      }
      
      const apiLanguageCode = {
        vi: "vi-VN",
        en: "en-US",
        zh: "zh-CN",
      }[selectedLanguage] || "en-US";

      let url = `${baseUrl}/discover/${mediaType}?api_key=${apiKey}&language=${apiLanguageCode}&page=${page}`;

      const sortValue = appliedFilters.sort.filter(s => s !== '');
      if (sortValue.length > 0) {
        url += `&sort_by=${sortValue[0]}`;
      }

      const years = appliedFilters.year.filter(y => y !== '');
      if (years.length > 0) {
        url += `&primary_release_year=${years.join(',')}`;
      }

      const genres = appliedFilters.genres.filter(g => g !== '');
      if (genres.length > 0) {
        url += `&with_genres=${genres.join(',')}`;
      }

      try {
        if (page === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`${t("http_error_message")}: ${response.status}`);
        }

        const data = await response.json();

        const moviesWithMediaType = data.results.map((item: any) => ({
          ...item,
          media_type: mediaType
        }));

        if (page === 1) {
          setMovies(moviesWithMediaType);
        } else {
          setMovies(prevMovies => [...prevMovies, ...moviesWithMediaType]);
        }

        setError(null);
      } catch (e) {
        console.error("Error fetching movies:", e);
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError(t("unknown_error"));
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    fetchMovies();
  }, [apiKey, baseUrl, mediaType, appliedFilters, page, selectedLanguage, t]);

  if (loading && page === 1) {
    return <div className="loading-state">{t("loading_movies")}</div>;
  }

  if (error) {
    return <div className="error-state">{t("error_message")}: {error}</div>;
  }

  return (
    <div className="view-all-page">
      <button onClick={onBack} className="back-button">
        ← {t("back_button")}
      </button>
      <div className="page-header">
        <h1 className="page-title">{title}</h1>
        <div className="breadcrumb">
          {t("homepage_title")} / {title}
        </div>
      </div>
      <div className="filters-container">
        <div className="filters-row">
          <FilterSelect
            label={t("sort_by_label")}
            options={sortOptions}
            onSelect={(values) => setTempFilters({ ...tempFilters, sort: values })}
            selectedValues={tempFilters.sort}
            isOpen={openDropdown === 'sort'}
            onToggle={() => setOpenDropdown(openDropdown === 'sort' ? null : 'sort')}
          />
          <FilterSelect
            label={t("release_year_label")}
            options={yearOptions}
            onSelect={(values) => setTempFilters({ ...tempFilters, year: values })}
            selectedValues={tempFilters.year}
            isOpen={openDropdown === 'year'}
            onToggle={() => setOpenDropdown(openDropdown === 'year' ? null : 'year')}
          />
          <FilterSelect
            label={t("genre_label")}
            options={genreOptions}
            onSelect={(values) => setTempFilters({ ...tempFilters, genres: values })}
            selectedValues={tempFilters.genres}
            isOpen={openDropdown === 'genres'}
            onToggle={() => setOpenDropdown(openDropdown === 'genres' ? null : 'genres')}
          />
          <button onClick={handleApplyFilters} className="filter-button">{t("filter_movies_button")}</button>
        </div>
      </div>
      <div className="movie-grid">
        {movies.map(movie => (
          <MovieCard
            key={`${movie.id}-${movie.title}`}
            movie={movie}
            mediaType={mediaType}
          />
        ))}
      </div>

      <div className="load-more-container" style={{ textAlign: 'center', marginTop: '30px' }}>
        {loadingMore ? (
          <p>{t("loading_more")}</p>
        ) : (
          <button onClick={handleLoadMore} className="filter-button">
            {t("load_more_button")}
          </button>
        )}
      </div>
    </div>
  );
};

export default ViewAllPage;