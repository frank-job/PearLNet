// Shared types for the PearLNet marketplace and business directory.

export type ProductCondition = 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR';

export type ProductStatus = 'AVAILABLE' | 'SOLD' | 'RESERVED' | 'REMOVED';

export type BusinessVerification = 'UNVERIFIED' | 'PENDING' | 'VERIFIED';

export interface MarketplaceSeller {
  id: string;
  username: string | null;
  name: string | null;
  image: string | null;
  verified: boolean;
}

export interface MarketplaceCategory {
  id: string;
  name: string;
  slug?: string;
  imageUrl?: string | null;
  parentId?: string | null;
  children?: MarketplaceCategory[];
}

export interface MarketplaceProduct {
  id: string;
  title: string;
  description: string | null;
  categoryId?: string | null;
  price: number;
  currency: string;
  condition: ProductCondition;
  status: ProductStatus;
  location: string | null;
  imageUrl: string | null;
  images: string[] | null;
  businessId?: string | null;
  isFeatured: boolean;
  boostedUntil: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  seller: MarketplaceSeller;
  category: { id: string; name: string } | null;
  business?: Pick<Business, 'id' | 'name' | 'slug' | 'verified' | 'imageUrl'> | null;
  avgRating?: number;
  reviewCount?: number;
  favoriteCount?: number;
}

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string | null;
  createdAt: Date | string;
  user?: {
    id: string;
    username: string | null;
    name: string | null;
    imageUrl?: string | null;
  } | null;
}

export interface BusinessOwner {
  id: string;
  username: string | null;
  name: string | null;
  image: string | null;
  verified: boolean;
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  imageUrl: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  verified: boolean;
  verifiedAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  owner: BusinessOwner;
  products: { count: number };
  reviews: { count: number; avgRating: number };
}

export interface BusinessReview {
  id: string;
  businessId: string;
  userId: string;
  rating: number;
  comment: string | null;
  createdAt: Date | string;
  user?: {
    id: string;
    username: string | null;
    name: string | null;
    image: string | null;
    verified: boolean;
  } | null;
}

export interface Paginated<T> {
  data?: T[];
  total: number;
  page: number;
  limit: number;
}
