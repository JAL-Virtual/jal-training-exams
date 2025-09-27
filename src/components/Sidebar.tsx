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
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                activeSection === 'dashboard' 
                  ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => onSectionChange('dashboard')}
            >
              <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
              </svg>
              Main Dashboard
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
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:shadow-sm transition-all duration-200 hover:translate-x-1 flex items-center"
                  onClick={() => onSectionChange('training')}
                >
                  <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Training
                </button>
                <button 
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:shadow-sm transition-all duration-200 hover:translate-x-1 flex items-center"
                  onClick={() => onSectionChange('approved-trainers')}
                >
                  <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Approved Trainers
                </button>
                <button 
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:shadow-sm transition-all duration-200 hover:translate-x-1 flex items-center"
                  onClick={() => onSectionChange('upcoming-training')}
                >
                  <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
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
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:shadow-sm transition-all duration-200 hover:translate-x-1 flex items-center"
                  onClick={() => onSectionChange('request-exam')}
                >
                  <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  Request Exam
                </button>
                <button 
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:shadow-sm transition-all duration-200 hover:translate-x-1 flex items-center"
                  onClick={() => onSectionChange('approved-examiner')}
                >
                  <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Approved Examiner
                </button>
                <button 
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:shadow-sm transition-all duration-200 hover:translate-x-1 flex items-center"
                  onClick={() => onSectionChange('theoretical-checkout')}
                >
                  <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
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
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:shadow-sm transition-all duration-200 hover:translate-x-1 flex items-center"
                onClick={() => onSectionChange('local-procedures')}
              >
                <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Local Procedures
              </button>
              <button 
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:shadow-sm transition-all duration-200 hover:translate-x-1 flex items-center"
                onClick={() => onSectionChange('charts')}
              >
                <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
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
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:shadow-sm transition-all duration-200 hover:translate-x-1 flex items-center"
                  onClick={() => onSectionChange('control')}
                >
                  <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Control
                </button>
                {canAccessExamination && (
                  <button 
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:shadow-sm transition-all duration-200 hover:translate-x-1 flex items-center"
                    onClick={() => onSectionChange('examination')}
                  >
                    <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Examination
                  </button>
                )}
                {canAccessTraining && (
                  <>
                    <button 
                      className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:shadow-sm transition-all duration-200 hover:translate-x-1 flex items-center"
                      onClick={() => onSectionChange('training')}
                    >
                      <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      Training
                    </button>
                    <button 
                      className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:shadow-sm transition-all duration-200 hover:translate-x-1 flex items-center"
                      onClick={() => onSectionChange('pickup-training')}
                    >
                      <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
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
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:shadow-sm transition-all duration-200 hover:translate-x-1 flex items-center"
                  onClick={() => onSectionChange('manage-staff')}
                >
                  <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  Manage Staff
                </button>
                <button 
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:shadow-sm transition-all duration-200 hover:translate-x-1 flex items-center"
                  onClick={() => onSectionChange('approval-examiner')}
                >
                  <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Approval Examiner
                </button>
                <button 
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:shadow-sm transition-all duration-200 hover:translate-x-1 flex items-center"
                  onClick={() => onSectionChange('reports-analytics')}
                >
                  <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
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
