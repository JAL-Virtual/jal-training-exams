'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { logger } from '../lib/logger';

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

const CompletedTraining: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<{name: string, role: string} | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'category'>('date');

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
          logger.error('Failed to fetch courses for Completed Training', { error: coursesResult.error });
        }

        if (studentsResult.success) {
          setStudents(studentsResult.students);
        } else {
          logger.error('Failed to fetch students for Completed Training', { error: studentsResult.error });
        }
      } catch (error) {
        logger.error('Error loading data for Completed Training', {
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
  const completedEnrollments = currentUserEnrollments.filter(student => student.status === 'completed');

  const filteredCompletedCourses = completedEnrollments.filter(enrollment => {
    const course = courses.find(c => c.id === enrollment.courseId);
    if (!course) return false;
    
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === '' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort completed courses
  const sortedCompletedCourses = [...filteredCompletedCourses].sort((a, b) => {
    const courseA = courses.find(c => c.id === a.courseId);
    const courseB = courses.find(c => c.id === b.courseId);
    
    if (!courseA || !courseB) return 0;
    
    switch (sortBy) {
      case 'date':
        return new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime();
      case 'name':
        return courseA.title.localeCompare(courseB.title);
      case 'category':
        return (courseA.category || '').localeCompare(courseB.category || '');
      default:
        return 0;
    }
  });

  // Loading state JSX
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg">
        <div className="flex items-center">
          <svg className="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-lg font-semibold text-gray-900">Completed Training</h4>
            <p className="text-gray-600">View your completed training sessions and certificates</p>
          </div>
        </div>
        {/* Search and Filter Controls */}
        <div className="mt-4 flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search completed courses..."
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-200 w-full md:w-1/3"
          />
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-200 w-full md:w-1/4"
          >
            <option value="">All Categories</option>
            {[...new Set(courses.map(c => c.category).filter(Boolean))].map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as 'date' | 'name' | 'category')}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-200 w-full md:w-1/4"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="category">Sort by Category</option>
          </select>
        </div>
      </div>

      {/* Completed Courses List */}
      <div className="space-y-4">
        {sortedCompletedCourses.map((enrollment) => {
          const course = courses.find(c => c.id === enrollment.courseId);
          if (!course) return null;

          return (
            <motion.div
              key={enrollment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-gray-200 rounded-lg p-6 bg-green-50 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h5 className="font-medium text-gray-900">{course.title}</h5>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                      ✓ Completed
                    </span>
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
                    <span>Completed: {new Date(enrollment.enrolledAt).toLocaleDateString()}</span>
                    <span>Category: {course.category || 'General'}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600 mb-1">100% Complete</div>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full w-full"></div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        // TODO: View course content
                        alert(`Viewing ${course.title} content...`);
                      }}
                      className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Review
                    </button>
                    <button
                      onClick={() => {
                        // TODO: View certificate
                        alert(`Viewing ${course.title} certificate...`);
                      }}
                      className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Certificate
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {sortedCompletedCourses.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Completed Training</h3>
            <p className="text-gray-500 mb-4">You haven&apos;t completed any training sessions yet.</p>
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
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {completedEnrollments.length}
          </div>
          <div className="text-sm text-green-800">Completed Courses</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {new Set(completedEnrollments.map(e => {
              const course = courses.find(c => c.id === e.courseId);
              return course?.category;
            }).filter(Boolean)).size}
          </div>
          <div className="text-sm text-blue-800">Categories</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600 mb-1">
            {completedEnrollments.length > 0 
              ? Math.round(completedEnrollments.reduce((acc, e) => {
                  const course = courses.find(c => c.id === e.courseId);
                  return acc + (course?.sections?.length || 0);
                }, 0) / completedEnrollments.length) 
              : 0}
          </div>
          <div className="text-sm text-purple-800">Avg Sections</div>
        </div>
      </div>
    </div>
  );
};

export default CompletedTraining;
