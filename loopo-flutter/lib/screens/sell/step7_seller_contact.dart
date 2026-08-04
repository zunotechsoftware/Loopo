// ─── Step 7 – Seller Contact ──────────────────────────────────────────────────

import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import 'sell_widgets.dart';
import 'sell_flow_controller.dart';

class SellerContactScreen extends StatefulWidget {
  final SellFlowController controller;

  const SellerContactScreen({super.key, required this.controller});

  @override
  State<SellerContactScreen> createState() => _SellerContactScreenState();
}

class _SellerContactScreenState extends State<SellerContactScreen> {
  bool _allowChat = true;
  bool _allowCall = true;
  final _emailCtrl = TextEditingController();

  // Simulated – in a real app, read from user profile
  final bool _isVerified = false;
  final String _mobileNumber = '+91 98765 43210';

  bool _skipVerification = false;

  @override
  void initState() {
    super.initState();
    final d = widget.controller.data;
    _allowChat = d.allowChat;
    _allowCall = d.allowCall;
    _emailCtrl.text = d.email ?? '';
  }

  @override
  void dispose() {
    _emailCtrl.dispose();
    super.dispose();
  }

  void _saveAndContinue() {
    final d = widget.controller.data;
    d.allowChat = _allowChat;
    d.allowCall = _allowCall;
    d.email = _emailCtrl.text.trim().isEmpty ? null : _emailCtrl.text.trim();
    widget.controller.goToNext();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      appBar: SellAppBar(
        title: 'Seller Contact',
        currentStep: 7,
        totalSteps: SellFlowController.totalSteps,
        onBack: () => widget.controller.goToPrev(),
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'How should buyers reach you?',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      color: AppColors.appDark,
                      fontFamily: 'Poppins',
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Choose your preferred contact methods',
                    style: TextStyle(
                      fontSize: 13,
                      color: Colors.grey.shade500,
                      fontFamily: 'Poppins',
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Verified mobile number
                  _MobileNumberCard(
                    number: _mobileNumber,
                    isVerified: _isVerified,
                  ),
                  const SizedBox(height: 16),

                  // Contact toggles
                  SellSectionHeader(title: 'Contact Preferences'),
                  _ContactToggle(
                    icon: Icons.chat_bubble_rounded,
                    iconColor: AppColors.appGreen,
                    title: 'Chat',
                    subtitle: 'Allow buyers to message you',
                    value: _allowChat,
                    onChanged: (v) => setState(() => _allowChat = v),
                  ),
                  const SizedBox(height: 10),
                  _ContactToggle(
                    icon: Icons.phone_rounded,
                    iconColor: AppColors.appBlue,
                    title: 'Call',
                    subtitle: 'Show phone number to buyers',
                    value: _allowCall,
                    onChanged: (v) => setState(() => _allowCall = v),
                  ),
                  const SizedBox(height: 20),

                  // Optional email
                  SellLabeledField(
                    label: 'Email (Optional)',
                    hint: 'your@email.com',
                    controller: _emailCtrl,
                    keyboardType: TextInputType.emailAddress,
                  ),
                  const SizedBox(height: 24),

                  // Verified seller card (shown if not verified)
                  if (!_isVerified && !_skipVerification)
                    _VerifiedSellerCard(
                      onVerify: () {
                        // TODO: navigate to verification flow
                      },
                      onSkip: () => setState(() => _skipVerification = true),
                    ),

                  if (_isVerified) _VerifiedBadgeCard(),
                  const SizedBox(height: 8),
                ],
              ),
            ),
          ),
          SellContinueButton(onPressed: _saveAndContinue),
        ],
      ),
    );
  }
}

// ── Mobile Number Card ────────────────────────────────────────────────────────

class _MobileNumberCard extends StatelessWidget {
  final String number;
  final bool isVerified;

