import { Course } from '../types';
import { X, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface CourseModalProps {
  course: Course;
  onClose: () => void;
  onSave: (
    courseId: string,
    name: string,
    rating: number,
    review: string,
    url: string | null
  ) => void;
  onDelete: (courseId: string) => void;
}

export function CourseModal({ course, onClose, onSave, onDelete }: CourseModalProps) {
  const [name, setName] = useState(course.name);
  const [rating, setRating] = useState(course.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [url, setUrl] = useState(course.url || '');
  const [oneLiner, setOneLiner] = useState(course.review || '');

  const handleSave = () => {
    onSave(course.id, name, rating, oneLiner, url.trim() || null);
  };

  const handleDelete = () => {
    if (window.confirm('确定要删除这门课程吗？')) {
      onDelete(course.id);
    }
  };

  const statusColor =
    course.status === 'locked'
      ? 'bg-[#E5E5E5] text-[#4A3B2A]'
      : course.status === 'reviewed'
        ? 'bg-[#FFD700] text-[#4A3B2A]'
        : 'bg-[#F9E4B7] text-[#4A3B2A]';

  return (
    <div className="fixed inset-0 bg-[#4A3B2A]/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ borderRadius: '2rem' }}>
        <div className="sticky top-0 bg-gradient-to-r from-[#F9E4B7] to-[#FFD700] px-6 sm:px-8 py-6 flex items-center justify-between border-b-2 border-[#FFD700]/30 rounded-t-3xl">
          <div className="flex-1">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-2xl sm:text-3xl font-bold text-[#4A3B2A] bg-transparent border-b-2 border-transparent hover:border-[#4A3B2A]/30 focus:border-[#4A3B2A] focus:outline-none w-full"
              placeholder="Course Name"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="p-2 hover:bg-red-100 rounded-full transition-colors text-red-600"
              title="Delete Course"
            >
              <Trash2 size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-full transition-colors"
            >
              <X size={24} className="text-[#4A3B2A]" />
            </button>
          </div>
        </div>

        <div className="px-4 sm:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
          <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${statusColor}`}>
            {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
          </div>

          <div className="bg-[#F9E4B7]/30 rounded-3xl p-4 sm:p-6 border-2 border-[#F9E4B7]">
            <h3 className="text-lg sm:text-xl font-bold text-[#4A3B2A] mb-4" style={{ fontFamily: "'Nunito', sans-serif" }}>
              How was the prof?
            </h3>
            <div className="flex gap-2 sm:gap-3 text-4xl sm:text-5xl">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform duration-200 hover:scale-110 cursor-pointer"
                >
                  <span
                    className={
                      star <= (hoverRating || rating)
                        ? 'text-[#FFD700]'
                        : 'text-[#E5E5E5]'
                    }
                  >
                    ★
                  </span>
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="mt-3 text-sm text-[#4A3B2A] font-medium">
                You rated: {rating}/5 stars
              </p>
            )}
          </div>

          <div className="bg-[#F9E4B7]/30 rounded-3xl p-4 sm:p-6 border-2 border-[#F9E4B7]">
            <h3 className="text-lg sm:text-xl font-bold text-[#4A3B2A] mb-4" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Resource URL
            </h3>
            <p className="text-sm text-[#4A3B2A]/80 mb-4">
              Add a helpful resource link (YouTube, article, etc.)
            </p>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full px-4 py-3 border-2 border-[#F9E4B7] rounded-full focus:outline-none focus:border-[#FFD700] transition-colors bg-white text-[#4A3B2A]"
            />
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-[#4A3B2A] hover:text-[#FFD700] hover:underline text-sm font-medium"
              >
                打开链接 →
              </a>
            )}
          </div>

          <div className="bg-[#F9E4B7]/30 rounded-3xl p-4 sm:p-6 border-2 border-[#F9E4B7]">
            <h3 className="text-lg sm:text-xl font-bold text-[#4A3B2A] mb-4" style={{ fontFamily: "'Nunito', sans-serif" }}>
              One-Liner
            </h3>
            <p className="text-sm text-[#4A3B2A]/80 mb-3">
              Quick tip or takeaway ({oneLiner.length}/140)
            </p>
            <textarea
              value={oneLiner}
              onChange={e =>
                setOneLiner(e.target.value.slice(0, 140))
              }
              maxLength={140}
              placeholder="Share your best tip or lesson learned..."
              className="w-full px-4 py-3 border-2 border-[#F9E4B7] rounded-2xl focus:outline-none focus:border-[#FFD700] transition-colors resize-none bg-white text-[#4A3B2A]"
              rows={3}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-[#F9E4B7] text-[#4A3B2A] rounded-full font-semibold hover:bg-[#F9E4B7] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#FFD700] to-[#F9E4B7] text-[#4A3B2A] rounded-full font-semibold hover:shadow-lg transition-all hover:scale-105"
            >
              Save & Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
