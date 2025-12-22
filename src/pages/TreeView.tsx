import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TimelineHexagonGrid } from '../components/TimelineHexagonGrid';
import { Course, TreeData, Resource } from '../types';
import { supabase } from '../supabaseClient';
import { Share2, MessageCircle, Edit2, Loader2, CheckCircle2 } from 'lucide-react';
import { Toast } from '../components/Toast';
import { ContactModal } from '../components/ContactModal';

// 数据迁移函数：将旧格式转换为新格式
function migrateCourse(course: any): Course {
  // 如果已经有 resources 数组，直接返回
  if (course.resources && Array.isArray(course.resources)) {
    return {
      ...course,
      resources: course.resources,
      prof_review: course.prof_review || null,
    };
  }
  
  // 如果有旧的 url 字段，转换为 resources 数组
  if (course.url && typeof course.url === 'string') {
    try {
      const hostname = new URL(course.url).hostname.replace('www.', '');
      return {
        ...course,
        resources: [{
          id: `resource-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          url: course.url,
          title: hostname,
          type: 'other' as const,
        }],
        prof_review: course.prof_review || null,
      };
    } catch {
      // URL 解析失败，使用默认值
      return {
        ...course,
        resources: [{
          id: `resource-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          url: course.url,
          title: 'Resource',
          type: 'other' as const,
        }],
        prof_review: course.prof_review || null,
      };
    }
  }
  
  // 如果都没有，返回空数组
  return {
    ...course,
    resources: [],
    prof_review: course.prof_review || null,
  };
}

