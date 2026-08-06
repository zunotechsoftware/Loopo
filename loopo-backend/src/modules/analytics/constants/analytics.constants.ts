export const ANALYTICS_QUEUE = 'analytics_queue';
export const AGGREGATION_QUEUE = 'aggregation_queue';

export const REDIS_ANALYTICS_PREFIX = 'analytics:';

export const CACHE_TTL_DASHBOARD = 300; // 5 minutes
export const CACHE_TTL_TOP_SELLERS = 3600; // 1 hour
export const CACHE_TTL_TRENDING = 3600; // 1 hour

export const EVENTS = {
  USER_REGISTERED: 'user.registered',
  USER_LOGGED_IN: 'user.logged_in',
  PRODUCT_VIEWED: 'product.viewed',
  PRODUCT_FAVORITED: 'product.favorited',
  PRODUCT_SHARED: 'product.shared',
  SEARCH_PERFORMED: 'search.performed',
  CHAT_STARTED: 'chat.started',
  MESSAGE_SENT: 'message.sent',
  PAYMENT_COMPLETED: 'payment.completed',
  NOTIFICATION_SENT: 'notification.sent',
  REVIEW_CREATED: 'review.created',
};
