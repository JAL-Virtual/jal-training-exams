'use client';

import React from 'react';
import Image from 'next/image';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const [currentUserRole, setCurrentUserRole] = React.useState<string | null>(null);
  const [adminKey, setAdminKey] = React.useState<string | null>(null);
  
  // Get admin API key from server
  React.useEffect(() => {
    const fetchAdminKey = async () => {
      try {
        const response = await fetch('/api/admin/key');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setAdminKey(result.adminKey);
          }
        }
      } catch (error) {
        console.error('Error fetching admin key:', error);
      }
    };

    fetchAdminKey();
  }, []);

  // Check for specific administrator API key
  const isAdmin = typeof window !== 'undefined' && adminKey && localStorage.getItem('jal_api_key') === adminKey;
  
  // Get current user's role from API
  React.useEffect(() => {
    const fetchUserRole = async () => {
      if (typeof window === 'undefined') return;
      
      const apiKey = localStorage.getItem('jal_api_key');
      if (!apiKey) return;
      
      try {
        const response = await fetch(`/api/staff/role?apiKey=${encodeURIComponent(apiKey)}`);
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setCurrentUserRole(result.role);
            console.log('Current user role:', result.role);
          }
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };

    fetchUserRole();
  }, []);

  // Role-based access control
  const canAccessTraining = currentUserRole === 'Trainer' || currentUserRole === 'Admin' || isAdmin;
  const canAccessExamination = currentUserRole === 'Examiner' || currentUserRole === 'Admin' || isAdmin;
  const canAccessControl = (currentUserRole === 'Trainer' || currentUserRole === 'Examiner' || currentUserRole === 'Admin') || isAdmin;

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-center h-16">
          <Image 
            src="/img/jal-logo.png"
            alt="JAL Logo"
            width={120}
            height={60}
            className="object-contain max-w-full max-h-full"
          />
        </div>
      </div>

      <nav className="p-4 space-y-2">
        {/* DASHBOARDS */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">DASHBOARDS</h3>
          <div className="space-y-1">
            <button 
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'dashboard' 
                  ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => onSectionChange('dashboard')}
            >
              Main Dashboard
            </button>
            <button 
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'squadron' 
                  ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => onSectionChange('squadron')}
            >
              Japan Squadron
            </button>
          </div>
        </div>

        {/* TRAINING DEPARTMENT */}
        {canAccessTraining && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">TRAINING DEPARTMENT</h3>
            <div className="space-y-1">
              <button 
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => onSectionChange('training')}
              >
                Training
              </button>
              <button 
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => onSectionChange('approved-trainers')}
              >
                Approved Trainers
              </button>
              <button 
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => onSectionChange('upcoming-training')}
              >
                Upcoming Training
              </button>
            </div>
          </div>
        )}

        {/* EXAM DEPARTMENT */}
        {canAccessExamination && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">EXAM DEPARTMENT</h3>
            <div className="space-y-1">
              <button 
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => onSectionChange('request-exam')}
              >
                Request Exam
              </button>
              <button 
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => onSectionChange('theoretical-checkout')}
              >
                Theoretical Checkout
              </button>
            </div>
          </div>
        )}

        {/* RESOURCES DEPARTMENT */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">RESOURCES DEPARTMENT</h3>
          <div className="space-y-1">
            <button 
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => onSectionChange('local-procedures')}
            >
              Local Procedures
            </button>
            <button 
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => onSectionChange('charts')}
            >
              Charts
            </button>
          </div>
        </div>

        {/* STAFF DEPARTMENT */}
        {canAccessControl && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">STAFF DEPARTMENT</h3>
            <div className="space-y-1">
              <button 
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => onSectionChange('control')}
              >
                Control
              </button>
              {canAccessExamination && (
                <button 
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={() => onSectionChange('examination')}
                >
                  Examination
                </button>
              )}
              {canAccessTraining && (
                <>
                  <button 
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => onSectionChange('training')}
                  >
                    Training
                  </button>
                  <button 
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => onSectionChange('pickup-training')}
                  >
                    Pickup Training
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* MANAGEMENT DEPARTMENT - Admin Only */}
        {isAdmin && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">MANAGEMENT DEPARTMENT</h3>
            <div className="space-y-1">
              <button 
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => onSectionChange('manage-staff')}
              >
                Manage Staff
              </button>
              <button 
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => onSectionChange('reports-analytics')}
              >
                Report & Analytics
              </button>
              <button 
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => onSectionChange('audit-logs')}
              >
                Audit Logs
              </button>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}
