export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  sku: string;
  barcode?: string;
  status: string;
  price: number;
  discountPrice?: number | null;
  /** Kosovo TVSH % (0, 8, 18); null = not applicable */
  vatRate?: number | null;
  stockQuantity: number;
  lowStockThreshold: number;
  isFeatured: boolean;
  specs?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  category: { name: string; slug: string };
  brand?: { name: string; slug: string } | null;
  images: { id: string; url: string; alt?: string; isPrimary: boolean }[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  children?: Category[];
  _count?: { products: number };
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string | null;
  isActive?: boolean;
  _count?: { products: number };
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
  addedAt?: number;
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  trackingNumber?: string;
  status: string;
  subtotal: number;
  vatAmount?: number;
  shippingFee: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  customerEmail: string;
  customerPhone: string;
  customerName: string;
  deliveryCity: string;
  deliveryAddress: string;
  notes?: string;
  createdAt: string;
  items: (OrderItem & { product: { name: string; slug: string } })[];
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Pagination {
  totalItems: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface Promotion {
  id: string;
  name: string;
  code?: string;
  description?: string;
  type: string;
  value: number;
  minOrder?: number;
  isActive: boolean;
}
