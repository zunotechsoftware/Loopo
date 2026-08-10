import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import 'product_detail_screen.dart';

class SearchScreen extends StatefulWidget {
  final String initialQuery;

  const SearchScreen({
    super.key,
    this.initialQuery = '',
  });

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  late TextEditingController _searchController;
  RangeValues _priceRange = const RangeValues(0, 150000);
  String _selectedCategory = 'All';
  String _selectedRadius = '25 km';

  final List<String> _recentSearches = [
    'iPhone 14',
    'Royal Enfield 350',
    'PlayStation 5',
    'Office Chair',
    'MacBook Pro',
  ];

  final List<String> _categories = [
    'All',
    'Mobiles',
    'Vehicles',
    'Electronics',
    'Furniture',
    'Fashion',
    'Books',
  ];

  final List<Map<String, dynamic>> _allListings = [
    {
      'id': 's1',
      'title': 'iPhone 14 Pro Max - 256GB Deep Purple',
      'price': '₹78,500',
      'rawPrice': 78500,
      'location': 'Koramangala, Bangalore',
      'category': 'Mobiles',
      'rating': '4.9',
      'accent': const Color(0xFF5C6BC0),
    },
    {
      'id': 's2',
      'title': 'Sony Bravia 55" 4K OLED Smart TV',
      'price': '₹52,000',
      'rawPrice': 52000,
      'location': 'Indiranagar, Bangalore',
      'category': 'Electronics',
      'rating': '4.7',
      'accent': const Color(0xFFFFA726),
    },
    {
      'id': 's3',
      'title': 'Royal Enfield Classic 350 (2022 Model)',
      'price': '₹1,45,000',
      'rawPrice': 145000,
      'location': 'HSR Layout, Bangalore',
      'category': 'Vehicles',
      'rating': '4.8',
      'accent': const Color(0xFF26A69A),
    },
    {
      'id': 's4',
      'title': 'MacBook Pro 14" M2 Pro (16GB/512GB)',
      'price': '₹1,35,000',
      'rawPrice': 135000,
      'location': 'MG Road, Bangalore',
      'category': 'Electronics',
      'rating': '5.0',
      'accent': const Color(0xFF29B6F6),
    },
    {
      'id': 's5',
      'title': 'Ergonomic Executive Office Chair',
      'price': '₹6,500',
      'rawPrice': 6500,
      'location': 'Whitefield, Bangalore',
      'category': 'Furniture',
      'rating': '4.6',
      'accent': const Color(0xFF66BB6A),
    },
    {
      'id': 's6',
      'title': 'Mahindra Thar LX 4x4 Hardtop (2023)',
      'price': '₹14,20,000',
      'rawPrice': 1420000,
      'location': 'Marathahalli, Bangalore',
      'category': 'Vehicles',
      'rating': '4.9',
      'accent': const Color(0xFFEF5350),
    },
  ];

