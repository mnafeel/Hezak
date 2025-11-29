import { Prisma } from '../generated/prisma/client';
import { CreateOrderInput, UpdateOrderInput } from '../schemas/order';
import { prisma } from '../utils/prisma';

export const createOrder = async (input: CreateOrderInput) => {
  return prisma.$transaction(async (tx) => {
    const productIds = input.items.map((item) => item.productId);

    const products = await tx.product.findMany({
      where: {
        id: { in: productIds }
      }
    });

    if (products.length !== productIds.length) {
      throw new Error('One or more products not found');
    }

    type ProductEntity = (typeof products)[number];
    const productsById = new Map<number, ProductEntity>(
      products.map((product) => [product.id, product])
    );

    let orderTotalCents = 0;

    for (const item of input.items) {
      const product = productsById.get(item.productId);

      if (!product) {
        throw new Error(`Product with id ${item.productId} not found`);
      }

      const productColors = Array.isArray(product.colors)
        ? (product.colors as Array<Record<string, unknown>>)
        : [];
      const productSizes = Array.isArray(product.sizes)
        ? (product.sizes as Array<Record<string, unknown>>)
        : [];

      if (productColors.length > 0 && !item.selectedColor) {
        throw new Error(`Please select a color for ${product.name}`);
      }

      if (
        item.selectedColor &&
        productColors.length > 0 &&
        !productColors.some((color) => color.name === item.selectedColor?.name)
      ) {
        throw new Error(`Selected color is not available for ${product.name}`);
      }

      if (productSizes.length > 0 && !item.selectedSize) {
        throw new Error(`Please select a size for ${product.name}`);
      }

      if (
        item.selectedSize &&
        productSizes.length > 0 &&
        !productSizes.some((size) => size.name === item.selectedSize?.name)
      ) {
        throw new Error(`Selected size is not available for ${product.name}`);
      }

      // Check inventory - prioritize variant inventory if available
      let availableQuantity = 0;
      
      if (product.inventoryVariants && Array.isArray(product.inventoryVariants) && product.inventoryVariants.length > 0) {
        // Use variant-based inventory
        if (item.selectedColor && item.selectedSize) {
          const variant = (product.inventoryVariants as Array<{ colorName: string; sizeName: string; quantity: number }>).find(
            (v) => v.colorName === item.selectedColor?.name && v.sizeName === item.selectedSize?.name
          );
          availableQuantity = variant ? variant.quantity : 0;
        } else {
          // If variants exist but color/size not selected, cannot determine inventory
          throw new Error(`Color and size must be selected for ${product.name} to check inventory`);
        }
      } else {
        // Fallback to general inventory if no variants
        availableQuantity = product.inventory;
      }

      if (availableQuantity < item.quantity) {
        throw new Error(`Insufficient inventory for ${product.name}. Available: ${availableQuantity}, Requested: ${item.quantity}`);
      }

      orderTotalCents += product.priceCents * item.quantity;
    }

    // If userId is provided (logged-in user), use that user, otherwise upsert by email
    let user;
    if (input.userId) {
      user = await tx.user.findUnique({
        where: { id: input.userId }
      });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Update user info with checkout details
      user = await tx.user.update({
        where: { id: input.userId },
        data: {
          name: input.customer.name,
          phone: input.customer.phone,
          addressLine1: input.customer.addressLine1,
          addressLine2: input.customer.addressLine2,
          city: input.customer.city,
          state: input.customer.state,
          postalCode: input.customer.postalCode,
          country: input.customer.country
        }
      });
    } else {
      user = await tx.user.upsert({
        where: { email: input.customer.email },
        update: {
          name: input.customer.name,
          phone: input.customer.phone,
          addressLine1: input.customer.addressLine1,
          addressLine2: input.customer.addressLine2,
          city: input.customer.city,
          state: input.customer.state,
          postalCode: input.customer.postalCode,
          country: input.customer.country
        },
        create: {
          name: input.customer.name,
          email: input.customer.email,
          phone: input.customer.phone,
          addressLine1: input.customer.addressLine1,
          addressLine2: input.customer.addressLine2,
          city: input.customer.city,
          state: input.customer.state,
          postalCode: input.customer.postalCode,
          country: input.customer.country
        }
      });
    }

    const order = await tx.order.create({
      data: {
        totalCents: orderTotalCents,
        userId: user.id,
        orderSource: input.orderSource || 'WEBSITE',
        orderItems: {
          create: input.items.map((item) => {
            const product = productsById.get(item.productId);

            if (!product) {
              throw new Error(`Product with id ${item.productId} not found`);
            }

            return {
              productId: item.productId,
              quantity: item.quantity,
              unitPriceCents: product.priceCents,
              selectedColor: item.selectedColor?.name,
              selectedColorHex: item.selectedColor?.hex,
              selectedColorImage: item.selectedColor?.imageUrl,
              selectedSize: item.selectedSize?.name
            };
          })
        }
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        user: true
      }
    });

    // Update inventory - decrement variant inventory if available, otherwise general inventory
    await Promise.all(
      input.items.map(async (item) => {
        const product = productsById.get(item.productId);
        if (!product) return;

        // If product has inventory variants, update the specific variant
        if (product.inventoryVariants && Array.isArray(product.inventoryVariants) && product.inventoryVariants.length > 0) {
          if (item.selectedColor && item.selectedSize) {
            const variants = product.inventoryVariants as Array<{ colorName: string; sizeName: string; quantity: number }>;
            const variantIndex = variants.findIndex(
              (v) => v.colorName === item.selectedColor?.name && v.sizeName === item.selectedSize?.name
            );
            
            if (variantIndex !== -1) {
              const updatedVariants = [...variants];
              updatedVariants[variantIndex] = {
                ...updatedVariants[variantIndex]!,
                quantity: Math.max(0, updatedVariants[variantIndex]!.quantity - item.quantity)
              };
              
              await tx.product.update({
                where: { id: item.productId },
                data: {
                  inventoryVariants: updatedVariants
                }
              });
              return;
            }
          }
        }
        
        // Fallback to general inventory if no variants or variant not found
        await tx.product.update({
          where: { id: item.productId },
          data: {
            inventory: {
              decrement: item.quantity
            }
          }
        });
      })
    );

    return order;
  });
};

