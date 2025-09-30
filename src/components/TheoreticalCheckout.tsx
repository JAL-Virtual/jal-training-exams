'use client';

import React, { useState, useEffect } from 'react';
import { logger } from '../lib/logger';
// import { Course } from '../types/common';

interface TestToken {
  id: string;
  token: string;
  courseId: string;
  courseTitle: string;
  studentId: string;
  studentName: string;
  issuedAt: string;
  expiresAt: string;
  status: 'active' | 'used' | 'expired';
  usedAt?: string;
}

// interface Quiz {
//   id: string;
//   title: string;
//   questions: string[];
// }

const TheoreticalCheckout: React.FC = () => {
  const [testTokens, setTestTokens] = useState<TestToken[]>([]);
  // const [courses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [enteredToken, setEnteredToken] = useState('');
  const [selectedToken, setSelectedToken] = useState<TestToken | null>(null);
  const [showTokenForm, setShowTokenForm] = useState(false);
  const [currentUser, setCurrentUser] = useState<{name: string, role: string} | null>(null);
  // const [quiz, setQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    fetchCurrentUser();
    fetchData();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const apiKey = localStorage.getItem('jal_api_key');
      if (!apiKey) return;

      const roleResponse = await fetch(`/api/staff/role?apiKey=${encodeURIComponent(apiKey)}`);
      if (roleResponse.ok) {
        const roleResult = await roleResponse.json();
        if (roleResult.success) {
          setCurrentUser({ name: roleResult.name, role: roleResult.role });
        }
      }
    } catch (error) {
      logger.error('Error loading current user', { 
        message: error instanceof Error ? error.message : String(error) 
      });
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [tokensResponse, coursesResponse] = await Promise.all([
        fetch('/api/test-tokens'),
        fetch('/api/courses'),
      ]);

      const tokensResult = await tokensResponse.json();
      const coursesResult = await coursesResponse.json();

      if (tokensResult.success) {
        setTestTokens(tokensResult.testTokens);
      }

      if (coursesResult.success) {
        // setCourses(coursesResult.courses);
      }
    } catch (error) {
      logger.error('Error loading data for Theoretical Checkout', {
        message: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateToken = async () => {
    if (!enteredToken.trim()) {
      alert('Please enter a token');
      return;
    }

    try {
      const response = await fetch('/api/test-tokens/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: enteredToken }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSelectedToken(result.token);
          setShowTokenForm(false);
        } else {
          alert('Invalid or expired token: ' + result.error);
        }
      } else {
        alert('Token validation failed');
      }
    } catch (error) {
      logger.error('Error validating token', {
        message: error instanceof Error ? error.message : String(error),
      });
      alert('Error validating token');
    }
  };

  const startExam = () => {
    if (!selectedToken) return;
    
    // Mark token as used
    const markTokenUsed = async () => {
      try {
        const response = await fetch('/api/test-tokens', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tokenId: selectedToken.id,
            status: 'used',
            usedAt: new Date().toISOString()
          }),
        });

        if (response.ok) {
          // Redirect to exam interface or show exam content
          alert(`Starting exam for course: ${selectedToken.courseTitle}`);
          setSelectedToken(null);
          fetchData(); // Refresh tokens
        }
      } catch (error) {
        logger.error('Error marking token as used', {
          message: error instanceof Error ? error.message : String(error),
        });
      }
    };

    markTokenUsed();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const isTokenExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const getAvailableTokens = () => {
    return testTokens.filter(token => 
      token.status === 'active' && 
      !isTokenExpired(token.expiresAt) &&
      token.studentName === currentUser?.name
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Theoretical Checkout</h2>
            <p className="text-gray-600">Use your test token to access course examinations</p>
          </div>
          <button
            onClick={() => setShowTokenForm(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Enter Token
          </button>
        </div>
      </div>

      {/* Token Entry Form Modal */}
      {showTokenForm && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Enter Test Token</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Token
                </label>
                <input
                  type="text"
                  value={enteredToken}
                  onChange={(e) => setEnteredToken(e.target.value.toUpperCase())}
                  placeholder="Enter your 8-character token"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-black font-mono text-center text-lg tracking-widest"
                  maxLength={8}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowTokenForm(false);
                  setEnteredToken('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={validateToken}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Validate Token
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Token Display */}
      {selectedToken && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-800 mb-4">Token Validated Successfully!</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Token:</strong> <span className="font-mono text-lg">{selectedToken.token}</span></p>
              <p><strong>Course:</strong> {selectedToken.courseTitle}</p>
            </div>
            <div>
              <p><strong>Student:</strong> {selectedToken.studentName}</p>
              <p><strong>Expires:</strong> {formatDate(selectedToken.expiresAt)}</p>
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => setSelectedToken(null)}
              className="px-4 py-2 border border-purple-300 rounded-md text-purple-700 hover:bg-purple-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={startExam}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Start Exam
            </button>
          </div>
        </div>
      )}

      {/* Available Tokens */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Available Tokens</h3>
        
        {getAvailableTokens().length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No active test tokens available for you.</p>
            <p className="text-sm mt-2">Contact your trainer to issue a test token.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {getAvailableTokens().map((token) => (
              <div key={token.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <span className="font-mono text-lg font-bold text-gray-900">{token.token}</span>
                      <div>
                        <h4 className="font-medium text-gray-900">{token.courseTitle}</h4>
                        <p className="text-sm text-gray-500">Expires: {formatDate(token.expiresAt)}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setEnteredToken(token.token);
                      setSelectedToken(token);
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    Use Token
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Tokens History */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Token History</h3>
        
        {testTokens.filter(token => token.studentName === currentUser?.name).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No tokens have been issued to you yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Token
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issued
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expires
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {testTokens
                  .filter(token => token.studentName === currentUser?.name)
                  .map((token) => (
                  <tr key={token.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm font-medium text-gray-900">
                        {token.token}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {token.courseTitle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(token.issuedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(token.expiresAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        token.status === 'used' ? 'text-green-600 bg-green-50' :
                        token.status === 'expired' || isTokenExpired(token.expiresAt) ? 'text-red-600 bg-red-50' :
                        'text-blue-600 bg-blue-50'
                      }`}>
                        {token.status === 'used' ? 'Used' :
                         token.status === 'expired' || isTokenExpired(token.expiresAt) ? 'Expired' :
                         'Active'}
                      </span>
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
};

export default TheoreticalCheckout;
