import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import 'auth_session.dart';

class OrderService {
  Map<String, String> get _authHeaders => {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        if (AuthSession.isLoggedIn) 'Authorization': 'Bearer ${AuthSession.token}',
      };

  /// Fetch all orders for the current user.
  Future<List<dynamic>> getOrders({int page = 1, int limit = 20}) async {
    try {
      final uri = Uri.parse(ApiConfig.ordersUrl).replace(
        queryParameters: {'page': page.toString(), 'limit': limit.toString()},
      );
      final response = await http
          .get(uri, headers: _authHeaders)
          .timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        final data = body['data'];
        if (data is Map && data.containsKey('items')) return data['items'] ?? [];
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
      final response = await http
          .get(
            Uri.parse(ApiConfig.orderDetailUrl(id)),
            headers: _authHeaders,
          )
          .timeout(const Duration(seconds: 15));

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
