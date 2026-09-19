import 'dart:convert';
import '../config/api_config.dart';
import 'api_client.dart';

class AddressService {
  /// Fetch all saved addresses for the current user.
  Future<List<dynamic>> getAddresses() async {
    try {
      final response = await ApiClient.get(
        Uri.parse(ApiConfig.addressesUrl),
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        final data = body['data'];
        return data is List ? data : [];
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  /// Create a new saved address.
  Future<Map<String, dynamic>> createAddress({
    required String label,
    required String addressLine,
    required String city,
    required String state,
    required String pincode,
    String? phone,
    bool isDefault = false,
  }) async {
    final response = await ApiClient.post(
      Uri.parse(ApiConfig.addressesUrl),
      body: jsonEncode({
        'label': label,
        'addressLine': addressLine,
        'city': city,
        'state': state,
        'pincode': pincode,
        'phone': ?phone,
        'isDefault': isDefault,
      }),
    ).timeout(const Duration(seconds: 15));

    final body = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode == 200 || response.statusCode == 201) {
      return body['data'] ?? body;
    }
    throw Exception(
      body['message'] ?? 'Failed to create address (${response.statusCode})',
    );
  }

  /// Update an existing saved address.
  Future<Map<String, dynamic>> updateAddress(
    String id,
    Map<String, dynamic> updates,
  ) async {
    final response = await ApiClient.put(
      Uri.parse('${ApiConfig.addressesUrl}/$id'),
      body: jsonEncode(updates),
    ).timeout(const Duration(seconds: 15));

    final body = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode == 200) {
      return body['data'] ?? body;
    }
    throw Exception(
      body['message'] ?? 'Failed to update address (${response.statusCode})',
    );
  }

  /// Delete a saved address.
  Future<bool> deleteAddress(String id) async {
    try {
      final response = await ApiClient.delete(
        Uri.parse('${ApiConfig.addressesUrl}/$id'),
      ).timeout(const Duration(seconds: 10));
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }
}
