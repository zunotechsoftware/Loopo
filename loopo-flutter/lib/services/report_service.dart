import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import 'auth_session.dart';

class ReportService {
  Map<String, String> get _authHeaders => {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        if (AuthSession.isLoggedIn) 'Authorization': 'Bearer ${AuthSession.token}',
      };

  /// Submit a report against a product listing or user.
  ///
  /// [targetId] — ID of the product or user being reported
  /// [targetType] — 'PRODUCT' or 'USER'
  /// [reason] — reason code (e.g. 'SPAM', 'FRAUD', 'INAPPROPRIATE')
  /// [details] — optional additional description from the reporter
  Future<bool> submitReport({
    required String targetId,
    required String targetType,
    required String reason,
    String? details,
  }) async {
    try {
      final response = await http
          .post(
            Uri.parse(ApiConfig.reportsUrl),
            headers: _authHeaders,
            body: jsonEncode({
              'targetId': targetId,
              'targetType': targetType,
              'reason': reason,
              if (details != null && details.isNotEmpty) 'details': details,
            }),
          )
          .timeout(const Duration(seconds: 15));

      return response.statusCode == 200 || response.statusCode == 201;
    } catch (_) {
      return false;
    }
  }
}
