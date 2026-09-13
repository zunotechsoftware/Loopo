// ─── Step 1 – Sell Home ───────────────────────────────────────────────────────
//
// Previously showed 8 fully hardcoded "popular categories" (Mobiles,
// Electronics, Vehicles, Property, Fashion, Furniture, Books, Services) with
// fake string ids ('mobiles', 'property', ...). Property and Services don't
// exist in the real category taxonomy at all - a user picking either here
// would then find step 2 (real category tree) doesn't have their choice.
// Step 2 always overwrites selectedCategoryId with a real one before
// submission, so this never broke listing creation the way step 2's own bug
// did, but it was still a real, confusing dead end. Now fetches the same
// real category tree step 2 uses, via CategoryService.
//
// The old "Recent Categories" section was decorative filler with no backing
// data (a hardcoded 3-item list, "Clear" button was a no-op) - removed
// rather than faked, since there's no real recently-used-category tracking
// to show yet.

import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../services/category_service.dart';
import 'sell_widgets.dart';
import 'sell_flow_controller.dart';

// ── Category data ──────────────────────────────────────────────────────────

class _SellCategory {
  final String id;
  final String label;
  final IconData icon;
  final Color iconColor;
  final Color bgColor;

  const _SellCategory({
    required this.id,
    required this.label,
    required this.icon,
    required this.iconColor,
    required this.bgColor,
  });
}

// Real categories don't carry an icon/color from the backend, so both are
// picked by matching on the category's real name, with a generic fallback.
_SellCategory _toSellCategory(Map<String, dynamic> c) {
  final name = (c['name'] ?? '').toString();
  final key = name.toLowerCase();
  IconData icon = Icons.category_rounded;
  Color iconColor = const Color(0xFF64748B);
  Color bgColor = const Color(0xFFF1F5F9);
  if (key.contains('mobile') || key.contains('phone')) {
    icon = Icons.phone_android_rounded; iconColor = const Color(0xFF7C3AED); bgColor = const Color(0xFFF3F0FF);
  } else if (key.contains('electronic') || key.contains('tv')) {
    icon = Icons.devices_rounded; iconColor = const Color(0xFF1E88E5); bgColor = const Color(0xFFEFF6FF);
  } else if (key.contains('vehicle') || key.contains('car') || key.contains('bike')) {
    icon = Icons.directions_car_rounded; iconColor = const Color(0xFFF59E0B); bgColor = const Color(0xFFFFFBEB);
  } else if (key.contains('propert') || key.contains('home') || key.contains('living')) {
    icon = Icons.apartment_rounded; iconColor = const Color(0xFF059669); bgColor = const Color(0xFFECFDF5);
  } else if (key.contains('fashion') || key.contains('cloth')) {
    icon = Icons.checkroom_rounded; iconColor = const Color(0xFFEC4899); bgColor = const Color(0xFFFDF2F8);
  } else if (key.contains('furniture')) {
    icon = Icons.chair_rounded; iconColor = const Color(0xFF92400E); bgColor = const Color(0xFFFEF3C7);
  } else if (key.contains('book')) {
    icon = Icons.menu_book_rounded; iconColor = const Color(0xFF0284C7); bgColor = const Color(0xFFE0F2FE);
  } else if (key.contains('service')) {
    icon = Icons.home_repair_service_rounded; iconColor = const Color(0xFF16A34A); bgColor = const Color(0xFFF0FDF4);
  }
  return _SellCategory(id: (c['id'] ?? '').toString(), label: name, icon: icon, iconColor: iconColor, bgColor: bgColor);
}

// ── Screen ────────────────────────────────────────────────────────────────────

class SellHomeScreen extends StatefulWidget {
  final SellFlowController controller;

  const SellHomeScreen({super.key, required this.controller});

  @override
  State<SellHomeScreen> createState() => _SellHomeScreenState();
}

