import { useState, useEffect } from 'react';
import { Course } from '../types';
import { CourseModal } from './CourseModal';
import { Plus } from 'lucide-react';

const years = [1, 2, 3, 4] as const;

interface HexagonProps {
  course: Course;
  onClick: () => void;
}

interface TimelineHexagonGridProps {
  courses: Course[];
  onCoursesChange: (courses: Course[]) => void;
}

function Hexagon({ course, onClick }: HexagonProps) {
  const getHexagonColor = (course: Course) => {
    if (course.status === 'locked') {
      return 'bg-[#E5E5E5] opacity-60';
    } else if (course.status === 'reviewed') {
      return 'bg-[#FFD700] hexagon-glow';
    } else if (course.status === 'completed') {
      return 'bg-[#F9E4B7]';
    }
    return 'bg-[#E5E5E5]';
  };

  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center h-28 w-28 sm:h-32 sm:w-32 relative group cursor-pointer transition-transform duration-300 hover:scale-110 border-0 p-0"
      style={{
        clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
      }}
    >
      <div
        className={`absolute inset-0 flex items-center justify-center text-center ${getHexagonColor(course)} transition-all duration-300 rounded-lg`}
        style={{
          clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
        }}
      >
        <div className="px-2">
          <p className="text-xs font-bold text-[#4A3B2A] leading-tight">
            {course.name}
          </p>
        </div>
      </div>

      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[#4A3B2A] bg-opacity-85 rounded-lg flex items-center justify-center z-50 pointer-events-none"
        style={{
          clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
        }}
      >
        <div className="text-white text-center px-3">
          <p className="font-semibold text-sm mb-1">{course.name}</p>
          {course.rating && (
            <p className="text-xs text-[#FFD700]">★ {course.rating}/5</p>
          )}
          <p className="text-xs text-gray-200 mt-2">Click to edit</p>
        </div>
      </div>
    </button>
  );
}

export function TimelineHexagonGrid({ courses, onCoursesChange }: TimelineHexagonGridProps) {
  const [localCourses, setLocalCourses] = useState<Course[]>(courses);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

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
    url: string | null
  ) => {
    const updatedCourses = localCourses.map(course =>
      course.id === courseId
        ? {
            ...course,
            name,
            status: 'reviewed' as const,
            rating: rating || null,
            review: review || null,
            url: url || null,
          }
        : course
    );
    setLocalCourses(updatedCourses);
    setSelectedCourse(null);
    onCoursesChange(updatedCourses);
  };

  const handleDeleteCourse = (courseId: string) => {
    const updatedCourses = localCourses.filter(c => c.id !== courseId);
    setLocalCourses(updatedCourses);
    setSelectedCourse(null);
    onCoursesChange(updatedCourses);
  };

  const handleAddCourse = (year: number) => {
    const newCourse: Course = {
      id: `course-${Date.now()}`,
      name: 'New Course',
      year: year as 1 | 2 | 3 | 4,
      status: 'completed',
      rating: null,
      review: null,
      url: null,
    };
    const updatedCourses = [...localCourses, newCourse];
    setLocalCourses(updatedCourses);
    setSelectedCourse(newCourse);
    onCoursesChange(updatedCourses);
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-5xl font-bold text-[#4A3B2A] mb-3" style={{ fontFamily: "'Nunito', sans-serif" }}>CourseTree</h1>
        <p className="text-[#4A3B2A]/80 text-lg">Your Learning Journey</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-4 sm:p-8">
        <div className="overflow-x-auto pb-4">
          <div className="min-w-max">
            {/* Desktop: Horizontal layout */}
            <div className="hidden md:flex gap-8 lg:gap-12 relative items-start">
              {years.map((year, index) => {
                const yearCourses = coursesByYear(year);
                const isLast = index === years.length - 1;
                return (
                  <div key={year} className="flex flex-col items-center relative flex-1">
                    {/* Connector line (except for last column) */}
                    {!isLast && (
                      <div
                        className="absolute top-[120px] left-full"
                        style={{
                          width: 'calc(2rem + 2rem)',
                          height: '2px',
                          borderTop: '2px dashed #F9E4B7',
                          zIndex: 0,
                        }}
                      />
                    )}
                    <div className="mb-6 text-center relative z-10">
                      <h2 className="text-xl font-bold text-[#4A3B2A]">Year {year}</h2>
                      <p className="text-xs text-[#4A3B2A]/70 mt-1">
                        {year === 1
                          ? 'Freshman'
                          : year === 2
                            ? 'Sophomore'
                            : year === 3
                              ? 'Junior'
                              : 'Senior'}
                      </p>
                    </div>

                    <div className="flex flex-col gap-4 items-center min-h-[200px]">
                      {yearCourses.map(course => (
                        <Hexagon
                          key={course.id}
                          course={course}
                          onClick={() => setSelectedCourse(course)}
                        />
                      ))}
                    </div>

                    <button
                      onClick={() => handleAddCourse(year)}
                      className="mt-6 flex items-center gap-2 px-4 py-2 bg-[#F9E4B7] hover:bg-[#FFD700] rounded-full text-[#4A3B2A] text-sm font-medium transition-colors shadow-md hover:shadow-lg"
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
                      <h2 className="text-xl font-bold text-[#4A3B2A]">Year {year}</h2>
                      <p className="text-xs text-[#4A3B2A]/70 mt-1">
                        {year === 1
                          ? 'Freshman'
                          : year === 2
                            ? 'Sophomore'
                            : year === 3
                              ? 'Junior'
                              : 'Senior'}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-4 justify-center max-w-full">
                      {yearCourses.map(course => (
                        <Hexagon
                          key={course.id}
                          course={course}
                          onClick={() => setSelectedCourse(course)}
                        />
                      ))}
                    </div>

                    <button
                      onClick={() => handleAddCourse(year)}
                      className="mt-4 flex items-center gap-2 px-4 py-2 bg-[#F9E4B7] hover:bg-[#FFD700] rounded-full text-[#4A3B2A] text-sm font-medium transition-colors shadow-md hover:shadow-lg"
                    >
                      <Plus size={16} />
                      Add Course
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-[#4A3B2A]">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 bg-[#E5E5E5] opacity-60"
            style={{
              clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
            }}
          />
          <span>Locked (Not Yet Available)</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 bg-[#F9E4B7]"
            style={{
              clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
            }}
          />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 bg-[#FFD700] hexagon-glow"
            style={{
              clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
            }}
          />
          <span>Reviewed (With Rating)</span>
        </div>
      </div>

      {selectedCourse && (
        <CourseModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
          onSave={handleSaveCourse}
          onDelete={handleDeleteCourse}
        />
      )}
    </div>
  );
}
