import {
  ActionIcon,
  AppShell,
  Box,
  Burger,
  Button,
  Divider,
  Group,
  Menu,
  NavLink,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconBook2,
  IconCalendarWeek,
  IconClock,
  IconFolders,
  IconLayoutDashboard,
  IconLogout,
  IconSchool,
  IconSwitchHorizontal,
  IconUserCircle,
} from "@tabler/icons-react";
import type { TFunction } from "i18next";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Form, Link, useLocation } from "react-router";
import LocaleSwitcher from "../LocaleSwitcher";
import { AppBreadcrumbs, ColorSchemeToggle, entityMeta, type Crumb, type EntityKind } from "~/ui";

type ShellUser = {
  email: string;
  tenancyName: string;
  role: string;
};

type TenancyAppShellProps = {
  locale: string;
  user: ShellUser;
  children: ReactNode;
};

/**
 * Global shell for all authenticated tenancy screens (UX-UI-principles §3.1):
 * persistent sidebar, slim top bar with tenancy context, breadcrumbs above
 * the page content. Exactly one nav item is active at a time.
 */
export function TenancyAppShell({ locale, user, children }: TenancyAppShellProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const [navOpened, { toggle: toggleNav, close: closeNav }] = useDisclosure(false);

  const base = `/${locale}/my-tenancy`;
  const pathname = location.pathname;

  const navItems = [
    {
      label: t("nav.dashboard"),
      to: base,
      icon: IconLayoutDashboard,
      active: pathname === base,
    },
    {
      label: t("nav.schedules"),
      to: `${base}/schedules`,
      icon: IconCalendarWeek,
      active: pathname.startsWith(`${base}/schedules`),
    },
    {
      label: t("nav.timeslots"),
      to: `${base}/timeslots`,
      icon: IconClock,
      active: pathname.startsWith(`${base}/timeslots`),
    },
    {
      label: t("nav.syllabus"),
      to: `${base}/syllabus`,
      icon: IconBook2,
      active: pathname.startsWith(`${base}/syllabus`),
    },
  ];

  const crumbs = buildCrumbs(pathname, base, t);

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{
        width: 240,
        breakpoint: "sm",
        collapsed: { mobile: !navOpened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <Burger
              opened={navOpened}
              onClick={toggleNav}
              hiddenFrom="sm"
              size="sm"
              aria-label={t("nav.toggleNavigation")}
            />
            <Text
              component={Link}
              to={base}
              fw={800}
              size="lg"
              c="var(--mantine-primary-color-filled)"
              style={{ textDecoration: "none", whiteSpace: "nowrap" }}
            >
              Scheduler
            </Text>
            <Button
              component={Link}
              to={`/${locale}/switch-tenancy`}
              variant="subtle"
              color="gray"
              size="xs"
              leftSection={<IconSchool size={16} aria-hidden />}
              visibleFrom="xs"
            >
              {user.tenancyName}
            </Button>
          </Group>

          <Group gap="xs" wrap="nowrap">
            <LocaleSwitcher locale={locale} />
            <ColorSchemeToggle />
            <Menu position="bottom-end" withArrow>
              <Menu.Target>
                <ActionIcon variant="subtle" size="lg" aria-label={t("nav.userMenu")}>
                  <IconUserCircle size={22} aria-hidden />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>{user.email}</Menu.Label>
                <Menu.Item
                  component={Link}
                  to={`/${locale}/switch-tenancy`}
                  leftSection={<IconSwitchHorizontal size={16} aria-hidden />}
                >
                  {t("common.switchSchool")}
                </Menu.Item>
                <Menu.Divider />
                <Form method="post" action={`/${locale}/logout`}>
                  <Menu.Item
                    component="button"
                    type="submit"
                    color="poppy"
                    leftSection={<IconLogout size={16} aria-hidden />}
                  >
                    {t("common.logOut")}
                  </Menu.Item>
                </Form>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="sm" component="nav" aria-label={t("nav.mainNavigation")}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            component={Link}
            to={item.to}
            label={item.label}
            leftSection={<item.icon size={18} aria-hidden />}
            active={item.active}
            onClick={closeNav}
            style={{ borderRadius: "var(--mantine-radius-sm)" }}
          />
        ))}
        <Divider my="sm" label={t("nav.resources")} labelPosition="left" />
        <NavLink
          component={Link}
          to={`${base}/admin`}
          label={t("nav.resources")}
          leftSection={<IconFolders size={18} aria-hidden />}
          active={pathname.startsWith(`${base}/admin`)}
          onClick={closeNav}
          style={{ borderRadius: "var(--mantine-radius-sm)" }}
        />
      </AppShell.Navbar>

      <AppShell.Main>
        <Box maw={1200} mx="auto" w="100%">
          {crumbs.length > 1 && (
            <Box mb="md">
              <AppBreadcrumbs items={crumbs} />
            </Box>
          )}
          {children}
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}

/**
 * Breadcrumbs derive from the URL, never hand-written per page. Dynamic ids
 * are labeled by their action (edit/view) — raw ids never reach the UI.
 */
function buildCrumbs(pathname: string, base: string, t: TFunction): Crumb[] {
  if (!pathname.startsWith(base)) return [];

  const segments = pathname.slice(base.length).split("/").filter(Boolean);
  const crumbs: Crumb[] = [
    { label: t("nav.dashboard"), to: segments.length > 0 ? base : undefined },
  ];

  const sectionLabels: Record<string, string> = {
    admin: t("nav.resources"),
    schedules: t("nav.schedules"),
    timeslots: t("nav.timeslots"),
    syllabus: t("nav.syllabus"),
  };

  let accumulated = base;
  segments.forEach((segment, index) => {
    accumulated += `/${segment}`;

    if (sectionLabels[segment]) {
      const isLast = index === segments.length - 1;
      crumbs.push({ label: sectionLabels[segment], to: isLast ? undefined : accumulated });
      return;
    }
    if (segment === "new") {
      // ".../admin/:entity/new" — the entity segment right before "new".
      const entitySegment = segments[index - 1];
      if (segments[index - 2] === "admin" && entitySegment in entityMeta) {
        crumbs.push({
          label: t("resources.newEntity", { entity: t(entityMeta[entitySegment as EntityKind].labelKey) }),
        });
        return;
      }
      crumbs.push({ label: t("ui.new") });
      return;
    }
    if (segment === "edit") {
      // ".../admin/:entity/:id/edit" — entity is two segments back from "edit".
      const entitySegment = segments[index - 2];
      if (segments[index - 3] === "admin" && entitySegment in entityMeta) {
        crumbs.push({
          label: t("resources.editEntity", { entity: t(entityMeta[entitySegment as EntityKind].labelKey) }),
        });
        return;
      }
      crumbs.push({ label: t("schedule.edit") });
      return;
    }
    if (segment === "view") {
      // "view" alone is not a route; the id that follows completes it.
      crumbs.push({ label: t("schedule.view") });
      return;
    }
    // Bare admin entity-key segment (".../admin/teacher/new"): no crumb of its
    // own — the following "new"/"edit" segment carries the full label.
    if (segments[index - 1] === "admin" && segment in entityMeta) {
      return;
    }
    // Dynamic id segment: label by what the page does, never show the id.
    if (segments[index - 1] === "schedules") {
      crumbs.push({ label: t("schedule.edit") });
    }
  });

  return crumbs;
}
