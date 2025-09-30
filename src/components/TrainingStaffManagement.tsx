'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { logger } from '@/lib/logger';

interface TrainingStaffManagementProps {
  onTrainerChange?: () => void;
}

interface InactivationForm {
  userId: string;
  userType: 'trainer' | 'examiner';
  userName: string;
  userJalId: string;
  fromDate: string;
  toDate: string;
  days: string;
  comments: string;
  setInactive: boolean;
}

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
  email: string;
  jalId: string;
  courseId: string;
  progress: number;
  status: 'enrolled' | 'completed' | 'dropped';
  enrolledAt: string;
}

interface Pilot {
  id: string;
  name: string;
  jalId: string;
  email?: string;
  division?: string;
  rating?: string;
}

interface StaffMember {
  _id?: string;
  id?: string;
  apiKey: string;
  role: 'Trainer' | 'Examiner' | 'Admin';
  name?: string;
  addedDate: string;
  lastActive?: string;
  permissions?: string[];
  status: 'active' | 'inactive' | 'suspended';
  jalId?: string;
  pilot_id?: string;
  email?: string;
  division?: string;
  department?: string;
  rank?: {
    name: string;
  };
  rating?: string;
}

export default function TrainingStaffManagement({ onTrainerChange }: TrainingStaffManagementProps) {
  const [currentUser, setCurrentUser] = useState<{name: string, role: string} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<InactivationForm>({
    userId: '',
    userType: 'trainer',
    userName: '',
    userJalId: '',
    fromDate: '',
    toDate: '',
    days: '',
    comments: '',
    setInactive: true
  });

  // Course Management State
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [activeTab, setActiveTab] = useState<'course-setup' | 'add-students' | 'track-progress' | 'upload-files'>('course-setup');
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    status: 'draft' as 'active' | 'inactive' | 'draft',
    category: '',
    sections: [] as CourseSection[]
  });
  const [newSection, setNewSection] = useState({
    title: '',
    description: '',
    courseId: ''
  });
  const [newActivity, setNewActivity] = useState({
    title: '',
    type: 'lesson' as Activity['type'],
    description: '',
    sectionId: '',
    dueDate: '',
    points: 0
  });
  const [newResource, setNewResource] = useState({
    title: '',
    type: 'file' as Resource['type'],
    description: '',
    sectionId: '',
    url: ''
  });
  const [enrollmentMethod, setEnrollmentMethod] = useState('manual');
  
  // Selection State
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  // Modal States
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [showResourceForm, setShowResourceForm] = useState(false);

  // Load current user and their trainer/examiner data
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

    const fetchCourses = async () => {
      try {
        // Fetch real courses from database
        const response = await fetch('/api/courses');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setCourses(result.courses);
          } else {
            logger.error('Failed to fetch courses', { error: result.error });
          }
        } else {
          logger.error('Error fetching courses', { status: response.status });
        }
      } catch (error) {
        logger.error('Error loading courses', { 
          message: error instanceof Error ? error.message : String(error) 
        });
      }
    };

    const fetchStudents = async () => {
      try {
        // Fetch real students from database
        const response = await fetch('/api/students');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setStudents(result.students);
          } else {
            logger.error('Failed to fetch students', { error: result.error });
          }
        } else {
          logger.error('Error fetching students', { status: response.status });
        }
      } catch (error) {
        logger.error('Error loading students', { 
          message: error instanceof Error ? error.message : String(error) 
        });
      }
    };

    const fetchPilots = async () => {
      try {
        // Fetch all staff members from database
        const response = await fetch('/api/staff');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.staff) {
            // Transform staff data to match our Pilot interface
            const pilotData: Pilot[] = result.staff.map((staff: StaffMember) => ({
              id: staff._id || staff.id || Date.now().toString(),
              name: staff.name || 'Unknown Staff',
              jalId: staff.jalId || staff.pilot_id || 'N/A',
              email: staff.email,
              division: staff.division || staff.department,
              rating: staff.rank?.name || staff.rating
            }));
            setPilots(pilotData);
          } else {
            logger.error('Failed to fetch pilots', { error: result.error });
          }
        } else {
          logger.error('Error fetching pilots', { status: response.status });
        }
      } catch (error) {
        logger.error('Error loading pilots', { 
          message: error instanceof Error ? error.message : String(error) 
        });
      }
    };

    fetchCurrentUser();
    fetchCourses();
    fetchStudents();
    fetchPilots();
  }, [currentUser]);

  // Filter trainers and examiners to show only current user's records


  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create inactivation request for approval
      const inactivationRequest = {
        userId: formData.userId,
        userType: formData.userType,
        userName: formData.userName,
        userJalId: formData.userJalId,
        setInactive: formData.setInactive,
        inactivationPeriod: {
          from: formData.fromDate,
          to: formData.toDate,
          days: formData.days,
          comments: formData.comments
        },
        requestedBy: 'current_admin', // This should be the current admin's ID
        requestedAt: new Date().toISOString(),
        status: 'pending_approval'
      };

      // Log the request for administrator review
      logger.info('Inactivation request submitted', {
        request: inactivationRequest,
        action: 'inactivation_request_submitted'
      });

      // For now, we'll directly update the status (in a real system, this would go through approval workflow)
      const endpoint = formData.userType === 'trainer' ? `/api/trainers/${formData.userId}` : `/api/examiners/${formData.userId}`;
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          active: !formData.setInactive,
          inactivationPeriod: formData.setInactive ? {
            from: formData.fromDate,
            to: formData.toDate,
            days: formData.days,
            comments: formData.comments
          } : null,
          lastUpdatedBy: 'current_admin',
          lastUpdatedAt: new Date().toISOString()
        }),
      });

      const result = await response.json();

        if (result.success) {
        
        // Log the successful update
        logger.info(`User ${formData.setInactive ? 'deactivated' : 'activated'} successfully`, { 
          userId: formData.userId,
          userType: formData.userType,
          userName: formData.userName,
          newStatus: !formData.setInactive,
          inactivationPeriod: formData.setInactive ? {
            from: formData.fromDate,
            to: formData.toDate,
            days: formData.days,
            comments: formData.comments
          } : null,
          action: 'status_updated',
          updatedBy: 'current_admin'
        });
        
        onTrainerChange?.();
        setShowForm(false);
        alert(`User ${formData.setInactive ? 'deactivated' : 'activated'} successfully!`);
      } else {
        alert(result.error || 'Failed to update user status');
      }
    } catch (error) {
      logger.error('Error updating user status', { 
        message: error instanceof Error ? error.message : String(error),
        action: 'status_update_failed'
      });
      alert('Error updating user status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      userId: '',
      userType: 'trainer',
      userName: '',
      userJalId: '',
      fromDate: '',
      toDate: '',
      days: '',
      comments: '',
      setInactive: true
    });
  };

  // Course Management Functions

  const handleAddStudent = async (pilot: Pilot, courseId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: pilot.name,
          jalId: pilot.jalId,
          courseId: courseId,
          progress: 0,
          status: 'enrolled'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setStudents(prev => [result.student, ...prev]);
          
          logger.info('Student added', { studentId: result.student.id, name: result.student.name });
          alert('Student added successfully!');
        } else {
          throw new Error(result.error || 'Failed to add student');
        }
      } else {
        throw new Error('Failed to add student');
      }
    } catch (error) {
      logger.error('Error adding student', { 
        message: error instanceof Error ? error.message : String(error) 
      });
      alert('Error adding student. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  const InactivationForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={() => setShowForm(false)}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Set Inactivation</h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p className="text-gray-600 mb-6">
            Hi {formData.userName}, fill in the form to set your period of Inactivation. 
            With this tool, the Exam System will not assign exam to you until the time that you set end.
          </p>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* User Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">User Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">JAL ID#</label>
                  <input
                    type="text"
                    value={formData.userJalId}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.userName}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Staff Function</label>
                  <input
                    type="text"
                    value={formData.userType === 'trainer' ? 'TR-T01' : 'EX-T01'}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-600"
                  />
                </div>
              </div>
            </div>

            {/* Period of Inactivation */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Period of Inactivation</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                  <input
                    type="date"
                    value={formData.fromDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, fromDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                  <input
                    type="date"
                    value={formData.toDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, toDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Day(s)</label>
                  <input
                    type="number"
                    value={formData.days}
                    onChange={(e) => setFormData(prev => ({ ...prev, days: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter duration in days"
                  />
                </div>
              </div>
            </div>

            {/* Comments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
              <textarea
                value={formData.comments}
                onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                maxLength={64}
                placeholder="Enter comments (optional)"
              />
              <div className="text-xs text-gray-500 mt-1">
                {formData.comments.length} Typed Characters / from 64
              </div>
            </div>

            {/* Set Inactive Option */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Set Inactive</label>
              <div className="flex space-x-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="setInactive"
                    checked={formData.setInactive}
                    onChange={() => setFormData(prev => ({ ...prev, setInactive: true }))}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Yes</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="setInactive"
                    checked={!formData.setInactive}
                    onChange={() => setFormData(prev => ({ ...prev, setInactive: false }))}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">No</span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : 'Confirm'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors"
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );

  // Show only the current user's trainer/examiner record

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ color: '#6B46C1' }}>
          Training Staff Management
        </h2>
        <p className="text-gray-600">
          {currentUser ? `Welcome, ${currentUser.name}! Manage your trainer/examiner status and courses.` : 'Loading...'}
        </p>
      </div>

      {/* Training Staff Management Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ color: '#6B46C1' }}>
          Training Staff Management
        </h3>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg overflow-x-auto">
          <button
            onClick={() => setActiveTab('course-setup')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'course-setup' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Set up your course
          </button>
          <button
            onClick={() => setActiveTab('add-students')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'add-students' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Add students
          </button>
          <button
            onClick={() => setActiveTab('track-progress')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'track-progress' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Track progress
          </button>
          <button
            onClick={() => setActiveTab('upload-files')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'upload-files' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Upload files
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'course-setup' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-md font-medium text-gray-900">Your Courses</h4>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    // TODO: Implement bulk edit functionality
                    alert('Bulk edit functionality coming soon!');
                  }}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Bulk Edit
                </button>
                <button
                  onClick={() => {
                    setEditingCourse(null);
                    setNewCourse({ title: '', description: '', status: 'draft', category: '', sections: [] });
                    setShowCourseForm(true);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create New Course
                </button>
              </div>
            </div>
            
            <div className="grid gap-4">
              {courses.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
                  <p className="text-gray-500 mb-4">Create your first course to get started with training management.</p>
                  <button
                    onClick={() => {
                      setEditingCourse(null);
                      setNewCourse({ title: '', description: '', status: 'draft', category: '', sections: [] });
                      setShowCourseForm(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Your First Course
                  </button>
                </div>
              ) : (
                courses.map((course) => (
                <div key={course.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(course.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems(prev => [...prev, course.id]);
                          } else {
                            setSelectedItems(prev => prev.filter(id => id !== course.id));
                          }
                        }}
                        className="mt-1 w-4 h-4 text-blue-600"
                      />
                      <div>
                        <h5 className="font-medium text-gray-900">{course.title}</h5>
                        <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            course.status === 'active' ? 'bg-green-100 text-green-800' :
                            course.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {course.status}
                          </span>
                          <span className="text-sm text-gray-500">{course.students} students</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => {
                          setEditingCourse(course);
                          setNewCourse({
                            title: course.title,
                            description: course.description,
                            status: course.status,
                            category: course.category || '',
                            sections: course.sections || []
                          });
                          setShowCourseForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={async () => {
                          if (confirm(`Are you sure you want to delete "${course.title}"?`)) {
                            setIsLoading(true);
                            try {
                              const response = await fetch(`/api/courses/${course.id}`, {
                                method: 'DELETE',
                              });

                              const result = await response.json();
                              if (result.success) {
                                // Remove from local state
                                setCourses(prev => prev.filter(c => c.id !== course.id));
                                alert('Course deleted successfully!');
                              } else {
                                alert(result.error || 'Failed to delete course');
                              }
                            } catch (error) {
                              logger.error('Error deleting course', { 
                                message: error instanceof Error ? error.message : String(error) 
                              });
                              alert('Error deleting course. Please try again.');
                            } finally {
                              setIsLoading(false);
                            }
                          }
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                        disabled={isLoading}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'add-students' && (
          <div className="space-y-6">
            {/* Student Enrollment Options */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-md font-medium text-blue-900">Student Enrollment Options</h4>
                <button
                  onClick={() => {
                    // Save the enrollment method
                    alert(`Enrollment method saved: ${enrollmentMethod === 'manual' ? 'Teachers manually enroll students' : 'Students enroll themselves'}`);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  Save Settings
                </button>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <input 
                    type="radio" 
                    id="manual-enrollment" 
                    name="enrollment" 
                    value="manual"
                    checked={enrollmentMethod === 'manual'}
                    onChange={(e) => setEnrollmentMethod(e.target.value)}
                    className="text-blue-600" 
                  />
                  <label htmlFor="manual-enrollment" className="text-blue-800 cursor-pointer">Teachers manually enroll students</label>
                </div>
                <div className="flex items-center space-x-3">
                  <input 
                    type="radio" 
                    id="self-enrollment" 
                    name="enrollment" 
                    value="self"
                    checked={enrollmentMethod === 'self'}
                    onChange={(e) => setEnrollmentMethod(e.target.value)}
                    className="text-blue-600" 
                  />
                  <label htmlFor="self-enrollment" className="text-blue-800 cursor-pointer">Students enroll themselves</label>
                </div>
              </div>
            </div>

            {/* Course Selection for Student Management */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-4">
                <label className="text-sm font-medium text-gray-700">Select Course to Manage Students:</label>
                <select 
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  value={selectedCourse?.id || ''}
                  onChange={(e) => {
                    const course = courses.find(c => c.id === e.target.value);
                    setSelectedCourse(course || null);
                  }}
                >
                  <option value="">Choose a course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedCourse && (
              <>
                {/* Available Pilots for Selected Course */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Available Pilots for {selectedCourse.title}</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">JAL ID</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Division</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Rating</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pilots.filter(pilot => 
                          !students.some(student => 
                            student.jalId === pilot.jalId && student.courseId === selectedCourse.id
                          )
                        ).length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-gray-500">
                              <div className="flex flex-col items-center">
                                <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                </svg>
                                <p className="text-sm">No available pilots to enroll</p>
                                <p className="text-xs text-gray-400 mt-1">Add staff members to the system first</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          pilots.filter(pilot => 
                            !students.some(student => 
                              student.jalId === pilot.jalId && student.courseId === selectedCourse.id
                            )
                          ).map((pilot) => (
                            <tr key={pilot.id} className="border-b border-gray-100">
                              <td className="py-3 px-4 text-gray-900">{pilot.name}</td>
                              <td className="py-3 px-4 text-gray-600">{pilot.jalId}</td>
                              <td className="py-3 px-4 text-gray-600">{pilot.division || 'N/A'}</td>
                              <td className="py-3 px-4 text-gray-600">{pilot.rating || 'N/A'}</td>
                              <td className="py-3 px-4">
                                <button
                                  onClick={() => handleAddStudent(pilot, selectedCourse.id)}
                                  disabled={isLoading}
                                  className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                >
                                  Add to Course
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Current Students in Selected Course */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Current Students in {selectedCourse.title}</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">JAL ID</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Progress</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Enrolled Date</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.filter(student => student.courseId === selectedCourse.id).length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-gray-500">
                              <div className="flex flex-col items-center">
                                <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                </svg>
                                <p className="text-sm">No students enrolled yet</p>
                                <p className="text-xs text-gray-400 mt-1">Enroll pilots from the available pilots table above</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          students.filter(student => student.courseId === selectedCourse.id).map((student) => (
                            <tr key={student.id} className="border-b border-gray-100">
                              <td className="py-3 px-4 text-gray-900">{student.name}</td>
                              <td className="py-3 px-4 text-gray-600">{student.jalId}</td>
                              <td className="py-3 px-4">
                                <div className="flex items-center">
                                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                                    <div 
                                      className="bg-blue-600 h-2 rounded-full" 
                                      style={{ width: `${student.progress}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm text-gray-600">{student.progress}%</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  student.status === 'enrolled' ? 'bg-blue-100 text-blue-800' :
                                  student.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {student.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-gray-600">
                                {new Date(student.enrolledAt).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex space-x-2">
                                  <button 
                                    onClick={() => {
                                      // TODO: Implement detailed progress view
                                      alert(`Viewing detailed progress for ${student.name}`);
                                    }}
                                    className="text-blue-600 hover:text-blue-800 text-xs"
                                  >
                                    View Progress
                                  </button>
                                  <button 
                                    onClick={() => {
                                      // TODO: Implement remove student
                                      if (confirm(`Remove ${student.name} from ${selectedCourse.title}?`)) {
                                        alert(`Removed ${student.name} from course`);
                                      }
                                    }}
                                    className="text-red-600 hover:text-red-800 text-xs"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {!selectedCourse && (
              <div className="text-center py-8">
                <p className="text-gray-500">Please select a course to manage students.</p>
              </div>
            )}

          </div>
        )}


        {activeTab === 'track-progress' && (
          <div className="space-y-6">
            {/* Progress Overview */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Student Progress Overview</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-medium text-blue-900">Total Students</h5>
                  <p className="text-2xl font-bold text-blue-600">{students.length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h5 className="font-medium text-green-900">Completed</h5>
                  <p className="text-2xl font-bold text-green-600">
                    {students.filter(s => s.status === 'completed').length}
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h5 className="font-medium text-yellow-900">In Progress</h5>
                  <p className="text-2xl font-bold text-yellow-600">
                    {students.filter(s => s.status === 'enrolled').length}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Management Options */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">Progress Management</h4>
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-lg hover:bg-blue-50 transition-colors group">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-600 font-medium group-hover:text-blue-700">Grades</span>
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
                
                <button className="w-full text-left p-3 rounded-lg hover:bg-blue-50 transition-colors group">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-600 font-medium group-hover:text-blue-700">Competencies</span>
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
                
                <button className="w-full text-left p-3 rounded-lg hover:bg-blue-50 transition-colors group">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-600 font-medium group-hover:text-blue-700">Completion conditions</span>
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
                
                <button className="w-full text-left p-3 rounded-lg hover:bg-blue-50 transition-colors group">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-600 font-medium group-hover:text-blue-700">Course completion</span>
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
                
                <button className="w-full text-left p-3 rounded-lg hover:bg-blue-50 transition-colors group">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-600 font-medium group-hover:text-blue-700">Badges</span>
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
                
                <button className="w-full text-left p-3 rounded-lg hover:bg-blue-50 transition-colors group">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-600 font-medium group-hover:text-blue-700">Course reports</span>
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
                
                <button className="w-full text-left p-3 rounded-lg hover:bg-blue-50 transition-colors group">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-600 font-medium group-hover:text-blue-700">Analytics</span>
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>

            {/* Course Selection for Progress Tracking */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-4">
                <label className="text-sm font-medium text-gray-700">Select Course to Track Progress:</label>
                <select 
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  value={selectedCourse?.id || ''}
                  onChange={(e) => {
                    const course = courses.find(c => c.id === e.target.value);
                    setSelectedCourse(course || null);
                  }}
                >
                  <option value="">Choose a course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedCourse && (
              <>
                {/* Course Completion Status Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Course completion status</h4>
                  
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Status:</span>
                      <span className="text-sm italic text-gray-600">In progress</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-700 mb-3">All criteria below are required:</p>
                    
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="font-medium text-gray-900">Required criteria</div>
                          <div className="font-medium text-gray-900">Status</div>
                        </div>
                      </div>
                      <div className="px-4 py-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-gray-700">Activity completion</div>
                          <div className="text-gray-600">
                            {students.filter(s => s.courseId === selectedCourse.id).filter(s => s.status === 'completed').length} of {students.filter(s => s.courseId === selectedCourse.id).length}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    More details
                  </button>
                </div>

                {/* Detailed Progress Table */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-medium text-gray-900">Student Progress for {selectedCourse.title}</h4>
                    <div className="flex space-x-2">
                      <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
                        Export Report
                      </button>
                      <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors">
                        Generate Analytics
                      </button>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">First name / Last name</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Email address</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Activities</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Course</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.filter(student => student.courseId === selectedCourse.id).map((student) => (
                          <tr key={student.id} className="border-b border-gray-100">
                            <td className="py-3 px-4 text-gray-900">{student.name}</td>
                            <td className="py-3 px-4 text-gray-600">{student.jalId}@jal.com</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                {/* Activity completion checkboxes */}
                                <div className="flex items-center space-x-1">
                                  <input type="checkbox" className="w-4 h-4 text-blue-600" defaultChecked={student.progress > 0} />
                                  <span className="text-xs text-gray-600">Announcements</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <input type="checkbox" className="w-4 h-4 text-blue-600" defaultChecked={student.progress > 20} />
                                  <span className="text-xs text-gray-600">Assessment</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <input type="checkbox" className="w-4 h-4 text-blue-600" defaultChecked={student.progress > 40} />
                                  <span className="text-xs text-gray-600">Test</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <input type="checkbox" className="w-4 h-4 text-blue-600" defaultChecked={student.progress > 60} />
                                  <span className="text-xs text-gray-600">Links</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <input type="checkbox" className="w-4 h-4 text-blue-600" defaultChecked={student.progress > 80} />
                                  <span className="text-xs text-gray-600">Video</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <input type="checkbox" className="w-4 h-4 text-blue-600" defaultChecked={student.progress > 90} />
                                  <span className="text-xs text-gray-600">Discussion</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <input type="checkbox" className="w-4 h-4 text-blue-600" defaultChecked={student.progress > 95} />
                                  <span className="text-xs text-gray-600">Project</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <input type="checkbox" className="w-4 h-4 text-blue-600" defaultChecked={student.progress === 100} />
                                  <span className="text-xs text-gray-600">Journal</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <input type="checkbox" className="w-4 h-4 text-blue-600" defaultChecked={student.status === 'completed'} />
                                <span className="text-xs text-gray-600">Course complete</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {!selectedCourse && (
              <div className="text-center py-8">
                <p className="text-gray-500">Please select a course to track progress.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'upload-files' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-md font-medium text-gray-900">Course Materials</h4>
              <div className="flex items-center space-x-3">
                <label className="text-sm font-medium text-gray-700">Select Course:</label>
                <select 
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  value={selectedCourse?.id || ''}
                  onChange={(e) => {
                    const course = courses.find(c => c.id === e.target.value);
                    setSelectedCourse(course || null);
                  }}
                >
                  <option value="">Choose a course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {selectedCourse ? (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-medium text-blue-900">Selected Course: {selectedCourse.title}</h5>
                  <p className="text-sm text-blue-700 mt-1">{selectedCourse.description}</p>
                </div>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-gray-600 mb-2">Upload materials for <strong>{selectedCourse.title}</strong></p>
                  <p className="text-sm text-gray-500 mb-4">Supported formats: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, images</p>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Choose Files
                  </button>
                </div>
                
                {/* Uploaded Files List */}
                <div className="mt-6">
                  <h5 className="font-medium text-gray-900 mb-3">Uploaded Files</h5>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-500 text-sm">No files uploaded yet for this course.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-gray-600 mb-2">Please select a course to upload files</p>
                <p className="text-sm text-gray-500">Choose a course from the dropdown above to get started</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Inactivation Form Modal */}
      {showForm && <InactivationForm />}

      {/* Course Creation/Edit Modal */}
      {showCourseForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 backdrop-blur-sm bg-white/20 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 shadow-xl border border-gray-200 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingCourse ? 'Edit Course' : 'Create New Course'}
            </h3>
            
            <div className="space-y-6">
              {/* Basic Course Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Title
                  </label>
                  <input
                    type="text"
                    value={newCourse.title}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="Enter course title"
                  />
                </div>
                
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          value={newCourse.status}
                          onChange={(e) => setNewCourse(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' | 'draft' }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        >
                          <option value="draft">Draft</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category
                        </label>
                        <select
                          value={newCourse.category || ''}
                          onChange={(e) => setNewCourse(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        >
                          <option value="">Select Category</option>
                        </select>
                      </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  rows={3}
                  placeholder="Enter course description"
                />
              </div>

              {/* Course Sections */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-md font-medium text-gray-900">Course Sections</h4>
                  <button
                    onClick={() => {
                      const newSection: CourseSection = {
                        id: Date.now().toString(),
                        title: `Section ${newCourse.sections.length + 1}`,
                        description: '',
                        courseId: editingCourse?.id || '',
                        order: newCourse.sections.length,
                        activities: [],
                        resources: [],
                        createdAt: new Date().toISOString()
                      };
                      setNewCourse(prev => ({ ...prev, sections: [...prev.sections, newSection] }));
                    }}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                  >
                    Add Section
                  </button>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {newCourse.sections.map((section, index) => (
                    <div key={section.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium">
                              Section {index + 1}
                            </span>
                            <input
                              type="text"
                              value={section.title}
                              onChange={(e) => {
                                const updatedSections = [...newCourse.sections];
                                updatedSections[index].title = e.target.value;
                                setNewCourse(prev => ({ ...prev, sections: updatedSections }));
                              }}
                              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm text-black"
                              placeholder="Section title"
                            />
                          </div>
                          <textarea
                            value={section.description}
                            onChange={(e) => {
                              const updatedSections = [...newCourse.sections];
                              updatedSections[index].description = e.target.value;
                              setNewCourse(prev => ({ ...prev, sections: updatedSections }));
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-black"
                            rows={2}
                            placeholder="Section description"
                          />
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{section.activities.length} activities</span>
                            <span>{section.resources.length} resources</span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const updatedSections = newCourse.sections.filter((_, i) => i !== index);
                            setNewCourse(prev => ({ ...prev, sections: updatedSections }));
                          }}
                          className="text-red-600 hover:text-red-800 text-sm ml-2"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {newCourse.sections.length === 0 && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No sections added yet. Click &quot;Add Section&quot; to get started.
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowCourseForm(false);
                  setEditingCourse(null);
                    setNewCourse({ title: '', description: '', status: 'draft', category: '', sections: [] });
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setIsLoading(true);
                  try {
                    if (editingCourse) {
                      // Update existing course in database
                      const response = await fetch(`/api/courses/${editingCourse.id}`, {
                        method: 'PATCH',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          ...newCourse,
                          sections: newCourse.sections
                        }),
                      });

                      const result = await response.json();
                      if (result.success) {
                        // Update local state
                        setCourses(prev => prev.map(c => 
                          c.id === editingCourse.id 
                            ? { ...c, ...newCourse, sections: newCourse.sections }
                            : c
                        ));
                        alert('Course updated successfully!');
                      } else {
                        alert(result.error || 'Failed to update course');
                      }
                    } else {
                      // Create new course in database
                      const courseData = {
                        title: newCourse.title,
                        description: newCourse.description,
                        instructor: currentUser?.name || 'Current User',
                        status: newCourse.status,
                        category: newCourse.category,
                        sections: newCourse.sections
                      };

                      const response = await fetch('/api/courses', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(courseData),
                      });

                      const result = await response.json();
                      if (result.success) {
                        // Add to local state
                        setCourses(prev => [result.course, ...prev]);
                        alert('Course created successfully!');
                      } else {
                        alert(result.error || 'Failed to create course');
                      }
                    }
                    
                    setShowCourseForm(false);
                    setEditingCourse(null);
                    setNewCourse({ title: '', description: '', status: 'draft', category: '', sections: [] });
                  } catch (error) {
                    logger.error('Error saving course', { 
                      message: error instanceof Error ? error.message : String(error) 
                    });
                    alert('Error saving course. Please try again.');
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={!newCourse.title || isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Saving...' : editingCourse ? 'Update Course' : 'Create Course'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Add Section Modal */}
      {showSectionForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 backdrop-blur-sm bg-white/20 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Section</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section Title
                </label>
                <input
                  type="text"
                  value={newSection.title}
                  onChange={(e) => setNewSection(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Enter section title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newSection.description}
                  onChange={(e) => setNewSection(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  rows={3}
                  placeholder="Enter section description"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowSectionForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // TODO: Implement section creation
                  setShowSectionForm(false);
                  setNewSection({ title: '', description: '', courseId: '' });
                }}
                disabled={!newSection.title || isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Creating...' : 'Create Section'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Add Activity Modal */}
      {showActivityForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 backdrop-blur-sm bg-white/20 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Activity</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Activity Title
                </label>
                <input
                  type="text"
                  value={newActivity.title}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Enter activity title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Activity Type
                </label>
                <select
                  value={newActivity.type}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, type: e.target.value as Activity['type'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                >
                  <option value="lesson">Lesson</option>
                  <option value="assignment">Assignment</option>
                  <option value="quiz">Quiz</option>
                  <option value="discussion">Discussion</option>
                  <option value="workshop">Workshop</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newActivity.description}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  rows={3}
                  placeholder="Enter activity description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={newActivity.dueDate}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Points
                </label>
                <input
                  type="number"
                  value={newActivity.points}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Enter points"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowActivityForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // TODO: Implement activity creation
                  setShowActivityForm(false);
                  setNewActivity({ title: '', type: 'lesson', description: '', sectionId: '', dueDate: '', points: 0 });
                }}
                disabled={!newActivity.title || isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Creating...' : 'Create Activity'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Add Resource Modal */}
      {showResourceForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 backdrop-blur-sm bg-white/20 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Resource</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resource Title
                </label>
                <input
                  type="text"
                  value={newResource.title}
                  onChange={(e) => setNewResource(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Enter resource title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resource Type
                </label>
                <select
                  value={newResource.type}
                  onChange={(e) => setNewResource(prev => ({ ...prev, type: e.target.value as Resource['type'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                >
                  <option value="file">File</option>
                  <option value="link">Link</option>
                  <option value="video">Video</option>
                  <option value="document">Document</option>
                  <option value="presentation">Presentation</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newResource.description}
                  onChange={(e) => setNewResource(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  rows={3}
                  placeholder="Enter resource description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL/Path
                </label>
                <input
                  type="text"
                  value={newResource.url}
                  onChange={(e) => setNewResource(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Enter URL or file path"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowResourceForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // TODO: Implement resource creation
                  setShowResourceForm(false);
                  setNewResource({ title: '', type: 'file', description: '', sectionId: '', url: '' });
                }}
                disabled={!newResource.title || isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Creating...' : 'Create Resource'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

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
}
