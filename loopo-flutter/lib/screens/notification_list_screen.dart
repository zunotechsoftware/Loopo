import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import 'notification_screen.dart';

// TODO: [Backend Integration] Connect to Notification WebSocket / Server-Sent Events (SSE) for real-time notification pushes.
// TODO: [Backend Integration] Fetch paginated notification list from GET /api/v1/notifications?page=1&limit=20.
// TODO: [Backend Integration] Call PATCH /api/v1/notifications/:id/read to update notification read status on DB.
// TODO: [Backend Integration] Call DELETE /api/v1/notifications/clear-all to clear user notifications.

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
  // Mock notifications for demonstration
  final List<NotificationItem> _notifications = [
    NotificationItem(
      id: '1',
      title: 'Price Drop Alert! 📉',
      message: 'iPhone 14 Pro Max in Koramangala is now available for ₹75,000 (was ₹78,500).',
      time: '10m ago',
      icon: Icons.local_offer_rounded,
      iconColor: AppColors.appGreen,
      isRead: false,
      type: 'PROMO',
    ),
    NotificationItem(
      id: '2',
      title: 'New Message from Alex 💬',
      message: '"Is the Royal Enfield Classic 350 still available for test ride?"',
      time: '45m ago',
      icon: Icons.chat_bubble_rounded,
      iconColor: AppColors.appBlue,
      isRead: false,
      type: 'CHAT',
    ),
    NotificationItem(
      id: '3',
      title: 'Order Shipped 📦',
      message: 'Your order #LP-88421 for Sony Headphones has been dispatched.',
      time: '2h ago',
      icon: Icons.local_shipping_rounded,
      iconColor: const Color(0xFFAB47BC),
      isRead: true,
      type: 'ORDER',
    ),
    NotificationItem(
      id: '4',
      title: 'Security Alert 🔒',
      message: 'Successful login detected from Android Emulator (Bangalore, IN).',
      time: '5h ago',
      icon: Icons.security_rounded,
      iconColor: const Color(0xFFEF5350),
      isRead: true,
      type: 'SECURITY',
    ),
    NotificationItem(
      id: '5',
      title: 'Listing Approved ✅',
      message: 'Your listing "L-Shape Sofa Set" is now live and visible to buyers near you.',
      time: '1d ago',
      icon: Icons.check_circle_rounded,
      iconColor: AppColors.appGreen,
      isRead: true,
      type: 'LISTING',
    ),
  ];

  void _markAllAsRead() {
    // TODO: [Backend Integration] Call PATCH /api/v1/notifications/mark-all-read
    setState(() {
      for (var n in _notifications) {
        n.isRead = true;
      }
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('All notifications marked as read'),
        backgroundColor: AppColors.appGreen,
      ),
    );
  }

  void _clearAll() {
    // TODO: [Backend Integration] Call DELETE /api/v1/notifications
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
      body: _notifications.isEmpty
          ? _buildEmptyState()
          : ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: _notifications.length,
              separatorBuilder: (_, _) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final item = _notifications[index];
                return _buildNotificationCard(item);
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
