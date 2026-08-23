import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import 'auth_session.dart';

class FavoritesService {
  Map<String, String> get _authHeaders => {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        if (AuthSession.isLoggedIn) 'Authorization': 'Bearer ${AuthSession.token}',
      };

  /// Fetch all favorited products for the current user.
  Future<List<dynamic>> getFavorites({int page = 1, int limit = 50}) async {
    try {
      final uri = Uri.parse(ApiConfig.favoritesUrl).replace(
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

  /// Add a product to favorites.
  Future<bool> addFavorite(String productId) async {
    try {
      final response = await http
          .post(
            Uri.parse(ApiConfig.favoritesUrl),
            headers: _authHeaders,
            body: jsonEncode({'productId': productId}),
          )
          .timeout(const Duration(seconds: 10));
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (_) {
      return false;
    }
  }

  /// Remove a product from favorites by its favorite record ID.
  Future<bool> removeFavorite(String favoriteId) async {
    try {
      final response = await http
          .delete(
            Uri.parse(ApiConfig.favoriteDeleteUrl(favoriteId)),
            headers: _authHeaders,
          )
          .timeout(const Duration(seconds: 10));
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  /// Toggle favorite status: adds if not favorited, removes if already favorited.
  Future<bool> toggleFavorite(String productId, {String? existingFavoriteId}) async {
    if (existingFavoriteId != null) {
      return removeFavorite(existingFavoriteId);
    }
    return addFavorite(productId);
  }
}
