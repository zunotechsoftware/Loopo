enum AppEnvironment { development, production }

class ApiConfig {
  // Override base URL directly via:
  //   flutter run --dart-define=API_BASE_URL=https://my-custom-domain.com
  static const String _overrideBaseUrl = String.fromEnvironment('API_BASE_URL');

  // Environment mode:
  //   flutter run --dart-define=ENVIRONMENT=production
  static const String _envString = String.fromEnvironment('ENVIRONMENT', defaultValue: 'development');

  // Legacy local IP override:
  //   flutter run --dart-define=API_HOST=192.168.1.42
  static const String _overrideHost = String.fromEnvironment('API_HOST');

  // Known hosts
  static const String _devBaseUrl = 'https://loopo-711b.onrender.com';
  static const String _prodBaseUrl = 'https://api.loopo.com'; // Production API hostname

  static AppEnvironment get environment =>
      _envString.toLowerCase() == 'production'
          ? AppEnvironment.production
          : AppEnvironment.development;

  static String get baseUrl {
    if (_overrideBaseUrl.isNotEmpty) {
      return _overrideBaseUrl.endsWith('/')
          ? _overrideBaseUrl.substring(0, _overrideBaseUrl.length - 1)
          : _overrideBaseUrl;
    }

    if (_overrideHost.isNotEmpty) {
      return _overrideHost.startsWith('http')
          ? _overrideHost
          : 'http://$_overrideHost:3000';
    }

    switch (environment) {
      case AppEnvironment.production:
        return _prodBaseUrl;
      case AppEnvironment.development:
        return _devBaseUrl;
    }
  }

  // API endpoints
  static const String loginEndpoint = '/api/v1/auth/login';
  static const String registerEndpoint = '/api/v1/auth/register';
  static const String forgotPasswordEndpoint = '/api/v1/auth/forgot-password';
  static const String resetPasswordEndpoint = '/api/v1/auth/reset-password';
  static const String categoriesEndpoint = '/api/v1/categories';
  static const String categoryTreeEndpoint = '/api/v1/categories/tree';
  static const String meEndpoint = '/api/v1/users/me';
  static const String updateProfileEndpoint = '/api/v1/users/me';
  static const String notificationSettingsEndpoint = '/api/v1/notification-settings';
  static const String searchEndpoint = '/api/v1/search';

  static const String productsEndpoint = '/api/v1/products';
  static const String myProductsEndpoint = '/api/v1/products/my';

  static const String chatConversationsEndpoint = '/api/v1/chat/conversations';
  static const String chatMessagesEndpoint = '/api/v1/chat/messages';
  static const String kycVerifyEndpoint = '/api/v1/kyc/verify';
  static const String favoritesEndpoint = '/api/v1/interactions/favorites';
  static const String notificationsEndpoint = '/api/v1/notifications';
  static const String addressesEndpoint = '/api/v1/addresses';
  static const String reportsEndpoint = '/api/v1/reports';
  static const String ordersEndpoint = '/api/v1/orders';

  // Full URLs
  static String get loginUrl => '$baseUrl$loginEndpoint';
  static String get registerUrl => '$baseUrl$registerEndpoint';
  static String get forgotPasswordUrl => '$baseUrl$forgotPasswordEndpoint';
  static String get resetPasswordUrl => '$baseUrl$resetPasswordEndpoint';
  static String get categoriesUrl => '$baseUrl$categoriesEndpoint';
  static String get categoryTreeUrl => '$baseUrl$categoryTreeEndpoint';
  static String get meUrl => '$baseUrl$meEndpoint';
  static String get updateProfileUrl => '$baseUrl$updateProfileEndpoint';
  static String get notificationSettingsUrl => '$baseUrl$notificationSettingsEndpoint';
  static String get searchUrl => '$baseUrl$searchEndpoint';

  static String get productsUrl => '$baseUrl$productsEndpoint';
  static String get myProductsUrl => '$baseUrl$myProductsEndpoint';

  static String get chatConversationsUrl => '$baseUrl$chatConversationsEndpoint';
  static String get chatMessagesUrl => '$baseUrl$chatMessagesEndpoint';
  static String get kycVerifyUrl => '$baseUrl$kycVerifyEndpoint';
  static String get favoritesUrl => '$baseUrl$favoritesEndpoint';
  static String get notificationsUrl => '$baseUrl$notificationsEndpoint';
  static String get addressesUrl => '$baseUrl$addressesEndpoint';
  static String get reportsUrl => '$baseUrl$reportsEndpoint';
  static String get ordersUrl => '$baseUrl$ordersEndpoint';

  static String productDetailUrl(String id) => '$baseUrl$productsEndpoint/$id';
  static String publishProductUrl(String id) => '$baseUrl$productsEndpoint/$id/publish';
  static String pauseProductUrl(String id) => '$baseUrl$productsEndpoint/$id/pause';
  static String resumeProductUrl(String id) => '$baseUrl$productsEndpoint/$id/resume';
  static String archiveProductUrl(String id) => '$baseUrl$productsEndpoint/$id/archive';
}

