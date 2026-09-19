import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import 'auth_session.dart';

class AuthService {
  String _parseError(Map<String, dynamic> data, String fallback) {
    final msg = data['message'];
    if (msg is List) {
      return msg.join('\n');
    }
    return msg?.toString() ?? fallback;
  }

  Future<Map<String, dynamic>> register({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
    String? phone,
  }) async {
    try {
      final response = await http
          .post(
            Uri.parse(ApiConfig.registerUrl),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({
              'firstName': firstName,
              'lastName': lastName,
              'email': email,
              'password': password,
              'phone': phone,
            }),
          )
          .timeout(const Duration(seconds: 25));

      final responseData = jsonDecode(response.body) as Map<String, dynamic>;

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = responseData['data'];
        if (data is Map) {
          final tokens = data['tokens'];
          final token = (tokens is Map ? tokens['accessToken'] : null) ??
              data['accessToken'] ??
              data['token'];
          final refreshToken = (tokens is Map ? tokens['refreshToken'] : null) ?? data['refreshToken'];
          if (token != null) {
            AuthSession.setTokens(
              accessToken: token.toString(),
              refreshToken: refreshToken?.toString(),
            );
          }
        }
        return responseData;
      } else {
        throw Exception(_parseError(responseData, 'Registration failed (${response.statusCode})'));
      }
    } catch (e) {
      if (e.toString().contains('TimeoutException')) {
        throw Exception('Server is taking too long to respond. Please try again.');
      }
      rethrow;
    }
  }

  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await http
          .post(
            Uri.parse(ApiConfig.loginUrl),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({
              'email': email,
              'password': password,
            }),
          )
          .timeout(const Duration(seconds: 25));

      final responseData = jsonDecode(response.body) as Map<String, dynamic>;

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = responseData['data'];
        if (data is Map) {
          final tokens = data['tokens'];
          final token = (tokens is Map ? tokens['accessToken'] : null) ??
              data['accessToken'] ??
              data['token'];
          final refreshToken = (tokens is Map ? tokens['refreshToken'] : null) ?? data['refreshToken'];
          if (token != null) {
            AuthSession.setTokens(
              accessToken: token.toString(),
              refreshToken: refreshToken?.toString(),
            );
          }
        }
        return responseData;
      } else {
        throw Exception(_parseError(responseData, 'Login failed (${response.statusCode})'));
      }
    } catch (e) {
      if (e.toString().contains('TimeoutException')) {
        throw Exception('Server connection timed out. Please try again.');
      }
      rethrow;
    }
  }

  Future<Map<String, dynamic>> forgotPassword({
    required String email,
  }) async {
    final response = await http.post(
      Uri.parse(ApiConfig.forgotPasswordUrl),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
      }),
    );

    final responseData = jsonDecode(response.body);

    if (response.statusCode == 200 || response.statusCode == 201) {
      return responseData;
    } else {
      throw Exception(responseData['message'] ?? 'Forgot password request failed');
    }
  }

  Future<Map<String, dynamic>> resetPassword({
    required String token,
    required String password,
  }) async {
    final response = await http.post(
      Uri.parse(ApiConfig.resetPasswordUrl),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'token': token,
        'password': password,
      }),
    );

    final responseData = jsonDecode(response.body);

    if (response.statusCode == 200 || response.statusCode == 201) {
      return responseData;
    } else {
      throw Exception(responseData['message'] ?? 'Reset password failed');
    }
  }

  /// Requests a real login OTP for [phone] - the backend generates a
  /// genuine 6-digit code, hashes it, and queues it for SMS delivery
  /// (POST /auth/phone/send-otp). Logs in the existing account for this
  /// phone number on verify, or auto-registers a new one if none exists.
  Future<Map<String, dynamic>> sendPhoneLoginOtp({required String phone}) async {
    final response = await http
        .post(
          Uri.parse(ApiConfig.sendPhoneLoginOtpUrl),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({'phone': phone}),
        )
        .timeout(const Duration(seconds: 25));

    final responseData = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode == 200 || response.statusCode == 201) {
      return responseData;
    }
    throw Exception(_parseError(responseData, 'Could not send OTP (${response.statusCode})'));
  }

  /// Verifies the OTP sent by [sendPhoneLoginOtp] and returns real session
  /// tokens on success (POST /auth/phone/verify-otp) - no hardcoded code
  /// and no deterministic password shortcut.
  Future<Map<String, dynamic>> verifyPhoneLoginOtp({
    required String phone,
    required String otp,
  }) async {
    final response = await http
        .post(
          Uri.parse(ApiConfig.verifyPhoneLoginOtpUrl),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({'phone': phone, 'otp': otp}),
        )
        .timeout(const Duration(seconds: 25));

    final responseData = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode == 200 || response.statusCode == 201) {
      final data = responseData['data'];
      if (data is Map) {
        final token = data['accessToken'] ?? data['token'];
        if (token != null) {
          AuthSession.setTokens(
            accessToken: token.toString(),
            refreshToken: data['refreshToken']?.toString(),
          );
        }
      }
      return responseData;
    }
    throw Exception(_parseError(responseData, 'Invalid or expired OTP (${response.statusCode})'));
  }
}
