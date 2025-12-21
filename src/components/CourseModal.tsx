import { Course, Resource } from '../types';
import { X, Film } from 'lucide-react';
import { useState } from 'react';

interface CourseModalProps {
  course: Course;
  onClose: () => void;
  onSave: (
    courseId: string,
    rating: number,
    review: string,
    resources: Resource[]
  ) => void;
}

export function CourseModal({ course, onClose, onSave }: CourseModalProps) {
  const [rating, setRating] = useState(course.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [url, setUrl] = useState('');
  const [resources, setResources] = useState<Resource[]>(course.resources);
  const [oneLiner, setOneLiner] = useState(course.review || '');

  const handleAddResource = () => {
    if (url.trim()) {
      const newResource: Resource = {
        title: new URL(url).hostname.replace('www.', ''),
        url,
        type: 'video',
      };
      setResources([...resources, newResource]);
      setUrl('');
    }
  };

  const handleRemoveResource = (index: number) => {
    setResources(resources.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(course.id, rating, oneLiner, resources);
  };

  const statusColor =
    course.status === 'locked'
      ? 'bg-gray-100 text-gray-700'
      : course.status === 'reviewed'
        ? 'bg-amber-100 text-amber-700'
        : 'bg-yellow-50 text-yellow-700';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-amber-50 to-yellow-50 px-8 py-6 flex items-center justify-between border-b border-amber-100">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">{course.name}</h2>
            <p className="text-sm text-slate-600 mt-2">{course.category}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-full transition-colors"
          >
            <X size={24} className="text-slate-600" />
          </button>
        </div>

        <div className="px-8 py-8 space-y-8">
          <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${statusColor}`}>
            {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
          </div>

          <div className="bg-amber-50 rounded-2xl p-6 border-2 border-amber-100">
            <h3 className="text-xl font-bold text-slate-800 mb-4">
              How was the prof?
            </h3>
            <div className="flex gap-3 text-5xl">
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
                        ? 'text-amber-400'
                        : 'text-gray-300'
                    }
                  >
                    ★
                  </span>
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="mt-3 text-sm text-amber-700 font-medium">
                You rated: {rating}/5 stars
              </p>
            )}
          </div>

          <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-100">
            <h3 className="text-xl font-bold text-slate-800 mb-4">
              The Savior
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Drop a link to a helpful resource (YouTube, article, etc.)
            </p>
            <div className="flex gap-2 mb-4">
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleAddResource()}
                placeholder="https://youtube.com/watch?v=..."
                className="flex-1 px-4 py-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-400 transition-colors"
              />
              <button
                onClick={handleAddResource}
                className="px-6 py-3 bg-blue-400 text-white rounded-xl font-medium hover:bg-blue-500 transition-colors"
              >
                Add
              </button>
            </div>

            {resources.length > 0 && (
              <div className="space-y-2">
                {resources.map((resource, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-white rounded-xl border border-blue-200 group hover:border-blue-400 transition-colors"
                  >
                    <Film size={20} className="text-blue-500 flex-shrink-0" />
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-blue-600 hover:underline text-sm truncate"
                    >
                      {resource.title}
                    </a>
                    <button
                      onClick={() => handleRemoveResource(index)}
                      className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-green-50 rounded-2xl p-6 border-2 border-green-100">
            <h3 className="text-xl font-bold text-slate-800 mb-4">
              One-Liner
            </h3>
            <p className="text-sm text-slate-600 mb-3">
              Quick tip or takeaway ({oneLiner.length}/140)
            </p>
            <textarea
              value={oneLiner}
              onChange={e =>
                setOneLiner(e.target.value.slice(0, 140))
              }
              maxLength={140}
              placeholder="Share your best tip or lesson learned..."
              className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:outline-none focus:border-green-400 transition-colors resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105"
            >
              Save & Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
