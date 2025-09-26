'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { LoginFormData } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    apiKey: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [showKey, setShowKey] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isMounted, setIsMounted] = useState(false);
  const isDark = theme === "dark";

  useEffect(() => {
    setIsMounted(true);
    
    const stored = localStorage.getItem("theme") as "light" | "dark" | null;
    if (stored) {
      setTheme(stored);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }

    // Check if already authenticated
    if (localStorage.getItem('jal_api_key')) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!formData.apiKey.trim()) {
        throw new Error("Please enter your API key.");
      }

      // Use the local API route instead of direct API client
      console.log('Attempting login with API key:', formData.apiKey.substring(0, 8) + '...');
      
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: formData.apiKey }),
      });

      console.log('API response status:', response.status);
      const result = await response.json();
      console.log('API response data:', result);

      if (!response.ok) {
        throw new Error(result.error || `Server error: ${response.status}`);
      }

      if (result.success && result.user) {
        // Store authentication data
        localStorage.setItem('jal_api_key', formData.apiKey);
        localStorage.setItem('jal_user', JSON.stringify(result.user));
        
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        throw new Error(result.error || 'Authentication failed');
      }
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <img 
              src="/img/jal-logo.png"
              alt="Japan Airlines Logo"
              className="w-12 h-12 object-contain"
            />
          </div>
          <p className="text-xl text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDark ? "bg-black text-white" : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-900"
    }`}>
      {/* Background */}
      <div className={`absolute inset-0 z-0 transition-all duration-500 ${
        isDark 
          ? "bg-gradient-to-br from-blue-900/40 via-purple-900/30 to-black/90" 
          : "bg-gradient-to-br from-blue-100/50 via-purple-100/40 to-indigo-100/70"
      }`} />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`w-full max-w-md backdrop-blur-xl rounded-3xl border shadow-2xl overflow-hidden ${
            isDark 
              ? "bg-white/5 border-white/10" 
              : "bg-white/60 border-white/20"
          }`}
        >
          {/* Header */}
          <div className="p-8 border-b border-gray-200/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <img 
                  src={isDark ? "/img/jal-logo-dark.png" : "/img/jal-logo.png"}
                  alt="JAL Logo"
                  className="w-10 h-10 object-contain"
                />
                <div>
                  <h1 className="text-xl font-bold">JAL Training Portal</h1>
                  <p className="text-sm opacity-70">Pilot Authentication</p>
                </div>
              </div>
              
              <button
                onClick={() => {
                  const newTheme = isDark ? "light" : "dark";
                  setTheme(newTheme);
                  localStorage.setItem("theme", newTheme);
                }}
                className={`p-2 rounded-lg transition-colors ${
                  isDark 
                    ? "hover:bg-white/10" 
                    : "hover:bg-gray-100"
                }`}
              >
                <span className="text-xl">{isDark ? "☀️" : "🌙"}</span>
              </button>
            </div>

            <div className="text-center">
              <h2 className={`text-2xl font-bold mb-2 ${
                isDark ? "text-white" : "text-gray-900"
              }`}>
                Welcome Back
              </h2>
              <p className={`text-sm ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}>
                Enter your JAL Virtual API key to access the training portal
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <label htmlFor="apiKey" className={`block text-sm font-medium mb-2 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}>
                Pilot API Key
              </label>
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  id="apiKey"
                  name="apiKey"
                  value={formData.apiKey}
                  onChange={handleInputChange}
                  placeholder="Enter your JAL Virtual Pilot API key"
                  className={`w-full px-4 py-3 rounded-2xl border transition-all duration-200 focus:outline-none focus:ring-2 tracking-widest pr-12 font-mono ${
                    isDark 
                      ? "bg-white/10 border-white/20 focus:ring-blue-500/50 text-white placeholder-gray-400" 
                      : "bg-white/80 border-white/40 focus:ring-blue-500/50 text-gray-900 placeholder-gray-500"
                  } backdrop-blur-sm`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium transition-colors ${
                    isDark 
                      ? "text-gray-300 hover:text-white" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {showKey ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl border ${
                  isDark 
                    ? "bg-red-500/10 border-red-500/20 text-red-300" 
                    : "bg-red-100/80 border-red-200/60 text-red-600"
                }`}
                role="alert"
              >
                <p className="text-sm font-medium">{error}</p>
              </motion.div>
            )}

            <div className="space-y-4">
              <motion.button
                type="submit"
                disabled={loading}
                className={`w-full px-6 py-4 rounded-2xl font-medium transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 ${
                  isDark 
                    ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-500/25" 
                    : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white shadow-lg shadow-red-500/25"
                } backdrop-blur-sm`}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading && (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a 8 8 0 0 1 8-8v2a6 6 0 0 0-6 6H4z" />
                  </svg>
                )}
                {loading ? "Authenticating..." : "Login to Training Portal"}
              </motion.button>

              <button
                type="button"
                onClick={handleBackToHome}
                className={`w-full px-6 py-3 rounded-2xl font-medium transition-all duration-200 ${
                  isDark 
                    ? "bg-white/10 border border-white/20 hover:bg-white/20 text-white" 
                    : "bg-white/60 border border-white/40 hover:bg-white/80 text-gray-900"
                } backdrop-blur-sm`}
              >
                Back to Home
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className={`px-8 py-4 border-t border-gray-200/20 ${
            isDark ? "bg-white/5" : "bg-gray-50/50"
          }`}>
            <p className={`text-xs text-center ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}>
              Your API key is validated via JAL Virtual system using X-API-Key authentication.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
