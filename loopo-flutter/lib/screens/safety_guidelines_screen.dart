import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class SafetyGuidelinesScreen extends StatelessWidget {
  const SafetyGuidelinesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAFAFA),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        iconTheme: const IconThemeData(color: Colors.black87),
        title: const Text(
          'Safety & Trust Guidelines',
          style: TextStyle(color: Colors.black87, fontWeight: FontWeight.w800, fontSize: 18),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.emerald600.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.emerald600.withValues(alpha: 0.2)),
            ),
            child: Row(
              children: [
                const Icon(Icons.shield, color: AppColors.emerald600, size: 36),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Your Safety is Our Top Priority',
                        style: TextStyle(fontWeight: FontWeight.w900, fontSize: 15, color: AppColors.emerald600),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Follow these guidelines for safe buying and selling on Loopo Marketplace.',
                        style: TextStyle(fontSize: 11, color: Colors.grey.shade700, fontWeight: FontWeight.w500),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          _buildGuidelineCard(
            icon: Icons.person_pin_circle_outlined,
            title: '1. Meet in a Safe Public Place',
            description: 'Always arrange item inspection and exchange in well-lit public places like shopping malls, metro stations, or cafes. Avoid secluded spots.',
          ),
          _buildGuidelineCard(
            icon: Icons.search,
            title: '2. Inspect Item Before Payment',
            description: 'Thoroughly test electronics, check vehicle documents, and verify item authenticity before making any payment.',
          ),
          _buildGuidelineCard(
            icon: Icons.payments_outlined,
            title: '3. Never Pay Advance Money',
            description: 'Be wary of sellers requesting advance token payments, shipping deposits, or scanning QR codes to receive money.',
          ),
          _buildGuidelineCard(
            icon: Icons.mark_chat_read_outlined,
            title: '4. Keep Communications on Loopo Chat',
            description: 'Use the official Loopo in-app chat for all negotiations and offer updates to stay protected by our moderation team.',
          ),
          _buildGuidelineCard(
            icon: Icons.verified_user_outlined,
            title: '5. Complete KYC Verification',
            description: 'Verified profiles get higher trust ratings. Complete your KYC badge to trade with peace of mind.',
          ),
        ],
      ),
    );
  }

  Widget _buildGuidelineCard({
    required IconData icon,
    required String title,
    required String description,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppColors.emerald600.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(icon, color: AppColors.emerald600, size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: Colors.black87),
                ),
                const SizedBox(height: 4),
                Text(
                  description,
                  style: TextStyle(fontSize: 12, color: Colors.grey.shade600, height: 1.4),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
