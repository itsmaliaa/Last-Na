export type ViewMode = 
  | 'marketplace' 
  | 'buyer_profile' 
  | 'seller_portal'
  | 'admin_portal';

export type MarketplaceTab = 
  | 'home' 
  | 'shop' 
  | 'cart'
  | 'artists' 
  | 'artist_profile' 
  | 'gallery' 
  | 'hearts'
  | 'help';

export type SellerTab = 
  | 'dashboard'
  | 'order'
  | 'shipping_fulfillment'
  | 'art_verification'
  | 'authenticity_check'
  | 'finance'
  | 'messages'
  | 'artist_gallery'
  | 'voucher_generator'
  | 'discount_code'
  | 'certificate'
  | 'logs'
  | 'stock';

export interface SellerOrderTransaction {
  id: string;
  artwork: string;
  artist: string;
  buyer: string;
  buyerEmail?: string;
  date: string;
  grossAmount: number;
  platformTakeRate: number; // 0%
  platformTakeAmount: number; // 0
  netStudentPayout: number;
  status: 'Completed' | 'Pending' | 'Shipped' | 'Cancelled';
  escrowStatus?: 'Awaiting payment' | 'Held' | 'Released' | 'Refunded';
  orderNumber?: string;
  deliveryMethod?: 'campus_pickup' | 'door_to_door';
  paymentMethod?: string;
  quantity?: number;
  selectedSize?: string;
  designChoice?: string;
  buyerNote?: string;
  voucherCode?: string;
  discountAmount?: number;
  selectedColor?: string;
  selectedOptions?: Record<string, string>;
  productType?: Artwork['productType'];
  deliveryAddress?: string;
  receiptDetails?: {
    buyerName: string;
    buyerAddress: string;
    buyerPhone?: string;
    sellerName: string;
    sellerAddress: string;
    itemTitle: string;
    quantity: number;
    weight?: string;
    size: string;
  };
  fulfillmentStatus?: 'Processing' | 'Ready for pickup' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Returned';
  shippingProvider?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  parcelWeightKg?: number;
  parcelLengthCm?: number;
  parcelWidthCm?: number;
  parcelHeightCm?: number;
  proofOfDeliveryImage?: string;
  deliveryRiderName?: string;
  deliveryRiderPhone?: string;
  completedAt?: string;
}

export interface CheckoutDetails {
  deliveryMethod: 'campus_pickup' | 'door_to_door';
  paymentMethod: PaymentMethod;
  recipientName: string;
  phone: string;
  deliveryAddress: string;
  addressId?: string;
  buyerNote?: string;
  voucherCode?: string;
}

export type ManualFulfillmentStatus = 'Ready for pickup' | 'Shipped' | 'Out for Delivery';

export interface ShipmentDetails {
  shippingProvider: string;
  trackingNumber: string;
  trackingUrl: string;
  deliveryRiderName?: string;
  deliveryRiderPhone?: string;
  parcelWeightKg?: number;
  parcelLengthCm?: number;
  parcelWidthCm?: number;
  parcelHeightCm?: number;
}

export interface DeliveryCompletionDetails {
  proofOfDeliveryImage: string;
}

export interface BuyerAddress {
  id: string;
  label: string;
  name: string;
  line1: string;
  city: string;
  phone: string;
  isDefault: boolean;
}

export interface VoucherItem {
  id: string;
  code: string;
  sellerName?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minSpend: number;
  usageLimit: number;
  usedCount: number;
  expiresAt: string;
  status: 'Active' | 'Expired' | 'Draft';
}

export interface SellerAnnouncement {
  id: string;
  title: string;
  type: 'sale' | 'booth' | 'exhibition';
  description: string;
  locationOrBooth?: string;
  dateRange: string;
  discountPromo?: string;
  status: 'Active' | 'Scheduled';
  createdAt: string;
  viewsCount?: number;
}

export interface HomePromotion {
  id: string;
  sellerName: string;
  headline: string;
  description: string;
  artworkId?: string;
  date?: string;
  image?: string;
  placement: 'add' | 'replace';
  createdAt: string;
}

export interface ArtistDirectoryItem {
  id: string;
  name: string;
  artType: 'Painting' | 'Sculpture' | 'Architecture' | 'Photography' | 'Digital Art' | 'Mixed Media';
  dept: string;
  location: string;
  bio: string;
  followers: number;
  artworksCount: number;
  salesCount: number;
  rating: number;
  avatar: string;
  banner?: string;
  specialties: string[];
  sampleImages: string[];
  achievements?: {
    title: string;
    description: string;
  }[];
  memberSince?: string;
  isFollowed?: boolean;
}

export type BuyerTab = 
  | 'orders' 
  | 'addresses' 
  | 'messages' 
  | 'security' 
  | 'password'
  | 'payments';

export type AdminTab = 
  | 'dashboard' 
  | 'sales' 
  | 'marketing'
  | 'bank_account'
  | 'art_verification' 
  | 'authenticity_check'
  | 'users_admins' 
  | 'users_students' 
  | 'users_customers' 
  | 'strikes_bans' 
  | 'audit_logs'
  | 'customer_service';

