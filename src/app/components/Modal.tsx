import { useState } from 'react';

const PRESET_MARKERS = [
  { emoji: '💋', name: 'Kiss' },
  { emoji: '🤗', name: 'Hug' },
  { emoji: '🍽️', name: 'Food' },
  { emoji: '💑', name: 'Date' },
  { emoji: '❤️', name: 'Love' },
  { emoji: '🎁', name: 'Gift' },
  { emoji: '🌹', name: 'Romance' },
  { emoji: '🎭', name: 'Fun' },
];
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  title: string;
}

export default function Modal({ isOpen, onClose, onSubmit, title }: ModalProps) {
  const [customName, setCustomName] = useState('');

  const handlePresetClick = (preset: { emoji: string; name: string }) => {
    onSubmit(`${preset.emoji} ${preset.name}`);
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (customName.trim()) {
      onSubmit(`💝 ${customName.trim()}`);
      setCustomName('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-transparent flex items-center justify-center z-[2000]">
      <div className="bg-white rounded-lg p-6 w-[480px] max-w-[95%]">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        
        <div className="grid grid-cols-2 gap-2 mb-6">
          {PRESET_MARKERS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handlePresetClick(preset)}
              className="flex items-center gap-2 p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-2xl">{preset.emoji}</span>
              <span className="font-medium">{preset.name}</span>
            </button>
          ))}
        </div>

        <div className="border-t pt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Or add custom marker</h3>
          <form onSubmit={handleCustomSubmit} className="space-y-4">
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter custom marker name"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!customName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Custom Marker
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
