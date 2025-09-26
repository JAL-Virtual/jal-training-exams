'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface StaffMember {
  id: string;
  apiKey: string;
  role: string;
  name?: string;
  email?: string;
  addedDate: string;
}

export default function ManageStaff() {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [newStaff, setNewStaff] = useState({
    apiKey: '',
    role: '',
    name: '',
    email: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load staff members from localStorage on component mount
  useEffect(() => {
    const savedStaff = localStorage.getItem('jal_staff_members');
    if (savedStaff) {
      try {
        setStaffMembers(JSON.parse(savedStaff));
      } catch (error) {
        console.error('Error loading staff members:', error);
      }
    }
  }, []);

  // Save staff members to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('jal_staff_members', JSON.stringify(staffMembers));
  }, [staffMembers]);

  const handleAddStaff = async () => {
    if (!newStaff.apiKey || !newStaff.role) {
      alert('Please fill in API Key and Role');
      return;
    }

    setIsLoading(true);
    
    try {
      // Verify the API key by making a request to the JAL Virtual API
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: newStaff.apiKey }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.ok && result.user) {
          const staffMember: StaffMember = {
            id: Date.now().toString(),
            apiKey: newStaff.apiKey,
            role: newStaff.role,
            name: result.user.name || newStaff.name || 'Unknown',
            email: result.user.email || newStaff.email || '',
            addedDate: new Date().toISOString()
          };

          setStaffMembers(prev => [...prev, staffMember]);
          setNewStaff({ apiKey: '', role: '', name: '', email: '' });
          setIsAddingStaff(false);
          alert('Staff member added successfully!');
        } else {
          alert('Invalid API key. Please check and try again.');
        }
      } else {
        alert('Failed to verify API key. Please check and try again.');
      }
    } catch (error) {
      console.error('Error adding staff member:', error);
      alert('Error adding staff member. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveStaff = (id: string) => {
    if (confirm('Are you sure you want to remove this staff member?')) {
      setStaffMembers(prev => prev.filter(staff => staff.id !== id));
    }
  };

  const roleOptions = [
    'Examiner',
    'Trainer'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Manage Staff</h2>
            <p className="text-gray-600 mt-1">Add and manage staff members with API keys and roles</p>
          </div>
          <button
            onClick={() => setIsAddingStaff(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Staff Member
          </button>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
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
                setNewStaff({ apiKey: '', role: '', name: '', email: '' });
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
            <p className="text-sm">Click "Add Staff Member" to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">API Key</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Added Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffMembers.map((staff) => (
                  <tr key={staff.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">{staff.name}</td>
                    <td className="py-3 px-4 text-gray-600">{staff.email}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {staff.role}
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
    </div>
  );
}
