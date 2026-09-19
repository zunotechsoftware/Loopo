import 'dart:convert';
import '../config/api_config.dart';
import 'api_client.dart';
import 'auth_session.dart';

class ProductService {
  /// Fetch public marketplace listings with pagination and filters.
  Future<Map<String, dynamic>> getPublicListings({
    String? categoryId,
    String? search,
    String? sellerId,
    double? minPrice,
    double? maxPrice,
    int page = 1,
    int limit = 20,
  }) async {
    final queryParams = <String, String>{
      'page': page.toString(),
      'limit': limit.toString(),
    };
    if (categoryId != null && categoryId.isNotEmpty) {
      queryParams['categoryId'] = categoryId;
    }
    if (search != null && search.isNotEmpty) {
      // The real backend's ListingSearchQueryDto field is `keyword`, not
      // `search` - combined with the app-wide `forbidNonWhitelisted`
      // validation pipe, sending `search` here previously 400'd every
      // single request that included a search term (never just silently
      // ignored the extra field).
      queryParams['keyword'] = search;
    }
    if (sellerId != null && sellerId.isNotEmpty) {
      queryParams['sellerId'] = sellerId;
    }
    if (minPrice != null) queryParams['minPrice'] = minPrice.toString();
    if (maxPrice != null) queryParams['maxPrice'] = maxPrice.toString();

    final uri = Uri.parse(
      ApiConfig.productsUrl,
    ).replace(queryParameters: queryParams);
    final response = await ApiClient.get(
      uri,
    ).timeout(const Duration(seconds: 15));

    if (response.statusCode == 200) {
      final body = jsonDecode(response.body);
      return body['data'] is Map
          ? body['data']
          : {'items': body['data'] ?? [], 'total': 0};
    }
    throw Exception('Failed to fetch public listings (${response.statusCode})');
  }

  Future<Map<String, dynamic>> getProductDetail(String idOrSlug) async {
    final response = await ApiClient.get(
      Uri.parse(ApiConfig.productDetailUrl(idOrSlug)),
    ).timeout(const Duration(seconds: 15));
    final body = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode == 200) {
      return body['data'] as Map<String, dynamic>;
    }
    throw Exception(
      body['message'] ?? 'Failed to load listing (${response.statusCode})',
    );
  }

  /// Fetch seller's own listings (My Ads). Returns an empty list - never
  /// fake data - if the user isn't logged in or the request fails; the
  /// caller is responsible for showing a real error/empty state.
  Future<List<dynamic>> getMyListings({
    String? status,
    int page = 1,
    int limit = 50,
  }) async {
    if (!AuthSession.isLoggedIn) {
      return [];
    }

    final queryParams = <String, String>{
      'page': page.toString(),
      'limit': limit.toString(),
    };
    if (status != null && status.isNotEmpty && status.toUpperCase() != 'ALL') {
      queryParams['status'] = status.toUpperCase();
    }

    final uri = Uri.parse(
      ApiConfig.myProductsUrl,
    ).replace(queryParameters: queryParams);
    final response = await ApiClient.get(
      uri,
    ).timeout(const Duration(seconds: 15));

    if (response.statusCode == 200) {
      final body = jsonDecode(response.body);
      final data = body['data'];
      if (data is Map && data.containsKey('items')) {
        return data['items'] ?? [];
      }
      return data is List ? data : [];
    }
    throw Exception('Failed to fetch your listings (${response.statusCode})');
  }

  /// Create a new marketplace listing.
  Future<Map<String, dynamic>> createListing(
    Map<String, dynamic> payload,
  ) async {
    final response = await ApiClient.post(
      Uri.parse(ApiConfig.productsUrl),
      body: jsonEncode(payload),
    ).timeout(const Duration(seconds: 15));

    final body = jsonDecode(response.body);
    if (response.statusCode == 200 || response.statusCode == 201) {
      return body['data'] as Map<String, dynamic>;
    }
    throw Exception(
      body['message'] ?? 'Failed to create listing (${response.statusCode})',
    );
  }

  /// Update an existing listing.
  Future<Map<String, dynamic>> updateListing(
    String id,
    Map<String, dynamic> payload,
  ) async {
    final response = await ApiClient.put(
      Uri.parse(ApiConfig.productDetailUrl(id)),
      body: jsonEncode(payload),
    );

    final body = jsonDecode(response.body);
    if (response.statusCode == 200) {
      return body['data'] as Map<String, dynamic>;
    }
    throw Exception(
      body['message'] ?? 'Failed to update listing (${response.statusCode})',
    );
  }

  /// Soft delete a listing.
  Future<bool> deleteListing(String id) async {
    final response = await ApiClient.delete(
      Uri.parse(ApiConfig.productDetailUrl(id)),
    );

    if (response.statusCode == 200) {
      return true;
    }
    throw Exception('Failed to delete listing (${response.statusCode})');
  }

  /// Submit listing for approval / publish.
  Future<Map<String, dynamic>> publishListing(String id) async {
    final response = await ApiClient.patch(
      Uri.parse(ApiConfig.publishProductUrl(id)),
    );

    final body = jsonDecode(response.body);
    if (response.statusCode == 200) {
      return body['data'] as Map<String, dynamic>;
    }
    throw Exception(
      body['message'] ?? 'Failed to publish listing (${response.statusCode})',
    );
  }

  /// Pause an active listing.
  Future<Map<String, dynamic>> pauseListing(String id) async {
    final response = await ApiClient.patch(
      Uri.parse(ApiConfig.pauseProductUrl(id)),
    );

    final body = jsonDecode(response.body);
    if (response.statusCode == 200) {
      return body['data'] as Map<String, dynamic>;
    }
    throw Exception(
      body['message'] ?? 'Failed to pause listing (${response.statusCode})',
    );
  }

  /// Resume a paused listing.
  Future<Map<String, dynamic>> resumeListing(String id) async {
    final response = await ApiClient.patch(
      Uri.parse(ApiConfig.resumeProductUrl(id)),
    );

    final body = jsonDecode(response.body);
    if (response.statusCode == 200) {
      return body['data'] as Map<String, dynamic>;
    }
    throw Exception(
      body['message'] ?? 'Failed to resume listing (${response.statusCode})',
    );
  }
}
