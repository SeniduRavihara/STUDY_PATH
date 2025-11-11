import type { ReactNode } from "react";
import React, { createContext, useContext, useState } from "react";
import CustomModal from "../components/modal/CustomModal";
import type { ModalType } from "../types/modal";

interface ModalState {
  open: boolean;
  message: string;
  type: ModalType;
  confirmText?: string;
  cancelText?: string;
  inputValue?: string;
  resolve?: (value: boolean | string | null) => void;
}

interface ModalContextType {
  alert: (message: string) => Promise<void>;
  confirm: (
    message: string,
    confirmText?: string,
    cancelText?: string
  ) => Promise<boolean>;
  prompt: (message: string, defaultValue?: string) => Promise<string | null>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [modal, setModal] = useState<ModalState>({
    open: false,
    message: "",
    type: "alert",
  });

  const showModal = (
    message: string,
    type: ModalType,
    confirmText?: string,
    cancelText?: string,
    defaultValue?: string
  ): Promise<boolean | string | null> => {
    return new Promise((resolve) => {
      setModal({
        open: true,
        message,
        type,
        confirmText,
        cancelText,
        inputValue: defaultValue || "",
        resolve,
      });
    });
  };

  const closeModal = (result: boolean | string | null = null) => {
    setModal((prev) => ({
      ...prev,
      open: false,
    }));
    if (modal.resolve) {
      modal.resolve(result);
    }
  };

  const handleConfirm = () => {
    if (modal.type === "prompt") {
      closeModal(modal.inputValue || "");
    } else {
      closeModal(true);
    }
  };

  const handleClose = () => {
    if (modal.type === "alert") {
      closeModal(null);
    } else {
      closeModal(false);
    }
  };

  const handleInputChange = (value: string) => {
    setModal((prev) => ({
      ...prev,
      inputValue: value,
    }));
  };

  const contextValue: ModalContextType = {
    alert: async (message: string) => {
      await showModal(message, "alert");
      return;
    },
    confirm: async (
      message: string,
      confirmText = "OK",
      cancelText = "Cancel"
    ) => {
      const res = await showModal(message, "confirm", confirmText, cancelText);
      return res === true;
    },
    prompt: async (message: string, defaultValue = "") => {
      const res = await showModal(
        message,
        "prompt",
        undefined,
        undefined,
        defaultValue
      );
      return typeof res === "string" ? res : null;
    },
  };

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
      <CustomModal
        open={modal.open}
        message={modal.message}
        type={modal.type}
        onClose={handleClose}
        onConfirm={modal.type !== "alert" ? handleConfirm : undefined}
        confirmText={
          modal.confirmText || (modal.type === "alert" ? "OK" : "Confirm")
        }
        cancelText={modal.cancelText}
        inputValue={modal.inputValue}
        onInputChange={handleInputChange}
      />
    </ModalContext.Provider>
  );
};
