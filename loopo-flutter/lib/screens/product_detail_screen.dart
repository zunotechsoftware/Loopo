import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import 'seller_profile_screen.dart';
import 'report_issue_screen.dart';
import 'chat_conversation_screen.dart';

// TODO: [Backend Integration] Fetch product details from GET /api/v1/products/:id
// TODO: [Backend Integration] Toggle product wishlist/favorite status via POST /api/v1/favorites/:productId
// TODO: [Backend Integration] Initiate chat session with seller via POST /api/v1/chat/conversations
// TODO: [Backend Integration] Submit offer price via POST /api/v1/orders/offers

class ProductDetailScreen extends StatefulWidget {
  final Map<String, dynamic> product;

  const ProductDetailScreen({
    super.key,
    required this.product,
  });

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  bool _isFavorite = false;
  int _activeImageIndex = 0;
  final TextEditingController _offerController = TextEditingController();

  static const List<Map<String, dynamic>> _dummyImages = [
    {
      'color': Color(0xFF5C6BC0),
      'label': 'Front View',
      'icon': Icons.phone_iphone,
    },
    {
      'color': Color(0xFF3F51B5),
      'label': 'Back View',
      'icon': Icons.camera_alt_outlined,
    },
    {
      'color': Color(0xFF303F9F),
      'label': 'Accessories & Box',
      'icon': Icons.inventory_2_outlined,
    },
  ];

  @override
  void dispose() {
    _offerController.dispose();
    super.dispose();
  }

