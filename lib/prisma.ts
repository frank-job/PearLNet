import { PrismaClient } from '@prisma/client';

declare global {
  var __prisma: PrismaClient | undefined;
}

const prismaClientSingleton = (): PrismaClient => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['error', 'warn']
      : ['error'],
    errorFormat: 'colorless',
  });
};

export const prisma = global.__prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

export type { PrismaClient } from '@prisma/client';
export type {
  User as PrismaUser,
  Profile as PrismaProfile,
  Post as PrismaPost,
  Comment as PrismaComment,
  Like as PrismaLike,
  Follow as PrismaFollow,
  SavedPost as PrismaSavedPost,
  Story as PrismaStory,
  Notification as PrismaNotification,
  Message as PrismaMessage,
  Conversation as PrismaConversation,
  Business as PrismaBusiness,
  BusinessReview as PrismaBusinessReview,
  Product as PrismaProduct,
  Category as PrismaCategory,
  ProductReview as PrismaProductReview,
  ProductFavorite as PrismaProductFavorite,
  ProductBoost as PrismaProductBoost,
  ConversationParticipant as PrismaConversationParticipant,
  Admin as PrismaAdmin,
  Report as PrismaReport,
  Event as PrismaEvent,
  EventRsvp as PrismaEventRsvp,
} from '@prisma/client';
