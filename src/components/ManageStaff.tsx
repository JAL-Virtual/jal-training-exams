'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { StaffMember } from '@/types/staff';

interface ManageStaffProps {
  onTrainerChange?: () => void;
}

export default function ManageStaff({ onTrainerChange }: ManageStaffProps) {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [trainers, setTrainers] = useState<{
    id: string;
    jalId: string;
    name: string;
    active: boolean;
    createdAt: string;
  }[]>([]);
  const [examiners, setExaminers] = useState<{
    id: string;
    jalId: string;
    name: string;
    active: boolean;
    createdAt: string;
  }[]>([]);
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [isAddingTrainer, setIsAddingTrainer] = useState(false);
  const [isAddingExaminer, setIsAddingExaminer] = useState(false);
  const [newStaff, setNewStaff] = useState({
    apiKey: '',
    role: '',
    name: ''
  });
  const [newTrainer, setNewTrainer] = useState({
    jalId: '',
    name: ''
  });
  const [newExaminer, setNewExaminer] = useState({
    jalId: '',
    name: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load staff members and trainers from API on component mount
  useEffect(() => {
    const fetchStaffMembers = async () => {
      try {
        const response = await fetch('/api/staff');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setStaffMembers(result.staff);
          }
        }
      } catch (error) {
        console.error('Error loading staff members:', error);
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
        console.error('Error loading trainers:', error);
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
        console.error('Error loading examiners:', error);
      }
    };

    fetchStaffMembers();
    fetchTrainers();
    fetchExaminers();
  }, []);

  const handleAddStaff = async () => {
    if (!newStaff.apiKey || !newStaff.role) {
      alert('Please fill in API Key and Role');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newStaff),
      });

      const result = await response.json();

      if (result.success) {
        setStaffMembers(prev => [...prev, result.staff]);
        setNewStaff({ apiKey: '', role: '', name: '' });
        setIsAddingStaff(false);
        alert('Staff member added successfully!');
      } else {
        alert(result.error || 'Failed to add staff member');
      }
    } catch (error) {
      console.error('Error adding staff member:', error);
      alert('Error adding staff member. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTrainer = async () => {
    if (!newTrainer.jalId || !newTrainer.name) {
      alert('Please fill in JAL ID and Name');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/trainers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTrainer),
      });

      const result = await response.json();

      if (result.success) {
        setNewTrainer({ jalId: '', name: '' });
        setIsAddingTrainer(false);
        alert('Trainer added successfully!');
        // Refresh trainers list
        const trainersResponse = await fetch('/api/trainers');
        if (trainersResponse.ok) {
          const trainersResult = await trainersResponse.json();
          if (trainersResult.success) {
            setTrainers(trainersResult.trainers);
            // Notify parent component to refresh trainer count
            onTrainerChange?.();
          }
        }
      } else {
        alert(result.error || 'Failed to add trainer');
      }
    } catch (error) {
      console.error('Error adding trainer:', error);
      alert('Error adding trainer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExaminer = async () => {
    if (!newExaminer.jalId || !newExaminer.name) {
      alert('Please fill in JAL ID and Name');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/examiners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newExaminer),
      });

      const result = await response.json();

      if (result.success) {
        setNewExaminer({ jalId: '', name: '' });
        setIsAddingExaminer(false);
        alert('Examiner added successfully!');
        // Refresh examiners list
        const examinersResponse = await fetch('/api/examiners');
        if (examinersResponse.ok) {
          const examinersResult = await examinersResponse.json();
          if (examinersResult.success) {
            setExaminers(examinersResult.examiners);
            // Notify parent component to refresh examiner count
            onTrainerChange?.();
          }
        }
      } else {
        alert(result.error || 'Failed to add examiner');
      }
    } catch (error) {
      console.error('Error adding examiner:', error);
      alert('Error adding examiner. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveStaff = async (id: string) => {
    if (confirm('Are you sure you want to remove this staff member?')) {
      try {
        const response = await fetch(`/api/staff?id=${id}`, {
          method: 'DELETE',
        });

        const result = await response.json();

        if (result.success) {
          setStaffMembers(prev => prev.filter(staff => staff.id !== id));
          alert('Staff member removed successfully!');
        } else {
          alert(result.error || 'Failed to remove staff member');
        }
      } catch (error) {
        console.error('Error removing staff member:', error);
        alert('Error removing staff member. Please try again.');
      }
    }
  };

  const handleDeleteTrainer = async (id: string) => {
    if (confirm('Are you sure you want to delete this trainer?')) {
      try {
        const response = await fetch(`/api/trainers/${id}`, {
          method: 'DELETE',
        });

        const result = await response.json();

        if (result.success) {
          setTrainers(prev => prev.filter(trainer => trainer.id !== id));
          alert('Trainer deleted successfully!');
          // Notify parent component to refresh trainer count
          onTrainerChange?.();
        } else {
          alert(result.error || 'Failed to delete trainer');
        }
      } catch (error) {
        console.error('Error deleting trainer:', error);
        alert('Error deleting trainer. Please try again.');
      }
    }
  };

  const handleDeleteExaminer = async (id: string) => {
    if (confirm('Are you sure you want to delete this examiner?')) {
      try {
        const response = await fetch(`/api/examiners/${id}`, {
          method: 'DELETE',
        });

        const result = await response.json();

        if (result.success) {
          setExaminers(prev => prev.filter(examiner => examiner.id !== id));
          alert('Examiner deleted successfully!');
          // Notify parent component to refresh examiner count
          onTrainerChange?.();
        } else {
          alert(result.error || 'Failed to delete examiner');
        }
      } catch (error) {
        console.error('Error deleting examiner:', error);
        alert('Error deleting examiner. Please try again.');
      }
    }
  };

  // Unused functions - commented out for ESLint cleanup
  /*
  const handleToggleTrainerStatus = async (id: string, currentStatus: boolean) => {
    // Implementation here
  };

  const handleToggleExaminerStatus = async (id: string, currentStatus: boolean) => {
    // Implementation here
  };
  */

  const roleOptions = [
    { value: 'Trainer', label: 'Trainer', description: 'Can manage training sessions' },
    { value: 'Examiner', label: 'Examiner', description: 'Can manage examinations' },
    { value: 'Admin', label: 'Admin', description: 'Full system access' }
  ];


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Manage Staff, Trainers & Examiners</h2>
            <p className="text-gray-600 mt-1">Add and manage staff members, trainers, and examiners</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setIsAddingExaminer(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Add Examiner
            </button>
            <button
              onClick={() => setIsAddingTrainer(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Add Trainer
            </button>
            <button
              onClick={() => setIsAddingStaff(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Staff Member
            </button>
          </div>
        </div>
      </div>

      {/* Add Staff Form */}
      {isAddingStaff && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Staff Member</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key *
              </label>
              <input
                type="text"
                value={newStaff.apiKey}
                onChange={(e) => setNewStaff(prev => ({ ...prev, apiKey: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="Enter JAL Virtual API key"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role *
              </label>
              <select
                value={newStaff.role}
                onChange={(e) => setNewStaff(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              >
                <option value="">Select a role</option>
                {roleOptions.map(role => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name (Optional)
              </label>
              <input
                type="text"
                value={newStaff.name}
                onChange={(e) => setNewStaff(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="Staff member name"
              />
            </div>
          </div>
          <div className="flex space-x-3 mt-6">
            <button
              onClick={handleAddStaff}
              disabled={isLoading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Adding...' : 'Add Staff Member'}
            </button>
            <button
              onClick={() => {
                setIsAddingStaff(false);
                setNewStaff({ apiKey: '', role: '', name: '' });
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Add Trainer Form */}
      {isAddingTrainer && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Trainer</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                JAL ID *
              </label>
              <input
                type="text"
                value={newTrainer.jalId}
                onChange={(e) => setNewTrainer(prev => ({ ...prev, jalId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black"
                placeholder="Enter JAL ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={newTrainer.name}
                onChange={(e) => setNewTrainer(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black"
                placeholder="Enter full name"
              />
            </div>
          </div>
          <div className="flex space-x-3 mt-6">
            <button
              onClick={handleAddTrainer}
              disabled={isLoading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Adding...' : 'Add Trainer'}
            </button>
            <button
              onClick={() => {
                setIsAddingTrainer(false);
                setNewTrainer({ jalId: '', name: '' });
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Add Examiner Form */}
      {isAddingExaminer && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Examiner</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                JAL ID *
              </label>
              <input
                type="text"
                value={newExaminer.jalId}
                onChange={(e) => setNewExaminer(prev => ({ ...prev, jalId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black"
                placeholder="Enter JAL ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={newExaminer.name}
                onChange={(e) => setNewExaminer(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black"
                placeholder="Enter full name"
              />
            </div>
          </div>
          <div className="flex space-x-3 mt-6">
            <button
              onClick={handleAddExaminer}
              disabled={isLoading}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Adding...' : 'Add Examiner'}
            </button>
            <button
              onClick={() => {
                setIsAddingExaminer(false);
                setNewExaminer({ jalId: '', name: '' });
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Staff Members List */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Staff Members ({staffMembers.length})</h3>
        {staffMembers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No staff members added yet.</p>
            <p className="text-sm">Click &quot;Add Staff Member&quot; to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">API Key</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Added Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffMembers.map((staff) => (
                  <tr key={staff.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">{staff.name}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        staff.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                        staff.role === 'Trainer' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {staff.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        staff.status === 'active' ? 'bg-green-100 text-green-800' :
                        staff.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {staff.status || 'active'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 font-mono text-sm">
                      {staff.apiKey.substring(0, 8)}...
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {new Date(staff.addedDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleRemoveStaff(staff.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Trainer Members List */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Trainer Members ({trainers.length})</h3>
        {trainers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No trainers added yet.</p>
            <p className="text-sm">Click &quot;Add Trainer&quot; to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">#</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">JAL ID</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Added Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {trainers.map((trainer, index) => (
                  <tr key={trainer.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">{index + 1}</td>
                    <td className="py-3 px-4 text-blue-600 font-medium">{trainer.jalId}</td>
                    <td className="py-3 px-4 text-gray-900">{trainer.name}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        trainer.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {trainer.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {new Date(trainer.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDeleteTrainer(trainer.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Examiner Members List */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Examiner Members ({examiners.length})</h3>
        {examiners.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No examiners added yet.</p>
            <p className="text-sm">Click &quot;Add Examiner&quot; to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">#</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">JAL ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Added Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {examiners.map((examiner, index) => (
                  <tr key={examiner.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">{index + 1}</td>
                    <td className="py-3 px-4 text-purple-600 font-medium">{examiner.jalId}</td>
                    <td className="py-3 px-4 text-gray-900">{examiner.name}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        examiner.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {examiner.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {new Date(examiner.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDeleteExaminer(examiner.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
