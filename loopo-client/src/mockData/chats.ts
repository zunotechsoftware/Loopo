export interface ChatMessage {
  id: string;
  sender: 'user' | 'other';
  text: string;
  time: string;
  isOffer?: boolean;
  offerAmount?: string;
  offerStatus?: 'Pending' | 'Accepted' | 'Declined';
}

export interface Conversation {
  id: string;
  type: 'buying' | 'selling'; // OLX-style separation for Buying & Selling
  otherPartyName: string;
  otherPartyAvatar: string;
  otherPartyRole: 'Seller' | 'Buyer';
  itemTitle: string;
  itemPrice: string;
  itemImage: string;
  itemLocation: string;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
  messages: ChatMessage[];
}

export const MOCK_CONVERSATIONS: Conversation[] = [
  // --- BUYING CONVERSATIONS (Current User is Buyer inquiring with Sellers) ---
  {
    id: 'conv-buy-1',
    type: 'buying',
    otherPartyName: 'Arjun Patel',
    otherPartyAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    otherPartyRole: 'Seller',
    itemTitle: 'iPhone 13 128GB (Starlight)',
    itemPrice: '₹32,000',
    itemImage: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?q=80&w=800&auto=format&fit=crop',
    itemLocation: 'Koramangala, Bangalore',
    lastMessage: 'Hi, can you share the battery health percentage?',
    lastTime: '10:28 PM',
    unreadCount: 2,
    messages: [
      { id: 'm1', sender: 'user', text: 'Hi, is this iPhone 13 still available?', time: '10:25 PM' },
      { id: 'm2', sender: 'other', text: 'Yes, it is available! Original box and bill included.', time: '10:26 PM' },
      { id: 'm3', sender: 'user', text: 'Hi, can you share the battery health percentage?', time: '10:28 PM' },
    ],
  },
  {
    id: 'conv-buy-2',
    type: 'buying',
    otherPartyName: 'Rohan Sharma',
    otherPartyAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    otherPartyRole: 'Seller',
    itemTitle: 'Maruti Swift VXI 2020 Model',
    itemPrice: '₹4,85,000',
    itemImage: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=800&auto=format&fit=crop',
    itemLocation: 'HSR Layout, Bangalore',
    lastMessage: 'Offered ₹4,65,000. Seller accepted!',
    lastTime: 'Yesterday',
    unreadCount: 0,
    messages: [
      { id: 'm1', sender: 'user', text: 'Is the price negotiable?', time: 'Yesterday' },
      { id: 'm2', sender: 'other', text: 'Sure, you can inspect it tomorrow evening.', time: 'Yesterday' },
      {
        id: 'm3',
        sender: 'user',
        text: 'I would like to make an offer of ₹4,65,000',
        time: 'Yesterday',
        isOffer: true,
        offerAmount: '₹4,65,000',
        offerStatus: 'Accepted',
      },
    ],
  },
  {
    id: 'conv-buy-3',
    type: 'buying',
    otherPartyName: 'Ananya Gupta',
    otherPartyAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    otherPartyRole: 'Seller',
    itemTitle: 'Sony WH-1000XM4 Noise Cancelling',
    itemPrice: '₹14,500',
    itemImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop',
    itemLocation: 'Indiranagar, Bangalore',
    lastMessage: 'Does it come with warranty card?',
    lastTime: '02 Aug',
    unreadCount: 0,
    messages: [
      { id: 'm1', sender: 'user', text: 'Does it come with warranty card?', time: '02 Aug' },
    ],
  },

  // --- SELLING CONVERSATIONS (Current User is Seller receiving inquiries from Buyers) ---
  {
    id: 'conv-sell-1',
    type: 'selling',
    otherPartyName: 'Vikram Singh',
    otherPartyAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
    otherPartyRole: 'Buyer',
    itemTitle: 'Royal Enfield Classic 350 (2022)',
    itemPrice: '₹1,65,000',
    itemImage: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=800&auto=format&fit=crop',
    itemLocation: 'Whitefield, Bangalore',
    lastMessage: 'Can I come for a test drive today around 5 PM?',
    lastTime: '11:15 AM',
    unreadCount: 1,
    messages: [
      { id: 'm1', sender: 'other', text: 'Hi! Is your Royal Enfield still available?', time: '11:10 AM' },
      { id: 'm2', sender: 'user', text: 'Yes! Single owner, well maintained with service record.', time: '11:12 AM' },
      { id: 'm3', sender: 'other', text: 'Can I come for a test drive today around 5 PM?', time: '11:15 AM' },
    ],
  },
  {
    id: 'conv-sell-2',
    type: 'selling',
    otherPartyName: 'Sneha Rao',
    otherPartyAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
    otherPartyRole: 'Buyer',
    itemTitle: 'MacBook Pro M1 16GB / 512GB',
    itemPrice: '₹78,000',
    itemImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop',
    itemLocation: 'MG Road, Bangalore',
    lastMessage: 'Sent offer of ₹74,000',
    lastTime: '10:00 AM',
    unreadCount: 0,
    messages: [
      { id: 'm1', sender: 'other', text: 'Hello, is original charger included?', time: '09:45 AM' },
      { id: 'm2', sender: 'user', text: 'Yes, original 67W USB-C charger and cable included.', time: '09:50 AM' },
      {
        id: 'm3',
        sender: 'other',
        text: 'Offer sent: ₹74,000',
        time: '10:00 AM',
        isOffer: true,
        offerAmount: '₹74,000',
        offerStatus: 'Pending',
      },
    ],
  },
  {
    id: 'conv-sell-3',
    type: 'selling',
    otherPartyName: 'Rajesh Kumar',
    otherPartyAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=200&auto=format&fit=crop',
    otherPartyRole: 'Buyer',
    itemTitle: 'Modern L-Shaped Fabric Sofa',
    itemPrice: '₹18,000',
    itemImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop',
    itemLocation: 'Bellandur, Bangalore',
    lastMessage: 'Is self-pickup required?',
    lastTime: '01 Aug',
    unreadCount: 0,
    messages: [
      { id: 'm1', sender: 'other', text: 'Is self-pickup required?', time: '01 Aug' },
      { id: 'm2', sender: 'user', text: 'Yes, self-pickup from 2nd floor with elevator.', time: '01 Aug' },
    ],
  },
];
