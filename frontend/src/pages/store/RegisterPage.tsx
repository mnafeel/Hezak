import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { userRegister } from '../../lib/api';
import { useUserAuthStore } from '../../store/userAuth';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
}

const RegisterPage = () => {
  const navigate = useNavigate();
  const setAuth = useUserAuthStore((state) => state.setAuth);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<RegisterForm>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: ''
    }
  });

  const password = watch('password');

  const onSubmit = async (values: RegisterForm) => {
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
      const message = error instanceof Error ? error.message : 'Registration failed';
      toast.error(message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-6 py-16">
      <Card className="w-full max-w-xl space-y-8 p-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold text-white">Create Account</h1>
          <p className="text-sm text-slate-300">
            Join us to start shopping premium products
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Full Name"
            required
            {...register('name', { required: 'Name is required' })}
            error={errors.name?.message}
          />
          <Input
            label="Email address"
            type="email"
            required
            {...register('email', { required: 'Email is required' })}
            error={errors.email?.message}
          />
          <Input
            label="Phone (Optional)"
            type="tel"
            {...register('phone')}
            error={errors.phone?.message}
          />
          <Input
            label="Password"
            type="password"
            required
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Password must be at least 6 characters' }
            })}
            error={errors.password?.message}
          />
          <Input
            label="Confirm Password"
            type="password"
            required
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) => value === password || 'Passwords do not match'
            })}
            error={errors.confirmPassword?.message}
          />
          <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Creating account…' : 'Create Account'}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-400 hover:text-brand-300">
              Sign in
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage;


