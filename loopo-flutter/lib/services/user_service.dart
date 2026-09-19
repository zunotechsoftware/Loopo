import 'dart:convert';
import '../config/api_config.dart';
import 'api_client.dart';
import 'auth_session.dart';

class UserService {
  /// Fetch the current authenticated user + their profile.
  Future<Map<String, dynamic>> getMe() async {
    if (!AuthSession.isLoggedIn) {
      throw Exception('User is not logged in');
    }

    final response = await ApiClient.get(
      Uri.parse(ApiConfig.meUrl),
    ).timeout(const Duration(seconds: 15));
    final body = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode == 200) {
      return body['data'] as Map<String, dynamic>;
    }
    throw Exception(
      body['message'] ?? 'Could not load your profile (${response.statusCode})',
    );
  }

  /// Update the current user's profile fields.
  Future<Map<String, dynamic>> updateProfile(
    Map<String, dynamic> updates,
  ) async {
    final response = await ApiClient.put(
      Uri.parse(ApiConfig.updateProfileUrl),
      body: jsonEncode(updates),
    ).timeout(const Duration(seconds: 15));

    final body = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode == 200) {
      return body['data'] as Map<String, dynamic>;
    }
    throw Exception(
      body['message'] ??
          'Could not update your profile (${response.statusCode})',
    );
  }

  /// A seller's real public profile (rating, listing counts, member since) -
  /// no auth required, matches what the product detail / seller profile
  /// screens show for any listing's seller.
  Future<Map<String, dynamic>> getPublicProfile(String userId) async {
    final response = await ApiClient.get(
      Uri.parse(ApiConfig.publicProfileUrl(userId)),
    ).timeout(const Duration(seconds: 15));
    final body = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode == 200) {
      return body['data'] as Map<String, dynamic>;
    }
    throw Exception(
      body['message'] ??
          'Could not load seller profile (${response.statusCode})',
    );
  }

  Future<List<dynamic>> getBlockedUsers() async {
    final response = await ApiClient.get(
      Uri.parse(ApiConfig.blockedUsersUrl),
    ).timeout(const Duration(seconds: 15));
    final body = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode == 200) {
      final data = body['data'];
      return data is List ? data : [];
    }
    throw Exception(
      body['message'] ??
          'Could not load blocked users (${response.statusCode})',
    );
  }

  Future<bool> blockUser(String userId) async {
    final response = await ApiClient.post(
      Uri.parse(ApiConfig.chatBlockUrl(userId)),
    ).timeout(const Duration(seconds: 15));
    return response.statusCode == 200 || response.statusCode == 201;
  }

  Future<bool> unblockUser(String userId) async {
    final response = await ApiClient.delete(
      Uri.parse(ApiConfig.chatBlockUrl(userId)),
    ).timeout(const Duration(seconds: 15));
    return response.statusCode == 200;
  }
}
