import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TimelineHexagonGrid } from '../components/TimelineHexagonGrid';
import { Course } from '../types';
import { supabase } from '../supabaseClient';
import { Share2 } from 'lucide-react';

export function TreeView() {
  const [searchParams] = useSearchParams();
  const treeId = searchParams.get('id');
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 加载数据
  useEffect(() => {
    if (!treeId) {
      setIsLoading(false);
      return;
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
            const parsedCourses = Array.isArray(data.content)
              ? data.content
              : typeof data.content === 'string'
                ? JSON.parse(data.content)
                : data.content;

            if (Array.isArray(parsedCourses)) {
              setCourses(parsedCourses);
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

  // 自动保存函数
  const saveCourses = useCallback(async (updatedCourses: Course[]) => {
    if (!treeId) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('trees')
        .update({ content: updatedCourses })
        .eq('id', treeId);

      if (error) {
        console.error('Error saving courses:', error);
      }
    } catch (err) {
      console.error('Unexpected error saving courses:', err);
    } finally {
      setIsSaving(false);
    }
  }, [treeId]);

  // 处理课程更新（带防抖）
  const handleCoursesChange = useCallback((updatedCourses: Course[]) => {
    setCourses(updatedCourses);
    
    // 清除之前的定时器
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // 设置新的定时器，500ms 后保存
    saveTimeoutRef.current = setTimeout(() => {
      saveCourses(updatedCourses);
    }, 500);
  }, [saveCourses]);

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
      alert('链接已复制到剪贴板！');
    } catch (err) {
      console.error('Failed to copy:', err);
      // 降级方案
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('链接已复制到剪贴板！');
    }
  };

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
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            {isSaving && (
              <span className="text-sm text-[#4A3B2A]/70">保存中...</span>
            )}
          </div>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all hover:scale-105 text-[#4A3B2A] font-medium"
          >
            <Share2 size={18} />
            分享
          </button>
        </div>
        <TimelineHexagonGrid
          courses={courses}
          onCoursesChange={handleCoursesChange}
        />
      </div>
    </div>
  );
}

