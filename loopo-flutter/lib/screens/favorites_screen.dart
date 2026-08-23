import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../services/favorites_service.dart';
import 'product_detail_screen.dart';

class FavoritesScreen extends StatefulWidget {
  const FavoritesScreen({super.key});

  @override
  State<FavoritesScreen> createState() => _FavoritesScreenState();
}

class _FavoritesScreenState extends State<FavoritesScreen> {
  final FavoritesService _favoritesService = FavoritesService();
  List<Map<String, dynamic>> _savedItems = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadFavorites();
  }

  Future<void> _loadFavorites() async {
    setState(() => _isLoading = true);
    try {
      final items = await _favoritesService.getFavorites();
      setState(() {
        _savedItems = items.map<Map<String, dynamic>>((item) {
          final product = item['product'] ?? item;
          final images = product['images'] as List? ?? [];
          return {
            'id': item['id']?.toString() ?? product['id']?.toString() ?? '',
            'productId': product['id']?.toString() ?? '',
            'title': product['title'] ?? 'Item',
            'price': '₹${(product['price'] ?? 0).toString()}',
            'location': product['location'] is Map
                ? '${product['location']['city'] ?? ''}, ${product['location']['state'] ?? ''}'
                : product['location']?.toString() ?? '',
            'category': product['category'] is Map
                ? product['category']['name'] ?? 'General'
                : product['category']?.toString() ?? 'General',
            'date': item['createdAt'] != null
                ? 'Saved ${_formatDate(DateTime.tryParse(item['createdAt']))}'
                : 'Saved recently',
            'accent': AppColors.appGreen,
            'imageUrl': images.isNotEmpty
                ? (images.first is String ? images.first : images.first['url'] ?? '')
                : '',
          };
        }).toList();
        _isLoading = false;
      });
    } catch (_) {
      setState(() => _isLoading = false);
    }
  }

  String _formatDate(DateTime? dt) {
    if (dt == null) return 'recently';
    final diff = DateTime.now().difference(dt);
    if (diff.inDays == 0) return 'today';
    if (diff.inDays == 1) return 'yesterday';
    return '${diff.inDays} days ago';
  }

  void _removeFavorite(String id) {
    setState(() {
      _savedItems.removeWhere((i) => i['id'] == id);
    });
    _favoritesService.removeFavorite(id);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Removed from Favorites'),
        duration: Duration(seconds: 1),
      ),
    );
  }

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
        title: Text(
          'Saved Favorites (${_savedItems.length})',
          style: const TextStyle(
            color: AppColors.appDark,
            fontFamily: 'Poppins',
            fontWeight: FontWeight.w800,
            fontSize: 18,
          ),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _savedItems.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        width: 70,
                        height: 70,
                        decoration: BoxDecoration(
                          color: Colors.red.withValues(alpha: 0.1),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.favorite_border_rounded, size: 36, color: Colors.red),
                      ),
                      const SizedBox(height: 14),
                      const Text(
                        'No saved items yet',
                        style: TextStyle(
                          fontFamily: 'Poppins',
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: AppColors.appDark,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Tap the heart icon on any ad to save it here for quick access.',
                        textAlign: TextAlign.center,
                        style: TextStyle(fontFamily: 'Poppins', fontSize: 12, color: Colors.grey.shade500),
                      ),
                    ],
                  ),
                )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _savedItems.length,
              itemBuilder: (context, index) {
                final item = _savedItems[index];
                final accent = item['accent'] as Color? ?? AppColors.appGreen;

                return InkWell(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => ProductDetailScreen(product: item),
                      ),
                    );
                  },
                  borderRadius: BorderRadius.circular(16),
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 14),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.03),
                          blurRadius: 10,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        // Thumbnail
                        Container(
                          width: 80,
                          height: 80,
                          decoration: BoxDecoration(
                            color: accent.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Icon(Icons.shopping_bag_rounded, size: 36, color: accent),
                        ),
                        const SizedBox(width: 12),

                        // Details
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: accent.withValues(alpha: 0.15),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      item['category'].toString(),
                                      style: TextStyle(
                                        fontFamily: 'Poppins',
                                        fontSize: 9,
                                        fontWeight: FontWeight.bold,
                                        color: accent,
                                      ),
                                    ),
                                  ),
                                  IconButton(
                                    icon: const Icon(Icons.favorite, color: Colors.red, size: 20),
                                    padding: EdgeInsets.zero,
                                    constraints: const BoxConstraints(),
                                    onPressed: () => _removeFavorite(item['id']),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(
                                item['title'].toString(),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  fontFamily: 'Poppins',
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.appDark,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                item['price'].toString(),
                                style: const TextStyle(
                                  fontFamily: 'Poppins',
                                  fontSize: 14,
                                  fontWeight: FontWeight.w800,
                                  color: AppColors.appGreen,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                item['location'].toString(),
                                style: TextStyle(
                                  fontFamily: 'Poppins',
                                  fontSize: 10,
                                  color: Colors.grey.shade500,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}
