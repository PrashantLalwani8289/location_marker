import React, { useEffect } from 'react';

interface GreetingModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

export default function GreetingModal({ isOpen, message, onClose }: GreetingModalProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-gradient-to-br from-green-500/20 to-blue-500/20 backdrop-blur-lg flex items-center justify-center z-[3000]"
      onClick={onClose}
      style={{ animation: 'fadeInScale 0.35s ease-out forwards' }}
    >
      <div
        className="bg-white rounded-2xl p-8 w-[600px] max-w-[90%] text-center shadow-2xl transform transition duration-500 ease-out"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'slideUp 0.45s ease-out forwards' }}
      >
        <h2 className="text-2xl font-bold text-green-600 mb-4">{message}</h2>
        <p className="text-4xl animate-bounce">🎉</p>
      </div>
    </div>
  );
}
