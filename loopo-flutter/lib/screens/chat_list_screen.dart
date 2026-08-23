import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../services/chat_service.dart';
import 'chat_conversation_screen.dart';

class ChatListScreen extends StatefulWidget {
  const ChatListScreen({super.key});

  @override
  State<ChatListScreen> createState() => _ChatListScreenState();
}

class _ChatListScreenState extends State<ChatListScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final TextEditingController _searchController = TextEditingController();
  final ChatService _chatService = ChatService();
  List<Map<String, dynamic>> _allChats = [];
  bool _isLoading = true;
  String _searchQuery = '';




  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadConversations();
  }

  Future<void> _loadConversations() async {
    setState(() => _isLoading = true);
    try {
      final convs = await _chatService.getConversations();
      setState(() {
        _allChats = convs.map<Map<String, dynamic>>((c) {
          final other = c['buyer'] ?? c['seller'] ?? c['otherUser'] ?? {};
          final product = c['product'] ?? c['listing'] ?? {};
          final otherName = other['firstName'] != null
              ? '${other['firstName']} ${other['lastName'] ?? ''}'
              : other['name'] ?? 'User';
          return {
            'id': c['id']?.toString() ?? '',
            'sellerName': otherName.trim(),
            'sellerAvatar': otherName.isNotEmpty ? otherName[0].toUpperCase() : '?',
            'isVerified': other['isEmailVerified'] == true || other['isKycVerified'] == true,
            'itemTitle': product['title'] ?? c['productTitle'] ?? 'Item',
            'itemPrice': product['price'] != null ? '₹${product['price']}' : '',
            'itemImage': 'assets/images/loopo.png',
            'lastMessage': c['lastMessage'] ?? '',
            'lastTime': c['updatedAt'] != null
                ? _formatTime(DateTime.tryParse(c['updatedAt']))
                : '',
            'unreadCount': c['unreadCount'] ?? 0,
            'type': (c['type'] ?? 'BUYING').toString().toUpperCase(),
            'status': 'ACTIVE',
          };
        }).toList();
        _isLoading = false;
      });
    } catch (_) {
      setState(() => _isLoading = false);
    }
  }

  String _formatTime(DateTime? dt) {
    if (dt == null) return '';
    final diff = DateTime.now().difference(dt);
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return 'Today';
    if (diff.inDays == 1) return 'Yesterday';
    return '${dt.day} ${_monthName(dt.month)}';
  }

  String _monthName(int m) {
    const months = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return months[m];
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  List<Map<String, dynamic>> _filteredChats(String filter) {
    return _allChats.where((chat) {
      final matchesFilter = filter == 'ALL' ||
          (filter == 'BUYING' && chat['type'] == 'BUYING') ||
          (filter == 'SELLING' && chat['type'] == 'SELLING');

      final matchesQuery = _searchQuery.isEmpty ||
          chat['sellerName'].toString().toLowerCase().contains(_searchQuery.toLowerCase()) ||
          chat['itemTitle'].toString().toLowerCase().contains(_searchQuery.toLowerCase());

      return matchesFilter && matchesQuery;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 1,
        automaticallyImplyLeading: false,
        title: const Text(
          'Chats & Messages',
          style: TextStyle(
            color: AppColors.appDark,
            fontFamily: 'Poppins',
            fontWeight: FontWeight.w800,
            fontSize: 20,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.more_vert_rounded, color: AppColors.appDark),
            onPressed: () {},
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(105),
          child: Column(
            children: [
              // Search Bar
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                child: Container(
                  height: 42,
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: TextField(
                    controller: _searchController,
                    onChanged: (val) => setState(() => _searchQuery = val.trim()),
                    style: const TextStyle(fontFamily: 'Poppins', fontSize: 13),
                    decoration: InputDecoration(
                      hintText: 'Search chats or items...',
                      hintStyle: TextStyle(
                        fontFamily: 'Poppins',
                        fontSize: 13,
                        color: Colors.grey.shade400,
                      ),
                      prefixIcon: Icon(Icons.search_rounded, size: 20, color: Colors.grey.shade500),
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(vertical: 10),
                    ),
                  ),
                ),
              ),
              TabBar(
                controller: _tabController,
                labelColor: AppColors.appGreen,
                unselectedLabelColor: Colors.grey.shade600,
                indicatorColor: AppColors.appGreen,
                indicatorWeight: 3,
                labelStyle: const TextStyle(
                  fontFamily: 'Poppins',
                  fontWeight: FontWeight.w700,
                  fontSize: 13,
                ),
                unselectedLabelStyle: const TextStyle(
                  fontFamily: 'Poppins',
                  fontWeight: FontWeight.w500,
                  fontSize: 13,
                ),
                tabs: const [
                  Tab(text: 'All Messages'),
                  Tab(text: 'Buying'),
                  Tab(text: 'Selling'),
                ],
              ),
            ],
          ),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : TabBarView(
              controller: _tabController,
              children: [
                _buildChatList('ALL'),
                _buildChatList('BUYING'),
                _buildChatList('SELLING'),
              ],
            ),
    );
  }

  Widget _buildChatList(String filter) {
    final list = _filteredChats(filter);

    if (list.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 70,
              height: 70,
              decoration: BoxDecoration(
                color: AppColors.appGreen.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.chat_bubble_outline_rounded, size: 36, color: AppColors.appGreen),
            ),
            const SizedBox(height: 14),
            const Text(
              'No conversations found',
              style: TextStyle(
                fontFamily: 'Poppins',
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: AppColors.appDark,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'When you message sellers or receive offers, your chats appear here.',
              textAlign: TextAlign.center,
              style: TextStyle(fontFamily: 'Poppins', fontSize: 12, color: Colors.grey.shade500),
            ),
          ],
        ),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.symmetric(vertical: 8),
      itemCount: list.length,
      separatorBuilder: (context, index) => const Divider(height: 1, color: Color(0xFFF1F5F9), indent: 70),
      itemBuilder: (context, index) {
        final chat = list[index];
        final bool hasUnread = (chat['unreadCount'] as int? ?? 0) > 0;

        return InkWell(
          onTap: () {
            setState(() {
              chat['unreadCount'] = 0;
            });
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => ChatConversationScreen(chatData: chat),
              ),
            );
          },
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Seller Avatar
                Stack(
                  children: [
                    CircleAvatar(
                      radius: 24,
                      backgroundColor: AppColors.appGreen.withValues(alpha: 0.15),
                      child: Text(
                        chat['sellerAvatar'].toString(),
                        style: const TextStyle(
                          fontFamily: 'Poppins',
                          fontWeight: FontWeight.bold,
                          color: AppColors.appGreen,
                          fontSize: 15,
                        ),
                      ),
                    ),
                    if (chat['isVerified'] == true)
                      Positioned(
                        right: 0,
                        bottom: 0,
                        child: Container(
                          padding: const EdgeInsets.all(2),
                          decoration: const BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.verified, size: 14, color: AppColors.appBlue),
                        ),
                      ),
                  ],
                ),
                const SizedBox(width: 12),

                // Chat Details
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              chat['sellerName'].toString(),
                              style: TextStyle(
                                fontFamily: 'Poppins',
                                fontSize: 14,
                                fontWeight: hasUnread ? FontWeight.w800 : FontWeight.w600,
                                color: AppColors.appDark,
                              ),
                            ),
                          ),
                          Text(
                            chat['lastTime'].toString(),
                            style: TextStyle(
                              fontFamily: 'Poppins',
                              fontSize: 11,
                              color: hasUnread ? AppColors.appGreen : Colors.grey.shade500,
                              fontWeight: hasUnread ? FontWeight.bold : FontWeight.normal,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 2),

                      // Item Title Tag
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF1F5F9),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              chat['itemPrice'].toString(),
                              style: const TextStyle(
                                fontFamily: 'Poppins',
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: AppColors.appGreen,
                              ),
                            ),
                          ),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              chat['itemTitle'].toString(),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontFamily: 'Poppins',
                                fontSize: 11,
                                color: Colors.grey.shade700,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),

                      // Last Message
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              chat['lastMessage'].toString(),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontFamily: 'Poppins',
                                fontSize: 12,
                                color: hasUnread ? AppColors.appDark : Colors.grey.shade600,
                                fontWeight: hasUnread ? FontWeight.w700 : FontWeight.normal,
                              ),
                            ),
                          ),
                          if (hasUnread) ...[
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.all(6),
                              decoration: const BoxDecoration(
                                color: AppColors.appGreen,
                                shape: BoxShape.circle,
                              ),
                              child: Text(
                                '${chat['unreadCount']}',
                                style: const TextStyle(
                                  fontFamily: 'Poppins',
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
