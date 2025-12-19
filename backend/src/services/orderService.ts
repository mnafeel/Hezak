// @ts-nocheck
import { Prisma } from '../generated/prisma/client';
import { CreateOrderInput, UpdateOrderInput } from '../schemas/order';
import { prisma } from '../utils/prisma';
import { USE_FIRESTORE } from '../config/database';
import { getCollection, COLLECTIONS, docToObject, toTimestamp, generateId, db } from '../utils/firestore';

// Firestore User type
interface FirestoreUser {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  createdAt: string | Date;
}

// Create order using Firestore
const createOrderFirestore = async (input: CreateOrderInput) => {
  if (!db) {
    throw new Error('Firestore database not initialized');
  }

  const productIds = input.items.map((item) => String(item.productId));
  
  // Fetch products from Firestore
  const productPromises = productIds.map(async (id) => {
    const productDoc = await getCollection(COLLECTIONS.PRODUCTS).doc(id).get();
    if (productDoc.exists) {
      const data = productDoc.data();
      return {
        id: productDoc.id,
        ...data
      };
    }
    return null;
  });
  
  const fetchedProducts = await Promise.all(productPromises);
  const products = fetchedProducts.filter((p): p is any => p !== null);

  if (products.length !== productIds.length) {
    throw new Error('One or more products not found');
  }

  const productsById = new Map<string, any>(
    products.map((product) => [product.id, product])
  );

  let orderTotalCents = 0;

  // Validate products and calculate total
  for (const item of input.items) {
    const productId = String(item.productId);
    const product = productsById.get(productId);

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
      availableQuantity = product.inventory || 0;
    }

    if (availableQuantity < item.quantity) {
      throw new Error(`Insufficient inventory for ${product.name}. Available: ${availableQuantity}, Requested: ${item.quantity}`);
    }

    orderTotalCents += product.priceCents * item.quantity;
  }

  // Get or create user in Firestore
  let userId: string;
  const usersRef = getCollection(COLLECTIONS.USERS);
  
  if (input.userId) {
    // User is logged in - try to find by ID first
    let userDoc = await usersRef.doc(String(input.userId)).get();
    
    if (!userDoc.exists) {
      // User not found by ID - try to find by email (user might have been created in Prisma)
      const userQuery = await usersRef.where('email', '==', input.customer.email).limit(1).get();
      
      if (!userQuery.empty) {
        // Found by email - use this user
        userDoc = userQuery.docs[0];
        userId = userDoc.id;
        
        // Update user info with checkout details
        await userDoc.ref.update({
          name: input.customer.name,
          phone: input.customer.phone || null,
          addressLine1: input.customer.addressLine1,
          addressLine2: input.customer.addressLine2 || null,
          city: input.customer.city,
          state: input.customer.state || null,
          postalCode: input.customer.postalCode,
          country: input.customer.country,
          updatedAt: toTimestamp(new Date())
        });
      } else {
        // User doesn't exist in Firestore - create them
        // Use the userId from input as the document ID for consistency
        const newUserRef = usersRef.doc(String(input.userId));
        await newUserRef.set({
          name: input.customer.name,
          email: input.customer.email,
          phone: input.customer.phone || null,
          addressLine1: input.customer.addressLine1,
          addressLine2: input.customer.addressLine2 || null,
          city: input.customer.city,
          state: input.customer.state || null,
          postalCode: input.customer.postalCode,
          country: input.customer.country,
          createdAt: toTimestamp(new Date()),
          updatedAt: toTimestamp(new Date())
        });
        userId = newUserRef.id;
      }
    } else {
      // User found by ID - update info
      await usersRef.doc(String(input.userId)).update({
        name: input.customer.name,
        phone: input.customer.phone || null,
        addressLine1: input.customer.addressLine1,
        addressLine2: input.customer.addressLine2 || null,
        city: input.customer.city,
        state: input.customer.state || null,
        postalCode: input.customer.postalCode,
        country: input.customer.country,
        updatedAt: toTimestamp(new Date())
      });
      userId = userDoc.id;
    }
  } else {
    // Guest checkout - find or create by email
    const userQuery = await usersRef.where('email', '==', input.customer.email).limit(1).get();
    
    if (!userQuery.empty) {
      // User exists - update
      const userDoc = userQuery.docs[0];
      await userDoc.ref.update({
        name: input.customer.name,
        phone: input.customer.phone || null,
        addressLine1: input.customer.addressLine1,
        addressLine2: input.customer.addressLine2 || null,
        city: input.customer.city,
        state: input.customer.state || null,
        postalCode: input.customer.postalCode,
        country: input.customer.country,
        updatedAt: toTimestamp(new Date())
      });
      userId = userDoc.id;
    } else {
      // Create new user
      const newUserRef = usersRef.doc();
      await newUserRef.set({
        name: input.customer.name,
        email: input.customer.email,
        phone: input.customer.phone || null,
        addressLine1: input.customer.addressLine1,
        addressLine2: input.customer.addressLine2 || null,
        city: input.customer.city,
        state: input.customer.state || null,
        postalCode: input.customer.postalCode,
        country: input.customer.country,
        createdAt: toTimestamp(new Date()),
        updatedAt: toTimestamp(new Date())
      });
      userId = newUserRef.id;
    }
  }

  // Create order in Firestore
  // Use numeric ID (timestamp-based) for compatibility with frontend
  const numericOrderId = Date.now();
  const ordersRef = getCollection(COLLECTIONS.ORDERS);
  const orderRef = ordersRef.doc(String(numericOrderId));
  
  const orderData = {
    id: numericOrderId, // Store numeric ID in document for easy lookup
    userId,
    totalCents: orderTotalCents,
    status: 'PENDING',
    orderSource: input.orderSource || 'WEBSITE',
    createdAt: toTimestamp(new Date()),
    updatedAt: toTimestamp(new Date())
  };
  
  await orderRef.set(orderData);

  // Create order items
  const orderItemsRef = getCollection(COLLECTIONS.ORDER_ITEMS);
  const orderItems = [];
  
  for (const item of input.items) {
    const productId = String(item.productId);
    const product = productsById.get(productId);
    
    if (!product) {
      throw new Error(`Product with id ${item.productId} not found`);
    }

    const orderItemId = generateId();
    const orderItemData = {
      orderId: String(numericOrderId), // Use numeric order ID
      productId,
      quantity: item.quantity,
      unitPriceCents: product.priceCents,
      selectedColor: item.selectedColor?.name || null,
      selectedColorHex: item.selectedColor?.hex || null,
      selectedColorImage: item.selectedColor?.imageUrl || null,
      selectedSize: item.selectedSize?.name || null,
      createdAt: toTimestamp(new Date())
    };
    
    await orderItemsRef.doc(orderItemId).set(orderItemData);
    orderItems.push({ id: orderItemId, ...orderItemData });
  }

  // Update inventory in Firestore
  for (const item of input.items) {
    const productId = String(item.productId);
    const product = productsById.get(productId);
    if (!product) continue;

    const productRef = getCollection(COLLECTIONS.PRODUCTS).doc(productId);
    
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
          
          await productRef.update({
            inventoryVariants: updatedVariants,
            updatedAt: toTimestamp(new Date())
          });
          continue;
        }
      }
    }
    
    // Fallback to general inventory
    const currentInventory = product.inventory || 0;
    await productRef.update({
      inventory: Math.max(0, currentInventory - item.quantity),
      updatedAt: toTimestamp(new Date())
    });
  }

  // Fetch created order with user and items for response
  const createdOrderDoc = await orderRef.get();
  const userDoc = await usersRef.doc(userId).get();
  
  const orderItemsWithProducts = await Promise.all(
    orderItems.map(async (orderItem) => {
      const productDoc = await getCollection(COLLECTIONS.PRODUCTS).doc(orderItem.productId).get();
      const productData = productDoc.exists ? productDoc.data() : null;
      
      return {
        id: orderItem.id,
        productId: parseInt(orderItem.productId) || orderItem.productId,
        quantity: orderItem.quantity,
        unitPriceCents: orderItem.unitPriceCents,
        selectedColor: orderItem.selectedColor,
        selectedColorHex: orderItem.selectedColorHex,
        selectedColorImage: orderItem.selectedColorImage,
        selectedSize: orderItem.selectedSize,
        product: productData ? {
          id: parseInt(productDoc.id) || productDoc.id,
          ...productData
        } : null
      };
    })
  );

  const userData = userDoc.exists ? userDoc.data() : null;
  
  return {
    id: numericOrderId, // Return numeric ID for frontend compatibility
    ...createdOrderDoc.data(),
    user: userData ? {
      id: parseInt(userId) || userId,
      ...userData
    } : null,
    orderItems: orderItemsWithProducts
  };
};

