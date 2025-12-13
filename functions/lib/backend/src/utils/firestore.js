"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.snapshotToArray = exports.docToObject = exports.generateId = exports.toTimestamp = exports.toDate = exports.getCollection = exports.COLLECTIONS = void 0;
const firebaseAdmin_1 = require("./firebaseAdmin");
Object.defineProperty(exports, "db", { enumerable: true, get: function () { return firebaseAdmin_1.db; } });
// In Firebase Functions, db is always available
// Collection names
exports.COLLECTIONS = {
    USERS: 'users',
    CATEGORIES: 'categories',
    PRODUCTS: 'products',
    PRODUCT_CATEGORIES: 'productCategories',
    ORDERS: 'orders',
    ORDER_ITEMS: 'orderItems',
    BANNERS: 'banners',
    APP_SETTINGS: 'appSettings',
    SITE_SETTINGS: 'siteSettings'
};
// Helper to get collection reference
const getCollection = (collectionName) => {
    // In Firebase Functions, db is always available
    return firebaseAdmin_1.db.collection(collectionName);
};
exports.getCollection = getCollection;
// Helper to convert Firestore timestamp to Date
const toDate = (timestamp) => {
    if (!timestamp)
        return new Date();
    if (timestamp.toDate)
        return timestamp.toDate();
    if (timestamp instanceof Date)
        return timestamp;
    if (typeof timestamp === 'string')
        return new Date(timestamp);
    return new Date();
};
exports.toDate = toDate;
// Helper to convert Date to Firestore timestamp
const toTimestamp = (date) => {
    if (!date)
        return null;
    const d = typeof date === 'string' ? new Date(date) : date;
    return d instanceof Date ? d.toISOString() : null;
};
exports.toTimestamp = toTimestamp;
// Helper to generate ID (Firestore auto-generates, but we'll use string IDs)
const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};
exports.generateId = generateId;
// Helper to convert Firestore document to plain object
const docToObject = (doc) => {
    if (!doc.exists)
        return null;
    const data = doc.data();
    if (!data)
        return null;
    return {
        id: doc.id,
        ...data
    };
};
exports.docToObject = docToObject;
// Helper to convert Firestore query snapshot to array
const snapshotToArray = (snapshot) => {
    if (!snapshot || !snapshot.docs)
        return [];
    return snapshot.docs.map((doc) => (0, exports.docToObject)(doc)).filter((item) => item !== null);
};
exports.snapshotToArray = snapshotToArray;
//# sourceMappingURL=firestore.js.map