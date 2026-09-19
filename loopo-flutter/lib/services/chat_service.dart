import 'dart:convert';
import '../config/api_config.dart';
import 'api_client.dart';

class ChatService {
  /// Fetch all chat conversations for the current user.
  /// Optionally filter by [type]: 'buying' or 'selling'.
  Future<List<dynamic>> getConversations({String? type}) async {
    try {
      final queryParams = <String, String>{};
      if (type != null && type.isNotEmpty) queryParams['type'] = type;

      final uri = Uri.parse(
        ApiConfig.chatConversationsUrl,
      ).replace(queryParameters: queryParams.isNotEmpty ? queryParams : null);

      final response = await ApiClient.get(
        uri,
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        final data = body['data'];
        if (data is Map && data.containsKey('items'))
          return data['items'] ?? [];
        return data is List ? data : [];
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  /// Fetch messages for a specific conversation.
  Future<List<dynamic>> getMessages(
    String conversationId, {
    int page = 1,
    int limit = 50,
  }) async {
    try {
      final uri = Uri.parse(ApiConfig.chatMessagesUrl).replace(
        queryParameters: {
          'conversationId': conversationId,
          'page': page.toString(),
          'limit': limit.toString(),
        },
      );

      final response = await ApiClient.get(
        uri,
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        final data = body['data'];
        if (data is Map && data.containsKey('items'))
          return data['items'] ?? [];
        return data is List ? data : [];
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  /// Send a new message in a conversation.
  Future<Map<String, dynamic>?> sendMessage({
    required String conversationId,
    required String content,
    String type = 'TEXT',
  }) async {
    try {
      final response = await ApiClient.post(
        Uri.parse(ApiConfig.chatMessagesUrl),
        body: jsonEncode({
          'conversationId': conversationId,
          'content': content,
          'type': type,
        }),
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200 || response.statusCode == 201) {
        final body = jsonDecode(response.body);
        return body['data'] as Map<String, dynamic>?;
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  /// Start a new conversation for a given listing (product).
  Future<Map<String, dynamic>?> startConversation({
    required String productId,
    required String initialMessage,
  }) async {
    try {
      final response = await ApiClient.post(
        Uri.parse(ApiConfig.chatConversationsUrl),
        body: jsonEncode({
          'productId': productId,
          'initialMessage': initialMessage,
        }),
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200 || response.statusCode == 201) {
        final body = jsonDecode(response.body);
        return body['data'] as Map<String, dynamic>?;
      }
      return null;
    } catch (_) {
      return null;
    }
  }
}
