import { db } from '../../utils/firebaseAdmin';
import { COLLECTIONS } from '../../utils/firestore';

// Define types locally since they're not exported from a types file
interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  selectedColor: any;
  selectedSize: any;
  product: any;
}

interface Order {
  id: number;
  userId: number;
  total: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  orderItems: OrderItem[];
  orderSource: string;
  trackingId: string | null;
  courierCompany: string | null;
  trackingLink: string | null;
}

interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  createdAt: Date;
  updatedAt: Date;
  orders: Order[];
}

export const listUsersFirestore = async (): Promise<User[]> => {
  try {
    const usersRef = db.collection(COLLECTIONS.USERS);
    const usersSnapshot = await usersRef.get();
    
    const users: User[] = [];
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      
      // Get orders for this user
      // Try both string and number formats for userId
      const userIdString = userDoc.id;
      const userIdNumber = parseInt(userIdString) || 0;
      
      // Try querying with string first
      let ordersRef = db.collection(COLLECTIONS.ORDERS)
        .where('userId', '==', userIdString);
      
      let ordersSnapshot;
      try {
        ordersSnapshot = await ordersRef.orderBy('createdAt', 'desc').get();
      } catch (error: any) {
        // If orderBy fails (missing index), fetch all and sort in memory
        try {
          ordersSnapshot = await ordersRef.get();
        } catch (err: any) {
          // If string query fails, try number format
          ordersRef = db.collection(COLLECTIONS.ORDERS)
            .where('userId', '==', userIdNumber);
          try {
            ordersSnapshot = await ordersRef.orderBy('createdAt', 'desc').get();
          } catch (orderByErr: any) {
            // If orderBy fails, fetch all and sort in memory
            ordersSnapshot = await ordersRef.get();
          }
        }
      }
      
      // If no results with string, try number format
      if (ordersSnapshot.empty && userIdNumber > 0) {
        ordersRef = db.collection(COLLECTIONS.ORDERS)
          .where('userId', '==', userIdNumber);
        try {
          ordersSnapshot = await ordersRef.orderBy('createdAt', 'desc').get();
        } catch (error: any) {
          ordersSnapshot = await ordersRef.get();
        }
      }
      
      const orders: Order[] = [];
      for (const orderDoc of ordersSnapshot.docs) {
        const orderData = orderDoc.data();
        
        // Get order items
        const orderItemsRef = db.collection(COLLECTIONS.ORDER_ITEMS)
          .where('orderId', '==', orderDoc.id);
        const orderItemsSnapshot = await orderItemsRef.get();
        
        const orderItems = orderItemsSnapshot.docs.map(itemDoc => {
          const itemData = itemDoc.data();
          return {
            id: parseInt(itemDoc.id) || Date.now(),
            orderId: parseInt(orderDoc.id) || Date.now(),
            productId: itemData.productId || 0,
            quantity: itemData.quantity || 0,
            price: itemData.price || 0,
            selectedColor: itemData.selectedColor || null,
            selectedSize: itemData.selectedSize || null,
            product: itemData.product || null
          };
        });
        
        orders.push({
          id: parseInt(orderDoc.id) || Date.now(),
          userId: parseInt(userDoc.id) || Date.now(),
          total: orderData.total || 0,
          status: orderData.status || 'PENDING',
          createdAt: orderData.createdAt?.toDate?.() || new Date(orderData.createdAt || Date.now()),
          updatedAt: orderData.updatedAt?.toDate?.() || new Date(orderData.updatedAt || Date.now()),
          orderItems,
          orderSource: orderData.orderSource || 'WEBSITE',
          trackingId: orderData.trackingId || null,
          courierCompany: orderData.courierCompany || null,
          trackingLink: orderData.trackingLink || null
        });
      }
      
      // Sort orders by createdAt desc
      orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      users.push({
        id: parseInt(userDoc.id) || Date.now(),
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || null,
        addressLine1: userData.addressLine1 || null,
        addressLine2: userData.addressLine2 || null,
        city: userData.city || null,
        state: userData.state || null,
        postalCode: userData.postalCode || null,
        country: userData.country || null,
        createdAt: userData.createdAt?.toDate?.() || new Date(userData.createdAt || Date.now()),
        updatedAt: userData.updatedAt?.toDate?.() || new Date(userData.updatedAt || Date.now()),
        orders
      });
    }
    
    // Sort users by createdAt desc
    users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return users;
  } catch (error) {
    console.error('Error listing users from Firestore:', error);
    throw error;
  }
};

