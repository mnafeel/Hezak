import { prisma } from '../utils/prisma';
import { USE_FIRESTORE } from '../config/database';
import { listUsersFirestore, getUserByIdFirestore } from './firestore/userService';

// Firestore and Prisma return different shapes; keep this loosely typed
export const listUsers = async (): Promise<any[]> => {
  if (USE_FIRESTORE) {
    return (await listUsersFirestore()) as any[];
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

  return users as any[];
};

export const getUserById = async (id: number): Promise<any> => {
  if (USE_FIRESTORE) {
    return (await getUserByIdFirestore(id)) as any;
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

  return user as any;
};


