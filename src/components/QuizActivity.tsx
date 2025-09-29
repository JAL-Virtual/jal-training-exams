import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { logger } from '@/lib/logger';
import StudentQuizInterface from './StudentQuizInterface';
import QuizResults from './QuizResults';
import TrainerTestTokens from './TrainerTestTokens';
import StudentTestInterface from './StudentTestInterface';

interface Quiz {
  id: string;
  title: string;
  description: string;
  courseId: string;
  instructor: string;
  timeLimit?: number; // in minutes
  attempts: number;
  gradingMethod: 'highest' | 'average' | 'first' | 'last';
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  showCorrectAnswers: boolean;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
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

interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  studentName: string;
  startTime: string;
  endTime?: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  score?: number;
  maxScore: number;
  answers: QuizAnswer[];
  lastSaved: string;
}

interface QuizAnswer {
  id: string;
  attemptId: string;
  questionId: string;
  answerText: string;
  isCorrect?: boolean;
  points?: number;
}

const QuizActivity: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<{name: string, role: string} | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'results' | 'take' | 'tokens' | 'student-test'>('create');
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [showStudentQuiz, setShowStudentQuiz] = useState(false);
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    description: '',
    courseId: '',
    timeLimit: 0,
    attempts: 1,
    gradingMethod: 'highest' as 'highest' | 'average' | 'first' | 'last',
    shuffleQuestions: false,
    shuffleAnswers: false,
    showCorrectAnswers: true,
    status: 'draft' as 'draft' | 'published' | 'archived'
  });

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
        const [quizzesResponse, attemptsResponse] = await Promise.all([
          fetch('/api/quizzes'),
          fetch('/api/quiz-attempts'),
        ]);

        const quizzesResult = await quizzesResponse.json();
        const attemptsResult = await attemptsResponse.json();

        if (quizzesResult.success) {
          setQuizzes(quizzesResult.quizzes);
        } else {
          logger.error('Failed to fetch quizzes', { error: quizzesResult.error });
        }

        if (attemptsResult.success) {
          setAttempts(attemptsResult.attempts);
        } else {
          logger.error('Failed to fetch quiz attempts', { error: attemptsResult.error });
        }
      } catch (error) {
        logger.error('Error loading quiz data', {
          message: error instanceof Error ? error.message : String(error),
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
    fetchData();
  }, []);

  const handleCreateQuiz = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newQuiz,
          instructor: currentUser?.name || 'Current User'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setQuizzes(prev => [...prev, result.quiz]);
          setShowQuizForm(false);
          setNewQuiz({
            title: '',
            description: '',
            courseId: '',
            timeLimit: 0,
            attempts: 1,
            gradingMethod: 'highest',
            shuffleQuestions: false,
            shuffleAnswers: false,
            showCorrectAnswers: true,
            status: 'draft'
          });
          alert('Quiz created successfully!');
        } else {
          throw new Error(result.error || 'Failed to create quiz');
        }
      } else {
        throw new Error('Failed to create quiz');
      }
    } catch (error) {
      logger.error('Error creating quiz', {
        message: error instanceof Error ? error.message : String(error),
      });
      alert('Error creating quiz. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isTrainer = currentUser?.role === 'Trainer' || currentUser?.role === 'Admin';
  const isStudent = currentUser?.role === 'Student' || !isTrainer;

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
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900">QUIZ</h4>
            <h2 className="text-2xl font-bold text-gray-900">Theoretical Check</h2>
            <p className="text-gray-600">Create and manage quiz activities for students</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {isTrainer && (
            <>
              <button
                onClick={() => setActiveTab('create')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'create'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Create Quiz
              </button>
              <button
                onClick={() => setActiveTab('tokens')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'tokens'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Test Tokens
              </button>
              <button
                onClick={() => setActiveTab('manage')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'manage'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Manage Quizzes
              </button>
              <button
                onClick={() => setActiveTab('results')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'results'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Results
              </button>
            </>
          )}
          {isStudent && (
            <>
              <button
                onClick={() => setActiveTab('take')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'take'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Take Quiz
              </button>
              <button
                onClick={() => setActiveTab('student-test')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'student-test'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Token Test
              </button>
            </>
          )}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'create' && isTrainer && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Create New Quiz</h3>
            <button
              onClick={() => setShowQuizForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Quiz
            </button>
          </div>

          {/* Quiz Form Modal */}
          {showQuizForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 backdrop-blur-sm bg-white/20 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 shadow-xl border border-gray-200"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Quiz</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Title</label>
                    <input
                      type="text"
                      value={newQuiz.title}
                      onChange={(e) => setNewQuiz(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      placeholder="Enter quiz title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={newQuiz.description}
                      onChange={(e) => setNewQuiz(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      rows={3}
                      placeholder="Enter quiz description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time Limit (minutes)</label>
                      <input
                        type="number"
                        value={newQuiz.timeLimit}
                        onChange={(e) => setNewQuiz(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        placeholder="0 for no limit"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Attempts Allowed</label>
                      <input
                        type="number"
                        value={newQuiz.attempts}
                        onChange={(e) => setNewQuiz(prev => ({ ...prev, attempts: parseInt(e.target.value) || 1 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        min="1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Grading Method</label>
                    <select
                      value={newQuiz.gradingMethod}
                      onChange={(e) => setNewQuiz(prev => ({ ...prev, gradingMethod: e.target.value as 'highest' | 'average' | 'first' | 'last' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    >
                      <option value="highest">Highest grade</option>
                      <option value="average">Average grade</option>
                      <option value="first">First attempt</option>
                      <option value="last">Last attempt</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newQuiz.shuffleQuestions}
                        onChange={(e) => setNewQuiz(prev => ({ ...prev, shuffleQuestions: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Shuffle questions</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newQuiz.shuffleAnswers}
                        onChange={(e) => setNewQuiz(prev => ({ ...prev, shuffleAnswers: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Shuffle answers</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newQuiz.showCorrectAnswers}
                        onChange={(e) => setNewQuiz(prev => ({ ...prev, showCorrectAnswers: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Show correct answers</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowQuizForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateQuiz}
                    disabled={!newQuiz.title.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    Create Quiz
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Quiz List */}
          <div className="space-y-4">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900 mb-1">{quiz.title}</h5>
                    <p className="text-sm text-gray-600 mb-2">{quiz.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Instructor: {quiz.instructor}</span>
                      <span>Time Limit: {quiz.timeLimit || 'No limit'} min</span>
                      <span>Attempts: {quiz.attempts}</span>
                      <span>Grading: {quiz.gradingMethod}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      quiz.status === 'published' ? 'bg-green-100 text-green-800' :
                      quiz.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {quiz.status}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedQuiz(quiz);
                        // TODO: Navigate to quiz editor
                        alert(`Editing ${quiz.title}...`);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        // TODO: Preview quiz
                        alert(`Previewing ${quiz.title}...`);
                      }}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      Preview
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'manage' && isTrainer && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Manage Quizzes</h3>
          <div className="text-center py-8">
            <p className="text-gray-500">Quiz management interface coming soon...</p>
          </div>
        </div>
      )}

      {activeTab === 'tokens' && isTrainer && (
        <TrainerTestTokens />
      )}

      {activeTab === 'results' && (
        <QuizResults />
      )}

      {activeTab === 'student-test' && isStudent && (
        <StudentTestInterface />
      )}

      {activeTab === 'take' && isStudent && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Available Quizzes</h3>
          
          {showStudentQuiz && selectedQuiz ? (
            <StudentQuizInterface quiz={selectedQuiz} />
          ) : (
            <div className="space-y-4">
              {quizzes.filter(quiz => quiz.status === 'published').map((quiz) => {
                const studentAttempts = attempts.filter(
                  attempt => attempt.quizId === quiz.id && attempt.studentName === currentUser?.name
                );
                const canTakeQuiz = studentAttempts.length < quiz.attempts;
                
                return (
                  <div key={quiz.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 mb-1">{quiz.title}</h5>
                        <p className="text-sm text-gray-600 mb-2">{quiz.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Time Limit: {quiz.timeLimit || 'No limit'} min</span>
                          <span>Attempts: {studentAttempts.length} / {quiz.attempts}</span>
                          <span>Instructor: {quiz.instructor}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {studentAttempts.length > 0 && (
                          <span className="text-sm text-gray-600">
                            Best Score: {Math.max(...studentAttempts.map(a => a.score || 0))} / {quiz.questions.reduce((sum, q) => sum + q.points, 0)}
                          </span>
                        )}
                        <button
                          onClick={() => {
                            setSelectedQuiz(quiz);
                            setShowStudentQuiz(true);
                          }}
                          disabled={!canTakeQuiz}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            canTakeQuiz
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {canTakeQuiz ? 'Take Quiz' : 'Max Attempts Reached'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {quizzes.filter(quiz => quiz.status === 'published').length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No quizzes available for you to take.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizActivity;
