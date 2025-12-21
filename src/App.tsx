import { useEffect, useState } from 'react';
import { TimelineHexagonGrid } from './components/TimelineHexagonGrid';
import { Course } from './types';
import { courses as initialCourses } from './mockData';
import { supabase } from './supabaseClient';

function App() {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTreeId, setCurrentTreeId] = useState<number | null>(null);

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      try {
        // 从 trees 表获取最新一条数据
        const { data, error } = await supabase
          .from('trees')
          .select('id, content')
          .order('id', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // PGRST116 表示没有找到数据，这是正常的，使用默认数据并插入
            await insertDefaultData();
          } else {
            console.error('Error loading data:', error);
            // 出错时也使用默认数据并尝试插入
            await insertDefaultData();
          }
        } else if (data && data.content) {
          // 如果有数据，解析 content 字段并覆盖默认的课程数据
          try {
            // Supabase JSONB 字段通常已经是解析后的对象，但为了安全起见也处理字符串情况
            const parsedCourses = Array.isArray(data.content) 
              ? data.content 
              : typeof data.content === 'string'
                ? JSON.parse(data.content)
                : data.content;
            
            // 验证数据格式
            if (Array.isArray(parsedCourses) && parsedCourses.length > 0) {
              setCourses(parsedCourses);
              setCurrentTreeId(data.id);
            } else {
              // 数据格式不正确，使用默认数据
              await insertDefaultData();
            }
          } catch (parseError) {
            console.error('Error parsing content:', parseError);
            // 如果解析失败，使用默认数据并插入新记录
            await insertDefaultData();
          }
        } else {
          // 如果没有数据，使用默认 Mock 数据并在后台插入一条新数据
          await insertDefaultData();
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        // 出错时使用默认数据
      } finally {
        setIsLoading(false);
      }
    };

    const insertDefaultData = async () => {
      try {
        const { data, error } = await supabase
          .from('trees')
          .insert({ content: initialCourses })
          .select('id')
          .single();

        if (error) {
          console.error('Error inserting default data:', error);
        } else if (data) {
          setCurrentTreeId(data.id);
        }
      } catch (err) {
        console.error('Error inserting default data:', err);
      }
    };

    loadData();
  }, []);

  // 保存数据到 Supabase
  const handleSaveCourses = async (updatedCourses: Course[]) => {
    if (currentTreeId === null) {
      console.error('No tree ID available for update');
      return;
    }

    try {
      const { error } = await supabase
        .from('trees')
        .update({ content: updatedCourses })
        .eq('id', currentTreeId);

      if (error) {
        console.error('Error updating courses:', error);
      }
    } catch (err) {
      console.error('Unexpected error updating courses:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-slate-50 to-blue-50 py-12 px-4 flex items-center justify-center">
        <div className="text-slate-600 text-lg">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-slate-50 to-blue-50 py-12 px-4">
      <div className="max-w-full mx-auto max-w-7xl px-6">
        <TimelineHexagonGrid courses={courses} onSaveCourses={handleSaveCourses} />
      </div>
    </div>
  );
}

export default App;
