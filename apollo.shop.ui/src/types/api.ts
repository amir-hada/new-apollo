export type ProductStatus = 0 | 1 | 2;
export type OrderStatus = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type TicketStatus = 0 | 1 | 2 | 3 | 4;
export type TicketPriority = 0 | 1 | 2 | 3;
export type BlogPostStatus = 0 | 1 | 2;
export type PaymentStatus = 0 | 1 | 2 | 3;

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface UserInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  roles: string[];
}

export interface AuthResponse {
  accessToken: string;
  expiresAt: string;
  refreshToken: string;
  user: UserInfo;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
}

export interface SendOtpRequest {
  phoneNumber: string;
}

export interface SendOtpResponse {
  phoneNumber: string;
  expiresInSeconds: number;
  devCode?: string | null;
}

export interface VerifyOtpRequest {
  phoneNumber: string;
  code: string;
}

export interface PhoneLoginRequest {
  phoneNumber: string;
  password: string;
}

/** 0 = تصویر، 1 = ویدیو */
export type ProductMediaKind = 0 | 1;

export interface ProductImage {
  id?: string | null;
  imagePath: string;
  alternativeText?: string | null;
  sortOrder: number;
  isPrimary: boolean;
  mediaKind?: ProductMediaKind;
}

export interface ProductVariant {
  id?: string | null;
  sku: string;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  stockQuantity: number;
  isActive: boolean;
}

export interface ProductSpecValue {
  id?: string | null;
  value: string;
  priceAdjustment: number;
  sortOrder: number;
}

export interface ProductSpec {
  id?: string | null;
  name: string;
  isOrderParameter: boolean;
  sortOrder: number;
  values: ProductSpecValue[];
}

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  productCode: string;
  sku?: string | null;
  basePrice: number;
  discountPrice?: number | null;
  status: ProductStatus;
  isAvailable: boolean;
  brandName?: string | null;
  categoryName?: string | null;
  primaryImageUrl?: string | null;
  stockQuantity: number;
  totalSales?: number;
  totalRevenue?: number;
  revenueTrend?: number[];
}

export interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  brandId?: string | null;
  brandName?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  isAvailable: boolean;
  status: ProductStatus;
  productCode: string;
  sku?: string | null;
  basePrice: number;
  discountPrice?: number | null;
  stockQuantity: number;
  trackInventory: boolean;
  showStockInStore: boolean;
  stockDisplayThreshold?: number | null;
  minOrderQuantity: number;
  maxOrderQuantity?: number | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  focusKeyword?: string | null;
  canonicalUrl?: string | null;
  robotsNoIndex?: boolean;
  robotsNoFollow?: boolean;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImageUrl?: string | null;
  createdAtUtc: string;
  updatedAtUtc?: string | null;
  images: ProductImage[];
  specs: ProductSpec[];
  /** Read-only for cart; managed via product stock/price/sku */
  variants: ProductVariant[];
}

export interface CreateProductRequest {
  name: string;
  slug: string;
  description: string;
  brandId?: string | null;
  categoryId?: string | null;
  isAvailable: boolean;
  status: ProductStatus;
  basePrice: number;
  discountPrice?: number | null;
  stockQuantity: number;
  trackInventory: boolean;
  showStockInStore: boolean;
  stockDisplayThreshold?: number | null;
  minOrderQuantity: number;
  maxOrderQuantity?: number | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  focusKeyword?: string | null;
  canonicalUrl?: string | null;
  robotsNoIndex?: boolean;
  robotsNoFollow?: boolean;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImageUrl?: string | null;
  sku?: string | null;
  images?: ProductImage[] | null;
  specs?: ProductSpec[] | null;
}

export interface UpdateProductRequest {
  name: string;
  slug: string;
  description: string;
  brandId?: string | null;
  categoryId?: string | null;
  isAvailable: boolean;
  status: ProductStatus;
  basePrice: number;
  discountPrice?: number | null;
  stockQuantity: number;
  trackInventory: boolean;
  showStockInStore: boolean;
  stockDisplayThreshold?: number | null;
  minOrderQuantity: number;
  maxOrderQuantity?: number | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  focusKeyword?: string | null;
  canonicalUrl?: string | null;
  robotsNoIndex?: boolean;
  robotsNoFollow?: boolean;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImageUrl?: string | null;
  sku?: string | null;
  images?: ProductImage[] | null;
  specs?: ProductSpec[] | null;
}

