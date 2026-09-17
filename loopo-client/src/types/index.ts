export interface ProductSeller {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  memberSince: string;
  isVerified: boolean;
}

export interface Product {
  id: string;
  title: string;
  price: number;
  location: string;
  postedDate: string;
  category: string;
  condition: string;
  images: string[];
  seller: ProductSeller;
  description: string;
  specs: Record<string, string>;
  viewsCount: number;
  distance: string;
  likesCount: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  count: string;
  iconName: string;
  color: string;
  subcategories: string[];
  itemCount: string;
  icon: string;
}

export const CATEGORIES: CategoryItem[] = [
  { id: 'cat-1', name: 'Mobiles', count: 'Explore ads', iconName: 'Smartphone', color: 'bg-blue-50 text-blue-600', subcategories: ['Smartphones', 'Tablets', 'Accessories', 'Wearables'], itemCount: '0', icon: 'Smartphone' },
  { id: 'cat-2', name: 'Cars', count: 'Explore ads', iconName: 'Car', color: 'bg-red-50 text-red-600', subcategories: ['Sedans', 'SUVs', 'Hatchbacks', 'Luxury'], itemCount: '0', icon: 'Car' },
  { id: 'cat-3', name: 'Bikes', count: 'Explore ads', iconName: 'Bike', color: 'bg-emerald-50 text-emerald-600', subcategories: ['Motorcycles', 'Scooters', 'Bicycles', 'EVs'], itemCount: '0', icon: 'Bike' },
  { id: 'cat-4', name: 'Electronics', count: 'Explore ads', iconName: 'Tv', color: 'bg-purple-50 text-purple-600', subcategories: ['Laptops', 'TVs & Audio', 'Cameras', 'Gaming'], itemCount: '0', icon: 'Tv' },
  { id: 'cat-5', name: 'Furniture', count: 'Explore ads', iconName: 'Sofa', color: 'bg-amber-50 text-amber-600', subcategories: ['Sofas & Beds', 'Tables & Chairs', 'Decor', 'Storage'], itemCount: '0', icon: 'Sofa' },
  { id: 'cat-6', name: 'Fashion', count: 'Explore ads', iconName: 'Shirt', color: 'bg-pink-50 text-pink-600', subcategories: ['Men', 'Women', 'Footwear', 'Watches'], itemCount: '0', icon: 'Shirt' },
  { id: 'cat-7', name: 'Books', count: 'Explore ads', iconName: 'BookOpen', color: 'bg-indigo-50 text-indigo-600', subcategories: ['Fiction', 'Textbooks', 'Comics', 'Non-Fiction'], itemCount: '0', icon: 'BookOpen' },
  { id: 'cat-8', name: 'Home & Living', count: 'Explore ads', iconName: 'Home', color: 'bg-teal-50 text-teal-600', subcategories: ['Appliances', 'Kitchen', 'Garden', 'Lighting'], itemCount: '0', icon: 'Home' },
];


export interface ChatMessage {
  id: string;
  sender: 'user' | 'other';
  text: string;
  time: string;
  isOffer?: boolean;
  offerAmount?: number;
  offerStatus?: 'Accepted' | 'Declined' | 'Pending';
  /** True while an optimistically-appended message hasn't been confirmed
   * by the server yet (still in flight). */
  pending?: boolean;
  /** True if the send request failed - the optimistic message stays
   * visible but flagged so the UI can offer a retry instead of silently
   * discarding what the user typed. */
  failed?: boolean;
}


export interface Conversation {
  id: string;
  type: 'buying' | 'selling';
  otherPartyId: string;
  otherPartyName: string;
  otherPartyAvatar: string;
  otherPartyRole: 'Buyer' | 'Seller';
  itemTitle: string;
  itemPrice: string;
  itemImage: string;
  itemLocation: string;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
  messages: ChatMessage[];
  /** Whether the full message history has been fetched yet - the
   * conversation-list endpoint only ever returns each conversation's
   * single latest message as a preview, not the full thread. */
  messagesLoaded?: boolean;
}

export type NotificationType =
  | 'offer'
  | 'chat'
  | 'price_drop'
  | 'kyc'
  | 'ad_boost'
  | 'security';


export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  image?: string;
  targetTab?: string;
  targetId?: string;
}

export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  title: string;
  date: string;
  amount: number;
}

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  avatar: string;
  isVerified: boolean;
  memberSince: string;
  /** Real profile location, when the user has set one - undefined/empty
   * rather than a fake default when they haven't. */
  city?: string;
  state?: string;
  /** The real backend login/profile response returns `roles: string[]`
   * (a user can hold more than one) - there is no singular `role` field. */
  roles?: string[];
}

export interface MyAdItem {
  id: string;
  title: string;
  price: string;
  postedDate: string;
  image: string;
  /** Coarse display bucket used for the "All" tab's badge colour. */
  status: 'Active' | 'Sold' | 'Inactive';
  /** Real backend ProductStatus enum value (DRAFT/PENDING/UNDER_REVIEW/
   * APPROVED/REJECTED/EXPIRED/ARCHIVED/PAUSED/SOLD) - the per-status tabs
   * (Drafts/Pending/Rejected/Sold) filter on this, not on `status`, since
   * `status` collapses several distinct backend states together. */
  rawStatus: string;
  /** Set when rawStatus is REJECTED - the moderator's real reason, so the
   * seller can see why and correct it before resubmitting. */
  rejectionReason?: string;
}
