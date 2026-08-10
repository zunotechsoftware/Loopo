export interface ChatMessage {
  id: string;
  sender: 'user' | 'other';
  text: string;
  time: string;
}

export interface Conversation {
  id: string;
  sellerName: string;
  sellerAvatar: string;
  itemTitle: string;
  itemPrice: string;
  itemImage: string;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
  messages: ChatMessage[];
}

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    sellerName: 'Arjun Patel',
    sellerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    itemTitle: 'iPhone 13 128GB',
    itemPrice: '₹32,000',
    itemImage: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?q=80&w=800&auto=format&fit=crop',
    lastMessage: 'Hi, is this still available?',
    lastTime: '10:28 PM',
    unreadCount: 2,
    messages: [
      { id: 'm1', sender: 'user', text: 'Hi, is this still available?', time: '10:25 PM' },
      { id: 'm2', sender: 'other', text: 'Yes, it is available! Are you interested in purchasing?', time: '10:26 PM' },
      { id: 'm3', sender: 'user', text: 'Can you share more photos?', time: '10:28 PM' },
    ],
  },
  {
    id: 'conv-2',
    sellerName: 'Rohan Sharma',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    itemTitle: 'Maruti Swift VXI 2020',
    itemPrice: '₹4,85,000',
    itemImage: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=800&auto=format&fit=crop',
    lastMessage: 'Sure, you can inspect it tomorrow evening.',
    lastTime: 'Yesterday',
    unreadCount: 0,
    messages: [
      { id: 'm1', sender: 'user', text: 'Is the price negotiable?', time: 'Yesterday' },
      { id: 'm2', sender: 'other', text: 'Sure, you can inspect it tomorrow evening.', time: 'Yesterday' },
    ],
  },
];
