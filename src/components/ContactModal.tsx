import { useState } from 'react';
import { X, Copy } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactInfo: string | null;
  isOwner: boolean;
  onSave: (contactInfo: string) => void;
}

export function ContactModal({ isOpen, onClose, contactInfo, isOwner, onSave }: ContactModalProps) {
  const [inputValue, setInputValue] = useState(contactInfo || '');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    if (contactInfo) {
      try {
        await navigator.clipboard.writeText(contactInfo);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleSave = () => {
    onSave(inputValue);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#4A3B2A]/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#4A3B2A]" style={{ fontFamily: "'Nunito', sans-serif" }}>
            {isOwner ? 'Your Contact Info' : 'Contact Owner'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F9E4B7]/50 rounded-full transition-colors"
          >
            <X size={24} className="text-[#4A3B2A]" />
          </button>
        </div>

        {isOwner ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#4A3B2A] mb-2">
                WeChat ID / Email
              </label>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter your contact info..."
                className="w-full px-4 py-3 border-2 border-[#F9E4B7] rounded-full focus:outline-none focus:border-[#FFD700] transition-colors bg-white text-[#4A3B2A]"
              />
            </div>
            <button
              onClick={handleSave}
              className="w-full px-6 py-3 bg-gradient-to-r from-[#FFD700] to-[#F9E4B7] text-[#4A3B2A] rounded-full font-semibold hover:shadow-lg transition-all hover:scale-105"
            >
              Save
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {contactInfo ? (
              <>
                <div className="bg-[#F9E4B7]/30 rounded-2xl p-4 border-2 border-[#F9E4B7]">
                  <p className="text-sm text-[#4A3B2A]/70 mb-2">Contact Information:</p>
                  <p className="text-lg font-semibold text-[#4A3B2A] break-all">{contactInfo}</p>
                </div>
                <button
                  onClick={handleCopy}
                  className="w-full px-6 py-3 bg-gradient-to-r from-[#FFD700] to-[#F9E4B7] text-[#4A3B2A] rounded-full font-semibold hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Copy size={18} />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-[#4A3B2A]/70">No contact information available.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

