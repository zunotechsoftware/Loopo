import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import 'product_detail_screen.dart';

class FavoritesScreen extends StatefulWidget {
  const FavoritesScreen({super.key});

  @override
  State<FavoritesScreen> createState() => _FavoritesScreenState();
}

class _FavoritesScreenState extends State<FavoritesScreen> {
  final List<Map<String, dynamic>> _savedItems = [
    {
      'id': 'fav_1',
      'title': 'iPhone 14 Pro Max - 256GB Deep Purple',
      'price': '₹78,500',
      'location': 'Koramangala, Bangalore',
      'category': 'Mobiles',
      'rating': '4.9',
      'accent': const Color(0xFF5C6BC0),
      'date': 'Saved yesterday',
    },
    {
      'id': 'fav_2',
      'title': 'Sony Bravia 55" 4K OLED Smart TV',
      'price': '₹52,000',
      'location': 'Indiranagar, Bangalore',
      'category': 'Electronics',
      'rating': '4.7',
      'accent': const Color(0xFFFFA726),
      'date': 'Saved 3 days ago',
    },
    {
      'id': 'fav_3',
      'title': 'Royal Enfield Classic 350 (2022 Model)',
      'price': '₹1,45,000',
      'location': 'HSR Layout, Bangalore',
      'category': 'Bikes',
      'rating': '4.8',
      'accent': const Color(0xFF26A69A),
      'date': 'Saved 1 week ago',
    },
    {
      'id': 'fav_4',
      'title': 'MacBook Pro 14" M2 Pro (16GB/512GB)',
      'price': '₹1,35,000',
      'location': 'MG Road, Bangalore',
      'category': 'Electronics',
      'rating': '5.0',
      'accent': const Color(0xFF29B6F6),
      'date': 'Saved 2 weeks ago',
    },
  ];

  void _removeFavorite(String id) {
    setState(() {
      _savedItems.removeWhere((item) => item['id'] == id);
    });
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
      body: _savedItems.isEmpty
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
