import { useEffect, useLayoutEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { adminLogin } from '../../lib/api';
import { useAdminAuthStore } from '../../store/adminAuth';
import { useAdminPath } from '../../hooks/useAdminPath';
import { applyTheme } from '../../store/theme';
import { showError } from '../../lib/errorHandler';

interface AdminLoginForm {
  email: string;
  password: string;
}

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { adminSlug } = useParams<{ adminSlug: string }>();
  const { data } = useAdminPath();
  const setAuth = useAdminAuthStore((state) => state.setAuth);

  // Ensure admin login page always uses dark theme - apply synchronously and continuously
  useLayoutEffect(() => {
    if (typeof window !== 'undefined' && document.documentElement) {
      applyTheme('dark');
    }
  }, []);

  // Also apply on every render to prevent theme changes from affecting admin
  useEffect(() => {
    if (typeof window !== 'undefined' && document.documentElement) {
      applyTheme('dark');
    }
  });

  // Listen for theme changes and immediately revert to dark for admin
  useEffect(() => {
    const handleThemeChange = () => {
      if (typeof window !== 'undefined' && document.documentElement) {
        applyTheme('dark');
      }
    };
    
    // Check periodically to ensure dark theme is maintained
    const interval = setInterval(handleThemeChange, 100);
    
    return () => clearInterval(interval);
  }, []);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<AdminLoginForm>({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (values: AdminLoginForm) => {
    try {
      const result = await adminLogin(values);
      setAuth({ token: result.token, email: values.email });
      toast.success('Welcome back to the admin console.');
      const targetSlug = data?.adminPath ?? adminSlug ?? 'admin';
      navigate(`/${targetSlug}/dashboard`, { replace: true });
    } catch (error) {
      showError(error, 'Login failed. Please check your email and password.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-16">
      <Card className="w-full max-w-xl space-y-8 p-8">
        <div className="space-y-2 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-brand-300">Admin Portal</p>
          <h1 className="text-3xl font-semibold text-white">Hezak Boutique</h1>
          <p className="text-sm text-slate-300">
            Sign in to manage collections, orders, and performance insights.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Email address"
            type="email"
            required
            {...register('email', { required: 'Email is required' })}
            error={errors.email?.message}
          />
          <Input
            label="Password"
            type="password"
            required
            {...register('password', { required: 'Password is required' })}
            error={errors.password?.message}
          />
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default AdminLoginPage;

