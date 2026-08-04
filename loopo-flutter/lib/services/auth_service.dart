// lib/services/auth_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';

class AuthService {
  Future<Map<String, dynamic>> register({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
    String? phone,
  }) async {
    final response = await http.post(
      Uri.parse(ApiConfig.registerUrl),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'firstName': firstName,
        'lastName': lastName,
        'email': email,
        'password': password,
        'phone': phone,
      }),
    );

    final responseData = jsonDecode(response.body);

    if (response.statusCode == 200 || response.statusCode == 201) {
      return responseData;
    } else {
      throw Exception(responseData['message'] ?? 'Registration failed');
    }
  }

  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final response = await http.post(
      Uri.parse(ApiConfig.loginUrl),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        'password': password,
      }),
    );

    final responseData = jsonDecode(response.body);

    if (response.statusCode == 200 || response.statusCode == 201) {
      return responseData;
    } else {
      throw Exception(responseData['message'] ?? 'Login failed');
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
