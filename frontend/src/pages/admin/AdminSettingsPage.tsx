import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAdminPath, useUpdateAdminPath } from '../../hooks/useAdminPath';
import { useFeaturedCount, useUpdateFeaturedCount } from '../../hooks/useFeaturedCount';
import { useStoreName, useUpdateStoreName } from '../../hooks/useStoreName';
import { useAdminAuthStore } from '../../store/adminAuth';

interface AdminPathForm {
  adminPath: string;
}

interface FeaturedCountForm {
  featuredCount: number;
}

interface StoreNameForm {
  storeName: string;
}

const AdminSettingsPage = () => {
  const { adminSlug } = useParams<{ adminSlug: string }>();
  const navigate = useNavigate();
  const { clearAuth } = useAdminAuthStore();
  const { data, isLoading } = useAdminPath();
  const { mutateAsync, isPending } = useUpdateAdminPath();
  const featuredCountData = useFeaturedCount();
  const { mutateAsync: updateFeaturedCount, isPending: isUpdatingFeatured } = useUpdateFeaturedCount();
  const storeNameData = useStoreName();
  const { mutateAsync: updateStoreName, isPending: isUpdatingStoreName } = useUpdateStoreName();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<AdminPathForm>({
    defaultValues: {
      adminPath: data?.adminPath ?? ''
    }
  });
  
  const {
    register: registerFeatured,
    handleSubmit: handleSubmitFeatured,
    reset: resetFeatured,
    formState: { errors: featuredErrors }
  } = useForm<FeaturedCountForm>({
    defaultValues: {
      featuredCount: featuredCountData.data ?? 3
    }
  });

  const {
    register: registerStoreName,
    handleSubmit: handleSubmitStoreName,
    reset: resetStoreName,
    formState: { errors: storeNameErrors }
  } = useForm<StoreNameForm>({
    defaultValues: {
      storeName: storeNameData.data?.storeName ?? 'Hezak Boutique'
    }
  });

  useEffect(() => {
    if (data?.adminPath) {
      reset({ adminPath: data.adminPath });
    }
  }, [data, reset]);
  
  useEffect(() => {
    if (featuredCountData.data !== undefined) {
      resetFeatured({ featuredCount: featuredCountData.data });
    }
  }, [featuredCountData.data, resetFeatured]);

  useEffect(() => {
    if (storeNameData.data?.storeName) {
      resetStoreName({ storeName: storeNameData.data.storeName });
    }
  }, [storeNameData.data, resetStoreName]);

  const onSubmit = async (values: AdminPathForm) => {
    try {
      const result = await mutateAsync({ adminPath: values.adminPath });
      toast.success(`Admin path updated. Use /${result.adminPath} to access the console.`);

      // Wait a moment for the cache to update
      await new Promise(resolve => setTimeout(resolve, 100));

      // Clear auth to force re-login at new path
      clearAuth();
      
      // Navigate to the new path
      const newPath = `/${result.adminPath}/login`;
      window.location.href = newPath; // Use window.location for full page reload to ensure clean state
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update admin path';
      toast.error(message);
    }
  };
  
  const onSubmitFeatured = async (values: FeaturedCountForm) => {
    try {
      await updateFeaturedCount({ featuredCount: values.featuredCount });
      toast.success(`Featured items count updated to ${values.featuredCount}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update featured count';
      toast.error(message);
    }
  };

  const onSubmitStoreName = async (values: StoreNameForm) => {
    try {
      await updateStoreName(values.storeName);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update store name';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <Card title="Admin access settings">
        <p className="text-sm text-slate-200">
          Change the private admin URL slug. Share the new path only with trusted team members. You
          will be logged out and redirected to the new path after saving.
        </p>
      </Card>

      <Card title="Admin path" className="max-w-xl">
        {isLoading ? (
          <p className="text-sm text-slate-200">Loading current settings…</p>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Admin URL slug"
              placeholder="e.g. executive-portal"
              {...register('adminPath', {
                required: 'Admin path is required',
                pattern: {
                  value: /^[a-z0-9-]+$/,
                  message: 'Use only lowercase letters, numbers, and hyphens'
                },
                minLength: {
                  value: 3,
                  message: 'Must be at least 3 characters'
                },
                maxLength: {
                  value: 30,
                  message: 'Must be at most 30 characters'
                }
              })}
              error={errors.adminPath?.message}
            />
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
              <p>
                Current admin URL:{' '}
                <span className="font-semibold text-white">
                  {window.location.origin}/{adminSlug ?? data?.adminPath ?? 'admin'}
                </span>
              </p>
              <p className="mt-2">
                After saving, you will be redirected to the new path and asked to sign in again.
              </p>
            </div>
            <Button type="submit" size="lg" disabled={isPending}>
              {isPending ? 'Saving…' : 'Save admin path'}
            </Button>
          </form>
        )}
      </Card>

      <Card title="Featured Selections" className="max-w-xl">
        <p className="mb-4 text-sm text-slate-300">
          Control how many featured products appear in the "Featured Selections" section on the home page. Products marked as "Featured" in the Products page will be displayed here.
        </p>
        {featuredCountData.isLoading ? (
          <p className="text-sm text-slate-200">Loading current settings…</p>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmitFeatured(onSubmitFeatured)}>
            <Input
              type="number"
              label="Number of featured items"
              min={1}
              max={20}
              {...registerFeatured('featuredCount', {
                required: 'Featured count is required',
                valueAsNumber: true,
                min: { value: 1, message: 'Must be at least 1' },
                max: { value: 20, message: 'Must be at most 20' }
              })}
              error={featuredErrors.featuredCount?.message}
            />
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
              <p>
                Currently showing{' '}
                <span className="font-semibold text-white">
                  {featuredCountData.data ?? 3} featured {featuredCountData.data === 1 ? 'item' : 'items'}
                </span>{' '}
                on the home page.
              </p>
              <p className="mt-2">
                Mark products as "Featured" in the Products page to control which items appear here.
              </p>
            </div>
            <Button type="submit" size="lg" disabled={isUpdatingFeatured}>
              {isUpdatingFeatured ? 'Saving…' : 'Save featured count'}
            </Button>
          </form>
        )}
      </Card>

      <Card title="Store Name" className="max-w-xl">
        <p className="mb-4 text-sm text-slate-300">
          Set the store name that appears in the navbar on the user-facing pages.
        </p>
        {storeNameData.isLoading ? (
          <p className="text-sm text-slate-200">Loading current settings…</p>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmitStoreName(onSubmitStoreName)}>
            <Input
              label="Store Name"
              placeholder="e.g. Hezak Boutique"
              {...registerStoreName('storeName', {
                required: 'Store name is required',
                minLength: {
                  value: 1,
                  message: 'Store name must be at least 1 character'
                },
                maxLength: {
                  value: 100,
                  message: 'Store name must be at most 100 characters'
                }
              })}
              error={storeNameErrors.storeName?.message}
            />
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
              <p>
                Current store name:{' '}
                <span className="font-semibold text-white">
                  {storeNameData.data?.storeName ?? 'Hezak Boutique'}
                </span>
              </p>
              <p className="mt-2">
                This name will appear in the navbar on all user-facing pages.
              </p>
            </div>
            <Button type="submit" size="lg" disabled={isUpdatingStoreName}>
              {isUpdatingStoreName ? 'Saving…' : 'Save store name'}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
};

export default AdminSettingsPage;
