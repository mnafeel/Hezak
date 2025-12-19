import { prisma } from '../utils/prisma';
import { USE_FIRESTORE } from '../config/database';
import { listUsersFirestore, getUserByIdFirestore } from './firestore/userService';

export const listUsers = async () => {
  if (USE_FIRESTORE) {
    return await listUsersFirestore();
  }

  const users = await prisma.user.findMany({
    include: {
      orders: {
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return users;
};

export const getUserById = async (id: number) => {
  if (USE_FIRESTORE) {
    return await getUserByIdFirestore(id);
  }

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      orders: {
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};


