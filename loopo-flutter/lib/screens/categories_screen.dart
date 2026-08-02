import 'package:flutter/material.dart';
import '../config/debug_config.dart';
import '../services/category_service.dart';
import '../theme/app_colors.dart';

// TODO: [Backend Integration] Fetch root categories from GET /api/v1/categories
// TODO: [Backend Integration] Fetch nested category tree from GET /api/v1/categories/tree
// TODO: [Backend Integration] Filter products by selected category via GET /api/v1/products?categoryId=:id


class CategoriesScreen extends StatefulWidget {
  const CategoriesScreen({super.key});

  @override
  State<CategoriesScreen> createState() => _CategoriesScreenState();
}

class _CategoriesScreenState extends State<CategoriesScreen> {
  final CategoryService _categoryService = CategoryService();
  List<dynamic> _categoriesTree = [];
  bool _isLoading = true;
  int _selectedParentIndex = 0;
  String _searchQuery = '';

  // Premium pre-defined static fallback categories with subcategories in case API returns empty
  static final List<Map<String, dynamic>> _fallbackCategories = [
    {
      'id': 'mobiles',
      'name': 'Mobiles',
      'icon': 'phone_android',
      'children': [
        {'id': 'smartphones', 'name': 'Smartphones'},
        {'id': 'tablets', 'name': 'Tablets'},
        {'id': 'accessories', 'name': 'Accessories'},
        {'id': 'chargers', 'name': 'Chargers & Cables'},
        {'id': 'smartwatches', 'name': 'Smartwatches'},
      ],
    },
    {
      'id': 'cars',
      'name': 'Cars',
      'icon': 'directions_car',
      'children': [
        {'id': 'sedans', 'name': 'Sedans'},
        {'id': 'suvs', 'name': 'SUVs'},
        {'id': 'hatchbacks', 'name': 'Hatchbacks'},
        {'id': 'luxury', 'name': 'Luxury Cars'},
        {'id': 'spare-parts', 'name': 'Spare Parts'},
      ],
    },
    {
      'id': 'bikes',
      'name': 'Bikes',
      'icon': 'motorcycle',
      'children': [
        {'id': 'motorcycles', 'name': 'Motorcycles'},
        {'id': 'scooters', 'name': 'Scooters'},
        {'id': 'bicycles', 'name': 'Bicycles'},
        {'id': 'riding-gear', 'name': 'Riding Gear'},
      ],
    },
    {
      'id': 'electronics',
      'name': 'Electronics',
      'icon': 'tv',
      'children': [
        {'id': 'laptops', 'name': 'Laptops & PCs'},
        {'id': 'tvs', 'name': 'Televisions'},
        {'id': 'cameras', 'name': 'Cameras & Lenses'},
        {'id': 'headphones', 'name': 'Headphones & Speakers'},
        {'id': 'gaming', 'name': 'Gaming Consoles'},
      ],
    },
    {
      'id': 'furniture',
      'name': 'Furniture',
      'icon': 'chair',
      'children': [
        {'id': 'sofas', 'name': 'Sofas & Recliners'},
        {'id': 'beds', 'name': 'Beds & Wardrobes'},
        {'id': 'tables-chairs', 'name': 'Tables & Chairs'},
        {'id': 'office-furniture', 'name': 'Office Setup'},
      ],
    },
    {
      'id': 'fashion',
      'name': 'Fashion',
      'icon': 'shopping_bag',
      'children': [
        {'id': 'mens-wear', 'name': 'Men\'s Wear'},
        {'id': 'womens-wear', 'name': 'Women\'s Wear'},
        {'id': 'footwear', 'name': 'Footwear'},
        {'id': 'bags-luggage', 'name': 'Bags & Luggage'},
        {'id': 'watches-jewelry', 'name': 'Watches & Jewelry'},
      ],
    },
    {
      'id': 'books',
      'name': 'Books',
      'icon': 'book',
      'children': [
        {'id': 'fiction', 'name': 'Fiction & Novels'},
        {'id': 'textbooks', 'name': 'Textbooks & Study'},
        {'id': 'comics', 'name': 'Comics & Manga'},
        {'id': 'biographies', 'name': 'Biographies'},
      ],
    },
    {
      'id': 'home-living',
      'name': 'Home & Living',
      'icon': 'lightbulb',
      'children': [
        {'id': 'kitchenware', 'name': 'Kitchen Appliances'},
        {'id': 'home-decor', 'name': 'Home Decor'},
        {'id': 'gardening', 'name': 'Gardening & Outdoor'},
        {'id': 'lighting', 'name': 'Lighting & Bulbs'},
      ],
    },
  ];

  @override
  void initState() {
    super.initState();
    _fetchCategories();
  }

  Future<void> _fetchCategories() async {
    setState(() => _isLoading = true);
    if (DebugConfig.isActive) {
      setState(() {
        _categoriesTree = _fallbackCategories;
        _isLoading = false;
      });
      return;
    }
    final tree = await _categoryService.getCategoryTree();
    setState(() {
      _categoriesTree = tree.isNotEmpty ? tree : _fallbackCategories;
      _isLoading = false;
    });
  }

  IconData _getIconData(String? iconName) {
    if (iconName == null) return Icons.category;
    switch (iconName.toLowerCase()) {
      case 'phone_android':
      case 'mobiles':
        return Icons.phone_android;
      case 'directions_car':
      case 'cars':
        return Icons.directions_car;
      case 'motorcycle':
      case 'bikes':
        return Icons.motorcycle;
      case 'tv':
      case 'electronics':
        return Icons.tv;
      case 'chair':
      case 'furniture':
        return Icons.chair;
      case 'shopping_bag':
      case 'fashion':
        return Icons.shopping_bag;
      case 'book':
      case 'books':
        return Icons.book;
      case 'lightbulb':
      case 'home-living':
      case 'home':
        return Icons.lightbulb;
      default:
        return Icons.grid_view_rounded;
    }
  }

