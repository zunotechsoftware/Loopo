import 'package:flutter/foundation.dart';

class ApiConfig {
  // Override the host at build/run time when needed, e.g. testing on a
  // physical device instead of the emulator:
  //   flutter run --dart-define=API_HOST=192.168.1.42
  static const String _overrideHost = String.fromEnvironment('API_HOST');

  static String get baseUrl {
    if (_overrideHost.isNotEmpty) {
      return 'http://$_overrideHost:3000';
    }

    if (kIsWeb) {
      return 'http://localhost:3000';
    }

    if (defaultTargetPlatform == TargetPlatform.android) {
      // 10.0.2.2 is the special alias the Android emulator uses to reach
      // "localhost" on the host machine running the dev server.
      // For a physical Android device, run with:
      //   flutter run --dart-define=API_HOST=<your-machine-LAN-IP>
      return 'http://10.0.2.2:3000';
    }

    // iOS simulator (and any other platform) can reach localhost directly.
    return 'http://localhost:3000';
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
}
