import { Course, Resource } from '../types';
import { X, Trash2, Link as LinkIcon, Plus } from 'lucide-react';
import { useState } from 'react';

interface CourseModalProps {
  course: Course;
  onClose: () => void;
  onSave: (
    courseId: string,
    name: string,
    rating: number,
    review: string,
    resources: Resource[],
    profReview: string | null
  ) => void;
  onDelete: (courseId: string) => void;
  isNew?: boolean;
}

export function CourseModal({ course, onClose, onSave, onDelete, isNew = false }: CourseModalProps) {
  const [name, setName] = useState(course.name);
  const [rating, setRating] = useState(course.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [resources, setResources] = useState<Resource[]>(course.resources || []);
  const [oneLiner, setOneLiner] = useState(course.review || '');
  const [profReview, setProfReview] = useState(course.prof_review || '');
  
  // 添加资源的输入状态
  const [newResourceUrl, setNewResourceUrl] = useState('');
  const [newResourceTitle, setNewResourceTitle] = useState('');

  const handleSave = () => {
    onSave(course.id, name, rating, oneLiner, resources, profReview.trim() || null);
  };

  const handleAddResource = () => {
    if (newResourceUrl.trim()) {
      const newResource: Resource = {
        id: `resource-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        url: newResourceUrl.trim(),
        title: newResourceTitle.trim() || new URL(newResourceUrl).hostname.replace('www.', ''),
        type: 'other',
      };
      setResources([...resources, newResource]);
      setNewResourceUrl('');
      setNewResourceTitle('');
    }
  };

  const handleRemoveResource = (resourceId: string) => {
    setResources(resources.filter(r => r.id !== resourceId));
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

          {/* Professor Review */}
          <div className="bg-[#F9E4B7]/30 rounded-3xl p-4 sm:p-6 border-2 border-[#F9E4B7]">
            <h3 className="text-lg sm:text-xl font-bold text-[#4A3B2A] mb-4" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Comments on the Prof...
            </h3>
            <p className="text-sm text-[#4A3B2A]/80 mb-3">(Optional)</p>
            <textarea
              value={profReview}
              onChange={e => setProfReview(e.target.value)}
              placeholder="Share your thoughts about the professor..."
              className="w-full px-4 py-3 border-2 border-[#F9E4B7] rounded-2xl focus:outline-none focus:border-[#FFD700] transition-colors resize-none bg-white text-[#4A3B2A]"
              rows={3}
            />
          </div>

          {/* Resources Section */}
          <div className="bg-[#F9E4B7]/30 rounded-3xl p-4 sm:p-6 border-2 border-[#F9E4B7]">
            <h3 className="text-lg sm:text-xl font-bold text-[#4A3B2A] mb-4" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Resources
            </h3>
            
            {/* Resource List */}
            {resources.length > 0 && (
              <div className="space-y-2 mb-4">
                {resources.map(resource => (
                  <div
                    key={resource.id}
                    className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#F9E4B7] group hover:border-[#FFD700] transition-colors"
                  >
                    <LinkIcon size={18} className="text-[#4A3B2A] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#4A3B2A] truncate">{resource.title}</p>
                      <p className="text-xs text-[#4A3B2A]/60 truncate">{resource.url}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-[#F9E4B7] hover:bg-[#FFD700] rounded-full text-xs font-medium text-[#4A3B2A] transition-colors"
                      >
                        Open
                      </a>
                      <button
                        onClick={() => handleRemoveResource(resource.id)}
                        className="p-1.5 hover:bg-red-100 rounded-full transition-colors text-red-600 opacity-0 group-hover:opacity-100"
                        title="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Resource Input */}
            <div className="space-y-2">
              <input
                type="url"
                value={newResourceUrl}
                onChange={e => setNewResourceUrl(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleAddResource()}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-4 py-3 border-2 border-[#F9E4B7] rounded-full focus:outline-none focus:border-[#FFD700] transition-colors bg-white text-[#4A3B2A]"
              />
              <input
                type="text"
                value={newResourceTitle}
                onChange={e => setNewResourceTitle(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleAddResource()}
                placeholder="Title/Note (e.g., Bilibili Playlist)"
                className="w-full px-4 py-3 border-2 border-[#F9E4B7] rounded-full focus:outline-none focus:border-[#FFD700] transition-colors bg-white text-[#4A3B2A]"
              />
              <button
                onClick={handleAddResource}
                className="w-full px-4 py-2 bg-[#F9E4B7] hover:bg-[#FFD700] rounded-full text-[#4A3B2A] font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Add
              </button>
            </div>
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