  void _showOfferDialog() {
    final currentPrice = widget.product['price'] ?? '₹78,500';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom,
          ),
          child: Container(
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
            ),
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: Colors.grey.shade300,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                const Text(
                  'Make an Offer',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: AppColors.appDark,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Listed Price: $currentPrice',
                  style: const TextStyle(fontSize: 13, color: Colors.black54),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _offerController,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(
                    prefixText: '₹ ',
                    hintText: 'Enter your offer amount',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: const BorderSide(color: AppColors.appGreen, width: 2),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    _quickOfferChip('₹70,000'),
                    const SizedBox(width: 8),
                    _quickOfferChip('₹72,500'),
                    const SizedBox(width: 8),
                    _quickOfferChip('₹75,000'),
                  ],
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.pop(context);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Offer sent to seller!'),
                          backgroundColor: AppColors.appGreen,
                        ),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.appGreen,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    child: const Text(
                      'Send Offer',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _quickOfferChip(String amount) {
    return Expanded(
      child: OutlinedButton(
        onPressed: () {
          _offerController.text = amount.replaceAll(RegExp(r'[^\d]'), '');
        },
        style: OutlinedButton.styleFrom(
          side: BorderSide(color: AppColors.appGreen.withValues(alpha: 0.4)),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
        child: Text(
          amount,
          style: const TextStyle(fontSize: 12, color: AppColors.appGreen, fontWeight: FontWeight.bold),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final title = (widget.product['title'] ?? 'iPhone 14 Pro Max').toString();
    final price = (widget.product['price'] ?? '₹78,500').toString();
    final location = (widget.product['location'] ?? 'Koramangala, Bangalore').toString();
    final category = (widget.product['category'] ?? 'Mobiles').toString();
    final rating = (widget.product['rating'] ?? '4.9').toString();
    final accent = (widget.product['accent'] as Color?) ?? const Color(0xFF5C6BC0);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: Stack(
        children: [
          // ── Scrollable Body Content ────────────────────────────────────────
          CustomScrollView(
            physics: const BouncingScrollPhysics(),
            slivers: [
              // ── Image Gallery Hero Sliver Header ──────────────────────────
              SliverAppBar(
                expandedHeight: 320,
                pinned: true,
                backgroundColor: AppColors.appDark,
                elevation: 0,
                leading: Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.4),
                      shape: BoxShape.circle,
                    ),
                    child: IconButton(
                      icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white, size: 18),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ),
                ),
                actions: [
                  Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.4),
                        shape: BoxShape.circle,
                      ),
                      child: IconButton(
                        icon: Icon(
                          _isFavorite ? Icons.favorite : Icons.favorite_border,
                          color: _isFavorite ? Colors.red : Colors.white,
                          size: 20,
                        ),
                        onPressed: () {
                          setState(() => _isFavorite = !_isFavorite);
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(_isFavorite ? 'Saved to Favorites' : 'Removed from Favorites'),
                              duration: const Duration(seconds: 1),
                            ),
                          );
                        },
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.4),
                        shape: BoxShape.circle,
                      ),
                      child: IconButton(
                        icon: const Icon(Icons.share_outlined, color: Colors.white, size: 20),
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Listing link copied to clipboard')),
                          );
                        },
                      ),
                    ),
                  ),
                ],
                flexibleSpace: FlexibleSpaceBar(
                  background: Stack(
                    children: [
                      // Image PageView Carousel
                      PageView.builder(
                        itemCount: _dummyImages.length,
                        onPageChanged: (idx) => setState(() => _activeImageIndex = idx),
                        itemBuilder: (context, index) {
                          final img = _dummyImages[index];
                          final bg = img['color'] as Color;
                          final icon = img['icon'] as IconData;

                          return Container(
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: [bg, bg.withValues(alpha: 0.7)],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              ),
                            ),
                            child: Stack(
                              children: [
                                Positioned(
                                  right: -40,
                                  top: -40,
                                  child: Container(
                                    width: 220,
                                    height: 220,
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      color: Colors.white.withValues(alpha: 0.08),
                                    ),
                                  ),
                                ),
                                Center(
                                  child: Column(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(icon, size: 90, color: Colors.white.withValues(alpha: 0.9)),
                                      const SizedBox(height: 12),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                                        decoration: BoxDecoration(
                                          color: Colors.black.withValues(alpha: 0.3),
                                          borderRadius: BorderRadius.circular(20),
                                        ),
                                        child: Text(
                                          img['label'] as String,
                                          style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                      // Carousel Indicator Dots
                      Positioned(
                        bottom: 16,
                        left: 0,
                        right: 0,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: List.generate(_dummyImages.length, (idx) {
                            return AnimatedContainer(
                              duration: const Duration(milliseconds: 300),
                              width: idx == _activeImageIndex ? 22 : 8,
                              height: 8,
                              margin: const EdgeInsets.symmetric(horizontal: 3),
                              decoration: BoxDecoration(
                                color: idx == _activeImageIndex ? AppColors.appGreen : Colors.white.withValues(alpha: 0.5),
                                borderRadius: BorderRadius.circular(4),
                              ),
                            );
                          }),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // ── Main Details Body ─────────────────────────────────────────
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 20, 16, 100),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Category Tag & Condition Badge
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: accent.withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              category.toUpperCase(),
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: accent,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppColors.appGreen.withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Row(
                              children: [
                                Icon(Icons.verified, size: 12, color: AppColors.appGreen),
                                SizedBox(width: 4),
                                Text(
                                  'Like New',
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.appGreen,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const Spacer(),
                          const Icon(Icons.access_time_rounded, size: 12, color: Colors.black38),
                          const SizedBox(width: 4),
                          const Text(
                            '2h ago',
                            style: TextStyle(fontSize: 11, color: Colors.black38),
                          ),
                        ],
                      ),

                      const SizedBox(height: 12),

                      // Title
                      Text(
                        title,
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: AppColors.appDark,
                          height: 1.2,
                        ),
                      ),

                      const SizedBox(height: 12),

                      // Price Card Banner
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
                          ),
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.1),
                              blurRadius: 16,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Row(
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  price,
                                  style: const TextStyle(
                                    fontSize: 26,
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.appGreen,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Row(
                                  children: const [
                                    Text(
                                      '₹85,000',
                                      style: TextStyle(
                                        fontSize: 13,
                                        color: Colors.white38,
                                        decoration: TextDecoration.lineThrough,
                                      ),
                                    ),
                                    SizedBox(width: 8),
                                    Text(
                                      '8% OFF',
                                      style: TextStyle(
                                        fontSize: 11,
                                        color: Color(0xFFFFA726),
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                            const Spacer(),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Row(
                                children: [
                                  Icon(Icons.shield_outlined, color: Colors.white70, size: 16),
                                  SizedBox(width: 6),
                                  Text(
                                    'Fixed Price',
                                    style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w600),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 24),

                      // Seller Info Card
                      _buildSectionTitle('Seller Information'),
                      const SizedBox(height: 12),
                      GestureDetector(
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => const SellerProfileScreen(
                                sellerName: 'Alex Johnson',
                                isVerified: true,
                                rating: 4.8,
                                reviewCount: 34,
                                memberSince: '2022',
                              ),
                            ),
                          );
                        },
                        child: Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.04),
                                blurRadius: 12,
                              ),
                            ],
                          ),
                          child: Row(
                            children: [
                              Stack(
                                children: [
                                  Container(
                                    width: 52,
                                    height: 52,
                                    decoration: BoxDecoration(
                                      gradient: const LinearGradient(
                                        colors: [AppColors.appGreen, Color(0xFF3DA84A)],
                                      ),
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Center(
                                      child: Text(
                                        'A',
                                        style: TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 22,
                                        ),
                                      ),
                                    ),
                                  ),
                                  Positioned(
                                    bottom: 0,
                                    right: 0,
                                    child: Container(
                                      padding: const EdgeInsets.all(2),
                                      decoration: const BoxDecoration(
                                        color: Colors.white,
                                        shape: BoxShape.circle,
                                      ),
                                      child: const Icon(Icons.verified, size: 14, color: AppColors.appGreen),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text(
                                      'Alex Johnson',
                                      style: TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                        color: AppColors.appDark,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Row(
                                      children: [
                                        const Icon(Icons.star_rounded, size: 14, color: Colors.orange),
                                        const SizedBox(width: 4),
                                        Text(
                                          '$rating (34 reviews)',
                                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                                        ),
                                        const SizedBox(width: 8),
                                        const Text('•  Member 2 yrs', style: TextStyle(fontSize: 11, color: Colors.black45)),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                              const Icon(Icons.chevron_right, color: Colors.black26),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 24),

                      // Specifications Grid
                      _buildSectionTitle('Specifications'),
                      const SizedBox(height: 12),
                      GridView.count(
                        crossAxisCount: 2,
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        childAspectRatio: 2.8,
                        mainAxisSpacing: 10,
                        crossAxisSpacing: 10,
                        children: [
                          _specTile(Icons.branding_watermark_outlined, 'Brand', 'Apple'),
                          _specTile(Icons.memory_outlined, 'Storage', '256 GB'),
                          _specTile(Icons.palette_outlined, 'Color', 'Deep Purple'),
                          _specTile(Icons.battery_charging_full_outlined, 'Battery Health', '96%'),
                          _specTile(Icons.verified_outlined, 'Warranty', '6 Months Left'),
                          _specTile(Icons.inventory_2_outlined, 'Box & Bill', 'Available'),
                        ],
                      ),

                      const SizedBox(height: 24),

                      // Location Card
                      _buildSectionTitle('Location'),
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.04),
                              blurRadius: 12,
                            ),
                          ],
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: AppColors.appGreen.withValues(alpha: 0.1),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.location_on, color: AppColors.appGreen, size: 24),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    location,
                                    style: const TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.appDark,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  const Text(
                                    '~2.4 km away from your location',
                                    style: TextStyle(fontSize: 12, color: Colors.black45),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 24),

                      // Description
                      _buildSectionTitle('Description'),
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.04),
                              blurRadius: 12,
                            ),
                          ],
                        ),
                        child: const Text(
                          'Selling my pristine iPhone 14 Pro Max 256GB in Deep Purple.\n\n'
                          '• Condition: 10/10, scratchless body & original screen\n'
                          '• Includes: Original Box, Braided Type-C Cable & Spigen Case\n'
                          '• Reason for sale: Upgraded to iPhone 15 Pro Max\n'
                          '• Genuine buyers only. Price slightly negotiable on quick pickup.',
                          style: TextStyle(
                            fontSize: 13,
                            color: Colors.black87,
                            height: 1.6,
                          ),
                        ),
                      ),

                      const SizedBox(height: 24),

                      // Safety Banner
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFFF8E1),
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(color: const Color(0xFFFFE082)),
                        ),
                        child: Row(
                          children: const [
                            Icon(Icons.shield_rounded, color: Color(0xFFFFA726), size: 24),
                            SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                'Safety Tip: Meet seller in a public place. Inspect product thoroughly before making any payment.',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Color(0xFF795548),
                                  height: 1.3,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                      Center(
                        child: TextButton.icon(
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => ReportIssueScreen(
                                  targetTitle: title,
                                  targetId: widget.product['id'] ?? 'p1',
                                ),
                              ),
                            );
                          },
                          icon: const Icon(Icons.flag_outlined, color: Colors.redAccent, size: 18),
                          label: const Text(
                            'Report suspicious ad or seller',
                            style: TextStyle(color: Colors.redAccent, fontSize: 12, fontWeight: FontWeight.w700),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),

          // ── Sticky Bottom Action Bar ──────────────────────────────────────
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.1),
                    blurRadius: 20,
                    offset: const Offset(0, -4),
                  ),
                ],
              ),
              child: Row(
                children: [
                  // Make Offer Button
                  Expanded(
                    flex: 4,
                    child: SizedBox(
                      height: 52,
                      child: OutlinedButton(
                        onPressed: _showOfferDialog,
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: AppColors.appGreen, width: 1.5),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                        ),
                        child: const Text(
                          'Make Offer',
                          style: TextStyle(
                            color: AppColors.appGreen,
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  // Chat Now Button
                  Expanded(
                    flex: 6,
                    child: SizedBox(
                      height: 52,
                      child: ElevatedButton.icon(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => ChatConversationScreen(
                                chatData: {
                                  'id': 'conv-101',
                                  'itemTitle': title,
                                  'itemPrice': price,
                                  'sellerName': 'Alex Johnson',
                                  'sellerAvatar': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
                                  'itemImage': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=400&auto=format&fit=crop',
                                },
                              ),
                            ),
                          );
                        },
                        icon: const Icon(Icons.chat_bubble_outline_rounded, color: Colors.white, size: 20),
                        label: const Text(
                          'Chat with Seller',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                          ),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.appGreen,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                          elevation: 0,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 17,
        fontWeight: FontWeight.bold,
        color: AppColors.appDark,
      ),
    );
  }

  Widget _specTile(IconData icon, String label, String value) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        children: [
          Icon(icon, size: 18, color: AppColors.appBlue),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  label,
                  style: const TextStyle(fontSize: 10, color: Colors.black45),
                ),
                Text(
                  value,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: AppColors.appDark,
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
