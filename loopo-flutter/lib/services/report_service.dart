import 'dart:convert';
import '../config/api_config.dart';
import 'api_client.dart';

class ReportService {
  /// Submit a report against a product listing or user.
  ///
  /// [targetId] - ID of the listing or user being reported
  /// [targetType] - 'LISTING' or 'USER' (the real backend's
  ///   ReportTargetTypeDto enum - not 'PRODUCT', which doesn't exist there)
  /// [reasonCode] - reason code (e.g. 'SPAM', 'FRAUD', 'INAPPROPRIATE')
  /// [details] - required detailed description from the reporter
  Future<bool> submitReport({
    required String targetId,
    required String targetType,
    required String reasonCode,
    required String details,
  }) async {
    final response = await ApiClient.post(
      Uri.parse(ApiConfig.reportsUrl),
      body: jsonEncode({
        'targetId': targetId,
        'targetType': targetType,
        'reasonCode': reasonCode,
        'details': details,
      }),
    ).timeout(const Duration(seconds: 15));

    if (response.statusCode == 200 || response.statusCode == 201) {
      return true;
    }
    final body = jsonDecode(response.body) as Map<String, dynamic>;
    throw Exception(
      body['message'] ?? 'Could not submit report (${response.statusCode})',
    );
  }
}
