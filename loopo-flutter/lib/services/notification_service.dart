import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import 'auth_session.dart';

class NotificationService {
  Map<String, String> get _authHeaders => {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        if (AuthSession.isLoggedIn) 'Authorization': 'Bearer ${AuthSession.token}',
      };

  /// Fetch paginated notifications for the current user.
  Future<Map<String, dynamic>> getNotifications({int page = 1, int limit = 20}) async {
    try {
      final uri = Uri.parse(ApiConfig.notificationsUrl).replace(
        queryParameters: {'page': page.toString(), 'limit': limit.toString()},
      );
      final response = await http
          .get(uri, headers: _authHeaders)
          .timeout(const Duration(seconds: 15));

      final body = jsonDecode(response.body) as Map<String, dynamic>;
      if (response.statusCode == 200) {
        return body['data'] ?? {'items': [], 'total': 0, 'unreadCount': 0};
      }
      return {'items': [], 'total': 0, 'unreadCount': 0};
    } catch (_) {
      return {'items': [], 'total': 0, 'unreadCount': 0};
    }
  }

  /// Mark a specific notification as read.
  Future<bool> markRead(String id) async {
    try {
      final response = await http
          .patch(
            Uri.parse(ApiConfig.notificationReadUrl(id)),
            headers: _authHeaders,
          )
          .timeout(const Duration(seconds: 10));
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  /// Mark all notifications as read.
  Future<bool> markAllRead() async {
    try {
      final response = await http
          .patch(
            Uri.parse('${ApiConfig.notificationsUrl}/read-all'),
            headers: _authHeaders,
          )
          .timeout(const Duration(seconds: 10));
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }
}
