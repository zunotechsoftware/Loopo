---
last_verified: 2026-09-13
source: loopo-backend/prisma/schema.prisma (112 models)
---

# Database — Model Inventory (verified)

Grouped by domain, as actually declared in `schema.prisma`. Field-level detail was not
transcribed here (read the schema directly for that) — this is the index so future tasks
know which models exist before grepping the whole file.

**Identity/Auth:** User, Role, UserRole, RefreshToken, EmailVerificationToken,
PasswordResetToken, PhoneOtp, Session, Profile, Address, Permission, RolePermission,
NotificationSetting

**KYC:** KycDocument (+ KycDocumentType, KycStatus enums), AuditLog, MediaFile

**Catalog:** Category, CategoryAttributeGroup, CategoryAttribute, AttributeOption,
CategoryAttributeValue, CategoryTranslation, Brand

**Listings ("Product"):** Product (+ ProductCondition, ProductStatus), ProductAttribute,
ProductImage, ProductVideo, ProductLocation, ProductStatusHistory, FeaturedProduct,
BoostedProduct, ProductView, ProductStatistics

**Favorites/Search:** Favorite, Wishlist, WishlistItem, RecentSearch, RecentlyViewed,
PopularSearch, SearchLog, SearchStatistics

**Messaging:** Conversation, ConversationParticipant, ConversationSetting, Message,
MessageAttachment, MessageRead, MessageReaction, BlockedUser, UserPresence

**Payments/Monetization:** PaymentProvider, SubscriptionPlan, SubscriptionFeature,
Subscription, UserSubscription, FeaturedPackage, BoostPackage, UserBoost, Coupon,
CouponRedemption, Payment, PaymentTransaction, Refund, PaymentWebhook, PaymentAuditLog
(dual-provider: Razorpay + Stripe, see [project-overview.md](project-overview.md))

**Moderation/Trust:** ModerationAction, BlockedContent, WarningHistory, UserStrike,
Review, ReviewRating, ReviewReaction, SellerStatistics, BuyerStatistics,
ReputationScore, TrustScore

**Platform analytics:** DailyUserMetric, DailyProductMetric, DailySearchMetric,
DailyPaymentMetric, DailyChatMetric, DailyNotificationMetric, DailyReviewMetric,
DailyCategoryMetric, PlatformStatistic

**Admin/Ops:** SystemSetting, FeatureFlag, Banner, Advertisement, CmsPage, AdminSession,
AdminNotification, SystemAnnouncement, SellerProfile, Order, EmailTemplate, Notification

**Support:** SupportTicket, TicketMessage, TicketInternalNote, TicketActivityLog,
Complaint, ComplaintMessage, ComplaintInvestigationNote, ComplaintResolution,
ComplaintActivityLog

## Migrations
Two migrations present: `20260718181804_init`, `20260823183500_update_schema`.
Not diffed against current `schema.prisma` this session — if `prisma migrate dev`
reports drift, that's the next thing to check before trusting a fresh clone.

## Not yet verified
- Index/constraint completeness on hot paths (search, chat unread counts, feed queries).
- Whether every model above has a live controller/service actually using it — some may
  be schema-only / not yet wired to the API (needs an API-catalog pass; not done yet).
