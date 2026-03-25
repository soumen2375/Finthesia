import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { motion } from 'motion/react';
import { supabase } from '@/lib/supabaseClient';
import { LayoutDashboard, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setError('');
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (resetError) throw resetError;
      setIsSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left side: Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-12 relative overflow-y-auto">
        <div className="absolute top-8 left-8 flex items-center space-x-2 font-bold text-xl tracking-tight text-[#27C4E1]">
          <LayoutDashboard className="h-6 w-6" />
          <span>Finthesia</span>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8 my-auto pt-16"
        >
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Reset Password</h1>
            <p className="text-slate-500">Enter your email address to receive a password reset link.</p>
          </div>

          {!isSent ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm border border-red-100">{error}</div>}
              
              <Input 
                label="Email Address *" 
                type="email" 
                placeholder="Enter your registered email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
              
              <Button type="submit" className="w-full bg-[#27C4E1] hover:bg-[#1EB0CC] text-white py-3 rounded-xl shadow-lg shadow-[#27C4E1]/20 transition-all font-semibold" isLoading={isLoading}>
                Send Reset Link
              </Button>
            </form>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-50 p-8 rounded-3xl border border-slate-100 text-center space-y-4 shadow-sm"
            >
              <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Check your email</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                We've sent password reset instructions to <span className="font-semibold text-slate-700">{email}</span>. Please check your inbox and your spam folder.
              </p>
              <div className="pt-4">
                <Button variant="secondary" className="w-full py-3" onClick={() => setIsSent(false)}>
                  Try another email
                </Button>
              </div>
            </motion.div>
          )}

          <div className="flex justify-center pt-6">
            <Link to="/login" className="flex items-center text-sm font-semibold text-[#27C4E1] hover:text-[#1EB0CC] hover:underline transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign In
            </Link>
          </div>
          
          <div className="text-center text-xs text-slate-500 pt-8 mt-auto pb-8">
            Copyright © Finthesia, All Right Reserved <Link to="/terms" className="text-[#27C4E1] hover:underline mx-2">Term & Condition</Link> | <Link to="/privacy-policy" className="text-[#27C4E1] hover:underline mx-2">Privacy & Policy</Link>
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
