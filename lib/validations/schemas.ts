import { z } from 'zod';
import { ProductStatus, ProductCondition, ReportStatus, ReportTargetType, ConversationType, MediaType } from '@prisma/client';

// ============================================================
// Auth Schemas
// ============================================================

export const signUpSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or fewer'),
  email: z.string().email('Please enter a valid email address').max(254),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  terms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the Terms of Service',
  }),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required').max(128),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  token: z.string().min(1, 'Reset token is required'),
});

// ============================================================
// Profile Schemas
// ============================================================

export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).optional(),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be 50 characters or fewer')
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional(),
  bio: z.string().max(500, 'Bio must be 500 characters or fewer').optional(),
  location: z.string().max(255, 'Location is too long').optional(),
  website: z.string().url('Please enter a valid URL').max(255).optional().or(z.literal('').optional()),
  gender: z.enum(['male', 'female', 'other', '']).optional(),
  birthYear: z
    .number({ invalid_type_error: 'Please enter a valid year' })
    .int()
    .min(1900, 'Year must be 1900 or later')
    .max(new Date().getFullYear(), 'Year cannot be in the future')
    .optional()
    .nullable(),
});

// ============================================================
// Post Schemas
// ============================================================

export const createPostSchema = z.object({
  caption: z
    .string()
    .max(2000, 'Caption must be 2000 characters or fewer')
    .optional(),
  mediaType: z.nativeEnum(MediaType).default(MediaType.IMAGE),
  // Optional for the JSON creation path. The multipart branch of
  // POST /api/posts uploads files itself and does not pass these through.
  imageUrl: z.string().url().optional().nullable(),
  images: z.array(z.string().url()).max(10).optional(),
  videoUrl: z.string().url().optional().nullable(),
});

export const postIdSchema = z.object({
  postId: z.string().uuid('Invalid post ID'),
});

export const updatePostSchema = z.object({
  caption: z.string().max(2000, 'Caption must be 2000 characters or fewer'),
});

// ============================================================
// Comment Schemas
// ============================================================

export const createCommentSchema = z.object({
  postId: z.string().uuid('Invalid post ID'),
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(1000, 'Comment must be 1000 characters or fewer'),
  parentId: z.string().uuid('Invalid parent comment ID').optional().nullable(),
});

export const commentIdSchema = z.object({
  commentId: z.string().uuid('Invalid comment ID'),
});

// ============================================================
// Like Schemas
// ============================================================

export const toggleLikeSchema = z.object({
  postId: z.string().uuid('Invalid post ID'),
});

// ============================================================
// Follow Schemas
// ============================================================

export const followSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
});

// ============================================================
// Story Schemas
// ============================================================

export const createStorySchema = z.object({
  caption: z.string().max(500, 'Caption must be 500 characters or fewer').optional(),
  expiresInHours: z
    .number({ invalid_type_error: 'Please enter a valid number' })
    .int()
    .min(1, 'Story must last at least 1 hour')
    .max(168, 'Story must expire within 168 hours'),
});

// ============================================================
// Notification Schemas
// ============================================================

export const notificationIdSchema = z.object({
  notificationId: z.string().uuid('Invalid notification ID'),
});

// ============================================================
// Marketplace Product Schemas
// ============================================================

export const createProductSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(255, 'Title must be 255 characters or fewer'),
  description: z
    .string()
    .max(5000, 'Description must be 5000 characters or fewer')
    .optional()
    .nullable(),
  categoryId: z.string().uuid('Invalid category ID').optional().nullable(),
  price: z
    .number({ invalid_type_error: 'Price must be a number' })
    .positive('Price must be greater than 0')
    .max(999999, 'Price is too large'),
  currency: z.string().length(3, 'Currency must be a 3-letter code').default('USD'),
  condition: z.nativeEnum(ProductCondition).default(ProductCondition.NEW),
  location: z.string().max(255, 'Location is too long').optional().nullable(),
  imageUrls: z.array(z.string().url('Invalid image URL')).max(10, 'Maximum 10 images allowed').optional(),
  videoUrl: z.string().url('Invalid video URL').optional().nullable(),
});

export const updateProductSchema = createProductSchema.partial().extend({
  status: z.nativeEnum(ProductStatus).optional(),
});

export const productIdSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
});

