import { useState, useEffect } from 'react';
import { Course, Resource } from '../types';
import { CourseModal } from './CourseModal';
import { Plus, Leaf } from 'lucide-react';

const years = [1, 2, 3, 4] as const;

interface HexagonProps {
  course: Course;
  onClick: () => void;
}

interface TimelineHexagonGridProps {
  courses: Course[];
  onCoursesChange: (courses: Course[]) => void;
  onCoursesChangeImmediate?: (courses: Course[]) => void;
  isOwner?: boolean; // 是否拥有者，控制编辑功能显示
}

function Hexagon({ course, onClick }: HexagonProps) {
  const getHexagonStyle = (course: Course) => {
    if (course.status === 'locked') {
      return {
        bg: 'bg-[#B0C4DE]',
        border: 'border-3 border-[#8FA8C0]',
        text: 'text-[#5D4037]',
      };
    } else if (course.status === 'reviewed') {
      return {
        bg: 'bg-[#F3D03E]',
        border: 'border-3 border-[#D4B82A]',
        text: 'text-[#5D4037]',
      };
    } else if (course.status === 'completed') {
      return {
        bg: 'bg-[#78C850]',
        border: 'border-3 border-[#5FA03A]',
        text: 'text-white',
      };
    }
    return {
      bg: 'bg-[#B0C4DE]',
      border: 'border-3 border-[#8FA8C0]',
      text: 'text-[#5D4037]',
    };
  };

  const style = getHexagonStyle(course);

  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center h-28 w-28 sm:h-32 sm:w-32 relative group cursor-pointer transition-transform duration-300 hover:scale-110 border-0 p-0"
      style={{
        clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
      }}
    >
      <div
        className={`absolute inset-0 flex items-center justify-center text-center ${style.bg} ${style.border} hexagon-stamp transition-all duration-300`}
        style={{
          clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
          borderWidth: '3px',
        }}
      >
        <div className="px-3 py-1">
          <p className={`text-xs font-bold ${style.text} leading-tight line-clamp-3`}>
            {course.name}
          </p>
        </div>
      </div>

      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[#5D4037] bg-opacity-90 rounded-lg flex items-center justify-center z-50 pointer-events-none"
        style={{
          clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
        }}
      >
        <div className="text-white text-center px-3">
          <p className="font-semibold text-sm mb-1">{course.name}</p>
          {course.rating && (
            <p className="text-xs text-[#F3D03E]">★ {course.rating}/5</p>
          )}
          <p className="text-xs text-gray-200 mt-2">Click to edit</p>
        </div>
      </div>
    </button>
  );
}

