// Shared types for the PearLNet marketplace and business directory.

export type ProductCondition = 'NEW' | 'USED_LIKE_NEW' | 'USED_GOOD' | 'USED_FAIR';

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

// Shared types for the PearLNet post feed.
// These mirror the payload returned by GET /api/posts and
// GET /api/saved-posts so the feed never drifts from the API.

export interface PostAuthor {
  id: string;
  username: string | null;
  name: string | null;
  email: string | null;
  image: string | null;
  verified: boolean;
  role: string | null;
}

export interface PostWithDetails {
  id: string;
  caption: string | null;
  imageUrl: string | null;
  images: string[] | null;
  videoUrl: string | null;
  mediaType: string | null;
  viewCount: number;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  author: PostAuthor;
  _count: {
    likes: number;
    comments: number;
  };
}

export interface PostMediaItem {
  id: string;
  type: 'IMAGE' | 'VIDEO';
  url: string;
  alt?: string | null;
}
