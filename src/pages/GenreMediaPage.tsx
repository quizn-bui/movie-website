import React, { useContext } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import MediaGridPage from '../pages/MediaGridPage';
import { LanguageContext } from '../context/LanguageContext';

const GenreMediaPage: React.FC = () => {
  const { mediaType, genreId } = useParams<{ mediaType: string; genreId: string }>();
  const [searchParams] = useSearchParams();
  const genreName = searchParams.get('name'); 

  const languageContext = useContext(LanguageContext);
  if (!languageContext) {
    throw new Error("GenreMediaPage must be used within a LanguageProvider");
  }
  const { t } = languageContext;

  let endpoint = '';
  let pageTitle = ''; 

  if (mediaType === 'movie' && genreId) {
    endpoint = `discover/movie?with_genres=${genreId}`;
    pageTitle = genreName ? t('movies_genre_title', { genreName }) : t('movies_by_genre_default_title');
  } else if (mediaType === 'tv' && genreId) {
    endpoint = `discover/tv?with_genres=${genreId}`;
    pageTitle = genreName ? t('tv_shows_genre_title', { genreName }) : t('tv_shows_by_genre_default_title');
  } else {
    return <p>{t('error_invalid_genre')}</p>;
  }

  return (
    <MediaGridPage title={pageTitle} endpoint={endpoint} />
  );
};

export default GenreMediaPage;