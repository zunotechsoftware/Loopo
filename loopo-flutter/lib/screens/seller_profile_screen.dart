import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../services/user_service.dart';
import '../services/product_service.dart';
import 'product_detail_screen.dart';

class SellerProfileScreen extends StatefulWidget {
  final String sellerId;

  const SellerProfileScreen({super.key, required this.sellerId});

  @override
  State<SellerProfileScreen> createState() => _SellerProfileScreenState();
}

class _SellerProfileScreenState extends State<SellerProfileScreen> {
  final UserService _userService = UserService();
  final ProductService _productService = ProductService();

  Map<String, dynamic>? _profile;
  List<dynamic> _listings = [];
  bool _isLoading = true;
  String? _error;

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
    try {
      final profile = await _userService.getPublicProfile(widget.sellerId);
      List<dynamic> listings = [];
      try {
        final result = await _productService.getPublicListings(
          sellerId: widget.sellerId,
          limit: 10,
        );
        listings = result['items'] is List ? result['items'] : [];
      } catch (_) {
        // Non-fatal - the profile itself still loaded.
      }
      if (!mounted) return;
      setState(() {
        _profile = profile;
        _listings = listings;
        _isLoading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _error = 'Could not load this seller\'s profile.';
        _isLoading = false;
      });
    }
  }

  String _memberSinceYear(dynamic iso) {
    final dt = iso is String ? DateTime.tryParse(iso) : null;
    return dt?.year.toString() ?? '';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAFAFA),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        iconTheme: const IconThemeData(color: Colors.black87),
        title: const Text(
          'Seller Profile',
          style: TextStyle(
            color: Colors.black87,
            fontWeight: FontWeight.w800,
            fontSize: 18,
          ),
        ),
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.emerald600),
            )
          : (_error != null || _profile == null)
          ? Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    _error ?? 'Seller not found',
                    style: const TextStyle(color: Colors.black54),
                  ),
                  const SizedBox(height: 12),
                  ElevatedButton(onPressed: _load, child: const Text('Retry')),
                ],
              ),
            )
          : _buildContent(),
    );
  }

  Widget _buildContent() {
    final profile = _profile!;
    final displayName = (profile['displayName'] ?? 'Seller').toString();
    final isVerified = profile['verifiedBadge'] == true;
    final rating = (profile['sellerRating'] is num)
        ? (profile['sellerRating'] as num).toDouble()
        : 0.0;
    final reviewCount = profile['reviewCount'] ?? 0;
    final totalListings = profile['totalListings'] ?? _listings.length;
    final memberSince = _memberSinceYear(profile['memberSince']);
    final avatarUrl = profile['profilePicture']?.toString();

    return SingleChildScrollView(
      child: Column(
        children: [
          // Seller Header Card
          Container(
            color: Colors.white,
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                Stack(
                  alignment: Alignment.bottomRight,
                  children: [
                    CircleAvatar(
                      radius: 44,
                      backgroundColor: AppColors.emerald600.withValues(
                        alpha: 0.12,
                      ),
                      backgroundImage:
                          (avatarUrl != null && avatarUrl.isNotEmpty)
                          ? NetworkImage(avatarUrl)
                          : null,
                      child: (avatarUrl == null || avatarUrl.isEmpty)
                          ? Text(
                              displayName.isNotEmpty
                                  ? displayName[0].toUpperCase()
                                  : '?',
                              style: const TextStyle(
                                fontSize: 32,
                                fontWeight: FontWeight.bold,
                                color: AppColors.emerald600,
                              ),
                            )
                          : null,
                    ),
                    if (isVerified)
                      Container(
                        padding: const EdgeInsets.all(4),
                        decoration: const BoxDecoration(
                          color: AppColors.emerald600,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.verified,
                          color: Colors.white,
                          size: 16,
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      displayName,
                      style: const TextStyle(
                        fontWeight: FontWeight.w900,
                        fontSize: 20,
                      ),
                    ),
                    if (isVerified) ...[
                      const SizedBox(width: 4),
                      const Icon(
                        Icons.verified,
                        color: AppColors.emerald600,
                        size: 18,
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 4),
                if (memberSince.isNotEmpty)
                  Text(
                    'Member since $memberSince',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey.shade600,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                const SizedBox(height: 12),
                // Rating & Reviews Stats Row
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.amber.shade50,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.amber.shade200),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.star, color: Colors.amber, size: 16),
                          const SizedBox(width: 4),
                          Text(
                            rating > 0 ? rating.toStringAsFixed(1) : 'New',
                            style: TextStyle(
                              fontWeight: FontWeight.w900,
                              fontSize: 13,
                              color: Colors.amber.shade900,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      '($reviewCount ratings & reviews)',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey.shade600,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // Active Listings Section
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Active Listings by Seller',
                      style: TextStyle(
                        fontWeight: FontWeight.w900,
                        fontSize: 16,
                      ),
                    ),
                    Text(
                      '$totalListings Items',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: Colors.grey.shade600,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                if (_listings.isEmpty)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 24),
                    child: Center(
                      child: Text(
                        'No active listings yet',
                        style: TextStyle(color: Colors.grey.shade500),
                      ),
                    ),
                  )
                else
                  ..._listings.map((item) {
                    final map = item as Map;
                    final images = map['images'] is List
                        ? map['images'] as List
                        : [];
                    String imageUrl = '';
                    if (images.isNotEmpty && images.first is Map) {
                      final first = images.first as Map;
                      imageUrl =
                          (first['thumbnailUrl'] ?? first['originalUrl'] ?? '')
                              .toString();
                    }
                    final location = map['location'] is Map
                        ? map['location'] as Map
                        : {};
                    final locationStr = [location['city'], location['state']]
                        .where((s) => s != null && s.toString().isNotEmpty)
                        .join(', ');

                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: GestureDetector(
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => ProductDetailScreen(
                                product: {'id': map['id']?.toString() ?? ''},
                              ),
                            ),
                          );
                        },
                        child: _buildSellerProductCard(
                          title: (map['title'] ?? 'Untitled Listing')
                              .toString(),
                          price: '₹${map['price'] ?? 0}',
                          location: locationStr.isNotEmpty
                              ? locationStr
                              : 'Location not set',
                          imageUrl: imageUrl,
                        ),
                      ),
                    );
                  }),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSellerProductCard({
    required String title,
    required String price,
    required String location,
    required String imageUrl,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: imageUrl.isNotEmpty
                ? Image.network(
                    imageUrl,
                    width: 80,
                    height: 80,
                    fit: BoxFit.cover,
                    errorBuilder: (_, _, _) => Container(
                      width: 80,
                      height: 80,
                      color: Colors.grey.shade100,
                      child: const Icon(
                        Icons.image_not_supported_outlined,
                        color: Colors.grey,
                      ),
                    ),
                  )
                : Container(
                    width: 80,
                    height: 80,
                    color: Colors.grey.shade100,
                    child: const Icon(
                      Icons.shopping_bag_outlined,
                      color: Colors.grey,
                    ),
                  ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontWeight: FontWeight.w800,
                    fontSize: 13,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  price,
                  style: const TextStyle(
                    fontWeight: FontWeight.w900,
                    fontSize: 15,
                    color: AppColors.emerald600,
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(Icons.location_on, size: 12, color: Colors.grey),
                    const SizedBox(width: 2),
                    Expanded(
                      child: Text(
                        location,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 10,
                          color: Colors.grey,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
