"use client";

import { useStore } from "@/store/store";
import { Toast } from "@/types/toastTypes";
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

const modalStyles = {
  background: "#fff",
  padding: "2rem",
  borderRadius: "8px",
  maxWidth: "500px",
  width: "100%",
  color: "black",
};

const buttonStyles = {
  marginTop: "1rem",
  padding: "0.5rem 1rem",
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
  return (
    <Notification
      icon={toastTypeDetails.icon || null}
      color={toastTypeDetails.color || "blue"}
      title={toast.title}
      onClose={() => removeToast(toast.id)}
    >
      {toast.message}
    </Notification>
  );
};

function ToastContainer() {
  const { toast, removeToast } = useStore();
  console.log("rtoast in container: ", toast);

  return createPortal(
    <div>
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
