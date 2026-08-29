import React, { useState } from 'react';
import { Lock, Mail, User, Eye, EyeOff, Shield, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { authenticateWithEmail, createDemoSession, signInWithGoogle } from '../lib/firebaseAuth';
import { UserProfile } from '../types';

interface AuthModalProps {
  onSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await authenticateWithEmail(
        email,
        password,
        isSignUp ? 'signup' : 'signin',
        displayName
      );
      onSuccess(user);
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const user = await createDemoSession('Mindful Explorer');
      onSuccess(user);
    } catch (err: any) {
      setError('Guest sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const user = await signInWithGoogle();
      onSuccess(user);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden text-stone-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header decoration */}
        <div className="bg-gradient-to-br from-emerald-900/40 via-stone-900 to-stone-900 p-6 border-b border-stone-800 text-center relative">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-2xl mb-3 shadow-inner shadow-emerald-500/20">
            🌿
          </div>
          <h2 className="text-2xl font-serif font-bold text-stone-50 tracking-tight">Mana</h2>
          <p className="text-sm text-stone-400 mt-1">
            Empathetic AI Journal & Self-Reflection Companion
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-950/70 border border-emerald-500/30 text-emerald-300">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span>Firebase Authentication & Isolated Data Storage</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-800 bg-stone-950/40">
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setError(null); }}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              !isSignUp
                ? 'text-emerald-400 border-b-2 border-emerald-500 bg-stone-900/50'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setError(null); }}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              isSignUp
                ? 'text-emerald-400 border-b-2 border-emerald-500 bg-stone-900/50'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2">
              <span className="text-rose-400 font-bold">!</span>
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign-In Option */}
          <button
            id="btn-google-login"
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-stone-100 text-stone-900 font-medium text-sm flex items-center justify-center gap-2.5 shadow-md transition-all duration-150 cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#34A853"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#4285F4"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="font-semibold">Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-800" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
              <span className="bg-stone-900 px-3.5 text-stone-500 font-medium">or use email address</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isSignUp && (
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">Your Name / Pseudonym</label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                  <input
                    id="input-displayname"
                    type="text"
                    required={isSignUp}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Alex"
                    className="w-full bg-stone-950/80 border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                <input
                  id="input-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-stone-950/80 border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                <input
                  id="input-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-stone-950/80 border border-stone-800 rounded-xl pl-9 pr-10 py-2 text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-stone-500 hover:text-stone-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="btn-auth-submit"
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isSignUp ? 'Create Safe Space' : 'Sign In to Journal'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-stone-900 px-2 text-stone-500">or try without account</span>
            </div>
          </div>

          {/* Quick Demo Access */}
          <button
            id="btn-guest-login"
            type="button"
            onClick={handleGuestLogin}
            disabled={loading}
            className="w-full py-2 px-4 rounded-xl bg-stone-800/80 hover:bg-stone-800 border border-stone-700/70 text-stone-200 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Instant Demo Session (Guest Mode)</span>
          </button>

          {/* Privacy Note */}
          <div className="pt-2 text-[11px] text-stone-500 text-center leading-relaxed">
            🔒 <span className="font-semibold text-stone-400">Isolated & Private:</span> Your journal entries and AI conversations are securely partitioned under your Firebase UID.
          </div>
        </div>
      </div>
    </div>
  );
};
