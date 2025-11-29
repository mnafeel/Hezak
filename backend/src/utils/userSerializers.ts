import { Prisma } from '../generated/prisma/client';
import { serializeMoney } from './serializers';

export type UserWithOrders = Prisma.UserGetPayload<{
  include: {
    orders: {
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true;
                name: true;
                imageUrl: true;
              };
            };
          };
        };
      };
    };
  };
}>;

export const serializeUser = (user: UserWithOrders) => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    addressLine1: user.addressLine1,
    addressLine2: user.addressLine2,
    city: user.city,
    state: user.state,
    postalCode: user.postalCode,
    country: user.country,
    createdAt: user.createdAt,
        orders: user.orders.map((order) => ({
          id: order.id,
          status: order.status,
          total: serializeMoney(order.totalCents),
          trackingId: order.trackingId,
          courierCompany: order.courierCompany,
          trackingLink: order.trackingLink,
          orderSource: order.orderSource ?? 'WEBSITE',
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
      items: order.orderItems.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        unitPrice: serializeMoney(item.unitPriceCents),
        product: {
          id: item.product.id,
          name: item.product.name,
          imageUrl: item.product.imageUrl
        },
        selectedColor: item.selectedColor
          ? {
              name: item.selectedColor,
              hex: item.selectedColorHex ?? undefined,
              imageUrl: item.selectedColorImage ?? undefined
            }
          : null,
        selectedSize: item.selectedSize
          ? {
              name: item.selectedSize
            }
          : null
      }))
    }))
  };
};