  List<dynamic> _getFilteredCategories() {
    if (_searchQuery.isEmpty) {
      return _categoriesTree;
    }
    return _categoriesTree.where((parent) {
      final nameMatches = parent['name'].toString().toLowerCase().contains(_searchQuery.toLowerCase());
      final children = parent['children'] as List<dynamic>? ?? [];
      final childMatches = children.any((c) => c['name'].toString().toLowerCase().contains(_searchQuery.toLowerCase()));
      return nameMatches || childMatches;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final filteredCategories = _getFilteredCategories();
    final activeParent = filteredCategories.isNotEmpty && _selectedParentIndex < filteredCategories.length
        ? filteredCategories[_selectedParentIndex]
        : null;

    final subcategories = activeParent != null
        ? (activeParent['children'] as List<dynamic>? ?? [])
        : [];

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text(
          'All Categories',
          style: TextStyle(
            fontFamily: 'Poppins',
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
        elevation: 0,
        backgroundColor: AppColors.appDark,
        foregroundColor: Colors.white,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 20),
          onPressed: () => Navigator.of(context).pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _fetchCategories,
          ),
        ],
      ),
      body: Column(
        children: [
          // Search Bar Section
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.04),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: TextField(
              onChanged: (val) {
                setState(() {
                  _searchQuery = val;
                  _selectedParentIndex = 0; // reset parent tab select
                });
              },
              decoration: InputDecoration(
                hintText: 'Search categories...',
                hintStyle: TextStyle(color: Colors.grey.shade400),
                prefixIcon: const Icon(Icons.search, color: AppColors.appBlue),
                filled: true,
                fillColor: AppColors.appGrey,
                contentPadding: const EdgeInsets.symmetric(vertical: 12),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppColors.appBlue, width: 1.5),
                ),
              ),
            ),
          ),
          
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : filteredCategories.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.category_outlined, size: 60, color: Colors.grey.shade300),
                            const SizedBox(height: 12),
                            const Text(
                              'No categories found',
                              style: TextStyle(color: Colors.black54, fontSize: 16),
                            ),
                          ],
                        ),
                      )
                    : Row(
                        children: [
                          // Left Pane: Parent Categories list
                          Container(
                            width: 110,
                            color: AppColors.appGrey,
                            child: ListView.builder(
                              itemCount: filteredCategories.length,
                              itemBuilder: (context, index) {
                                final parent = filteredCategories[index];
                                final isSelected = index == _selectedParentIndex;
                                return InkWell(
                                  onTap: () {
                                    setState(() {
                                      _selectedParentIndex = index;
                                    });
                                  },
                                  child: AnimatedContainer(
                                    duration: const Duration(milliseconds: 200),
                                    padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 12),
                                    decoration: BoxDecoration(
                                      color: isSelected ? Colors.white : Colors.transparent,
                                      border: Border(
                                        left: BorderSide(
                                          color: isSelected ? AppColors.appGreen : Colors.transparent,
                                          width: 4,
                                        ),
                                      ),
                                    ),
                                    child: Column(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Icon(
                                          _getIconData(parent['icon']?.toString()),
                                          color: isSelected ? AppColors.appGreen : Colors.black54,
                                          size: 24,
                                        ),
                                        const SizedBox(height: 8),
                                        Text(
                                          parent['name'].toString(),
                                          textAlign: TextAlign.center,
                                          style: TextStyle(
                                            fontSize: 12,
                                            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                            color: isSelected ? AppColors.appDark : Colors.black87,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                );
                              },
                            ),
                          ),

                          // Right Pane: Nested subcategories
                          Expanded(
                            child: Container(
                              color: Colors.white,
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  if (activeParent != null) ...[
                                    Text(
                                      'Browse ${activeParent['name']}',
                                      style: const TextStyle(
                                        fontFamily: 'Poppins',
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    const SizedBox(height: 16),
                                  ],
                                  Expanded(
                                    child: subcategories.isEmpty
                                        ? const Center(
                                            child: Text(
                                              'No subcategories listed',
                                              style: TextStyle(color: Colors.black38),
                                            ),
                                          )
                                        : GridView.builder(
                                            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                                              crossAxisCount: 2,
                                              crossAxisSpacing: 12,
                                              mainAxisSpacing: 12,
                                              childAspectRatio: 2.2,
                                            ),
                                            itemCount: subcategories.length,
                                            itemBuilder: (context, index) {
                                              final sub = subcategories[index];
                                              return InkWell(
                                                onTap: () {
                                                  ScaffoldMessenger.of(context).showSnackBar(
                                                    SnackBar(
                                                      content: Text('Selected category: ${sub['name']}'),
                                                      duration: const Duration(seconds: 1),
                                                    ),
                                                  );
                                                },
                                                child: Container(
                                                  alignment: Alignment.center,
                                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                                                  decoration: BoxDecoration(
                                                    color: AppColors.appGrey,
                                                    borderRadius: BorderRadius.circular(12),
                                                    border: Border.all(color: Colors.grey.shade200),
                                                  ),
                                                  child: Text(
                                                    sub['name'].toString(),
                                                    textAlign: TextAlign.center,
                                                    style: const TextStyle(
                                                      fontSize: 12,
                                                      fontWeight: FontWeight.w600,
                                                      color: AppColors.appDark,
                                                    ),
                                                  ),
                                                ),
                                              );
                                            },
                                          ),
                                  ),
                                ],
                              ),
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
