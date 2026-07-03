import { Button, Group, Modal, Stack, Text } from "@mantine/core";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

type ConfirmModalProps = {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  /** Names the object and states consequences/dependencies (UX-UI-principles §7). */
  children: ReactNode;
  confirmLabel?: string;
  /** Destructive actions get the poppy (danger) treatment. */
  danger?: boolean;
  loading?: boolean;
};

/**
 * Confirmation dialog for destructive or consequential actions. No instant
 * deletes anywhere in the app.
 */
export function ConfirmModal({
  opened,
  onClose,
  onConfirm,
  title,
  children,
  confirmLabel,
  danger = false,
  loading = false,
}: ConfirmModalProps) {
  const { t } = useTranslation();

  return (
    <Modal opened={opened} onClose={onClose} title={title} centered radius="lg">
      <Stack gap="lg">
        {typeof children === "string" ? <Text size="sm">{children}</Text> : children}
        <Group justify="flex-end" gap="xs">
          <Button variant="subtle" color="gray" onClick={onClose} disabled={loading}>
            {t("ui.cancel")}
          </Button>
          <Button
            color={danger ? "poppy" : undefined}
            onClick={onConfirm}
            loading={loading}
            data-autofocus
          >
            {confirmLabel ?? (danger ? t("ui.delete") : t("ui.confirm"))}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
