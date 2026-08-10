export interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  category: string;
  subCategory?: string;
  condition: 'Brand New' | 'Like New' | 'Good' | 'Fair';
  location: string;
  distance: string;
  postedDate: string;
  viewsCount: number;
  likesCount: number;
  images: string[];
  description: string;
  seller: {
    id: string;
    name: string;
    avatar: string;
    memberSince: string;
    rating: number;
    reviewCount: number;
    isVerified: boolean;
  };
  specs: Record<string, string>;
  isFeatured?: boolean;
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    title: 'iPhone 13 128GB',
    price: 32000,
    originalPrice: 59900,
    category: 'Mobiles',
    subCategory: 'Smartphones',
    condition: 'Like New',
    location: 'Bangalore, Karnataka',
    distance: '1.2 km away',
    postedDate: 'Posted 2 days ago',
    viewsCount: 182,
    likesCount: 24,
    images: [
      'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop',
    ],
    description:
      'iPhone 13 in excellent condition. No scratches, all accessories original. Battery health 90%. Reason for selling: Upgraded to new model.',
    seller: {
      id: 's1',
      name: 'Arjun Patel',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      memberSince: '2022',
      rating: 4.8,
      reviewCount: 32,
      isVerified: true,
    },
    specs: {
      Brand: 'Apple',
      Model: 'iPhone 13',
      Storage: '128GB',
      Condition: 'Like New',
      Colour: 'Midnight',
      'Posted In': 'Mobiles',
    },
    isFeatured: true,
  },
  {
    id: 'p2',
    title: 'Maruti Swift VXI 2020',
    price: 485000,
    originalPrice: 650000,
    category: 'Cars',
    condition: 'Good',
    location: 'Indiranagar, Bangalore',
    distance: '3.5 km away',
    postedDate: 'Posted 3 days ago',
    viewsCount: 420,
    likesCount: 56,
    images: [
      'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800&auto=format&fit=crop',
    ],
    description:
      'Single owner Maruti Swift VXI Petrol 2020 model. Driven 32,000 km. Regularly serviced at authorized service station. Complete insurance till Dec 2026.',
    seller: {
      id: 's2',
      name: 'Rohan Sharma',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
      memberSince: '2021',
      rating: 4.9,
      reviewCount: 45,
      isVerified: true,
    },
    specs: {
      Make: 'Maruti Suzuki',
      Model: 'Swift VXI',
      Year: '2020',
      KM: '32,000 km',
      Fuel: 'Petrol',
      Transmission: 'Manual',
    },
  },
  {
    id: 'p3',
    title: 'Royal Enfield Classic 350',
    price: 135000,
    originalPrice: 195000,
    category: 'Bikes',
    condition: 'Like New',
    location: 'HSR Layout, Bangalore',
    distance: '2.3 km away',
    postedDate: 'Posted 1 day ago',
    viewsCount: 310,
    likesCount: 42,
    images: [
      'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=800&auto=format&fit=crop',
    ],
    description:
      'Stealth Black Royal Enfield Classic 350 Dual Channel ABS. Driven only 12,500 km. Brand new rear tire and recent oil service done.',
    seller: {
      id: 's3',
      name: 'Vikram Sethi',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
      memberSince: '2023',
      rating: 4.7,
      reviewCount: 18,
      isVerified: true,
    },
    specs: {
      Brand: 'Royal Enfield',
      Model: 'Classic 350',
      Year: '2022',
      KM: '12,500 km',
    },
  },
  {
    id: 'p4',
    title: 'L Shape Sofa Set',
    price: 18000,
    originalPrice: 35000,
    category: 'Furniture',
    condition: 'Good',
    location: 'Koramangala, Bangalore',
    distance: '1.8 km away',
    postedDate: 'Posted 4 days ago',
    viewsCount: 215,
    likesCount: 38,
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop',
    ],
    description:
      'Comfortable 6 seater L-shape fabric sofa set with 4 cushions. Grey suede finish. Dry cleaned last week.',
    seller: {
      id: 's4',
      name: 'Priya Nair',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
      memberSince: '2020',
      rating: 5.0,
      reviewCount: 60,
      isVerified: true,
    },
    specs: {
      Material: 'Fabric / Suede',
      Seating: '6 Seater',
      Color: 'Grey',
    },
  },
  {
    id: 'p5',
    title: 'Dell Inspiron 15',
    price: 28500,
    originalPrice: 55000,
    category: 'Electronics',
    condition: 'Like New',
    location: 'Electronic City, Bangalore',
    distance: '3.8 km away',
    postedDate: 'Posted 2 days ago',
    viewsCount: 198,
    likesCount: 29,
    images: [
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=800&auto=format&fit=crop',
    ],
    description:
      'Dell Inspiron 15 5000 Core i5 11th Gen, 16GB RAM, 512GB NVMe SSD, FHD IPS Anti-glare display. Includes original Dell charger & box.',
    seller: {
      id: 's5',
      name: 'Suresh Kumar',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop',
      memberSince: '2021',
      rating: 4.6,
      reviewCount: 22,
      isVerified: true,
    },
    specs: {
      Processor: 'Intel Core i5 11th Gen',
      RAM: '16GB DDR4',
      Storage: '512GB SSD',
    },
  },
  {
    id: 'p6',
    title: 'Fossil Men Watch',
    price: 2499,
    originalPrice: 8995,
    category: 'Fashion',
    condition: 'Brand New',
    location: 'Marathahalli, Bangalore',
    distance: '4.5 km away',
    postedDate: 'Posted 5 days ago',
    viewsCount: 140,
    likesCount: 19,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop',
    ],
    description:
      'Original Fossil Chronograph Stainless Steel Analog Watch for Men. Brand new in tin box with international warranty card.',
    seller: {
      id: 's6',
      name: 'Neha Kapoor',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop',
      memberSince: '2023',
      rating: 4.9,
      reviewCount: 15,
      isVerified: true,
    },
    specs: {
      Brand: 'Fossil',
      Type: 'Chronograph',
      Strap: 'Stainless Steel',
    },
  },
];
