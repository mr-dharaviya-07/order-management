import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { LogIn, UserPlus, Mail, Lock, User, LogOut, UserCheck, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { authApi } from '../services/api';
import { useAuthStore } from '../store/auth.store';
import { motion, AnimatePresence } from 'framer-motion';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  role: z.enum(['CUSTOMER', 'ADMIN']).default('CUSTOMER'),
});

type Input = {
  name?: string;
  email: string;
  password?: string;
  role?: 'CUSTOMER' | 'ADMIN';
};

export function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const setSession = useAuthStore((s) => s.setSession);
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Input>({
    resolver: zodResolver(isSignUp ? signupSchema : loginSchema),
    defaultValues: { name: '', email: '', password: '', role: 'CUSTOMER' },
  });

  // Reset form inputs and errors when switching tabs
  useEffect(() => {
    reset({ name: '', email: '', password: '', role: 'CUSTOMER' });
  }, [isSignUp, reset]);

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (session) => {
      setSession({ user: session.user, accessToken: session.accessToken });
      toast.success(`Welcome back, ${session.user.name}!`);
      if (session.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Login failed. Please check your credentials.');
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (session) => {
      setSession({ user: session.user, accessToken: session.accessToken });
      toast.success(`Account created! Welcome, ${session.user.name}!`);
      if (session.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Registration failed. Email might already be in use.');
    },
  });

  const onSubmit = (data: Input) => {
    if (isSignUp) {
      registerMutation.mutate({
        name: data.name || '',
        email: data.email,
        password: data.password || '',
        role: data.role || 'CUSTOMER',
      });
    } else {
      loginMutation.mutate({
        email: data.email,
        password: data.password || '',
      });
    }
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <section className="shell grid min-h-[calc(100vh-4rem)] place-items-center py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="panel w-full max-w-md rounded-3xl p-8 border border-slate-200/60 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl"
      >
        {user ? (
          <div className="text-center">
            <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
              <User size={30} />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
              Hello, {user.name}
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Logged in as <span className="font-semibold text-brand-600 dark:text-brand-400">{user.email}</span> ({user.role})
            </p>
            <button
              onClick={() => {
                logout();
                toast.success('Logged out successfully');
              }}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-850 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 active:scale-[0.98] transition-all shadow-sm"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        ) : (
          <div>
            <div className="flex justify-center mb-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={isSignUp ? 'signup-icon' : 'login-icon'}
                  initial={{ rotate: -90, scale: 0.8, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: 90, scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-lg shadow-brand-500/20"
                >
                  {isSignUp ? <UserPlus size={24} /> : <LogIn size={24} />}
                </motion.div>
              </AnimatePresence>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white text-center">
              {isSignUp ? 'Create an Account' : 'Welcome Back'}
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 text-center">
              {isSignUp
                ? 'Join us to place orders and track delivery in real time.'
                : 'Secure access for customers and restaurant operators.'}
            </p>

            {/* Slide Tab Switch */}
            <div className="relative flex rounded-xl bg-slate-100 p-1 dark:bg-slate-950/80 my-6">
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className={`relative z-10 flex-1 py-2 text-sm font-semibold transition-colors duration-300 focus:outline-none focus:ring-0 focus:ring-offset-0 ${
                  !isSignUp ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Sign In
                {!isSignUp && (
                  <motion.div
                    layoutId="activeAuthTab"
                    className="absolute inset-0 -z-10 rounded-lg bg-white shadow-sm dark:bg-slate-900"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className={`relative z-10 flex-1 py-2 text-sm font-semibold transition-colors duration-300 focus:outline-none focus:ring-0 focus:ring-offset-0 ${
                  isSignUp ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Sign Up
                {isSignUp && (
                  <motion.div
                    layoutId="activeAuthTab"
                    className="absolute inset-0 -z-10 rounded-lg bg-white shadow-sm dark:bg-slate-900"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <AnimatePresence mode="wait">
                {isSignUp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                      <span>Full Name</span>
                      <div className="relative mt-1">
                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          {...register('name')}
                          placeholder="John Doe"
                          className="h-11 w-full rounded-xl border border-slate-200 bg-transparent pl-10 pr-4 text-sm dark:border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:text-white"
                        />
                      </div>
                      {errors.name && (
                        <span className="text-xs text-rose-600 block mt-1">{errors.name.message}</span>
                      )}
                    </label>
                  </motion.div>
                )}
              </AnimatePresence>

              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>Email Address</span>
                <div className="relative mt-1">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    {...register('email')}
                    placeholder="email@example.com"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-transparent pl-10 pr-4 text-sm dark:border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:text-white"
                  />
                </div>
                {errors.email && (
                  <span className="text-xs text-rose-600 block mt-1">{errors.email.message}</span>
                )}
              </label>

              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>Password</span>
                <div className="relative mt-1">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    placeholder="••••••••"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-transparent pl-10 pr-10 text-sm dark:border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 dark:hover:text-slate-300 transition-colors focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <span className="text-xs text-rose-600 block mt-1">{errors.password.message}</span>
                )}
              </label>

              <AnimatePresence mode="wait">
                {isSignUp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                      <span>Account Role</span>
                      <div className="relative mt-1">
                        <UserCheck size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select
                          {...register('role')}
                          className="h-11 w-full rounded-xl border border-slate-200 bg-transparent pl-10 pr-4 text-sm dark:border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:text-white dark:bg-slate-900 cursor-pointer"
                        >
                          <option value="CUSTOMER">Customer</option>
                          <option value="ADMIN">Administrator</option>
                        </select>
                      </div>
                    </label>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 py-3 font-semibold text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none mt-6"
              >
                {isLoading ? (
                  <span>Processing...</span>
                ) : isSignUp ? (
                  <>
                    <UserPlus size={18} />
                    <span>Create Account</span>
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </motion.div>
    </section>
  );
}
