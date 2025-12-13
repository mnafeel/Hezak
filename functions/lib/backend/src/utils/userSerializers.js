"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeUser = void 0;
const serializers_1 = require("./serializers");
const serializeUser = (user) => {
    // Validate required fields
    if (!user || !user.id || !user.name || !user.email) {
        console.warn('Invalid user data detected:', { id: user?.id, name: user?.name, email: user?.email });
        // Return a safe default structure, but this should be filtered out by the controller
        return {
            id: user?.id ?? 0,
            name: user?.name ?? 'Invalid User',
            email: user?.email ?? 'invalid@example.com',
            phone: user?.phone ?? null,
            addressLine1: user?.addressLine1 ?? null,
            addressLine2: user?.addressLine2 ?? null,
            city: user?.city ?? null,
            state: user?.state ?? null,
            postalCode: user?.postalCode ?? null,
            country: user?.country ?? null,
            createdAt: user?.createdAt ?? new Date().toISOString(),
            orders: []
        };
    }
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
        createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
        orders: user.orders.map((order) => ({
            id: order.id,
            status: order.status,
            total: (0, serializers_1.serializeMoney)(order.totalCents),
            trackingId: order.trackingId,
            courierCompany: order.courierCompany,
            trackingLink: order.trackingLink,
            orderSource: order.orderSource ?? 'WEBSITE',
            createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : order.createdAt,
            updatedAt: order.updatedAt instanceof Date ? order.updatedAt.toISOString() : order.updatedAt,
            items: order.orderItems.map((item) => ({
                id: item.id,
                quantity: item.quantity,
                unitPrice: (0, serializers_1.serializeMoney)(item.unitPriceCents),
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
exports.serializeUser = serializeUser;
//# sourceMappingURL=userSerializers.js.map