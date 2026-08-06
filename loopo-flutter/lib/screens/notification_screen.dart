import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../config/debug_config.dart';
import '../config/api_config.dart';
import '../services/auth_session.dart';
import '../theme/app_colors.dart';

// ─── Model ────────────────────────────────────────────────────────────────────

class NotificationSettings {
  bool emailNotifications;
  bool smsNotifications;
  bool pushNotifications;
  bool marketingEmails;
  bool chatNotifications;
  bool orderNotifications;
  bool listingNotifications;
  bool securityAlerts;
  bool newsletter;

  NotificationSettings({
    this.emailNotifications = true,
    this.smsNotifications = true,
    this.pushNotifications = true,
    this.marketingEmails = false,
    this.chatNotifications = true,
    this.orderNotifications = true,
    this.listingNotifications = true,
    this.securityAlerts = true,
    this.newsletter = false,
  });

  factory NotificationSettings.fromJson(Map<String, dynamic> json) =>
      NotificationSettings(
        emailNotifications: json['emailNotifications'] ?? true,
        smsNotifications: json['smsNotifications'] ?? true,
        pushNotifications: json['pushNotifications'] ?? true,
        marketingEmails: json['marketingEmails'] ?? false,
        chatNotifications: json['chatNotifications'] ?? true,
        orderNotifications: json['orderNotifications'] ?? true,
        listingNotifications: json['listingNotifications'] ?? true,
        securityAlerts: json['securityAlerts'] ?? true,
        newsletter: json['newsletter'] ?? false,
      );

  Map<String, dynamic> toJson() => {
        'emailNotifications': emailNotifications,
        'smsNotifications': smsNotifications,
        'pushNotifications': pushNotifications,
        'marketingEmails': marketingEmails,
        'chatNotifications': chatNotifications,
        'orderNotifications': orderNotifications,
        'listingNotifications': listingNotifications,
        'securityAlerts': securityAlerts,
        'newsletter': newsletter,
      };
}

// ─── Screen ───────────────────────────────────────────────────────────────────

class NotificationScreen extends StatefulWidget {
  const NotificationScreen({super.key});

  @override
  State<NotificationScreen> createState() => _NotificationScreenState();
}

