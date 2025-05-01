import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Weather() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center">
      <div className="text-center p-8 bg-brand-deep rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-4">{t('features.weather.title')}</h1>
        <p className="text-brand-light mb-6">{t('features.weather.desc')}</p>
        <Link
          to="/"
          className="inline-block px-4 py-2 bg-brand-accent text-brand-dark rounded-md hover:bg-brand-light transition"
        >
          &larr; {t('backHome')}
        </Link>
      </div>
    </div>
  );
}
