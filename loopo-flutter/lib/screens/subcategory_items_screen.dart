import 'package:flutter/material.dart';
import '../services/category_service.dart';
import '../theme/app_colors.dart';
import 'product_detail_screen.dart';

class SubcategoryItemsScreen extends StatefulWidget {
  final String categoryName;
  final String categoryId;
  final List<dynamic> subcategories;

  const SubcategoryItemsScreen({
    super.key,
    required this.categoryName,
    this.categoryId = '',
    this.subcategories = const [],
  });

  @override
  State<SubcategoryItemsScreen> createState() => _SubcategoryItemsScreenState();
}

class _SubcategoryItemsScreenState extends State<SubcategoryItemsScreen> {
  int _selectedSubcategoryIndex = 0; // 0 means 'All'

  // Pre-defined static subcategories mapping if empty
  late List<Map<String, String>> _subCategoryList;

  static const Map<String, List<Map<String, String>>>
  _fallbackSubcategoriesMap = {
    'Mobiles': [
      {'name': 'All', 'id': 'all'},
      {'name': 'Smartphones', 'id': 'smartphones'},
      {'name': 'Tablets', 'id': 'tablets'},
      {'name': 'Accessories', 'id': 'accessories'},
      {'name': 'Chargers', 'id': 'chargers'},
      {'name': 'Smartwatches', 'id': 'smartwatches'},
    ],
    'Cars': [
      {'name': 'All', 'id': 'all'},
      {'name': 'Sedans', 'id': 'sedans'},
      {'name': 'SUVs', 'id': 'suvs'},
      {'name': 'Hatchbacks', 'id': 'hatchbacks'},
      {'name': 'Luxury', 'id': 'luxury'},
      {'name': 'Spare Parts', 'id': 'spare-parts'},
    ],
    'Bikes': [
      {'name': 'All', 'id': 'all'},
      {'name': 'Motorcycles', 'id': 'motorcycles'},
      {'name': 'Scooters', 'id': 'scooters'},
      {'name': 'Bicycles', 'id': 'bicycles'},
      {'name': 'Riding Gear', 'id': 'riding-gear'},
    ],
    'Electronics': [
      {'name': 'All', 'id': 'all'},
      {'name': 'Laptops', 'id': 'laptops'},
      {'name': 'Televisions', 'id': 'tvs'},
      {'name': 'Cameras', 'id': 'cameras'},
      {'name': 'Audio & Headphones', 'id': 'audio'},
      {'name': 'Gaming', 'id': 'gaming'},
    ],
    'Furniture': [
      {'name': 'All', 'id': 'all'},
      {'name': 'Sofas & Recliners', 'id': 'sofas'},
      {'name': 'Beds & Wardrobes', 'id': 'beds'},
      {'name': 'Tables & Chairs', 'id': 'tables'},
      {'name': 'Office Setup', 'id': 'office'},
    ],
    'Fashion': [
      {'name': 'All', 'id': 'all'},
      {'name': 'Men\'s Wear', 'id': 'mens'},
      {'name': 'Women\'s Wear', 'id': 'womens'},
      {'name': 'Footwear', 'id': 'footwear'},
      {'name': 'Bags', 'id': 'bags'},
      {'name': 'Watches', 'id': 'watches'},
    ],
  };

  final CategoryService _categoryService = CategoryService();
  List<dynamic> _apiProducts = [];
  bool _isLoadingApiProducts = false;

  @override
  void initState() {
    super.initState();
    _initSubcategories();
    _fetchApiData();
  }

  Future<void> _fetchApiData() async {
    // 1. Fetch subcategories from backend DB if not passed
    final apiSubcats = await _categoryService.getSubcategories(
      widget.categoryId.isNotEmpty ? widget.categoryId : widget.categoryName,
    );
    if (mounted && apiSubcats.isNotEmpty) {
      setState(() {
        _subCategoryList = [
          {'name': 'All', 'id': 'all'},
          ...apiSubcats.map(
            (sub) => {
              'name': (sub['name'] ?? sub['label'] ?? '').toString(),
              'id': (sub['id'] ?? sub['slug'] ?? '').toString(),
            },
          ),
        ];
      });
    }

    // 2. Fetch real products from search API
    setState(() => _isLoadingApiProducts = true);
    final products = await _categoryService.searchProducts(
      categoryId: widget.categoryId.isNotEmpty ? widget.categoryId : null,
      query: widget.categoryName,
    );
    if (mounted) {
      setState(() {
        _apiProducts = products;
        _isLoadingApiProducts = false;
      });
    }
  }

  void _initSubcategories() {
    if (widget.subcategories.isNotEmpty) {
      _subCategoryList = [
        {'name': 'All', 'id': 'all'},
        ...widget.subcategories.map(
          (sub) => {
            'name': (sub['name'] ?? sub['label'] ?? '').toString(),
            'id': (sub['id'] ?? sub['slug'] ?? '').toString(),
          },
        ),
      ];
    } else {
      _subCategoryList =
          _fallbackSubcategoriesMap[widget.categoryName] ??
          [
            {'name': 'All', 'id': 'all'},
            {'name': 'Popular', 'id': 'popular'},
            {'name': 'Newest', 'id': 'newest'},
            {'name': 'Featured', 'id': 'featured'},
          ];
    }
  }

