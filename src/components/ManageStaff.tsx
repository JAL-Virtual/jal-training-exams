'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { StaffMember } from '@/types/staff';

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
  const [isEditingStaff, setIsEditingStaff] = useState<string | null>(null);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  // Load staff members from API on component mount
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

    fetchStaffMembers();
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
        setNewStaff({ apiKey: '', role: '', name: '', email: '' });
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

  const roleOptions = [
    { value: 'Trainer', label: 'Trainer', description: 'Can manage training sessions' },
    { value: 'Examiner', label: 'Examiner', description: 'Can manage examinations' },
    { value: 'Admin', label: 'Admin', description: 'Full system access' }
  ];

  const handleEditStaff = (staff: StaffMember) => {
    setEditingStaff(staff);
    setIsEditingStaff(staff.id);
  };

  const handleUpdateStaff = async () => {
    if (!editingStaff) return;

    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/staff?id=${editingStaff.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: editingStaff.role,
          name: editingStaff.name,
          email: editingStaff.email,
          status: editingStaff.status
        }),
      });

      const result = await response.json();

      if (result.success) {
        setStaffMembers(prev => prev.map(staff => 
          staff.id === editingStaff.id ? result.staff : staff
        ));
        setIsEditingStaff(null);
        setEditingStaff(null);
        alert('Staff member updated successfully!');
      } else {
        alert(result.error || 'Failed to update staff member');
      }
    } catch (error) {
      console.error('Error updating staff member:', error);
      alert('Error updating staff member. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeRole = async (staffId: string, newRole: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/staff/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ staffId, newRole }),
      });

      const result = await response.json();

      if (result.success) {
        setStaffMembers(prev => prev.map(staff => 
          staff.id === staffId ? result.staff : staff
        ));
        alert(result.message);
      } else {
        alert(result.error || 'Failed to update staff role');
      }
    } catch (error) {
      console.error('Error updating staff role:', error);
      alert('Error updating staff role. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
                  <option key={role.value} value={role.value}>{role.label}</option>
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
            <p className="text-sm">Click &quot;Add Staff Member&quot; to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
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
                    <td className="py-3 px-4 text-gray-600">{staff.email}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          staff.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                          staff.role === 'Trainer' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {staff.role}
                        </span>
                        <select
                          value={staff.role}
                          onChange={(e) => handleChangeRole(staff.id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-1 py-0.5"
                          disabled={isLoading}
                        >
                          {roleOptions.map(role => (
                            <option key={role.value} value={role.value}>{role.label}</option>
                          ))}
                        </select>
                      </div>
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
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditStaff(staff)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleRemoveStaff(staff.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Remove
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
    </div>
  );
}
