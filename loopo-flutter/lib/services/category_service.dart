// lib/services/category_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';

class CategoryService {
  Future<List<dynamic>> getRootCategories() async {
    try {
      final response = await http.get(
        Uri.parse(ApiConfig.categoriesUrl),
        headers: {'Accept': 'application/json'},
      ).timeout(const Duration(seconds: 8));

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        return responseData['data'] ?? [];
      }
      return [];
    } catch (_) {
      return []; // Fallback gracefully on timeout/network issue
    }
  }

  Future<List<dynamic>> getCategoryTree() async {
    try {
      final response = await http.get(
        Uri.parse(ApiConfig.categoryTreeUrl),
        headers: {'Accept': 'application/json'},
      ).timeout(const Duration(seconds: 8));

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        return responseData['data'] ?? [];
      }
      return [];
    } catch (_) {
      return []; // Fallback gracefully on timeout/network issue
    }
  }

  /// Search products by category ID, query string, or price range via GET /api/v1/search
  Future<List<dynamic>> searchProducts({
    String? categoryId,
    String? query,
    double? minPrice,
    double? maxPrice,
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final queryParams = <String, String>{
        'page': page.toString(),
        'limit': limit.toString(),
      };
      if (categoryId != null && categoryId.isNotEmpty) {
        queryParams['categoryId'] = categoryId;
      }
      if (query != null && query.isNotEmpty) {
        queryParams['query'] = query;
      }
      if (minPrice != null) queryParams['minPrice'] = minPrice.toString();
      if (maxPrice != null) queryParams['maxPrice'] = maxPrice.toString();

      final uri = Uri.parse(ApiConfig.searchUrl).replace(queryParameters: queryParams);
      final response = await http.get(
        uri,
        headers: {'Accept': 'application/json'},
      ).timeout(const Duration(seconds: 8));

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        final data = responseData['data'];
        if (data is Map && data.containsKey('items')) {
          return data['items'] ?? [];
        }
        return data is List ? data : [];
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  /// Fetch subcategories for a given parent category ID or slug
  Future<List<dynamic>> getSubcategories(String categoryIdOrSlug) async {
    try {
      final tree = await getCategoryTree();
      for (final cat in tree) {
        final id = cat['id']?.toString();
        final slug = cat['slug']?.toString();
        final name = cat['name']?.toString();

        if (id == categoryIdOrSlug ||
            slug == categoryIdOrSlug ||
            (name != null && name.toLowerCase() == categoryIdOrSlug.toLowerCase())) {
          return cat['children'] ?? [];
        }
      }
      return [];
    } catch (_) {
      return [];
    }
  }
}
