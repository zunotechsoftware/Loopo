/**
 * Centralized Route Definitions for Loopo-client
 * Standardized path names and dynamic route helpers
 */

export const ROUTES = {
  // 1. PUBLIC ROUTES
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_OTP: '/verify-otp',
  ONBOARDING: '/onboarding',
  CATEGORIES: '/categories',
  CATEGORY_DETAIL: (categorySlug: string) => `/categories/${categorySlug}`,
  SEARCH: '/search',
  SELLER_PROFILE: (userId: string) => `/seller/${userId}`,
  HELP: '/help',
  HELP_ARTICLE: (articleSlug: string) => `/help/${articleSlug}`,
  SAFETY: '/safety',

  // 2. LISTING ROUTES
  LISTING_DETAIL: (listingId: string) => `/listing/${listingId}`,
  LISTING_EDIT: (listingId: string) => `/listing/${listingId}/edit`,
  LISTING_PREVIEW: (listingId: string) => `/listing/${listingId}/preview`,

  // 3. SELL / CREATE LISTING (Protected)
  SELL: '/sell',
  SELL_CATEGORY: '/sell/category',
  SELL_DETAILS: '/sell/details',
  SELL_PHOTOS: '/sell/photos',
  SELL_LOCATION: '/sell/location',
  SELL_PREVIEW: '/sell/preview',
  SELL_SUCCESS: '/sell/success',

  // 4. MY LISTINGS (Protected)
  MY_LISTINGS: '/my-listings',
  MY_LISTINGS_ACTIVE: '/my-listings/active',
  MY_LISTINGS_PENDING: '/my-listings/pending',
  MY_LISTINGS_DRAFTS: '/my-listings/drafts',
  MY_LISTINGS_SOLD: '/my-listings/sold',
  MY_LISTINGS_REJECTED: '/my-listings/rejected',

  // 5. FAVOURITES & SAVED SEARCHES (Protected)
  FAVOURITES: '/favourites',
  SAVED_SEARCHES: '/saved-searches',

  // 6. CHAT (Protected)
  CHATS: '/chats',
  CHAT_DETAIL: (chatId: string) => `/chats/${chatId}`,

  // 7. OFFERS (Protected)
  OFFERS: '/offers',
  OFFER_DETAIL: (offerId: string) => `/offers/${offerId}`,

  // 9. SELLER VERIFICATION (Protected)
  VERIFICATION: '/verification',
  VERIFICATION_DOCUMENTS: '/verification/documents',
  VERIFICATION_REVIEW: '/verification/review',

  // 10. NOTIFICATIONS (Protected)
  NOTIFICATIONS: '/notifications',

  // 11. USER PROFILE & SETTINGS (Protected)
  PROFILE: '/profile',
  PROFILE_EDIT: '/profile/edit',
  SETTINGS: '/settings',
  SETTINGS_SECURITY: '/settings/security',
  BLOCKED_USERS: '/blocked-users',

  // 12. LOCATION (Protected)
  LOCATION: '/location',

  // 13. REPORT / SAFETY (Protected / Public)
  REPORT: '/report',
  CONTACT_SUPPORT: '/contact-support',

  // 15. ADMIN ROUTES (Admin Protected)
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_USER_DETAIL: (userId: string) => `/admin/users/${userId}`,
  ADMIN_LISTINGS: '/admin/listings',
  ADMIN_LISTING_DETAIL: (listingId: string) => `/admin/listings/${listingId}`,
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_REPORT_DETAIL: (reportId: string) => `/admin/reports/${reportId}`,
  ADMIN_VERIFICATIONS: '/admin/verifications',
  ADMIN_VERIFICATION_DETAIL: (verificationId: string) => `/admin/verifications/${verificationId}`,
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_CATEGORY_DETAIL: (categoryId: string) => `/admin/categories/${categoryId}`,
  ADMIN_SETTINGS: '/admin/settings',

  // 22. ERROR ROUTES
  NOT_FOUND: '/404',
  FORBIDDEN: '/403',
  SERVER_ERROR: '/500',
} as const;

/** List of public route path prefixes for route matching */
export const PUBLIC_ROUTES: string[] = [
  '/',
  '/login',
  '/register',
  '/verify-otp',
  '/onboarding',
  '/categories',
  '/search',
  '/listing',
  '/seller',
  '/help',
  '/safety',
  '/404',
  '/403',
  '/500',
];

/** List of admin route path prefixes */
export const ADMIN_ROUTES: string[] = ['/admin'];
