export interface ProductColorOption {
  name: string;
  hex?: string;
  imageUrl?: string;
}

export interface ProductSizeOption {
  name: string;
}

export interface InventoryVariant {
  colorName: string;
  sizeName: string;
  quantity: number;
}

export interface CategoryProductSummary {
  id: number;
  name: string;
  itemType: string;
  category?: {
    id: number;
    name: string;
    slug: string;
  } | null;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  gallery: string[];
  colors: ProductColorOption[];
  sizes: ProductSizeOption[];
  itemType: string;
  inventory: number;
  inventoryVariants?: InventoryVariant[];
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: number;
    name: string;
    slug: string;
  } | null;
  categories?: Array<{
    id: number;
    productId: number;
    categoryId: number;
    createdAt: string;
    category?: {
      id: number;
      name: string;
      slug: string;
    } | null;
  }>;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  isTopSelling: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  productCount?: number;
  products?: CategoryProductSummary[];
}

export interface OrderItem {
  id: number;
  quantity: number;
  unitPrice: number;
  selectedColor: {
    name: string;
    hex?: string;
    imageUrl?: string;
  } | null;
  selectedSize: string | null;
  product: {
    id: number;
    name: string;
    imageUrl: string;
  };
}

export interface Order {
  id: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  total: number;
  trackingId: string | null;
  courierCompany: string | null;
  trackingLink: string | null;
  orderSource: 'WEBSITE' | 'INSTAGRAM' | 'PHONE' | 'IN_PERSON' | 'OTHER';
  createdAt: string;
  updatedAt: string;
  user: {
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
  };
  items: OrderItem[];
}

export interface BannerTextElement {
  id: string;
  type: 'text';
  content: string;
  x: number; // Percentage position (0-100)
  y: number; // Percentage position (0-100)
  fontSize: number;
  fontFamily: string;
  fontWeight: 'normal' | 'bold' | 'lighter' | 'bolder' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  color: string;
  textAlign: 'left' | 'center' | 'right';
  textShadow?: string;
  letterSpacing?: number;
  lineHeight?: number;
  animation?: 'fade' | 'slide' | 'zoom' | 'bounce' | 'pulse' | 'none';
  animationDelay?: number; // in seconds
  animationDuration?: number; // in seconds
}

export interface BannerImageElement {
  id: string;
  type: 'image';
  imageUrl: string;
  productId?: number | null; // Link to product
  productUrl?: string | null; // Direct product URL
  x: number; // percentage from left
  y: number; // percentage from top
  width: number; // percentage width (0-100)
  height?: number; // percentage height (optional, maintains aspect ratio if not set)
  animation?: 'fade' | 'slide' | 'zoom' | 'bounce' | 'pulse' | 'none';
  animationDelay?: number; // in seconds
  animationDuration?: number; // in seconds
}

export type BannerElement = BannerTextElement | BannerImageElement;

export interface Banner {
  id: number;
  title: string | null;
  text: string | null;
  imageUrl: string;
  videoUrl: string | null;
  mediaType: 'image' | 'video';
  linkUrl: string | null;
  order: number;
  isActive: boolean;
  textPosition: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | null;
  textAlign: 'left' | 'center' | 'right' | null;
  animationStyle: 'fade' | 'slide' | 'zoom' | 'none' | null;
  overlayStyle: 'gradient' | 'solid' | 'blur' | 'none' | null;
  textElements: BannerElement[]; // Can contain both text and image elements
  createdAt: string;
  updatedAt: string;
}

export interface BannerFormPayload {
  title?: string | null;
  text?: string | null;
  imageUrl: string;
  videoUrl?: string | null;
  mediaType?: 'image' | 'video';
  linkUrl?: string | null;
  order?: number;
  isActive?: boolean;
  textPosition?: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | null;
  textAlign?: 'left' | 'center' | 'right' | null;
  animationStyle?: 'fade' | 'slide' | 'zoom' | 'none' | null;
  overlayStyle?: 'gradient' | 'solid' | 'blur' | 'none' | null;
  textElements?: BannerElement[];
}

export interface SiteSettings {
  // Text Content
  siteName?: string;
  welcomeTitle?: string;
  welcomeSubtitle?: string;
  browseAllTitle?: string;
  browseAllDescription?: string;
  topPicksTitle?: string;
  topPicksDescription?: string;
  featuredTitle?: string;
  featuredDescription?: string;
  topSellingTitle?: string;
  topSellingDescription?: string;
  shopNowText?: string;
  viewAllText?: string;
  discoverText?: string;
  startShoppingText?: string;
  
  // Premium Style Options
  headingFontSize?: 'small' | 'medium' | 'large' | 'xlarge';
  bodyFontSize?: 'small' | 'medium' | 'large';
  cardSpacing?: 'compact' | 'normal' | 'spacious';
  animationSpeed?: 'slow' | 'normal' | 'fast';
  shadowIntensity?: 'subtle' | 'normal' | 'dramatic';
  borderRadius?: 'small' | 'medium' | 'large' | 'xl';
  hoverEffect?: 'none' | 'subtle' | 'moderate' | 'strong';
  gradientIntensity?: 'light' | 'medium' | 'strong';
}

export interface AdminOverview {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
}

export interface CreateOrderPayload {
  items: Array<{
    productId: number;
    quantity: number;
    selectedColor?: ProductColorOption | null;
    selectedSize?: ProductSizeOption | null;
  }>;
  customer: {
    name: string;
    email: string;
    phone?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  orderSource?: 'WEBSITE' | 'INSTAGRAM' | 'PHONE' | 'IN_PERSON' | 'OTHER';
}

export interface ProductFormPayload {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  gallery?: string[];
  colors?: ProductColorOption[];
  sizes?: ProductSizeOption[];
  itemType: string;
  inventory: number;
  inventoryVariants?: InventoryVariant[];
  categoryIds?: number[]; // Multiple categories
  isFeatured?: boolean;
}

export interface UploadImageResponse {
  url: string;
  filename: string;
}

export interface CategoryFormPayload {
  name: string;
  slug: string;
  description?: string | null;
  isTopSelling?: boolean;
  isFeatured?: boolean;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  createdAt: string;
  orders: Array<{
    id: number;
    status: string;
    total: number;
    trackingId?: string | null;
    courierCompany?: string | null;
    trackingLink?: string | null;
    orderSource?: 'WEBSITE' | 'INSTAGRAM' | 'PHONE' | 'IN_PERSON' | 'OTHER';
    createdAt: string;
    updatedAt: string;
  }>;
}
