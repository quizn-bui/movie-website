"use client";

import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext";
import MovieSection from "../components/MovieSection";
import "../styles/PersonPage.css";

interface PersonDetail {
  id: number;
  name: string;
  profile_path: string | null;
  biography: string;
  birthday: string | null;
  place_of_birth: string | null;
}

export default function PersonPage() {
  const languageContext = useContext(LanguageContext);
  if (!languageContext) {
    throw new Error("PersonPage must be used within a LanguageProvider");
  }
  const { selectedLanguage, t } = languageContext;

  const { id } = useParams<{ id: string }>();
  const [person, setPerson] = useState<PersonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  const TMDB_BASE_URL = import.meta.env.VITE_TMDB_BASE_URL;

  const apiLanguageCode = {
    vi: "vi-VN",
    en: "en-US",
    zh: "zh-CN",
  }[selectedLanguage] || "en-US";

  useEffect(() => {
    if (!id || !TMDB_API_KEY || !TMDB_BASE_URL) {
      setError(t("missing_api_config"));
      setLoading(false);
      return;
    }

    const fetchPersonDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const personUrl = `${TMDB_BASE_URL}/person/${id}?api_key=${TMDB_API_KEY}&language=${apiLanguageCode}`;
        const response = await fetch(personUrl);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setPerson(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("unknown_error"));
      } finally {
        setLoading(false);
      }
    };

    fetchPersonDetails();
  }, [id, TMDB_API_KEY, TMDB_BASE_URL, apiLanguageCode, t]);

  const renderContent = () => {
    if (loading) {
      return <div className="loading-message">{t("loading_info")}</div>;
    }
    if (error) {
      return <div className="error-message">{t("error_message")}: {error}</div>;
    }
    if (!person) {
      return <div className="no-data-message">{t("no_info_found")}</div>;
    }

    const imageBaseUrl = import.meta.env.VITE_TMDB_IMAGE_BASE_URL;
    const profileUrl = person.profile_path
      ? `${imageBaseUrl}${person.profile_path}`
      : "/placeholder.svg";

    return (
      <div className="person-content">
        <div className="person-header">
          <img
            src={profileUrl}
            alt={person.name}
            className="person-profile-image"
          />
          <div className="person-info">
            <h1 className="person-name">{person.name}</h1>
            <p className="person-biography">
              {person.biography || t("no_biography")}
            </p>
            <div className="person-meta">
              {person.birthday && (
                <p>
                  <strong>{t("birthday_label")}:</strong> {person.birthday}
                </p>
              )}
              {person.place_of_birth && (
                <p>
                  <strong>{t("place_of_birth_label")}:</strong> {person.place_of_birth}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="person-known-for-section">
          <MovieSection 
            title={t("known_for_heading")} 
            endpoint={`person/${person.id}/combined_credits`} 
            showViewAll={true} 
            isPersonCredits={true}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="person-page-container">
      {renderContent()}
    </div>
  );
}