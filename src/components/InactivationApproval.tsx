'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { logger } from '@/lib/logger';

interface InactivationRequest {
  id: string;
  userId: string;
  userType: 'trainer' | 'examiner';
  userName: string;
  userJalId: string;
  setInactive: boolean;
  inactivationPeriod: {
    from: string;
    to: string;
    days: string;
    comments: string;
  };
  requestedBy: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'denied';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewComments?: string;
}

interface InactivationApprovalProps {
  onApprovalChange?: () => void;
}

export default function InactivationApproval({ onApprovalChange }: InactivationApprovalProps) {
  const [requests, setRequests] = useState<InactivationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<InactivationRequest | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewComments, setReviewComments] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'deny'>('approve');

  // Load pending inactivation requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        // For now, we'll simulate some pending requests
        // In a real system, this would fetch from an API endpoint
        const mockRequests: InactivationRequest[] = [
          {
            id: '1',
            userId: 'trainer_123',
            userType: 'trainer',
            userName: 'John Smith',
            userJalId: 'JAL001',
            setInactive: true,
            inactivationPeriod: {
              from: '2024-01-15',
              to: '2024-02-15',
              days: '30',
              comments: 'Vacation period - will be unavailable for training assignments'
            },
            requestedBy: 'john.smith@jal.com',
            requestedAt: '2024-01-10T10:00:00Z',
            status: 'pending'
          },
          {
            id: '2',
            userId: 'examiner_456',
            userType: 'examiner',
            userName: 'Jane Doe',
            userJalId: 'JAL002',
            setInactive: false,
            inactivationPeriod: {
              from: '',
              to: '',
              days: '',
              comments: 'Ready to resume examination duties'
            },
            requestedBy: 'jane.doe@jal.com',
            requestedAt: '2024-01-12T14:30:00Z',
            status: 'pending'
          }
        ];
        setRequests(mockRequests);
      } catch (error) {
        logger.error('Error loading inactivation requests', { 
          message: error instanceof Error ? error.message : String(error) 
        });
      }
    };

    fetchRequests();
  }, []);

  const handleReview = (request: InactivationRequest, action: 'approve' | 'deny') => {
    setSelectedRequest(request);
    setActionType(action);
    setReviewComments('');
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    if (!selectedRequest) return;

    setIsLoading(true);
    try {
      // Update the request status
      const updatedRequest: InactivationRequest = {
        ...selectedRequest,
        status: (actionType === 'approve' ? 'approved' : 'denied') as 'approved' | 'denied',
        reviewedBy: 'current_admin', // This should be the actual admin ID
        reviewedAt: new Date().toISOString(),
        reviewComments: reviewComments
      };

      // Update the user's active status if approved
      if (actionType === 'approve') {
        const endpoint = selectedRequest.userType === 'trainer' 
          ? `/api/trainers/${selectedRequest.userId}` 
          : `/api/examiners/${selectedRequest.userId}`;
        
        const response = await fetch(endpoint, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            active: !selectedRequest.setInactive,
            inactivationPeriod: selectedRequest.setInactive ? selectedRequest.inactivationPeriod : null,
            lastUpdatedBy: 'current_admin',
            lastUpdatedAt: new Date().toISOString()
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update user status');
        }
      }

      // TODO: Send notification to the user
      // await sendNotification(selectedRequest, actionType, reviewComments);

      // Update the requests list
      setRequests(prev => prev.map(req => 
        req.id === selectedRequest.id ? updatedRequest : req
      ));

      // Log the approval/denial
      logger.info(`Inactivation request ${actionType}d`, {
        requestId: selectedRequest.id,
        userId: selectedRequest.userId,
        userType: selectedRequest.userType,
        userName: selectedRequest.userName,
        action: actionType,
        reviewComments: reviewComments,
        reviewedBy: 'current_admin'
      });

      onApprovalChange?.();
      setShowReviewModal(false);
      setSelectedRequest(null);
    } catch (error) {
      logger.error('Error reviewing inactivation request', { 
        message: error instanceof Error ? error.message : String(error) 
      });
      alert('Error processing request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const ReviewModal = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={() => setShowReviewModal(false)}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {actionType === 'approve' ? 'Approve' : 'Deny'} Inactivation Request
            </h2>
            <button
              onClick={() => setShowReviewModal(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {selectedRequest && (
            <div className="space-y-6">
              {/* Request Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Request Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                    <p className="text-gray-900">{selectedRequest.userName} ({selectedRequest.userJalId})</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <p className="text-gray-900 capitalize">{selectedRequest.userType}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                    <p className="text-gray-900">
                      {selectedRequest.setInactive ? 'Set Inactive' : 'Set Active'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Requested</label>
                    <p className="text-gray-900">
                      {new Date(selectedRequest.requestedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {selectedRequest.inactivationPeriod.from && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Inactivation Period</label>
                    <p className="text-gray-900">
                      {selectedRequest.inactivationPeriod.from} to {selectedRequest.inactivationPeriod.to}
                      {selectedRequest.inactivationPeriod.days && ` (${selectedRequest.inactivationPeriod.days} days)`}
                    </p>
                  </div>
                )}
                
                {selectedRequest.inactivationPeriod.comments && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
                    <p className="text-gray-900">{selectedRequest.inactivationPeriod.comments}</p>
                  </div>
                )}
              </div>

              {/* Review Comments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Review Comments {actionType === 'deny' && '(Required)'}
                </label>
                <textarea
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder={`Enter comments for ${actionType === 'approve' ? 'approval' : 'denial'}...`}
                  required={actionType === 'deny'}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <button
                  onClick={submitReview}
                  disabled={isLoading || (actionType === 'deny' && !reviewComments.trim())}
                  className={`flex-1 px-6 py-2 rounded-md text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    actionType === 'approve' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {isLoading ? 'Processing...' : `${actionType === 'approve' ? 'Approve' : 'Deny'} Request`}
                </button>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );

  const pendingRequests = requests.filter(req => req.status === 'pending');
  const processedRequests = requests.filter(req => req.status !== 'pending');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Inactivation Request Approval</h2>
            <p className="text-gray-600 mt-1">Review and approve/deny trainer and examiner inactivation requests</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              <span className="font-medium text-orange-600">{pendingRequests.length}</span> Pending
            </div>
            <div className="text-sm text-gray-500">
              <span className="font-medium text-gray-600">{processedRequests.length}</span> Processed
            </div>
          </div>
        </div>
      </div>

      {/* Pending Requests */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Pending Requests ({pendingRequests.length})
        </h3>
        {pendingRequests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No pending requests found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Action</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Period</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Requested</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.map((request) => (
                  <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{request.userName}</div>
                        <div className="text-sm text-gray-500">{request.userJalId}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        request.userType === 'trainer' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {request.userType}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        request.setInactive 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {request.setInactive ? 'Set Inactive' : 'Set Active'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {request.inactivationPeriod.from ? (
                        <div>
                          <div>{request.inactivationPeriod.from} to {request.inactivationPeriod.to}</div>
                          {request.inactivationPeriod.days && (
                            <div className="text-xs text-gray-500">({request.inactivationPeriod.days} days)</div>
                          )}
                        </div>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {new Date(request.requestedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleReview(request, 'approve')}
                          className="text-green-600 hover:text-green-800 text-sm font-medium"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReview(request, 'deny')}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Deny
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Processed Requests */}
      {processedRequests.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Processed Requests ({processedRequests.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Action</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Reviewed</th>
                </tr>
              </thead>
              <tbody>
                {processedRequests.map((request) => (
                  <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{request.userName}</div>
                        <div className="text-sm text-gray-500">{request.userJalId}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        request.userType === 'trainer' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {request.userType}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        request.setInactive 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {request.setInactive ? 'Set Inactive' : 'Set Active'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        request.status === 'approved' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {request.reviewedAt ? new Date(request.reviewedAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && <ReviewModal />}
    </div>
  );
}
