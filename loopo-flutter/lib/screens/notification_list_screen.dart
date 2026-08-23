import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../services/notification_service.dart';
import 'notification_screen.dart';

class NotificationItem {
  final String id;
  final String title;
  final String message;
  final String time;
  final IconData icon;
  final Color iconColor;
  bool isRead;
  final String type;

  NotificationItem({
    required this.id,
    required this.title,
    required this.message,
    required this.time,
    required this.icon,
    required this.iconColor,
    this.isRead = false,
    required this.type,
  });
}

class NotificationsListScreen extends StatefulWidget {
  const NotificationsListScreen({super.key});

  @override
  State<NotificationsListScreen> createState() => _NotificationsListScreenState();
}

class _NotificationsListScreenState extends State<NotificationsListScreen> {
  final NotificationService _notificationService = NotificationService();
  List<NotificationItem> _notifications = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  Future<void> _loadNotifications() async {
    setState(() => _isLoading = true);
    try {
      final data = await _notificationService.getNotifications();
      final items = data['items'] as List? ?? [];
      setState(() {
        _notifications = items.map((n) {
          final type = (n['type'] as String? ?? '').toUpperCase();
          return NotificationItem(
            id: n['id']?.toString() ?? '',
            title: n['title'] ?? 'Notification',
            message: n['body'] ?? n['description'] ?? '',
            time: n['createdAt'] != null
                ? _formatTime(DateTime.tryParse(n['createdAt']))
                : 'Recently',
            icon: _iconForType(type),
            iconColor: _colorForType(type),
            isRead: n['isRead'] == true,
            type: type,
          );
        }).toList();
        _isLoading = false;
      });
    } catch (_) {
      setState(() => _isLoading = false);
    }
  }

  String _formatTime(DateTime? dt) {
    if (dt == null) return 'Recently';
    final diff = DateTime.now().difference(dt);
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    return '${diff.inDays}d ago';
  }

  IconData _iconForType(String type) {
    switch (type) {
      case 'CHAT': return Icons.chat_bubble_rounded;
      case 'ORDER': return Icons.local_shipping_rounded;
      case 'PROMO': return Icons.local_offer_rounded;
      case 'SECURITY': return Icons.security_rounded;
      default: return Icons.notifications_rounded;
    }
  }

  Color _colorForType(String type) {
    switch (type) {
      case 'CHAT': return AppColors.appBlue;
      case 'ORDER': return const Color(0xFFAB47BC);
      case 'PROMO': return AppColors.appGreen;
      case 'SECURITY': return const Color(0xFFEF5350);
      default: return AppColors.appGreen;
    }
  }

  void _markAsRead(String id) {
    setState(() {
      final idx = _notifications.indexWhere((n) => n.id == id);
      if (idx != -1) _notifications[idx].isRead = true;
    });
    _notificationService.markRead(id);
  }
  void _markAllAsRead() {
    setState(() {
      for (var n in _notifications) {
        n.isRead = true;
      }
    });
    _notificationService.markAllRead();
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('All notifications marked as read'),
        backgroundColor: AppColors.appGreen,
      ),
    );
  }

  void _clearAll() {
    setState(() {
      _notifications.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    final unreadCount = _notifications.where((n) => !n.isRead).length;

    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      appBar: AppBar(
        backgroundColor: AppColors.appDark,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white, size: 18),
          onPressed: () => Navigator.pop(context),
        ),
        title: Row(
          children: [
            const Text(
              'Notifications',
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 18,
              ),
            ),
            if (unreadCount > 0) ...[
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.appGreen,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '$unreadCount new',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ],
        ),
        actions: [
          // Settings button to navigate to notification preferences
          IconButton(
            icon: const Icon(Icons.tune_rounded, color: Colors.white),
            tooltip: 'Notification Settings',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const NotificationScreen()),
              );
            },
          ),
          PopupMenuButton<String>(
            icon: const Icon(Icons.more_vert_rounded, color: Colors.white),
            onSelected: (val) {
              if (val == 'read_all') _markAllAsRead();
              if (val == 'clear_all') _clearAll();
            },
            itemBuilder: (ctx) => [
              const PopupMenuItem(
                value: 'read_all',
                child: Row(
                  children: [
                    Icon(Icons.done_all_rounded, size: 18, color: AppColors.appGreen),
                    SizedBox(width: 8),
                    Text('Mark all as read'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'clear_all',
                child: Row(
                  children: [
                    Icon(Icons.delete_outline_rounded, size: 18, color: Colors.red),
                    SizedBox(width: 8),
                    Text('Clear all'),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _notifications.isEmpty
              ? _buildEmptyState()
              : ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: _notifications.length,
                  separatorBuilder: (_, _) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final item = _notifications[index];
                    return GestureDetector(
                      onTap: () => _markAsRead(item.id),
                      child: _buildNotificationCard(item),
                    );
                  },
                ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 16,
                ),
              ],
            ),
            child: const Icon(
              Icons.notifications_off_outlined,
              size: 48,
              color: Colors.black38,
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'No notifications yet',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.appDark,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            "We'll notify you when something important arrives.",
            style: TextStyle(color: Colors.black45, fontSize: 13),
          ),
        ],
      ),
    );
  }

  Widget _buildNotificationCard(NotificationItem item) {
    return GestureDetector(
      onTap: () {
        // TODO: [Backend Integration] Mark individual notification as read on tap via API call
        setState(() {
          item.isRead = true;
        });
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: item.isRead ? Colors.white : const Color(0xFFF0FDF4), // soft green tint for unread
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: item.isRead ? Colors.grey.shade200 : AppColors.appGreen.withValues(alpha: 0.3),
            width: item.isRead ? 1 : 1.5,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Category / Type Icon
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: item.iconColor.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(item.icon, color: item.iconColor, size: 22),
            ),
            const SizedBox(width: 14),
            // Text details
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          item.title,
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: item.isRead ? FontWeight.w600 : FontWeight.bold,
                            color: AppColors.appDark,
                          ),
                        ),
                      ),
                      Text(
                        item.time,
                        style: const TextStyle(fontSize: 11, color: Colors.black38),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    item.message,
                    style: TextStyle(
                      fontSize: 12,
                      color: item.isRead ? Colors.black54 : Colors.black87,
                      height: 1.4,
                    ),
                  ),
                ],
              ),
            ),
            if (!item.isRead) ...[
              const SizedBox(width: 8),
              Container(
                width: 8,
                height: 8,
                margin: const EdgeInsets.only(top: 6),
                decoration: const BoxDecoration(
                  color: AppColors.appGreen,
                  shape: BoxShape.circle,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
