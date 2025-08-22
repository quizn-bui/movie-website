import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import MediaGridPage from './MediaGridPage'; 
import { countryMap } from '../data/countryMapping';

const CountryPage: React.FC = () => {
  const { mediaType, countryCode } = useParams<{ mediaType: string; countryCode: string }>();
  const languageContext = useContext(LanguageContext);
  
  if (!languageContext) {
    throw new Error("CountryPage must be used within a LanguageProvider");
  }
  const { t } = languageContext;

  if (!countryCode || !mediaType) {
    return <div>{t("error_invalid_country_media_type")}</div>;
  }

  const endpoint = `discover/${mediaType}?with_origin_country=${countryCode}`;

  const countryNameKey = countryMap[countryCode.toUpperCase()];
  
  const pageTitle = countryNameKey
    ? t("media_by_country_title", { countryName: t(countryNameKey) })
    : t("media_by_country_default_title");

  return <MediaGridPage title={pageTitle} endpoint={endpoint} />;
};

export default CountryPage;   