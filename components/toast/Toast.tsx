"use client";

import { useStore } from "@/store/store";
import { Toast } from "@/types/UIFeedbackTypes";
import { Notification } from "@mantine/core";
import { IconX, IconCheck } from "@tabler/icons-react";
import React from "react";
import { createPortal } from "react-dom";

const overlayStyles = {
  position: "fixed" as any,
  left: 20,
  bottom: 20,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  zIndex: 500,
  justifyContent: "center",
};

const toastIcons = {
  success: { icon: <IconCheck size={20} />, color: "teal" },
  error: { icon: <IconX size={20} />, color: "red" },
  warning: { icon: <IconX size={20} />, color: "orange" },
  info: { icon: <IconX size={20} />, color: "blue" },
};

interface ToastProps {
  toast: Toast;
  removeToast: (id: string) => void;
}

const ToastComponent: React.FC<ToastProps> = ({ toast, removeToast }) => {
  const toastTypeDetails = toastIcons[toast.type as keyof typeof toastIcons];
  // Default: autoClose true, closable true
  const autoClose = toast.autoClose !== false;
  const closable = toast.closable !== false;
  React.useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => removeToast(toast.id), 3000);
      return () => clearTimeout(timer);
    }
  }, [autoClose, removeToast, toast.id]);
  return (
    <Notification
      icon={toastTypeDetails.icon || null}
      color={toastTypeDetails.color || "blue"}
      title={toast.title}
      onClose={closable ? () => removeToast(toast.id) : undefined}
      withCloseButton={closable}
    >
      {toast.message}
    </Notification>
  );
};

function ToastContainer() {
  const { toast, removeToast } = useStore();

  return createPortal(
    <div style={overlayStyles}>
      {toast.map((toast) => (
        <ToastComponent
          key={toast.id}
          toast={toast}
          removeToast={removeToast}
        />
      ))}
    </div>,
    document.body
  );
}

export default ToastContainer;
