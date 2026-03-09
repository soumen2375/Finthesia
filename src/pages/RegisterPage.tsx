import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { motion } from 'motion/react';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold italic text-slate-900 tracking-tight">Finthesia</h1>
          <p className="text-slate-500">Start your journey to financial freedom</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              label="Full Name"
              type="text"
              placeholder="John Doe"
              required
            />
            <Input 
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              required
            />
            <Input 
              label="Password"
              type="password"
              placeholder="••••••••"
              required
            />
            <Input 
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              required
            />
            
            <div className="flex items-start space-x-2 py-2">
              <input type="checkbox" id="terms" className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-600" required />
              <label htmlFor="terms" className="text-xs text-slate-500 leading-tight">
                I agree to the <Link to="/terms" className="text-blue-600 hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
              </label>
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Create Account
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:underline">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
