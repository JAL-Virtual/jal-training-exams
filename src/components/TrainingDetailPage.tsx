'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import type { User } from '../types/common'; // type-only import

interface TrainingDetail {
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

interface TrainingDetailPageProps {
  trainingId: string;
}

export default function TrainingDetailPage({ trainingId }: TrainingDetailPageProps) {
  const [training, setTraining] = useState<TrainingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [_user, _setUser] = useState<User | null>(null);
  const router = useRouter();

  const fetchTrainingDetail = useCallback(async () => {
    try {
      const response = await fetch('/api/training-assignments');
      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      const foundTraining =
        data?.success && Array.isArray(data?.assignments)
          ? (data.assignments as TrainingDetail[]).find((a) => a.id === trainingId) ?? null
          : null;

      setTraining(foundTraining);
    } catch (error) {
      console.error('Error fetching training detail:', error);
    } finally {
      setLoading(false);
    }
  }, [trainingId]);

  useEffect(() => {
    fetchTrainingDetail();
  }, [fetchTrainingDetail]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const formatTime = (timeString: string | null) => {
    if (!timeString) return 'Not Started';
    return timeString.substring(0, 5); // HH:MM
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

  if (!training) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Training Not Found</h2>
          <p className="text-gray-600 mb-6">The requested training session could not be found.</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go Back
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
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
              <h2 className="text-2xl font-bold text-gray-900">Training Detail {training.id}</h2>
              <p className="text-gray-600">{training.topicName}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Go Back
            </motion.button>
          </div>
        </div>

        {/* Training Information */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Training Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Topic:</span>
                  <span className="font-medium">{training.topicName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pilot:</span>
                  <span className="font-medium">{training.pilotName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trainer:</span>
                  <span className="font-medium">{training.trainerName || 'Unassigned'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      training.status
                    )}`}
                  >
                    {training.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Schedule Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{formatDate(training.scheduledDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Scheduled Time:</span>
                  <span className="font-medium">{formatTime(training.scheduledTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Start Time:</span>
                  <span className="font-medium">{formatTime(training.startTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">End Time:</span>
                  <span className="font-medium">{formatTime(training.endTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">
                    {calculateDuration(training.startTime, training.endTime)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Rating and Comments */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Evaluation</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Rating:</span>
                <span
                  className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getRatingColor(
                    training.rating
                  )}`}
                >
                  {training.rating || 'Not Rated'}
                </span>
              </div>
              {training.comments && (
                <div>
                  <span className="text-gray-600 block mb-2">Comments:</span>
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <p className="text-gray-900">{training.comments}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Training ID:</span>
                <span className="font-mono text-sm">{training.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pilot ID:</span>
                <span className="font-mono text-sm">{training.pilotId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium">{formatDate(training.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
