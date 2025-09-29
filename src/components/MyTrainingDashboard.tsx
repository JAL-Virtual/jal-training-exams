import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { logger } from '@/lib/logger';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  status: 'active' | 'inactive' | 'draft';
  category?: string;
  students: number;
  createdAt: string;
  sections?: CourseSection[];
}

interface CourseSection {
  id: string;
  title: string;
  description?: string;
  courseId: string;
  order: number;
  activities: Activity[];
  resources: Resource[];
  createdAt: string;
}

interface Activity {
  id: string;
  title: string;
  type: 'assignment' | 'quiz' | 'discussion' | 'lesson' | 'workshop';
  description?: string;
  sectionId: string;
  order: number;
  dueDate?: string;
  points?: number;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
}

interface Resource {
  id: string;
  title: string;
  type: 'file' | 'link' | 'video' | 'document' | 'presentation';
  description?: string;
  sectionId: string;
  order: number;
  url?: string;
  filePath?: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
}

interface Student {
  id: string;
  name: string;
  jalId: string;
  progress: number;
  status: 'enrolled' | 'completed' | 'dropped';
  enrolledAt: string;
  courseId: string;
}

const MyTrainingDashboard: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<{name: string, role: string} | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const apiKey = localStorage.getItem('jal_api_key');
        if (!apiKey) return;

        // Get current user's role and info
        const roleResponse = await fetch(`/api/staff/role?apiKey=${encodeURIComponent(apiKey)}`);
        if (roleResponse.ok) {
          const roleResult = await roleResponse.json();
          if (roleResult.success) {
            setCurrentUser({ name: roleResult.name, role: roleResult.role });
          }
        }
      } catch (error) {
        logger.error('Error loading current user', { 
          message: error instanceof Error ? error.message : String(error) 
        });
      }
    };

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [coursesResponse, studentsResponse] = await Promise.all([
          fetch('/api/courses'),
          fetch('/api/students'),
        ]);

        const coursesResult = await coursesResponse.json();
        const studentsResult = await studentsResponse.json();

        if (coursesResult.success) {
          setCourses(coursesResult.courses);
        } else {
          logger.error('Failed to fetch courses for My Training', { error: coursesResult.error });
        }

        if (studentsResult.success) {
          setStudents(studentsResult.students);
        } else {
          logger.error('Failed to fetch students for My Training', { error: studentsResult.error });
        }
      } catch (error) {
        logger.error('Error loading data for My Training Dashboard', {
          message: error instanceof Error ? error.message : String(error),
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
    fetchData();
  }, []);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === '' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const currentUserEnrollments = students.filter(student => student.name === currentUser?.name);
  const pendingEnrollments = currentUserEnrollments.filter(student => student.status === 'enrolled');
  const completedEnrollments = currentUserEnrollments.filter(student => student.status === 'completed');
  const completedCoursesCount = completedEnrollments.length;
  const totalProgress = currentUserEnrollments.reduce((acc, student) => acc + student.progress, 0);
  const averageProgress = currentUserEnrollments.length > 0 ? Math.round(totalProgress / currentUserEnrollments.length) : 0;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
        <h4 className="text-lg font-semibold text-gray-900 mb-2">My Training Dashboard</h4>
        <p className="text-gray-600">
          Welcome back, {currentUser?.name || 'Student'}! Here you can browse and enroll in available courses.
        </p>
      </div>

      {/* Available Courses for Enrollment */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-md font-medium text-gray-900">Available Courses</h4>
          <div className="flex items-center space-x-3">
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="pilot">Pilot Training</option>
              <option value="atc">ATC Training</option>
              <option value="ground">Ground School</option>
              <option value="safety">Safety & Emergency</option>
              <option value="technical">Technical Systems</option>
              <option value="procedures">Standard Procedures</option>
              <option value="communication">Communication</option>
              <option value="navigation">Navigation</option>
              <option value="meteorology">Meteorology</option>
              <option value="aircraft">Aircraft Systems</option>
              <option value="regulations">Aviation Regulations</option>
              <option value="human-factors">Human Factors</option>
              <option value="maintenance">Maintenance</option>
              <option value="dispatch">Dispatch Operations</option>
              <option value="cargo">Cargo Operations</option>
              <option value="passenger">Passenger Services</option>
              <option value="management">Aviation Management</option>
            </select>
            <input
              type="text"
              placeholder="Search courses..."
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map((course) => (
            <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900 mb-1">{course.title}</h5>
                  <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  course.status === 'active' ? 'bg-green-100 text-green-800' :
                  course.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {course.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                <span>Instructor: {course.instructor}</span>
                <span>{course.students} students</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {course.sections?.length || 0} sections
                </div>
                <button
                  onClick={() => {
                    setSelectedCourse(course);
                    setShowEnrollmentModal(true);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  Enroll Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No courses available for enrollment.</p>
          </div>
        )}
      </div>

      {/* Pending Training */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Pending Training
        </h4>
        <div className="space-y-4">
          {pendingEnrollments.map((enrollment) => {
            const course = courses.find(c => c.id === enrollment.courseId);
            if (!course) return null;

            return (
              <div key={enrollment.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900 mb-1">{course.title}</h5>
                    <p className="text-sm text-gray-600 mb-2">{course.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}</span>
                      <span>Status: {enrollment.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{enrollment.progress}%</div>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${enrollment.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        // TODO: Navigate to course content
                        alert(`Opening ${course.title}...`);
                      }}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {pendingEnrollments.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No pending training courses.</p>
              <p className="text-sm text-gray-400 mt-1">Browse available courses above to get started!</p>
            </div>
          )}
        </div>
      </div>

      {/* Completed Training */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Completed Training
        </h4>
        <div className="space-y-4">
          {completedEnrollments.map((enrollment) => {
            const course = courses.find(c => c.id === enrollment.courseId);
            if (!course) return null;

            return (
              <div key={enrollment.id} className="border border-gray-200 rounded-lg p-4 bg-green-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900 mb-1">{course.title}</h5>
                    <p className="text-sm text-gray-600 mb-2">{course.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Completed: {new Date(enrollment.enrolledAt).toLocaleDateString()}</span>
                      <span className="text-green-600 font-medium">✓ Completed</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">100%</div>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full w-full"></div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        // TODO: Navigate to course content or certificate
                        alert(`Viewing ${course.title} certificate...`);
                      }}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                    >
                      View Certificate
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {completedEnrollments.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No completed training courses yet.</p>
              <p className="text-sm text-gray-400 mt-1">Complete your enrolled courses to see them here!</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {currentUserEnrollments.length}
          </div>
          <div className="text-sm text-blue-800">Enrolled Courses</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {completedCoursesCount}
          </div>
          <div className="text-sm text-green-800">Completed</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600 mb-1">
            {averageProgress}%
          </div>
          <div className="text-sm text-purple-800">Average Progress</div>
        </div>
      </div>

      {/* Enrollment Options Modal */}
      {showEnrollmentModal && selectedCourse && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 backdrop-blur-sm bg-white/20 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Enrolment options</h3>
            
            {/* Course Info */}
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{selectedCourse.title}</h4>
                  <p className="text-sm text-gray-600">Teacher: {selectedCourse.instructor}</p>
                </div>
              </div>
            </div>

            {/* Self Enrollment Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium text-gray-900">Self enrolment (Student)</h5>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">No enrolment key required</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowEnrollmentModal(false);
                  setSelectedCourse(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // TODO: Implement actual enrollment
                  alert(`Successfully enrolled in ${selectedCourse.title}!`);
                  setShowEnrollmentModal(false);
                  setSelectedCourse(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Enrol me
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default MyTrainingDashboard;
