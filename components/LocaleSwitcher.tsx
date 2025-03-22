import { useLocale } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function LocaleSwitcher() {
  // The hook gives you the current locale that Next‑intl determined.
  const currentLocale = useLocale();
  // usePathname gets the full current route name.
  const pathname = usePathname();
  
  const supportedLocales = ['en', 'hu'];

  const buildLocalizedPath = (newLocale: any) => {
    const segments = pathname.split('/');
    if (supportedLocales.includes(segments[1])) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    return segments.join('/') || '/';
  };

  return (
    <div>
      {supportedLocales.map((locale) => {
        // If this locale matches the current one, simply show it.
        if (locale === currentLocale) {
          return (
            <span key={locale} style={{ fontWeight: 'bold', marginRight: '1rem' }}>
              {locale.toUpperCase()}
            </span>
          );
        }
        // Otherwise, provide a link that navigates to the same path with the new locale.
        return (
          <Link key={locale} href={buildLocalizedPath(locale)}>
            <span style={{ marginRight: '1rem' }}>{locale.toUpperCase()}</span>
          </Link>
        );
      })}
    </div>
  );
}
