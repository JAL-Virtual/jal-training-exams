'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function ExaminerGuidelines() {
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
          <h2 className="text-2xl font-bold text-gray-900">Guidelines for Examiners</h2>
          <p className="text-gray-600">Important guidelines and procedures for examiners</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Examination Process */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Examination Process Guidelines</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-2">Pre-Examination Preparation</h4>
                    <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                      <li>Review student&apos;s training records and prerequisites</li>
                      <li>Prepare examination materials and scenarios</li>
                      <li>Verify examination environment and equipment</li>
                      <li>Confirm student identity and eligibility</li>
                      <li>Brief student on examination procedures</li>
                    </ol>
                  </div>
                  <div className="bg-white p-4 rounded border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-2">During Examination</h4>
                    <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                      <li>Maintain professional demeanor throughout</li>
                      <li>Follow standardized examination protocols</li>
                      <li>Document all observations and responses</li>
                      <li>Ensure fair and consistent evaluation</li>
                      <li>Provide clear feedback when appropriate</li>
                    </ol>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-2">Post-Examination Procedures</h4>
                    <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                      <li>Complete examination documentation</li>
                      <li>Calculate final scores and results</li>
                      <li>Provide detailed feedback to student</li>
                      <li>Submit results to training management</li>
                      <li>Update student records and certifications</li>
                    </ol>
                  </div>
                  <div className="bg-white p-4 rounded border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-2">Quality Standards</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Maintain impartiality and objectivity</li>
                      <li>• Follow JAL Virtual examination standards</li>
                      <li>• Ensure consistent evaluation criteria</li>
                      <li>• Document all decisions and rationale</li>
                      <li>• Continuous professional development</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Examination Types */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-4">Examination Types & Requirements</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <span className="text-green-600 font-bold text-lg">📝</span>
                  </div>
                  <h4 className="font-semibold text-green-800 mb-2">Written Examinations</h4>
                  <p className="text-sm text-green-700">Theory-based assessments covering regulations, procedures, and knowledge requirements</p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <span className="text-green-600 font-bold text-lg">✈️</span>
                  </div>
                  <h4 className="font-semibold text-green-800 mb-2">Practical Examinations</h4>
                  <p className="text-sm text-green-700">Hands-on assessments in simulators or aircraft covering operational skills</p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <span className="text-green-600 font-bold text-lg">🎯</span>
                  </div>
                  <h4 className="font-semibold text-green-800 mb-2">Oral Examinations</h4>
                  <p className="text-sm text-green-700">Verbal assessments testing knowledge application and decision-making skills</p>
                </div>
              </div>
            </div>

            {/* Examiner Responsibilities */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">Examiner Responsibilities</h3>
              <p className="text-yellow-800 mb-3">
                As an examiner, you are responsible for maintaining the highest standards of evaluation and ensuring 
                that all examinations are conducted fairly, consistently, and in accordance with JAL Virtual policies.
              </p>
              <div className="flex items-center text-yellow-800">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Ensure compliance with all examination standards and procedures</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
