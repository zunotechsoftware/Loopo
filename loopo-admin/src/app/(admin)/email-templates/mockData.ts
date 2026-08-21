export type TemplateCategory = 'User' | 'Order' | 'Message' | 'Marketing' | 'Account' | 'Notification';
export type TemplateStatus = 'Active' | 'Inactive';

export interface EmailTemplate {
  id: string;
  name: string;
  subtext: string;
  category: TemplateCategory;
  subject: string;
  language: string;
  status: TemplateStatus;
  used: number;
  updatedOn: string; // "May 15, 2024 09:30 PM"
}

export const mockTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Welcome Email',
    subtext: 'User Welcome',
    category: 'User',
    subject: 'Welcome to Loopo! 👋',
    language: 'English',
    status: 'Active',
    used: 1248,
    updatedOn: 'May 15, 2024\n09:30 PM',
  },
  {
    id: '2',
    name: 'Email Verification',
    subtext: 'User Verification',
    category: 'User',
    subject: 'Verify your email address',
    language: 'English',
    status: 'Active',
    used: 980,
    updatedOn: 'May 15, 2024\n11:20 AM',
  },
  {
    id: '3',
    name: 'Password Reset',
    subtext: 'Password Reset',
    category: 'User',
    subject: 'Reset your Loopo password',
    language: 'English',
    status: 'Active',
    used: 876,
    updatedOn: 'May 14, 2024\n09:15 AM',
  },
  {
    id: '4',
    name: 'Order Confirmation',
    subtext: 'Order Confirmation',
    category: 'Order',
    subject: 'Order confirmed: #{order_id}',
    language: 'English',
    status: 'Active',
    used: 852,
    updatedOn: 'May 12, 2024\n04:45 PM',
  },
  {
    id: '5',
    name: 'Order Shipped',
    subtext: 'Order Update',
    category: 'Order',
    subject: 'Your order has been shipped!',
    language: 'English',
    status: 'Active',
    used: 612,
    updatedOn: 'May 11, 2024\n01:20 PM',
  },
  {
    id: '6',
    name: 'Order Delivered',
    subtext: 'Order Update',
    category: 'Order',
    subject: 'Your order has been delivered',
    language: 'English',
    status: 'Active',
    used: 405,
    updatedOn: 'May 10, 2024\n08:20 PM',
  },
  {
    id: '7',
    name: 'New Message',
    subtext: 'Messaging',
    category: 'Message',
    subject: 'You have a new message',
    language: 'English',
    status: 'Active',
    used: 1102,
    updatedOn: 'May 09, 2024\n10:10 AM',
  },
  {
    id: '8',
    name: 'Promotional Offer',
    subtext: 'Marketing',
    category: 'Marketing',
    subject: 'Special offer just for you! 🎁',
    language: 'English',
    status: 'Active',
    used: 1289,
    updatedOn: 'May 08, 2024\n06:00 PM',
  },
  {
    id: '9',
    name: 'Account Suspended',
    subtext: 'Account',
    category: 'Account',
    subject: 'Important: Account Suspended',
    language: 'English',
    status: 'Inactive',
    used: 120,
    updatedOn: 'May 07, 2024\n02:15 PM',
  },
  {
    id: '10',
    name: 'Low Balance Alert',
    subtext: 'Notification',
    category: 'Notification',
    subject: 'Low wallet balance alert',
    language: 'English',
    status: 'Active',
    used: 634,
    updatedOn: 'May 06, 2024\n09:45 AM',
  },
];
