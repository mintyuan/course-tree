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
  isOwner?: boolean; // 是否拥有者，控制删除按钮显示
  isReadOnly?: boolean; // 是否只读模式（访客查看）
}

export function CourseModal({ course, onClose, onSave, onDelete, isNew = false, isOwner = false, isReadOnly = false }: CourseModalProps) {
  const [name, setName] = useState(course.name);
  const [rating, setRating] = useState(course.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [resources, setResources] = useState<Resource[]>(course.resources || []);
  const [oneLiner, setOneLiner] = useState(course.review || '');
  const [profReview, setProfReview] = useState(course.prof_review || '');
  
  // 在只读模式下，使用课程的原始数据
  const displayRating = isReadOnly ? (course.rating || 0) : rating;
  const displayName = isReadOnly ? course.name : name;
  const displayOneLiner = isReadOnly ? (course.review || '') : oneLiner;
  const displayProfReview = isReadOnly ? (course.prof_review || '') : profReview;
  
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
      ? 'bg-[#B0C4DE] text-[#5D4037]'
      : course.status === 'reviewed'
        ? 'bg-[#F3D03E] text-[#5D4037]'
        : 'bg-[#78C850] text-white';

  return (
    <div className="fixed inset-0 bg-[#5D4037]/50 flex items-center justify-center z-50 p-4">
      <div className="speech-bubble max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 diagonal-stripes px-6 sm:px-8 py-6 flex items-center justify-between border-b-3 border-[#E0E0E0] rounded-t-3xl bg-white">
          <div className="flex-1">
            {isReadOnly ? (
              <h2
                className="text-2xl sm:text-3xl font-bold text-[#5D4037] w-full"
                style={{ fontFamily: "'Varela Round', sans-serif" }}
              >
                {displayName}
              </h2>
            ) : (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-2xl sm:text-3xl font-bold text-[#5D4037] bg-transparent border-b-3 border-transparent hover:border-[#5D4037]/30 focus:border-[#5D4037] focus:outline-none w-full"
                placeholder="Course Name"
                style={{ fontFamily: "'Varela Round', sans-serif" }}
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isReadOnly && isOwner && (
              <button
                onClick={handleDelete}
                className="p-2 hover:bg-red-100 rounded-full transition-colors text-red-600"
                title="Delete Course"
              >
                <Trash2 size={20} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-full transition-colors"
            >
              <X size={24} className="text-[#5D4037]" />
            </button>
          </div>
        </div>

        <div className="px-4 sm:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 bg-white">
          <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${statusColor} border-3 border-[#E0E0E0]`}>
            {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
          </div>

          <div className="bg-[#F0F8F0] rounded-3xl p-4 sm:p-6 border-3 border-[#E0E0E0]">
            <h3 className="text-lg sm:text-xl font-bold text-[#5D4037] mb-4" style={{ fontFamily: "'Varela Round', sans-serif" }}>
              How was the prof?
            </h3>
            <div className="flex gap-2 sm:gap-3 text-4xl sm:text-5xl">
              {[1, 2, 3, 4, 5].map(star => (
                isReadOnly ? (
                  <span
                    key={star}
                    className={
                      star <= displayRating
                        ? 'text-[#F3D03E]'
                        : 'text-[#E5E5E5]'
                    }
                  >
                    ★
                  </span>
                ) : (
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
                          ? 'text-[#F3D03E]'
                          : 'text-[#E5E5E5]'
                      }
                    >
                      ★
                    </span>
                  </button>
                )
              ))}
            </div>
            {displayRating > 0 && (
              <p className="mt-3 text-sm text-[#5D4037] font-medium">
                {isReadOnly ? 'Rated' : 'You rated'}: {displayRating}/5 stars
              </p>
            )}
          </div>

          {/* Professor Review */}
          <div className="bg-[#F0F8F0] rounded-3xl p-4 sm:p-6 border-3 border-[#E0E0E0]">
            <h3 className="text-lg sm:text-xl font-bold text-[#5D4037] mb-4" style={{ fontFamily: "'Varela Round', sans-serif" }}>
              Comments on the Prof...
            </h3>
            {isReadOnly ? (
              <p className="text-sm text-[#5D4037] bg-white rounded-2xl px-4 py-3 border-3 border-[#E0E0E0] min-h-[80px]">
                {displayProfReview || '(No comments)'}
              </p>
            ) : (
              <>
                <p className="text-sm text-[#5D4037]/80 mb-3">(Optional)</p>
                <textarea
                  value={profReview}
                  onChange={e => setProfReview(e.target.value)}
                  placeholder="Share your thoughts about the professor..."
                  className="w-full px-4 py-3 border-3 border-[#E0E0E0] rounded-2xl focus:outline-none focus:border-[#78C850] transition-colors resize-none bg-white text-[#5D4037]"
                  rows={3}
                />
              </>
            )}
          </div>

          {/* Resources Section */}
          <div className="bg-[#F0F8F0] rounded-3xl p-4 sm:p-6 border-3 border-[#E0E0E0]">
            <h3 className="text-lg sm:text-xl font-bold text-[#5D4037] mb-4" style={{ fontFamily: "'Varela Round', sans-serif" }}>
              Resources
            </h3>
            
            {/* Resource List */}
            {resources.length > 0 && (
              <div className="space-y-2 mb-4">
                {resources.map(resource => (
                  <div
                    key={resource.id}
                    className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#E0E0E0] group hover:border-[#78C850] transition-colors"
                  >
                    <LinkIcon size={18} className="text-[#5D4037] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#5D4037] truncate">{resource.title}</p>
                      <p className="text-xs text-[#5D4037]/60 truncate">{resource.url}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-white border-3 border-[#78C850] text-[#78C850] hover:bg-[#78C850] hover:text-white button-3d rounded-full text-xs font-medium transition-colors"
                      >
                        Open
                      </a>
                      {!isReadOnly && (
                        <button
                          onClick={() => handleRemoveResource(resource.id)}
                          className="p-1.5 hover:bg-red-100 rounded-full transition-colors text-red-600 opacity-0 group-hover:opacity-100"
                          title="Remove"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Resource Input - Only show when not read-only */}
            {!isReadOnly && (
              <div className="space-y-2">
                <input
                  type="url"
                  value={newResourceUrl}
                  onChange={e => setNewResourceUrl(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleAddResource()}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-4 py-3 border-3 border-[#E0E0E0] rounded-full focus:outline-none focus:border-[#78C850] transition-colors bg-white text-[#5D4037]"
                />
                <input
                  type="text"
                  value={newResourceTitle}
                  onChange={e => setNewResourceTitle(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleAddResource()}
                  placeholder="Title/Note (e.g., Bilibili Playlist)"
                  className="w-full px-4 py-3 border-3 border-[#E0E0E0] rounded-full focus:outline-none focus:border-[#78C850] transition-colors bg-white text-[#5D4037]"
                />
                <button
                  onClick={handleAddResource}
                  className="w-full px-4 py-2 bg-white border-3 border-[#78C850] text-[#78C850] hover:bg-[#78C850] hover:text-white button-3d rounded-full text-[#5D4037] font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>
            )}
          </div>

          <div className="bg-[#F0F8F0] rounded-3xl p-4 sm:p-6 border-3 border-[#E0E0E0]">
            <h3 className="text-lg sm:text-xl font-bold text-[#5D4037] mb-4" style={{ fontFamily: "'Varela Round', sans-serif" }}>
              One-Liner
            </h3>
            {isReadOnly ? (
              <p className="text-sm text-[#5D4037] bg-white rounded-2xl px-4 py-3 border-3 border-[#E0E0E0] min-h-[80px]">
                {displayOneLiner || '(No review)'}
              </p>
            ) : (
              <>
                <p className="text-sm text-[#5D4037]/80 mb-3">
                  Quick tip or takeaway ({oneLiner.length}/140)
                </p>
                <textarea
                  value={oneLiner}
                  onChange={e =>
                    setOneLiner(e.target.value.slice(0, 140))
                  }
                  maxLength={140}
                  placeholder="Share your best tip or lesson learned..."
                  className="w-full px-4 py-3 border-3 border-[#E0E0E0] rounded-2xl focus:outline-none focus:border-[#78C850] transition-colors resize-none bg-white text-[#5D4037]"
                  rows={3}
                />
              </>
            )}
          </div>

          {/* Action Buttons */}
          {isReadOnly ? (
            <div className="flex justify-center pt-4">
              <button
                onClick={onClose}
                className="px-8 py-3 bg-white border-3 border-[#5D4037] text-[#5D4037] rounded-full font-semibold button-3d"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-white border-3 border-[#5D4037] text-[#5D4037] rounded-full font-semibold button-3d"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#F3D03E] to-[#78C850] text-white rounded-full font-semibold button-3d"
              >
                Save & Review
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
