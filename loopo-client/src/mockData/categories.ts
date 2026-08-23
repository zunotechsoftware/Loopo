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

export const MOCK_CATEGORIES: CategoryItem[] = [
  { id: 'cat-1', name: 'Mobiles', count: '12,340+ ads', iconName: 'Smartphone', color: 'bg-blue-50 text-blue-600', subcategories: ['Smartphones', 'Tablets', 'Accessories', 'Wearables'], itemCount: '12,340', icon: 'Smartphone' },
  { id: 'cat-2', name: 'Cars', count: '8,765+ ads', iconName: 'Car', color: 'bg-red-50 text-red-600', subcategories: ['Sedans', 'SUVs', 'Hatchbacks', 'Luxury'], itemCount: '8,765', icon: 'Car' },
  { id: 'cat-3', name: 'Bikes', count: '6,543+ ads', iconName: 'Bike', color: 'bg-emerald-50 text-emerald-600', subcategories: ['Motorcycles', 'Scooters', 'Bicycles', 'EVs'], itemCount: '6,543', icon: 'Bike' },
  { id: 'cat-4', name: 'Electronics', count: '9,876+ ads', iconName: 'Tv', color: 'bg-purple-50 text-purple-600', subcategories: ['Laptops', 'TVs & Audio', 'Cameras', 'Gaming'], itemCount: '9,876', icon: 'Tv' },
  { id: 'cat-5', name: 'Furniture', count: '5,432+ ads', iconName: 'Sofa', color: 'bg-amber-50 text-amber-600', subcategories: ['Sofas & Beds', 'Tables & Chairs', 'Decor', 'Storage'], itemCount: '5,432', icon: 'Sofa' },
  { id: 'cat-6', name: 'Fashion', count: '7,890+ ads', iconName: 'Shirt', color: 'bg-pink-50 text-pink-600', subcategories: ['Men', 'Women', 'Footwear', 'Watches'], itemCount: '7,890', icon: 'Shirt' },
  { id: 'cat-7', name: 'Books', count: '4,210+ ads', iconName: 'BookOpen', color: 'bg-indigo-50 text-indigo-600', subcategories: ['Fiction', 'Textbooks', 'Comics', 'Non-Fiction'], itemCount: '4,210', icon: 'BookOpen' },
  { id: 'cat-8', name: 'Home & Living', count: '6,120+ ads', iconName: 'Home', color: 'bg-teal-50 text-teal-600', subcategories: ['Appliances', 'Kitchen', 'Garden', 'Lighting'], itemCount: '6,120', icon: 'Home' },
];
