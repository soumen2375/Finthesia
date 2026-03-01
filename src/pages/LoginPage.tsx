import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { motion } from 'motion/react';

export default function LoginPage() {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Auth logic will be added in Phase 5
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
          <p className="text-slate-500">Welcome back to your command center</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              required
            />
            <div className="space-y-1">
              <Input 
                label="Password"
                type="password"
                placeholder="••••••••"
                required
              />
              <div className="flex justify-end">
                <Link to="/forgot-password" title="Forgot Password" className="text-xs font-medium text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Sign In
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-100"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="secondary" className="w-full">
              Google
            </Button>
            <Button variant="secondary" className="w-full">
              Apple
            </Button>
          </div>
        </div>

        <p className="text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-blue-600 hover:underline">
            Create one now
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
