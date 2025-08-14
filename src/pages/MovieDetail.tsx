"use client"

import React, { useState, useEffect, useCallback, useContext } from "react"
import { useParams } from "react-router-dom"
import { Play, Calendar, Tv, Star } from "lucide-react"
import MovieSection from "../components/MovieSection"
import "../styles/MovieDetail.css"
import { LanguageContext } from "../context/LanguageContext"

interface Genre {
  id: number
  name: string
}

interface Episode {
  id: number
  name: string
  episode_number: number
}

interface Season {
  id: number
  name: string
  episode_count: number
  season_number: number
}

interface MovieDetail {
  id: number
  title?: string
  name?: string
  original_title?: string
  original_name?: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date?: string
  first_air_date?: string
  runtime?: number
  episode_run_time?: number[]
  genres: Genre[]
  vote_average: number
  number_of_seasons?: number
  number_of_episodes?: number
  seasons?: Season[]
}

export default function DetailPage() {
  const languageContext = useContext(LanguageContext);
  if (!languageContext) {
    throw new Error("DetailPage must be used within a LanguageProvider");
  }
  const { selectedLanguage, t } = languageContext;

  const params = useParams()
  const { mediaType, id } = params as { mediaType: "movie" | "tv"; id: string }

  const [detail, setDetail] = useState<MovieDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [selectedSeason, setSelectedSeason] = useState<number>(1)
  const [relatedContent, setRelatedContent] = useState<any[]>([])
  const [popularContent, setPopularContent] = useState<any[]>([])

  const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY
  const TMDB_BASE_URL = import.meta.env.VITE_TMDB_BASE_URL

  const apiLanguageCode = {
    vi: "vi-VN",
    en: "en-US",
    zh: "zh-CN",
  }[selectedLanguage] || "en-US";


  const fetchEpisodes = useCallback(
    async (seasonNumber: number) => {
      if (mediaType !== "tv") return

      try {
        const episodesUrl = `${TMDB_BASE_URL}/tv/${id}/season/${seasonNumber}?api_key=${TMDB_API_KEY}&language=${apiLanguageCode}`
        const episodesResponse = await fetch(episodesUrl)

        if (episodesResponse.ok) {
          const episodesData = await episodesResponse.json()
          setEpisodes(episodesData.episodes || [])
        } else {
          console.warn(t("error_fetching_episodes_for_season", { seasonNumber, status: episodesResponse.status }))
          setEpisodes([])
        }
      } catch (err) {
        console.error(t("error_fetching_episodes"), err)
        setEpisodes([])
      }
    },
    [id, mediaType, TMDB_API_KEY, TMDB_BASE_URL, apiLanguageCode, t],
  )

  const fetchAllData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let currentMediaType = mediaType
      let detailUrl = `${TMDB_BASE_URL}/${currentMediaType}/${id}?api_key=${TMDB_API_KEY}&language=${apiLanguageCode}`
      let detailResponse = await fetch(detailUrl)

      if (detailResponse.status === 404) {
        currentMediaType = currentMediaType === "movie" ? "tv" : "movie"
        detailUrl = `${TMDB_BASE_URL}/${currentMediaType}/${id}?api_key=${TMDB_API_KEY}&language=${apiLanguageCode}`
        detailResponse = await fetch(detailUrl)
      }

      if (!detailResponse.ok) {
        throw new Error(`${t("http_error_status")}: ${detailResponse.status}`)
      }

      const detailData = await detailResponse.json()
      setDetail(detailData)

      if (currentMediaType === "tv" && detailData.seasons && detailData.seasons.length > 0) {
        const latestSeason =
          detailData.seasons.length > 0 ? detailData.seasons[detailData.seasons.length - 1].season_number : 1
        setSelectedSeason(latestSeason)
        fetchEpisodes(latestSeason)
      }

      const relatedUrl = `${TMDB_BASE_URL}/${currentMediaType}/${id}/recommendations?api_key=${TMDB_API_KEY}&language=${apiLanguageCode}&page=1`
      const relatedResponse = await fetch(relatedUrl)
      if (relatedResponse.ok) {
        const relatedData = await relatedResponse.json()
        setRelatedContent(
          (relatedData.results || []).map((item: any) => ({ ...item, media_type: currentMediaType })),
        )
      } else {
        console.warn(t("error_fetching_related_content", { status: relatedResponse.status }))
        setRelatedContent([])
      }

      const popularUrl = `${TMDB_BASE_URL}/${currentMediaType}/popular?api_key=${TMDB_API_KEY}&language=${apiLanguageCode}&page=1`
      const popularResponse = await fetch(popularUrl)
      if (popularResponse.ok) {
        const popularData = await popularResponse.json()
        setPopularContent(
          (popularData.results || []).map((item: any) => ({ ...item, media_type: currentMediaType })),
        )
      } else {
        console.warn(t("error_fetching_popular_content", { status: popularResponse.status }))
        setPopularContent([])
      }
    } catch (err) {
      console.error(t("error_fetching_data"), err)
      setError(err instanceof Error ? err.message : t("unknown_error"))
    } finally {
      setLoading(false)
    }
  }, [id, mediaType, TMDB_API_KEY, TMDB_BASE_URL, apiLanguageCode, fetchEpisodes, t])

  useEffect(() => {
    if (!TMDB_API_KEY || !TMDB_BASE_URL) {
      setError(t("missing_api_config"))
      setLoading(false)
      return
    }
    fetchAllData()
  }, [fetchAllData, TMDB_API_KEY, TMDB_BASE_URL, t])

  const handleSeasonChange = (seasonNumber: number) => {
    setSelectedSeason(seasonNumber)
    fetchEpisodes(seasonNumber)
  }

  const formatRuntime = (detail: MovieDetail) => {
    if (mediaType === "movie" && detail.runtime) {
      return t("movie_runtime", { runtime: detail.runtime })
    }
    if (mediaType === "tv" && detail.episode_run_time && detail.episode_run_time.length > 0) {
      const runtimes = detail.episode_run_time
      if (runtimes.length > 1) {
        const min = Math.min(...runtimes)
        const max = Math.max(...runtimes)
        return t("tv_runtime_range", { min, max })
      }
      return t("tv_runtime_single", { runtime: runtimes[0] })
    }
    return t("not_available")
  }

  if (loading) {
    return <div className="detail-page-container loading-state">{t("loading_info")}</div>
  }

  if (error) {
    return <div className="detail-page-container error-state">{t("error_message")}: {error}</div>
  }

  if (!detail) {
    return <div className="detail-page-container no-data-state">{t("no_info_found")}</div>
  }

  const imageBaseUrl = import.meta.env.VITE_TMDB_IMAGE_BASE_URL
  const posterUrl = detail.poster_path ? `${imageBaseUrl}${detail.poster_path}` : "/placeholder.svg"
  const backdropUrl = detail.backdrop_path ? `${imageBaseUrl}${detail.backdrop_path}` : "/placeholder.svg"

  const mainTitle = detail.title || detail.name || t("unknown_title")
  const originalTitle = detail.original_title || detail.original_name || ""
  const releaseYear = new Date(detail.release_date || detail.first_air_date || "").getFullYear() || t("not_available")
  const genreNames = detail.genres?.map(g => g.name).join(", ") || t("not_available")
  const runtimeFormatted = formatRuntime(detail)

  return (
    <div className="detail-page-container">
      <div className="backdrop-overlay" style={{ backgroundImage: `url(${backdropUrl})` }}></div>
      <div className="detail-content-wrapper">
        <div className="breadcrumbs">
          <span>{t("homepage")}</span><span>{genreNames.split(",")[0]}</span><span>{mainTitle}</span>
        </div>

        <div className="main-detail-section">
          <div className="info-column">
            <h1 className="main-title">{mainTitle}</h1>
            {originalTitle && <p className="original-title">({originalTitle})</p>}

            <div className="meta-badges">
              <span className="badge hd">HD</span>
              <span className="badge year">
                <Calendar size={16} /> {releaseYear}
              </span>
              <span className="badge rating">
                <Star size={16} className="rating-star" /> {detail.vote_average?.toFixed(1) || t("not_available")} / 10
              </span>
            </div>

            <div className="genre-tags">
              {detail.genres?.map(genre => (
                <span key={genre.id} className="genre-tag">
                  {genre.name}
                </span>
              ))}
            </div>

            {runtimeFormatted !== t("not_available") && <p className="runtime">{t("runtime_label")}: {runtimeFormatted}</p>}

            <p className="overview-text">
              <strong>{t("overview_label")}:</strong> {detail.overview || t("no_overview")}
            </p>

            <button className="watch-button">
              <Play size={20} /> {t("watch_movie_button")}
            </button>
          </div>

          <div className="poster-column">
            <img src={posterUrl || "/placeholder.svg"} alt={mainTitle} className="detail-poster" />
          </div>
        </div>

        {mediaType === "tv" && detail.seasons && detail.seasons.length > 0 && (
          <div className="season-list-section">
            <h2 className="section-heading">{t("episode_list_heading")}</h2>
            <div className="season-selector-wrapper">
              {detail.seasons.map(season => (
                <button
                  key={season.id}
                  className={`season-button ${selectedSeason === season.season_number ? "active" : ""}`}
                  onClick={() => handleSeasonChange(season.season_number)}
                >
                  {t("season_label", { seasonNumber: season.season_number })}
                </button>
              ))}
            </div>
            {episodes.length > 0 && (
              <div className="episode-list-scroll">
                {episodes.map(episode => (
                  <button key={episode.id} className="episode-button">
                    <Tv size={16} /> {t("episode_label", { episodeNumber: episode.episode_number })}: {episode.name || t("not_available")}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="suggested-movies-container">
        {relatedContent.length > 0 && (
          <MovieSection 
            title={t("related_movies_heading")} 
            endpoint={`${mediaType}/${id}/recommendations`}
            showViewAll={true} />
        )}

        {popularContent.length > 0 && (
          <MovieSection 
            title={t("recommended_movies_heading")} 
            endpoint={`${mediaType}/popular`}
            showViewAll={true} />
        )}
        </div>
      </div>
    </div>
  )
}