  const _MobileNumberCard({
    required this.number,
    required this.isVerified,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE5E7EB)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: const Color(0xFFECFDF5),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.smartphone_rounded,
                color: AppColors.appGreen, size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Mobile Number',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey,
                    fontFamily: 'Poppins',
                  ),
                ),
                Text(
                  number,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: AppColors.appDark,
                    fontFamily: 'Poppins',
                  ),
                ),
              ],
            ),
          ),
          if (isVerified)
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: const Color(0xFFECFDF5),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.appGreen.withValues(alpha: 0.3)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.verified_rounded,
                      size: 14, color: AppColors.appGreen),
                  SizedBox(width: 4),
                  Text(
                    'Verified',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: AppColors.appGreen,
                      fontFamily: 'Poppins',
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

// ── Contact Toggle ────────────────────────────────────────────────────────────

class _ContactToggle extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String title;
  final String subtitle;
  final bool value;
  final ValueChanged<bool> onChanged;

  const _ContactToggle({
    required this.icon,
    required this.iconColor,
    required this.title,
    required this.subtitle,
    required this.value,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color:
              value ? iconColor.withValues(alpha: 0.3) : const Color(0xFFE5E7EB),
          width: value ? 1.5 : 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: iconColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: iconColor, size: 18),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: AppColors.appDark,
                    fontFamily: 'Poppins',
                  ),
                ),
                Text(
                  subtitle,
                  style: TextStyle(
                    fontSize: 11,
                    color: Colors.grey.shade500,
                    fontFamily: 'Poppins',
                  ),
                ),
              ],
            ),
          ),
          Switch.adaptive(
            value: value,
            onChanged: onChanged,
            activeThumbColor: iconColor,
          ),
        ],
      ),
    );
  }
}

// ── Become Verified Seller Card ───────────────────────────────────────────────

class _VerifiedSellerCard extends StatelessWidget {
  final VoidCallback onVerify;
  final VoidCallback onSkip;

  const _VerifiedSellerCard({
    required this.onVerify,
    required this.onSkip,
  });

  @override
  Widget build(BuildContext context) {
    const benefits = [
      {'icon': Icons.verified_rounded, 'text': 'Verified Badge on your profile'},
      {'icon': Icons.trending_up_rounded, 'text': 'Better visibility in search'},
      {'icon': Icons.thumb_up_rounded, 'text': 'Higher buyer trust'},
    ];

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF0F172A), Color(0xFF1E3A5F)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: AppColors.appDark.withValues(alpha: 0.3),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: AppColors.appGreen.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.verified_rounded,
                    color: AppColors.appGreen, size: 24),
              ),
              const SizedBox(width: 12),
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Become a Verified Seller',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                      fontFamily: 'Poppins',
                    ),
                  ),
                  Text(
                    'Sell up to 3× faster',
                    style: TextStyle(
                      fontSize: 12,
                      color: AppColors.appGreen,
                      fontFamily: 'Poppins',
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),
          ...benefits.map(
            (b) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(
                children: [
                  Icon(b['icon'] as IconData,
                      size: 16, color: AppColors.appGreen),
                  const SizedBox(width: 10),
                  Text(
                    b['text'] as String,
                    style: const TextStyle(
                      fontSize: 13,
                      color: Colors.white70,
                      fontFamily: 'Poppins',
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: ElevatedButton(
                  onPressed: onVerify,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.appGreen,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                  child: const Text(
                    'Verify Now',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      fontFamily: 'Poppins',
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: OutlinedButton(
                  onPressed: onSkip,
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.white60,
                    side: const BorderSide(color: Colors.white24),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                  child: const Text(
                    'Skip',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      fontFamily: 'Poppins',
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ── Already Verified Badge Card ───────────────────────────────────────────────

class _VerifiedBadgeCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFECFDF5),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.appGreen.withValues(alpha: 0.3)),
      ),
      child: const Row(
        children: [
          Icon(Icons.verified_rounded, color: AppColors.appGreen, size: 22),
          SizedBox(width: 12),
          Expanded(
            child: Text(
              'You are a Verified Seller! Buyers see your badge on all listings.',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.appGreen,
                fontFamily: 'Poppins',
              ),
            ),
          ),
        ],
      ),
    );
  }
}
