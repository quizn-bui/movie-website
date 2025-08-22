"use client";

import { useState, useEffect, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import MovieCard from "../components/MovieCard";
import ActorCard from "../components/ActorCard";
import "../styles/SearchPage.css";
import FilterSelect, { DropdownOption } from "../components/FilterSelect";
import { sortOptions, yearOptions, genreOptions } from "../data/filterOptions";
import { LanguageContext } from "../context/LanguageContext";

export interface Movie {
  id: number;
  title: string;
  name?: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
  first_air_date?: string;
  overview: string;
  media_type: "movie" | "tv" | "person";
}

export default function SearchPage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("SearchPage must be used within a LanguageProvider");
  }
  const { selectedLanguage, t } = context;

  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("query") || "";

  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("movie");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

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

  const handleApplyFilters = () => {
    setAppliedFilters(tempFilters);
    setCurrentPage(1);
    setOpenDropdown(null);
  };
    
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery) {
        setSearchResults([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        if (!apiKey || !baseUrl) {
          throw new Error("Missing API configuration");
        }
        
        const apiLanguageCode = {
          vi: "vi-VN",
          en: "en-US",
          zh: "zh-CN",
        }[selectedLanguage] || "en-US";
        
        const endpoint = activeFilter === "movie" ? "/search/movie" : "/search/person";
        let url = `${baseUrl}${endpoint}?api_key=${apiKey}&query=${encodeURIComponent(searchQuery)}&language=${apiLanguageCode}&page=${currentPage}`;

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

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setSearchResults(data.results || []);
        setTotalPages(data.total_pages || 0);
      } catch (err) {
        setError(err instanceof Error ? t("error_message") : t("unknown_error"));
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchQuery, activeFilter, currentPage, appliedFilters, apiKey, baseUrl, selectedLanguage, t]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pagesToShow = 5;
    const pageNumbers = [];
    let startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + pagesToShow - 1);
    
    if (endPage - startPage + 1 < pagesToShow) {
      startPage = Math.max(1, endPage - pagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          className={`pagination-btn page-number ${i === currentPage ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="pagination">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-btn page-nav"
        >
          &lt; {t("previous_page")}
        </button>
        {startPage > 1 && (
          <>
            <button className="pagination-btn page-number" onClick={() => handlePageChange(1)}>1</button>
            {startPage > 2 && <span className="pagination-dots">...</span>}
          </>
        )}
        {pageNumbers}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="pagination-dots">...</span>}
            <button className="pagination-btn page-number" onClick={() => handlePageChange(totalPages)}>{totalPages}</button>
          </>
        )}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="pagination-btn page-nav"
        >
          {t("next_page")} &gt;
        </button>
      </div>
    );
  };
  
  const translatedSortOptions: DropdownOption[] = sortOptions.map(option => ({
    ...option,
    label: t(option.label)
  }));
  
  const translatedGenreOptions: DropdownOption[] = genreOptions.map(option => ({
    ...option,
    label: t(option.label)
  }));
  
  const translatedYearOptions: DropdownOption[] = yearOptions.map(option => ({
    ...option,
    label: option.label === 'all_years' ? t('all_years') : option.label
  }));

  return (
    <div className="search-page-container">
      <div className="search-page-header">
        <Search className="search-page-icon" />
        <h1 className="search-page-title">{t("search_results_for")} "{decodeURIComponent(searchQuery)}"</h1>
      </div>

      <div className="filter-buttons">
        <button
          className={`filter-btn ${activeFilter === "movie" ? "active" : ""}`}
          onClick={() => {
            setActiveFilter("movie");
            setCurrentPage(1);
          }}
        >
          {t("movies_tab")}
        </button>
        
      </div>
      
      {activeFilter === 'movie' && (
        <div className="filters-container">
          <div className="filters-row">
            <FilterSelect
              label={t("sort_by_label")}
              options={translatedSortOptions}
              onSelect={(values) => setTempFilters({ ...tempFilters, sort: values })}
              selectedValues={tempFilters.sort}
              isOpen={openDropdown === 'sort'}
              onToggle={() => setOpenDropdown(openDropdown === 'sort' ? null : 'sort')}
            />
            <FilterSelect
              label={t("release_year_label")}
              options={translatedYearOptions}
              onSelect={(values) => setTempFilters({ ...tempFilters, year: values })}
              selectedValues={tempFilters.year}
              isOpen={openDropdown === 'year'}
              onToggle={() => setOpenDropdown(openDropdown === 'year' ? null : 'year')}
            />
            <FilterSelect
              label={t("genre_label")}
              options={translatedGenreOptions}
              onSelect={(values) => setTempFilters({ ...tempFilters, genres: values })}
              selectedValues={tempFilters.genres}
              isOpen={openDropdown === 'genres'}
              onToggle={() => setOpenDropdown(openDropdown === 'genres' ? null : 'genres')}
            />
            <button onClick={handleApplyFilters} className="filter-button">{t("filter_movies_button")}</button>
          </div>
        </div>
      )}

      {loading && <div className="loading-message">{t("loading_results")}</div>}
      {error && <div className="error-message">{t("error_message")}: {error}</div>}
      {!loading && !error && searchResults.length === 0 && (
        <div className="no-results-message">{t("no_results_found")}</div>
      )}

      {!loading && !error && searchResults.length > 0 && (
        <>
          <div className="search-results-grid">
            {searchResults.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                mediaType={movie.media_type}
              />
            ))}
          </div>

          {renderPagination()}
        </>
      )}
    </div>
  );
}