class _NotificationScreenState extends State<NotificationScreen> {
  NotificationSettings? _settings;
  bool _isLoading = true;
  bool _isSaving = false;
  String? _error;

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${AuthSession.token}',
      };

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    if (DebugConfig.isActive) {
      setState(() {
        _settings = NotificationSettings();
        _isLoading = false;
      });
      return;
    }
    try {
      final res = await http.get(
        Uri.parse(ApiConfig.notificationSettingsUrl),
        headers: _headers,
      );
      final body = jsonDecode(res.body) as Map<String, dynamic>;
      if (res.statusCode == 200) {
        setState(() {
          _settings = NotificationSettings.fromJson(
              body['data'] as Map<String, dynamic>? ?? {});
        });
      } else {
        // Settings may not exist yet — use defaults
        setState(() => _settings = NotificationSettings());
      }
    } catch (_) {
      setState(() => _settings = NotificationSettings());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _save() async {
    if (_settings == null) return;
    if (DebugConfig.isActive) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Preferences saved'),
            backgroundColor: AppColors.appGreen,
          ),
        );
      }
      return;
    }
    setState(() => _isSaving = true);
    try {
      final res = await http.put(
        Uri.parse(ApiConfig.notificationSettingsUrl),
        headers: _headers,
        body: jsonEncode(_settings!.toJson()),
      );
      if (res.statusCode == 200) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Preferences saved'),
              backgroundColor: AppColors.appGreen,
            ),
          );
        }
      }
    } catch (_) {
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  void _toggle(void Function(bool) setter, bool value) {
    setState(() => setter(value));
    // Auto-save after each toggle
    Future.delayed(const Duration(milliseconds: 400), _save);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.appGrey,
      appBar: AppBar(
        backgroundColor: AppColors.appDark,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white, size: 18),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Notifications',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
        actions: [
          if (_isSaving)
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              child: SizedBox(
                width: 18,
                height: 18,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: Colors.white,
                ),
              ),
            ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.appGreen))
          : _settings == null
              ? _buildError()
              : _buildContent(),
    );
  }

  Widget _buildError() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.error_outline, size: 56, color: Colors.red),
          const SizedBox(height: 16),
          Text(_error ?? 'Failed to load', style: const TextStyle(color: Colors.red)),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: _load,
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.appGreen),
            child: const Text('Retry', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  Widget _buildContent() {
    final s = _settings!;
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Header illustration card
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [AppColors.appDark, Color(0xFF1a2744)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Stay in the loop',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Manage how and when Loopo reaches you.',
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.7),
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 16),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.notifications_active_outlined,
                    color: AppColors.appGreen, size: 32),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),

        _buildGroup(
          title: 'Channels',
          icon: Icons.cell_tower_outlined,
          tiles: [
            _buildTile(
              icon: Icons.email_outlined,
              iconColor: const Color(0xFF5C6BC0),
              title: 'Email Notifications',
              subtitle: 'Receive updates to your inbox',
              value: s.emailNotifications,
              onChanged: (v) => _toggle((nv) => _settings!.emailNotifications = nv, v),
            ),
            _buildTile(
              icon: Icons.sms_outlined,
              iconColor: const Color(0xFF26A69A),
              title: 'SMS Notifications',
              subtitle: 'Text messages for important alerts',
              value: s.smsNotifications,
              onChanged: (v) => _toggle((nv) => _settings!.smsNotifications = nv, v),
            ),
            _buildTile(
              icon: Icons.phone_android_outlined,
              iconColor: const Color(0xFFEF5350),
              title: 'Push Notifications',
              subtitle: 'Real-time alerts on your device',
              value: s.pushNotifications,
              onChanged: (v) => _toggle((nv) => _settings!.pushNotifications = nv, v),
              isLast: true,
            ),
          ],
        ),
        const SizedBox(height: 16),

        _buildGroup(
          title: 'Activity',
          icon: Icons.local_activity_outlined,
          tiles: [
            _buildTile(
              icon: Icons.chat_bubble_outline_rounded,
              iconColor: const Color(0xFFFF8A65),
              title: 'Chat Messages',
              subtitle: 'When someone messages you',
              value: s.chatNotifications,
              onChanged: (v) => _toggle((nv) => _settings!.chatNotifications = nv, v),
            ),
            _buildTile(
              icon: Icons.receipt_long_outlined,
              iconColor: const Color(0xFF66BB6A),
              title: 'Order Alerts',
              subtitle: 'Updates on your purchases & sales',
              value: s.orderNotifications,
              onChanged: (v) => _toggle((nv) => _settings!.orderNotifications = nv, v),
            ),
            _buildTile(
              icon: Icons.sell_outlined,
              iconColor: const Color(0xFFAB47BC),
              title: 'Listing Activity',
              subtitle: 'Views, offers, and inquiries',
              value: s.listingNotifications,
              onChanged: (v) => _toggle((nv) => _settings!.listingNotifications = nv, v),
              isLast: true,
            ),
          ],
        ),
        const SizedBox(height: 16),

        _buildGroup(
          title: 'Marketing & Security',
          icon: Icons.security_outlined,
          tiles: [
            _buildTile(
              icon: Icons.security_outlined,
              iconColor: const Color(0xFFEF5350),
              title: 'Security Alerts',
              subtitle: 'Login attempts & account changes',
              value: s.securityAlerts,
              onChanged: (v) => _toggle((nv) => _settings!.securityAlerts = nv, v),
            ),
            _buildTile(
              icon: Icons.campaign_outlined,
              iconColor: const Color(0xFFFFA726),
              title: 'Marketing Emails',
              subtitle: 'Promotions, deals & offers',
              value: s.marketingEmails,
              onChanged: (v) => _toggle((nv) => _settings!.marketingEmails = nv, v),
            ),
            _buildTile(
              icon: Icons.newspaper_outlined,
              iconColor: const Color(0xFF29B6F6),
              title: 'Newsletter',
              subtitle: 'Weekly digest from Loopo',
              value: s.newsletter,
              onChanged: (v) => _toggle((nv) => _settings!.newsletter = nv, v),
              isLast: true,
            ),
          ],
        ),
        const SizedBox(height: 28),
      ],
    );
  }

  Widget _buildGroup({
    required String title,
    required IconData icon,
    required List<Widget> tiles,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 10),
          child: Row(
            children: [
              Icon(icon, size: 15, color: AppColors.appBlue),
              const SizedBox(width: 6),
              Text(
                title.toUpperCase(),
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.2,
                  color: AppColors.appBlue,
                ),
              ),
            ],
          ),
        ),
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(18),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.04),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(children: tiles),
        ),
      ],
    );
  }

  Widget _buildTile({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
    bool isLast = false,
  }) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(9),
                decoration: BoxDecoration(
                  color: iconColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, size: 18, color: iconColor),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppColors.appDark,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      style: const TextStyle(fontSize: 12, color: Colors.black45),
                    ),
                  ],
                ),
              ),
              Switch(
                value: value,
                onChanged: onChanged,
                activeThumbColor: AppColors.appGreen,
                materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
            ],
          ),
        ),
        if (!isLast)
          const Divider(height: 1, indent: 60, endIndent: 16, color: Color(0xFFF0F0F0)),
      ],
    );
  }
}
