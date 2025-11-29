import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import OrderSummary from '../../components/shared/OrderSummary';
import { useCartStore } from '../../store/cart';
import { useUserAuthStore } from '../../store/userAuth';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useCreateOrder } from '../../hooks/useCreateOrder';
import { showError } from '../../lib/errorHandler';
import type { CreateOrderPayload } from '../../types';

type CheckoutForm = CreateOrderPayload['customer'];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const user = useUserAuthStore((state) => state.user);
  const { getTextColor, getGlassPanelClass, getBorderColor, theme } = useThemeColors();
  const { register, handleSubmit, formState, reset } = useForm<CheckoutForm>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    }
  });

  // Pre-fill form with logged-in user's information
  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: ''
      });
    }
  }, [user, reset]);
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clear);
  const { mutateAsync, isPending } = useCreateOrder();

  const onSubmit = async (values: CheckoutForm) => {
    if (!items.length) {
      toast.error('Your cart is empty.');
      return;
    }

    const payload: CreateOrderPayload = {
      customer: values,
      items: items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        selectedColor: item.selectedColor ?? undefined,
        selectedSize: item.selectedSize ?? undefined
      }))
    };

    try {
      await mutateAsync(payload);
      toast.success('Order placed successfully! Our team will reach out shortly.');
      clearCart();
      navigate('/');
    } catch (error: unknown) {
      showError(error, 'Failed to place order. Please try again.');
    }
  };

  return (
    <div className="grid gap-6 sm:gap-8 md:gap-10 lg:grid-cols-2">
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className={`text-2xl sm:text-3xl font-semibold ${getTextColor('primary')}`}>Checkout</h1>
          <p className={`text-xs sm:text-sm ${getTextColor('secondary')} mt-1`}>
            Provide your details and confirm your curated selection.
          </p>
        </div>
        <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
            <Input
              label="Full name"
              required
              {...register('name', { required: 'Name is required' })}
              error={formState.errors.name?.message}
            />
            <Input
              type="email"
              label="Email address"
              required
              {...register('email', { required: 'Email is required' })}
              error={formState.errors.email?.message}
            />
            <Input
              label="Phone number"
              {...register('phone')}
              error={formState.errors.phone?.message}
            />
            <Input
              label="Country"
              required
              {...register('country', { required: 'Country is required' })}
              error={formState.errors.country?.message}
            />
            <Input
              label="City"
              required
              {...register('city', { required: 'City is required' })}
              error={formState.errors.city?.message}
            />
            <Input
              label="State / Region"
              {...register('state')}
              error={formState.errors.state?.message}
            />
          </div>
          <Input
            label="Address line 1"
            required
            {...register('addressLine1', { required: 'Address is required' })}
            error={formState.errors.addressLine1?.message}
          />
          <Input
            label="Address line 2"
            {...register('addressLine2')}
            error={formState.errors.addressLine2?.message}
          />
          <Input
            label="Postal code"
            required
            {...register('postalCode', { required: 'Postal code is required' })}
            error={formState.errors.postalCode?.message}
          />
          <Button type="submit" size="lg" disabled={isPending}>
            {isPending ? 'Placing order…' : 'Confirm order'}
          </Button>
        </form>
      </div>
      <div>
        <OrderSummary />
      </div>
    </div>
  );
};

export default CheckoutPage;

