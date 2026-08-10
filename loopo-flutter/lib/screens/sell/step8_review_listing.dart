// ─── Step 8 – Review Listing ──────────────────────────────────────────────────

import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import 'sell_widgets.dart';
import 'sell_flow_controller.dart';

import '../../services/product_service.dart';

class ReviewListingScreen extends StatefulWidget {
  final SellFlowController controller;

  const ReviewListingScreen({super.key, required this.controller});

  @override
  State<ReviewListingScreen> createState() => _ReviewListingScreenState();
}

class _ReviewListingScreenState extends State<ReviewListingScreen> {
  bool _isPublishing = false;

  Future<void> _publish() async {
    setState(() => _isPublishing = true);
    final d = widget.controller.data;
    try {
      final productService = ProductService();

      String conditionEnum = 'LIKE_NEW';
      final condLower = (d.condition).toLowerCase();
      if (condLower.contains('new') && !condLower.contains('like')) {
        conditionEnum = 'NEW';
      } else if (condLower.contains('good')) {
        conditionEnum = 'GOOD';
      } else if (condLower.contains('fair')) {
        conditionEnum = 'FAIR';
      } else if (condLower.contains('refurbished')) {
        conditionEnum = 'REFURBISHED';
      }

      final locationMap = {
        'country': 'India',
        'state': 'Karnataka',
        'city': d.locationName != null && d.locationName!.isNotEmpty ? d.locationName! : 'Bengaluru',
        'area': d.locationAddress ?? d.locationName ?? 'Koramangala',
        if (d.latitude != null) 'latitude': d.latitude,
        if (d.longitude != null) 'longitude': d.longitude,
      };

      final payload = {
        'title': d.title.isNotEmpty ? d.title : 'Marketplace Listing',
        'description': d.description.isNotEmpty ? d.description : 'Item listed via Loopo app.',
        'categoryId': d.selectedCategoryId ?? 'a5cbe71e-01fc-4043-9828-98f5a653ccfe',
        if (d.selectedSubcategoryId != null && d.selectedSubcategoryId!.isNotEmpty)
          'subcategoryId': d.selectedSubcategoryId,
        'condition': conditionEnum,
        'price': d.price ?? 0.0,
        'currency': 'INR',
        'negotiable': d.isNegotiable,
        'quantity': d.quantity > 0 ? d.quantity : 1,
        'location': locationMap,
      };

      await productService.createListing(payload);

      if (!mounted) return;
      setState(() => _isPublishing = false);
      widget.controller.goToNext();
    } catch (e) {
      if (mounted) {
        setState(() => _isPublishing = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString().replaceFirst('Exception: ', '')),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final d = widget.controller.data;
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      appBar: SellAppBar(
        title: 'Review Listing',
        currentStep: 8,
        totalSteps: SellFlowController.totalSteps,
        onBack: () => widget.controller.goToPrev(),
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    "Almost there! 🎉",
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      color: AppColors.appDark,
                      fontFamily: 'Poppins',
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Review your listing before publishing',
                    style: TextStyle(
                      fontSize: 13,
                      color: Colors.grey.shade500,
                      fontFamily: 'Poppins',
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Photos summary
                  _ReviewSection(
                    title: 'Photos',
                    icon: Icons.photo_library_rounded,
                    iconColor: AppColors.appBlue,
                    onEdit: () => widget.controller.jumpTo(2),
                    child: _PhotosPreview(photos: d.photos),
                  ),
                  const SizedBox(height: 12),

                  // Item details
                  _ReviewSection(
                    title: 'Item Details',
                    icon: Icons.description_rounded,
                    iconColor: const Color(0xFF7C3AED),
                    onEdit: () => widget.controller.jumpTo(3),
                    child: _DetailsRows(data: d),
                  ),
                  const SizedBox(height: 12),

                  // Price
                  _ReviewSection(
                    title: 'Price',
                    icon: Icons.currency_rupee_rounded,
                    iconColor: AppColors.appGreen,
                    onEdit: () => widget.controller.jumpTo(4),
                    child: _PriceRow(data: d),
                  ),
                  const SizedBox(height: 12),

                  // Location
                  _ReviewSection(
                    title: 'Location',
                    icon: Icons.location_on_rounded,
                    iconColor: Colors.red.shade400,
                    onEdit: () => widget.controller.jumpTo(5),
                    child: _LocationRow(data: d),
                  ),
                  const SizedBox(height: 12),

                  // Contact
                  _ReviewSection(
                    title: 'Contact Preferences',
                    icon: Icons.contact_phone_rounded,
                    iconColor: const Color(0xFFF59E0B),
                    onEdit: () => widget.controller.jumpTo(6),
                    child: _ContactRow(data: d),
                  ),
                  const SizedBox(height: 20),

                  // Publish note
                  SellInfoCard(
                    icon: Icons.check_circle_outline_rounded,
                    title: 'Ready to Publish',
                    body:
                        'Your listing will be live immediately after publishing and visible to all buyers in your area.',
                    iconColor: AppColors.appGreen,
                    bgColor: const Color(0xFFECFDF5),
                  ),
                  const SizedBox(height: 8),
                ],
              ),
            ),
          ),
          SellContinueButton(
            label: 'Publish Listing',
            isLoading: _isPublishing,
            onPressed: _isPublishing ? null : _publish,
          ),
        ],
      ),
    );
  }
}

