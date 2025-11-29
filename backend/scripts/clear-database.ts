import dotenv from 'dotenv';
dotenv.config();

import { prisma } from '../src/utils/prisma';

async function clearDatabase() {
  try {
    console.log('Clearing database...');
    
    // Delete in order to respect foreign key constraints
    await prisma.orderItem.deleteMany({});
    console.log('✓ Cleared OrderItems');
    
    await prisma.order.deleteMany({});
    console.log('✓ Cleared Orders');
    
    await prisma.productCategory.deleteMany({});
    console.log('✓ Cleared ProductCategories');
    
    await prisma.product.deleteMany({});
    console.log('✓ Cleared Products');
    
    await prisma.category.deleteMany({});
    console.log('✓ Cleared Categories');
    
    await prisma.user.deleteMany({});
    console.log('✓ Cleared Users');
    
    console.log('\n✅ Database cleared successfully!');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase();

