#!/usr/bin/env ts-node

/**
 * Migration script to move data from SQLite (Prisma) to Firebase Firestore
 * 
 * Usage: 
 *   ts-node scripts/migrate-to-firestore.ts
 * 
 * Make sure FIREBASE_SERVICE_ACCOUNT is set in environment
 */

import 'dotenv/config';
import { prisma } from '../src/utils/prisma';
import { getCollection, COLLECTIONS, toTimestamp } from '../src/utils/firestore';

async function migrateProducts() {
  console.log('📦 Migrating products...');
  
  const products = await prisma.product.findMany({
    include: {
      categories: {
        include: {
          category: true
        }
      }
    }
  });

  const productsRef = getCollection(COLLECTIONS.PRODUCTS);
  let count = 0;

  for (const product of products) {
    const categoryIds = product.categories.map((pc) => String(pc.categoryId));
    
    await productsRef.doc(String(product.id)).set({
      name: product.name,
      description: product.description,
      priceCents: product.priceCents,
      imageUrl: product.imageUrl,
      gallery: product.gallery as any[],
      colors: product.colors as any[],
      sizes: product.sizes as any[],
      itemType: product.itemType,
      inventory: product.inventory,
      inventoryVariants: product.inventoryVariants as any[],
      isFeatured: product.isFeatured,
      categoryIds,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString()
    });

    count++;
    if (count % 10 === 0) {
      console.log(`  Migrated ${count}/${products.length} products...`);
    }
  }

  console.log(`✅ Migrated ${count} products`);
}

async function migrateCategories() {
  console.log('📁 Migrating categories...');
  
  const categories = await prisma.category.findMany();
  const categoriesRef = getCollection(COLLECTIONS.CATEGORIES);
  let count = 0;

  for (const category of categories) {
    await categoriesRef.doc(String(category.id)).set({
      name: category.name,
      slug: category.slug,
      description: category.description || null,
      isTopSelling: category.isTopSelling,
      isFeatured: category.isFeatured,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString()
    });

    count++;
  }

  console.log(`✅ Migrated ${count} categories`);
}

async function migrateUsers() {
  console.log('👤 Migrating users...');
  
  const users = await prisma.user.findMany();
  const usersRef = getCollection(COLLECTIONS.USERS);
  let count = 0;

  for (const user of users) {
    await usersRef.doc(String(user.id)).set({
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash || null,
      phone: user.phone || null,
      addressLine1: user.addressLine1 || null,
      addressLine2: user.addressLine2 || null,
      city: user.city || null,
      state: user.state || null,
      postalCode: user.postalCode || null,
      country: user.country || null,
      createdAt: user.createdAt.toISOString()
    });

    count++;
  }

  console.log(`✅ Migrated ${count} users`);
}

async function migrateOrders() {
  console.log('📦 Migrating orders...');
  
  const orders = await prisma.order.findMany({
    include: {
      orderItems: true
    }
  });

  const ordersRef = getCollection(COLLECTIONS.ORDERS);
  const orderItemsRef = getCollection(COLLECTIONS.ORDER_ITEMS);
  let count = 0;

  for (const order of orders) {
    // Migrate order
    await ordersRef.doc(String(order.id)).set({
      status: order.status,
      totalCents: order.totalCents,
      trackingId: order.trackingId || null,
      courierCompany: order.courierCompany || null,
      trackingLink: order.trackingLink || null,
      orderSource: order.orderSource || 'WEBSITE',
      userId: String(order.userId),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString()
    });

    // Migrate order items
    for (const item of order.orderItems) {
      await orderItemsRef.doc(`${order.id}_${item.id}`).set({
        quantity: item.quantity,
        unitPriceCents: item.unitPriceCents,
        orderId: String(order.id),
        productId: String(item.productId),
        selectedColor: item.selectedColor || null,
        selectedColorHex: item.selectedColorHex || null,
        selectedColorImage: item.selectedColorImage || null,
        selectedSize: item.selectedSize || null
      });
    }

    count++;
    if (count % 10 === 0) {
      console.log(`  Migrated ${count}/${orders.length} orders...`);
    }
  }

  console.log(`✅ Migrated ${count} orders`);
}

async function migrateBanners() {
  console.log('🖼️ Migrating banners...');
  
  const banners = await prisma.banner.findMany();
  const bannersRef = getCollection(COLLECTIONS.BANNERS);
  let count = 0;

  for (const banner of banners) {
    await bannersRef.doc(String(banner.id)).set({
      title: banner.title || null,
      text: banner.text || null,
      imageUrl: banner.imageUrl,
      videoUrl: banner.videoUrl || null,
      mediaType: banner.mediaType || 'image',
      linkUrl: banner.linkUrl || null,
      order: banner.order,
      isActive: banner.isActive,
      textPosition: banner.textPosition || null,
      textAlign: banner.textAlign || null,
      animationStyle: banner.animationStyle || null,
      overlayStyle: banner.overlayStyle || null,
      textElements: banner.textElements as any,
      createdAt: banner.createdAt.toISOString(),
      updatedAt: banner.updatedAt.toISOString()
    });

    count++;
  }

  console.log(`✅ Migrated ${count} banners`);
}

async function main() {
  console.log('🚀 Starting migration from SQLite to Firestore...\n');

  try {
    // Check if Firestore is initialized
    const { db } = await import('../src/utils/firebaseAdmin');
    if (!db) {
      throw new Error('Firestore not initialized. Please set FIREBASE_SERVICE_ACCOUNT environment variable.');
    }

    // Migrate in order (categories first, then products, etc.)
    await migrateCategories();
    await migrateProducts();
    await migrateUsers();
    await migrateOrders();
    await migrateBanners();

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Set USE_FIRESTORE=true in environment variables');
    console.log('2. Redeploy backend');
    console.log('3. Test all endpoints');
    console.log('4. Once verified, you can remove SQLite database');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

