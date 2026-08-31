export interface SupportTicket {
  id: string;
  userName: string;
  userEmail: string;
  subject: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'Pending' | 'Resolved' | 'Closed';
  channel: 'Email' | 'Chat' | 'Web' | 'Phone';
  createdOn: string;
  lastReply: string;
}

const USERS = [
  { name: 'Rahul Sharma', email: 'rahul.sharma@email.com' },
  { name: 'Priya Patel', email: 'priya.patel@email.com' },
  { name: 'Amit Kumar', email: 'amit.kumar@email.com' },
  { name: 'Sneha Reddy', email: 'sneha.reddy@email.com' },
  { name: 'Vikram Singh', email: 'vikram.singh@email.com' },
  { name: 'Neha Verma', email: 'neha.verma@email.com' },
  { name: 'Arjun Mehta', email: 'arjun.mehta@email.com' },
  { name: 'Kavya Nair', email: 'kavya.nair@email.com' },
  { name: 'Rohit Das', email: 'rohit.das@email.com' },
  { name: 'Ananya Joshi', email: 'ananya.joshi@email.com' },
  { name: 'Sanjay Gupta', email: 'sanjay.gupta@email.com' },
  { name: 'Deepa Krishnan', email: 'deepa.k@email.com' },
  { name: 'Vijay Chawla', email: 'vijay.chawla@email.com' },
  { name: 'Meera Sen', email: 'meera.sen@email.com' },
  { name: 'Karthik Raja', email: 'karthik.raja@email.com' },
  { name: 'Pooja Hegde', email: 'pooja.hegde@email.com' }
];

const CATEGORIES = ['Listings', 'Payments', 'Refunds', 'Technical', 'Account', 'Payouts', 'Orders'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'] as const;
const STATUSES = ['Open', 'Pending', 'Resolved', 'Closed'] as const;
const CHANNELS = ['Email', 'Chat', 'Web', 'Phone'] as const;

const SUBJECTS_BY_CATEGORY: Record<string, string[]> = {
  Listings: [
    'Image upload limit exceeded error',
    'Listing rejected without clear reason',
    'Cannot edit active product listing details',
    'Listing description formatting is broken',
    'Item details not showing under Mobiles category'
  ],
  Payments: [
    'Payment completed but status still Escrow Pending',
    'Bank account verification pending for 3 days',
    'Double debited for subscription boost package',
    'Invoice not received for order #ORD-2831',
    'Failed payment message on checkout screen'
  ],
  Refunds: [
    'Refund not processed for canceled order',
    'Canceled booking refund timeline inquiry',
    'Refund transaction reference missing',
    'Wrong refund amount credited to bank card',
    'Dispute refund request for order #ORD-1229'
  ],
  Technical: [
    'Login page loops and doesn\'t redirect',
    'App crashes frequently on camera capture',
    'Push notifications not delivering on Android',
    'Profile image upload throws server error 500',
    'Search bar filter results are unresponsive'
  ],
  Account: [
    'Seller account suspension appeal',
    'Reset password verification email not received',
    'Update profile mobile number request',
    'Verify business tax registration document',
    'Close account and delete user profile data'
  ],
  Payouts: [
    'Seller payout delayed for completed orders',
    'Payout bank details update failing',
    'Commission fee structure question',
    'Missing payout settlement statement for May',
    'Minimum payout threshold limits check'
  ],
  Orders: [
    'Item received is not as described in listing',
    'Courier partner tracking status update request',
    'Cancel order request for #ORD-12932',
    'Delivery address incorrect after order confirmation',
    'Buyer claims package not received but marked delivered'
  ]
};

export function seedTickets(): SupportTicket[] {
  const tickets: SupportTicket[] = [];
  
  // Starting ticket ID #TKT-0001254 down to #TKT-0001105 (150 tickets)
  for (let i = 0; i < 150; i++) {
    const idNum = 1254 - i;
    const ticketId = `#TKT-000${idNum}`;
    
    // Deterministic random selection based on index
    const user = USERS[i % USERS.length];
    const category = CATEGORIES[i % CATEGORIES.length];
    const subjects = SUBJECTS_BY_CATEGORY[category];
    const subject = subjects[i % subjects.length];
    
    // Distribute fields deterministically
    const priority = PRIORITIES[i % PRIORITIES.length];
    const status = STATUSES[i % STATUSES.length];
    const channel = CHANNELS[i % CHANNELS.length];
    
    // Created dates from May 1 to May 12, 2024
    const day = 12 - Math.floor(i / 13);
    const hour = (10 + (i * 7)) % 12 || 12;
    const min = (15 + (i * 9)) % 60;
    const ampm = i % 2 === 0 ? 'AM' : 'PM';
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    const minStr = min < 10 ? `0${min}` : `${min}`;
    const createdOn = `${dayStr} May 2024, ${hour}:${minStr} ${ampm}`;
    
    // Last reply is usually a bit after created date
    const replyMin = (min + 15) % 60;
    const replyHour = replyMin < min ? (hour + 1) % 12 || 12 : hour;
    const replyMinStr = replyMin < 10 ? `0${replyMin}` : `${replyMin}`;
    const lastReply = `${dayStr} May 2024, ${replyHour}:${replyMinStr} ${ampm}`;
    
    tickets.push({
      id: ticketId,
      userName: user.name,
      userEmail: user.email,
      subject,
      category,
      priority,
      status,
      channel,
      createdOn,
      lastReply
    });
  }
  
  return tickets;
}
