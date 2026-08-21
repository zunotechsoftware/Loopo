export type NotificationType = 'Promotion' | 'Order Update' | 'Engagement' | 'Security' | 'Cart Reminder' | 'Update' | 'Onboarding';
export type NotificationStatus = 'Delivered' | 'Scheduled' | 'Failed' | 'Draft' | 'Opened';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  audience: string;
  sentScheduled: string;
  status: NotificationStatus;
  delivery: string;
  iconBg: string;
  iconColor: string;
  iconName: string;
}

export const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Flash Sale is Live! ⚡',
    message: 'Huge discounts on electronics. Shop now before it ends!',
    type: 'Promotion',
    audience: 'All Users',
    sentScheduled: 'May 16, 2024\\n03:00 PM',
    status: 'Delivered',
    delivery: '92.45%',
    iconBg: '#f3e8ff',
    iconColor: '#9333ea',
    iconName: 'flash',
  },
  {
    id: '2',
    title: 'Your Order is Shipped 📦',
    message: 'Great news! Your order #ORD12345 has been shipped.',
    type: 'Order Update',
    audience: 'Users',
    sentScheduled: 'May 15, 2024\\n11:20 AM',
    status: 'Delivered',
    delivery: '89.12%',
    iconBg: '#dcfce7',
    iconColor: '#16a34a',
    iconName: 'shopping_bag',
  },
  {
    id: '3',
    title: 'Rate & Earn Rewards ⭐',
    message: 'Rate your purchase and earn reward points.',
    type: 'Engagement',
    audience: 'Past Buyers',
    sentScheduled: 'May 14, 2024\\n09:15 AM',
    status: 'Delivered',
    delivery: '76.53%',
    iconBg: '#ffedd5',
    iconColor: '#f97316',
    iconName: 'star',
  },
  {
    id: '4',
    title: 'Items in Your Wishlist on Sale! 💖',
    message: 'Prices dropped on items you love. Check now!',
    type: 'Promotion',
    audience: 'Users with Wishlist',
    sentScheduled: 'May 13, 2024\\n04:45 PM',
    status: 'Opened',
    delivery: '63.21%',
    iconBg: '#fce7f3',
    iconColor: '#db2777',
    iconName: 'favorite',
  },
  {
    id: '5',
    title: 'Account Security Alert 🛡️',
    message: 'New login detected on your account from a new device.',
    type: 'Security',
    audience: 'Specific Users',
    sentScheduled: 'May 12, 2024\\n08:30 PM',
    status: 'Delivered',
    delivery: '100%',
    iconBg: '#eff6ff',
    iconColor: '#3b82f6',
    iconName: 'security',
  },
  {
    id: '6',
    title: 'Special Offer for You! 🎁',
    message: "Here's 20% OFF just for you. Use code: SAVE20",
    type: 'Promotion',
    audience: 'Segmented Users',
    sentScheduled: 'May 11, 2024\\n01:30 PM',
    status: 'Delivered',
    delivery: '85.77%',
    iconBg: '#f3e8ff',
    iconColor: '#9333ea',
    iconName: 'card_giftcard',
  },
  {
    id: '7',
    title: "Don't Miss Out! 🛒",
    message: 'Your cart is waiting. Complete your purchase now.',
    type: 'Cart Reminder',
    audience: 'Cart Abandoners',
    sentScheduled: 'May 10, 2024\\n03:20 PM',
    status: 'Scheduled',
    delivery: '-',
    iconBg: '#ccfbf1',
    iconColor: '#14b8a6',
    iconName: 'notifications_active',
  },
  {
    id: '8',
    title: 'New Arrivals Just In! ✨',
    message: 'Check out the latest products handpicked for you.',
    type: 'Update',
    audience: 'All Users',
    sentScheduled: 'May 10, 2024\\n10:00 AM',
    status: 'Delivered',
    delivery: '91.05%',
    iconBg: '#ffedd5',
    iconColor: '#f97316',
    iconName: 'new_releases',
  },
  {
    id: '9',
    title: 'Weekend Mega Deals 🏷️',
    message: 'Limited time offers on fashion, home & more.',
    type: 'Promotion',
    audience: 'All Users',
    sentScheduled: 'May 05, 2024\\n06:00 PM',
    status: 'Failed',
    delivery: '0%',
    iconBg: '#fee2e2',
    iconColor: '#ef4444',
    iconName: 'local_offer',
  },
  {
    id: '10',
    title: 'Welcome to Loopo! 👋',
    message: "Thanks for joining Loopo. Let's get started!",
    type: 'Onboarding',
    audience: 'New Users',
    sentScheduled: 'May 05, 2024\\n11:15 AM',
    status: 'Delivered',
    delivery: '95.24%',
    iconBg: '#dcfce7',
    iconColor: '#16a34a',
    iconName: 'waving_hand',
  },
];
