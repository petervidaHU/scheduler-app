import { Anchor, Breadcrumbs, Text } from "@mantine/core";
import { Link } from "react-router";

export type Crumb = {
  label: string;
  /** Omit on the last (current) crumb — it renders as plain text. */
  to?: string;
};

/**
 * Breadcrumb trail under the top bar (UX-UI-principles §3.2). Items with `to`
 * are links; the current page is plain text.
 */
export function AppBreadcrumbs({ items }: { items: Crumb[] }) {
  if (items.length === 0) return null;

  return (
    <Breadcrumbs separatorMargin="xs">
      {items.map((item, index) =>
        item.to ? (
          <Anchor key={index} component={Link} to={item.to} size="sm" fw={500}>
            {item.label}
          </Anchor>
        ) : (
          <Text key={index} size="sm" c="dimmed">
            {item.label}
          </Text>
        ),
      )}
    </Breadcrumbs>
  );
}
