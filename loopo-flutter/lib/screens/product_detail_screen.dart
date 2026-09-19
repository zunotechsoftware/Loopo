import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../services/product_service.dart';
import '../services/user_service.dart';
import '../services/favorites_service.dart';
import '../services/chat_service.dart';
import '../services/offer_service.dart';
import '../services/auth_session.dart';
import 'seller_profile_screen.dart';
import 'report_issue_screen.dart';
import 'chat_conversation_screen.dart';
import 'login_screen.dart';

class ProductDetailScreen extends StatefulWidget {
  final Map<String, dynamic> product;

  const ProductDetailScreen({super.key, required this.product});

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  final ProductService _productService = ProductService();
  final UserService _userService = UserService();
  final FavoritesService _favoritesService = FavoritesService();
  final ChatService _chatService = ChatService();
  final OfferService _offerService = OfferService();

  Map<String, dynamic>? _product;
  Map<String, dynamic>? _sellerProfile;
  bool _isLoading = true;
  String? _error;

  bool _isFavorite = false;
  String? _favoriteId;
  bool _isTogglingFavorite = false;
  bool _isStartingChat = false;

  int _activeImageIndex = 0;
  final TextEditingController _offerController = TextEditingController();

  String get _productId => widget.product['id']?.toString() ?? '';

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _offerController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    if (_productId.isEmpty) {
      setState(() {
        _isLoading = false;
        _error = 'This listing could not be found.';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final product = await _productService.getProductDetail(_productId);

      Map<String, dynamic>? sellerProfile;
      final seller = product['seller'];
      final sellerId = seller is Map ? seller['id']?.toString() : null;
      if (sellerId != null) {
        try {
          sellerProfile = await _userService.getPublicProfile(sellerId);
        } catch (_) {
          // Non-fatal - the listing itself still loaded.
        }
      }

      bool isFav = false;
      String? favId;
      if (AuthSession.isLoggedIn) {
        try {
          final favorites = await _favoritesService.getFavorites();
          for (final f in favorites) {
            if (f is Map && f['productId']?.toString() == _productId) {
              isFav = true;
              favId = f['id']?.toString();
              break;
            }
          }
        } catch (_) {
          // Non-fatal.
        }
      }

      if (!mounted) return;
      setState(() {
        _product = product;
        _sellerProfile = sellerProfile;
        _isFavorite = isFav;
        _favoriteId = favId;
        _isLoading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _error = 'Could not load this listing. Please try again.';
        _isLoading = false;
      });
    }
  }

  void _requireLogin(String action) {
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text('Please log in to $action.')));
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const LoginScreen()),
    );
  }

  Future<void> _toggleFavorite() async {
    if (!AuthSession.isLoggedIn) {
      _requireLogin('save listings');
      return;
    }
    if (_isTogglingFavorite) return;

    setState(() => _isTogglingFavorite = true);
    if (_isFavorite && _favoriteId != null) {
      final removedId = _favoriteId!;
      final ok = await _favoritesService.removeFavorite(removedId);
      if (!mounted) return;
      setState(() {
        _isTogglingFavorite = false;
        if (ok) {
          _isFavorite = false;
          _favoriteId = null;
        }
      });
      if (!ok) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Could not remove from favorites. Please try again.'),
          ),
        );
      }
    } else {
      final created = await _favoritesService.addFavorite(_productId);
      if (!mounted) return;
      setState(() {
        _isTogglingFavorite = false;
        if (created != null) {
          _isFavorite = true;
          _favoriteId = created['id']?.toString();
        }
      });
      if (created == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Could not save to favorites. Please try again.'),
          ),
        );
      }
    }
  }

  Future<void> _startChat() async {
    if (!AuthSession.isLoggedIn) {
      _requireLogin('chat with the seller');
      return;
    }
    if (_isStartingChat) return;

    setState(() => _isStartingChat = true);
    final conversation = await _chatService.startConversation(
      productId: _productId,
      initialMessage: 'Hi, I\'m interested in this listing.',
    );
    if (!mounted) return;
    setState(() => _isStartingChat = false);

    if (conversation == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Could not start a chat right now. Please try again.'),
        ),
      );
      return;
    }

    final product = _product!;
    final seller = product['seller'] is Map ? product['seller'] as Map : {};
    final sellerName = seller['firstName'] != null
        ? '${seller['firstName']} ${seller['lastName'] ?? ''}'.trim()
        : (_sellerProfile?['displayName'] ?? 'Seller').toString();

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => ChatConversationScreen(
          chatData: {
            'id': conversation['id']?.toString() ?? '',
            'sellerName': sellerName,
            'sellerAvatar': sellerName.isNotEmpty
                ? sellerName[0].toUpperCase()
                : 'S',
            'itemTitle': product['title'] ?? '',
            'itemPrice': _formatPrice(product),
            'productId': _productId,
          },
        ),
      ),
    );
  }

  String _formatPrice(Map<String, dynamic> product) {
    final price = product['price'];
    final currency = (product['currency'] ?? 'INR').toString();
    final symbol = currency == 'INR' ? '₹' : '$currency ';
    if (price is num) {
      final formatted = price.toInt().toString().replaceAllMapped(
        RegExp(r'(\d)(?=(\d{3})+(?!\d))'),
        (m) => '${m[1]},',
      );
      return '$symbol$formatted';
    }
    return '$symbol${price ?? 0}';
  }

  String _timeAgo(dynamic iso) {
    final dt = iso is String ? DateTime.tryParse(iso) : null;
    if (dt == null) return '';
    final diff = DateTime.now().difference(dt);
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 30) return '${diff.inDays}d ago';
    return '${dt.day}/${dt.month}/${dt.year}';
  }

  String _conditionLabel(dynamic condition) {
    final raw = (condition ?? '').toString();
    return raw
        .split('_')
        .map((w) => w.isEmpty ? w : '${w[0]}${w.substring(1).toLowerCase()}')
        .join(' ');
  }

  void _showOfferDialog() {
    final product = _product!;
    _offerController.clear();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) {
        bool isSubmitting = false;
        return StatefulBuilder(
          builder: (sheetContext, setSheetState) {
            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(sheetContext).viewInsets.bottom,
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
                      'Listed Price: ${_formatPrice(product)}',
                      style: const TextStyle(
                        fontSize: 13,
                        color: Colors.black54,
                      ),
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
                          borderSide: const BorderSide(
                            color: AppColors.appGreen,
                            width: 2,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    SizedBox(
                      width: double.infinity,
                      height: 52,
                      child: ElevatedButton(
                        onPressed: isSubmitting
                            ? null
                            : () async {
                                final amount = double.tryParse(
                                  _offerController.text.trim(),
                                );
                                if (amount == null || amount <= 0) {
                                  ScaffoldMessenger.of(
                                    sheetContext,
                                  ).showSnackBar(
                                    const SnackBar(
                                      content: Text(
                                        'Please enter a valid offer amount.',
                                      ),
                                    ),
                                  );
                                  return;
                                }
                                setSheetState(() => isSubmitting = true);
                                try {
                                  await _offerService.makeOffer(
                                    productId: _productId,
                                    amount: amount,
                                  );
                                  if (sheetContext.mounted)
                                    Navigator.pop(sheetContext);
                                  if (!mounted) return;
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text('Offer sent to seller!'),
                                      backgroundColor: AppColors.appGreen,
                                    ),
                                  );
                                } catch (e) {
                                  setSheetState(() => isSubmitting = false);
                                  if (!sheetContext.mounted) return;
                                  ScaffoldMessenger.of(
                                    sheetContext,
                                  ).showSnackBar(
                                    SnackBar(
                                      content: Text(
                                        e.toString().replaceFirst(
                                          'Exception: ',
                                          '',
                                        ),
                                      ),
                                    ),
                                  );
                                }
                              },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.appGreen,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                        ),
                        child: isSubmitting
                            ? const SizedBox(
                                width: 22,
                                height: 22,
                                child: CircularProgressIndicator(
                                  color: Colors.white,
                                  strokeWidth: 2,
                                ),
                              )
                            : const Text(
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
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: Color(0xFFF8FAFC),
        body: Center(
          child: CircularProgressIndicator(color: AppColors.appGreen),
        ),
      );
    }

    if (_error != null || _product == null) {
      return Scaffold(
        backgroundColor: const Color(0xFFF8FAFC),
        appBar: AppBar(
          backgroundColor: Colors.white,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(
              Icons.arrow_back_ios_new,
              color: AppColors.appDark,
              size: 18,
            ),
            onPressed: () => Navigator.pop(context),
          ),
        ),
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                _error ?? 'Listing not found',
                style: const TextStyle(color: Colors.black54),
              ),
              const SizedBox(height: 12),
              ElevatedButton(onPressed: _load, child: const Text('Retry')),
            ],
          ),
        ),
      );
    }

    final product = _product!;
    final title = (product['title'] ?? 'Untitled Listing').toString();
    final price = _formatPrice(product);
    final locationMap = product['location'] is Map
        ? product['location'] as Map
        : {};
    final location = [
      locationMap['city'],
      locationMap['state'],
    ].where((s) => s != null && s.toString().isNotEmpty).join(', ');
    final category = product['category'] is Map
        ? (product['category']['name'] ?? 'General').toString()
        : 'General';
    final condition = _conditionLabel(product['condition']);
    final description = (product['description'] ?? '').toString();
    final negotiable = product['negotiable'] == true;
    final images = product['images'] is List ? product['images'] as List : [];
    final attributes = product['attributes'] is List
        ? product['attributes'] as List
        : [];
    final sellerId = product['seller'] is Map
        ? product['seller']['id']?.toString()
        : null;
    final sellerName = product['seller'] is Map
        ? '${product['seller']['firstName'] ?? ''} ${product['seller']['lastName'] ?? ''}'
              .trim()
        : '';
    final displaySellerName = sellerName.isNotEmpty
        ? sellerName
        : (_sellerProfile?['displayName'] ?? 'Seller').toString();
    final sellerInitial = displaySellerName.isNotEmpty
        ? displaySellerName[0].toUpperCase()
        : 'S';
    final sellerRating = (_sellerProfile?['sellerRating'] is num)
        ? (_sellerProfile!['sellerRating'] as num).toDouble()
        : 0.0;
    final sellerReviewCount = _sellerProfile?['reviewCount'] ?? 0;
    final sellerVerified = _sellerProfile?['verifiedBadge'] == true;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: Stack(
        children: [
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
                      icon: const Icon(
                        Icons.arrow_back_ios_new,
                        color: Colors.white,
                        size: 18,
                      ),
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
                        icon: _isTogglingFavorite
                            ? const Padding(
                                padding: EdgeInsets.all(2),
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Colors.white,
                                ),
                              )
                            : Icon(
                                _isFavorite
                                    ? Icons.favorite
                                    : Icons.favorite_border,
                                color: _isFavorite ? Colors.red : Colors.white,
                                size: 20,
                              ),
                        onPressed: _toggleFavorite,
                      ),
                    ),
                  ),
                ],
                flexibleSpace: FlexibleSpaceBar(
                  background: images.isEmpty
                      ? Container(
                          color: AppColors.appDark,
                          child: const Center(
                            child: Icon(
                              Icons.image_not_supported_outlined,
                              color: Colors.white38,
                              size: 64,
                            ),
                          ),
                        )
                      : Stack(
                          children: [
                            PageView.builder(
                              itemCount: images.length,
                              onPageChanged: (idx) =>
                                  setState(() => _activeImageIndex = idx),
                              itemBuilder: (context, index) {
                                final img = images[index] as Map;
                                final url =
                                    (img['originalUrl'] ??
                                            img['thumbnailUrl'] ??
                                            '')
                                        .toString();
                                return url.isEmpty
                                    ? Container(color: AppColors.appDark)
                                    : Image.network(
                                        url,
                                        fit: BoxFit.cover,
                                        width: double.infinity,
                                        errorBuilder: (_, _, _) => Container(
                                          color: AppColors.appDark,
                                          child: const Center(
                                            child: Icon(
                                              Icons.broken_image_outlined,
                                              color: Colors.white38,
                                              size: 48,
                                            ),
                                          ),
                                        ),
                                      );
                              },
                            ),
                            if (images.length > 1)
                              Positioned(
                                bottom: 16,
                                left: 0,
                                right: 0,
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: List.generate(images.length, (idx) {
                                    return AnimatedContainer(
                                      duration: const Duration(
                                        milliseconds: 300,
                                      ),
                                      width: idx == _activeImageIndex ? 22 : 8,
                                      height: 8,
                                      margin: const EdgeInsets.symmetric(
                                        horizontal: 3,
                                      ),
                                      decoration: BoxDecoration(
                                        color: idx == _activeImageIndex
                                            ? AppColors.appGreen
                                            : Colors.white.withValues(
                                                alpha: 0.5,
                                              ),
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
                            padding: const EdgeInsets.symmetric(
                              horizontal: 10,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.appBlue.withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              category.toUpperCase(),
                              style: const TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: AppColors.appBlue,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ),
                          if (condition.isNotEmpty) ...[
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 10,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: AppColors.appGreen.withValues(
                                  alpha: 0.12,
                                ),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Row(
                                children: [
                                  const Icon(
                                    Icons.verified,
                                    size: 12,
                                    color: AppColors.appGreen,
                                  ),
                                  const SizedBox(width: 4),
                                  Text(
                                    condition,
                                    style: const TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.appGreen,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                          const Spacer(),
                          if (product['createdAt'] != null) ...[
                            const Icon(
                              Icons.access_time_rounded,
                              size: 12,
                              color: Colors.black38,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              _timeAgo(product['createdAt']),
                              style: const TextStyle(
                                fontSize: 11,
                                color: Colors.black38,
                              ),
                            ),
                          ],
                        ],
                      ),

                      const SizedBox(height: 12),

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
                            Text(
                              price,
                              style: const TextStyle(
                                fontSize: 26,
                                fontWeight: FontWeight.bold,
                                color: AppColors.appGreen,
                              ),
                            ),
                            const Spacer(),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 8,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Row(
                                children: [
                                  Icon(
                                    negotiable
                                        ? Icons.handshake_outlined
                                        : Icons.shield_outlined,
                                    color: Colors.white70,
                                    size: 16,
                                  ),
                                  const SizedBox(width: 6),
                                  Text(
                                    negotiable ? 'Negotiable' : 'Fixed Price',
                                    style: const TextStyle(
                                      color: Colors.white70,
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600,
                                    ),
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
                        onTap: sellerId == null
                            ? null
                            : () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) =>
                                        SellerProfileScreen(sellerId: sellerId),
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
                                    decoration: const BoxDecoration(
                                      gradient: LinearGradient(
                                        colors: [
                                          AppColors.appGreen,
                                          Color(0xFF3DA84A),
                                        ],
                                      ),
                                      shape: BoxShape.circle,
                                    ),
                                    child: Center(
                                      child: Text(
                                        sellerInitial,
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 22,
                                        ),
                                      ),
                                    ),
                                  ),
                                  if (sellerVerified)
                                    Positioned(
                                      bottom: 0,
                                      right: 0,
                                      child: Container(
                                        padding: const EdgeInsets.all(2),
                                        decoration: const BoxDecoration(
                                          color: Colors.white,
                                          shape: BoxShape.circle,
                                        ),
                                        child: const Icon(
                                          Icons.verified,
                                          size: 14,
                                          color: AppColors.appGreen,
                                        ),
                                      ),
                                    ),
                                ],
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      displaySellerName,
                                      style: const TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                        color: AppColors.appDark,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Row(
                                      children: [
                                        const Icon(
                                          Icons.star_rounded,
                                          size: 14,
                                          color: Colors.orange,
                                        ),
                                        const SizedBox(width: 4),
                                        Text(
                                          sellerRating > 0
                                              ? '${sellerRating.toStringAsFixed(1)} ($sellerReviewCount reviews)'
                                              : 'New seller',
                                          style: const TextStyle(
                                            fontSize: 12,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                              const Icon(
                                Icons.chevron_right,
                                color: Colors.black26,
                              ),
                            ],
                          ),
                        ),
                      ),

                      if (attributes.isNotEmpty) ...[
                        const SizedBox(height: 24),
                        _buildSectionTitle('Specifications'),
                        const SizedBox(height: 12),
                        GridView.count(
                          crossAxisCount: 2,
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          childAspectRatio: 2.8,
                          mainAxisSpacing: 10,
                          crossAxisSpacing: 10,
                          children: attributes.map((attr) {
                            final map = attr as Map;
                            final attribute = map['attribute'] is Map
                                ? map['attribute'] as Map
                                : {};
                            return _specTile(
                              Icons.info_outline,
                              (attribute['name'] ?? 'Detail').toString(),
                              (map['value'] ?? '').toString(),
                            );
                          }).toList(),
                        ),
                      ],

                      if (location.isNotEmpty) ...[
                        const SizedBox(height: 24),
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
                                  color: AppColors.appGreen.withValues(
                                    alpha: 0.1,
                                  ),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(
                                  Icons.location_on,
                                  color: AppColors.appGreen,
                                  size: 24,
                                ),
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Text(
                                  location,
                                  style: const TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.appDark,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],

                      const SizedBox(height: 24),

                      _buildSectionTitle('Description'),
                      const SizedBox(height: 12),
                      Container(
                        width: double.infinity,
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
                        child: Text(
                          description.isNotEmpty
                              ? description
                              : 'No description provided.',
                          style: const TextStyle(
                            fontSize: 13,
                            color: Colors.black87,
                            height: 1.6,
                          ),
                        ),
                      ),

                      const SizedBox(height: 24),

                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFFF8E1),
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(color: const Color(0xFFFFE082)),
                        ),
                        child: const Row(
                          children: [
                            Icon(
                              Icons.shield_rounded,
                              color: Color(0xFFFFA726),
                              size: 24,
                            ),
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
                                  targetId: _productId,
                                  targetType: 'LISTING',
                                ),
                              ),
                            );
                          },
                          icon: const Icon(
                            Icons.flag_outlined,
                            color: Colors.redAccent,
                            size: 18,
                          ),
                          label: const Text(
                            'Report suspicious ad or seller',
                            style: TextStyle(
                              color: Colors.redAccent,
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
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
                  if (negotiable) ...[
                    Expanded(
                      flex: 4,
                      child: SizedBox(
                        height: 52,
                        child: OutlinedButton(
                          onPressed: () {
                            if (!AuthSession.isLoggedIn) {
                              _requireLogin('make an offer');
                              return;
                            }
                            _showOfferDialog();
                          },
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(
                              color: AppColors.appGreen,
                              width: 1.5,
                            ),
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
                  ],
                  Expanded(
                    flex: 6,
                    child: SizedBox(
                      height: 52,
                      child: ElevatedButton.icon(
                        onPressed: _isStartingChat ? null : _startChat,
                        icon: _isStartingChat
                            ? const SizedBox(
                                width: 18,
                                height: 18,
                                child: CircularProgressIndicator(
                                  color: Colors.white,
                                  strokeWidth: 2,
                                ),
                              )
                            : const Icon(
                                Icons.chat_bubble_outline_rounded,
                                color: Colors.white,
                                size: 20,
                              ),
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
