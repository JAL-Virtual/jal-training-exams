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

const PendingTraining: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<{name: string, role: string} | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

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
          logger.error('Failed to fetch courses for Pending Training', { error: coursesResult.error });
        }

        if (studentsResult.success) {
          setStudents(studentsResult.students);
        } else {
          logger.error('Failed to fetch students for Pending Training', { error: studentsResult.error });
        }
      } catch (error) {
        logger.error('Error loading data for Pending Training', {
          message: error instanceof Error ? error.message : String(error),
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
    fetchData();
  }, []);

  const currentUserEnrollments = students.filter(student => student.name === currentUser?.name);
  const pendingEnrollments = currentUserEnrollments.filter(student => student.status === 'enrolled');

  const filteredPendingCourses = pendingEnrollments.filter(enrollment => {
    const course = courses.find(c => c.id === enrollment.courseId);
    if (!course) return false;
    
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === '' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg">
        <div className="flex items-center">
          <svg className="w-8 h-8 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-lg font-semibold text-gray-900">Pending Training</h4>
            <p className="text-gray-600">Training sessions awaiting completion</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search pending courses..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-48">
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
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
          </div>
        </div>
      </div>

      {/* Pending Courses List */}
      <div className="space-y-4">
        {filteredPendingCourses.map((enrollment) => {
          const course = courses.find(c => c.id === enrollment.courseId);
          if (!course) return null;

          return (
            <motion.div
              key={enrollment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h5 className="font-medium text-gray-900">{course.title}</h5>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      course.status === 'active' ? 'bg-green-100 text-green-800' :
                      course.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {course.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{course.description}</p>
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <span>Instructor: {course.instructor}</span>
                    <span>Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}</span>
                    <span>Category: {course.category || 'General'}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 mb-1">{enrollment.progress}% Complete</div>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${enrollment.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      // TODO: Navigate to course content
                      alert(`Opening ${course.title}...`);
                    }}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors font-medium"
                  >
                    Continue Training
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}

        {filteredPendingCourses.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Training</h3>
            <p className="text-gray-500 mb-4">You don&apos;t have any training sessions in progress.</p>
            <button
              onClick={() => {
                // TODO: Navigate to available courses
                alert('Navigate to available courses...');
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Available Courses
            </button>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-yellow-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-yellow-600 mb-1">
            {pendingEnrollments.length}
          </div>
          <div className="text-sm text-yellow-800">Pending Courses</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {Math.round(pendingEnrollments.reduce((acc, e) => acc + e.progress, 0) / (pendingEnrollments.length || 1))}%
          </div>
          <div className="text-sm text-blue-800">Average Progress</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {pendingEnrollments.filter(e => e.progress > 50).length}
          </div>
          <div className="text-sm text-green-800">Over 50% Complete</div>
        </div>
      </div>
    </div>
  );
};

export default PendingTraining;