export const getUserByIdFirestore = async (id: number): Promise<User> => {
  try {
    const userRef = db.collection(COLLECTIONS.USERS).doc(String(id));
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      throw new Error('User not found');
    }
    
    const userData = userDoc.data();
    
    // Get orders for this user
    // Try both string and number formats for userId
    const userIdString = String(id);
    const userIdNumber = id;
    
    // Try querying with string first
    let ordersRef = db.collection(COLLECTIONS.ORDERS)
      .where('userId', '==', userIdString);
    
    let ordersSnapshot;
    try {
      ordersSnapshot = await ordersRef.orderBy('createdAt', 'desc').get();
    } catch (error: any) {
      // If orderBy fails (missing index), fetch all and sort in memory
      try {
        ordersSnapshot = await ordersRef.get();
      } catch (err: any) {
        // If string query fails, try number format
        ordersRef = db.collection(COLLECTIONS.ORDERS)
          .where('userId', '==', userIdNumber);
        try {
          ordersSnapshot = await ordersRef.orderBy('createdAt', 'desc').get();
        } catch (orderByErr: any) {
          // If orderBy fails, fetch all and sort in memory
          ordersSnapshot = await ordersRef.get();
        }
      }
    }
    
    // If no results with string, try number format
    if (ordersSnapshot.empty) {
      ordersRef = db.collection(COLLECTIONS.ORDERS)
        .where('userId', '==', userIdNumber);
      try {
        ordersSnapshot = await ordersRef.orderBy('createdAt', 'desc').get();
      } catch (error: any) {
        ordersSnapshot = await ordersRef.get();
      }
    }
    
    const orders: Order[] = [];
    for (const orderDoc of ordersSnapshot.docs) {
      const orderData = orderDoc.data();
      
      // Get order items
      const orderItemsRef = db.collection(COLLECTIONS.ORDER_ITEMS)
        .where('orderId', '==', orderDoc.id);
      const orderItemsSnapshot = await orderItemsRef.get();
      
      const orderItems = orderItemsSnapshot.docs.map(itemDoc => {
        const itemData = itemDoc.data();
        return {
          id: parseInt(itemDoc.id) || Date.now(),
          orderId: parseInt(orderDoc.id) || Date.now(),
          productId: itemData.productId || 0,
          quantity: itemData.quantity || 0,
          price: itemData.price || 0,
          selectedColor: itemData.selectedColor || null,
          selectedSize: itemData.selectedSize || null,
          product: itemData.product || null
        };
      });
      
      orders.push({
        id: parseInt(orderDoc.id) || Date.now(),
        userId: id,
        total: orderData.total || 0,
        status: orderData.status || 'PENDING',
        createdAt: orderData.createdAt?.toDate?.() || new Date(orderData.createdAt || Date.now()),
        updatedAt: orderData.updatedAt?.toDate?.() || new Date(orderData.updatedAt || Date.now()),
        orderItems,
        orderSource: orderData.orderSource || 'WEBSITE',
        trackingId: orderData.trackingId || null,
        courierCompany: orderData.courierCompany || null,
        trackingLink: orderData.trackingLink || null
      });
    }
    
    // Sort orders by createdAt desc
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return {
      id,
      name: userData?.name || '',
      email: userData?.email || '',
      phone: userData?.phone || null,
      addressLine1: userData?.addressLine1 || null,
      addressLine2: userData?.addressLine2 || null,
      city: userData?.city || null,
      state: userData?.state || null,
      postalCode: userData?.postalCode || null,
      country: userData?.country || null,
      createdAt: userData?.createdAt?.toDate?.() || new Date(userData?.createdAt || Date.now()),
      updatedAt: userData?.updatedAt?.toDate?.() || new Date(userData?.updatedAt || Date.now()),
      orders
    };
  } catch (error) {
    console.error('Error getting user from Firestore:', error);
    throw error;
  }
};

