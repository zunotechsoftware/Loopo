import 'dart:convert';
import '../config/api_config.dart';
import 'api_client.dart';

class OrderService {
  /// Fetch all orders for the current user.
  Future<List<dynamic>> getOrders({int page = 1, int limit = 20}) async {
    try {
      final uri = Uri.parse(ApiConfig.ordersUrl).replace(
        queryParameters: {'page': page.toString(), 'limit': limit.toString()},
      );
      final response = await ApiClient.get(
        uri,
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        final data = body['data'];
        if (data is Map && data.containsKey('items'))
          return data['items'] ?? [];
        return data is List ? data : [];
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  /// Fetch details of a single order.
  Future<Map<String, dynamic>?> getOrderById(String id) async {
    try {
      final response = await ApiClient.get(
        Uri.parse(ApiConfig.orderDetailUrl(id)),
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        return body['data'] as Map<String, dynamic>?;
      }
      return null;
    } catch (_) {
      return null;
    }
  }
}