export function TreeView() {
  const [searchParams] = useSearchParams();
  const treeId = searchParams.get('id');
  const [treeData, setTreeData] = useState<TreeData>({
    courses: [],
    title: 'My Course Tree',
    likes: 0,
    contact_info: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const [showContactModal, setShowContactModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isLiking, setIsLiking] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const likeAnimationRef = useRef<HTMLDivElement>(null);

  // Check if user is the owner
  const isOwner = treeId ? localStorage.getItem(`tree_owner_${treeId}`) === 'true' : false;

  // 加载数据
  useEffect(() => {
    if (!treeId) {
      setIsLoading(false);
      return;
    }
    // 初始化点赞状态
    const liked = localStorage.getItem(`tree_liked_${treeId}`) === 'true';
    setHasLiked(liked);

    // Safe entry 一次性提示
    const justCreatedKey = `tree_just_created_${treeId}`;
    const safeShownKey = `tree_safe_shown_${treeId}`;
    const justCreated = localStorage.getItem(justCreatedKey) === 'true';
    const hasShownSafe = localStorage.getItem(safeShownKey) === 'true';
    if (justCreated && !hasShownSafe) {
      setToastMessage('Your tree is safe at this URL. Bookmark it to return later!');
      setShowToast(true);
      localStorage.setItem(safeShownKey, 'true');
      localStorage.removeItem(justCreatedKey);
    }

    const loadData = async () => {
      try {
        const { data, error } = await supabase
          .from('trees')
          .select('content')
          .eq('id', treeId)
          .single();

        if (error) {
          console.error('Error loading tree:', error);
          setIsLoading(false);
          return;
        }

        if (data && data.content) {
          try {
            const parsed = typeof data.content === 'string'
              ? JSON.parse(data.content)
              : data.content;

            // Handle both old format (array) and new format (object)
            if (Array.isArray(parsed)) {
              // Old format: just courses array - migrate each course
              const migratedCourses = parsed.map(migrateCourse);
              setTreeData({
                courses: migratedCourses,
                title: 'My Course Tree',
                likes: 0,
                contact_info: null,
              });
              setTitleValue('My Course Tree');
              addRecentTree(treeId, 'My Course Tree');
            } else if (parsed && typeof parsed === 'object') {
              // New format: TreeData object - migrate courses
              const courses = parsed.courses || [];
              const migratedCourses = courses.map(migrateCourse);
              setTreeData({
                courses: migratedCourses,
                title: parsed.title || 'My Course Tree',
                likes: parsed.likes || 0,
                contact_info: parsed.contact_info || null,
              });
              setTitleValue(parsed.title || 'My Course Tree');
              // 保存最近访问
              addRecentTree(treeId, parsed.title || 'My Course Tree');
            }
          } catch (parseError) {
            console.error('Error parsing content:', parseError);
          }
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [treeId]);

  // 保存树数据函数
  const saveTreeData = useCallback(async (updatedTreeData: TreeData) => {
    if (!treeId) return;

    setIsSaving(true);
    setHasUnsavedChanges(true);
    try {
      const { error } = await supabase
        .from('trees')
        .update({ content: updatedTreeData })
        .eq('id', treeId);

      if (error) {
        console.error('Error saving tree:', error);
      }
    } catch (err) {
      console.error('Unexpected error saving tree:', err);
    } finally {
      setIsSaving(false);
      setHasUnsavedChanges(false);
    }
  }, [treeId]);

  // 处理课程更新（带防抖）
  const handleCoursesChange = useCallback((updatedCourses: Course[]) => {
    const updatedTreeData = { ...treeData, courses: updatedCourses };
    setTreeData(updatedTreeData);
    setHasUnsavedChanges(true);
    
    // 清除之前的定时器
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // 设置新的定时器，500ms 后保存
    saveTimeoutRef.current = setTimeout(() => {
      saveTreeData(updatedTreeData);
    }, 500);
  }, [treeData, saveTreeData]);

  // 处理标题编辑开始
  const handleTitleEdit = () => {
    if (isOwner) {
      setTitleValue(treeData.title);
      setIsEditingTitle(true);
    }
  };

  // 处理标题保存
  const handleTitleSave = () => {
    const updatedTreeData = { ...treeData, title: titleValue || 'My Course Tree' };
    setTreeData(updatedTreeData);
    setIsEditingTitle(false);
    setHasUnsavedChanges(true);
    saveTreeData(updatedTreeData);
    if (treeId) {
      addRecentTree(treeId, updatedTreeData.title);
    }
  };

  // 处理点赞
  const handleLike = async () => {
    if (isLiking || hasLiked) return;
    
    setIsLiking(true);
    const updatedTreeData = { ...treeData, likes: treeData.likes + 1 };
    setTreeData(updatedTreeData);
    setHasLiked(true);
    if (treeId) {
      localStorage.setItem(`tree_liked_${treeId}`, 'true');
    }
    
    // Trigger animation
    if (likeAnimationRef.current) {
      likeAnimationRef.current.classList.add('animate-bounce');
      setTimeout(() => {
        likeAnimationRef.current?.classList.remove('animate-bounce');
      }, 600);
    }

    try {
      await saveTreeData(updatedTreeData);
    } catch (err) {
      console.error('Error saving like:', err);
    } finally {
      setIsLiking(false);
    }
  };

  // 处理联系信息保存
  const handleContactSave = (contactInfo: string) => {
    const updatedTreeData = { ...treeData, contact_info: contactInfo || null };
    setTreeData(updatedTreeData);
    setHasUnsavedChanges(true);
    saveTreeData(updatedTreeData);
    if (treeId) {
      addRecentTree(treeId, treeData.title);
    }
  };

  // 清理定时器
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // 分享功能
  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setToastMessage('Link copied! Send to friends.');
      setShowToast(true);
    } catch (err) {
      console.error('Failed to copy:', err);
      // 降级方案
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setToastMessage('Link copied! Send to friends.');
      setShowToast(true);
    }
  };

  // 保存最近访问的树
  const addRecentTree = (id: string, title: string) => {
    try {
      const existing = localStorage.getItem('recent_trees');
      const list: { id: string; title: string; timestamp: number }[] = existing ? JSON.parse(existing) : [];
      const filtered = list.filter(item => item.id !== id);
      const newList = [{ id, title, timestamp: Date.now() }, ...filtered].slice(0, 5);
      localStorage.setItem('recent_trees', JSON.stringify(newList));
    } catch (err) {
      console.error('Failed to store recent trees:', err);
    }
  };

  // 删除课程时立即保存
  const handleCoursesDelete = useCallback((updatedCourses: Course[]) => {
    const updatedTreeData = { ...treeData, courses: updatedCourses };
    setTreeData(updatedTreeData);
    setHasUnsavedChanges(true);
    saveTreeData(updatedTreeData);
  }, [treeData, saveTreeData]);

  // 更新浏览器标签标题
  useEffect(() => {
    const baseTitle = 'CourseTree';
    if (treeData.title) {
      document.title = `${treeData.title} · ${baseTitle}`;
    } else {
      document.title = baseTitle;
    }
    return () => {
      document.title = baseTitle;
    };
  }, [treeData.title]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFFCF0] py-12 px-4 flex items-center justify-center">
        <div className="text-[#4A3B2A] text-lg">加载中...</div>
      </div>
    );
  }

  if (!treeId) {
    return (
      <div className="min-h-screen bg-[#FFFCF0] py-12 px-4 flex items-center justify-center">
        <div className="text-[#4A3B2A] text-lg">无效的树 ID</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFCF0] py-12 px-4">
      <div className="max-w-full mx-auto max-w-7xl px-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            {/* Title and Like Button */}
            <div className="flex items-center gap-4 flex-1">
              {isEditingTitle ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={titleValue}
                    onChange={(e) => setTitleValue(e.target.value)}
                    onBlur={handleTitleSave}
                    onKeyUp={(e) => {
                      if (e.key === 'Enter') {
                        handleTitleSave();
                      }
                    }}
                    className="text-3xl sm:text-4xl font-bold text-[#4A3B2A] bg-transparent border-b-2 border-[#4A3B2A] focus:outline-none w-full"
                    style={{ fontFamily: "'Nunito', sans-serif" }}
                    autoFocus
                  />
                </div>
              ) : (
                <div
                  onClick={handleTitleEdit}
                  className={`group flex items-center gap-2 ${isOwner ? 'cursor-pointer' : ''}`}
                >
                  <h1
                    className="text-3xl sm:text-4xl font-bold text-[#4A3B2A]"
                    style={{ fontFamily: "'Nunito', sans-serif" }}
                  >
                    {treeData.title}
                  </h1>
                  {isOwner && (
                    <Edit2
                      size={18}
                      className="text-[#4A3B2A]/60 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  )}
                </div>
              )}
              
              {/* Give Honey Button */}
              <div ref={likeAnimationRef} className="inline-block">
                <button
                  onClick={handleLike}
                  disabled={isLiking || hasLiked}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-md transition-all font-medium ${
                    hasLiked
                      ? 'bg-[#FFD700] text-[#4A3B2A] cursor-default'
                      : 'bg-white text-[#4A3B2A] hover:shadow-lg hover:scale-105'
                  } disabled:opacity-60`}
                >
                  <span className="text-2xl">🍯</span>
                  <span className="font-semibold">{treeData.likes}</span>
                </button>
              </div>
            </div>

            {/* Right Side Buttons */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-xs sm:text-sm min-w-[150px] justify-end">
                {isSaving ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-[#4A3B2A]/80" />
                    <span className="text-[#4A3B2A]/80">Saving...</span>
                  </>
                ) : !hasUnsavedChanges ? (
                  <>
                    <CheckCircle2 size={14} className="text-[#4A3B2A]/80" />
                    <span className="text-[#4A3B2A]/70">All changes saved</span>
                  </>
                ) : null}
              </div>
              <button
                onClick={() => setShowContactModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all hover:scale-105 text-[#4A3B2A] font-medium"
              >
                <MessageCircle size={18} />
                <span className="hidden sm:inline">Ask me anything</span>
                <span className="sm:hidden">Contact</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all hover:scale-105 text-[#4A3B2A] font-medium"
              >
                <Share2 size={18} />
                <span className="hidden sm:inline">分享</span>
              </button>
            </div>
          </div>
        </div>

        <TimelineHexagonGrid
          courses={treeData.courses}
          onCoursesChange={handleCoursesChange}
          onCoursesChangeImmediate={handleCoursesDelete}
        />
      </div>

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={toastMessage}
          onClose={() => setShowToast(false)}
        />
      )}

      {/* Contact Modal */}
      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        contactInfo={treeData.contact_info}
        isOwner={isOwner}
        onSave={handleContactSave}
      />
    </div>
  );
}

