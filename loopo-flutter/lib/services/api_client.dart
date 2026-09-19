import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import 'auth_session.dart';

/// Shared HTTP wrapper - every authenticated service should call through
/// this instead of `package:http` directly. Centralizes two things that
/// were previously either duplicated ad hoc in every service (attaching
/// the Authorization header) or missing entirely (no service anywhere
/// handled a 401 by refreshing - a request just failed once the 15-minute
/// access token expired, identical to the bug already found and fixed on
/// loopo-client this session).
class ApiClient {
  ApiClient._();

  static Map<String, String> _headers([Map<String, String>? extra]) => {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        if (AuthSession.isLoggedIn) 'Authorization': 'Bearer ${AuthSession.token}',
        ...?extra,
      };

  static Future<String?>? _refreshing;

  /// Dedupes concurrent refresh attempts - several requests can all 401 at
  /// the same moment when the access token expires.
  static Future<String?> _refreshAccessToken() {
    return _refreshing ??= _doRefresh().whenComplete(() => _refreshing = null);
  }

  static Future<String?> _doRefresh() async {
    try {
      final refreshToken = AuthSession.refreshToken;
      if (refreshToken == null || refreshToken.isEmpty) return null;

      final response = await http
          .post(
            Uri.parse(ApiConfig.refreshTokenUrl),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({'refreshToken': refreshToken}),
          )
          .timeout(const Duration(seconds: 15));

      if (response.statusCode != 200 && response.statusCode != 201) {
        AuthSession.clear();
        return null;
      }

      final body = jsonDecode(response.body) as Map<String, dynamic>;
      final data = body['data'] as Map<String, dynamic>?;
      final newAccessToken = data?['accessToken'] as String?;
      if (newAccessToken == null || newAccessToken.isEmpty) {
        AuthSession.clear();
        return null;
      }
      AuthSession.setTokens(
        accessToken: newAccessToken,
        refreshToken: data?['refreshToken'] as String?,
      );
      return newAccessToken;
    } catch (_) {
      return null;
    }
  }

  static bool _isAuthEndpoint(Uri uri) {
    final path = uri.path;
    return path.contains('/auth/refresh') ||
        path.contains('/auth/login') ||
        path.contains('/auth/register') ||
        path.contains('/auth/phone/') ||
        path.contains('/auth/forgot-password') ||
        path.contains('/auth/reset-password');
  }

  static Future<http.Response> _send(
    Uri uri,
    Future<http.Response> Function(Map<String, String> headers) request,
  ) async {
    final response = await request(_headers());
    if (response.statusCode != 401 ||
        _isAuthEndpoint(uri) ||
        AuthSession.refreshToken == null ||
        AuthSession.refreshToken!.isEmpty) {
      return response;
    }

    final newToken = await _refreshAccessToken();
    if (newToken == null) return response;

    return request(_headers());
  }

  static Future<http.Response> get(Uri uri, {Map<String, String>? headers}) =>
      _send(uri, (h) => http.get(uri, headers: {...h, ...?headers}));

  static Future<http.Response> post(Uri uri, {Map<String, String>? headers, Object? body}) =>
      _send(uri, (h) => http.post(uri, headers: {...h, ...?headers}, body: body));

  static Future<http.Response> put(Uri uri, {Map<String, String>? headers, Object? body}) =>
      _send(uri, (h) => http.put(uri, headers: {...h, ...?headers}, body: body));

  static Future<http.Response> patch(Uri uri, {Map<String, String>? headers, Object? body}) =>
      _send(uri, (h) => http.patch(uri, headers: {...h, ...?headers}, body: body));

  static Future<http.Response> delete(Uri uri, {Map<String, String>? headers}) =>
      _send(uri, (h) => http.delete(uri, headers: {...h, ...?headers}));
}
