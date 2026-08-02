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
}
