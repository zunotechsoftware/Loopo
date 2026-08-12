export type NotificationType = 'offer' | 'price_drop' | 'chat' | 'kyc' | 'ad_boost' | 'security';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  image?: string;
  targetTab?: 'messages' | 'my-ads' | 'product-detail' | 'wallet' | 'settings';
  targetId?: string;
}

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'offer',
    title: 'New Offer Received! 🏷️',
    description: 'Sneha Rao sent a price offer of ₹74,000 for your "MacBook Pro M1 16GB / 512GB".',
    timestamp: '5 mins ago',
    isRead: false,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop',
    targetTab: 'messages',
    targetId: 'conv-sell-2',
  },
  {
    id: 'notif-2',
    type: 'chat',
    title: 'New Message from Vikram Singh 💬',
    description: '"Can I come for a test drive today around 5 PM?" regarding Royal Enfield Classic 350.',
    timestamp: '25 mins ago',
    isRead: false,
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=800&auto=format&fit=crop',
    targetTab: 'messages',
    targetId: 'conv-sell-1',
  },
  {
    id: 'notif-3',
    type: 'price_drop',
    title: 'Price Drop Alert! 📉',
    description: 'An item in your Saved List "iPhone 13 128GB" dropped price by ₹2,000.',
    timestamp: '2 hours ago',
    isRead: false,
    image: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?q=80&w=800&auto=format&fit=crop',
    targetTab: 'product-detail',
    targetId: 'p1',
  },
  {
    id: 'notif-4',
    type: 'kyc',
    title: 'KYC Verification Approved! 🛡️',
    description: 'Your Aadhaar seller identity verification was successful. You now have the Verified Seller badge.',
    timestamp: '1 day ago',
    isRead: true,
    targetTab: 'settings',
  },
  {
    id: 'notif-5',
    type: 'ad_boost',
    title: 'Ad Boost Activated 🚀',
    description: 'Your ad "Maruti Swift VXI 2020" has been promoted to Top of Search for 3 Days.',
    timestamp: '2 days ago',
    isRead: true,
    image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=800&auto=format&fit=crop',
    targetTab: 'my-ads',
  },
  {
    id: 'notif-6',
    type: 'security',
    title: 'Security Alert 🔒',
    description: 'New login detected on Chrome for Windows from Bangalore, Karnataka.',
    timestamp: '3 days ago',
    isRead: true,
    targetTab: 'settings',
  },
];