// ── Review Section Card ───────────────────────────────────────────────────────

class _ReviewSection extends StatelessWidget {
  final String title;
  final IconData icon;
  final Color iconColor;
  final VoidCallback onEdit;
  final Widget child;

  const _ReviewSection({
    required this.title,
    required this.icon,
    required this.iconColor,
    required this.onEdit,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header row
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 12, 0),
            child: Row(
              children: [
                Container(
                  width: 34,
                  height: 34,
                  decoration: BoxDecoration(
                    color: iconColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(icon, color: iconColor, size: 18),
                ),
                const SizedBox(width: 10),
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: AppColors.appDark,
                    fontFamily: 'Poppins',
                  ),
                ),
                const Spacer(),
                TextButton.icon(
                  onPressed: onEdit,
                  icon: const Icon(Icons.edit_rounded, size: 14),
                  label: const Text('Edit'),
                  style: TextButton.styleFrom(
                    foregroundColor: AppColors.appBlue,
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 4),
                    textStyle: const TextStyle(
                      fontSize: 13,
                      fontFamily: 'Poppins',
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 16, indent: 16, endIndent: 16),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: child,
          ),
        ],
      ),
    );
  }
}

// ── Child widgets for each section ───────────────────────────────────────────

class _PhotosPreview extends StatelessWidget {
  final List photos;

  const _PhotosPreview({required this.photos});

