import 'package:shared_preferences/shared_preferences.dart';
import '../config/debug_config.dart';

/// Holds the current session's access + refresh tokens.
///
/// Previously this only ever kept the access token in a plain in-memory
/// static field, with no refresh token captured at all - every app restart
/// silently logged the user out, and any mid-session 401 (the access token
/// expires in 15 minutes on the real backend) had no way to recover short
/// of a manual re-login. [init] restores a persisted session at app
/// startup; every write goes through [setTokens]/[clear], which persist to
/// SharedPreferences in the background so the rest of the app can keep
/// reading `AuthSession.token`/`isLoggedIn` synchronously exactly as before.
class AuthSession {
  AuthSession._();

  static const _kAccessTokenKey = 'loopo_access_token';
  static const _kRefreshTokenKey = 'loopo_refresh_token';

  static String? _token;
  static String? _refreshToken;
  static bool _initialized = false;

  /// Must be awaited once at app startup (see main.dart), before any screen
  /// reads [token]/[isLoggedIn].
  static Future<void> init() async {
    if (_initialized) return;
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString(_kAccessTokenKey);
    _refreshToken = prefs.getString(_kRefreshTokenKey);
    _initialized = true;
  }

  static String? get token =>
      (_token != null && _token!.isNotEmpty)
          ? _token
          : (DebugConfig.isBypassAuth ? 'mock_dev_bypass_token' : null);

  static String? get refreshToken => _refreshToken;

  static bool get isLoggedIn =>
      DebugConfig.isBypassAuth || (_token != null && _token!.isNotEmpty);

  /// [refreshToken] is optional so existing call sites that only ever had
  /// an access token (e.g. the OTP-login response) keep working unchanged.
  static void setTokens({required String accessToken, String? refreshToken}) {
    _token = accessToken;
    if (refreshToken != null && refreshToken.isNotEmpty) {
      _refreshToken = refreshToken;
    }
    _persist();
  }

  static void setToken(String token) => setTokens(accessToken: token);

  static void clear() {
    _token = null;
    _refreshToken = null;
    _persist();
  }

  static Future<void> _persist() async {
    final prefs = await SharedPreferences.getInstance();
    if (_token != null && _token!.isNotEmpty) {
      await prefs.setString(_kAccessTokenKey, _token!);
    } else {
      await prefs.remove(_kAccessTokenKey);
    }
    if (_refreshToken != null && _refreshToken!.isNotEmpty) {
      await prefs.setString(_kRefreshTokenKey, _refreshToken!);
    } else {
      await prefs.remove(_kRefreshTokenKey);
    }
  }
}
