import 'dart:convert';
import '../config/api_config.dart';
import 'api_client.dart';

class FavoritesService {
  /// Fetch all favorited products for the current user.
  Future<List<dynamic>> getFavorites({int page = 1, int limit = 50}) async {
    try {
      final uri = Uri.parse(ApiConfig.favoritesUrl).replace(
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

  /// Add a product to favorites. Returns the created favorite record (which
  /// carries its own `id`, needed to remove it again later) or null on
  /// failure.
  Future<Map<String, dynamic>?> addFavorite(String productId) async {
    try {
      final response = await ApiClient.post(
        Uri.parse(ApiConfig.favoritesUrl),
        body: jsonEncode({'productId': productId}),
      ).timeout(const Duration(seconds: 10));
      if (response.statusCode == 200 || response.statusCode == 201) {
        final body = jsonDecode(response.body) as Map<String, dynamic>;
        return body['data'] as Map<String, dynamic>?;
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  /// Remove a product from favorites by its favorite record ID.
  Future<bool> removeFavorite(String favoriteId) async {
    try {
      final response = await ApiClient.delete(
        Uri.parse(ApiConfig.favoriteDeleteUrl(favoriteId)),
      ).timeout(const Duration(seconds: 10));
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }
}
