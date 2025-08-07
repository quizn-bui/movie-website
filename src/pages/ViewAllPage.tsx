"use client"

import { useState, useEffect } from 'react';
import '../styles/ViewAllPage.css';
import MovieCard, { Movie } from '../components/MovieCard';
import FilterSelect from '../components/FilterSelect';
import { sortOptions, yearOptions, genreOptions } from '../data/filterOptions'; 

interface ViewAllPageProps {
  title: string;
  endpoint: string;
  onBack: () => void;
}

const ViewAllPage = ({ title, endpoint, onBack }: ViewAllPageProps) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const apiKey = import.meta.env.VITE_TMDB_API_KEY;
  const baseUrl = import.meta.env.VITE_TMDB_BASE_URL;
  const mediaType = endpoint.includes('movie') ? 'movie' : 'tv';

  const handleApplyFilters = () => {
    setAppliedFilters(tempFilters);
  };

  useEffect(() => {
    const fetchMovies = async () => {
      if (!apiKey || !baseUrl || !endpoint) {
        setError("Missing API configuration or endpoint.");
        setLoading(false);
        return;
      }

      let url = `${baseUrl}/discover/${mediaType}?api_key=${apiKey}&language=vi-VN&page=1`;

      if (appliedFilters.sort.length > 0) {
        url += `&sort_by=${appliedFilters.sort[0]}`;
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
        setLoading(true);
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        const moviesWithMediaType = data.results.map((item: any) => ({
          ...item,
          media_type: mediaType
        }));
        
        setMovies(moviesWithMediaType);
        setError(null);
      } catch (e) {
        console.error("Error fetching movies:", e);
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("An unknown error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [apiKey, baseUrl, mediaType, appliedFilters]);

  if (loading) {
    return <div className="loading-state">Đang tải phim...</div>;
  }

  if (error) {
    return <div className="error-state">Lỗi: {error}</div>;
  }

  return (
    <div className="view-all-page">
      <button onClick={onBack} className="back-button">
        Quay lại
      </button>
      <div className="page-header">
        <h1 className="page-title">{title}</h1>
        <div className="breadcrumb">
          Trang chủ / {title}
        </div>
      </div>
      <div className="filters-container">
        <div className="filters-row">
          <FilterSelect
            label="Sắp xếp theo"
            options={sortOptions}
            onSelect={(values) => setTempFilters({ ...tempFilters, sort: values })}
            selectedValues={tempFilters.sort}
          />
          <FilterSelect
            label="Năm phát hành"
            options={yearOptions}
            onSelect={(values) => setTempFilters({ ...tempFilters, year: values })}
            selectedValues={tempFilters.year}
          />
          <FilterSelect
            label="Thể loại"
            options={genreOptions}
            onSelect={(values) => setTempFilters({ ...tempFilters, genres: values })}
            selectedValues={tempFilters.genres}
          />
          <button onClick={handleApplyFilters} className="filter-button">Lọc phim</button>
        </div>
      </div>
      <div className="movie-grid">
        {movies.map(movie => (
          <MovieCard 
            key={movie.id} 
            movie={movie} 
            mediaType={mediaType} 
          />
        ))}
      </div>
    </div>
  );
};

export default ViewAllPage;