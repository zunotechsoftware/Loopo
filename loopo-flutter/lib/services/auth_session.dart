/// Simple in-memory holder for the current auth token.
///
/// This intentionally avoids any native plugin (like shared_preferences)
/// so there's no Gradle/Kotlin build step involved. The trade-off: the
/// token is lost when the app process is killed, so the user will need
/// to log in again after a full restart. Swap this out for a real
/// persistent store later if you want "stay logged in" across restarts.
class AuthSession {
  AuthSession._();

  static String? _token;

  static String? get token => _token;

  static bool get isLoggedIn => _token != null && _token!.isNotEmpty;

  static void setToken(String token) {
    _token = token;
  }

  static void clear() {
    _token = null;
  }
}
