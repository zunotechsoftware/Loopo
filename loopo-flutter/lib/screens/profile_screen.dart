import 'package:flutter/material.dart';
import '../services/user_service.dart';
import '../services/auth_session.dart';
import '../theme/app_colors.dart';
import 'login_screen.dart';
import 'notification_screen.dart';
import 'kyc_verification_screen.dart';
import 'favorites_screen.dart';
import 'help_support_screen.dart';
import 'chat_list_screen.dart';
import 'my_ads_screen.dart';

// TODO: [Backend Integration] Implement S3 profile image upload via POST /api/v1/users/profile-image/upload-url and POST /api/v1/users/profile-image
// TODO: [Backend Integration] Implement cover image upload via POST /api/v1/users/cover-image/upload-url and POST /api/v1/users/cover-image
// TODO: [Backend Integration] Soft delete account via DELETE /api/v1/users/me
// TODO: [Backend Integration] Fetch user addresses from GET /api/v1/addresses


class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final UserService _userService = UserService();
  Map<String, dynamic>? _userData;
  bool _isLoading = true;
  bool _isSaving = false;
  String? _error;

  // Edit-mode controllers
  final _firstNameCtrl = TextEditingController();
  final _lastNameCtrl = TextEditingController();
  final _displayNameCtrl = TextEditingController();
  final _bioCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _cityCtrl = TextEditingController();
  final _stateCtrl = TextEditingController();
  final _countryCtrl = TextEditingController();
  final _websiteCtrl = TextEditingController();

  bool _editMode = false;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  @override
  void dispose() {
    _firstNameCtrl.dispose();
    _lastNameCtrl.dispose();
    _displayNameCtrl.dispose();
    _bioCtrl.dispose();
    _phoneCtrl.dispose();
    _cityCtrl.dispose();
    _stateCtrl.dispose();
    _countryCtrl.dispose();
    _websiteCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadProfile() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final data = await _userService.getMe();
      _userData = data;
      _populateControllers(data);
    } catch (e) {
      _error = e.toString().replaceFirst('Exception: ', '');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _populateControllers(Map<String, dynamic> data) {
    final profile = data['profile'] as Map<String, dynamic>? ?? {};
    _firstNameCtrl.text = data['firstName'] ?? '';
    _lastNameCtrl.text = data['lastName'] ?? '';
    _displayNameCtrl.text = profile['displayName'] ?? '';
    _bioCtrl.text = profile['bio'] ?? '';
    _phoneCtrl.text = data['phone'] ?? '';
    _cityCtrl.text = profile['city'] ?? '';
    _stateCtrl.text = profile['state'] ?? '';
    _countryCtrl.text = profile['country'] ?? '';
    _websiteCtrl.text = profile['website'] ?? '';
  }

  Future<void> _saveProfile() async {
    setState(() => _isSaving = true);
    try {
      final updates = {
        'firstName': _firstNameCtrl.text.trim(),
        'lastName': _lastNameCtrl.text.trim(),
        'displayName': _displayNameCtrl.text.trim(),
        'bio': _bioCtrl.text.trim(),
        'phone': _phoneCtrl.text.trim(),
        'city': _cityCtrl.text.trim(),
        'state': _stateCtrl.text.trim(),
        'country': _countryCtrl.text.trim(),
        'website': _websiteCtrl.text.trim(),
      }..removeWhere((_, v) => v.isEmpty);

      await _userService.updateProfile(updates);
      await _loadProfile();
      if (mounted) {
        setState(() => _editMode = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Profile updated successfully'),
            backgroundColor: AppColors.appGreen,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString().replaceFirst('Exception: ', '')),
            backgroundColor: Colors.red.shade600,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  void _logout() {
    AuthSession.clear();
    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.appGrey,
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.appGreen))
          : _error != null
              ? _buildError()
              : _buildProfile(),
    );
  }

  Widget _buildError() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, size: 64, color: Colors.red),
            const SizedBox(height: 16),
            Text(
              _error!,
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.red, fontSize: 14),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _loadProfile,
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.appGreen),
              child: const Text('Retry', style: TextStyle(color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProfile() {
    final data = _userData!;
    final profile = data['profile'] as Map<String, dynamic>? ?? {};
    final firstName = data['firstName'] ?? '';
    final lastName = data['lastName'] ?? '';
    final fullName = '$firstName $lastName'.trim();
    final email = data['email'] ?? '';
    final phone = data['phone'] ?? '';
    final displayName = profile['displayName'] ?? '';
    final bio = profile['bio'] ?? '';
    final city = profile['city'] ?? '';
    final state = profile['state'] ?? '';
    final country = profile['country'] ?? '';
    final website = profile['website'] ?? '';
    final status = data['status'] ?? 'PENDING';
    final isEmailVerified = data['isEmailVerified'] == true;
    final isPhoneVerified = data['isPhoneVerified'] == true;
    final createdAt = data['createdAt'] != null
        ? _formatDate(data['createdAt'])
        : '';

    return CustomScrollView(
      slivers: [
        // ---- App Bar with hero section ----
        SliverAppBar(
          expandedHeight: 220,
          pinned: true,
          backgroundColor: AppColors.appDark,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white),
            onPressed: () => Navigator.pop(context),
          ),
          actions: [
            if (!_editMode)
              IconButton(
                icon: const Icon(Icons.edit_outlined, color: Colors.white),
                onPressed: () => setState(() => _editMode = true),
              ),
            if (_editMode)
              TextButton(
                onPressed: () => setState(() {
                  _editMode = false;
                  _populateControllers(data);
                }),
                child: const Text('Cancel', style: TextStyle(color: Colors.white70)),
              ),
          ],
          flexibleSpace: FlexibleSpaceBar(
            background: Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [AppColors.appDark, Color(0xFF1a2744)],
                ),
              ),
              child: SafeArea(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const SizedBox(height: 36),
                    // Avatar
                    Stack(
                      alignment: Alignment.bottomRight,
                      children: [
                        Container(
                          width: 84,
                          height: 84,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: const LinearGradient(
                              colors: [AppColors.appGreen, Color(0xFF3DA84A)],
                            ),
                            border: Border.all(color: Colors.white.withValues(alpha: 0.3), width: 3),
                          ),
                          child: Center(
                            child: Text(
                              _initials(firstName, lastName),
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 28,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.all(4),
                          decoration: BoxDecoration(
                            color: AppColors.appBlue,
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white, width: 2),
                          ),
                          child: const Icon(Icons.camera_alt, size: 12, color: Colors.white),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      displayName.isNotEmpty ? displayName : (fullName.isNotEmpty ? fullName : 'User'),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        _statusChip(status),
                        if (isEmailVerified) ...[
                          const SizedBox(width: 8),
                          _verifiedChip('Email'),
                        ],
                        if (isPhoneVerified) ...[
                          const SizedBox(width: 8),
                          _verifiedChip('Phone'),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),

        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ---- Bio / About ----
                if (bio.isNotEmpty || _editMode)
                  _buildSection(
                    title: 'About',
                    icon: Icons.info_outline,
                    children: [
                      _editMode
                          ? _buildTextField(_bioCtrl, 'Bio', maxLines: 3)
                          : Text(bio, style: const TextStyle(color: Colors.black54, height: 1.5)),
                    ],
                  ),

                // ---- Contact Info ----
                _buildSection(
                  title: 'Contact Information',
                  icon: Icons.contact_page_outlined,
                  children: [
                    if (_editMode) ...[
                      _buildTextField(_firstNameCtrl, 'First Name'),
                      const SizedBox(height: 12),
                      _buildTextField(_lastNameCtrl, 'Last Name'),
                      const SizedBox(height: 12),
                      _buildTextField(_displayNameCtrl, 'Display Name'),
                      const SizedBox(height: 12),
                      _buildTextField(_phoneCtrl, 'Phone Number', keyboardType: TextInputType.phone),
                    ] else ...[
                      _infoRow(Icons.email_outlined, 'Email', email.isNotEmpty ? email : '—'),
                      _infoRow(Icons.phone_outlined, 'Phone', phone.isNotEmpty ? phone : '—'),
                      _infoRow(Icons.badge_outlined, 'Display Name', displayName.isNotEmpty ? displayName : '—'),
                    ],
                  ],
                ),

                // ---- Location ----
                _buildSection(
                  title: 'Location',
                  icon: Icons.location_on_outlined,
                  children: [
                    if (_editMode) ...[
                      _buildTextField(_cityCtrl, 'City'),
                      const SizedBox(height: 12),
                      _buildTextField(_stateCtrl, 'State / Province'),
                      const SizedBox(height: 12),
                      _buildTextField(_countryCtrl, 'Country'),
                    ] else ...[
                      _infoRow(
                        Icons.location_city_outlined,
                        'Location',
                        [city, state, country].where((s) => s.isNotEmpty).join(', ').ifEmpty('—'),
                      ),
                    ],
                  ],
                ),

                // ---- Links ----
                _buildSection(
                  title: 'Online Presence',
                  icon: Icons.link_outlined,
                  children: [
                    if (_editMode)
                      _buildTextField(_websiteCtrl, 'Website URL', keyboardType: TextInputType.url)
                    else
                      _infoRow(Icons.public_outlined, 'Website', website.isNotEmpty ? website : '—'),
                  ],
                ),

                // ---- Account Details ----
                _buildSection(
                  title: 'Account Details',
                  icon: Icons.manage_accounts_outlined,
                  children: [
                    _infoRow(Icons.calendar_today_outlined, 'Member Since', createdAt),
                    _infoRow(Icons.verified_user_outlined, 'Account Status', status),
                    _infoRow(
                      Icons.mark_email_read_outlined,
                      'Email Verified',
                      isEmailVerified ? 'Yes' : 'No',
                      valueColor: isEmailVerified ? AppColors.appGreen : Colors.red.shade400,
                    ),
                    _infoRow(
                      Icons.phone_android_outlined,
                      'Phone Verified',
                      isPhoneVerified ? 'Yes' : 'No',
                      valueColor: isPhoneVerified ? AppColors.appGreen : Colors.red.shade400,
                    ),
                  ],
                ),

                // ---- My Marketplace Hub ----
                if (!_editMode)
                  _buildSection(
                    title: 'My Marketplace Hub',
                    icon: Icons.storefront_outlined,
                    children: [
                      _actionRow(
                        icon: Icons.verified_user_outlined,
                        title: 'Identity & KYC Verification',
                        subtitle: 'Get Verified Seller badge with Govt ID',
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const KycVerificationScreen()),
                          );
                        },
                      ),
                      const SizedBox(height: 12),
                      _actionRow(
                        icon: Icons.favorite_border_rounded,
                        title: 'Saved Favorites',
                        subtitle: 'Wishlist & bookmarked products',
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const FavoritesScreen()),
                          );
                        },
                      ),
                      const SizedBox(height: 12),
                      _actionRow(
                        icon: Icons.chat_bubble_outline_rounded,
                        title: 'My Messages & Chats',
                        subtitle: 'Buyer inquiries & negotiations',
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const ChatListScreen()),
                          );
                        },
                      ),
                      const SizedBox(height: 12),
                      _actionRow(
                        icon: Icons.sell_outlined,
                        title: 'My Ads & Listings',
                        subtitle: 'Manage active, pending & sold listings',
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const MyAdsScreen()),
                          );
                        },
                      ),
                    ],
                  ),

                // ---- Settings Section ----
                if (!_editMode)
                  _buildSection(
                    title: 'Settings & Preferences',
                    icon: Icons.settings_outlined,
                    children: [
                      _actionRow(
                        icon: Icons.notifications_active_outlined,
                        title: 'Notification Settings',
                        subtitle: 'Email, SMS, Push & Activity preferences',
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const NotificationScreen()),
                          );
                        },
                      ),
                      const SizedBox(height: 12),
                      _actionRow(
                        icon: Icons.lock_outline_rounded,
                        title: 'Privacy & Security',
                        subtitle: 'Password, two-factor auth & sessions',
                        onTap: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Privacy & Security settings active')),
                          );
                        },
                      ),
                      const SizedBox(height: 12),
                      _actionRow(
                        icon: Icons.help_outline_rounded,
                        title: 'Help, Safety & Support',
                        subtitle: 'FAQs, buyer safety rules & live support',
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const HelpSupportScreen()),
                          );
                        },
                      ),
                    ],
                  ),

                // ---- Save Button ----
                if (_editMode) ...[
                  const SizedBox(height: 8),
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton(
                      onPressed: _isSaving ? null : _saveProfile,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.appGreen,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        elevation: 0,
                      ),
                      child: _isSaving
                          ? const SizedBox(
                              width: 22,
                              height: 22,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : const Text(
                              'Save Changes',
                              style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                    ),
                  ),
                  const SizedBox(height: 16),
                ],

                // ---- Logout ----
                if (!_editMode) ...[
                  const SizedBox(height: 8),
                  _buildDangerCard(
                    icon: Icons.logout_rounded,
                    label: 'Sign Out',
                    onTap: () => _showLogoutDialog(),
                  ),
                  const SizedBox(height: 24),
                ],
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSection({
    required String title,
    required IconData icon,
    required List<Widget> children,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 10),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppColors.appGrey,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(icon, size: 18, color: AppColors.appBlue),
                ),
                const SizedBox(width: 10),
                Text(
                  title,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                    color: AppColors.appDark,
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1, indent: 16, endIndent: 16),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: children,
            ),
          ),
        ],
      ),
    );
  }

  Widget _actionRow({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 6),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.appBlue.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, size: 18, color: AppColors.appBlue),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppColors.appDark,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: const TextStyle(fontSize: 11, color: Colors.black45),
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, size: 18, color: Colors.black26),
          ],
        ),
      ),
    );
  }

  Widget _infoRow(IconData icon, String label, String value, {Color? valueColor}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 7),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 18, color: Colors.black38),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(fontSize: 11, color: Colors.black38),
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: valueColor ?? AppColors.appDark,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTextField(
    TextEditingController ctrl,
    String label, {
    int maxLines = 1,
    TextInputType? keyboardType,
  }) {
    return TextField(
      controller: ctrl,
      maxLines: maxLines,
      keyboardType: keyboardType,
      style: const TextStyle(fontSize: 14, color: AppColors.appDark),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(fontSize: 13, color: Colors.black38),
        filled: true,
        fillColor: AppColors.appGrey,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.appGreen, width: 1.5),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      ),
    );
  }

  Widget _buildDangerCard({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
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
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.red.shade50,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, size: 18, color: Colors.red.shade400),
            ),
            const SizedBox(width: 14),
            Text(
              label,
              style: TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 15,
                color: Colors.red.shade400,
              ),
            ),
            const Spacer(),
            Icon(Icons.chevron_right, color: Colors.red.shade300),
          ],
        ),
      ),
    );
  }

  Widget _statusChip(String status) {
    final color = status == 'ACTIVE'
        ? AppColors.appGreen
        : status == 'SUSPENDED'
            ? Colors.orange
            : Colors.grey;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.18),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.4)),
      ),
      child: Text(
        status,
        style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.bold),
      ),
    );
  }

  Widget _verifiedChip(String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: AppColors.appGreen.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.check_circle, size: 10, color: AppColors.appGreen),
          const SizedBox(width: 3),
          Text(
            label,
            style: const TextStyle(color: AppColors.appGreen, fontSize: 10, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }

  void _showLogoutDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Sign Out', style: TextStyle(fontWeight: FontWeight.bold)),
        content: const Text('Are you sure you want to sign out of your account?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: Colors.black54)),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              _logout();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red.shade400,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            child: const Text('Sign Out', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  String _initials(String firstName, String lastName) {
    final f = firstName.isNotEmpty ? firstName[0].toUpperCase() : '';
    final l = lastName.isNotEmpty ? lastName[0].toUpperCase() : '';
    return '$f$l'.ifEmpty('U');
  }

  String _formatDate(String isoDate) {
    try {
      final dt = DateTime.parse(isoDate);
      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      return '${months[dt.month - 1]} ${dt.day}, ${dt.year}';
    } catch (_) {
      return isoDate;
    }
  }
}

extension on String {
  String ifEmpty(String fallback) => isEmpty ? fallback : this;
}
