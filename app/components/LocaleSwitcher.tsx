import { Anchor, Group } from "@mantine/core";
import { Link, useLocation } from "react-router";
import { SUPPORTED_LOCALES } from "../lib/i18n";

type LocaleSwitcherProps = {
  locale: string;
};

function buildLocalizedPath(pathname: string, targetLocale: string) {
  const parts = pathname.split("/").filter(Boolean);

  if (parts.length > 0 && SUPPORTED_LOCALES.includes(parts[0] as (typeof SUPPORTED_LOCALES)[number])) {
    parts[0] = targetLocale;
  } else {
    parts.unshift(targetLocale);
  }

  return `/${parts.join("/")}`;
}

export default function LocaleSwitcher({ locale }: LocaleSwitcherProps) {
  const location = useLocation();

  return (
    <Group gap="xs" wrap="wrap">
      {SUPPORTED_LOCALES.map((supportedLocale) => {
        const to = `${buildLocalizedPath(location.pathname, supportedLocale)}${location.search}${location.hash}`;

        return (
          <Anchor
            key={supportedLocale}
            component={Link}
            to={to}
            underline={supportedLocale === locale ? "always" : "hover"}
          >
            {supportedLocale.toUpperCase()}
          </Anchor>
        );
      })}
    </Group>
  );
}