export const listOrders = async () => {
  return prisma.order.findMany({
    include: {
      user: true,
      orderItems: {
        include: {
          product: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

export const getOrderById = async (orderId: number) => {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      orderItems: {
        include: {
          product: true
        }
      }
    }
  });
};

export const getAdminOverview = async () => {
  const [totalUsers, totalOrders, revenueAggregate] = await Promise.all([
    prisma.user.count(),
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: {
        totalCents: true
      }
    })
  ]);

  return {
    totalUsers,
    totalOrders,
    totalRevenueCents: revenueAggregate._sum.totalCents ?? 0
  };
};

export const updateOrder = async (orderId: number, input: UpdateOrderInput) => {
  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: input.status,
        trackingId: input.trackingId !== undefined ? input.trackingId : undefined,
        courierCompany: input.courierCompany !== undefined ? input.courierCompany : undefined,
        trackingLink: input.trackingLink !== undefined && input.trackingLink !== '' ? input.trackingLink : undefined
      },
      include: {
        user: true,
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });
    return order;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new Error('Order not found');
      }
    }
    throw error;
  }
};

export const deleteOrder = async (orderId: number) => {
  try {
    await prisma.order.delete({
      where: { id: orderId }
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new Error('Order not found');
      }
    }
    throw error;
  }
};

export const getUserOrders = async (userId: number) => {
  return prisma.order.findMany({
    where: { userId },
    include: {
      user: true,
      orderItems: {
        include: {
          product: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

