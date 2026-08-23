// ─── Step 5 – Price ───────────────────────────────────────────────────────────

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../theme/app_colors.dart';
import 'sell_widgets.dart';
import 'sell_flow_controller.dart';

class PriceScreen extends StatefulWidget {
  final SellFlowController controller;

  const PriceScreen({super.key, required this.controller});

  @override
  State<PriceScreen> createState() => _PriceScreenState();
}

class _PriceScreenState extends State<PriceScreen> {
  late final TextEditingController _priceCtrl;
  bool _isNegotiable = false;
  bool _acceptOffers = false;
  String? _priceError;

  // Suggested price range (static placeholder)
  final String _suggestedMin = '₹45,000';
  final String _suggestedMax = '₹50,000';

  @override
  void initState() {
    super.initState();
    final d = widget.controller.data;
    _priceCtrl = TextEditingController(
      text: d.price != null ? '${d.price!.toInt()}' : '',
    );
    _isNegotiable = d.isNegotiable;
    _acceptOffers = d.acceptOffers;
  }

  @override
  void dispose() {
    _priceCtrl.dispose();
    super.dispose();
  }

  bool _validate() {
    final text = _priceCtrl.text.trim();
    if (text.isEmpty) {
      setState(() => _priceError = 'Please enter a price');
      return false;
    }
    final val = double.tryParse(text);
    if (val == null || val <= 0) {
      setState(() => _priceError = 'Please enter a valid price');
      return false;
    }
    setState(() => _priceError = null);
    return true;
  }

  void _saveAndContinue() {
    if (!_validate()) return;
    final d = widget.controller.data;
    d.price = double.parse(_priceCtrl.text.trim());
    d.isNegotiable = _isNegotiable;
    d.acceptOffers = _acceptOffers;
    widget.controller.goToNext();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      appBar: SellAppBar(
        title: 'Set Your Price',
        currentStep: 5,
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
                    'How much are you asking?',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      color: AppColors.appDark,
                      fontFamily: 'Poppins',
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Set a competitive price to sell faster',
                    style: TextStyle(
                      fontSize: 13,
                      color: Colors.grey.shade500,
                      fontFamily: 'Poppins',
                    ),
                  ),
                  const SizedBox(height: 28),

                  // Large price field
                  _LargePriceField(
                    controller: _priceCtrl,
                    errorText: _priceError,
                    onChanged: (_) {
                      if (_priceError != null) {
                        setState(() => _priceError = null);
                      }
                    },
                  ),
                  const SizedBox(height: 16),

                  // Suggested price range
                  _SuggestedRangeCard(
                    min: _suggestedMin,
                    max: _suggestedMax,
                  ),
                  const SizedBox(height: 24),

                  // Switches
                  _PriceSwitch(
                    title: 'Negotiable',
                    subtitle: 'Allow buyers to negotiate on price',
                    icon: Icons.handshake_rounded,
                    iconColor: const Color(0xFF7C3AED),
                    value: _isNegotiable,
                    onChanged: (v) => setState(() => _isNegotiable = v),
                  ),
                  const SizedBox(height: 12),
                  _PriceSwitch(
                    title: 'Accept Offers',
                    subtitle: 'Let buyers make you an offer',
                    icon: Icons.local_offer_rounded,
                    iconColor: AppColors.appBlue,
                    value: _acceptOffers,
                    onChanged: (v) => setState(() => _acceptOffers = v),
                  ),
                  const SizedBox(height: 24),

                  // Price tips
                  _PriceTipsCard(),
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

// ── Large Price Input ─────────────────────────────────────────────────────────

class _LargePriceField extends StatelessWidget {
  final TextEditingController controller;
  final String? errorText;
  final ValueChanged<String>? onChanged;

  const _LargePriceField({
    required this.controller,
    this.errorText,
    this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: errorText != null
              ? Colors.red
              : const Color(0xFFE5E7EB),
          width: errorText != null ? 2 : 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Your Price',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: Colors.grey,
              fontFamily: 'Poppins',
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const Text(
                '₹',
                style: TextStyle(
                  fontSize: 36,
                  fontWeight: FontWeight.w800,
                  color: AppColors.appDark,
                  fontFamily: 'Poppins',
                ),
              ),
              const SizedBox(width: 6),
              Expanded(
                child: TextField(
                  controller: controller,
                  onChanged: onChanged,
                  keyboardType: TextInputType.number,
                  inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                  style: const TextStyle(
                    fontSize: 36,
                    fontWeight: FontWeight.w800,
                    color: AppColors.appDark,
                    fontFamily: 'Poppins',
                  ),
                  decoration: InputDecoration(
                    hintText: '0',
                    hintStyle: TextStyle(
                      fontSize: 36,
                      fontWeight: FontWeight.w300,
                      color: Colors.grey.shade300,
                      fontFamily: 'Poppins',
                    ),
                    border: InputBorder.none,
                    isDense: true,
                    contentPadding: EdgeInsets.zero,
                  ),
                ),
              ),
            ],
          ),
          if (errorText != null) ...[
            const SizedBox(height: 6),
            Text(
              errorText!,
              style: const TextStyle(
                fontSize: 12,
                color: Colors.red,
                fontFamily: 'Poppins',
              ),
            ),
          ],
        ],
      ),
    );
  }
}

