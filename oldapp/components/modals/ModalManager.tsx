"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Modal, Button, Group } from "@mantine/core";

// Type definitions for our modal system
export type ModalOptions = {
  title?: string;
  size?: string | number;
  fullScreen?: boolean;
  centered?: boolean;
  withCloseButton?: boolean;
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
  overlayProps?: Record<string, any>;
  onClose?: () => void;
};

type ConfirmModalOptions = {
  title?: string;
  children?: ReactNode;
  labels?: { confirm: string; cancel: string };
  confirmProps?: Record<string, any>;
  cancelProps?: Record<string, any>;
  onConfirm: () => void;
  onCancel?: () => void;
};

type ModalContextType = {
  openModal: (content: ReactNode, options?: ModalOptions) => void;
  closeModal: () => void;
  openConfirmModal: (options: ConfirmModalOptions) => void;
};

const ModalContext = createContext<ModalContextType>({
  openModal: () => {},
  closeModal: () => {},
  openConfirmModal: () => {},
});

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modalContent, setModalContent] = useState<ReactNode | null>(null);
  const [modalOptions, setModalOptions] = useState<ModalOptions>({});

  const openModal = useCallback((content: ReactNode, options: ModalOptions = {}) => {
    setModalContent(content);
    setModalOptions(options);
  }, []);

  const closeModal = useCallback(() => {
    setModalContent(null);
    if (modalOptions.onClose) {
      modalOptions.onClose();
    }
  }, [modalOptions]);

  const openConfirmModal = useCallback(
    ({
      title = "Confirmation",
      children,
      labels = { confirm: "Confirm", cancel: "Cancel" },
      confirmProps = { color: "red" },
      cancelProps = { variant: "outline" },
      onConfirm,
      onCancel,
    }: ConfirmModalOptions) => {
      const confirmationContent = (
        <div>
          {children}
          <Group justify="center" gap="md" mt="xl">
            <Button
              variant="outline"
              onClick={() => {
                if (onCancel) onCancel();
                closeModal();
              }}
              {...cancelProps}
            >
              {labels.cancel}
            </Button>
            <Button
              onClick={() => {
                onConfirm();
                closeModal();
              }}
              {...confirmProps}
            >
              {labels.confirm}
            </Button>
          </Group>
        </div>
      );

      openModal(confirmationContent, { title, centered: true });
    },
    [openModal, closeModal]
  );

  return (
    <ModalContext.Provider value={{ openModal, closeModal, openConfirmModal }}>
      {children}
      <Modal
        opened={modalContent !== null}
        onClose={closeModal}
        title={modalOptions.title || ""}
        size={modalOptions.size || "md"}
        fullScreen={modalOptions.fullScreen || false}
        centered={modalOptions.centered !== false}
        withCloseButton={modalOptions.withCloseButton !== false}
        closeOnClickOutside={modalOptions.closeOnClickOutside !== false}
        closeOnEscape={modalOptions.closeOnEscape !== false}
        overlayProps={modalOptions.overlayProps}
      >
        {modalContent}
      </Modal>
    </ModalContext.Provider>
  );
}

// Hook to use the modal context
export function useModal() {
  return useContext(ModalContext);
} 