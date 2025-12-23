import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TimelineHexagonGrid } from '../components/TimelineHexagonGrid';
import { Course, TreeData, Resource } from '../types';
import { supabase } from '../supabaseClient';
import { Share2, MessageCircle, Edit2, Loader2, CheckCircle2, Camera } from 'lucide-react';
import { Toast } from '../components/Toast';
import { ContactModal } from '../components/ContactModal';
import html2canvas from 'html2canvas';
import { saveToHistory } from '../utils/recentTrees';
import { isTreeOwner, addToOwnedTrees, isTreeCollected, toggleCollectTree } from '../utils/ownership';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const treeId = searchParams.get('id');
  const [treeData, setTreeData] = useState<TreeData>({
    courses: [],
    title: 'My Course Tree',
    likes: 0,
    contact_info: null,
    author_name: 'Anonymous',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const [showContactModal, setShowContactModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isCollected, setIsCollected] = useState(false);
  const [isForking, setIsForking] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const exportContainerRef = useRef<HTMLDivElement>(null);

  // Check if user is the owner using new ownership system
  const isOwner = isTreeOwner(treeId);

  // 加载数据
  useEffect(() => {
    if (!treeId) {
      setIsLoading(false);
      return;
    }
    // 初始化收藏状态
    setIsCollected(isTreeCollected(treeId));

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
                author_name: 'Anonymous',
              });
              setTitleValue('My Course Tree');
              // 保存到历史记录（树加载时）
              saveToHistory({ id: treeId, title: 'My Course Tree' });
            } else if (parsed && typeof parsed === 'object') {
              // New format: TreeData object - migrate courses
              const courses = parsed.courses || [];
              const migratedCourses = courses.map(migrateCourse);
              setTreeData({
                courses: migratedCourses,
                title: parsed.title || 'My Course Tree',
                likes: parsed.likes || 0,
                contact_info: parsed.contact_info || null,
                author_name: parsed.author_name || 'Anonymous',
              });
              setTitleValue(parsed.title || 'My Course Tree');
              // 保存到历史记录（树加载时，使用最新标题）
              saveToHistory({ id: treeId, title: parsed.title || 'My Course Tree' });
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
      // 立即同步标题到历史记录（使用最新标题）
      // 注意：这里不更新 UI 状态，因为这是 TreeView 页面，不是 LandingPage
      saveToHistory({ id: treeId, title: updatedTreeData.title });
    }
  };


  // 处理联系信息保存
  const handleContactSave = (contactInfo: string) => {
    const updatedTreeData = { ...treeData, contact_info: contactInfo || null };
    setTreeData(updatedTreeData);
    setHasUnsavedChanges(true);
    saveTreeData(updatedTreeData);
    if (treeId) {
      saveToHistory({ id: treeId, title: treeData.title });
    }
  };

  // 处理收藏/取消收藏
  const handleToggleCollect = () => {
    if (!treeId) return;
    toggleCollectTree({
      id: treeId,
      title: treeData.title,
      author_name: treeData.author_name,
    });
    setIsCollected(isTreeCollected(treeId));
  };

  // 处理 Fork/Remix
  const handleFork = async () => {
    if (!treeId || isForking) return;

    setIsForking(true);
    try {
      // 复制当前树的数据
      const forkedData: TreeData = {
        courses: treeData.courses.map(course => ({
          ...course,
          id: `course-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // 生成新 ID
        })),
        title: `${treeData.title} (Remix)`,
        likes: 0,
        contact_info: null,
        author_name: treeData.author_name || 'Anonymous', // 保留原始作者名（如果存在）
      };

      // 插入新行到 Supabase
      const { data, error } = await supabase
        .from('trees')
        .insert({ content: forkedData })
        .select('id')
        .single();

      if (error) {
        console.error('Error forking tree:', error);
        setToastMessage('Failed to fork tree');
        setShowToast(true);
        return;
      }

      if (data && data.id) {
        // 添加到拥有列表
        addToOwnedTrees(data.id);
        // 保存到历史记录
        saveToHistory({ id: data.id, title: forkedData.title });
        // 显示成功消息
        setToastMessage('Tree forked! You can now edit your copy.');
        setShowToast(true);
        // 重定向到新 URL
        navigate(`/?id=${data.id}`);
      }
    } catch (err) {
      console.error('Unexpected error forking tree:', err);
      setToastMessage('Failed to fork tree');
      setShowToast(true);
    } finally {
      setIsForking(false);
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

  // 导出为图片功能
  const handleExportImage = async () => {
    if (!exportContainerRef.current) return;

    try {
      const container = exportContainerRef.current;
      const originalPosition = container.style.position;
      const originalOverflow = container.style.overflow;

      // 创建水印元素
      const watermark = document.createElement('div');
      watermark.style.cssText = `
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        text-align: center;
        color: #5D4037;
        font-size: 14px;
        font-family: 'Varela Round', sans-serif;
        padding: 8px 16px;
        background: rgba(255, 255, 255, 0.95);
        border-radius: 20px;
        border: 2px solid #E0E0E0;
        z-index: 10000;
        pointer-events: none;
        white-space: nowrap;
      `;
      watermark.textContent = `Curated by ${treeData.title} on CourseTree 🍯`;

      // 临时设置容器样式以确保正确捕获
      container.style.position = 'relative';
      container.style.overflow = 'visible';
      
      // 将水印添加到容器中
      container.appendChild(watermark);

      // 使用 html2canvas 捕获
      const canvas = await html2canvas(container, {
        backgroundColor: '#F0F8F0', // 使用主题背景色
        scale: 2, // 提高图片质量
        logging: false,
        useCORS: true,
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
      });

      // 恢复原始样式并移除水印
      container.style.position = originalPosition;
      container.style.overflow = originalOverflow;
      if (container.contains(watermark)) {
        container.removeChild(watermark);
      }

      // 转换为 blob 并下载
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Failed to create blob');
          setToastMessage('Failed to export image');
          setShowToast(true);
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'My-CourseTree.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setToastMessage('Image exported successfully!');
        setShowToast(true);
      }, 'image/png');
    } catch (error) {
      console.error('Failed to export image:', error);
      setToastMessage('Failed to export image');
      setShowToast(true);
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
      <div className="min-h-screen bg-transparent py-12 px-4 flex items-center justify-center">
        <div className="text-[#5D4037] text-lg">加载中...</div>
      </div>
    );
  }

  if (!treeId) {
    return (
      <div className="min-h-screen bg-transparent py-12 px-4 flex items-center justify-center">
        <div className="text-[#5D4037] text-lg">无效的树 ID</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent py-12 px-4">
      <div className="max-w-full mx-auto max-w-7xl px-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            {/* Title and Like Button */}
            <div className="flex items-center gap-4 flex-1">
              {isOwner && isEditingTitle ? (
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
                    className="text-3xl sm:text-4xl font-bold text-[#5D4037] bg-transparent border-b-2 border-[#5D4037] focus:outline-none w-full"
                    style={{ fontFamily: "'Varela Round', sans-serif" }}
                    autoFocus
                  />
                </div>
              ) : (
                <div
                  onClick={isOwner ? handleTitleEdit : undefined}
                  className={`group flex items-center gap-2 ${isOwner ? 'cursor-pointer' : ''}`}
                >
                  <h1
                    className="text-3xl sm:text-4xl font-bold text-[#5D4037]"
                    style={{ fontFamily: "'Varela Round', sans-serif" }}
                  >
                    {treeData.title}
                  </h1>
                  {isOwner && (
                    <Edit2
                      size={18}
                      className="text-[#5D4037]/60 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  )}
                </div>
              )}
              
              {/* Collection/Star Button (for visitors) */}
              {!isOwner && (
                <button
                  onClick={handleToggleCollect}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border-3 border-[#F3D03E] transition-all font-medium button-3d ${
                    isCollected
                      ? 'bg-[#F3D03E] text-[#5D4037]'
                      : 'bg-white text-[#F3D03E]'
                  }`}
                >
                  <span className="text-xl">{isCollected ? '⭐️' : '☆'}</span>
                  <span className="font-semibold">{isCollected ? 'Saved' : 'Save'}</span>
                </button>
              )}
            </div>

            {/* Right Side Buttons */}
            <div className="flex items-center gap-3">
              {isOwner && (
                <div className="hidden sm:flex items-center gap-2 text-xs sm:text-sm min-w-[150px] justify-end">
                  {isSaving ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-[#5D4037]/80" />
                      <span className="text-[#5D4037]/80">Saving...</span>
                    </>
                  ) : !hasUnsavedChanges ? (
                    <>
                      <CheckCircle2 size={14} className="text-[#5D4037]/80" />
                      <span className="text-[#5D4037]/70">All changes saved</span>
                    </>
                  ) : null}
                </div>
              )}
              {isOwner && (
                <button
                  onClick={() => setShowContactModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border-3 border-[#78C850] text-[#78C850] font-medium button-3d"
                >
                  <MessageCircle size={18} />
                  <span className="hidden sm:inline">Ask me anything</span>
                  <span className="sm:hidden">Contact</span>
                </button>
              )}
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border-3 border-[#78C850] text-[#78C850] font-medium button-3d"
              >
                <Share2 size={18} />
                <span className="hidden sm:inline">分享</span>
              </button>
              {isOwner && (
                <button
                  onClick={handleExportImage}
                  className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border-3 border-[#F3D03E] text-[#F3D03E] font-medium button-3d"
                  title="Save as Image"
                >
                  <Camera size={18} />
                  <span className="hidden sm:inline">Export</span>
                </button>
              )}
              {!isOwner && (
                <button
                  onClick={handleFork}
                  disabled={isForking}
                  className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border-3 border-[#FF8C00] text-[#FF8C00] font-medium button-3d disabled:opacity-60"
                >
                  {isForking ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Forking...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl">⚡️</span>
                      <span className="hidden sm:inline">Fork this Tree</span>
                      <span className="sm:hidden">Fork</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        <div ref={exportContainerRef}>
          <TimelineHexagonGrid
            courses={treeData.courses}
            onCoursesChange={handleCoursesChange}
            onCoursesChangeImmediate={handleCoursesDelete}
          />
        </div>
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

