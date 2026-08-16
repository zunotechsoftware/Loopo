import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import 'auth_session.dart';

class KycService {
  Map<String, String> get _authHeaders => {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        if (AuthSession.isLoggedIn) 'Authorization': 'Bearer ${AuthSession.token}',
      };

  /// Submit KYC verification documents.
  ///
  /// [docType] — document type e.g. 'AADHAAR', 'PAN', 'PASSPORT'
  /// [docNumber] — the document number
  /// [frontPhotoBase64] — optional base64-encoded front-side image
  /// [backPhotoBase64] — optional base64-encoded back-side image
  Future<Map<String, dynamic>> verifyKyc({
    required String docType,
    required String docNumber,
    String? frontPhotoBase64,
    String? backPhotoBase64,
  }) async {
    try {
      final payload = <String, dynamic>{
        'docType': docType,
        'docNumber': docNumber,
      };
      if (frontPhotoBase64 != null && frontPhotoBase64.isNotEmpty) {
        payload['frontPhoto'] = frontPhotoBase64;
      }
      if (backPhotoBase64 != null && backPhotoBase64.isNotEmpty) {
        payload['backPhoto'] = backPhotoBase64;
      }

      final response = await http
          .post(
            Uri.parse(ApiConfig.kycVerifyUrl),
            headers: _authHeaders,
            body: jsonEncode(payload),
          )
          .timeout(const Duration(seconds: 30));

      final body = jsonDecode(response.body) as Map<String, dynamic>;
      if (response.statusCode == 200 || response.statusCode == 201) {
        return body;
      }
      throw Exception(body['message'] ?? 'KYC verification failed (${response.statusCode})');
    } catch (e) {
      rethrow;
    }
  }
}
