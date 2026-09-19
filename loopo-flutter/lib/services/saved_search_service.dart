import 'dart:convert';
import '../config/api_config.dart';
import 'api_client.dart';

/// Real saved-search backend, added alongside the notification system -
/// the "Saved Searches" screen previously showed a hardcoded list with no
/// persistence or real alerting behind it at all.
class SavedSearchService {
  Future<List<dynamic>> getMine() async {
    final response = await ApiClient.get(
      Uri.parse(ApiConfig.savedSearchesUrl),
    ).timeout(const Duration(seconds: 15));
    final body = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode == 200) {
      final data = body['data'];
      return data is List ? data : [];
    }
    throw Exception(
      body['message'] ??
          'Could not load saved searches (${response.statusCode})',
    );
  }

  Future<Map<String, dynamic>> create({
    required String query,
    String? categoryId,
    String? city,
  }) async {
    final response = await ApiClient.post(
      Uri.parse(ApiConfig.savedSearchesUrl),
      body: jsonEncode({
        'query': query,
        if (categoryId != null) 'categoryId': categoryId,
        if (city != null) 'city': city,
      }),
    ).timeout(const Duration(seconds: 15));

    final body = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode == 200 || response.statusCode == 201) {
      return body['data'] as Map<String, dynamic>;
    }
    throw Exception(
      body['message'] ?? 'Could not save search (${response.statusCode})',
    );
  }

  Future<void> setNotificationsEnabled(String id, bool enabled) async {
    final response = await ApiClient.patch(
      Uri.parse(ApiConfig.savedSearchUrl(id)),
      body: jsonEncode({'notificationsEnabled': enabled}),
    ).timeout(const Duration(seconds: 15));
    if (response.statusCode != 200) {
      throw Exception(
        'Could not update notification preference (${response.statusCode})',
      );
    }
  }

  Future<void> remove(String id) async {
    final response = await ApiClient.delete(
      Uri.parse(ApiConfig.savedSearchUrl(id)),
    ).timeout(const Duration(seconds: 15));
    if (response.statusCode != 200) {
      throw Exception('Could not remove saved search (${response.statusCode})');
    }
  }
}
