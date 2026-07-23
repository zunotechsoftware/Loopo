import 'dart:io';
import 'package:flutter/foundation.dart';

class ApiConfig {
  // Base URL for different environments
  static String get baseUrl {
    // For web
    if (kIsWeb) {
      return 'http://localhost:3000';
    }

    // For Android emulator
    if (Platform.isAndroid) {
      // Check if running on emulator
      final isEmulator =
          Platform.environment.containsKey('ANDROID_EMULATOR') ||
          Platform.environment.containsKey('EMULATOR');
      if (isEmulator) {
        return 'http://10.0.2.2:3000'; // Android emulator localhost
      }
      // For physical Android device - use your computer's IP
      return 'http://192.168.1.100:3000'; // Replace with your IP
    }

    // For iOS simulator
    if (Platform.isIOS) {
      return 'http://localhost:3000'; // iOS simulator
    }

    // Default fallback
    return 'http://localhost:3000';
  }

  // API endpoints
  static const String registerEndpoint = '/api/v1/auth/register';

  // Full URLs
  static String get registerUrl => '$baseUrl$registerEndpoint';
}
