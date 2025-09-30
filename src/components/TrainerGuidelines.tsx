'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function TrainerGuidelines() {
  const handleOpenPDF = (filename: string) => {
    // In a real application, this would open the actual PDF file
    // For now, we'll show an alert
    alert(`Opening ${filename} - This would open the PDF in a new tab`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-lg"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Guideline for Trainers</h2>
          <p className="text-gray-600">Important guidelines and procedures for trainers</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Guidelines Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-6 cursor-pointer"
              onClick={() => handleOpenPDF('trainer-guidelines.pdf')}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-blue-900">Trainer Guidelines Document</h3>
                  <p className="text-blue-700">Click to open the comprehensive trainer guidelines PDF</p>
                </div>
                <div className="ml-auto">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </div>
            </motion.div>

            {/* Quick Reference */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Reference</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-800">Pre-Training Checklist</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Verify pilot credentials</li>
                    <li>• Review training topic materials</li>
                    <li>• Check equipment functionality</li>
                    <li>• Confirm schedule and duration</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-800">During Training</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Record start time accurately</li>
                    <li>• Monitor pilot performance</li>
                    <li>• Provide constructive feedback</li>
                    <li>• Document any issues</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-800">Post-Training</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Record end time</li>
                    <li>• Complete evaluation form</li>
                    <li>• Provide detailed feedback</li>
                    <li>• Submit training report</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-800">Rating Criteria</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Excellent: Exceeds expectations</li>
                    <li>• Good: Meets expectations</li>
                    <li>• Satisfactory: Basic competency</li>
                    <li>• Needs Improvement: Below standard</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">Need Help?</h3>
              <p className="text-yellow-800">
                If you have questions about training procedures or need assistance, 
                please contact the Training Department at training@jalvirtual.com
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
