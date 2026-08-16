import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import 'auth_session.dart';

class AddressService {
  Map<String, String> get _authHeaders => {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        if (AuthSession.isLoggedIn) 'Authorization': 'Bearer ${AuthSession.token}',
      };

  /// Fetch all saved addresses for the current user.
  Future<List<dynamic>> getAddresses() async {
    try {
      final response = await http
          .get(Uri.parse(ApiConfig.addressesUrl), headers: _authHeaders)
          .timeout(const Duration(seconds: 15));

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
    final response = await http
        .post(
          Uri.parse(ApiConfig.addressesUrl),
          headers: _authHeaders,
          body: jsonEncode({
            'label': label,
            'addressLine': addressLine,
            'city': city,
            'state': state,
            'pincode': pincode,
            'phone': ?phone,
            'isDefault': isDefault,
          }),
        )
        .timeout(const Duration(seconds: 15));

    final body = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode == 200 || response.statusCode == 201) {
      return body['data'] ?? body;
    }
    throw Exception(body['message'] ?? 'Failed to create address (${response.statusCode})');
  }

  /// Update an existing saved address.
  Future<Map<String, dynamic>> updateAddress(
    String id,
    Map<String, dynamic> updates,
  ) async {
    final response = await http
        .put(
          Uri.parse('${ApiConfig.addressesUrl}/$id'),
          headers: _authHeaders,
          body: jsonEncode(updates),
        )
        .timeout(const Duration(seconds: 15));

    final body = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode == 200) {
      return body['data'] ?? body;
    }
    throw Exception(body['message'] ?? 'Failed to update address (${response.statusCode})');
  }

  /// Delete a saved address.
  Future<bool> deleteAddress(String id) async {
    try {
      final response = await http
          .delete(
            Uri.parse('${ApiConfig.addressesUrl}/$id'),
            headers: _authHeaders,
          )
          .timeout(const Duration(seconds: 10));
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }
}
