import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { logger } from '@/lib/logger';

interface TestToken {
  id: string;
  token: string;
  quizId: string;
  trainerId: string;
  trainerName: string;
  assignedStudentId?: string;
  assignedStudentName?: string;
  status: 'active' | 'used' | 'expired' | 'cancelled' | 'assigned';
  createdAt: string;
  expiresAt?: string;
  usedAt?: string;
  quizTitle: string;
  instructions?: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  courseId: string;
  instructor: string;
  timeLimit?: number;
  attempts: number;
  gradingMethod: 'highest' | 'average' | 'first' | 'last';
  status: 'draft' | 'published' | 'archived';
  questions: QuizQuestion[];
}

interface QuizQuestion {
  id: string;
  quizId: string;
  questionText: string;
  questionType: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  points: number;
  order: number;
  options: QuizOption[];
  correctAnswer?: string;
  explanation?: string;
}

interface QuizOption {
  id: string;
  questionId: string;
  optionText: string;
  isCorrect: boolean;
  order: number;
}

interface Student {
  id: string;
  name: string;
  jalId: string;
  progress: number;
  status: 'enrolled' | 'completed' | 'dropped';
  enrolledAt: string;
  courseId: string;
}

interface Trainer {
  id: string;
  jalId: string;
  name: string;
  active: boolean;
  createdAt: string;
}