  // Previously fell back to a hardcoded, unrelated product catalog whenever
  // the real search returned zero results - indistinguishable from a
  // genuine "no listings match" state. Now honestly returns empty instead.
  List<Map<String, dynamic>> _filteredProducts() {
    return _apiProducts
        .map((p) => Map<String, dynamic>.from(p as Map))
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    final items = _filteredProducts();

    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
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
        title: Text(
          widget.categoryName,
          style: const TextStyle(
            color: AppColors.appDark,
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.search_rounded, color: AppColors.appDark),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.tune_rounded, color: AppColors.appDark),
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Horizontal Subcategory Tab Selector Bar ───────────────────────
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 12),
            child: SizedBox(
              height: 38,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                separatorBuilder: (_, _) => const SizedBox(width: 8),
                itemCount: _subCategoryList.length,
                itemBuilder: (context, index) {
                  final sub = _subCategoryList[index];
                  final isSelected = index == _selectedSubcategoryIndex;

                  return GestureDetector(
                    onTap: () {
                      setState(() {
                        _selectedSubcategoryIndex = index;
                      });
                    },
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? AppColors.appGreen
                            : const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: isSelected
                            ? [
                                BoxShadow(
                                  color: AppColors.appGreen.withValues(
                                    alpha: 0.3,
                                  ),
                                  blurRadius: 8,
                                  offset: const Offset(0, 3),
                                ),
                              ]
                            : [],
                      ),
                      child: Text(
                        sub['name']!,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: isSelected
                              ? FontWeight.bold
                              : FontWeight.w600,
                          color: isSelected ? Colors.white : AppColors.appDark,
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
          ),

          const SizedBox(height: 12),

          // Subcategory item count header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${_subCategoryList[_selectedSubcategoryIndex]['name']} Items',
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: AppColors.appDark,
                  ),
                ),
                Text(
                  '${items.length} listings found',
                  style: const TextStyle(fontSize: 12, color: Colors.black45),
                ),
              ],
            ),
          ),

          const SizedBox(height: 12),

          // ── Items Grid ────────────────────────────────────────────────────
          Expanded(
            child: _isLoadingApiProducts
                ? const Center(
                    child: CircularProgressIndicator(color: AppColors.appGreen),
                  )
                : items.isEmpty
                ? _buildEmptySubcategoryState()
                : GridView.builder(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
                    physics: const BouncingScrollPhysics(),
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          childAspectRatio: 0.72,
                          crossAxisSpacing: 12,
                          mainAxisSpacing: 12,
                        ),
                    itemCount: items.length,
                    itemBuilder: (context, index) {
                      final item = items[index];
                      return _buildProductCard(item);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptySubcategoryState() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.04),
                  blurRadius: 16,
                ),
              ],
            ),
            child: const Icon(
              Icons.search_off_rounded,
              size: 48,
              color: Colors.black38,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'No items in ${_subCategoryList[_selectedSubcategoryIndex]['name']}',
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: AppColors.appDark,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Check back soon or explore other subcategories.',
            style: TextStyle(fontSize: 12, color: Colors.black45),
          ),
        ],
      ),
    );
  }

  Widget _buildProductCard(Map<String, dynamic> item) {
    final title = item['title'].toString();
    final price = item['price'].toString();
    final location = item['location'].toString();
    final accent = (item['accent'] as Color?) ?? const Color(0xFF5C6BC0);

    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => ProductDetailScreen(product: item)),
        );
      },
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
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
            // Image card header
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      accent.withValues(alpha: 0.15),
                      accent.withValues(alpha: 0.05),
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: const BorderRadius.vertical(
                    top: Radius.circular(20),
                  ),
                ),
                child: Stack(
                  children: [
                    Center(
                      child: Icon(
                        Icons.shopping_bag_outlined,
                        size: 42,
                        color: accent,
                      ),
                    ),
                    Positioned(
                      top: 8,
                      right: 8,
                      child: Container(
                        padding: const EdgeInsets.all(5),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.9),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.favorite_border,
                          size: 14,
                          color: Colors.black38,
                        ),
                      ),
                    ),
                    Positioned(
                      top: 8,
                      left: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 6,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.appGreen,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          item['condition'] ?? 'Verified',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            // Details
            Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    price,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                      color: AppColors.appGreen,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppColors.appDark,
                      height: 1.2,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(
                        Icons.location_on_outlined,
                        size: 10,
                        color: Colors.black38,
                      ),
                      const SizedBox(width: 2),
                      Expanded(
                        child: Text(
                          location,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 10,
                            color: Colors.black38,
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
      ),
    );
  }
}
