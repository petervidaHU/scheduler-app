import { ActionIcon, Menu, useMantineColorScheme } from "@mantine/core";
import { IconMoon, IconSun, IconSunMoon } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

/**
 * Single-icon color scheme control in the top bar (UX-UI-principles §6).
 */
export function ColorSchemeToggle() {
  const { t } = useTranslation();
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  const CurrentIcon =
    colorScheme === "dark" ? IconMoon : colorScheme === "light" ? IconSun : IconSunMoon;

  return (
    <Menu position="bottom-end" withArrow>
      <Menu.Target>
        <ActionIcon variant="subtle" size="lg" aria-label={t("ui.colorScheme")}>
          <CurrentIcon size={20} aria-hidden />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          leftSection={<IconSun size={16} aria-hidden />}
          onClick={() => setColorScheme("light")}
          data-active={colorScheme === "light" || undefined}
        >
          {t("ui.lightMode")}
        </Menu.Item>
        <Menu.Item
          leftSection={<IconMoon size={16} aria-hidden />}
          onClick={() => setColorScheme("dark")}
          data-active={colorScheme === "dark" || undefined}
        >
          {t("ui.darkMode")}
        </Menu.Item>
        <Menu.Item
          leftSection={<IconSunMoon size={16} aria-hidden />}
          onClick={() => setColorScheme("auto")}
          data-active={colorScheme === "auto" || undefined}
        >
          {t("ui.autoMode")}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
