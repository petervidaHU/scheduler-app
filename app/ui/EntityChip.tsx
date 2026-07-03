import { Badge, type BadgeProps } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { entityMeta, type EntityKind } from "./entityMeta";

type EntityChipProps = {
  kind: EntityKind;
  /** Instance name (e.g. a teacher's name). Falls back to the entity type label. */
  label?: string;
  size?: BadgeProps["size"];
};

/**
 * Entity identity chip: color + icon + label, always together, so color never
 * carries meaning alone (UX-UI-principles §5.3).
 */
export function EntityChip({ kind, label, size = "sm" }: EntityChipProps) {
  const { t } = useTranslation();
  const meta = entityMeta[kind];
  const IconComponent = meta.icon;
  const typeLabel = t(meta.labelKey);

  return (
    <Badge
      variant="light"
      color={meta.colorKey}
      size={size}
      tt="none"
      fw={600}
      leftSection={<IconComponent size={12} aria-hidden />}
      aria-label={label ? `${typeLabel}: ${label}` : typeLabel}
    >
      {label ?? typeLabel}
    </Badge>
  );
}