export interface Artwork {
  id: string;
  title: string;
  artist: string;
  artistDept?: string;
  artistSchool?: string;
  schoolNumber?: string;
  course?: string;
  image: string;
  video?: string;
  price: number; // in PHP ₱
  size: string;
  genre?: string;
  status: 'pending' | 'approved' | 'rejected';
  isActive?: boolean;
  reviewNotes?: string;
  badge?: 'Trending' | 'Best Seller' | 'Popular' | 'For Sale' | 'Collector Pick' | 'New' | 'Featured' | 'Limited print';
  rating?: number;
  colors?: string[];
  description?: string;
  features?: string;
  mediumsUsed?: string;
  postedDate?: string;
  category: 'painting' | 'sculpture' | 'architecture' | 'digital' | 'photography' | 'print' | 'mixed_media';
  style?: string;
  isFavorited?: boolean;
  heartsCount?: number;
  stock?: number;
  editionType?: 'Original 1/1' | 'Limited Edition' | 'Art Print';
  productType?: 'pre_made' | 'digital' | 'custom_made';
  fulfillmentType?: 'physical' | 'digital';
  availablePayments?: PaymentMethod[];
  weightKg?: number;
  designOptions?: string[];
  sizeOptions?: string[];
  colorOptions?: string[];
  optionGroups?: ArtworkOptionGroup[];
  shopName?: string;
  shopAddress?: string;
}

export interface ArtworkOptionGroup {
  id: string;
  name: string;
  options: string[];
  optionImages?: Record<string, string>;
}

export type PaymentMethod = 'Maya' | 'GCash';

export interface RankedArtist {
  id: string;
  rank: number;
  name: string;
  dept: string;
  soldCount: number;
  rating: number;
  avatar: string;
  isFollowed: boolean;
}

export interface OrderItem {
  id: string;
  artworkId?: string;
  orderNumber: string;
  title: string;
  artist: string;
  buyerEmail?: string;
  medium: string;
  status: 'Processing' | 'Ready for pickup' | 'In transit' | 'Return eligible' | 'Completed';
  fulfillmentStatus?: SellerOrderTransaction['fulfillmentStatus'];
  dateInfo: string;
  price: number;
  voucherCode?: string;
  discountAmount?: number;
  image: string;
  deliveryMethod?: 'campus_pickup' | 'door_to_door';
  paymentMethod?: string;
  deliveryAddress?: string;
  shippingProvider?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  parcelWeightKg?: number;
  parcelLengthCm?: number;
  parcelWidthCm?: number;
  parcelHeightCm?: number;
  proofOfDeliveryImage?: string;
  deliveryRiderName?: string;
  deliveryRiderPhone?: string;
  completedAt?: string;
  returnDueAt?: string;
  quantity?: number;
  selectedSize?: string;
  designChoice?: string;
  buyerNote?: string;
  selectedColor?: string;
  selectedOptions?: Record<string, string>;
  productType?: Artwork['productType'];
}

export interface ArtworkReview {
  orderId: string;
  artworkId?: string;
  artworkTitle: string;
  artist: string;
  buyerEmail: string;
  buyerName: string;
  rating: number;
  text: string;
  createdAt: string;
  sellerReply?: string;
  sellerReplyAt?: string;
}

export type RefundRequestStatus = 'pending' | 'approved' | 'declined';

export interface RefundRequest {
  id: string;
  orderId: string;
  orderNumber: string;
  artworkTitle: string;
  artist: string;
  buyerName: string;
  buyerEmail: string;
  issueType: 'received_with_issues' | 'not_received';
  reason: string;
  details: string;
  evidenceImage: string;
  status: RefundRequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'buyer' | 'seller' | 'support';
  text: string;
  time: string;
  refundRequestId?: string;
}

export interface Conversation {
  id: string;
  orderId?: string;
  buyerName?: string;
  buyerEmail?: string;
  sellerName?: string;
  isSupport?: boolean;
  name: string;
  email: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  buyerUnread?: boolean;
  sellerUnread?: boolean;
  adminUnread?: boolean;
  avatarBg: string;
  avatarInitials: string;
  subject: string;
  messages: ChatMessage[];
}

export interface AdminUser {
  id: string;
  name: string;
  handle: string;
  role: 'Admin' | 'Super Admin';
  status: 'Active' | 'Inactive';
}

export interface StudentUser {
  id: string;
  name: string;
  studentNumber: string;
  course: string;
  yearLevel: string;
  email: string;
  status: 'Verified' | 'Pending' | 'Rejected';
  isSuspended?: boolean;
  documentName: string;
}

export interface CustomerUser {
  id: string;
  name: string;
  handle: string;
  email: string;
  role: 'Customer';
  isSuspended?: boolean;
  completedPurchases?: number;
}

export interface StrikeUser {
  id: string;
  role: 'Seller' | 'Buyer';
  account: string;
  email: string;
  strikes: number; // max 3
  status: 'Active' | 'Banned';
}

export interface AuditLogItem {
  id: string;
  datetime: string;
  action: 'Login' | 'Logout' | 'Information' | 'Verification' | 'Strike';
  actor: string;
  role: string;
  status: 'Success' | 'Warning' | 'Error';
  information: string;
}

export interface CartItem {
  artwork: Artwork;
  quantity: number;
  lineId?: string;
  selectedSize?: string;
  designChoice?: string;
  buyerNote?: string;
  selectedColor?: string;
  selectedOptions?: Record<string, string>;
}
