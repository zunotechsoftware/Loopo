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
          if (token != null) {
            AuthSession.setToken(token.toString());
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
          if (token != null) {
            AuthSession.setToken(token.toString());
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

  /// Hybrid Mobile OTP login flow helper.
  /// Authenticates deterministically against standard NestJS local login/register endpoints.
  Future<Map<String, dynamic>> loginOrRegisterPhone({
    required String phone,
  }) async {
    final email = '$phone@loopo.com';
    const password = 'LoopoPhone@123';

    try {
      // Attempt login
      return await login(email: email, password: password);
    } catch (_) {
      // If login fails (user does not exist), register the user first
      try {
        await register(
          firstName: 'Phone',
          lastName: 'User',
          email: email,
          password: password,
          phone: phone,
        );
      } catch (regError) {
        // Fallthrough if conflict/already exists but login failed for another reason
        // print('Deterministic signup error (might already exist): $regError');
      }
      // Retry login
      return await login(email: email, password: password);
    }
  }
}