// ── Suggested Range Card ──────────────────────────────────────────────────────

class _SuggestedRangeCard extends StatelessWidget {
  final String min;
  final String max;

  const _SuggestedRangeCard({required this.min, required this.max});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.appGreen.withValues(alpha: 0.08),
            AppColors.appBlue.withValues(alpha: 0.06),
          ],
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
        ),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.appGreen.withValues(alpha: 0.2)),
      ),
      child: Row(
        children: [
          const Icon(Icons.insights_rounded,
              color: AppColors.appGreen, size: 20),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Suggested Price Range',
                style: TextStyle(
                  fontSize: 11,
                  color: Colors.grey,
                  fontFamily: 'Poppins',
                  letterSpacing: 0.3,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                '$min – $max',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                  color: AppColors.appDark,
                  fontFamily: 'Poppins',
                ),
              ),
            ],
          ),
          const Spacer(),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(
              color: AppColors.appGreen,
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Text(
              'Market',
              style: TextStyle(
                color: Colors.white,
                fontSize: 11,
                fontWeight: FontWeight.w700,
                fontFamily: 'Poppins',
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Price Switch Card ─────────────────────────────────────────────────────────

class _PriceSwitch extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color iconColor;
  final bool value;
  final ValueChanged<bool> onChanged;

  const _PriceSwitch({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.iconColor,
    required this.value,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color:
              value ? iconColor.withValues(alpha: 0.3) : const Color(0xFFE5E7EB),
          width: value ? 1.5 : 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: iconColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: iconColor, size: 20),
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
                    fontWeight: FontWeight.w700,
                    color: AppColors.appDark,
                    fontFamily: 'Poppins',
                  ),
                ),
                Text(
                  subtitle,
                  style: TextStyle(
                    fontSize: 12,
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

// ── Price Tips Card ───────────────────────────────────────────────────────────

class _PriceTipsCard extends StatelessWidget {
  const _PriceTipsCard();

  @override
  Widget build(BuildContext context) {
    const tips = [
      'Price 10–15% lower than market to sell faster',
      'Check similar listings for competitive pricing',
      'Prices ending in 9 or 99 seem more attractive',
      'Include shipping in price if offering free delivery',
    ];
    return SellInfoCard(
      icon: Icons.price_change_rounded,
      title: 'Pricing Tips',
      body: tips.join('\n• '),
      iconColor: const Color(0xFF7C3AED),
      bgColor: const Color(0xFFF3F0FF),
    );
  }
}
