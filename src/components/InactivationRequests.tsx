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
  fromDate: string;
  toDate: string;
  days: string;
  comments: string;
  setInactive: boolean;
  status: 'pending' | 'approved' | 'denied';
  requestedAt: string;
  requestedBy: string;
  processedAt?: string;
  processedBy?: string;
  adminComments?: string;
}

interface InactivationRequestsProps {
  onRequestProcessed?: () => void;
}

export default function InactivationRequests({ onRequestProcessed }: InactivationRequestsProps) {
  const [requests, setRequests] = useState<InactivationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<InactivationRequest | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [adminComments, setAdminComments] = useState('');
  const [action, setAction] = useState<'approve' | 'deny'>('approve');

  // Load inactivation requests
  useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true);
      try {
        // Fetch real inactivation requests from database
        const response = await fetch('/api/inactivation-requests');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setRequests(result.requests);
          } else {
            logger.error('Failed to fetch inactivation requests', { error: result.error });
          }
        } else {
          logger.error('Error fetching inactivation requests', { status: response.status });
        }
      } catch (error) {
        logger.error('Error loading inactivation requests', { 
          message: error instanceof Error ? error.message : String(error) 
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleApproveDeny = async (requestId: string, action: 'approve' | 'deny') => {
    setIsLoading(true);
    try {
      const request = requests.find(r => r.id === requestId);
      if (!request) return;

      // Update request status in database
      const updateResponse = await fetch('/api/inactivation-requests', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: requestId,
          status: action === 'approve' ? 'approved' : 'denied',
          adminComments: adminComments,
          processedBy: 'Admin User' // In real implementation, get from current user
        }),
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update request status');
      }

      // Update local state
      setRequests(prev => prev.map(r => r.id === requestId ? {
        ...r,
        status: action === 'approve' ? 'approved' : 'denied',
        processedAt: new Date().toISOString(),
        processedBy: 'Admin User',
        adminComments: adminComments
      } : r));

      // If approved, update the user's active status
      if (action === 'approve') {
        const endpoint = request.userType === 'trainer' ? `/api/trainers/${request.userId}` : `/api/examiners/${request.userId}`;
        const response = await fetch(endpoint, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            active: !request.setInactive
          }),
        });

        if (response.ok) {
          logger.info('User status updated after approval', { 
            userId: request.userId,
            userType: request.userType,
            newStatus: !request.setInactive ? 'active' : 'inactive'
          });
        }
      }

      // Log the admin action
      logger.info('Inactivation request processed', { 
        requestId,
        action,
        adminComments,
        processedBy: 'Admin User'
      });

      // Close modal and reset
      setShowApprovalModal(false);
      setSelectedRequest(null);
      setAdminComments('');
      setAction('approve');

      // Call callback to refresh data
      if (onRequestProcessed) {
        onRequestProcessed();
      }
    } catch (error) {
      logger.error('Error processing inactivation request', { 
        message: error instanceof Error ? error.message : String(error) 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openApprovalModal = (request: InactivationRequest, action: 'approve' | 'deny') => {
    setSelectedRequest(request);
    setAction(action);
    setAdminComments('');
    setShowApprovalModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'denied': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'approved': return '✅';
      case 'denied': return '❌';
      default: return '❓';
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ color: '#6B46C1' }}>
          Inactivation Requests
        </h2>
        <p className="text-gray-600">
          Review and manage trainer/examiner inactivation requests
        </p>
      </div>

      {/* Pending Requests */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ color: '#6B46C1' }}>
          Pending Requests ({pendingRequests.length})
        </h3>
        
        {pendingRequests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No pending requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)} {request.status.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500">
                        {request.userType === 'trainer' ? '👨‍✈️' : '👩‍✈️'} {request.userType.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Name:</span>
                        <span className="ml-2 text-sm text-gray-900">{request.userName}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">JAL ID:</span>
                        <span className="ml-2 text-sm text-gray-900">{request.userJalId}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">From:</span>
                        <span className="ml-2 text-sm text-gray-900">{new Date(request.fromDate).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">To:</span>
                        <span className="ml-2 text-sm text-gray-900">{new Date(request.toDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-700">Comments:</span>
                      <p className="mt-1 text-sm text-gray-600 bg-gray-50 p-2 rounded">{request.comments}</p>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      Requested by {request.requestedBy} on {new Date(request.requestedAt).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => openApprovalModal(request, 'approve')}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => openApprovalModal(request, 'deny')}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      Deny
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Processed Requests */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ color: '#6B46C1' }}>
          Processed Requests ({processedRequests.length})
        </h3>
        
        {processedRequests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No processed requests</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Period</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Processed</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Admin Comments</th>
                </tr>
              </thead>
              <tbody>
                {processedRequests.map((request) => (
                  <tr key={request.id} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{request.userName}</div>
                        <div className="text-sm text-gray-500">{request.userJalId}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{request.userType}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(request.fromDate).toLocaleDateString()} - {new Date(request.toDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)} {request.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      <div className="text-sm">
                        <div>{request.processedBy}</div>
                        <div className="text-xs text-gray-500">
                          {request.processedAt ? new Date(request.processedAt).toLocaleString() : 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {request.adminComments || 'No comments'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Approval/Denial Modal */}
      {showApprovalModal && selectedRequest && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {action === 'approve' ? 'Approve' : 'Deny'} Request
            </h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>{selectedRequest.userName}</strong> ({selectedRequest.userJalId}) - {selectedRequest.userType}
              </p>
              <p className="text-sm text-gray-600">
                Request: {selectedRequest.setInactive ? 'Set Inactive' : 'Set Active'} from {new Date(selectedRequest.fromDate).toLocaleDateString()} to {new Date(selectedRequest.toDate).toLocaleDateString()}
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Comments
              </label>
              <textarea
                value={adminComments}
                onChange={(e) => setAdminComments(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Enter comments (optional)"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApproveDeny(selectedRequest.id, action)}
                disabled={isLoading}
                className={`px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  action === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isLoading ? 'Processing...' : (action === 'approve' ? 'Approve' : 'Deny')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
