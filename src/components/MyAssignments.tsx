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
  const [currentUser, setCurrentUser] = useState<{id: string, name: string} | null>(null);
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
          // Transform the data to match our interface - show all requests for now
          const allRequests = data.requests || [];
          const userAssignments = allRequests
            .map((request: {id: string, pilotId: string, pilotName: string, topicId: string, topicName: string, assignedTrainerId?: string, assignedTrainer?: string, status: string, requestedDate: string, requestedTime: string, comments?: string, createdAt: string}) => ({
              id: request.id,
              studentId: request.pilotId,
              studentName: request.pilotName,
              topicId: request.topicId,
              topicName: request.topicName,
              assignedTrainerId: request.assignedTrainerId,
              assignedTrainerName: request.assignedTrainer,
              status: request.status,
              requestedDate: request.requestedDate,
              requestedTime: request.requestedTime,
              comments: request.comments,
              createdAt: request.createdAt,
              updatedAt: request.createdAt
            }));
          setAssignments(userAssignments);
        }
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
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
        <div className="text-white dark:text-white">Loading assignments...</div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 ml-4"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
      >
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white dark:text-white mb-2">Training Assignments by JAL {currentUser?.id || 'User'}</h2>
              <p className="text-white dark:text-white">Manage training assignments and auto-assignment system for {currentUser?.name || 'Current User'}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={fetchAssignments}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>


        {/* Assignments Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white dark:text-white uppercase tracking-wider">
                  Nr.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white dark:text-white uppercase tracking-wider">
                  Person
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white dark:text-white uppercase tracking-wider">
                  Function
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white dark:text-white uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white dark:text-white uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white dark:text-white uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white dark:text-white uppercase tracking-wider">
                  View
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {assignments.map((assignment, index) => (
                <tr key={assignment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white dark:text-white">{index + 1}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-white dark:text-white">{assignment.studentName}</div>
                      <div className="text-sm text-white dark:text-white">JAL ID: {assignment.studentId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white dark:text-white">TR-T01</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white dark:text-white">-</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white dark:text-white">{assignment.topicName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(assignment.status)}`}>
                      {getStatusText(assignment.status)}
                    </span>
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

        {/* Total Count */}
        {assignments.length > 0 && (
          <div className="text-center py-4">
            <div className="text-white dark:text-white text-lg">Total of Trainings {assignments.length}</div>
          </div>
        )}

        {assignments.length === 0 && (
          <div className="text-center py-8">
            <div className="text-white dark:text-white text-lg">Total of Trainings 0</div>
            <div className="text-white dark:text-white text-sm mt-2">Training requests will appear here once submitted</div>
          </div>
        )}
      </motion.div>

      {/* Reassign Modal */}
      {showReassignModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-white dark:text-white">Reassign Training</h3>
            <p className="text-white dark:text-white mb-4">
              Reassign &quot;{selectedAssignment.topicName}&quot; for {selectedAssignment.studentName} to a different trainer.
            </p>
            
            <div className="space-y-2 mb-4">
              {trainers.filter(t => t.status === 'active').map((trainer) => (
                <button
                  key={trainer.id}
                  onClick={() => reassignTrainer(selectedAssignment.id, trainer.id)}
                  className="w-full text-left p-3 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="font-medium text-white dark:text-white">{trainer.name}</div>
                  <div className="text-sm text-white dark:text-white">
                    {trainer.currentAssignments}/{trainer.maxAssignments} assignments
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowReassignModal(false)}
                className="px-4 py-2 text-white dark:text-white hover:text-gray-200 dark:hover:text-gray-300 transition-colors"
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
