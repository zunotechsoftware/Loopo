export interface Message {
  id: string;
  text: string;
  timestamp: string;
  isSentByMe: boolean;
  images?: string[];
  status?: 'sent' | 'delivered' | 'read';
}

export interface Conversation {
  id: string;
  user: {
    name: string;
    avatar: string;
    isOnline: boolean;
    id: string;
    phone: string;
    email: string;
    memberSince: string;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
  orderInfo?: {
    orderId: string;
    listing: string;
    status: string;
  };
}

export const mockConversations: Conversation[] = [
  {
    id: '1',
    user: {
      name: 'Rahul Sharma',
      avatar: 'https://i.pravatar.cc/150?u=rahul',
      isOnline: true,
      id: '#USER-0002468',
      phone: '+91 98765 43210',
      email: 'rahul.sharma@email.com',
      memberSince: '10 Mar 2024',
    },
    lastMessage: 'Is the iPhone 13 still available?',
    lastMessageTime: '10:32 AM',
    unreadCount: 2,
    orderInfo: {
      orderId: '#ORD-12458',
      listing: 'iPhone 13 128GB',
      status: 'Active',
    },
    messages: [
      {
        id: 'm1',
        text: 'Hi, is the iPhone 13 still available?',
        timestamp: '10:28 AM',
        isSentByMe: false,
      },
      {
        id: 'm2',
        text: 'Yes, it is available.',
        timestamp: '10:29 AM',
        isSentByMe: true,
        status: 'read',
      },
      {
        id: 'm3',
        text: 'What is the condition of the phone?',
        timestamp: '10:29 AM',
        isSentByMe: false,
      },
      {
        id: 'm4',
        text: 'It is in excellent condition. No scratches, battery health 97%.',
        timestamp: '10:29 AM',
        isSentByMe: true,
        status: 'read',
      },
      {
        id: 'm5',
        text: 'Can you share some pictures?',
        timestamp: '10:30 AM',
        isSentByMe: false,
      },
      {
        id: 'm6',
        text: 'Here are some pictures.',
        timestamp: '10:30 AM',
        isSentByMe: true,
        images: [
          'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=200&h=150&fit=crop',
          'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=200&h=150&fit=crop',
          'https://images.unsplash.com/photo-1603798125914-7b5d27789248?w=200&h=150&fit=crop'
        ],
        status: 'read',
      },
      {
        id: 'm7',
        text: 'Looks good! What\'s the final price?',
        timestamp: '10:32 AM',
        isSentByMe: false,
      },
      {
        id: 'm8',
        text: '₹28,000 is the final price.',
        timestamp: '10:32 AM',
        isSentByMe: true,
        status: 'read',
      },
      {
        id: 'm9',
        text: 'Okay, can we meet tomorrow?',
        timestamp: '10:32 AM',
        isSentByMe: false,
      },
      {
        id: 'm10',
        text: 'Sure, we can meet tomorrow at 5 PM. Let me know the location.',
        timestamp: '10:33 AM',
        isSentByMe: true,
        status: 'read',
      },
    ],
  },
  {
    id: '2',
    user: {
      name: 'Priya Patel',
      avatar: 'https://i.pravatar.cc/150?u=priya',
      isOnline: false,
      id: '#USER-0002469',
      phone: '+91 98765 43211',
      email: 'priya.patel@email.com',
      memberSince: '11 Mar 2024',
    },
    lastMessage: 'Thanks for the quick response!',
    lastMessageTime: '09:15 AM',
    unreadCount: 1,
    messages: [
      {
        id: 'm1',
        text: 'Thanks for the quick response!',
        timestamp: '09:15 AM',
        isSentByMe: false,
      }
    ],
  },
  {
    id: '3',
    user: {
      name: 'Amit Kumar',
      avatar: 'https://i.pravatar.cc/150?u=amit',
      isOnline: true,
      id: '#USER-0002470',
      phone: '+91 98765 43212',
      email: 'amit.kumar@email.com',
      memberSince: '12 Mar 2024',
    },
    lastMessage: 'When can we meet for the product?',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
    messages: [],
  },
  {
    id: '4',
    user: {
      name: 'Sneha Reddy',
      avatar: 'https://i.pravatar.cc/150?u=sneha',
      isOnline: false,
      id: '#USER-0002471',
      phone: '+91 98765 43213',
      email: 'sneha.reddy@email.com',
      memberSince: '13 Mar 2024',
    },
    lastMessage: 'Can you share more photos?',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
    messages: [],
  },
  {
    id: '5',
    user: {
      name: 'Vikram Singh',
      avatar: 'https://i.pravatar.cc/150?u=vikram',
      isOnline: true,
      id: '#USER-0002472',
      phone: '+91 98765 43214',
      email: 'vikram.singh@email.com',
      memberSince: '14 Mar 2024',
    },
    lastMessage: 'Ok, I will check and confirm.',
    lastMessageTime: 'May 12',
    unreadCount: 0,
    messages: [],
  },
  {
    id: '6',
    user: {
      name: 'Neha Verma',
      avatar: 'https://i.pravatar.cc/150?u=neha',
      isOnline: false,
      id: '#USER-0002473',
      phone: '+91 98765 43215',
      email: 'neha.verma@email.com',
      memberSince: '15 Mar 2024',
    },
    lastMessage: 'Please reduce the price a little.',
    lastMessageTime: 'May 12',
    unreadCount: 1,
    messages: [],
  }
];
