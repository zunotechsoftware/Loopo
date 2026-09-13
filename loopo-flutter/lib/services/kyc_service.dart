import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import 'auth_session.dart';

class KycService {
  Map<String, String> get _authHeaders => {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        if (AuthSession.isLoggedIn) 'Authorization': 'Bearer ${AuthSession.token}',
      };

  /// Requests a signed S3 upload URL for one KYC document image, uploads the
  /// file directly to it, and returns the resulting MediaFile id (what
  /// submitKyc's frontImageId/backImageId/selfieImageId expect).
  ///
  /// [slot] must be 'FRONT', 'BACK', or 'SELFIE'.
  Future<String> uploadDocumentImage({
    required File file,
    required String slot,
  }) async {
    final fileName = file.path.split(Platform.pathSeparator).last;
    final ext = fileName.contains('.') ? fileName.split('.').last.toLowerCase() : 'jpg';
    final mimeType = switch (ext) {
      'png' => 'image/png',
      'webp' => 'image/webp',
      _ => 'image/jpeg',
    };
    final bytes = await file.readAsBytes();

    final upResponse = await http
        .post(
          Uri.parse(ApiConfig.kycUploadUrlUrl),
          headers: _authHeaders,
          body: jsonEncode({
            'slot': slot,
            'fileName': fileName,
            'fileType': mimeType,
            'fileSize': bytes.length,
          }),
        )
        .timeout(const Duration(seconds: 20));

    final upBody = jsonDecode(upResponse.body) as Map<String, dynamic>;
    if (upResponse.statusCode != 200 && upResponse.statusCode != 201) {
      throw Exception(upBody['message'] ?? 'Could not get an upload URL for $slot (${upResponse.statusCode})');
    }
    final data = upBody['data'] as Map<String, dynamic>;
    final uploadUrl = data['uploadUrl'] as String;
    final mediaId = data['mediaId'] as String;

    // Straight to S3/MinIO - must not carry our Bearer token or a JSON
    // content-type, this is a different origin than our backend.
    final putResponse = await http
        .put(Uri.parse(uploadUrl), headers: {'Content-Type': mimeType}, body: bytes)
        .timeout(const Duration(seconds: 30));
    if (putResponse.statusCode != 200) {
      throw Exception('Failed to upload $slot image to storage (${putResponse.statusCode})');
    }

    return mediaId;
  }

  /// Submits (or updates, if [isUpdate]) the current user's KYC application.
  /// All three images must already be uploaded via [uploadDocumentImage].
  Future<Map<String, dynamic>> submitKyc({
    required String documentType,
    required String documentNumber,
    required String frontImageId,
    required String selfieImageId,
    String? backImageId,
    bool isUpdate = false,
  }) async {
    final payload = <String, dynamic>{
      'documentType': documentType,
      'documentNumber': documentNumber,
      'frontImageId': frontImageId,
      'selfieImageId': selfieImageId,
      if (backImageId != null) 'backImageId': backImageId,
      'submit': true,
    };

    final response = await (isUpdate
            ? http.put(Uri.parse(ApiConfig.kycUrl), headers: _authHeaders, body: jsonEncode(payload))
            : http.post(Uri.parse(ApiConfig.kycUrl), headers: _authHeaders, body: jsonEncode(payload)))
        .timeout(const Duration(seconds: 20));

    final body = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode == 200 || response.statusCode == 201) {
      return body['data'] as Map<String, dynamic>;
    }
    throw Exception(body['message'] ?? 'KYC submission failed (${response.statusCode})');
  }

  /// Fetches the current user's latest KYC application, if any.
  /// Returns null if none exists yet (404).
  Future<Map<String, dynamic>?> getMyKyc() async {
    final response = await http.get(Uri.parse(ApiConfig.kycMeUrl), headers: _authHeaders).timeout(const Duration(seconds: 15));
    if (response.statusCode == 404) return null;
    final body = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode == 200) {
      return body['data'] as Map<String, dynamic>;
    }
    throw Exception(body['message'] ?? 'Could not load KYC status (${response.statusCode})');
  }
}
