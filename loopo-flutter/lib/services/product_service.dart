import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../config/debug_config.dart';
import 'auth_session.dart';

class ProductService {
  Map<String, String> get _authHeaders => {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        if (AuthSession.isLoggedIn) 'Authorization': 'Bearer ${AuthSession.token}',
      };

  static final List<Map<String, dynamic>> _mockMyListings = [
    {
      'id': '1',
      'title': 'iPhone 14 Pro Max - 256GB Deep Purple',
      'price': 78500,
      'category': {'name': 'Mobiles'},
      'status': 'ACTIVE',
      'viewCount': 142,
      'favoriteCount': 18,
      'inquiryCount': 5,
      'images': ['assets/images/loopo.png'],
      'location': {'city': 'Koramangala', 'state': 'Bengaluru'}
    },
    {
      'id': '2',
      'title': 'Sony Bravia 55" 4K Ultra HD Smart OLED TV',
      'price': 52000,
      'category': {'name': 'Electronics'},
      'status': 'ACTIVE',
      'viewCount': 89,
      'favoriteCount': 9,
      'inquiryCount': 3,
      'images': ['assets/images/loopo.png'],
      'location': {'city': 'Indiranagar', 'state': 'Bengaluru'}
    },
    {
      'id': '3',
      'title': 'Royal Enfield Classic 350 (2022 Model)',
      'price': 145000,
      'category': {'name': 'Vehicles'},
      'status': 'PENDING',
      'viewCount': 34,
      'favoriteCount': 4,
      'inquiryCount': 1,
      'images': ['assets/images/loopo.png'],
      'location': {'city': 'HSR Layout', 'state': 'Bengaluru'}
    },
    {
      'id': '4',
      'title': 'Ergonomic Premium Leather Office Chair',
      'price': 6500,
      'category': {'name': 'Furniture'},
      'status': 'SOLD',
      'viewCount': 230,
      'favoriteCount': 25,
      'inquiryCount': 12,
      'images': ['assets/images/loopo.png'],
      'location': {'city': 'Whitefield', 'state': 'Bengaluru'}
    },
    {
      'id': '5',
      'title': 'MacBook Pro M1 16GB 512GB Space Grey',
      'price': 89000,
      'category': {'name': 'Electronics'},
      'status': 'DRAFT',
      'viewCount': 0,
      'favoriteCount': 0,
      'inquiryCount': 0,
      'images': ['assets/images/loopo.png'],
      'location': {'city': 'Koramangala', 'state': 'Bengaluru'}
    },
  ];

  /// Fetch public marketplace listings with pagination and filters.
  Future<Map<String, dynamic>> getPublicListings({
    String? categoryId,
    String? search,
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
      queryParams['search'] = search;
    }
    if (minPrice != null) queryParams['minPrice'] = minPrice.toString();
    if (maxPrice != null) queryParams['maxPrice'] = maxPrice.toString();

    final uri = Uri.parse(ApiConfig.productsUrl).replace(queryParameters: queryParams);
    final response = await http.get(uri, headers: {'Accept': 'application/json'});

    if (response.statusCode == 200) {
      final body = jsonDecode(response.body);
      return body['data'] is Map ? body['data'] : {'items': body['data'] ?? [], 'total': 0};
    }
    throw Exception('Failed to fetch public listings (${response.statusCode})');
  }

  /// Fetch seller's own listings (My Ads).
  Future<List<dynamic>> getMyListings({String? status, int page = 1, int limit = 50}) async {
    if (DebugConfig.isBypassAuth) {
      if (status != null && status.isNotEmpty && status.toUpperCase() != 'ALL') {
        return _mockMyListings
            .where((item) => item['status'] == status.toUpperCase())
            .toList();
      }
      return _mockMyListings;
    }

    if (!AuthSession.isLoggedIn) {
      return [];
    }

    try {
      final queryParams = <String, String>{
        'page': page.toString(),
        'limit': limit.toString(),
      };
      if (status != null && status.isNotEmpty && status.toUpperCase() != 'ALL') {
        queryParams['status'] = status.toUpperCase();
      }

      final uri = Uri.parse(ApiConfig.myProductsUrl).replace(queryParameters: queryParams);
      final response = await http.get(uri, headers: _authHeaders).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        final data = body['data'];
        if (data is Map && data.containsKey('items')) {
          return data['items'] ?? [];
        }
        return data is List ? data : [];
      }
      return _mockMyListings;
    } catch (_) {
      return _mockMyListings;
    }
  }

  /// Create a new marketplace listing.
  Future<Map<String, dynamic>> createListing(Map<String, dynamic> payload) async {
    if (DebugConfig.isBypassAuth) {
      final created = {
        'id': 'mock_product_${DateTime.now().millisecondsSinceEpoch}',
        ...payload,
        'status': 'PENDING',
        'createdAt': DateTime.now().toIso8601String(),
      };
      _mockMyListings.insert(0, created);
      return created;
    }

    final response = await http.post(
      Uri.parse(ApiConfig.productsUrl),
      headers: _authHeaders,
      body: jsonEncode(payload),
    ).timeout(const Duration(seconds: 15));

    final body = jsonDecode(response.body);
    if (response.statusCode == 200 || response.statusCode == 201) {
      return body['data'] as Map<String, dynamic>;
    }
    throw Exception(body['message'] ?? 'Failed to create listing (${response.statusCode})');
  }

  /// Update an existing listing.
  Future<Map<String, dynamic>> updateListing(String id, Map<String, dynamic> payload) async {
    final response = await http.put(
      Uri.parse(ApiConfig.productDetailUrl(id)),
      headers: _authHeaders,
      body: jsonEncode(payload),
    );

    final body = jsonDecode(response.body);
    if (response.statusCode == 200) {
      return body['data'] as Map<String, dynamic>;
    }
    throw Exception(body['message'] ?? 'Failed to update listing (${response.statusCode})');
  }

  /// Soft delete a listing.
  Future<bool> deleteListing(String id) async {
    final response = await http.delete(
      Uri.parse(ApiConfig.productDetailUrl(id)),
      headers: _authHeaders,
    );

    if (response.statusCode == 200) {
      return true;
    }
    throw Exception('Failed to delete listing (${response.statusCode})');
  }

  /// Submit listing for approval / publish.
  Future<Map<String, dynamic>> publishListing(String id) async {
    final response = await http.patch(
      Uri.parse(ApiConfig.publishProductUrl(id)),
      headers: _authHeaders,
    );

    final body = jsonDecode(response.body);
    if (response.statusCode == 200) {
      return body['data'] as Map<String, dynamic>;
    }
    throw Exception(body['message'] ?? 'Failed to publish listing (${response.statusCode})');
  }

  /// Pause an active listing.
  Future<Map<String, dynamic>> pauseListing(String id) async {
    final response = await http.patch(
      Uri.parse(ApiConfig.pauseProductUrl(id)),
      headers: _authHeaders,
    );

    final body = jsonDecode(response.body);
    if (response.statusCode == 200) {
      return body['data'] as Map<String, dynamic>;
    }
    throw Exception(body['message'] ?? 'Failed to pause listing (${response.statusCode})');
  }

  /// Resume a paused listing.
  Future<Map<String, dynamic>> resumeListing(String id) async {
    final response = await http.patch(
      Uri.parse(ApiConfig.resumeProductUrl(id)),
      headers: _authHeaders,
    );

    final body = jsonDecode(response.body);
    if (response.statusCode == 200) {
      return body['data'] as Map<String, dynamic>;
    }
    throw Exception(body['message'] ?? 'Failed to resume listing (${response.statusCode})');
  }
}
