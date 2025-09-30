'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
// import { User } from '../types/common';

interface FinishedTraining {
  id: string;
  pilotId: string;
  pilotName: string;
  topicId: string;
  topicName: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  assignedTrainer: string;
  trainerName: string;
  rating: string | null;
  comments: string;
  startTime: string | null;
  endTime: string | null;
  createdAt: string;
}

export default function FinishedTraining() {
  const [trainings, setTrainings] = useState<FinishedTraining[]>([]);
  const [loading, setLoading] = useState(true);
  // const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchUserData();
    fetchFinishedTrainings();
  }, []);

  const fetchUserData = () => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('jal_user');
      if (storedUser) {
        try {
        // setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    }
  };

  const fetchFinishedTrainings = async () => {
    try {
      const response = await fetch('/api/training-assignments');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Filter only completed trainings
          const completedTrainings = data.assignments.filter(
            (assignment: FinishedTraining) => assignment.status === 'completed'
          );
          setTrainings(completedTrainings);
        }
      }
    } catch (error) {
      console.error('Error fetching finished trainings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (trainingId: string) => {
    router.push(`/dashboard/training-detail/${trainingId}`);
  };

  const getRatingColor = (rating: string | null) => {
    if (!rating) return 'bg-gray-100 text-gray-800';
    
    switch (rating.toLowerCase()) {
      case 'excellent':
        return 'bg-green-100 text-green-800';
      case 'good':
        return 'bg-blue-100 text-blue-800';
      case 'satisfactory':
        return 'bg-yellow-100 text-yellow-800';
      case 'needs improvement':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return 'N/A';
    return timeString.substring(0, 5); // Format as HH:MM
  };

  const calculateDuration = (startTime: string | null, endTime: string | null) => {
    if (!startTime || !endTime) return 'N/A';
    
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHours}h ${diffMinutes}m`;
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
        className="bg-white rounded-lg shadow-lg"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Finished Training</h2>
              <p className="text-gray-600">View completed training sessions</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Completed</p>
              <p className="text-2xl font-bold text-green-600">{trainings.length}</p>
            </div>
          </div>
        </div>

        {/* Trainings Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nr
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Person
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start / End
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trainer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trainings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No completed training sessions found
                  </td>
                </tr>
              ) : (
                trainings.map((training, index) => (
                  <tr key={training.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleViewDetails(training.id)}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        {index + 1}
                      </motion.button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{training.pilotName}</div>
                      <div className="text-sm text-gray-500">{training.topicName}</div>
                      <div className="text-xs text-gray-400">{formatDate(training.scheduledDate)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRatingColor(training.rating)}`}>
                        {training.rating || 'Not Rated'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Completed
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>Start: {formatTime(training.startTime)}</div>
                        <div>End: {formatTime(training.endTime)}</div>
                        <div className="text-xs text-gray-500">
                          Duration: {calculateDuration(training.startTime, training.endTime)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{training.trainerName || 'Unassigned'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleViewDetails(training.id)}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        View Details
                      </motion.button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Statistics */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">Total Completed</p>
              <p className="text-xl font-bold text-gray-900">{trainings.length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Excellent Ratings</p>
              <p className="text-xl font-bold text-green-600">
                {trainings.filter(t => t.rating?.toLowerCase() === 'excellent').length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Good Ratings</p>
              <p className="text-xl font-bold text-blue-600">
                {trainings.filter(t => t.rating?.toLowerCase() === 'good').length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Average Duration</p>
              <p className="text-xl font-bold text-purple-600">
                {trainings.length > 0 ? 
                  Math.round(
                    trainings.reduce((acc, t) => {
                      const duration = calculateDuration(t.startTime, t.endTime);
                      const hours = parseInt(duration.split('h')[0]) || 0;
                      return acc + hours;
                    }, 0) / trainings.length
                  ) + 'h' : '0h'
                }
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
