import 'package:flutter/material.dart';
import 'categories_screen.dart';
import 'profile_screen.dart';
import 'notification_list_screen.dart';
import 'product_detail_screen.dart';
import 'subcategory_items_screen.dart';
import '../services/category_service.dart';
import '../services/location_service.dart';
import '../theme/app_colors.dart';
import 'sell/sell_flow_screen.dart';

// TODO: [Backend Integration] Fetch products/listings from GET /api/v1/products?categories=...&search=...&page=1
// TODO: [Backend Integration] Fetch active promotional banners from GET /api/v1/admin/announcements or banners API
// TODO: [Backend Integration] Fetch recommended user feed from GET /api/v1/analytics/recommendations
// TODO: [Backend Integration] Wire search bar filter query parameters to GET /api/v1/search/products

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen>
    with SingleTickerProviderStateMixin {
  int _selectedIndex = 0;
  final CategoryService _categoryService = CategoryService();
  final LocationService _locationService = LocationService();
  List<dynamic> _categories = [];
  bool _isLoadingCategories = true;
  bool _isDetectingLocation = false;
  late AnimationController _bannerController;
  int _activeBanner = 0;

  // Selected filter categories for search context (starts empty)
  final List<String> _selectedFilterCategories = [];

  static const List<Map<String, dynamic>> _staticCategories = [
    {'icon': Icons.phone_android, 'label': 'Mobiles', 'name': 'Mobiles'},
    {'icon': Icons.directions_car, 'label': 'Cars', 'name': 'Cars'},
    {'icon': Icons.motorcycle, 'label': 'Bikes', 'name': 'Bikes'},
    {'icon': Icons.tv, 'label': 'Electronics', 'name': 'Electronics'},
    {'icon': Icons.chair, 'label': 'Furniture', 'name': 'Furniture'},
    {'icon': Icons.shopping_bag, 'label': 'Fashion', 'name': 'Fashion'},
    {'icon': Icons.book, 'label': 'Books', 'name': 'Books'},
    {'icon': Icons.lightbulb, 'label': 'Home & Living', 'name': 'Home'},
  ];

  static const List<Map<String, dynamic>> _banners = [
    {
      'title': 'Sell Faster,\nEarn More',
      'subtitle': 'List your first item free today',
      'gradient': [Color(0xFF0F172A), Color(0xFF1E3A5F)],
      'accent': AppColors.appGreen,
      'icon': Icons.sell_rounded,
    },
    {
      'title': 'Top Deals\nNear You',
      'subtitle': 'Verified listings in your city',
      'gradient': [Color(0xFF1a1a2e), Color(0xFF16213e)],
      'accent': Color(0xFF5C6BC0),
      'icon': Icons.local_offer_rounded,
    },
    {
      'title': 'Safe &\nSecure',
      'subtitle': 'Buyer protection on every deal',
      'gradient': [Color(0xFF0d2137), Color(0xFF1b4332)],
      'accent': Color(0xFF26A69A),
      'icon': Icons.verified_user_rounded,
    },
  ];

  // Masonry data — varied heights create the staggered grid effect
  static const List<Map<String, dynamic>> _masonryListings = [
    {
      'title': 'iPhone 14 Pro Max',
      'price': '₹78,500',
      'location': 'Koramangala',
      'category': 'Mobiles',
      'rating': '4.9',
      'tall': true,
      'accent': Color(0xFF5C6BC0),
    },
    {
      'title': 'Honda Civic 2020',
      'price': '₹14,25,000',
      'location': 'Indiranagar',
      'category': 'Cars',
      'rating': '4.7',
      'tall': false,
      'accent': Color(0xFFEF5350),
    },
    {
      'title': 'Royal Enfield Classic 350',
      'price': '₹1,65,000',
      'location': 'HSR Layout',
      'category': 'Bikes',
      'rating': '4.8',
      'tall': false,
      'accent': Color(0xFF26A69A),
    },
    {
      'title': 'Sony 65" OLED 4K TV',
      'price': '₹1,20,000',
      'location': 'Whitefield',
      'category': 'Electronics',
      'rating': '4.6',
      'tall': true,
      'accent': Color(0xFFFFA726),
    },
    {
      'title': 'L-Shape Sofa Set',
      'price': '₹32,000',
      'location': 'JP Nagar',
      'category': 'Furniture',
      'rating': '4.5',
      'tall': false,
      'accent': Color(0xFFAB47BC),
    },
    {
      'title': 'MacBook Pro M2',
      'price': '₹1,35,000',
      'location': 'MG Road',
      'category': 'Electronics',
      'rating': '5.0',
      'tall': true,
      'accent': Color(0xFF29B6F6),
    },
  ];

  static const List<Map<String, dynamic>> _trendingSearches = [
    {'label': 'iPhone 14', 'icon': Icons.phone_iphone_outlined},
    {'label': 'Used Cars', 'icon': Icons.directions_car_outlined},
    {'label': 'Apartments', 'icon': Icons.apartment_outlined},
    {'label': 'Laptop', 'icon': Icons.laptop_outlined},
    {'label': 'Bicycle', 'icon': Icons.pedal_bike_outlined},
  ];

  @override
  void initState() {
    super.initState();
    _loadCategories();
    _detectLocationOnLaunch();
    _bannerController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..addStatusListener((s) {
        if (s == AnimationStatus.completed) {
          setState(() => _activeBanner = (_activeBanner + 1) % _banners.length);
          _bannerController.forward(from: 0);
        }
      });
    _bannerController.forward();
  }

  Future<void> _detectLocationOnLaunch() async {
    setState(() => _isDetectingLocation = true);
    await _locationService.detectCurrentLocation();
    if (mounted) {
      setState(() => _isDetectingLocation = false);
    }
  }

  @override
  void dispose() {
    _bannerController.dispose();
    super.dispose();
  }

  Future<void> _loadCategories() async {
    setState(() => _isLoadingCategories = true);
    try {
      final fetched = await _categoryService.getRootCategories();
      setState(() {
        _categories = fetched.isNotEmpty ? fetched : _staticCategories;
        _isLoadingCategories = false;
      });
    } catch (_) {
      setState(() {
        _categories = _staticCategories;
        _isLoadingCategories = false;
      });
    }
  }

  IconData _getIconData(String? key) {
    final k = (key ?? '').toLowerCase();
    if (k.contains('phone') || k.contains('mobile')) return Icons.phone_android;
    if (k.contains('car') || k.contains('direction')) return Icons.directions_car;
    if (k.contains('bike') || k.contains('motorcycle')) return Icons.motorcycle;
    if (k.contains('tv') || k.contains('electronic')) return Icons.tv;
    if (k.contains('chair') || k.contains('furniture')) return Icons.chair;
    if (k.contains('bag') || k.contains('fashion')) return Icons.shopping_bag;
    if (k.contains('book')) return Icons.book;
    if (k.contains('bulb') || k.contains('home') || k.contains('living')) return Icons.lightbulb;
    return Icons.grid_view_rounded;
  }

  Color _categoryAccent(String label) {
    final colors = [
      const Color(0xFF5C6BC0),
      const Color(0xFFEF5350),
      const Color(0xFF26A69A),
      const Color(0xFFFFA726),
      const Color(0xFFAB47BC),
      const Color(0xFF29B6F6),
      const Color(0xFF66BB6A),
      const Color(0xFFFF8A65),
    ];
    return colors[label.hashCode.abs() % colors.length];
  }

  void _onItemTapped(int index) {
    if (index == 1) {
      Navigator.push(context,
          MaterialPageRoute(builder: (_) => const CategoriesScreen()));
      return;
    }
    if (index == 4) {
      Navigator.push(context,
          MaterialPageRoute(builder: (_) => const ProfileScreen()));
      return;
    }
    setState(() => _selectedIndex = index);
  }

  void _showCategoryFilterModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Container(
              height: MediaQuery.of(context).size.height * 0.65,
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Handle bar
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
                      const Text(
                        'Filter by Category',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: AppColors.appDark,
                        ),
                      ),
                      TextButton(
                        onPressed: () {
                          setState(() => _selectedFilterCategories.clear());
                          setModalState(() {});
                        },
                        child: const Text(
                          'Clear all',
                          style: TextStyle(color: Colors.red, fontSize: 13),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Select one or multiple categories to set your search context:',
                    style: TextStyle(color: Colors.black45, fontSize: 12),
                  ),
                  const SizedBox(height: 16),
                  Expanded(
                    child: ListView.separated(
                      itemCount: (_categories.isNotEmpty ? _categories : _staticCategories).length,
                      separatorBuilder: (_, _) => const Divider(height: 1),
                      itemBuilder: (context, index) {
                        final catList = _categories.isNotEmpty ? _categories : _staticCategories;
                        final cat = catList[index];
                        final label = (cat['name'] ?? cat['label'] ?? 'Category').toString();
                        final IconData icon = cat['icon'] is IconData
                            ? cat['icon']
                            : _getIconData((cat['icon'] ?? cat['name'])?.toString());
                        final isSelected = _selectedFilterCategories.contains(label);

                        return CheckboxListTile(
                          value: isSelected,
                          activeColor: AppColors.appGreen,
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12)),
                          secondary: Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: _categoryAccent(label).withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Icon(icon, size: 20, color: _categoryAccent(label)),
                          ),
                          title: Text(
                            label,
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight:
                                  isSelected ? FontWeight.bold : FontWeight.w500,
                              color: isSelected
                                  ? AppColors.appGreen
                                  : AppColors.appDark,
                            ),
                          ),
                          onChanged: (checked) {
                            setState(() {
                              if (checked == true) {
                                if (!_selectedFilterCategories.contains(label)) {
                                  _selectedFilterCategories.add(label);
                                }
                              } else {
                                _selectedFilterCategories.remove(label);
                              }
                            });
                            setModalState(() {});
                          },
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      onPressed: () => Navigator.pop(context),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.appGreen,
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16)),
                      ),
                      child: Text(
                        'Apply Filters (${_selectedFilterCategories.length})',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 15,
                        ),
                      ),
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

  void _showLocationPickerModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom,
              ),
              child: Container(
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
                        const Text(
                          'Select Location',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: AppColors.appDark,
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.close_rounded, size: 20),
                          onPressed: () => Navigator.pop(context),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    // Auto-Detect Location Button
                    InkWell(
                      onTap: () async {
                        Navigator.pop(context);
                        setState(() => _isDetectingLocation = true);
                        final loc = await _locationService.detectCurrentLocation();
                        if (mounted && context.mounted) {
                          setState(() => _isDetectingLocation = false);
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(
                                _locationService.isRealGps
                                    ? '📍 GPS Location: ${loc['city']}, ${loc['country']}'
                                    : 'Location updated to ${loc['city']}, ${loc['country']}',
                              ),
                              backgroundColor: AppColors.appGreen,
                            ),
                          );
                        }
                      },
                      borderRadius: BorderRadius.circular(16),
                      child: Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: AppColors.appGreen.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.appGreen.withValues(alpha: 0.3)),
                        ),
                        child: Row(
                          children: const [
                            Icon(Icons.my_location_rounded, color: AppColors.appGreen, size: 22),
                            SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Use Current Location',
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 14,
                                      color: AppColors.appGreen,
                                    ),
                                  ),
                                  SizedBox(height: 2),
                                  Text(
                                    'Using IP & Device GPS for precise city',
                                    style: TextStyle(fontSize: 11, color: Colors.black45),
                                  ),
                                ],
                              ),
                            ),
                            Icon(Icons.chevron_right, color: AppColors.appGreen, size: 20),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(height: 20),
                    const Text(
                      'Popular Cities',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: AppColors.appDark,
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Popular Cities Grid
                    Expanded(
                      child: GridView.builder(
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          childAspectRatio: 2.8,
                          crossAxisSpacing: 10,
                          mainAxisSpacing: 10,
                        ),
                        itemCount: LocationService.popularCities.length,
                        itemBuilder: (context, index) {
                          final c = LocationService.popularCities[index];
                          final isSelected = c['city'] == _locationService.currentCity;

                          return InkWell(
                            onTap: () {
                              setState(() {
                                _locationService.setLocation(
                                  city: c['city']!,
                                  state: c['state']!,
                                  country: c['country']!,
                                );
                              });
                              Navigator.pop(context);
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text('Location changed to ${c['city']}'),
                                  backgroundColor: AppColors.appGreen,
                                  duration: const Duration(seconds: 1),
                                ),
                              );
                            },
                            borderRadius: BorderRadius.circular(14),
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 200),
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              decoration: BoxDecoration(
                                color: isSelected ? AppColors.appGreen.withValues(alpha: 0.12) : const Color(0xFFF8FAFC),
                                borderRadius: BorderRadius.circular(14),
                                border: Border.all(
                                  color: isSelected ? AppColors.appGreen : Colors.grey.shade200,
                                  width: isSelected ? 1.5 : 1,
                                ),
                              ),
                              child: Row(
                                children: [
                                  Icon(
                                    Icons.location_city_rounded,
                                    size: 18,
                                    color: isSelected ? AppColors.appGreen : Colors.black45,
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        Text(
                                          c['city']!,
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          style: TextStyle(
                                            fontSize: 13,
                                            fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                                            color: isSelected ? AppColors.appGreen : AppColors.appDark,
                                          ),
                                        ),
                                        Text(
                                          c['state']!,
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          style: const TextStyle(fontSize: 10, color: Colors.black38),
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
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          // ── Sticky Header (No back button, Loopo logo fit cleanly) ───────
          SliverAppBar(
            pinned: true,
            floating: false,
            automaticallyImplyLeading: false, // Ensures no back button
            expandedHeight: 0,
            backgroundColor: Colors.white,
            elevation: 0,
            shadowColor: Colors.black12,
            surfaceTintColor: Colors.transparent,
            title: Row(
              children: [
                // Fit Loopo Logo in Header
                Image.asset(
                  "assets/images/loopo.png",
                  height: 32,
                  fit: BoxFit.contain,
                  errorBuilder: (_, _, _) => Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.appGreen,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Text(
                      'LOOP-O',
                      style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 14),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                GestureDetector(
                  onTap: _showLocationPickerModal,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.location_on, size: 12, color: AppColors.appGreen),
                          const SizedBox(width: 2),
                          Text(
                            _isDetectingLocation ? 'Locating...' : _locationService.formattedLocation,
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: AppColors.appDark,
                            ),
                          ),
                          const Icon(Icons.keyboard_arrow_down, size: 14, color: Colors.black45),
                        ],
                      ),
                    ],
                  ),
                ),
                const Spacer(),
                // Notification Icon -> Opens NotificationsListScreen
                GestureDetector(
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (_) => const NotificationsListScreen()),
                  ),
                  child: Stack(
                    clipBehavior: Clip.none,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(9),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF5F7FA),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(Icons.notifications_outlined,
                            size: 22, color: AppColors.appDark),
                      ),
                      Positioned(
                        top: 6,
                        right: 6,
                        child: Container(
                          width: 8,
                          height: 8,
                          decoration: const BoxDecoration(
                            color: Color(0xFFEF5350),
                            shape: BoxShape.circle,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 10),
                // Profile Avatar shortcut
                GestureDetector(
                  onTap: () => Navigator.push(context,
                      MaterialPageRoute(builder: (_) => const ProfileScreen())),
                  child: Container(
                    width: 38,
                    height: 38,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [AppColors.appGreen, Color(0xFF3DA84A)],
                      ),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Center(
                      child: Icon(Icons.person_outline,
                          size: 20, color: Colors.white),
                    ),
                  ),
                ),
              ],
            ),
          ),

          SliverToBoxAdapter(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ── Search Bar with Filter Icon ──────────────────────────
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 12),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(18),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.05),
                              blurRadius: 16,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.search_rounded,
                                color: AppColors.appGreen, size: 22),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                _selectedFilterCategories.isEmpty
                                    ? 'Search cars, mobiles, furniture…'
                                    : 'Searching in ${_selectedFilterCategories.join(", ")}…',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                  color: _selectedFilterCategories.isEmpty
                                      ? Colors.black38
                                      : AppColors.appDark,
                                  fontSize: 13,
                                  fontWeight: _selectedFilterCategories.isEmpty
                                      ? FontWeight.normal
                                      : FontWeight.w500,
                                ),
                              ),
                            ),
                            // Filter Button
                            GestureDetector(
                              onTap: _showCategoryFilterModal,
                              child: Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: _selectedFilterCategories.isNotEmpty
                                      ? AppColors.appGreen
                                      : AppColors.appGreen.withValues(alpha: 0.12),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Icon(
                                  Icons.tune_rounded,
                                  color: _selectedFilterCategories.isNotEmpty
                                      ? Colors.white
                                      : AppColors.appGreen,
                                  size: 18,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                      // ── Multiselect Category Pills with Close Button ───────
                      if (_selectedFilterCategories.isNotEmpty) ...[
                        const SizedBox(height: 10),
                        SingleChildScrollView(
                          scrollDirection: Axis.horizontal,
                          child: Row(
                            children: _selectedFilterCategories.map((catLabel) {
                              final accent = _categoryAccent(catLabel);
                              return Container(
                                margin: const EdgeInsets.only(right: 8),
                                padding: const EdgeInsets.fromLTRB(10, 5, 6, 5),
                                decoration: BoxDecoration(
                                  color: accent.withValues(alpha: 0.12),
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(
                                    color: accent.withValues(alpha: 0.3),
                                  ),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(_getIconData(catLabel),
                                        size: 13, color: accent),
                                    const SizedBox(width: 5),
                                    Text(
                                      catLabel,
                                      style: TextStyle(
                                        color: accent,
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    const SizedBox(width: 4),
                                    GestureDetector(
                                      onTap: () {
                                        setState(() {
                                          _selectedFilterCategories.remove(catLabel);
                                        });
                                      },
                                      child: Container(
                                        padding: const EdgeInsets.all(2),
                                        decoration: BoxDecoration(
                                          color: accent.withValues(alpha: 0.2),
                                          shape: BoxShape.circle,
                                        ),
                                        child: Icon(Icons.close_rounded,
                                            size: 12, color: accent),
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            }).toList(),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),

                // ── Hero Banner Carousel (Fixed 22px overflow) ───────────
                const SizedBox(height: 20),
                _buildHeroBanner(),

                // ── Trending Searches ────────────────────────────────────
                const SizedBox(height: 20),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Row(
                    children: const [
                      Icon(Icons.local_fire_department_rounded,
                          size: 16, color: Color(0xFFFFA726)),
                      SizedBox(width: 6),
                      Text(
                        'Trending',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                          color: AppColors.appDark,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 10),
                SizedBox(
                  height: 38,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    separatorBuilder: (_, _) => const SizedBox(width: 8),
                    itemCount: _trendingSearches.length,
                    itemBuilder: (_, i) {
                      final t = _trendingSearches[i];
                      return Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.04),
                              blurRadius: 8,
                            ),
                          ],
                        ),
                        child: Row(
                          children: [
                            Icon(t['icon'] as IconData,
                                size: 14, color: AppColors.appBlue),
                            const SizedBox(width: 6),
                            Text(
                              t['label'] as String,
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: AppColors.appDark,
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),

                // ── Categories ──────────────────────────────────────────
                const SizedBox(height: 24),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Categories',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: AppColors.appDark,
                        ),
                      ),
                      GestureDetector(
                        onTap: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (_) => const CategoriesScreen()),
                        ),
                        child: const Text(
                          'See all →',
                          style: TextStyle(
                            color: AppColors.appBlue,
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),
                _isLoadingCategories
                    ? const Center(
                        child: Padding(
                          padding: EdgeInsets.all(20),
                          child: CircularProgressIndicator(
                              color: AppColors.appGreen),
                        ),
                      )
                    : _buildCategoryScroll(),

                // ── Promo Strip ─────────────────────────────────────────
                const SizedBox(height: 24),
                _buildPromoStrip(),

                // ── Masonry Listings ────────────────────────────────────
                const SizedBox(height: 24),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: const [
                      Text(
                        'Recommended',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: AppColors.appDark,
                        ),
                      ),
                      Text(
                        'View all →',
                        style: TextStyle(
                          color: AppColors.appBlue,
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),
                _buildMasonryGrid(),
                const SizedBox(height: 90),
              ],
            ),
          ),
        ],
      ),

      // ── Bottom Nav ──────────────────────────────────────────────────────
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.08),
              blurRadius: 20,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: SafeArea(
          child: SizedBox(
            height: 64,
            child: Row(
              children: [
                _navItem(0, Icons.home_filled, Icons.home_outlined, 'Home'),
                _navItem(1, Icons.explore, Icons.explore_outlined, 'Explore'),
                _sellButton(),
                _navItem(3, Icons.message, Icons.message_outlined, 'Messages'),
                _navItem(4, Icons.person, Icons.person_outline, 'Profile'),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ── Hero Banner (Fixed 22px bottom overflow with height 180 & padding 16) ─

  Widget _buildHeroBanner() {
    final banner = _banners[_activeBanner];
    final gradient = banner['gradient'] as List<Color>;
    final accent = banner['accent'] as Color;
    final icon = banner['icon'] as IconData;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: AnimatedSwitcher(
        duration: const Duration(milliseconds: 600),
        transitionBuilder: (child, anim) => FadeTransition(
          opacity: anim,
          child: SlideTransition(
            position: Tween<Offset>(
              begin: const Offset(0.04, 0),
              end: Offset.zero,
            ).animate(anim),
            child: child,
          ),
        ),
        child: Container(
          key: ValueKey(_activeBanner),
          height: 175,
          width: double.infinity,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: gradient,
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(24),
            boxShadow: [
              BoxShadow(
                color: gradient.first.withValues(alpha: 0.4),
                blurRadius: 24,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Stack(
            children: [
              Positioned(
                right: -20,
                top: -30,
                child: Container(
                  width: 150,
                  height: 150,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: accent.withValues(alpha: 0.08),
                  ),
                ),
              ),
              Positioned(
                right: 30,
                bottom: -40,
                child: Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: accent.withValues(alpha: 0.06),
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            banner['title'] as String,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              height: 1.15,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            banner['subtitle'] as String,
                            style: TextStyle(
                              color: Colors.white.withValues(alpha: 0.7),
                              fontSize: 12,
                            ),
                          ),
                          const SizedBox(height: 12),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 14, vertical: 6),
                            decoration: BoxDecoration(
                              color: accent,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: const Text(
                              'Get Started',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      width: 60,
                      height: 60,
                      decoration: BoxDecoration(
                        color: accent.withValues(alpha: 0.2),
                        shape: BoxShape.circle,
                        border: Border.all(
                            color: accent.withValues(alpha: 0.4), width: 2),
                      ),
                      child: Icon(icon, color: accent, size: 28),
                    ),
                  ],
                ),
              ),
              Positioned(
                bottom: 10,
                right: 16,
                child: Row(
                  children: List.generate(
                    _banners.length,
                    (i) => AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      width: i == _activeBanner ? 20 : 6,
                      height: 6,
                      margin: const EdgeInsets.only(left: 4),
                      decoration: BoxDecoration(
                        color: i == _activeBanner
                            ? accent
                            : Colors.white.withValues(alpha: 0.3),
                        borderRadius: BorderRadius.circular(3),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ── Category Horizontal Scroll ───────────────────────────────────────────

  Widget _buildCategoryScroll() {
    return SizedBox(
      height: 100,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: _categories.length,
        itemBuilder: (_, i) {
          final cat = _categories[i];
          final label = (cat['label'] ?? cat['name'] ?? 'Category').toString();
          final rawIcon = cat['icon'];
          final IconData iconData = rawIcon is IconData
              ? rawIcon
              : _getIconData(rawIcon?.toString());
          final accent = _categoryAccent(label);

          return GestureDetector(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => SubcategoryItemsScreen(
                    categoryName: label,
                    categoryId: cat['id']?.toString() ?? '',
                  ),
                ),
              );
            },
            child: Container(
              width: 76,
              margin: const EdgeInsets.only(right: 12),
              child: Column(
                children: [
                  Container(
                    width: 58,
                    height: 58,
                    decoration: BoxDecoration(
                      color: accent.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(
                          color: accent.withValues(alpha: 0.2), width: 1),
                    ),
                    child: Icon(iconData, size: 26, color: accent),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    label,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: AppColors.appDark,
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

  // ── Promo Strip ──────────────────────────────────────────────────────────

  Widget _buildPromoStrip() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: [
          _promoCard(
            icon: Icons.verified_outlined,
            label: 'Verified\nSellers',
            accent: const Color(0xFF26A69A),
          ),
          const SizedBox(width: 12),
          _promoCard(
            icon: Icons.security_outlined,
            label: 'Safe\nPayments',
            accent: const Color(0xFF5C6BC0),
          ),
          const SizedBox(width: 12),
          _promoCard(
            icon: Icons.support_agent_outlined,
            label: '24/7\nSupport',
            accent: const Color(0xFFFFA726),
          ),
        ],
      ),
    );
  }

  Widget _promoCard({
    required IconData icon,
    required String label,
    required Color accent,
  }) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 10),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: accent.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 20, color: accent),
            ),
            const SizedBox(height: 8),
            Text(
              label,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: AppColors.appDark,
                height: 1.3,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Masonry Grid ─────────────────────────────────────────────────────────

  Widget _buildMasonryGrid() {
    final leftItems = <Map<String, dynamic>>[];
    final rightItems = <Map<String, dynamic>>[];

    for (var i = 0; i < _masonryListings.length; i++) {
      if (i % 2 == 0) {
        leftItems.add(_masonryListings[i]);
      } else {
        rightItems.add(_masonryListings[i]);
      }
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              children: leftItems
                  .map((item) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: _masonryCard(item),
                      ))
                  .toList(),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              children: [
                const SizedBox(height: 30),
                ...rightItems
                    .map((item) => Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: _masonryCard(item),
                        )),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _masonryCard(Map<String, dynamic> item) {
    final isTall = item['tall'] == true;
    final accent = item['accent'] as Color;
    final icon = _getIconData(item['category'].toString());

    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => ProductDetailScreen(product: item),
          ),
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
          Container(
            height: isTall ? 160 : 110,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  accent.withValues(alpha: 0.15),
                  accent.withValues(alpha: 0.05),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
            ),
            child: Stack(
              children: [
                Positioned(
                  right: -10,
                  top: -10,
                  child: Container(
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: accent.withValues(alpha: 0.08),
                    ),
                  ),
                ),
                Center(
                  child: Icon(icon, size: isTall ? 48 : 36, color: accent),
                ),
                Positioned(
                  top: 10,
                  left: 10,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: accent.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      item['category'].toString(),
                      style: TextStyle(
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                        color: accent,
                      ),
                    ),
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
                    child: const Icon(Icons.favorite_border,
                        size: 13, color: Colors.black38),
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item['price'].toString(),
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                    color: AppColors.appGreen,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  item['title'].toString(),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: AppColors.appDark,
                    height: 1.3,
                  ),
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    const Icon(Icons.star_rounded,
                        size: 12, color: Colors.orange),
                    const SizedBox(width: 3),
                    Text(
                      item['rating'].toString(),
                      style: const TextStyle(
                          fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                    const Spacer(),
                    const Icon(Icons.location_on_outlined,
                        size: 11, color: Colors.black38),
                    const SizedBox(width: 2),
                    Flexible(
                      child: Text(
                        item['location'].toString(),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                            fontSize: 10, color: Colors.black38),
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

  Widget _navItem(int idx, IconData active, IconData inactive, String label) {
    final selected = _selectedIndex == idx;
    return Expanded(
      child: GestureDetector(
        onTap: () => _onItemTapped(idx),
        child: Container(
          color: Colors.transparent,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                decoration: BoxDecoration(
                  color: selected
                      ? AppColors.appGreen.withValues(alpha: 0.12)
                      : Colors.transparent,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  selected ? active : inactive,
                  size: 22,
                  color: selected ? AppColors.appGreen : Colors.black38,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                label,
                style: TextStyle(
                  fontSize: 10,
                  fontWeight:
                      selected ? FontWeight.bold : FontWeight.normal,
                  color: selected ? AppColors.appGreen : Colors.black38,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _sellButton() {
    return Expanded(
      child: GestureDetector(
        onTap: () {
          Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => const SellFlowScreen()),
          );
        },
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppColors.appGreen, Color(0xFF3DA84A)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(14),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.appGreen.withValues(alpha: 0.4),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: const Icon(Icons.add_rounded,
                  color: Colors.white, size: 28),
            ),
            const SizedBox(height: 2),
            const Text(
              'Sell',
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.bold,
                color: AppColors.appGreen,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