export const productSearchSchema = z.object({
  query: z.string().max(100, 'Search query is too long').optional(),
  category: z.string().uuid('Invalid category ID').optional(),
  minPrice: z
    .number({ invalid_type_error: 'Min price must be a number' })
    .positive('Min price must be positive')
    .optional(),
  maxPrice: z
    .number({ invalid_type_error: 'Max price must be a number' })
    .positive('Max price must be positive')
    .optional(),
  condition: z.nativeEnum(ProductCondition).optional(),
  status: z.nativeEnum(ProductStatus).default(ProductStatus.AVAILABLE),
  sortBy: z.enum(['createdAt', 'price', 'viewCount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z
    .number({ invalid_type_error: 'Page must be a number' })
    .int()
    .min(1)
    .default(1),
  limit: z
    .number({ invalid_type_error: 'Limit must be a number' })
    .int()
    .min(1)
    .max(100)
    .default(20),
});

export const productReviewSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  rating: z
    .number({ invalid_type_error: 'Rating must be a number' })
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
  comment: z
    .string()
    .max(1000, 'Review must be 1000 characters or fewer')
    .optional()
    .nullable(),
});

export const boostProductSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  amount: z
    .number({ invalid_type_error: 'Boost amount must be a number' })
    .positive('Boost amount must be greater than 0')
    .max(10000, 'Boost amount is too large'),
  currency: z.string().length(3).default('USD'),
  boostLevel: z.enum(['standard', 'premium', 'featured']).default('standard'),
  durationHours: z
    .number({ invalid_type_error: 'Duration must be a number' })
    .int()
    .min(1, 'Boost must last at least 1 hour')
    .max(720, 'Boost cannot exceed 30 days'),
});

// ============================================================
// Business Directory Schemas
// ============================================================

export const createBusinessSchema = z.object({
  name: z
    .string()
    .min(2, 'Business name must be at least 2 characters')
    .max(255, 'Business name must be 255 characters or fewer'),
  description: z
    .string()
    .max(2000, 'Description must be 2000 characters or fewer')
    .optional()
    .nullable(),
  email: z.string().email('Please enter a valid email address').optional().nullable(),
  phone: z.string().max(32).optional().nullable(),
  website: z.string().url('Please enter a valid URL').optional().nullable().or(z.literal('').optional()),
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
});

export const businessIdSchema = z.object({
  businessId: z.string().uuid('Invalid business ID'),
});

export const businessReviewSchema = z.object({
  businessId: z.string().uuid('Invalid business ID'),
  rating: z
    .number({ invalid_type_error: 'Rating must be a number' })
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
  comment: z
    .string()
    .max(1000, 'Review must be 1000 characters or fewer')
    .optional()
    .nullable(),
});

// ============================================================
// Messaging / Chat Schemas
// ============================================================

export const createConversationSchema = z.object({
  participantIds: z.array(z.string().uuid('Invalid user ID')).min(1, 'At least one participant required'),
  type: z.nativeEnum(ConversationType).default(ConversationType.DIRECT),
  name: z.string().max(255).optional(),
});

export const sendMessageSchema = z.object({
  conversationId: z.string().uuid('Invalid conversation ID'),
  content: z.string().max(5000, 'Message is too long').optional(),
  imageUrl: z.string().url().optional().nullable(),
  videoUrl: z.string().url().optional().nullable(),
});

// ============================================================
// Report Schemas
// ============================================================

export const createReportSchema = z.object({
  targetType: z.nativeEnum(ReportTargetType),
  targetId: z.string().uuid('Invalid target ID'),
  reason: z
    .string()
    .min(3, 'Please provide a reason for the report')
    .max(500, 'Reason is too long'),
  description: z
    .string()
    .max(2000, 'Description is too long')
    .optional()
    .nullable(),
});

export const reportIdSchema = z.object({
  reportId: z.string().uuid('Invalid report ID'),
});

export const resolveReportSchema = z.object({
  status: z.nativeEnum(ReportStatus),
  resolutionNote: z
    .string()
    .max(2000, 'Resolution note is too long')
    .optional()
    .nullable(),
});

// ============================================================
// Admin Schemas
// ============================================================

export const updateUserRoleSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  role: z.enum(['USER', 'VERIFIED', 'MODERATOR', 'ADMIN']).optional(),
  verified: z.boolean().optional(),
});

export const userIdSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
});

// ============================================================
// Pagination
// ============================================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type FollowInput = z.infer<typeof followSchema>;
export type CreateStoryInput = z.infer<typeof createStorySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductSearchInput = z.infer<typeof productSearchSchema>;
export type ProductReviewInput = z.infer<typeof productReviewSchema>;
export type BoostProductInput = z.infer<typeof boostProductSchema>;
export type CreateBusinessInput = z.infer<typeof createBusinessSchema>;
export type BusinessReviewInput = z.infer<typeof businessReviewSchema>;
export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type CreateReportInput = z.infer<typeof createReportSchema>;
export type ResolveReportInput = z.infer<typeof resolveReportSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