class _SellHomeScreenState extends State<SellHomeScreen> {
  final _categoryService = CategoryService();
  final _searchCtrl = TextEditingController();
  String _search = '';
  String? _selectedId;
  List<_SellCategory> _categories = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadCategories();
  }

  Future<void> _loadCategories() async {
    setState(() => _isLoading = true);
    final tree = await _categoryService.getCategoryTree();
    if (!mounted) return;
    setState(() {
      _categories = tree.map((c) => _toSellCategory(c as Map<String, dynamic>)).toList();
      _isLoading = false;
    });
  }

  List<_SellCategory> get _filteredCategories {
    if (_search.isEmpty) return _categories;
    return _categories
        .where((c) => c.label.toLowerCase().contains(_search.toLowerCase()))
        .toList();
  }

  void _selectCategory(_SellCategory cat) {
    setState(() => _selectedId = cat.id);
    widget.controller.data.selectedCategoryId = cat.id;
    widget.controller.data.selectedCategoryName = cat.label;
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      appBar: SellAppBar(
        title: 'Start Selling',
        currentStep: 1,
        totalSteps: SellFlowController.totalSteps,
        onBack: null,
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Headline
                  const Text(
                    'What are you selling?',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w800,
                      color: AppColors.appDark,
                      fontFamily: 'Poppins',
                      height: 1.2,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Choose a category to get started',
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey.shade500,
                      fontFamily: 'Poppins',
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Search bar
                  SellSearchBar(
                    hint: 'Search categories…',
                    controller: _searchCtrl,
                    onChanged: (v) => setState(() => _search = v),
                  ),
                  const SizedBox(height: 24),

                  // Popular categories
                  SellSectionHeader(title: 'Popular Categories'),
                  _isLoading
                      ? const Padding(
                          padding: EdgeInsets.symmetric(vertical: 24),
                          child: Center(child: CircularProgressIndicator()),
                        )
                      : _PopularCategoryGrid(
                          categories: _filteredCategories,
                          selectedId: _selectedId,
                          onSelect: _selectCategory,
                        ),
                  const SizedBox(height: 24),

                  // Browse all
                  OutlinedButton.icon(
                    onPressed: () => widget.controller.goToNext(),
                    icon: const Icon(Icons.grid_view_rounded, size: 18),
                    label: const Text(
                      'Browse All Categories',
                      style: TextStyle(fontFamily: 'Poppins'),
                    ),
                    style: OutlinedButton.styleFrom(
                      minimumSize: const Size(double.infinity, 48),
                      side: const BorderSide(color: AppColors.appGreen),
                      foregroundColor: AppColors.appGreen,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14)),
                    ),
                  ),
                  const SizedBox(height: 8),
                ],
              ),
            ),
          ),

          // Sticky bottom Continue
          SellContinueButton(
            onPressed: _selectedId == null ? null : () => widget.controller.goToNext(),
          ),
        ],
      ),
    );
  }
}

// ── Category Grid ─────────────────────────────────────────────────────────────

class _PopularCategoryGrid extends StatelessWidget {
  final List<_SellCategory> categories;
  final String? selectedId;
  final ValueChanged<_SellCategory> onSelect;

  const _PopularCategoryGrid({
    required this.categories,
    required this.selectedId,
    required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    if (categories.isEmpty) {
      return const _EmptySearch();
    }
    return GridView.builder(
      physics: const NeverScrollableScrollPhysics(),
      shrinkWrap: true,
      itemCount: categories.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 4,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 0.8,
      ),
      itemBuilder: (_, i) {
        final cat = categories[i];
        final isSelected = cat.id == selectedId;
        return GestureDetector(
          onTap: () => onSelect(cat),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: isSelected ? AppColors.appGreen : Colors.transparent,
                width: 2,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: isSelected
                        ? AppColors.appGreen.withValues(alpha: 0.15)
                        : cat.bgColor,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    cat.icon,
                    color: isSelected ? AppColors.appGreen : cat.iconColor,
                    size: 22,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  cat.label,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    fontFamily: 'Poppins',
                    color: isSelected ? AppColors.appGreen : AppColors.appDark,
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

// ── Empty Search State ────────────────────────────────────────────────────────

class _EmptySearch extends StatelessWidget {
  const _EmptySearch();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 40),
      alignment: Alignment.center,
      child: Column(
        children: [
          Icon(Icons.search_off_rounded, size: 48, color: Colors.grey.shade300),
          const SizedBox(height: 12),
          Text(
            'No categories found',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey.shade400,
              fontFamily: 'Poppins',
            ),
          ),
        ],
      ),
    );
  }
}
