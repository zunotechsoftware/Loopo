import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class HelpSupportScreen extends StatelessWidget {
  const HelpSupportScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 1,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: AppColors.appDark, size: 18),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Help, Safety & Support',
          style: TextStyle(
            color: AppColors.appDark,
            fontFamily: 'Poppins',
            fontWeight: FontWeight.w800,
            fontSize: 18,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Safety Shield Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF1E293B), Color(0xFF0F172A)],
                ),
                borderRadius: BorderRadius.circular(18),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.security, color: Color(0xFF38BDF8), size: 28),
                      SizedBox(width: 10),
                      Text(
                        'Loopo Buyer Safety Rules',
                        style: TextStyle(
                          fontFamily: 'Poppins',
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  _safetyBullet('Always meet the seller in a safe, public place.'),
                  _safetyBullet('Inspect the product thoroughly before making payment.'),
                  _safetyBullet('Never share your UPI PIN or banking OTP with anyone.'),
                  _safetyBullet('Beware of fake advance payment links or QR codes.'),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // FAQs Section
            const Text(
              'Frequently Asked Questions',
              style: TextStyle(
                fontFamily: 'Poppins',
                fontWeight: FontWeight.bold,
                fontSize: 16,
                color: AppColors.appDark,
              ),
            ),
            const SizedBox(height: 12),
            _faqTile(
              'How do I buy an item on Loopo?',
              'Browse listings nearby, tap on the item, and use the "Chat with Seller" or "Make an Offer" button to agree on a price and pickup place.',
            ),
            _faqTile(
              'Is posting an ad free?',
              'Yes! Posting marketplace listings on Loopo is 100% free for all users.',
            ),
            _faqTile(
              'What should I do if I suspect a scam?',
              'Do not send money in advance. Tap the "Report Ad / Seller" button on the listing detail page or contact our support team immediately.',
            ),
            _faqTile(
              'How can I boost my listing?',
              'Go to "My Ads" tab and tap "Boost". Featured ads receive up to 5x more views from buyers in your city.',
            ),
            const SizedBox(height: 24),

            // Contact Support Options
            const Text(
              'Need More Assistance?',
              style: TextStyle(
                fontFamily: 'Poppins',
                fontWeight: FontWeight.bold,
                fontSize: 16,
                color: AppColors.appDark,
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Opening Live Support Chat...')),
                      );
                    },
                    icon: const Icon(Icons.chat_bubble_outline_rounded, size: 18),
                    label: const Text('Live Chat', style: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.bold)),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      side: const BorderSide(color: AppColors.appGreen),
                      foregroundColor: AppColors.appGreen,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Calling Support Helpline (+91 1800-123-4567)...')),
                      );
                    },
                    icon: const Icon(Icons.headset_mic_outlined, size: 18),
                    label: const Text('Call Us', style: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.bold)),
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      backgroundColor: AppColors.appGreen,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _safetyBullet(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('• ', style: TextStyle(color: Color(0xFF38BDF8), fontWeight: FontWeight.bold)),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(fontFamily: 'Poppins', fontSize: 12, color: Color(0xFF94A3B8)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _faqTile(String title, String answer) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: ExpansionTile(
        title: Text(
          title,
          style: const TextStyle(
            fontFamily: 'Poppins',
            fontSize: 13,
            fontWeight: FontWeight.bold,
            color: AppColors.appDark,
          ),
        ),
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 14),
            child: Text(
              answer,
              style: TextStyle(fontFamily: 'Poppins', fontSize: 12, color: Colors.grey.shade600, height: 1.4),
            ),
          ),
        ],
      ),
    );
  }
}
