import 'dart:convert';
import '../config/api_config.dart';
import 'api_client.dart';

/// Real bargain-offer backend, added alongside the notification system -
/// the "Offers" screen previously showed two hardcoded lists with no
/// backend feature behind them at all.
class OfferService {
  Future<Map<String, dynamic>> makeOffer({
    required String productId,
    required double amount,
    String? message,
  }) async {
    final response = await ApiClient.post(
      Uri.parse(ApiConfig.offersUrl),
      body: jsonEncode({
        'productId': productId,
        'amount': amount,
        if (message != null && message.isNotEmpty) 'message': message,
      }),
    ).timeout(const Duration(seconds: 15));

    final body = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode == 200 || response.statusCode == 201) {
      return body['data'] as Map<String, dynamic>;
    }
    throw Exception(
      body['message'] ?? 'Could not send offer (${response.statusCode})',
    );
  }

  Future<List<dynamic>> getMadeOffers() async {
    final response = await ApiClient.get(
      Uri.parse(ApiConfig.madeOffersUrl),
    ).timeout(const Duration(seconds: 15));
    final body = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode == 200) {
      final data = body['data'];
      return data is List ? data : [];
    }
    throw Exception(
      body['message'] ?? 'Could not load your offers (${response.statusCode})',
    );
  }

  Future<List<dynamic>> getReceivedOffers() async {
    final response = await ApiClient.get(
      Uri.parse(ApiConfig.receivedOffersUrl),
    ).timeout(const Duration(seconds: 15));
    final body = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode == 200) {
      final data = body['data'];
      return data is List ? data : [];
    }
    throw Exception(
      body['message'] ??
          'Could not load received offers (${response.statusCode})',
    );
  }

  Future<void> acceptOffer(String id) async {
    final response = await ApiClient.patch(
      Uri.parse(ApiConfig.offerAcceptUrl(id)),
    ).timeout(const Duration(seconds: 15));
    if (response.statusCode != 200) {
      final body = jsonDecode(response.body) as Map<String, dynamic>;
      throw Exception(
        body['message'] ?? 'Could not accept offer (${response.statusCode})',
      );
    }
  }

  Future<void> rejectOffer(String id) async {
    final response = await ApiClient.patch(
      Uri.parse(ApiConfig.offerRejectUrl(id)),
    ).timeout(const Duration(seconds: 15));
    if (response.statusCode != 200) {
      final body = jsonDecode(response.body) as Map<String, dynamic>;
      throw Exception(
        body['message'] ?? 'Could not decline offer (${response.statusCode})',
      );
    }
  }

  Future<void> withdrawOffer(String id) async {
    final response = await ApiClient.patch(
      Uri.parse(ApiConfig.offerWithdrawUrl(id)),
    ).timeout(const Duration(seconds: 15));
    if (response.statusCode != 200) {
      final body = jsonDecode(response.body) as Map<String, dynamic>;
      throw Exception(
        body['message'] ?? 'Could not withdraw offer (${response.statusCode})',
      );
    }
  }
}