  @override
  Widget build(BuildContext context) {
    if (photos.isEmpty) {
      return Text('No photos added',
          style: TextStyle(
              fontSize: 13, color: Colors.grey.shade400, fontFamily: 'Poppins'));
    }
    return SizedBox(
      height: 80,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: photos.length,
        itemBuilder: (_, i) {
          return Stack(
            children: [
              Container(
                width: 80,
                height: 80,
                margin: const EdgeInsets.only(right: 8),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  color: Colors.grey.shade200,
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: i == 0
                      ? Stack(
                          fit: StackFit.expand,
                          children: [
                            Container(color: Colors.grey.shade200),
                            const Center(
                              child: Icon(Icons.image_rounded,
                                  color: Colors.grey, size: 28),
                            ),
                            Positioned(
                              bottom: 4,
                              left: 4,
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 5, vertical: 2),
                                decoration: BoxDecoration(
                                  color: AppColors.appGreen,
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: const Text('COVER',
                                    style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 8,
                                        fontWeight: FontWeight.w800,
                                        fontFamily: 'Poppins')),
                              ),
                            ),
                          ],
                        )
                      : Container(
                          color: Colors.grey.shade200,
                          child: const Center(
                            child: Icon(Icons.image_rounded,
                                color: Colors.grey, size: 28),
                          ),
                        ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _ReviewRow extends StatelessWidget {
  final String label;
  final String value;

  const _ReviewRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 90,
            child: Text(
              label,
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey.shade500,
                fontFamily: 'Poppins',
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.appDark,
                fontFamily: 'Poppins',
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _DetailsRows extends StatelessWidget {
  final SellFlowData data;

  const _DetailsRows({required this.data});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        _ReviewRow(label: 'Title', value: data.title.isEmpty ? '–' : data.title),
        _ReviewRow(label: 'Category', value: data.selectedSubcategoryName ?? data.selectedCategoryName ?? '–'),
        _ReviewRow(label: 'Brand', value: data.brand.isEmpty ? '–' : data.brand),
        _ReviewRow(label: 'Model', value: data.model.isEmpty ? '–' : data.model),
        _ReviewRow(label: 'Condition', value: data.condition.isEmpty ? '–' : data.condition),
        _ReviewRow(label: 'Quantity', value: '${data.quantity}'),
        if (data.description.isNotEmpty)
          _ReviewRow(label: 'Description', value: data.description.length > 80 ? '${data.description.substring(0, 80)}…' : data.description),
      ],
    );
  }
}

class _PriceRow extends StatelessWidget {
  final SellFlowData data;

  const _PriceRow({required this.data});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          data.price != null
              ? '₹${data.price!.toInt().toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')} '
              : '–',
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w800,
            color: AppColors.appGreen,
            fontFamily: 'Poppins',
          ),
        ),
        const SizedBox(height: 6),
        Row(
          children: [
            if (data.isNegotiable) _BadgeChip(label: 'Negotiable'),
            if (data.acceptOffers) ...[
              if (data.isNegotiable) const SizedBox(width: 8),
              _BadgeChip(label: 'Accepts Offers', color: AppColors.appBlue),
            ],
          ],
        ),
      ],
    );
  }
}

class _BadgeChip extends StatelessWidget {
  final String label;
  final Color color;

  const _BadgeChip({required this.label, this.color = AppColors.appGreen});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: color,
          fontFamily: 'Poppins',
        ),
      ),
    );
  }
}

class _LocationRow extends StatelessWidget {
  final SellFlowData data;

  const _LocationRow({required this.data});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const Icon(Icons.location_on_rounded, color: Colors.red, size: 16),
        const SizedBox(width: 6),
        Expanded(
          child: Text(
            data.locationAddress ?? data.locationName ?? 'Not set',
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: AppColors.appDark,
              fontFamily: 'Poppins',
            ),
          ),
        ),
      ],
    );
  }
}

class _ContactRow extends StatelessWidget {
  final SellFlowData data;

  const _ContactRow({required this.data});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        if (data.allowChat) ...[
          const Icon(Icons.chat_bubble_rounded,
              color: AppColors.appGreen, size: 16),
          const SizedBox(width: 4),
          const Text('Chat',
              style: TextStyle(
                  fontSize: 12,
                  fontFamily: 'Poppins',
                  color: AppColors.appDark)),
          const SizedBox(width: 12),
        ],
        if (data.allowCall) ...[
          const Icon(Icons.phone_rounded,
              color: AppColors.appBlue, size: 16),
          const SizedBox(width: 4),
          const Text('Call',
              style: TextStyle(
                  fontSize: 12,
                  fontFamily: 'Poppins',
                  color: AppColors.appDark)),
        ],
        if (data.email != null && data.email!.isNotEmpty) ...[
          const SizedBox(width: 12),
          const Icon(Icons.email_rounded, color: Colors.orange, size: 16),
          const SizedBox(width: 4),
          Expanded(
            child: Text(
              data.email!,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                  fontSize: 12,
                  fontFamily: 'Poppins',
                  color: AppColors.appDark),
            ),
          ),
        ],
      ],
    );
  }
}
