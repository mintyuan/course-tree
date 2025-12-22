import { useEffect } from 'react';

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className="bg-[#5D4037] text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 border-3 border-[#78C850]">
        <span className="text-lg">🍯</span>
        <span className="font-medium" style={{ fontFamily: "'Varela Round', sans-serif" }}>{message}</span>
      </div>
    </div>
  );
}

