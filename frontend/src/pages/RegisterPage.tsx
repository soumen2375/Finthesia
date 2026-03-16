import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabaseClient';
import { LayoutDashboard, ArrowLeft } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signInWithGoogleIdToken, currentUser } = useAuth();

  // Redirect if already authenticated
  if (currentUser) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    try {
      setError('');
      setIsLoading(true);
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
        },
      });
      if (signUpError) throw signUpError;
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setError('');
      setIsLoading(true);
      if (credentialResponse.credential) {
        await signInWithGoogleIdToken(credentialResponse.credential);
      }
    } catch (err: any) {
      setError('Failed to sign in with Google');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left side: Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-12 relative overflow-y-auto">
        <Link to="/" className="absolute top-8 left-8 flex items-center space-x-2 font-medium text-slate-500 hover:text-slate-900 transition-colors bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm hover:shadow-md">
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8 pt-16"
        >
          <div className="text-center space-y-3">
            <Link to="/" className="inline-block mb-4">
               <span className="text-4xl font-extrabold tracking-tight">
                 <span className="text-slate-700 hover:text-slate-900 transition-colors">fin</span><span className="text-[#27C4E1]">thesia</span>
               </span>
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome to Finthesia</h1>
            <p className="text-slate-500">Start your experience with Finthesia</p>
          </div>

          <div className="flex bg-slate-100 p-1.5 rounded-full mx-auto max-w-[280px]">
            <Link to="/login" className="flex-1 text-center py-2 text-sm font-medium rounded-full text-slate-500 hover:text-slate-900 transition-colors">Sign In</Link>
            <Link to="/register" className="flex-1 text-center py-2 text-sm font-semibold rounded-full bg-white shadow-sm text-slate-900 transition-colors">Sign Up</Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm border border-red-100">{error}</div>}
            
            <Input label="Full Name *" type="text" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Email Address *" type="email" placeholder="Enter your email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="Password *" type="password" placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Input label="Confirm Password *" type="password" placeholder="Confirm your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            
            <div className="flex items-start space-x-2 py-2">
              <input type="checkbox" id="terms" className="mt-1 rounded border-slate-300 text-[#27C4E1] focus:ring-[#27C4E1]" required />
              <label htmlFor="terms" className="text-xs text-slate-500 leading-tight">
                I agree to the <Link to="/terms" className="text-[#27C4E1] hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-[#27C4E1] hover:underline">Privacy Policy</Link>
              </label>
            </div>

            <Button type="submit" className="w-full bg-[#27C4E1] hover:bg-[#1EB0CC] text-white py-3 rounded-xl shadow-lg shadow-[#27C4E1]/20 transition-all font-semibold" isLoading={isLoading}>Sign Up</Button>
          </form>

          <div className="relative pt-4">
            <div className="absolute inset-x-0 top-1/2 flex items-center"><span className="w-full border-t border-slate-200"></span></div>
            <div className="relative flex justify-center text-xs text-slate-400"><span className="bg-white px-4">Or continue with</span></div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google sign in failed')}
              theme="outline"
              shape="pill"
            />
          </div>
          
          <div className="text-center text-xs text-slate-500 pt-8 mt-auto pb-8">
            <span>Copyright © Finthesia, All Rights Reserved</span>
          </div>
        </motion.div>
      </div>

      {/* Right side: Image/Graphic */}
      <div className="hidden lg:flex flex-1 bg-[#27C4E1] text-white p-12 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        <div className="relative z-10 max-w-md text-center space-y-6">
          <div className="h-20 w-20 bg-white/10 rounded-3xl backdrop-blur-md flex items-center justify-center mx-auto mb-8 border border-white/20 shadow-2xl">
            <LayoutDashboard className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold leading-tight tracking-tight">A Unified Hub for Smarter Financial Decision-Making</h2>
          <p className="text-white/70 text-lg leading-relaxed">Finthesia empowers you with a unified financial command center—delivering deep insights and a 360° view of your entire economic world.</p>
        </div>
      </div>
    </div>
  );
}
