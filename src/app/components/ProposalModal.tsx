import React from 'react';

interface ProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChoice: (choice: string) => void;
}

// Inject modal animations once
if (typeof document !== 'undefined' && !document.getElementById('modal-animations')) {
  const style = document.createElement('style');
  style.id = 'modal-animations';
  style.textContent = `
    @keyframes fadeInScale { 0% { opacity: 0; transform: scale(0.8); } 100% { opacity: 1; transform: scale(1); } }
    @keyframes slideUp { 0% { transform: translateY(20px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
  `;
  document.head.appendChild(style);
}

export default function ProposalModal({ isOpen, onClose, onChoice }: ProposalModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-pink-500/30 to-purple-500/30 backdrop-blur-sm flex items-center justify-center z-[3000]" onClick={onClose} style={{ animation: 'fadeInScale 0.4s ease-out forwards' }}>
      <div className="bg-white rounded-2xl p-8 w-[600px] max-w-[90%] text-center shadow-2xl transform transition duration-500 ease-out" onClick={(e) => e.stopPropagation()} style={{ animation: 'slideUp 0.5s ease-out forwards' }}>
        <h2 className="text-3xl font-extrabold mb-6 text-pink-600">Miss Nikita Bacchani, Would you like to marry Mr. Prashant Lalwani? (in future)</h2>
        <div className="flex justify-center gap-8">
          <button
            onClick={() => onChoice('Yes')}
            className="px-6 py-3 text-lg font-semibold bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-full transform hover:scale-105 transition duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            Yes
          </button>
          <button
            onClick={() => onChoice('Absolutely Yes')}
            className="px-6 py-3 text-lg font-semibold bg-gradient-to-r from-pink-400 to-pink-600 text-white rounded-full transform hover:scale-105 transition duration-300 focus:outline-none focus:ring-4 focus:ring-pink-300"
          >
            Absolutely Yes
          </button>
        </div>
      </div>
    </div>
  );
}
