import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { motion } from 'motion/react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { LayoutDashboard } from 'lucide-react';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
      <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
      <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
      <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
      <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
    </g>
  </svg>
);

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  // Using consistent logic though we don't have signinwithgoogle imported directly for registration, we can just redirect to login if they want to.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    try {
      setError('');
      setIsLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left side: Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-12 relative overflow-y-auto">
        <div className="absolute top-8 left-8 flex items-center space-x-2 font-bold text-xl tracking-tight text-[#00696b]">
          <LayoutDashboard className="h-6 w-6" />
          <span>Finthesia</span>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8 pt-16"
        >
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome to Finthesia</h1>
            <p className="text-slate-500">Start your experience with Finthesia by signing in or signing up.</p>
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
              <input type="checkbox" id="terms" className="mt-1 rounded border-slate-300 text-[#00696b] focus:ring-[#00696b]" required />
              <label htmlFor="terms" className="text-xs text-slate-500 leading-tight">
                I agree to the <Link to="/terms" className="text-[#00696b] hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-[#00696b] hover:underline">Privacy Policy</Link>
              </label>
            </div>

            <Button type="submit" className="w-full bg-[#00696b] hover:bg-[#005a5b] text-white py-3 rounded-xl shadow-lg shadow-[#00696b]/20 transition-all font-semibold" isLoading={isLoading}>Sign Up</Button>
          </form>
          
          <div className="text-center text-xs text-slate-500 pt-8 mt-auto pb-8">
            Copyright © Finthesia, All Right Reserved <Link to="/terms" className="text-[#00696b] hover:underline mx-2">Term & Condition</Link> | <Link to="/privacy" className="text-[#00696b] hover:underline mx-2">Privacy & Policy</Link>
          </div>
        </motion.div>
      </div>

      {/* Right side: Image/Graphic */}
      <div className="hidden lg:flex flex-1 bg-[#00696b] text-white p-12 items-center justify-center relative overflow-hidden">
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