// Create order using Prisma (SQLite)
const createOrderPrisma = async (input: CreateOrderInput) => {
  return prisma.$transaction(async (tx) => {
    const productIds = input.items.map((item) => item.productId);

    // Use Prisma for SQLite
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

// Main createOrder function - routes to Firestore or Prisma
export const createOrder = async (input: CreateOrderInput) => {
  if (USE_FIRESTORE) {
    return createOrderFirestore(input);
  } else {
    return createOrderPrisma(input);
  }
};

// Helper to fetch order with user and items from Firestore
const fetchOrderWithDetails = async (orderDoc: any) => {
  const orderData = orderDoc.data();
  const orderDocId = orderDoc.id;
  // Use numeric ID from document data if available, otherwise use document ID
  const orderId = orderData.id || orderDocId;

  // Fetch user
  const userDoc = await getCollection(COLLECTIONS.USERS).doc(orderData.userId).get();
  const userData = userDoc.exists ? userDoc.data() : null;

  // Fetch order items - search by both document ID and numeric ID for compatibility
  const orderItemsSnapshot = await getCollection(COLLECTIONS.ORDER_ITEMS)
    .where('orderId', '==', String(orderId))
    .get();

  const orderItems = await Promise.all(
    orderItemsSnapshot.docs.map(async (itemDoc: any) => {
      const itemData = itemDoc.data();
      const productDoc = await getCollection(COLLECTIONS.PRODUCTS).doc(itemData.productId).get();
      const productData = productDoc.exists ? productDoc.data() : null;

      return {
        id: parseInt(itemDoc.id) || itemDoc.id,
        productId: parseInt(itemData.productId) || itemData.productId,
        quantity: itemData.quantity,
        unitPriceCents: itemData.unitPriceCents,
        selectedColor: itemData.selectedColor,
        selectedColorHex: itemData.selectedColorHex,
        selectedColorImage: itemData.selectedColorImage,
        selectedSize: itemData.selectedSize,
        product: productData ? {
          id: parseInt(productDoc.id) || productDoc.id,
          ...productData
        } : null
      };
    })
  );

  return {
    id: typeof orderId === 'number' ? orderId : (parseInt(orderId) || orderId),
    ...orderData,
    user: userData ? {
      id: parseInt(orderData.userId) || orderData.userId,
      ...userData
    } : null,
    orderItems
  };
};

// List orders from Firestore
const listOrdersFirestore = async () => {
  if (!db) {
    throw new Error('Firestore database not initialized');
  }

  const ordersSnapshot = await getCollection(COLLECTIONS.ORDERS)
    .orderBy('createdAt', 'desc')
    .get();

  const orders = await Promise.all(
    ordersSnapshot.docs.map((doc) => fetchOrderWithDetails(doc))
  );

  return orders;
};

// List orders from Prisma
const listOrdersPrisma = async () => {
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

export const listOrders = async () => {
  if (USE_FIRESTORE) {
    return listOrdersFirestore();
  } else {
    return listOrdersPrisma();
  }
};

// Get order by ID from Firestore
const getOrderByIdFirestore = async (orderId: number) => {
  if (!db) {
    throw new Error('Firestore database not initialized');
  }

  console.log(`🔍 Looking up order with ID: ${orderId} (type: ${typeof orderId})`);

  // Try to find by document ID first (numeric ID as string)
  let orderDoc = await getCollection(COLLECTIONS.ORDERS).doc(String(orderId)).get();
  
  // If not found by document ID, try searching by the 'id' field in document data
  if (!orderDoc.exists) {
    console.log(`📋 Order not found by document ID, searching by 'id' field...`);
    const querySnapshot = await getCollection(COLLECTIONS.ORDERS)
      .where('id', '==', orderId)
      .limit(1)
      .get();
    
    if (!querySnapshot.empty) {
      console.log(`✅ Found order by 'id' field`);
      orderDoc = querySnapshot.docs[0];
    } else {
      // Last resort: search for orders where document ID starts with the numeric ID
      // This handles old orders created with generateId() format
      console.log(`📋 Order not found by 'id' field, searching by document ID prefix...`);
      const allOrdersSnapshot = await getCollection(COLLECTIONS.ORDERS).get();
      const matchingOrder = allOrdersSnapshot.docs.find(doc => {
        const docId = doc.id;
        // Check if document ID starts with the numeric ID
        return docId.startsWith(String(orderId));
      });
      
      if (matchingOrder) {
        console.log(`✅ Found order by document ID prefix: ${matchingOrder.id}`);
        orderDoc = matchingOrder;
        
        // Update the order document to include the numeric ID field for future lookups
        const orderData = orderDoc.data();
        if (!orderData.id) {
          await matchingOrder.ref.update({ id: orderId });
          console.log(`✅ Updated order document with numeric ID field`);
        }
      } else {
        console.error(`❌ Order not found with ID: ${orderId}`);
        throw new Error('Order not found');
      }
    }
  } else {
    console.log(`✅ Found order by document ID`);
  }

  return fetchOrderWithDetails(orderDoc);
};

// Get order by ID from Prisma
const getOrderByIdPrisma = async (orderId: number) => {
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

export const getOrderById = async (orderId: number) => {
  if (USE_FIRESTORE) {
    return getOrderByIdFirestore(orderId);
  } else {
    return getOrderByIdPrisma(orderId);
  }
};

// Get admin overview from Firestore
const getAdminOverviewFirestore = async () => {
  if (!db) {
    throw new Error('Firestore database not initialized');
  }

  const [usersSnapshot, ordersSnapshot] = await Promise.all([
    getCollection(COLLECTIONS.USERS).get(),
    getCollection(COLLECTIONS.ORDERS).get()
  ]);

  const totalUsers = usersSnapshot.size;
  const totalOrders = ordersSnapshot.size;
  
  let totalRevenueCents = 0;
  ordersSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    totalRevenueCents += data.totalCents || 0;
  });

  return {
    totalUsers,
    totalOrders,
    totalRevenueCents
  };
};

// Get admin overview from Prisma
const getAdminOverviewPrisma = async () => {
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

export const getAdminOverview = async () => {
  if (USE_FIRESTORE) {
    return getAdminOverviewFirestore();
  } else {
    return getAdminOverviewPrisma();
  }
};

// Update order in Firestore
const updateOrderFirestore = async (orderId: number, input: UpdateOrderInput) => {
  if (!db) {
    throw new Error('Firestore database not initialized');
  }

  console.log(`🔍 Looking up order with ID: ${orderId} (type: ${typeof orderId})`);

  // Try to find by document ID first (numeric ID as string)
  let orderRef = getCollection(COLLECTIONS.ORDERS).doc(String(orderId));
  let orderDoc = await orderRef.get();

  // If not found by document ID, try searching by the 'id' field in document data
  if (!orderDoc.exists) {
    console.log(`📋 Order not found by document ID, searching by 'id' field...`);
    const querySnapshot = await getCollection(COLLECTIONS.ORDERS)
      .where('id', '==', orderId)
      .limit(1)
      .get();
    
    if (!querySnapshot.empty) {
      console.log(`✅ Found order by 'id' field`);
      orderDoc = querySnapshot.docs[0];
      orderRef = orderDoc.ref;
    } else {
      // Last resort: search for orders where document ID starts with the numeric ID
      // This handles old orders created with generateId() format
      console.log(`📋 Order not found by 'id' field, searching by document ID prefix...`);
      const allOrdersSnapshot = await getCollection(COLLECTIONS.ORDERS).get();
      const matchingOrder = allOrdersSnapshot.docs.find(doc => {
        const docId = doc.id;
        // Check if document ID starts with the numeric ID
        return docId.startsWith(String(orderId));
      });
      
      if (matchingOrder) {
        console.log(`✅ Found order by document ID prefix: ${matchingOrder.id}`);
        orderDoc = matchingOrder;
        orderRef = matchingOrder.ref;
        
        // Update the order document to include the numeric ID field for future lookups
        const orderData = orderDoc.data();
        if (!orderData.id) {
          await orderRef.update({ id: orderId });
          console.log(`✅ Updated order document with numeric ID field`);
        }
      } else {
        console.error(`❌ Order not found with ID: ${orderId}`);
        throw new Error('Order not found');
      }
    }
  } else {
    console.log(`✅ Found order by document ID`);
  }

  const updateData: any = {
    updatedAt: toTimestamp(new Date())
  };

  if (input.status !== undefined) {
    updateData.status = input.status;
  }
  if (input.trackingId !== undefined) {
    updateData.trackingId = input.trackingId;
  }
  if (input.courierCompany !== undefined) {
    updateData.courierCompany = input.courierCompany;
  }
  if (input.trackingLink !== undefined) {
    updateData.trackingLink = input.trackingLink || null;
  }

  await orderRef.update(updateData);

  const updatedOrderDoc = await orderRef.get();
  return fetchOrderWithDetails(updatedOrderDoc);
};

// Update order in Prisma
const updateOrderPrisma = async (orderId: number, input: UpdateOrderInput) => {
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

export const updateOrder = async (orderId: number, input: UpdateOrderInput) => {
  if (USE_FIRESTORE) {
    return updateOrderFirestore(orderId, input);
  } else {
    return updateOrderPrisma(orderId, input);
  }
};

// Delete order from Firestore
const deleteOrderFirestore = async (orderId: number) => {
  if (!db) {
    throw new Error('Firestore database not initialized');
  }

  // Try to find by document ID first (numeric ID)
  let orderRef = getCollection(COLLECTIONS.ORDERS).doc(String(orderId));
  let orderDoc = await orderRef.get();

  // If not found by document ID, try searching by the 'id' field in document data
  if (!orderDoc.exists) {
    const querySnapshot = await getCollection(COLLECTIONS.ORDERS)
      .where('id', '==', orderId)
      .limit(1)
      .get();
    
    if (!querySnapshot.empty) {
      orderDoc = querySnapshot.docs[0];
      orderRef = orderDoc.ref;
    } else {
      throw new Error('Order not found');
    }
  }

  // Delete order items first
  const orderItemsSnapshot = await getCollection(COLLECTIONS.ORDER_ITEMS)
    .where('orderId', '==', String(orderId))
    .get();

  await Promise.all(
    orderItemsSnapshot.docs.map((doc) => doc.ref.delete())
  );

  // Delete order
  await orderRef.delete();
};

// Delete order from Prisma
const deleteOrderPrisma = async (orderId: number) => {
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

export const deleteOrder = async (orderId: number) => {
  if (USE_FIRESTORE) {
    return deleteOrderFirestore(orderId);
  } else {
    return deleteOrderPrisma(orderId);
  }
};

// Get user orders from Firestore
const getUserOrdersFirestore = async (userId: number) => {
  if (!db) {
    throw new Error('Firestore database not initialized');
  }

  const ordersSnapshot = await getCollection(COLLECTIONS.ORDERS)
    .where('userId', '==', String(userId))
    .orderBy('createdAt', 'desc')
    .get();

  const orders = await Promise.all(
    ordersSnapshot.docs.map((doc) => fetchOrderWithDetails(doc))
  );

  return orders;
};

// Get user orders from Prisma
const getUserOrdersPrisma = async (userId: number) => {
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

export const getUserOrders = async (userId: number) => {
  if (USE_FIRESTORE) {
    return getUserOrdersFirestore(userId);
  } else {
    return getUserOrdersPrisma(userId);
  }
};
