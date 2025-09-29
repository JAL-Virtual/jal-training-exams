import React, { useState, useEffect } from 'react';
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


interface TestSubmission {
  id: string;
  tokenId: string;
  studentId: string;
  studentName: string;
  trainerId: string;
  trainerName: string;
  quizTitle: string;
  answers: Record<string, string>;
  score?: number;
  maxScore: number;
  submittedAt: string;
  status: 'submitted' | 'graded' | 'reviewed';
  feedback?: string;
}

const StudentTestInterface: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<{name: string, role: string} | null>(null);
  const [testToken, setTestToken] = useState<TestToken | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [submission, setSubmission] = useState<TestSubmission | null>(null);
  const [inputToken, setInputToken] = useState('');

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

    fetchCurrentUser();
    setIsLoading(false);
  }, []);

  const validateToken = async () => {
    if (!inputToken.trim()) {
      alert('Please enter a test token.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/test-tokens/validate?token=${encodeURIComponent(inputToken)}&studentName=${encodeURIComponent(currentUser?.name || '')}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setTestToken(result.token);
          setQuiz(result.quiz);
          
          // Initialize timer if quiz has time limit
          if (result.quiz.timeLimit) {
            const endTime = new Date(Date.now() + result.quiz.timeLimit * 60 * 1000).getTime();
            const updateTimer = () => {
              const remaining = Math.max(0, endTime - Date.now());
              setTimeRemaining(remaining);
              
              if (remaining === 0) {
                handleSubmit();
              }
            };
            
            updateTimer();
            const interval = setInterval(updateTimer, 1000);
            
            return () => clearInterval(interval);
          }
        } else {
          alert(result.error || 'Invalid or expired token.');
        }
      } else {
        alert('Failed to validate token.');
      }
    } catch (error) {
      logger.error('Error validating token', {
        message: error instanceof Error ? error.message : String(error)
      });
      alert('Error validating token. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!testToken || !quiz || !currentUser) return;
    
    setIsSubmitting(true);
    try {
      // Create test submission
      const submissionData = {
        tokenId: testToken.id,
        studentId: currentUser.name,
        studentName: currentUser.name,
        trainerId: testToken.trainerId,
        trainerName: testToken.trainerName,
        quizTitle: quiz.title,
        answers,
        maxScore: quiz.questions.reduce((sum, q) => sum + q.points, 0),
        submittedAt: new Date().toISOString(),
        status: 'submitted'
      };

      const response = await fetch('/api/test-submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Update token status to used
          await fetch('/api/test-tokens', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              tokenId: testToken.id,
              status: 'used',
              usedAt: new Date().toISOString()
            }),
          });

          // Send Discord notification to trainer
          await fetch('/api/discord/send-dm', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              trainerId: testToken.trainerId,
              message: `Student ${currentUser.name} has submitted their test for "${quiz.title}". Please review the submission.`
            }),
          });

          setSubmission(result.submission);
          setShowResults(true);
          alert('Test submitted successfully! Your trainer has been notified.');
        } else {
          throw new Error(result.error || 'Failed to submit test');
        }
      } else {
        throw new Error('Failed to submit test');
      }
    } catch (error) {
      logger.error('Error submitting test', {
        message: error instanceof Error ? error.message : String(error)
      });
      alert('Error submitting test. Please try again.');
    } finally {
          setIsSubmitting(false);
    }
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (showResults && submission) {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-green-800 mb-2">Test Submitted Successfully!</h2>
          <p className="text-green-700">Your test has been submitted to {submission.trainerName} for review.</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Submission Details</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <span className="text-sm text-gray-600">Test:</span>
              <div className="text-lg font-medium text-gray-900">{submission.quizTitle}</div>
            </div>
            <div>
              <span className="text-sm text-gray-600">Submitted to:</span>
              <div className="text-lg font-medium text-gray-900">{submission.trainerName}</div>
            </div>
            <div>
              <span className="text-sm text-gray-600">Submitted at:</span>
              <div className="text-lg font-medium text-gray-900">
                {new Date(submission.submittedAt).toLocaleDateString()} {new Date(submission.submittedAt).toLocaleTimeString()}
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-600">Status:</span>
              <div className="text-lg font-medium text-blue-600">{submission.status}</div>
            </div>
          </div>
          
          {submission.feedback && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Feedback from Trainer:</h4>
              <p className="text-blue-800">{submission.feedback}</p>
            </div>
          )}
        </div>

        <div className="text-center">
          <button
            onClick={() => {
              setTestToken(null);
              setQuiz(null);
              setAnswers({});
              setCurrentQuestionIndex(0);
              setTimeRemaining(null);
              setShowResults(false);
              setSubmission(null);
              setInputToken('');
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Take Another Test
          </button>
        </div>
      </div>
    );
  }

  if (!testToken || !quiz) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Enter Test Token</h2>
          <p className="text-gray-600 mb-4">Your trainer has provided you with a test token. Enter it below to begin your test.</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Test Token</label>
              <input
                type="text"
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value.toUpperCase())}
                placeholder="Enter your test token"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-center text-lg font-mono tracking-widest"
                maxLength={8}
              />
            </div>
            
            <button
              onClick={validateToken}
              disabled={!inputToken.trim()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Start Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{quiz.title}</h1>
            <p className="text-sm text-gray-600">{testToken.instructions}</p>
          </div>
          {timeRemaining !== null && (
            <div className="text-right">
              <div className="text-sm text-gray-600">Time Remaining</div>
              <div className={`text-lg font-bold ${
                timeRemaining < 300000 ? 'text-red-600' : 'text-blue-600'
              }`}>
                {formatTime(timeRemaining)}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question Status Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Question {currentQuestionIndex + 1}</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Status:</span>
                <span className="ml-2 text-blue-600">
                  {answers[currentQuestion.id] ? 'Answered' : 'Not yet answered'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Marked out of {currentQuestion.points} points</span>
              </div>
            </div>
          </div>
        </div>

        {/* Question Area */}
        <div className="lg:col-span-2">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {currentQuestion.questionText}
            </h2>
            
            {currentQuestion.questionType === 'multiple_choice' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Select one:</p>
                {currentQuestion.options.map((option, index) => (
                  <label key={option.id} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name={`question_${currentQuestion.id}`}
                      value={option.id}
                      checked={answers[currentQuestion.id] === option.id}
                      onChange={(e) => setAnswers(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm font-medium">{String.fromCharCode(97 + index)}.</span>
                    <span className="text-gray-900">{option.optionText}</span>
                  </label>
                ))}
              </div>
            )}

            {currentQuestion.questionType === 'true_false' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Select one:</p>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name={`question_${currentQuestion.id}`}
                    value="true"
                    checked={answers[currentQuestion.id] === 'true'}
                    onChange={(e) => setAnswers(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm font-medium">a.</span>
                  <span className="text-gray-900">True</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name={`question_${currentQuestion.id}`}
                    value="false"
                    checked={answers[currentQuestion.id] === 'false'}
                    onChange={(e) => setAnswers(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm font-medium">b.</span>
                  <span className="text-gray-900">False</span>
                </label>
              </div>
            )}

            {currentQuestion.questionType === 'short_answer' && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Enter your answer:</p>
                <input
                  type="text"
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => setAnswers(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Type your answer here..."
                />
              </div>
            )}

            {currentQuestion.questionType === 'essay' && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Enter your answer:</p>
                <textarea
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => setAnswers(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  rows={6}
                  placeholder="Type your answer here..."
                />
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            
            {isLastQuestion ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Test'}
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestionIndex(Math.min(quiz.questions.length - 1, currentQuestionIndex + 1))}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next
              </button>
            )}
          </div>
        </div>

        {/* Test Navigation Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Test navigation</h3>
            <div className="grid grid-cols-5 gap-2 mb-4">
              {quiz.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-8 h-8 border rounded text-sm font-medium transition-colors ${
                    index === currentQuestionIndex
                      ? 'bg-blue-600 text-white border-blue-600'
                      : answers[quiz.questions[index].id]
                      ? 'bg-green-100 text-green-800 border-green-300'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              Submit Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentTestInterface;
