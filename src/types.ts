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
  | 'hearts';

export type SellerTab = 
  | 'dashboard'
  | 'order'
  | 'shipping_fulfillment'
  | 'art_verification'
  | 'authenticity_check'
  | 'marketing'
  | 'finance'
  | 'messages'
  | 'artist_gallery'
  | 'voucher_generator'
  | 'discount_code'
  | 'promotions'
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
  deliveryAddress?: string;
  fulfillmentStatus?: 'Processing' | 'Ready for pickup' | 'Shipped' | 'On the way' | 'Delivered';
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
  paymentMethod: string;
  recipientName: string;
  phone: string;
  deliveryAddress: string;
  addressId?: string;
}

export type ManualFulfillmentStatus = 'Ready for pickup' | 'Shipped';

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
  | 'bank_account'
  | 'art_verification' 
  | 'authenticity_check'
  | 'users_admins' 
  | 'users_students' 
  | 'users_customers' 
  | 'strikes_bans' 
  | 'student_verification_pending' 
  | 'student_verification_verified' 
  | 'audit_logs';

export interface Artwork {
  id: string;
  title: string;
  artist: string;
  artistDept?: string;
  artistSchool?: string;
  schoolNumber?: string;
  course?: string;
  image: string;
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
}

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
  orderNumber: string;
  title: string;
  artist: string;
  buyerEmail?: string;
  medium: string;
  status: 'Processing' | 'Ready for pickup' | 'In transit' | 'Return eligible' | 'Completed';
  dateInfo: string;
  price: number;
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
}

export interface ChatMessage {
  id: string;
  sender: 'buyer' | 'seller' | 'support';
  text: string;
  time: string;
}

export interface Conversation {
  id: string;
  name: string;
  email: string;
  lastMessage: string;
  time: string;
  unread: boolean;
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
  documentName: string;
}

export interface CustomerUser {
  id: string;
  name: string;
  handle: string;
  email: string;
  role: 'Customer';
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
}
