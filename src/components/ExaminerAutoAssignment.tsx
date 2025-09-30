'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ExamRequest {
  id: string;
  studentId: string;
  studentName: string;
  requestedDate: string;
  requestedTime: string;
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  assignedExaminerId?: string;
  assignedExaminerName?: string;
  comments?: string;
  createdAt: string;
  updatedAt: string;
}

interface Examiner {
  id: string;
  jalId: string;
  name: string;
  active: boolean;
  createdAt: string;
  currentAssignments?: number;
  maxAssignments?: number;
  specialties?: string[];
}

export default function ExaminerAutoAssignment() {
  const [examRequests, setExamRequests] = useState<ExamRequest[]>([]);
  const [examiners, setExaminers] = useState<Examiner[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoAssigning, setAutoAssigning] = useState(false);

  useEffect(() => {
    fetchExamRequests();
    fetchExaminers();
  }, []);

  const fetchExamRequests = async () => {
    try {
      const response = await fetch('/api/test-submissions');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setExamRequests(data.examRequests || []);
        }
      }
    } catch (error) {
      console.error('Error fetching exam requests:', error);
    }
  };

  const fetchExaminers = async () => {
    try {
      console.log('Fetching examiners from API...');
      const response = await fetch('/api/examiners');
      console.log('Examiners API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Examiners API response data:', data);
        
        if (data.success) {
          const examinersData = data.examiners || [];
          console.log('Setting examiners:', examinersData);
          setExaminers(examinersData);
        } else {
          console.error('API returned success: false', data);
          setExaminers([]);
        }
      } else {
        console.error('API request failed with status:', response.status);
        setExaminers([]);
      }
    } catch (error) {
      console.error('Error fetching examiners:', error);
      setExaminers([]);
    } finally {
      setLoading(false);
    }
  };

  const autoAssignExaminers = async () => {
    setAutoAssigning(true);
    try {
      // Fetch fresh examiner data from API
      const examinersResponse = await fetch('/api/examiners');
      const examinersData = await examinersResponse.json();
      
      if (!examinersResponse.ok || !examinersData.success) {
        alert('Failed to fetch examiner data');
        return;
      }

      const freshExaminers = examinersData.examiners || [];
      const pendingRequests = examRequests.filter(req => req.status === 'pending');
      
      // Filter only active examiners with available capacity from fresh data
      const activeExaminers = freshExaminers.filter(examiner => 
        examiner.active === true && 
        (examiner.currentAssignments || 0) < (examiner.maxAssignments || 5)
      );

      console.log('Auto-assignment sync check:', {
        totalExaminers: freshExaminers.length,
        activeExaminers: activeExaminers.length,
        pendingRequests: pendingRequests.length,
        examiners: freshExaminers.map(e => ({ id: e.id, name: e.name, status: e.status, assignments: e.currentAssignments }))
      });

      if (pendingRequests.length === 0) {
        alert('No pending exam requests to assign');
        return;
      }

      if (activeExaminers.length === 0) {
        alert('No active examiners available for assignment. Please check examiner status and capacity.');
        return;
      }

      // Round-robin assignment among active examiners only
      let examinerIndex = 0;
      const assignments = [];

      for (const request of pendingRequests) {
        const examiner = activeExaminers[examinerIndex % activeExaminers.length];
        
        assignments.push({
          requestId: request.id,
          examinerId: examiner.id,
          examinerName: examiner.name
        });

        examinerIndex++;
      }

      // Update assignments via API
      for (const assignment of assignments) {
        await fetch('/api/test-submissions/assign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requestId: assignment.requestId,
            examinerId: assignment.examinerId,
            examinerName: assignment.examinerName
          })
        });
      }

      // Refresh data to show updated assignments
      await fetchExamRequests();
      await fetchExaminers();
      
      alert(`Successfully assigned ${assignments.length} exam requests to active examiners`);
    } catch (error) {
      console.error('Error auto-assigning examiners:', error);
      alert('Error occurred during auto-assignment');
    } finally {
      setAutoAssigning(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      assigned: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const pendingRequests = examRequests.filter(req => req.status === 'pending');
  const activeExaminers = examiners.filter(examiner => examiner.active === true);
  const availableExaminers = examiners.filter(examiner => 
    examiner.active === true && (examiner.currentAssignments || 0) < (examiner.maxAssignments || 5)
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Examiner Auto-Assignment</h2>
              <p className="text-gray-600">Automatically assign available examiners to pending exam requests</p>
            </div>
            <motion.button
              onClick={autoAssignExaminers}
              disabled={autoAssigning || pendingRequests.length === 0 || availableExaminers.length === 0}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                autoAssigning || pendingRequests.length === 0 || availableExaminers.length === 0
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {autoAssigning ? 'Assigning...' : `Auto-Assign (${pendingRequests.length} pending)`}
            </motion.button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-gray-900">{pendingRequests.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Examiners</p>
                <p className="text-2xl font-bold text-gray-900">{activeExaminers.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available for Assignment</p>
                <p className="text-2xl font-bold text-gray-900">{availableExaminers.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Exam Requests */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Exam Requests</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {examRequests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h4 className="font-medium text-gray-900">{request.studentName}</h4>
                        <p className="text-sm text-gray-600">ID: {request.studentId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Date: {request.requestedDate}</p>
                        <p className="text-sm text-gray-600">Time: {request.requestedTime}</p>
                      </div>
                      {request.comments && (
                        <div>
                          <p className="text-sm text-gray-600">{request.comments}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                    {request.assignedExaminerName && (
                      <span className="text-sm text-gray-600">
                        Assigned to: {request.assignedExaminerName}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Available Examiners */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Active Examiners</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeExaminers.map((examiner) => (
                <motion.div
                  key={examiner.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{examiner.name}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${examiner.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {examiner.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>JAL ID: {examiner.jalId}</p>
                    <p>Assignments: {examiner.currentAssignments || 0}/{examiner.maxAssignments || 5}</p>
                    {examiner.specialties && (
                      <p>Specialties: {examiner.specialties.join(', ')}</p>
                    )}
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${((examiner.currentAssignments || 0) / (examiner.maxAssignments || 5)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
