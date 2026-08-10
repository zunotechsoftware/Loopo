import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../config/debug_config.dart';
import 'auth_session.dart';

class UserService {
  Map<String, String> get _authHeaders => {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${AuthSession.token}',
      };

  static const Map<String, dynamic> _mockProfile = {
    'id': 'dev_user_123',
    'firstName': 'Demo',
    'lastName': 'User',
    'email': 'demo@loopo.com',
    'phone': '+91 9876543210',
    'status': 'ACTIVE',
    'isEmailVerified': true,
    'isPhoneVerified': true,
    'profile': {
      'displayName': 'DemoUser',
      'bio': 'Verified buyer & seller on Loopo',
      'city': 'Bangalore',
      'state': 'Karnataka',
      'country': 'India',
      'website': 'https://loopo.com',
    }
  };

  /// Fetch the current authenticated user + their profile.
  Future<Map<String, dynamic>> getMe() async {
    if (DebugConfig.isBypassAuth) {
      return Map<String, dynamic>.from(_mockProfile);
    }

    if (!AuthSession.isLoggedIn) {
      throw Exception('User is not logged in');
    }

    try {
      final response = await http.get(
        Uri.parse(ApiConfig.meUrl),
        headers: _authHeaders,
      ).timeout(const Duration(seconds: 15));

      final body = jsonDecode(response.body) as Map<String, dynamic>;
      if (response.statusCode == 200) {
        return body['data'] as Map<String, dynamic>;
      }
      return Map<String, dynamic>.from(_mockProfile);
    } catch (_) {
      return Map<String, dynamic>.from(_mockProfile);
    }
  }

  /// Update the current user's profile fields.
  Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> updates) async {
    if (DebugConfig.isBypassAuth) {
      return Map<String, dynamic>.from({
        ..._mockProfile,
        ...updates,
      });
    }

    try {
      final response = await http.put(
        Uri.parse(ApiConfig.updateProfileUrl),
        headers: _authHeaders,
        body: jsonEncode(updates),
      ).timeout(const Duration(seconds: 15));

      final body = jsonDecode(response.body) as Map<String, dynamic>;
      if (response.statusCode == 200) {
        return body['data'] as Map<String, dynamic>;
      }
      return Map<String, dynamic>.from({
        ..._mockProfile,
        ...updates,
      });
    } catch (_) {
      return Map<String, dynamic>.from({
        ..._mockProfile,
        ...updates,
      });
    }
  }
}
