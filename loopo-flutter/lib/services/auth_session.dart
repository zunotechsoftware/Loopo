import '../config/debug_config.dart';

/// Simple in-memory holder for the current auth token.

class AuthSession {
  AuthSession._();

  static String? _token;

  static String? get token =>
      (_token != null && _token!.isNotEmpty)
          ? _token
          : (DebugConfig.isBypassAuth ? 'mock_dev_bypass_token' : null);

  static bool get isLoggedIn =>
      DebugConfig.isBypassAuth || (_token != null && _token!.isNotEmpty);

  static void setToken(String token) {
    _token = token;
  }

  static void clear() {
    _token = null;
  }
}
