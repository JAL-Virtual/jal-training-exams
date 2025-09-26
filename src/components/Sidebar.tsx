'use client';

import React from 'react';
import Image from 'next/image';
import { User } from '@/types';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  user: User | null;
}

export default function Sidebar({ activeSection, onSectionChange, user }: SidebarProps) {
  // Check for specific administrator API key
  const isAdmin = typeof window !== 'undefined' && localStorage.getItem('jal_api_key') === '29e2bb1d4ae031ed47b6';

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200">
      <div className="p-2 border-b border-gray-200">
        <div className="flex items-center justify-center">
          <Image 
            src="/img/jal-logo-large.png"
            alt="JAL Logo"
            width={160}
            height={160}
            className="object-contain"
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

        {/* EXAM DEPARTMENT */}
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
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">STAFF DEPARTMENT</h3>
          <div className="space-y-1">
            <button 
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => onSectionChange('control')}
            >
              Control
            </button>
            <button 
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => onSectionChange('examination')}
            >
              Examination
            </button>
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
          </div>
        </div>

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
