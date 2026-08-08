import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { LogIn, UserPlus, Mail, Lock, User, LogOut, UserCheck, Eye, EyeOff, KeyRound, ArrowLeft, ChevronDown } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { CustomSelect } from '../components/CustomSelect';
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

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const verifyOtpSchema = z.object({
  otp: z.string().length(6, 'OTP must be exactly 6 characters'),
});

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

type Input = {
  name?: string;
  email: string;
  password?: string;
  role?: 'CUSTOMER' | 'ADMIN';
  otp?: string;
};

type ForgotPasswordStep = 'none' | 'email' | 'otp' | 'reset';

export function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState<ForgotPasswordStep>('none');
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');

  const setSession = useAuthStore((s) => s.setSession);
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  // Determine current schema based on state
  let currentSchema: any = loginSchema;
  if (forgotStep === 'email') currentSchema = forgotPasswordSchema;
  else if (forgotStep === 'otp') currentSchema = verifyOtpSchema;
  else if (forgotStep === 'reset') currentSchema = resetPasswordSchema;
  else if (isSignUp) currentSchema = signupSchema;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<Input>({
    resolver: zodResolver(currentSchema),
    defaultValues: { name: '', email: '', password: '', role: 'CUSTOMER', otp: '' },
  });

  const otpValue = watch('otp') || '';
  const otpArray = otpValue.padEnd(6, ' ').split('');

  const handleOtpChange = (index: number, value: string) => {
    // Get last char if they type quickly or paste
    const char = value.slice(-1);
    if (char && !/^[0-9]$/.test(char)) return;

    const newOtp = [...otpArray];
    newOtp[index] = char || ' ';

    // If we just entered a char, we don't trim spaces in the middle, but we reconstruct the string
    // Actually, just join them and remove spaces to set the value. But wait, if they skip a box?
    // The Zod schema requires length(6), so if they skip a box it won't validate.
    // For simplicity, we just join and strip spaces, but for the UI we use otpArray.

    const finalOtp = newOtp.join('').trimEnd();
    setValue('otp', finalOtp.replace(/ /g, ''), { shouldValidate: true });

    if (char && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && (!otpArray[index] || otpArray[index] === ' ') && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
      e.preventDefault(); // prevent deleting char in prev input immediately, just focus
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (pastedData) {
      setValue('otp', pastedData, { shouldValidate: true });
      // Focus the last filled input or the next empty one
      const focusIndex = Math.min(pastedData.length, 5);
      const nextInput = document.getElementById(`otp-${focusIndex}`);
      nextInput?.focus();
    }
  };

  // Reset form inputs and errors when switching tabs/steps
  useEffect(() => {
    reset({ name: '', email: resetEmail || '', password: '', role: 'CUSTOMER', otp: '' });
  }, [isSignUp, forgotStep, reset, resetEmail]);

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

  const forgotPasswordMutation = useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: (_, variables) => {
      setResetEmail(variables.email);
      setForgotStep('otp');
      toast.success('OTP sent successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to send OTP.');
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: authApi.verifyOtp,
    onSuccess: (_, variables) => {
      setResetOtp(variables.otp);
      setForgotStep('reset');
      toast.success('OTP verified. Please enter your new password.');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Invalid or expired OTP.');
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: () => {
      setForgotStep('none');
      setResetEmail('');
      setResetOtp('');
      toast.success('Password reset successfully.');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to reset password.');
    },
  });

  const onSubmit = (data: Input) => {
    if (forgotStep === 'email') {
      forgotPasswordMutation.mutate({ email: data.email });
    } else if (forgotStep === 'otp') {
      verifyOtpMutation.mutate({ email: resetEmail, otp: data.otp || '' });
    } else if (forgotStep === 'reset') {
      resetPasswordMutation.mutate({ email: resetEmail, otp: resetOtp, password: data.password || '' });
    } else if (isSignUp) {
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

  const isLoading =
    loginMutation.isPending ||
    registerMutation.isPending ||
    forgotPasswordMutation.isPending ||
    verifyOtpMutation.isPending ||
    resetPasswordMutation.isPending;

  return (
    <section className="shell grid min-h-[calc(100vh-4rem)] place-items-center py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="panel w-full max-w-md rounded-3xl p-8 border border-slate-200/60 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl overflow-hidden relative"
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
            {forgotStep !== 'none' && (
              <button
                type="button"
                onClick={() => setForgotStep('none')}
                className="absolute top-6 left-6 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                aria-label="Back to login"
              >
                <ArrowLeft size={20} />
              </button>
            )}

            <div className="flex justify-center mb-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={forgotStep !== 'none' ? 'reset-icon' : isSignUp ? 'signup-icon' : 'login-icon'}
                  initial={{ rotate: -90, scale: 0.8, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: 90, scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-lg shadow-brand-500/20 mt-4"
                >
                  {forgotStep !== 'none' ? (
                    <KeyRound size={24} />
                  ) : isSignUp ? (
                    <UserPlus size={24} />
                  ) : (
                    <LogIn size={24} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white text-center">
              {forgotStep === 'email'
                ? 'Forgot Password'
                : forgotStep === 'otp'
                  ? 'Enter OTP'
                  : forgotStep === 'reset'
                    ? 'New Password'
                    : isSignUp
                      ? 'Create an Account'
                      : 'Welcome Back'}
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 text-center">
              {forgotStep === 'email'
                ? 'Enter your email to receive a password reset code.'
                : forgotStep === 'otp'
                  ? `Enter the 6-digit code sent to ${resetEmail}`
                  : forgotStep === 'reset'
                    ? 'Create a strong new password for your account.'
                    : isSignUp
                      ? 'Join us to place orders and track delivery in real time.'
                      : 'Secure access for customers and restaurant operators.'}
            </p>

            {forgotStep === 'none' && (
              <div className="relative flex rounded-xl bg-slate-100 p-1 dark:bg-slate-950/80 my-6">
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className={`relative z-10 flex-1 py-2 text-sm font-semibold transition-colors duration-300 focus:outline-none focus:ring-0 focus:ring-offset-0 ${!isSignUp ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
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
                  className={`relative z-10 flex-1 py-2 text-sm font-semibold transition-colors duration-300 focus:outline-none focus:ring-0 focus:ring-offset-0 ${isSignUp ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
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
            )}

            <form onSubmit={handleSubmit(onSubmit)} className={`space-y-4 ${forgotStep !== 'none' ? 'mt-6' : ''}`}>
              <AnimatePresence mode="wait">
                {isSignUp && forgotStep === 'none' && (
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
                          className="h-11 w-full rounded-xl border border-slate-200 bg-transparent pl-10 pr-4 text-sm dark:border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-black dark:text-white"
                        />
                      </div>
                      {errors.name && (
                        <span className="text-xs text-rose-600 block mt-1">{errors.name.message}</span>
                      )}
                    </label>
                  </motion.div>
                )}
              </AnimatePresence>

              {(forgotStep === 'none' || forgotStep === 'email') && (
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span>Email Address</span>
                  <div className="relative mt-1">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      {...register('email')}
                      placeholder="email@example.com"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-transparent pl-10 pr-4 text-sm dark:border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-black dark:text-white"
                    />
                  </div>
                  {errors.email && (
                    <span className="text-xs text-rose-600 block mt-1">{errors.email.message}</span>
                  )}
                </label>
              )}

              {forgotStep === 'otp' && (
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span className="mb-2 block text-center">One-Time Password (OTP)</span>
                  <div className="flex justify-center gap-2 mt-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={2} // allow 2 so we can catch the second char and use it
                        value={otpArray[i] !== ' ' ? otpArray[i] : ''}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        onPaste={handleOtpPaste}
                        className="h-14 w-12 rounded-xl border border-slate-200 bg-transparent text-center text-xl font-bold dark:border-slate-800 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-black dark:text-white transition-all shadow-sm"
                      />
                    ))}
                  </div>
                  {/* Hidden input to register with react-hook-form */}
                  <input type="hidden" {...register('otp')} />
                  {errors.otp && (
                    <span className="text-xs text-rose-600 block mt-2 text-center">{errors.otp.message}</span>
                  )}
                </label>
              )}

              {(forgotStep === 'none' || forgotStep === 'reset') && (
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span>{forgotStep === 'reset' ? 'New Password' : 'Password'}</span>
                  <div className="relative mt-1">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...register('password')}
                      placeholder="••••••••"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-transparent pl-10 pr-10 text-sm dark:border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-black dark:text-white"
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
              )}

              {!isSignUp && forgotStep === 'none' && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setForgotStep('email')}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <AnimatePresence mode="wait">
                {isSignUp && forgotStep === 'none' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mt-4">
                      <span>Account Role</span>
                      <div className="mt-1">
                        <Controller
                          name="role"
                          control={control}
                          render={({ field }) => (
                            <CustomSelect
                              value={field.value || 'CUSTOMER'}
                              onChange={field.onChange}
                              icon={<UserCheck size={16} />}
                              options={[
                                { value: 'CUSTOMER', label: 'Customer' },
                                { value: 'ADMIN', label: 'Administrator' }
                              ]}
                            />
                          )}
                        />
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
                ) : forgotStep === 'email' ? (
                  <span>Send OTP</span>
                ) : forgotStep === 'otp' ? (
                  <span>Verify OTP</span>
                ) : forgotStep === 'reset' ? (
                  <span>Reset Password</span>
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
