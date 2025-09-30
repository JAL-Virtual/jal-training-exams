'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TrainingAssignment {
  id: string;
  studentId: string;
  studentName: string;
  topicId: string;
  topicName: string;
  assignedTrainerId?: string;
  assignedTrainerName?: string;
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  requestedDate: string;
  requestedTime: string;
  comments?: string;
  createdAt: string;
  updatedAt: string;
}

interface Trainer {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'busy';
  currentAssignments: number;
  maxAssignments: number;
}

export default function MyAssignments() {
  const [assignments, setAssignments] = useState<TrainingAssignment[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<TrainingAssignment | null>(null);

  useEffect(() => {
    fetchAssignments();
    fetchTrainers();
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = () => {
    if (typeof window === 'undefined') return;
    const storedUser = localStorage.getItem('jal_user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await fetch('/api/training-requests');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAssignments(data.assignments || []);
        }
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const fetchTrainers = async () => {
    try {
      const response = await fetch('/api/trainers');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTrainers(data.trainers || []);
        }
      }
    } catch (error) {
      console.error('Error fetching trainers:', error);
    } finally {
      setLoading(false);
    }
  };

  const autoAssignTrainer = async (assignmentId: string) => {
    try {
      const activeTrainers = trainers.filter(t => t.status === 'active' && t.currentAssignments < t.maxAssignments);
      if (activeTrainers.length === 0) {
        alert('No available trainers at the moment');
        return;
      }

      // Randomly select a trainer
      const randomTrainer = activeTrainers[Math.floor(Math.random() * activeTrainers.length)];
      
      const response = await fetch('/api/training-requests/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId,
          trainerId: randomTrainer.id,
          trainerName: randomTrainer.name
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert(`Assignment automatically assigned to ${randomTrainer.name}`);
          fetchAssignments();
          fetchTrainers();
        }
      }
    } catch (error) {
      console.error('Error auto-assigning trainer:', error);
      alert('Failed to assign trainer');
    }
  };

  const reassignTrainer = async (assignmentId: string, trainerId: string) => {
    try {
      const trainer = trainers.find(t => t.id === trainerId);
      if (!trainer) return;

      const response = await fetch('/api/training-requests/reassign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId,
          trainerId,
          trainerName: trainer.name
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert(`Assignment reassigned to ${trainer.name}`);
          fetchAssignments();
          fetchTrainers();
          setShowReassignModal(false);
        }
      }
    } catch (error) {
      console.error('Error reassigning trainer:', error);
      alert('Failed to reassign trainer');
    }
  };

  const pickupAssignment = async (assignmentId: string) => {
    if (!currentUser) {
      alert('User not found');
      return;
    }

    try {
      const response = await fetch('/api/training-requests/pickup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId,
          trainerId: currentUser.id,
          trainerName: currentUser.name
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert('Assignment picked up successfully');
          fetchAssignments();
          fetchTrainers();
        }
      }
    } catch (error) {
      console.error('Error picking up assignment:', error);
      alert('Failed to pickup assignment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending Assignment';
      case 'assigned': return 'Assigned';
      case 'in-progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">My Training Assignments</h2>
          <p className="text-gray-600">Manage training assignments and auto-assignment system</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-yellow-800 font-semibold">Pending</div>
            <div className="text-2xl font-bold text-yellow-900">
              {assignments.filter(a => a.status === 'pending').length}
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-blue-800 font-semibold">Assigned</div>
            <div className="text-2xl font-bold text-blue-900">
              {assignments.filter(a => a.status === 'assigned').length}
            </div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-purple-800 font-semibold">In Progress</div>
            <div className="text-2xl font-bold text-purple-900">
              {assignments.filter(a => a.status === 'in-progress').length}
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-green-800 font-semibold">Completed</div>
            <div className="text-2xl font-bold text-green-900">
              {assignments.filter(a => a.status === 'completed').length}
            </div>
          </div>
        </div>

        {/* Assignments Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Topic
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Trainer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requested Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assignments.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{assignment.studentName}</div>
                      <div className="text-sm text-gray-500">ID: {assignment.studentId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{assignment.topicName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {assignment.assignedTrainerName || 'Not Assigned'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(assignment.status)}`}>
                      {getStatusText(assignment.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(assignment.requestedDate).toLocaleDateString()} at {assignment.requestedTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {assignment.status === 'pending' && (
                      <button
                        onClick={() => autoAssignTrainer(assignment.id)}
                        className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition-colors"
                      >
                        Auto Assign
                      </button>
                    )}
                    {assignment.status === 'assigned' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedAssignment(assignment);
                            setShowReassignModal(true);
                          }}
                          className="text-orange-600 hover:text-orange-900 bg-orange-50 hover:bg-orange-100 px-3 py-1 rounded-md transition-colors"
                        >
                          Reassign
                        </button>
                        <button
                          onClick={() => pickupAssignment(assignment.id)}
                          className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md transition-colors"
                        >
                          Pickup
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {assignments.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-500 text-lg">No training assignments found</div>
            <div className="text-gray-400 text-sm mt-2">Training requests will appear here once submitted</div>
          </div>
        )}
      </motion.div>

      {/* Reassign Modal */}
      {showReassignModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Reassign Training</h3>
            <p className="text-gray-600 mb-4">
              Reassign "{selectedAssignment.topicName}" for {selectedAssignment.studentName} to a different trainer.
            </p>
            
            <div className="space-y-2 mb-4">
              {trainers.filter(t => t.status === 'active').map((trainer) => (
                <button
                  key={trainer.id}
                  onClick={() => reassignTrainer(selectedAssignment.id, trainer.id)}
                  className="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium">{trainer.name}</div>
                  <div className="text-sm text-gray-500">
                    {trainer.currentAssignments}/{trainer.maxAssignments} assignments
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowReassignModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