  @override
  void initState() {
    super.initState();
    _searchController = TextEditingController(text: widget.initialQuery);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  List<Map<String, dynamic>> get _filteredResults {
    final query = _searchController.text.trim().toLowerCase();

    return _allListings.where((item) {
      final matchesQuery = query.isEmpty ||
          item['title'].toString().toLowerCase().contains(query) ||
          item['category'].toString().toLowerCase().contains(query);

      final matchesCategory = _selectedCategory == 'All' ||
          item['category'].toString().toLowerCase() == _selectedCategory.toLowerCase();

      final price = item['rawPrice'] as num;
      final matchesPrice = price >= _priceRange.start && price <= _priceRange.end;

      return matchesQuery && matchesCategory && matchesPrice;
    }).toList();
  }

  void _showFilterModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Container(
              height: MediaQuery.of(context).size.height * 0.70,
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              padding: const EdgeInsets.all(20),
              child: Column(
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
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Search Filters', style: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.bold, fontSize: 18, color: AppColors.appDark)),
                      TextButton(
                        onPressed: () {
                          setModalState(() {
                            _selectedCategory = 'All';
                            _priceRange = const RangeValues(0, 150000);
                            _selectedRadius = '25 km';
                          });
                        },
                        child: const Text('Reset All', style: TextStyle(fontFamily: 'Poppins', color: Colors.red)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Category Filter
                  const Text('Category', style: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 8),
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: _categories.map((cat) {
                        final isSel = cat == _selectedCategory;
                        return Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: ChoiceChip(
                            label: Text(cat, style: TextStyle(fontFamily: 'Poppins', fontSize: 12, color: isSel ? Colors.white : AppColors.appDark)),
                            selected: isSel,
                            selectedColor: AppColors.appGreen,
                            backgroundColor: const Color(0xFFF1F5F9),
                            onSelected: (_) => setModalState(() => _selectedCategory = cat),
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Price Range Filter
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Price Range', style: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.bold, fontSize: 13)),
                      Text(
                        '₹${_priceRange.start.round()} - ₹${_priceRange.end.round()}',
                        style: const TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.bold, color: AppColors.appGreen, fontSize: 13),
                      ),
                    ],
                  ),
                  RangeSlider(
                    values: _priceRange,
                    min: 0,
                    max: 200000,
                    divisions: 40,
                    activeColor: AppColors.appGreen,
                    inactiveColor: Colors.grey.shade200,
                    onChanged: (val) => setModalState(() => _priceRange = val),
                  ),
                  const SizedBox(height: 16),

                  // Distance Radius
                  const Text('Distance Radius', style: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 8),
                  Row(
                    children: ['5 km', '10 km', '25 km', '50 km'].map((radius) {
                      final isSel = radius == _selectedRadius;
                      return Expanded(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 4),
                          child: ChoiceChip(
                            label: Text(radius, style: TextStyle(fontFamily: 'Poppins', fontSize: 11, color: isSel ? Colors.white : AppColors.appDark)),
                            selected: isSel,
                            selectedColor: AppColors.appGreen,
                            onSelected: (_) => setModalState(() => _selectedRadius = radius),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                  const Spacer(),

                  // Apply Button
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      onPressed: () {
                        setState(() {});
                        Navigator.pop(context);
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.appGreen,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      child: const Text('Apply Filters', style: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.bold, color: Colors.white)),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final results = _filteredResults;

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
        title: Container(
          height: 42,
          decoration: BoxDecoration(
            color: const Color(0xFFF1F5F9),
            borderRadius: BorderRadius.circular(12),
          ),
          child: TextField(
            controller: _searchController,
            autofocus: widget.initialQuery.isEmpty,
            onChanged: (_) => setState(() {}),
            style: const TextStyle(fontFamily: 'Poppins', fontSize: 13),
            decoration: InputDecoration(
              hintText: 'Search electronics, bikes, cars...',
              hintStyle: TextStyle(fontFamily: 'Poppins', fontSize: 13, color: Colors.grey.shade400),
              prefixIcon: Icon(Icons.search_rounded, size: 20, color: Colors.grey.shade500),
              suffixIcon: _searchController.text.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear_rounded, size: 18),
                      onPressed: () {
                        _searchController.clear();
                        setState(() {});
                      },
                    )
                  : null,
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(vertical: 10),
            ),
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.tune_rounded, color: AppColors.appGreen),
            onPressed: _showFilterModal,
          ),
        ],
      ),
      body: Column(
        children: [
          // Recent Searches Quick Bar (if query empty)
          if (_searchController.text.isEmpty) ...[
            Container(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
              color: Colors.white,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Recent Searches', style: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.bold, fontSize: 12, color: Colors.black54)),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 6,
                    children: _recentSearches.map((term) {
                      return ActionChip(
                        label: Text(term, style: const TextStyle(fontFamily: 'Poppins', fontSize: 11)),
                        backgroundColor: const Color(0xFFF1F5F9),
                        side: BorderSide.none,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        onPressed: () {
                          _searchController.text = term;
                          setState(() {});
                        },
                      );
                    }).toList(),
                  ),
                ],
              ),
            ),
            const Divider(height: 1, color: Color(0xFFE2E8F0)),
          ],

          // Search Results Grid
          Expanded(
            child: results.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.search_off_rounded, size: 48, color: Colors.grey),
                        const SizedBox(height: 12),
                        Text(
                          'No products found matching "${_searchController.text}"',
                          style: const TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.bold, fontSize: 14),
                        ),
                        const SizedBox(height: 4),
                        Text('Try searching with different keywords or reset filters.', style: TextStyle(fontFamily: 'Poppins', fontSize: 12, color: Colors.grey.shade500)),
                      ],
                    ),
                  )
                : GridView.builder(
                    padding: const EdgeInsets.all(16),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      mainAxisSpacing: 12,
                      crossAxisSpacing: 12,
                      childAspectRatio: 0.75,
                    ),
                    itemCount: results.length,
                    itemBuilder: (context, index) {
                      final item = results[index];
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
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: const Color(0xFFE2E8F0)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                height: 110,
                                decoration: BoxDecoration(
                                  color: accent.withValues(alpha: 0.12),
                                  borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                                ),
                                child: Center(
                                  child: Icon(Icons.shopping_bag_rounded, size: 40, color: accent),
                                ),
                              ),
                              Padding(
                                padding: const EdgeInsets.all(10),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      item['price'].toString(),
                                      style: const TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.w800, fontSize: 14, color: AppColors.appGreen),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      item['title'].toString(),
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(fontFamily: 'Poppins', fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.appDark),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      item['location'].toString(),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: TextStyle(fontFamily: 'Poppins', fontSize: 10, color: Colors.grey.shade500),
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
          ),
        ],
      ),
    );
  }
}