export interface CategoryTree {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  sortOrder: number;
  isActive: boolean;
  children: CategoryTree[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface UpsertCategoryRequest {
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imagePath?: string | null;
  isActive: boolean;
  createdAtUtc: string;
  updatedAtUtc?: string | null;
}

export interface UpsertBrandRequest {
  name: string;
  slug: string;
  description?: string | null;
  imagePath?: string | null;
  isActive: boolean;
}

export interface CartSelectedOption {
  specificationId: string;
  name: string;
  valueId: string;
  value: string;
  priceAdjustment: number;
}

export interface CartItem {
  id: string;
  productVariantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  variantName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  stockQuantity: number;
  selectedOptions: CartSelectedOption[];
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  productVariantId: string;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  selectedOptions?: CartSelectedOption[];
}

export interface OrderListItem {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  grandTotal: number;
  createdAtUtc: string;
  customerEmail?: string | null;
}

export interface OrderDetail {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  taxAmount: number;
  grandTotal: number;
  currency: string;
  shippingAddressSnapshot: string;
  notes?: string | null;
  createdAtUtc: string;
  paidAtUtc?: string | null;
  userId: string;
  customerEmail?: string | null;
  items: OrderItem[];
}

export interface Address {
  id: string;
  title: string;
  fullName: string;
  phone: string;
  province: string;
  city: string;
  postalCode: string;
  line1: string;
  line2?: string | null;
  isDefault: boolean;
}

export interface UpsertAddressRequest {
  title: string;
  fullName: string;
  phone: string;
  province: string;
  city: string;
  postalCode: string;
  line1: string;
  line2?: string | null;
  isDefault: boolean;
}

export interface Profile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  roles: string[];
}

export interface BlogPostListItem {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  featuredImageUrl?: string | null;
  status: BlogPostStatus;
  publishedAtUtc?: string | null;
  categoryName?: string | null;
}

export interface BlogPostDetail {
  id: string;
  slug: string;
  title: string;
  body: string;
  excerpt?: string | null;
  featuredImageUrl?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  status: BlogPostStatus;
  publishedAtUtc?: string | null;
  authorUserId: string;
  categoryId?: string | null;
  categoryName?: string | null;
  tags: string[];
}

export interface UpsertBlogPostRequest {
  slug: string;
  title: string;
  body: string;
  excerpt?: string | null;
  featuredImageUrl?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  categoryId?: string | null;
  tags?: string[] | null;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

export interface TicketMessage {
  id: string;
  senderUserId: string;
  body: string;
  isStaff: boolean;
  createdAtUtc: string;
}

export interface TicketListItem {
  id: string;
  number: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAtUtc: string;
  assignedToUserId?: string | null;
  categoryName?: string | null;
}

export interface TicketDetail {
  id: string;
  number: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  userId: string;
  assignedToUserId?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  createdAtUtc: string;
  messages: TicketMessage[];
}

export interface CreateTicketRequest {
  subject: string;
  message: string;
  categoryId?: string | null;
  priority: TicketPriority;
}

export interface UserListItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  isActive: boolean;
  createdAtUtc: string;
  lastLoginAtUtc?: string | null;
  roles: string[];
}

export interface UserDetail {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  isActive: boolean;
  emailConfirmed: boolean;
  createdAtUtc: string;
  lastLoginAtUtc?: string | null;
  roles: string[];
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  isActive: boolean;
  roles?: string[] | null;
}

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  isActive: boolean;
}

export interface TopProduct {
  productId: string;
  productName: string;
  quantitySold: number;
  revenue: number;
}

export interface DashboardReport {
  userCount: number;
  orderCount: number;
  totalSales: number;
  todaySales: number;
  monthSales: number;
  pendingOrders: number;
  completedOrders: number;
  productCount: number;
  openTickets: number;
  topProducts: TopProduct[];
}

export interface ProductReportDay {
  date: string;
  unitsSold: number;
  revenue: number;
  views: number;
  likes: number;
  comments: number;
}

export interface ProductVariantSales {
  variantId: string;
  sku: string;
  name: string;
  unitsSold: number;
  revenue: number;
}

export interface ProductReport {
  productId: string;
  productName: string;
  days: number;
  revenue: number;
  unitsSold: number;
  orderCount: number;
  averageOrderValue: number;
  returnedUnits: number;
  views: number;
  uniqueViews: number;
  likes: number;
  comments: number;
  averageRating?: number | null;
  cartQuantity: number;
  conversionRatePercent: number;
  stockQuantity: number;
  trackInventory: boolean;
  timeline: ProductReportDay[];
  variantSales: ProductVariantSales[];
}

export interface StartPaymentResult {
  paymentId: string;
  orderId: string;
  authority?: string | null;
  redirectUrl?: string | null;
  status: PaymentStatus;
}

export interface VerifyPaymentResult {
  paymentId: string;
  orderId: string;
  status: PaymentStatus;
  trackingCode?: string | null;
}

export interface HeroBanner {
  id: string;
  imageUrl: string;
  linkUrl?: string | null;
  sortOrder: number;
}

export interface HomeStory {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string | null;
  sortOrder: number;
}

export interface ShopSettings {
  id: string;
  shopTitle: string;
  browserTitle: string;
  logoUrl?: string | null;
  favIconUrl?: string | null;
  currency: string;
  supportPhone?: string | null;
  supportEmail?: string | null;
  address?: string | null;
  description?: string | null;
  metaDescription?: string | null;
  primaryColor?: string | null;
  heroBanners?: HeroBanner[];
  homeStories?: HomeStory[];
}

export interface UpdateShopSettingsRequest {
  shopTitle: string;
  browserTitle: string;
  logoUrl?: string | null;
  favIconUrl?: string | null;
  currency: string;
  supportPhone?: string | null;
  supportEmail?: string | null;
  address?: string | null;
  description?: string | null;
  metaDescription?: string | null;
  primaryColor?: string | null;
}

export interface UploadFileResult {
  url: string;
  fileName: string;
  contentType: string;
  size: number;
}
