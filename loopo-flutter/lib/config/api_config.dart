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

  // Full URLs
  static String get loginUrl => '$baseUrl$loginEndpoint';
  static String get registerUrl => '$baseUrl$registerEndpoint';
}
