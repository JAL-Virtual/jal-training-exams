'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ExamRequestData {
  id: string;
  studentId: string;
  studentName?: string;
  requestedDate: string;
  requestedTime: string;
  status: string;
  assignedExaminerId?: string;
  assignedExaminerName?: string;
  result?: 'pass' | 'fail' | null;
  score?: number | null;
  comments?: string;
  startTime?: string | null;
  endTime?: string | null;
  createdAt: string;
}

interface FinishedExam {
  id: string;
  studentId: string;
  studentName: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  assignedExaminer: string;
  examinerName: string;
  result: 'pass' | 'fail' | null;
  score: number | null;
  comments: string;
  startTime: string | null;
  endTime: string | null;
  createdAt: string;
}

export default function FinishedExam() {
  const [exams, setExams] = useState<FinishedExam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
    fetchFinishedExams();
  }, []);

  const fetchUserData = () => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('jal_user');
      if (storedUser) {
        try {
          // User data parsing if needed
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    }
  };

  const fetchFinishedExams = async () => {
    try {
      const response = await fetch('/api/exam-requests');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Filter only completed exams
          const finishedExams = data.examRequests
            .filter((exam: ExamRequestData) => exam.status === 'completed')
            .map((exam: ExamRequestData) => ({
              id: exam.id,
              studentId: exam.studentId,
              studentName: exam.studentName || `Student ${exam.studentId}`,
              scheduledDate: exam.requestedDate,
              scheduledTime: exam.requestedTime,
              status: exam.status,
              assignedExaminer: exam.assignedExaminerId || '',
              examinerName: exam.assignedExaminerName || 'Unknown Examiner',
              result: exam.result || null,
              score: exam.score || null,
              comments: exam.comments || '',
              startTime: exam.startTime || null,
              endTime: exam.endTime || null,
              createdAt: exam.createdAt
            }));
          setExams(finishedExams);
        }
      }
    } catch (error) {
      console.error('Error fetching finished exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const getResultColor = (result: string | null) => {
    switch (result) {
      case 'pass':
        return 'bg-green-100 text-green-800';
      case 'fail':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getResultIcon = (result: string | null) => {
    switch (result) {
      case 'pass':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'fail':
        return (
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // Format as HH:MM
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-lg"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Finished Exams</h2>
              <p className="text-gray-600">View completed examinations with results</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Total: {exams.length} exams
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Passed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {exams.filter(exam => exam.result === 'pass').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {exams.filter(exam => exam.result === 'fail').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pass Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {exams.length > 0 
                      ? Math.round((exams.filter(exam => exam.result === 'pass').length / exams.length) * 100)
                      : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Exams List */}
        <div className="p-6">
          {exams.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No finished exams</h3>
              <p className="mt-1 text-sm text-gray-500">No completed examinations found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {exams.map((exam, index) => (
                <motion.div
                  key={exam.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {getResultIcon(exam.result)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{exam.studentName}</h3>
                        <p className="text-sm text-gray-600">Student ID: {exam.studentId}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getResultColor(exam.result)}`}>
                        {exam.result ? exam.result.toUpperCase() : 'PENDING'}
                      </span>
                      {exam.score !== null && (
                        <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                          Score: {exam.score}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Exam Date</p>
                      <p className="text-sm text-gray-900">{formatDate(exam.scheduledDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Exam Time</p>
                      <p className="text-sm text-gray-900">{formatTime(exam.scheduledTime)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Examiner</p>
                      <p className="text-sm text-gray-900">{exam.examinerName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Duration</p>
                      <p className="text-sm text-gray-900">
                        {exam.startTime && exam.endTime 
                          ? `${Math.round((new Date(exam.endTime).getTime() - new Date(exam.startTime).getTime()) / (1000 * 60))} min`
                          : 'N/A'
                        }
                      </p>
                    </div>
                  </div>

                  {exam.comments && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-1">Examiner Comments</p>
                      <p className="text-sm text-gray-600">{exam.comments}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
