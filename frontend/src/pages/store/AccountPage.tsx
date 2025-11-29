import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useUserAuthStore } from '../../store/userAuth';
import { useThemeColors } from '../../hooks/useThemeColors';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { cn } from '../../lib/utils';

const AccountPage = () => {
  const navigate = useNavigate();
  const user = useUserAuthStore((state) => state.user);
  const clearAuth = useUserAuthStore((state) => state.clearAuth);
  const { getTextColor, getGlassPanelClass, getHoverEffect, getShadowClass, theme } = useThemeColors();

  const handleLogout = () => {
    clearAuth();
    toast.success('Logged out successfully');
    navigate('/');
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
      <div>
        <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold ${getTextColor('primary')}`}>My Account</h1>
        <p className={`mt-2 text-sm sm:text-base ${getTextColor('secondary')}`}>Manage your account and orders</p>
      </div>

      {/* User Info Card */}
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-500/20 text-2xl font-semibold text-brand-300">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className={`text-xl font-semibold ${getTextColor('primary')}`}>{user.name}</h2>
            <p className={`text-sm ${getTextColor('secondary')}`}>{user.email}</p>
            {user.phone && <p className={`text-sm ${getTextColor('secondary')}`}>{user.phone}</p>}
          </div>
        </div>
      </Card>

      {/* Account Options */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Profile Option */}
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className={cn(
              'rounded-full p-3',
              theme === 'light' ? 'bg-gray-100' : theme === 'elegant' ? 'bg-[#f5f1e8]' : theme === 'fashion' ? 'bg-[#f3e8ff]' : 'bg-white/10'
            )}>
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className={`text-lg font-semibold ${getTextColor('primary')}`}>Profile</h3>
              <p className={`text-sm ${getTextColor('secondary')}`}>Update your personal information</p>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={() => navigate('/profile')}
            className="w-full"
          >
            View Profile
          </Button>
        </Card>

        {/* Orders Option */}
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className={cn(
              'rounded-full p-3',
              theme === 'light' ? 'bg-gray-100' : theme === 'elegant' ? 'bg-[#f5f1e8]' : theme === 'fashion' ? 'bg-[#f3e8ff]' : 'bg-white/10'
            )}>
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className={`text-lg font-semibold ${getTextColor('primary')}`}>Orders</h3>
              <p className={`text-sm ${getTextColor('secondary')}`}>View your order history</p>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={() => navigate('/orders')}
            className="w-full"
          >
            View Orders
          </Button>
        </Card>
      </div>

      {/* Logout Button */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-lg font-semibold ${getTextColor('primary')}`}>Logout</h3>
            <p className={`text-sm ${getTextColor('secondary')}`}>Sign out of your account</p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="text-red-400 border-red-400/50 hover:bg-red-500/10"
          >
            Logout
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AccountPage;

