"use client";

import React, { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/MediaGridPage.css';
import MovieCard from '../components/MovieCard';
import FilterSelect from "../components/FilterSelect";
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
  media_type?: "movie" | "tv";
}

interface MediaGridPageProps {
  title: string;
  endpoint: string;
}

const MediaGridPage: React.FC<MediaGridPageProps> = ({ title, endpoint }) => {
  const languageContext = useContext(LanguageContext);
  if (!languageContext) {
    throw new Error("MediaGridPage must be used within a LanguageProvider");
  }
  const { selectedLanguage, t } = languageContext;

  const [media, setMedia] = useState<Movie[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const mediaType = endpoint.includes('movie') ? 'movie' : 'tv';
  
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

  const handleApplyFilters = () => {
    setAppliedFilters(tempFilters);
    setPage(1);
    setOpenDropdown(null);
  };

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
    const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL;

    if (!API_KEY || !BASE_URL) {
      console.error(t("api_key_or_base_url_missing"));
      setLoading(false);
      return;
    }
    
    const apiLanguageCode = {
      vi: "vi-VN",
      en: "en-US",
      zh: "zh-CN",
    }[selectedLanguage] || "en-US";
    
    let apiUrl = `${BASE_URL}/${endpoint}`;

    apiUrl += `${endpoint.includes('?') ? '&' : '?'}api_key=${API_KEY}&language=${apiLanguageCode}&page=${page}`;

    const sortValue = appliedFilters.sort.filter(s => s !== '');
    if (sortValue.length > 0) {
      apiUrl += `&sort_by=${sortValue[0]}`;
    }
    
    const years = appliedFilters.year.filter(y => y !== '');
    if (years.length > 0) {
      apiUrl += `&primary_release_year=${years.join(',')}`;
    }
    
    const genres = appliedFilters.genres.filter(g => g !== '');
    if (genres.length > 0) {
      apiUrl += `&with_genres=${genres.join(',')}`;
    }

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`${t("fetch_data_error", { endpoint, page })} Status: ${response.status}`);
      }
      const data = await response.json();
      
      const moviesWithMediaType = data.results.map((item: any) => ({
        ...item,
        media_type: mediaType
      }));

      setMedia(moviesWithMediaType || []);
      setTotalPages(data.total_pages);
    } catch (error) {
      console.error(t("fetch_media_list_error"), error);
      setMedia([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, endpoint, mediaType, appliedFilters, selectedLanguage, t]);

  useEffect(() => {
    fetchMedia();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page, endpoint, fetchMedia, appliedFilters]);

  const handleBack = () => {
    navigate("/");
  };

  const renderPagination = () => {
    const pagesToShow = 5;
    const startPage = Math.max(1, page - Math.floor(pagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + pagesToShow - 1);

    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          className={`page-number ${i === page ? 'active' : ''}`}
          onClick={() => setPage(i)}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="pagination">
        {page > 1 && (
          <button className="page-nav" onClick={() => setPage(page - 1)}>&lt; {t("previous_page")}</button>
        )}
        {startPage > 1 && (
          <>
            <button className="page-number" onClick={() => setPage(1)}>1</button>
            <span className="pagination-dots">...</span>
          </>
        )}
        {pageNumbers}
        {endPage < totalPages && (
          <>
            <span className="pagination-dots">...</span>
            <button className="page-number" onClick={() => setPage(totalPages)}>{totalPages}</button>
          </>
        )}
        {page < totalPages && (
          <button className="page-nav" onClick={() => setPage(page + 1)}>{t("next_page")} &gt;</button>
        )}
      </div>
    );
  };

  const translatedSortOptions = sortOptions.map(option => ({
    ...option,
    label: t(option.label)
  }));
  
  const translatedYearOptions = yearOptions.map(option => ({
    ...option,
    label: t(option.label)
  }));

  const translatedGenreOptions = genreOptions.map(option => ({
    ...option,
    label: t(option.label)
  }));

  return (
    <div className="media-grid-page">
      <button onClick={handleBack} className="back-button">
        ← {t("back_button")}
      </button>

      <h1 className="page-title">{t(title)}</h1>
      <div className="breadcrumb">
        {t("homepage")} / {t(title)}
      </div>
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
          <button onClick={handleApplyFilters} className="filter-button">{t("filter_button")}</button>
        </div>
      </div>
      
      {loading ? (
        <p className="loading-initial">{t("loading_text")}</p>
      ) : (
        <div className="media-grid">
          {media.length > 0 ? (
            media.map((item) => (
              <MovieCard 
                key={item.id} 
                movie={item} 
                mediaType={mediaType} />
            ))
          ) : (
            <p className="loading-initial">{t("no_data_available")}</p>
          )}
        </div>
      )}

      {!loading && totalPages > 1 && renderPagination()}
    </div>
  );
};

export default MediaGridPage;