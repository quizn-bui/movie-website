import React, { useContext } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import MediaGridPage from './MediaGridPage'; 

const CountryPage: React.FC = () => {
  const { mediaType, countryCode } = useParams<{ mediaType: string; countryCode: string }>();
  const [searchParams] = useSearchParams();
  const countryName = searchParams.get('name');

  const languageContext = useContext(LanguageContext);
  if (!languageContext) {
    throw new Error("CountryPage must be used within a LanguageProvider");
  }
  const { t } = languageContext;

  if (!countryCode || !mediaType) {
    return <div>{t("error_invalid_country_media_type")}</div>;
  }

  const endpoint = `discover/${mediaType}?with_origin_country=${countryCode}`;
  const pageTitle = countryName
    ? `${t("media_by_country_title", { countryName })}`
    : `${t("media_by_country_default_title")}`;

  return <MediaGridPage title={pageTitle} endpoint={endpoint} />;
};

export default CountryPage;