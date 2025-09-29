'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { logger } from '@/lib/logger';

interface Trainer {
  id: string;
  jalId: string;
  name: string;
  active: boolean;
  createdAt: string;
}

interface Examiner {
  id: string;
  jalId: string;
  name: string;
  active: boolean;
  createdAt: string;
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

interface SetInactiveActiveProps {
  onTrainerChange?: () => void;
}

export default function SetInactiveActive({ onTrainerChange }: SetInactiveActiveProps) {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [examiners, setExaminers] = useState<Examiner[]>([]);
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

  // Load current user and their trainer/examiner data
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const apiKey = localStorage.getItem('jal_api_key');
        if (!apiKey) return;

        // Fetch pilot data from JAL API using the logged-in user's API key
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ apiKey }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.ok && result.user) {
            setCurrentUser({ 
              name: result.user.name || 'Unknown Pilot', 
              role: result.user.role || 'Pilot' 
            });
          }
        }

        // Fallback: Get current user's role and info from staff API
        const roleResponse = await fetch(`/api/staff/role?apiKey=${encodeURIComponent(apiKey)}`);
        if (roleResponse.ok) {
          const roleResult = await roleResponse.json();
          if (roleResult.success) {
            setCurrentUser(prev => ({ 
              name: prev?.name || roleResult.name, 
              role: prev?.role || roleResult.role 
            }));
          }
        }
      } catch (error) {
        logger.error('Error loading current user', { 
          message: error instanceof Error ? error.message : String(error) 
        });
      }
    };

    const fetchTrainers = async () => {
      try {
        const response = await fetch('/api/trainers');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setTrainers(result.trainers);
          }
        }
      } catch (error) {
        logger.error('Error loading trainers', { 
          message: error instanceof Error ? error.message : String(error) 
        });
      }
    };

    const fetchExaminers = async () => {
      try {
        const response = await fetch('/api/examiners');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setExaminers(result.examiners);
          }
        }
      } catch (error) {
        logger.error('Error loading examiners', { 
          message: error instanceof Error ? error.message : String(error) 
        });
      }
    };

    fetchCurrentUser();
    fetchTrainers();
    fetchExaminers();
  }, []);

  // Show only the current user's trainer/examiner record
  const currentUserTrainer = currentUser && currentUser.name ? trainers.find(trainer => trainer.name === currentUser.name) : null;
  const currentUserExaminer = currentUser && currentUser.name ? examiners.find(examiner => examiner.name === currentUser.name) : null;

  const openInactivationForm = (user: {id: string, name: string, jalId: string, type: 'trainer' | 'examiner'}) => {
    setFormData({
      userId: user.id,
      userType: user.type,
      userName: user.name,
      userJalId: user.jalId,
      fromDate: '',
      toDate: '',
      days: '',
      comments: '',
      setInactive: true
    });
    setShowForm(true);
  };

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
        fromDate: formData.fromDate,
        toDate: formData.toDate,
        days: formData.days,
        comments: formData.comments,
        setInactive: formData.setInactive,
        status: 'pending',
        requestedAt: new Date().toISOString(),
        requestedBy: currentUser?.name || 'Unknown'
      };

      // Save the inactivation request to database
      const requestResponse = await fetch('/api/inactivation-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inactivationRequest),
      });

      if (requestResponse.ok) {
        const requestResult = await requestResponse.json();
        if (requestResult.success) {
          // Log the inactivation request
          logger.info('Inactivation request submitted', { 
            ...inactivationRequest 
          });

          // Show success message
          alert('Inactivation request submitted successfully! It will be reviewed by an administrator.');

          // Call the callback to refresh counts
          if (onTrainerChange) {
            onTrainerChange();
          }

          // Close form
          setShowForm(false);
          resetForm();
        } else {
          throw new Error(requestResult.error || 'Failed to submit request');
        }
      } else {
        throw new Error('Failed to submit inactivation request');
      }
    } catch (error) {
      logger.error('Error updating user status', { 
        message: error instanceof Error ? error.message : String(error) 
      });
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

  const InactivationForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Set Inactive / Set Active</h3>
          <button
            onClick={() => setShowForm(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* User Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">User Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.userName}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">JAL ID</label>
                <input
                  type="text"
                  value={formData.userJalId}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Date Range */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Date Range</h4>
            <div className="grid grid-cols-3 gap-4">
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
              {isLoading ? 'Processing...' : 'Submit for Approval'}
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
      </motion.div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ color: '#6B46C1' }}>
          Set Inactive / Set Active
        </h2>
        <p className="text-gray-600">
          {currentUser ? `Welcome, ${currentUser.name}! Manage your trainer and examiner status.` : 'Loading...'}
        </p>
      </div>

      {/* Status Display */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ color: '#6B46C1' }}>
          Your Status
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Trainer Status */}
          {currentUserTrainer && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                Your Trainer Status
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">JAL ID:</span>
                  <span className="text-sm font-medium text-gray-900">{currentUserTrainer.jalId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Name:</span>
                  <span className="text-sm font-medium text-gray-900">{currentUserTrainer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    currentUserTrainer.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {currentUserTrainer.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Added:</span>
                  <span className="text-sm text-gray-600">{new Date(currentUserTrainer.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => openInactivationForm({
                      id: currentUserTrainer.id,
                      name: currentUserTrainer.name,
                      jalId: currentUserTrainer.jalId,
                      type: 'trainer'
                    })}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Set Inactive / Active
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Examiner Status */}
          {currentUserExaminer && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Your Examiner Status
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">JAL ID:</span>
                  <span className="text-sm font-medium text-gray-900">{currentUserExaminer.jalId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Name:</span>
                  <span className="text-sm font-medium text-gray-900">{currentUserExaminer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    currentUserExaminer.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {currentUserExaminer.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Added:</span>
                  <span className="text-sm text-gray-600">{new Date(currentUserExaminer.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => openInactivationForm({
                      id: currentUserExaminer.id,
                      name: currentUserExaminer.name,
                      jalId: currentUserExaminer.jalId,
                      type: 'examiner'
                    })}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Set Inactive / Active
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {!currentUserTrainer && !currentUserExaminer && (
          <div className="text-center py-8">
            <p className="text-gray-500">No trainer or examiner records found for your account.</p>
          </div>
        )}
      </div>

      {/* Inactivation Form Modal */}
      {showForm && <InactivationForm />}
    </div>
  );
}
