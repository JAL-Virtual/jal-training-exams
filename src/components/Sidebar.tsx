'use client';

import React from 'react';
import Image from 'next/image';
import { logger } from '@/lib/logger';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const [currentUserRole, setCurrentUserRole] = React.useState<string | null>(null);
  const [adminKey, setAdminKey] = React.useState<string | null>(null);
  const [expandedSections, setExpandedSections] = React.useState<{[key: string]: boolean}>({
    dashboards: true, // Always expanded, cannot be collapsed
    'training-staff': true,
    examination: true,
    resources: true,
    control: true,
    management: true
  });
  // const [expandedTrainingSubs] = React.useState(false);
  
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
        logger.error('Error fetching admin key', { 
          message: error instanceof Error ? error.message : String(error) 
        });
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
            logger.debug('Current user role', { role: result.role });
          }
        }
      } catch (error) {
        logger.error('Error fetching user role', { 
          message: error instanceof Error ? error.message : String(error) 
        });
      }
    };

    fetchUserRole();
  }, []);

  // Role-based access control
  const canAccessTraining = currentUserRole === 'Trainer' || currentUserRole === 'Admin' || isAdmin;
  const canAccessExamination = currentUserRole === 'Examiner' || currentUserRole === 'Admin' || isAdmin;

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  // const toggleTrainingSubs = () => {
  //   // Function kept for potential future use
  // };

  return (
    <div className="w-72 bg-white shadow-lg border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-center h-16">
          <button 
            onClick={() => onSectionChange('dashboard')}
            className="hover:opacity-80 transition-opacity cursor-pointer w-full h-full flex items-center justify-center"
          >
            <Image 
              src="/img/jal-logo.png"
              alt="JAL Logo"
              width={100}
              height={50}
              className="object-contain"
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
            
            <button 
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                activeSection === 'instructions' 
                  ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => onSectionChange('instructions')}
            >
              <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Instructions of the Exam System
            </button>
            
            <button 
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                activeSection === 'training-request' 
                  ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => onSectionChange('training-request')}
            >
              <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Request Training
            </button>
          </div>
        </div>

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
                  onClick={() => onSectionChange('approved-examiners')}
                >
                  <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Approved Examiners
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

        {/* TRAINING STAFF DEPARTMENT */}
        {canAccessTraining && (
          <div className="mb-6">
            <button
              onClick={() => toggleSection('training-staff')}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-xs font-semibold text-gray-500 uppercase tracking-wider hover:bg-gray-100 transition-all duration-200 hover:shadow-sm"
            >
              <span className="flex-1 text-left">TRAINING STAFF DEPARTMENT</span>
              <svg 
                className={`w-4 h-4 transition-all duration-300 flex-shrink-0 ml-2 ${expandedSections['training-staff'] ? 'rotate-180 text-blue-500' : 'text-gray-400'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedSections['training-staff'] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="space-y-1 mt-2 pl-2">
                <button 
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:shadow-sm transition-all duration-200 hover:translate-x-1 flex items-center"
                  onClick={() => onSectionChange('my-assignments')}
                >
                  <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  My Assignments
                </button>
                <button 
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:shadow-sm transition-all duration-200 hover:translate-x-1 flex items-center"
                  onClick={() => onSectionChange('trainer-guidelines')}
                >
                  <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Guideline for Trainers
                </button>
                <button 
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:shadow-sm transition-all duration-200 hover:translate-x-1 flex items-center"
                  onClick={() => onSectionChange('emergency-handbook')}
                >
                  <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-red-600 font-bold">New! Emergency Handbook</span>
                </button>
                <button 
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:shadow-sm transition-all duration-200 hover:translate-x-1 flex items-center"
                  onClick={() => onSectionChange('training-calendar')}
                >
                  <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Training Calendar
                </button>
                <button 
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:shadow-sm transition-all duration-200 hover:translate-x-1 flex items-center"
                  onClick={() => onSectionChange('finished-training')}
                >
                  <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Finished Training
                </button>
                <button 
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:shadow-sm transition-all duration-200 hover:translate-x-1 flex items-center"
                  onClick={() => onSectionChange('training-staff-management')}
                >
                  <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  Training Staff Management
                </button>
                <button 
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:shadow-sm transition-all duration-200 hover:translate-x-1 flex items-center"
                  onClick={() => onSectionChange('training-control')}
                >
                  <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Training Control
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
                <button 
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:shadow-sm transition-all duration-200 hover:translate-x-1 flex items-center"
                  onClick={() => onSectionChange('issue-test-token')}
                >
                  <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Issue Test Token
                </button>
              </div>
            </div>
          </div>
        )}


        {/* EXAMINER STAFF DEPARTMENT */}
        {canAccessExamination && (
          <div className="mb-6">
            <button
              onClick={() => toggleSection('examiner-staff')}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-xs font-semibold text-gray-500 uppercase tracking-wider hover:bg-gray-100 transition-all duration-200 hover:shadow-sm"
            >
              <span className="flex-1 text-left">EXAMINER STAFF DEPARTMENT</span>
              <svg 
                className={`w-4 h-4 transition-all duration-300 flex-shrink-0 ml-2 ${expandedSections['examiner-staff'] ? 'rotate-180 text-blue-500' : 'text-gray-400'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedSections['examiner-staff'] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="space-y-1 mt-2 pl-2">
                <button 
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:shadow-sm transition-all duration-200 hover:translate-x-1 flex items-center"
                  onClick={() => onSectionChange('examiner-staff-management')}
                >
                  <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  Examiner Staff Management
                </button>
                <button 
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:shadow-sm transition-all duration-200 hover:translate-x-1 flex items-center"
                  onClick={() => onSectionChange('examination')}
                >
                  <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Examination Control
                </button>
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
                  onClick={() => onSectionChange('manage-topics')}
                >
                  <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Manage Topics
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
                {isAdmin && (
                  <button 
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:shadow-sm transition-all duration-200 hover:translate-x-1 flex items-center"
                    onClick={() => onSectionChange('inactivation-requests')}
                  >
                    <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Inactivation Requests
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}
