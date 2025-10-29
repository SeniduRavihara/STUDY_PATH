import React from "react";
import { X } from "lucide-react";
import type { ModalType } from "../../types/modal";

interface CustomModalProps {
  open: boolean;
  message: string;
  type: ModalType;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  inputValue?: string;
  onInputChange?: (value: string) => void;
}

const CustomModal: React.FC<CustomModalProps> = ({
  open,
  message,
  type,
  onClose,
  onConfirm,
  confirmText = "OK",
  cancelText = "Cancel",
  inputValue = "",
  onInputChange,
}) => {
  if (!open) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "Enter" && type === "alert") {
      onClose();
    } else if (e.key === "Enter" && type === "confirm" && onConfirm) {
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative bg-dark-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl border border-dark-700"
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-dark-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Message */}
        <div className="pr-8">
          <p className="text-white text-lg leading-relaxed mb-6">{message}</p>

          {/* Input for prompt */}
          {type === "prompt" && (
            <input
              type="text"
              value={inputValue}
              onChange={(e) => onInputChange?.(e.target.value)}
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 mb-6"
              placeholder="Enter your response..."
              autoFocus
            />
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end space-x-3">
          {type !== "alert" && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-dark-700 text-white rounded-lg hover:bg-dark-600 transition-colors"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm || onClose}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            autoFocus={type === "alert"}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomModal;