const TrainerTestTokens: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<{name: string, role: string} | null>(null);
  const [testTokens, setTestTokens] = useState<TestToken[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'assign'>('create');
  const [showTokenForm, setShowTokenForm] = useState(false);
  const [newToken, setNewToken] = useState({
    quizId: '',
    trainerId: '',
    instructions: '',
    expirationHours: 24
  });
  const [selectedToken, setSelectedToken] = useState<TestToken | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Memoized function to get current trainer's tokens
  const getCurrentTrainersTokens = useCallback(() => {
    return testTokens.filter(token => token.trainerName === currentUser?.name);
  }, [testTokens, currentUser?.name]);

  // Memoized function to generate token string
  const generateTokenString = useCallback(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }, []);

  useEffect(() => {
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
        const [tokensResponse, quizzesResponse, studentsResponse, trainersResponse] = await Promise.all([
          fetch('/api/test-tokens'),
          fetch('/api/quizzes'),
          fetch('/api/students'),
          fetch('/api/trainers'),
        ]);

        const tokensResult = await tokensResponse.json();
        const quizzesResult = await quizzesResponse.json();
        const studentsResult = await studentsResponse.json();
        const trainersResult = await trainersResponse.json();

        if (tokensResult.success) {
          setTestTokens(tokensResult.tokens);
        } else {
          logger.error('Failed to fetch test tokens', { error: tokensResult.error });
        }

        if (quizzesResult.success) {
          setQuizzes(quizzesResult.quizzes.filter((q: Quiz) => q.status === 'published'));
        } else {
          logger.error('Failed to fetch quizzes', { error: quizzesResult.error });
        }

        if (studentsResult.success) {
          setStudents(studentsResult.students);
        } else {
          logger.error('Failed to fetch students', { error: studentsResult.error });
        }

        if (trainersResult.success) {
          setTrainers(trainersResult.trainers.filter((t: Trainer) => t.active));
        } else {
          logger.error('Failed to fetch trainers', { error: trainersResult.error });
        }
      } catch (error) {
        logger.error('Error loading test token data', {
          message: error instanceof Error ? error.message : String(error),
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
    fetchData();
  }, []);

  const handleCreateToken = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/test-tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newToken,
          trainerName: trainers.find(t => t.id === newToken.trainerId)?.name || currentUser?.name,
          expiresAt: new Date(Date.now() + newToken.expirationHours * 60 * 60 * 1000).toISOString()
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setTestTokens(prev => [...prev, result.token]);
          setShowTokenForm(false);
          setNewToken({
            quizId: '',
            trainerId: '',
            instructions: '',
            expirationHours: 24
          });
          alert('Test token created successfully!');
        } else {
          throw new Error(result.error || 'Failed to create test token');
        }
      } else {
        throw new Error('Failed to create test token');
      }
    } catch (error) {
      logger.error('Error creating test token', {
        message: error instanceof Error ? error.message : String(error),
      });
      alert('Error creating test token. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignToken = async (tokenId: string, studentId: string, studentName: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/test-tokens', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokenId,
          assignedStudentId: studentId,
          assignedStudentName: studentName,
          status: 'assigned'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setTestTokens(prev => prev.map(token => 
            token.id === tokenId 
              ? {...token, assignedStudentId: studentId, assignedStudentName: studentName, status: 'assigned'}
              : token
          ));
          
          alert('Test token assigned successfully!');
          setShowAssignModal(false);
          setSelectedToken(null);
        } else {
          throw new Error(result.error || 'Failed to assign test token');
        }
      } else {
        throw new Error('Failed to assign test token');
      }
    } catch (error) {
      logger.error('Error assigning test token', {
        message: error instanceof Error ? error.message : String(error),
      });
      alert('Error assigning test token. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToken = async (token: string) => {
    try {
      await navigator.clipboard.writeText(token);
      alert('Token copied to clipboard!');
    } catch (error) {
      logger.error('Error copying token', { message: error instanceof Error ? error.message : String(error) });
      alert('Failed to copy token. Please copy manually.');
    }
  };

  const isTrainer = currentUser?.role === 'Trainer' || currentUser?.role === 'Admin';

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isTrainer) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Access denied. Trainers only.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Test Token Management</h2>
            <p className="text-gray-600">Create and manage test tokens for student retests</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('create')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'create'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Create Token
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'manage'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Manage Tokens
          </button>
          <button
            onClick={() => setActiveTab('assign')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'assign'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Assign to Students
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'create' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Create Test Token</h3>
            <button
              onClick={() => setShowTokenForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create New Token
            </button>
          </div>

          {/* Token Creation Form Modal */}
          {showTokenForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 backdrop-blur-sm bg-white/20 flex items-center justify-center z-50 p-4"
              onClick={() => setShowTokenForm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 shadow-xl border border-gray-200"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Test Token</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Quiz</label>
                    <select
                      value={newToken.quizId}
                      onChange={(e) => setNewToken(prev => ({ ...prev, quizId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      required
                    >
                      <option value="">Choose a quiz</option>
                      {quizzes.map(quiz => (
                        <option key={quiz.id} value={quiz.id}>
                          {quiz.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Trainer</label>
                    <select
                      value={newToken.trainerId}
                      onChange={(e) => setNewToken(prev => ({ ...prev, trainerId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      required
                    >
                      <option value="">Choose a trainer</option>
                      {trainers.map(trainer => (
                        <option key={trainer.id} value={trainer.id}>
                          {trainer.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiration (hours)</label>
                    <input
                      type="number"
                      value={newToken.expirationHours}
                      onChange={(e) => setNewToken(prev => ({ ...prev, expirationHours: parseInt(e.target.value) || 24 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      min="1"
                      max="168"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instructions (Optional)</label>
                    <textarea
                      value={newToken.instructions}
                      onChange={(e) => setNewToken(prev => ({ ...prev, instructions: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      rows={3}
                      placeholder="Special instructions for students taking this test..."
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowTokenForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateToken}
                    disabled={!newToken.quizId || !newToken.trainerId || isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? 'Creating...' : 'Create Token'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Tokens List */}
          <div className="space-y-4">
            {getCurrentTrainersTokens().length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No test tokens created yet.</p>
              </div>
            ) : (
              getCurrentTrainersTokens().map((token) => (
                <div key={token.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h5 className="font-medium text-gray-900">Token: {token.token}</h5>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          token.status === 'active' ? 'bg-green-100 text-green-800' :
                          token.status === 'used' ? 'bg-blue-100 text-blue-800' :
                          token.status === 'expired' ? 'bg-red-100 text-red-800' :
                          token.status === 'assigned' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {token.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Quiz: {token.quizTitle}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Created: {new Date(token.createdAt).toLocaleDateString()}</span>
                        <span>Expires: {new Date(token.expiresAt || '').toLocaleDateString()}</span>
                        <span>Trainer: {token.trainerName}</span>
                      </div>
                      {token.assignedStudentName && (
                        <div className="mt-2">
                          <span className="text-sm text-blue-600 font-medium">
                            Assigned to: {token.assignedStudentName}
                          </span>
                        </div>
                      )}
                      {token.instructions && (
                        <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                          <p className="text-sm text-yellow-800">
                            <strong>Instructions:</strong> {token.instructions}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {token.status === 'active' && (
                        <button
                          onClick={() => {
                            setSelectedToken(token);
                            setShowAssignModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                        >
                          Assign to Student
                        </button>
                      )}
                      <button
                        onClick={() => handleCopyToken(token.token)}
                        className="text-gray-600 hover:text-gray-800 text-sm transition-colors"
                      >
                        Copy Token
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'manage' && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Manage Test Tokens</h3>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{testTokens.filter(t => t.status === 'active').length}</div>
              <div className="text-sm text-gray-600">Active Tokens</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{testTokens.filter(t => t.status === 'used').length}</div>
              <div className="text-sm text-gray-600">Used Tokens</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-600">{testTokens.filter(t => t.status === 'assigned').length}</div>
              <div className="text-sm text-gray-600">Assigned Tokens</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-600">{testTokens.filter(t => t.status === 'expired').length}</div>
              <div className="text-sm text-gray-600">Expired Tokens</div>
            </div>
          </div>

          {/* All Tokens Table */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quiz</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getCurrentTrainersTokens().map((token) => (
                    <tr key={token.id}>
                      <td className="px-4 py-3 text-sm font-mono text-gray-900">{token.token}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{token.quizTitle}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          token.status === 'active' ? 'bg-green-100 text-green-800' :
                          token.status === 'used' ? 'bg-blue-100 text-blue-800' :
                          token.status === 'expired' ? 'bg-red-100 text-red-800' :
                          token.status === 'assigned' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {token.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {token.assignedStudentName || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {token.expiresAt ? new Date(token.expiresAt).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'assign' && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Assign Tokens to Students</h3>
          
          {/* Available Students */}
          <div className="space-y-4">
            {students.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No students found.</p>
              </div>
            ) : (
              students.map((student) => {
                const assignedTokens = testTokens.filter(t => t.assignedStudentId === student.id);
                
                return (
                  <div key={student.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 mb-1">{student.name}</h5>
                        <p className="text-sm text-gray-600 mb-2">JAL ID: {student.jalId}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Course: {student.courseId}</span>
                          <span>Status: {student.status}</span>
                          <span>Progress: {student.progress}%</span>
                        </div>
                        {assignedTokens.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-gray-700">Assigned Tokens:</p>
                            {assignedTokens.map(token => (
                              <div key={token.id} className="text-sm text-gray-600">
                                {token.token} - {token.quizTitle}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          // Create a new token for assignment
                          const newTokenData = {
                            id: '',
                            token: generateTokenString(),
                            quizId: quizzes[0]?.id || '',
                            trainerId: currentUser?.name || '',
                            trainerName: currentUser?.name || '',
                            assignedStudentId: student.id,
                            assignedStudentName: student.name,
                            status: 'assigned' as const,
                            createdAt: new Date().toISOString(),
                            quizTitle: quizzes[0]?.title || ''
                          };
                          setSelectedToken(newTokenData);
                          setShowAssignModal(true);
                        }}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        Assign Token
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignModal && selectedToken && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 backdrop-blur-sm bg-white/20 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAssignModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign Test Token</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                <select
                  value={selectedToken.assignedStudentId || ''}
                  onChange={(e) => {
                    const student = students.find(s => s.id === e.target.value);
                    setSelectedToken(prev => prev ? {
                      ...prev,
                      assignedStudentId: e.target.value,
                      assignedStudentName: student?.name || ''
                    } : null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  required
                >
                  <option value="">Choose a student</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name} ({student.jalId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quiz</label>
                <select
                  value={selectedToken.quizId}
                  onChange={(e) => {
                    const quiz = quizzes.find(q => q.id === e.target.value);
                    setSelectedToken(prev => prev ? {
                      ...prev,
                      quizId: e.target.value,
                      quizTitle: quiz?.title || ''
                    } : null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  required
                >
                  <option value="">Choose a quiz</option>
                  {quizzes.map(quiz => (
                    <option key={quiz.id} value={quiz.id}>
                      {quiz.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selectedToken && selectedToken.assignedStudentId && selectedToken.quizId) {
                    handleAssignToken(
                      selectedToken.id || '',
                      selectedToken.assignedStudentId,
                      selectedToken.assignedStudentName || '',
                    );
                  }
                }}
                disabled={!selectedToken.assignedStudentId || !selectedToken.quizId || isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Assigning...' : 'Assign Token'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default TrainerTestTokens;