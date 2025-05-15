import { getTranslations } from 'next-intl/server';
import styles from "./documentation.module.css";

export default async function DocumentationPage() {
  const t = await getTranslations('documentation');
  return (
    <div className={styles.docContainer}>
      <h1>{t('title')}</h1>
      <p>{t('welcome')}</p>
      <h2>{t('gettingStarted')}</h2>
      <ul>
        <li>{t('navigateMenu')}</li>
        <li>{t('useAdmin')}</li>
        <li>{t('manageSchedules')}</li>
      </ul>
      <h2>{t('support')}</h2>
      <p>{t('helpContact')}</p>
    </div>
  );
}
