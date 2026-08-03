import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../services/auth_session.dart';

class UserService {
  Map<String, String> get _authHeaders => {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${AuthSession.token}',
      };

  /// Fetch the current authenticated user + their profile.
  /// Returns the merged data map or throws on error.
  Future<Map<String, dynamic>> getMe() async {
    final response = await http.get(
      Uri.parse(ApiConfig.meUrl),
      headers: _authHeaders,
    );

    final body = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode == 200) {
      return body['data'] as Map<String, dynamic>;
    }
    throw Exception(body['message'] ?? 'Failed to fetch profile');
  }

  /// Update the current user's profile fields.
  Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> updates) async {
    final response = await http.put(
      Uri.parse(ApiConfig.updateProfileUrl),
      headers: _authHeaders,
      body: jsonEncode(updates),
    );

    final body = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode == 200) {
      return body['data'] as Map<String, dynamic>;
    }
    throw Exception(body['message'] ?? 'Failed to update profile');
  }
}
