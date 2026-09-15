import { Smartphone, Car, Bike, Tv, Sofa, Shirt, BookOpen, Home, LucideIcon } from 'lucide-react';

/**
 * Real categories from the backend don't carry a matching lucide icon-component
 * name (just a free-text `icon` field, if set at all), so icons are picked by
 * matching on the category's real display name, with a generic fallback for
 * any name this doesn't recognize.
 */
export function getCategoryIcon(name: string): LucideIcon {
  const key = (name || '').toLowerCase();
  if (key.includes('mobile') || key.includes('phone')) return Smartphone;
  if (key.includes('car') || key.includes('vehicle')) return Car;
  if (key.includes('bike')) return Bike;
  if (key.includes('electronic') || key.includes('tv')) return Tv;
  if (key.includes('furniture') || key.includes('home')) return Sofa;
  if (key.includes('fashion') || key.includes('cloth')) return Shirt;
  if (key.includes('book')) return BookOpen;
  return Home;
}
