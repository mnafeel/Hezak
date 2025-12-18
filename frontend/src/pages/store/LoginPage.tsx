import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { userLogin, userRegister, googleLogin } from '../../lib/api';
import { signInWithGoogle } from '../../lib/firebaseAuth';
import { useUserAuthStore } from '../../store/userAuth';
import { useThemeColors } from '../../hooks/useThemeColors';
import { showError } from '../../lib/errorHandler';
import { cn } from '../../lib/utils';

interface LoginForm {
  email: string;
  password: string;
}

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
}

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const setAuth = useUserAuthStore((state) => state.setAuth);
  const { getTextColor, getGlassPanelClass, getShadowClass, getHoverEffect, getGradientClass, theme } = useThemeColors();

  const loginForm = useForm<LoginForm>({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const registerForm = useForm<RegisterForm>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: ''
    }
  });

  const password = registerForm.watch('password');

  const onLoginSubmit = async (values: LoginForm) => {
    try {
      const result = await userLogin(values);
      setAuth({ user: result.user, token: result.token });
      toast.success(`Welcome back, ${result.user.name}!`);
      const from = (location.state as { from?: string })?.from || '/';
      navigate(from, { replace: true });
    } catch (error) {
      showError(error, 'Login failed. Please check your email and password.');
    }
  };

  const onRegisterSubmit = async (values: RegisterForm) => {
    try {
      if (values.password !== values.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }

      const result = await userRegister({
        name: values.name,
        email: values.email,
        password: values.password,
        phone: values.phone || undefined
      });
      setAuth({ user: result.user, token: result.token });
      toast.success(`Welcome, ${result.user.name}! Account created successfully.`);
      navigate('/', { replace: true });
    } catch (error) {
      showError(error, 'Registration failed. Please check your information and try again.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // Sign in with Google using Firebase
      const googleResult = await signInWithGoogle();
      
      // Send ID token to backend
      const result = await googleLogin({ idToken: googleResult.idToken });
      
      setAuth({ user: result.user, token: result.token });
      toast.success(`Welcome, ${result.user.name}!`);
      const from = (location.state as { from?: string })?.from || '/';
      navigate(from, { replace: true });
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        // User closed the popup, don't show error
        return;
      }
      showError(error, 'Google login failed. Please try again.');
    }
  };

  const getBackgroundGradient = () => {
    if (theme === 'elegant') {
      return 'bg-gradient-to-br from-[#faf8f3] via-[#f5f1e8] via-[#f0ebe0] to-[#ede5d8]';
    }
    if (theme === 'fashion') {
      return 'bg-gradient-to-br from-[#faf5ff] via-[#f3e8ff] to-[#ede9fe]';
    }
    if (theme === 'light') {
      return 'bg-gradient-to-br from-white via-gray-50 to-gray-100';
    }
    return 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950';
  };

  return (
    <div className={cn('fixed inset-0 w-full h-full flex items-center justify-center overflow-auto', getBackgroundGradient())}>
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {theme === 'elegant' && (
          <>
            <div className="absolute top-20 left-10 w-96 h-96 bg-[#c9a961]/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#d4a574]/10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#c9a961]/5 rounded-full blur-3xl"></div>
          </>
        )}
        {theme === 'fashion' && (
          <>
            <div className="absolute top-20 left-10 w-96 h-96 bg-[#a855f7]/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#c084fc]/10 rounded-full blur-3xl"></div>
          </>
        )}
        {theme === 'light' && (
          <>
            <div className="absolute top-20 left-10 w-96 h-96 bg-gray-200/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-gray-300/30 rounded-full blur-3xl"></div>
          </>
        )}
        {!['elegant', 'fashion', 'light'].includes(theme) && (
          <>
            <div className="absolute top-20 left-10 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-2xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8 sm:mb-12">
          <Link to="/" className="inline-flex items-center gap-3 mb-4">
            <div className={cn(
              'rounded-full p-3',
              theme === 'elegant' 
                ? 'bg-[#f5f1e8]/90 border border-[#ddd4c4] shadow-lg shadow-[#c9a961]/20'
                : theme === 'fashion'
                ? 'bg-[#f3e8ff]/90 border border-[#d8b4fe] shadow-lg shadow-[#a855f7]/20'
                : theme === 'light'
                ? 'bg-gray-200/80 border border-gray-300 shadow-lg'
                : 'bg-white/10 border border-white/20 shadow-lg'
            )}>
              <span className={cn(
                'font-display text-2xl',
                theme === 'elegant' ? 'text-[#2d1b0e]' : theme === 'fashion' ? 'text-[#581c87]' : theme === 'light' ? 'text-gray-900' : 'text-white'
              )}>H</span>
            </div>
            <div>
              <p className={cn(
                'font-display text-3xl sm:text-4xl font-bold',
                theme === 'light' ? 'text-gray-900' : theme === 'elegant' ? 'text-[#2d1b0e]' : theme === 'fashion' ? 'text-[#581c87]' : 'text-white'
              )}>Hezak Boutique</p>
              <p className={cn(
                'text-sm sm:text-base mt-1',
                theme === 'light' ? 'text-gray-700' : theme === 'elegant' ? 'text-[#3d2817]' : theme === 'fashion' ? 'text-[#6b21a8]' : 'text-slate-300'
              )}>Premium Lifestyle Curation</p>
            </div>
          </Link>
        </div>

        {/* Login Card */}
        <div className={cn(
          'w-full rounded-3xl border backdrop-blur-xl',
          getGlassPanelClass(),
          getShadowClass('xl'),
          theme === 'elegant'
            ? 'bg-[#faf8f3]/95 border-[#e8ddd0]'
            : theme === 'fashion'
            ? 'bg-[#faf5ff]/95 border-[#e9d5ff]'
            : theme === 'light'
            ? 'bg-white/95 border-gray-200'
            : 'bg-white/5 border-white/10'
        )}>
          <div className="p-6 sm:p-8 md:p-10 lg:p-12 space-y-6 sm:space-y-8">
            {/* Header */}
            <div className="space-y-3 text-center">
              <h1 className={cn(
                'text-3xl sm:text-4xl md:text-5xl font-bold',
                theme === 'light' ? 'text-gray-900' : theme === 'elegant' ? 'text-[#2d1b0e]' : theme === 'fashion' ? 'text-[#581c87]' : 'text-white'
              )}>
                {isRegisterMode ? 'Create Your Account' : 'Welcome Back'}
              </h1>
              <p className={cn(
                'text-base sm:text-lg',
                theme === 'light' ? 'text-gray-700' : theme === 'elegant' ? 'text-[#3d2817]' : theme === 'fashion' ? 'text-[#6b21a8]' : 'text-slate-300'
              )}>
                {isRegisterMode
                  ? 'Join us to discover premium fashion and lifestyle products'
                  : 'Sign in to continue your premium shopping experience'}
              </p>
            </div>

            {/* Toggle Buttons */}
            <div className={cn(
              'flex gap-2 rounded-2xl p-1.5',
              theme === 'elegant'
                ? 'bg-[#f5f1e8] border border-[#ddd4c4]'
                : theme === 'fashion'
                ? 'bg-[#f3e8ff] border border-[#d8b4fe]'
                : theme === 'light'
                ? 'bg-gray-100 border border-gray-300'
                : 'bg-white/5 border border-white/10'
            )}>
              <button
                type="button"
                onClick={() => setIsRegisterMode(false)}
                className={cn(
                  'flex-1 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-300',
                  !isRegisterMode
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
                    : cn(
                        getTextColor('secondary'),
                        theme === 'elegant' ? 'hover:bg-[#f0ebe0]' : theme === 'fashion' ? 'hover:bg-[#ede9fe]' : theme === 'light' ? 'hover:bg-gray-200' : 'hover:bg-white/10'
                      )
                )}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setIsRegisterMode(true)}
                className={cn(
                  'flex-1 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-300',
                  isRegisterMode
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
                    : cn(
                        getTextColor('secondary'),
                        theme === 'elegant' ? 'hover:bg-[#f0ebe0]' : theme === 'fashion' ? 'hover:bg-[#ede9fe]' : theme === 'light' ? 'hover:bg-gray-200' : 'hover:bg-white/10'
                      )
                )}
              >
                Create Account
              </button>
            </div>

            {/* Google Login Button */}
            <div className="space-y-4">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleGoogleLogin}
                className="w-full text-base py-6 flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className={cn('w-full border-t', theme === 'elegant' ? 'border-[#ddd4c4]' : theme === 'fashion' ? 'border-[#d8b4fe]' : theme === 'light' ? 'border-gray-300' : 'border-white/20')}></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className={cn(
                    'px-4 bg-inherit',
                    theme === 'light' ? 'text-gray-600' : theme === 'elegant' ? 'text-[#5a4a3a]' : theme === 'fashion' ? 'text-[#7c3aed]' : 'text-slate-400'
                  )}>
                    {isRegisterMode ? 'Or create account with email' : 'Or sign in with email'}
                  </span>
                </div>
              </div>
            </div>

            {/* Forms */}
            {!isRegisterMode ? (
              <form className="space-y-5 sm:space-y-6" onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                <div className="space-y-4">
                  <Input
                    label="Email address"
                    type="email"
                    required
                    {...loginForm.register('email', { required: 'Email is required' })}
                    error={loginForm.formState.errors.email?.message}
                  />
                  <Input
                    label="Password"
                    type="password"
                    required
                    {...loginForm.register('password', { required: 'Password is required' })}
                    error={loginForm.formState.errors.password?.message}
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  disabled={loginForm.formState.isSubmitting}
                  className="w-full text-base py-6"
                >
                  {loginForm.formState.isSubmitting ? 'Signing in…' : 'Sign In'}
                </Button>
              </form>
            ) : (
              <form className="space-y-5 sm:space-y-6" onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div className="sm:col-span-2">
                    <Input
                      label="Full Name"
                      required
                      {...registerForm.register('name', { required: 'Name is required' })}
                      error={registerForm.formState.errors.name?.message}
                    />
                  </div>
                  <Input
                    label="Email address"
                    type="email"
                    required
                    {...registerForm.register('email', { required: 'Email is required' })}
                    error={registerForm.formState.errors.email?.message}
                  />
                  <Input
                    label="Phone (Optional)"
                    type="tel"
                    {...registerForm.register('phone')}
                    error={registerForm.formState.errors.phone?.message}
                  />
                  <Input
                    label="Password"
                    type="password"
                    required
                    {...registerForm.register('password', {
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' }
                    })}
                    error={registerForm.formState.errors.password?.message}
                  />
                  <Input
                    label="Confirm Password"
                    type="password"
                    required
                    {...registerForm.register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) => value === password || 'Passwords do not match'
                    })}
                    error={registerForm.formState.errors.confirmPassword?.message}
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  disabled={registerForm.formState.isSubmitting}
                  className="w-full text-base py-6"
                >
                  {registerForm.formState.isSubmitting ? 'Creating account…' : 'Create Account'}
                </Button>
              </form>
            )}

            {/* Footer Link */}
            <div className="text-center pt-4">
              <Link 
                to="/" 
                className={cn(
                  'text-sm inline-flex items-center gap-2 transition',
                  getTextColor('secondary'),
                  theme === 'elegant' ? 'hover:text-[#c9a961]' : theme === 'fashion' ? 'hover:text-[#a855f7]' : 'hover:text-brand-400'
                )}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

