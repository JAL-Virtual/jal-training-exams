'use client';

import React from 'react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const [currentUserRole, setCurrentUserRole] = React.useState<string | null>(null);
  const [adminKey, setAdminKey] = React.useState<string | null>(null);
  const [expandedSections, setExpandedSections] = React.useState<{[key: string]: boolean}>({
    dashboards: true, // Always expanded, cannot be collapsed
    training: true,
    examination: true,
    resources: true,
    control: true,
    management: true
  });
  
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

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  return (
    <div className="w-72 bg-white shadow-lg border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-center h-16">
          <button 
            onClick={() => onSectionChange('dashboard')}
            className="hover:opacity-80 transition-opacity cursor-pointer w-full h-full flex items-center justify-center"
          >
            <img 
              src="/img/jal-logo.png"
              alt="JAL Logo"
              className="object-contain"
              style={{ 
                width: '100px', 
                height: '50px', 
                maxWidth: '100px', 
                maxHeight: '50px',
                minWidth: '100px',
                minHeight: '50px'
              }}
            />
          </button>
        </div>
      </div>

      <nav className="p-4 space-y-2">
        {/* DASHBOARDS - Always visible */}
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
            <button
              onClick={() => toggleSection('training')}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-xs font-semibold text-gray-500 uppercase tracking-wider hover:bg-gray-100 transition-all duration-200 hover:shadow-sm"
            >
              <span className="flex-1 text-left">TRAINING DEPARTMENT</span>
              <svg 
                className={`w-4 h-4 transition-all duration-300 flex-shrink-0 ml-2 ${expandedSections.training ? 'rotate-180 text-blue-500' : 'text-gray-400'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedSections.training ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="space-y-1 mt-2 pl-2">
                <button 
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:shadow-sm transition-all duration-200 hover:translate-x-1"
                  onClick={() => onSectionChange('training')}
                >
                  Training
                </button>
                <button 
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:shadow-sm transition-all duration-200 hover:translate-x-1"
                  onClick={() => onSectionChange('approved-trainers')}
                >
                  Approved Trainers
                </button>
                <button 
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:shadow-sm transition-all duration-200 hover:translate-x-1"
                  onClick={() => onSectionChange('upcoming-training')}
                >
                  Upcoming Training
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EXAM DEPARTMENT */}
        {canAccessExamination && (
          <div className="mb-6">
            <button
              onClick={() => toggleSection('examination')}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-xs font-semibold text-gray-500 uppercase tracking-wider hover:bg-gray-100 transition-all duration-200 hover:shadow-sm"
            >
              <span className="flex-1 text-left">EXAM DEPARTMENT</span>
              <svg 
                className={`w-4 h-4 transition-all duration-300 flex-shrink-0 ml-2 ${expandedSections.examination ? 'rotate-180 text-blue-500' : 'text-gray-400'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedSections.examination ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="space-y-1 mt-2 pl-2">
                <button 
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:shadow-sm transition-all duration-200 hover:translate-x-1"
                  onClick={() => onSectionChange('request-exam')}
                >
                  Request Exam
                </button>
                <button 
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:shadow-sm transition-all duration-200 hover:translate-x-1"
                  onClick={() => onSectionChange('theoretical-checkout')}
                >
                  Theoretical Checkout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RESOURCES DEPARTMENT */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection('resources')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-gray-500 uppercase tracking-wider hover:bg-gray-100 transition-all duration-200 hover:shadow-sm"
          >
              <span className="flex-1 text-left">RESOURCES DEPARTMENT</span>
            <svg 
              className={`w-4 h-4 transition-all duration-300 flex-shrink-0 ml-2 ${expandedSections.resources ? 'rotate-180 text-blue-500' : 'text-gray-400'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedSections.resources ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="space-y-1 mt-2 pl-2">
              <button 
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:shadow-sm transition-all duration-200 hover:translate-x-1"
                onClick={() => onSectionChange('local-procedures')}
              >
                Local Procedures
              </button>
              <button 
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:shadow-sm transition-all duration-200 hover:translate-x-1"
                onClick={() => onSectionChange('charts')}
              >
                Charts
              </button>
            </div>
          </div>
        </div>

        {/* STAFF DEPARTMENT */}
        {canAccessControl && (
          <div className="mb-6">
            <button
              onClick={() => toggleSection('control')}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-xs font-semibold text-gray-500 uppercase tracking-wider hover:bg-gray-100 transition-all duration-200 hover:shadow-sm"
            >
              <span className="flex-1 text-left">STAFF DEPARTMENT</span>
              <svg 
                className={`w-4 h-4 transition-all duration-300 flex-shrink-0 ml-2 ${expandedSections.control ? 'rotate-180 text-blue-500' : 'text-gray-400'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedSections.control ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="space-y-1 mt-2 pl-2">
                <button 
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:shadow-sm transition-all duration-200 hover:translate-x-1"
                  onClick={() => onSectionChange('control')}
                >
                  Control
                </button>
                {canAccessExamination && (
                  <button 
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:shadow-sm transition-all duration-200 hover:translate-x-1"
                    onClick={() => onSectionChange('examination')}
                  >
                    Examination
                  </button>
                )}
                {canAccessTraining && (
                  <>
                    <button 
                      className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:shadow-sm transition-all duration-200 hover:translate-x-1"
                      onClick={() => onSectionChange('training')}
                    >
                      Training
                    </button>
                    <button 
                      className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:shadow-sm transition-all duration-200 hover:translate-x-1"
                      onClick={() => onSectionChange('pickup-training')}
                    >
                      Pickup Training
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MANAGEMENT DEPARTMENT - Admin Only */}
        {isAdmin && (
          <div className="mb-6">
            <button
              onClick={() => toggleSection('management')}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-xs font-semibold text-gray-500 uppercase tracking-wider hover:bg-gray-100 transition-all duration-200 hover:shadow-sm"
            >
              <span className="flex-1 text-left">MANAGEMENT DEPARTMENT</span>
              <svg 
                className={`w-4 h-4 transition-all duration-300 flex-shrink-0 ml-2 ${expandedSections.management ? 'rotate-180 text-blue-500' : 'text-gray-400'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedSections.management ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="space-y-1 mt-2 pl-2">
                <button 
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:shadow-sm transition-all duration-200 hover:translate-x-1"
                  onClick={() => onSectionChange('manage-staff')}
                >
                  Manage Staff
                </button>
                <button 
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:shadow-sm transition-all duration-200 hover:translate-x-1"
                  onClick={() => onSectionChange('reports-analytics')}
                >
                  Report & Analytics
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}
