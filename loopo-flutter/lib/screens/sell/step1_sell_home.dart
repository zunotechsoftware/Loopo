// ─── Step 1 – Sell Home ───────────────────────────────────────────────────────

import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import 'sell_widgets.dart';
import 'sell_flow_controller.dart';

// ── Static category data ──────────────────────────────────────────────────────

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

const _popularCategories = [
  _SellCategory(
    id: 'mobiles',
    label: 'Mobiles',
    icon: Icons.phone_android_rounded,
    iconColor: Color(0xFF7C3AED),
    bgColor: Color(0xFFF3F0FF),
  ),
  _SellCategory(
    id: 'electronics',
    label: 'Electronics',
    icon: Icons.devices_rounded,
    iconColor: Color(0xFF1E88E5),
    bgColor: Color(0xFFEFF6FF),
  ),
  _SellCategory(
    id: 'vehicles',
    label: 'Vehicles',
    icon: Icons.directions_car_rounded,
    iconColor: Color(0xFFF59E0B),
    bgColor: Color(0xFFFFFBEB),
  ),
  _SellCategory(
    id: 'property',
    label: 'Property',
    icon: Icons.apartment_rounded,
    iconColor: Color(0xFF059669),
    bgColor: Color(0xFFECFDF5),
  ),
  _SellCategory(
    id: 'fashion',
    label: 'Fashion',
    icon: Icons.checkroom_rounded,
    iconColor: Color(0xFFEC4899),
    bgColor: Color(0xFFFDF2F8),
  ),
  _SellCategory(
    id: 'furniture',
    label: 'Furniture',
    icon: Icons.chair_rounded,
    iconColor: Color(0xFF92400E),
    bgColor: Color(0xFFFEF3C7),
  ),
  _SellCategory(
    id: 'books',
    label: 'Books',
    icon: Icons.menu_book_rounded,
    iconColor: Color(0xFF0284C7),
    bgColor: Color(0xFFE0F2FE),
  ),
  _SellCategory(
    id: 'services',
    label: 'Services',
    icon: Icons.home_repair_service_rounded,
    iconColor: Color(0xFF16A34A),
    bgColor: Color(0xFFF0FDF4),
  ),
];

const _recentCategories = [
  _SellCategory(
    id: 'mobiles',
    label: 'Mobiles',
    icon: Icons.phone_android_rounded,
    iconColor: Color(0xFF7C3AED),
    bgColor: Color(0xFFF3F0FF),
  ),
  _SellCategory(
    id: 'fashion',
    label: 'Fashion',
    icon: Icons.checkroom_rounded,
    iconColor: Color(0xFFEC4899),
    bgColor: Color(0xFFFDF2F8),
  ),
  _SellCategory(
    id: 'electronics',
    label: 'Electronics',
    icon: Icons.devices_rounded,
    iconColor: Color(0xFF1E88E5),
    bgColor: Color(0xFFEFF6FF),
  ),
];

// ── Screen ────────────────────────────────────────────────────────────────────

class SellHomeScreen extends StatefulWidget {
  final SellFlowController controller;

  const SellHomeScreen({super.key, required this.controller});

  @override
  State<SellHomeScreen> createState() => _SellHomeScreenState();
}

class _SellHomeScreenState extends State<SellHomeScreen> {
  final _searchCtrl = TextEditingController();
  String _search = '';
  String? _selectedId;

  List<_SellCategory> get _filteredCategories {
    if (_search.isEmpty) return _popularCategories;
    return _popularCategories
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
                  _PopularCategoryGrid(
                    categories: _filteredCategories,
                    selectedId: _selectedId,
                    onSelect: _selectCategory,
                  ),
                  const SizedBox(height: 24),

                  // Recent categories
                  if (_search.isEmpty) ...[
                    SellSectionHeader(
                      title: 'Recent Categories',
                      action: 'Clear',
                      onAction: () {},
                    ),
                    _RecentCategoryRow(
                      categories: _recentCategories,
                      selectedId: _selectedId,
                      onSelect: _selectCategory,
                    ),
                    const SizedBox(height: 20),
                  ],

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

// ── Recent Categories Row ─────────────────────────────────────────────────────

class _RecentCategoryRow extends StatelessWidget {
  final List<_SellCategory> categories;
  final String? selectedId;
  final ValueChanged<_SellCategory> onSelect;

  const _RecentCategoryRow({
    required this.categories,
    required this.selectedId,
    required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: categories.map((cat) {
        final isSelected = cat.id == selectedId;
        return Padding(
          padding: const EdgeInsets.only(right: 10),
          child: GestureDetector(
            onTap: () => onSelect(cat),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.appGreen : Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: isSelected ? AppColors.appGreen : const Color(0xFFE5E7EB),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.04),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Icon(cat.icon,
                      size: 14,
                      color: isSelected ? Colors.white : cat.iconColor),
                  const SizedBox(width: 6),
                  Text(
                    cat.label,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      fontFamily: 'Poppins',
                      color: isSelected ? Colors.white : AppColors.appDark,
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      }).toList(),
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
