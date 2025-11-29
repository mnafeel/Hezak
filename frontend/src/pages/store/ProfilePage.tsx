import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { useUserAuthStore } from '../../store/userAuth';
import { useThemeColors } from '../../hooks/useThemeColors';
import { updateUserProfile } from '../../lib/api';
import { showError } from '../../lib/errorHandler';

interface ProfileForm {
  name: string;
  phone: string;
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const user = useUserAuthStore((state) => state.user);
  const { getTextColor, theme } = useThemeColors();
  const setAuth = useUserAuthStore((state) => state.setAuth);
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<ProfileForm>({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || ''
    }
  });

  // Reset form when user data changes
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        phone: user.phone || ''
      });
    }
  }, [user, reset]);

  const onSubmit = async (values: ProfileForm) => {
    if (!user) return;

    try {
      const result = await updateUserProfile({
        name: values.name,
        phone: values.phone || null
      });
      
      // Update the user in the store
      setAuth({ user: result.user, token: useUserAuthStore.getState().token! });
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      showError(error, 'Failed to update profile. Please try again.');
    }
  };

  const handleCancel = () => {
    reset({
      name: user?.name || '',
      phone: user?.phone || ''
    });
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h2 className={`text-2xl font-semibold ${getTextColor('primary')}`}>Please log in</h2>
          <Button variant="secondary" onClick={() => navigate('/login')} className="mt-4">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Profile Section */}
      <Card className="space-y-4 sm:space-y-6 p-4 sm:p-6 md:p-8">
        <div>
          <h1 className={`text-2xl sm:text-3xl font-bold ${getTextColor('primary')}`}>My Profile</h1>
          <p className={`mt-2 text-sm sm:text-base ${getTextColor('secondary')}`}>Manage your account information</p>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-brand-500/20 text-xl sm:text-2xl font-semibold text-brand-300">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className={`text-xl sm:text-2xl font-semibold ${getTextColor('primary')}`}>{user.name}</h2>
            <p className={`text-sm sm:text-base ${getTextColor('secondary')}`}>{user.email}</p>
            {user.phone && <p className={`text-sm sm:text-base ${getTextColor('secondary')}`}>{user.phone}</p>}
          </div>
        </div>

        <div className={`space-y-4 border-t ${theme === 'light' ? 'border-gray-200' : 'border-white/10'} pt-6`}>
          {!isEditing ? (
            <>
              <div>
                <label className={`text-sm font-semibold ${getTextColor('secondary')}`}>Full Name</label>
                <p className={`mt-1 text-lg ${getTextColor('primary')}`}>{user.name}</p>
              </div>
              <div>
                <label className={`text-sm font-semibold ${getTextColor('secondary')}`}>Email Address</label>
                <p className={`mt-1 text-lg ${getTextColor('primary')}`}>{user.email}</p>
                <p className={`mt-1 text-xs ${getTextColor('tertiary')}`}>Email cannot be changed</p>
              </div>
              <div>
                <label className={`text-sm font-semibold ${getTextColor('secondary')}`}>Phone Number</label>
                <p className={`mt-1 text-lg ${getTextColor('primary')}`}>{user.phone || 'Not provided'}</p>
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Full Name"
                required
                {...register('name', { required: 'Name is required' })}
                error={errors.name?.message}
              />
              <div>
                <label className={`text-sm font-semibold ${getTextColor('secondary')}`}>Email Address</label>
                <p className={`mt-1 text-lg ${getTextColor('primary')}`}>{user.email}</p>
                <p className={`mt-1 text-xs ${getTextColor('tertiary')}`}>Email cannot be changed</p>
              </div>
              <Input
                label="Phone Number"
                type="tel"
                {...register('phone')}
                error={errors.phone?.message}
                placeholder="Enter your phone number (optional)"
              />
              <div className="flex gap-3">
                <Button
                  type="submit"
                  variant="secondary"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>

        <div className="flex gap-3 border-t border-white/10 pt-6">
          {!isEditing && (
            <Button variant="secondary" onClick={() => setIsEditing(true)} className="flex-1">
              Edit Profile
            </Button>
          )}
          <Button variant="secondary" onClick={() => navigate('/')} className="flex-1">
            Continue Shopping
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ProfilePage;