export function TimelineHexagonGrid({ courses, onCoursesChange, onCoursesChangeImmediate, isOwner = false }: TimelineHexagonGridProps) {
  const [localCourses, setLocalCourses] = useState<Course[]>(courses);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedIsNew, setSelectedIsNew] = useState(false);

  // 当外部 courses 变化时，同步本地状态
  useEffect(() => {
    setLocalCourses(courses);
  }, [courses]);

  const coursesByYear = (year: number) => {
    return localCourses.filter(c => c.year === year);
  };

  const handleSaveCourse = (
    courseId: string,
    name: string,
    rating: number,
    review: string,
    resources: Resource[],
    profReview: string | null
  ) => {
    if (selectedIsNew) {
      // 新建课程：生成新的 UUID 并添加到数组
      const newCourse: Course = {
        id: `course-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name,
        year: selectedCourse!.year,
        status: 'reviewed' as const,
        rating: rating || null,
        review: review || null,
        resources: resources || [],
        prof_review: profReview || null,
      };
      const updatedCourses = [...localCourses, newCourse];
      setLocalCourses(updatedCourses);
      setSelectedCourse(null);
      setSelectedIsNew(false);
      onCoursesChange(updatedCourses);
    } else {
      // 更新现有课程
      const updatedCourses = localCourses.map(course =>
        course.id === courseId
          ? {
              ...course,
              name,
              status: 'reviewed' as const,
              rating: rating || null,
              review: review || null,
              resources: resources || [],
              prof_review: profReview || null,
            }
          : course
      );
      setLocalCourses(updatedCourses);
      setSelectedCourse(null);
      setSelectedIsNew(false);
      onCoursesChange(updatedCourses);
    }
  };

  const handleDeleteCourse = (courseId: string) => {
    const updatedCourses = localCourses.filter(c => c.id !== courseId);
    setLocalCourses(updatedCourses);
    setSelectedCourse(null);
    setSelectedIsNew(false);
    onCoursesChange(updatedCourses);
    if (onCoursesChangeImmediate) {
      onCoursesChangeImmediate(updatedCourses);
    }
  };

  const handleAddCourse = (year: number) => {
    // 创建临时课程对象（不添加到状态中）
    const tempCourse: Course = {
      id: `temp-course-${Date.now()}`,
      name: 'New Course',
      year: year as 1 | 2 | 3 | 4,
      status: 'completed',
      rating: null,
      review: null,
      resources: [],
      prof_review: null,
    };
    // 只打开 Modal，不添加到 courses 数组
    setSelectedCourse(tempCourse);
    setSelectedIsNew(true);
  };

  const handleCancelCourse = () => {
    // 如果是新建模式，直接关闭 Modal，不添加任何内容
    setSelectedCourse(null);
    setSelectedIsNew(false);
  };

  return (
    <div className="w-full">
      <div className="mb-8 flex items-center justify-center gap-3">
        <h1 className="text-5xl font-bold text-[#5D4037]" style={{ fontFamily: "'Varela Round', sans-serif" }}>CourseTree</h1>
        <Leaf size={32} className="text-[#78C850]" />
      </div>
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-4 sm:p-8 border-3 border-[#E0E0E0]">
        <div className="overflow-x-auto pb-4">
          <div className="min-w-max">
            {/* Desktop: Horizontal layout */}
            <div className="hidden md:flex flex-row justify-start gap-16 px-10 relative items-start">
              {years.map((year, index) => {
                const yearCourses = coursesByYear(year);
                const isLast = index === years.length - 1;
                return (
                  <div key={year} className="flex flex-col items-center relative">
                    {/* Connector line (except for last column) */}
                    {!isLast && (
                      <div
                        className="absolute top-[120px] left-full"
                        style={{
                          width: 'calc(2rem + 2rem)',
                          height: '2px',
                          borderTop: '2px dashed #78C850',
                          zIndex: 0,
                        }}
                      />
                    )}
                    <div className="mb-6 text-center relative z-10">
                      <h2 className="text-xl font-bold text-[#5D4037]">Year {year}</h2>
                      <p className="text-xs text-[#5D4037]/70 mt-1">
                        {year === 1
                          ? 'Freshman'
                          : year === 2
                            ? 'Sophomore'
                            : year === 3
                              ? 'Junior'
                              : 'Senior'}
                      </p>
                    </div>

                    <div className="flex flex-col items-center min-h-[200px] gap-y-6">
                      {yearCourses.map((course) => (
                        <Hexagon
                          key={course.id}
                          course={course}
                          onClick={() => {
                            setSelectedCourse(course);
                            setSelectedIsNew(false);
                          }}
                        />
                      ))}
                    </div>

                    <button
                      onClick={() => handleAddCourse(year)}
                      className="mt-6 flex items-center gap-2 px-4 py-2 bg-white border-3 border-[#78C850] text-[#78C850] hover:bg-[#78C850] hover:text-white button-3d rounded-full text-sm font-medium"
                    >
                      <Plus size={16} />
                      Add Course
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Mobile: Vertical layout */}
            <div className="md:hidden flex flex-col gap-8">
              {years.map((year) => {
                const yearCourses = coursesByYear(year);
                return (
                  <div key={year} className="flex flex-col items-center">
                    <div className="mb-4 text-center">
                      <h2 className="text-xl font-bold text-[#5D4037]">Year {year}</h2>
                      <p className="text-xs text-[#5D4037]/70 mt-1">
                        {year === 1
                          ? 'Freshman'
                          : year === 2
                            ? 'Sophomore'
                            : year === 3
                              ? 'Junior'
                              : 'Senior'}
                      </p>
                    </div>

                    <div className="flex flex-col items-center max-w-full gap-y-6">
                      {yearCourses.map((course) => (
                        <Hexagon
                          key={course.id}
                          course={course}
                          onClick={() => {
                            setSelectedCourse(course);
                            setSelectedIsNew(false);
                          }}
                        />
                      ))}
                    </div>

                    {isOwner && (
                      <button
                        onClick={() => handleAddCourse(year)}
                        className="mt-4 flex items-center gap-2 px-4 py-2 bg-white border-3 border-[#78C850] text-[#78C850] hover:bg-[#78C850] hover:text-white button-3d rounded-full text-sm font-medium"
                      >
                        <Plus size={16} />
                        Add Course
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-[#5D4037]">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 bg-[#B0C4DE] border-3 border-[#8FA8C0]"
            style={{
              clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
              borderWidth: '3px',
            }}
          />
          <span>Locked (Not Yet Available)</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 bg-[#78C850] border-3 border-[#5FA03A]"
            style={{
              clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
              borderWidth: '3px',
            }}
          />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 bg-[#F3D03E] border-3 border-[#D4B82A] hexagon-stamp"
            style={{
              clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
              borderWidth: '3px',
            }}
          />
          <span>Reviewed (With Rating)</span>
        </div>
      </div>

      {selectedCourse && (
        <CourseModal
          course={selectedCourse}
          onClose={handleCancelCourse}
          onSave={handleSaveCourse}
          onDelete={handleDeleteCourse}
          isNew={selectedIsNew}
          isOwner={isOwner}
        />
      )}
    </div>
  );
}
