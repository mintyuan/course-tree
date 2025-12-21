import { useState, useEffect } from 'react';
import { Course, Resource } from '../types';
import { CourseModal } from './CourseModal';

const categories = ['Math', 'Software', 'Hardware', 'General'];
const years = [1, 2, 3, 4];

interface HexagonProps {
  course: Course | null;
  onClick: () => void;
}

interface TimelineHexagonGridProps {
  courses: Course[];
  onSaveCourses: (courses: Course[]) => void;
}

function Hexagon({ course, onClick }: HexagonProps) {
  const getHexagonColor = (course: Course) => {
    if (course.status === 'locked') {
      return 'bg-gray-300 opacity-40 shadow-sm';
    } else if (course.status === 'reviewed') {
      return 'bg-gradient-to-br from-amber-300 to-amber-400 shadow-lg shadow-amber-200';
    } else if (course.status === 'completed') {
      return 'bg-gradient-to-br from-amber-100 to-yellow-100 shadow-md';
    }
    return 'bg-gray-200';
  };

  if (!course) {
    return (
      <div className="flex items-center justify-center h-32 w-32 opacity-0">
        <div />
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center h-32 w-32 relative group cursor-pointer transition-transform duration-300 hover:scale-110 border-0 p-0`}
      style={{
        clipPath:
          'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
      }}
    >
      <div
        className={`absolute inset-0 flex items-center justify-center text-center ${getHexagonColor(course)} transition-all duration-300`}
      >
        <div className="px-2">
          <p className="text-xs font-bold text-slate-700 leading-tight">
            {course.name}
          </p>
        </div>
      </div>

      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-80 rounded-lg flex items-center justify-center z-50 pointer-events-none"
        style={{
          clipPath:
            'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
        }}
      >
        <div className="text-white text-center px-3">
          <p className="font-semibold text-sm mb-1">{course.name}</p>
          <p className="text-xs text-gray-200 mb-2">{course.category}</p>
          {course.rating && (
            <p className="text-xs text-yellow-300">★ {course.rating}/5</p>
          )}
          <p className="text-xs text-gray-300 mt-2">Click to edit</p>
        </div>
      </div>
    </button>
  );
}

export function TimelineHexagonGrid({ courses, onSaveCourses }: TimelineHexagonGridProps) {
  const [localCourses, setLocalCourses] = useState<Course[]>(courses);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // 当外部 courses 变化时，同步本地状态
  useEffect(() => {
    setLocalCourses(courses);
  }, [courses]);

  const coursesByYearAndCategory = (year: number, category: string) => {
    return localCourses.find(c => c.year === year && c.category === category) || null;
  };

  const handleSaveCourse = (
    courseId: string,
    rating: number,
    review: string,
    resources: Resource[]
  ) => {
    const updatedCourses = localCourses.map(course =>
      course.id === courseId
        ? {
            ...course,
            status: 'reviewed' as const,
            rating: rating || null,
            review: review || null,
            resources,
          }
        : course
    );
    setLocalCourses(updatedCourses);
    setSelectedCourse(null);
    // 保存到 Supabase
    onSaveCourses(updatedCourses);
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-5xl font-bold text-slate-800 mb-3">CourseTree</h1>
        <p className="text-slate-600 text-lg">Your Computer Science Journey</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="overflow-x-auto pb-4">
          <div className="min-w-max">
            <div className="flex gap-12">
              {years.map(year => (
                <div key={year} className="flex flex-col items-center">
                  <div className="mb-6 text-center">
                    <h2 className="text-xl font-bold text-slate-700">Year {year}</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      {year === 1
                        ? 'Freshman'
                        : year === 2
                          ? 'Sophomore'
                          : year === 3
                            ? 'Junior'
                            : 'Senior'}
                    </p>
                  </div>

                  <div className="flex flex-col gap-8">
                    {categories.map(category => {
                      const course = coursesByYearAndCategory(year, category);
                      return (
                        <div key={category} className="flex items-center gap-4">
                          <div className="w-16 text-right">
                            <p className="text-xs font-semibold text-slate-600">
                              {category}
                            </p>
                          </div>
                          <Hexagon
                            course={course}
                            onClick={() => {
                              const foundCourse = localCourses.find(c => c.id === course?.id);
                              if (foundCourse) {
                                setSelectedCourse(foundCourse);
                              }
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 opacity-40 bg-gray-300"
            style={{
              clipPath:
                'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
            }}
          />
          <span>Locked (Not Yet Available)</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 bg-gradient-to-br from-amber-100 to-yellow-100"
            style={{
              clipPath:
                'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
            }}
          />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 bg-gradient-to-br from-amber-300 to-amber-400"
            style={{
              clipPath:
                'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
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
        />
      )}
    </div>
  );
}
