'use client';

import React, { useState, useEffect } from 'react';
import { logger } from '../lib/logger';
import { TestToken } from '../types/common';

interface Section {
  id: string;
  title: string;
  content: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  sections: Section[];
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

const IssueTestToken: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [tokens, setTokens] = useState<TestToken[]>([]); // Replace token state
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [issuedToken, setIssuedToken] = useState<TestToken | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [coursesResponse, studentsResponse, tokensResponse] = await Promise.all([
        fetch('/api/courses'),
        fetch('/api/students'),
        fetch('/api/test-tokens'),
      ]);

      const coursesResult = await coursesResponse.json();
      const studentsResult = await studentsResponse.json();
      const tokensResult = await tokensResponse.json();

      if (coursesResult.success) {
        setCourses(coursesResult.courses);
      }

      if (studentsResult.success) {
        setStudents(studentsResult.students);
      }

      if (tokensResult.success) {
        setTokens(tokensResult.testTokens || []); // Update this line
      }
    } catch (error) {
      logger.error('Error loading data for Issue Test Token', {
        message: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateToken = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const issueToken = async () => {
    if (!selectedCourse || !selectedStudent) {
      alert('Please select both a course and a student');
      return;
    }

    try {
      const course = courses.find(c => c.id === selectedCourse);
      const student = students.find(s => s.id === selectedStudent);
      
      if (!course || !student) {
        alert('Course or student not found');
        return;
      }

      const token = generateToken();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

      const newToken: TestToken = {
          id: Date.now().toString(),
          value: token,
          token: token, // Add this line
          status: 'active',
          expiresAt: expiresAt.toISOString(),
          issuedAt: new Date().toISOString(),
          courseTitle: course.title,
          studentName: student.name,
          courseId: course.id,
          studentId: student.id
      };

      const response = await fetch('/api/test-tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newToken),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setIssuedToken(newToken);
          setShowIssueForm(false);
          setSelectedCourse('');
          setSelectedStudent('');
          fetchData(); // Refresh the tokens list
        } else {
          alert('Failed to issue token: ' + result.error);
        }
      } else {
        alert('Failed to issue token');
      }
    } catch (error) {
      logger.error('Error issuing test token', {
        message: error instanceof Error ? error.message : String(error),
      });
      alert('Error issuing token');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const isTokenExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const getTokenStatusColor = (token: TestToken) => {
    if (token.status === 'used') return 'text-green-600 bg-green-50';
    if (token.status === 'expired' || isTokenExpired(token.expiresAt)) return 'text-red-600 bg-red-50';
    return 'text-blue-600 bg-blue-50';
  };

  const getTokenStatusText = (token: TestToken) => {
    if (token.status === 'used') return 'Used';
    if (token.status === 'expired' || isTokenExpired(token.expiresAt)) return 'Expired';
    return 'Active';
  };

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
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Issue Test Token</h2>
            <p className="text-gray-600">Generate test tokens for students to take course examinations</p>
          </div>
          <button
            onClick={() => setShowIssueForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Issue New Token
          </button>
        </div>
      </div>

      {/* Issue Token Form Modal */}
      {showIssueForm && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Issue Test Token</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Course
                </label>
                <select
                  value={selectedCourse}
                  onChange={(e) => {
                    setSelectedCourse(e.target.value);
                    setSelectedStudent(''); // Clear student selection when course changes
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                >
                  <option value="">Choose a course...</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Student
                </label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  disabled={!selectedCourse}
                >
                  <option value="">Choose a student...</option>
                  {selectedCourse ? 
                    (() => {
                      const enrolledStudents = students.filter(student => student.courseId === selectedCourse);
                      if (enrolledStudents.length === 0) {
                        return <option value="" disabled>No students enrolled in this course</option>;
                      }
                      return enrolledStudents.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.name} ({student.jalId})
                        </option>
                      ));
                    })() :
                    <option value="" disabled>Please select a course first</option>
                  }
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowIssueForm(false);
                  setSelectedCourse('');
                  setSelectedStudent('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={issueToken}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Issue Token
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Issued Token Display */}
      {issuedToken && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-green-800 mb-2">Token Issued Successfully!</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Token:</strong> <span className="font-mono text-lg">{issuedToken.token}</span></p>
            <p><strong>Course:</strong> {issuedToken.courseTitle}</p>
            <p><strong>Student:</strong> {issuedToken.studentName}</p>
            <p><strong>Expires:</strong> {formatDate(issuedToken.expiresAt)}</p>
          </div>
          <button
            onClick={() => setIssuedToken(null)}
            className="mt-3 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
          >
            Close
          </button>
        </div>
      )}

      {/* Active Tokens List */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Test Tokens</h3>
        
        {tokens.length === 0 ? ( // Update token to tokens
          <div className="text-center py-8 text-gray-500">
            <p>No test tokens have been issued yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Token
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issued
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expires
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tokens.map((token) => (
                  <tr key={token.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm font-medium text-gray-900">
                        {token.token}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {token.courseTitle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {token.studentName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(token.issuedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(token.expiresAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTokenStatusColor(token)}`}>
                        {getTokenStatusText(token)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default IssueTestToken;
