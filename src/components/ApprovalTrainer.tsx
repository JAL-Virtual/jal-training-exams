'use client';

import React, { useState, useEffect } from 'react';

interface Trainer {
  id: string;
  jalId: string;
  name: string;
  active: boolean;
  createdAt: string;
}

interface ApprovalTrainerProps {
  showAddForm?: boolean;
}

export default function ApprovalTrainer({ showAddForm = true }: ApprovalTrainerProps) {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    jalId: '',
    name: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch trainers on component mount
  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/trainers');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTrainers(data.trainers);
        } else {
          console.error('API returned success: false', data.error);
        }
      } else {
        console.error('Response not ok:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching trainers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/trainers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Reset form and refresh trainers list
          setFormData({ jalId: '', name: '' });
          setShowForm(false);
          fetchTrainers();
        }
      }
    } catch (error) {
      console.error('Error adding trainer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTrainerStatus = async (trainerId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/trainers/${trainerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: !currentStatus }),
      });

      if (response.ok) {
        fetchTrainers(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating trainer status:', error);
    }
  };

  const deleteTrainer = async (trainerId: string) => {
    if (!confirm('Are you sure you want to delete this trainer?')) {
      return;
    }

    try {
      const response = await fetch(`/api/trainers/${trainerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchTrainers(); // Refresh the list
      }
    } catch (error) {
      console.error('Error deleting trainer:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header - Only show for Management Department */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Approval Trainer</h2>
              <p className="text-gray-600 mt-1">Manage approved trainers for Japan Airlines Virtual</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>{showForm ? 'Cancel' : 'Add Trainer'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Add Trainer Form */}
      {showAddForm && showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Trainer</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="jalId" className="block text-sm font-medium text-gray-700 mb-1">
                  JAL ID
                </label>
                <input
                  type="text"
                  id="jalId"
                  name="jalId"
                  value={formData.jalId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter JAL ID"
                  required
                />
              </div>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter full name"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Adding...' : 'Add Trainer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Trainers List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">LIST OF APPROVED JAPAN AIRLINE VIRTUAL TRAINERS</h3>
        </div>
        
        {isLoading ? (
          <div className="p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading trainers...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">JAL ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                  {showAddForm && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {trainers.length === 0 ? (
                        <tr>
                          <td colSpan={showAddForm ? 5 : 4} className="px-6 py-4 text-center text-gray-500">
                      {showAddForm 
                        ? 'No trainers found. Add your first trainer using the "Add Trainer" button above.'
                        : 'No trainers found. Contact an administrator to add trainers.'
                      }
                    </td>
                  </tr>
                ) : (
                  trainers.map((trainer, index) => (
                        <tr key={trainer.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                            {trainer.jalId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {trainer.name}
                          </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {showAddForm ? (
                          <button
                            onClick={() => toggleTrainerStatus(trainer.id, trainer.active)}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              trainer.active
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            {trainer.active ? 'Active' : 'Inactive'}
                          </button>
                        ) : (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            trainer.active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {trainer.active ? 'Active' : 'Inactive'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {showAddForm && (
                          <button
                            onClick={() => deleteTrainer(trainer.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
