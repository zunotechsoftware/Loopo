import 'dart:convert';
import '../config/api_config.dart';
import 'api_client.dart';

class NotificationService {
  /// Fetch paginated notifications for the current user.
  Future<Map<String, dynamic>> getNotifications({int page = 1, int limit = 20}) async {
    try {
      final uri = Uri.parse(ApiConfig.notificationsUrl).replace(
        queryParameters: {'page': page.toString(), 'limit': limit.toString()},
      );
      final response = await ApiClient.get(uri).timeout(const Duration(seconds: 15));

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
      final response = await ApiClient.patch(Uri.parse(ApiConfig.notificationReadUrl(id)))
          .timeout(const Duration(seconds: 10));
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  /// Mark all notifications as read.
  Future<bool> markAllRead() async {
    try {
      final response = await ApiClient.patch(Uri.parse('${ApiConfig.notificationsUrl}/read-all'))
          .timeout(const Duration(seconds: 10));
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  /// Delete a single notification.
  Future<bool> deleteOne(String id) async {
    try {
      final response = await ApiClient.delete(Uri.parse('${ApiConfig.notificationsUrl}/$id'))
          .timeout(const Duration(seconds: 10));
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  /// Delete every notification for the current user.
  Future<bool> deleteAll() async {
    try {
      final response = await ApiClient.delete(Uri.parse(ApiConfig.notificationsUrl))
          .timeout(const Duration(seconds: 10));
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }
}
