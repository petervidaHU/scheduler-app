// ModalProvider.jsx
"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { createPortal } from "react-dom";

// Create a context to manage modal state
const ModalContext = createContext({openModal: (content: React.ReactNode) => {}, closeModal: () => {}});

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);

  const openModal = useCallback((content: React.ReactNode) => {
    setModalContent(content);
  }, []);

  const closeModal = useCallback(() => {
    setModalContent(null);
  }, []);

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      {modalContent && <Modal onClose={closeModal}>{modalContent}</Modal>}
    </ModalContext.Provider>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode, onClose: () => void }) {
  // Ensure the modal renders only on the client side (optional if wrapping in useEffect)
  return createPortal(
    <div className="modal-overlay" style={overlayStyles}>
      <div className="modal-content" style={modalStyles}>
        {children}
        <button onClick={onClose} style={buttonStyles}>Close</button>
      </div>
    </div>,
    document.body
  );
}

// Hook to use modal context in any component
export function useModal() {
  return useContext(ModalContext);
}

// Some basic inline styles for demonstration
const overlayStyles:  React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const modalStyles = {
  background: "#fff",
  padding: "2rem",
  borderRadius: "8px",
  maxWidth: "500px",
  width: "100%"
};

const buttonStyles = {
  marginTop: "1rem",
  padding: "0.5rem 1rem"
};
