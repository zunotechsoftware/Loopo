// ─── Step 2 – Category Selection ─────────────────────────────────────────────

import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import 'sell_widgets.dart';
import 'sell_flow_controller.dart';

// ── Data model ────────────────────────────────────────────────────────────────

class _SubCategory {
  final String id;
  final String label;

  const _SubCategory({required this.id, required this.label});
}

class _CategoryNode {
  final String id;
  final String label;
  final IconData icon;
  final Color iconColor;
  final Color bgColor;
  final List<_SubCategory> subcategories;

  const _CategoryNode({
    required this.id,
    required this.label,
    required this.icon,
    required this.iconColor,
    required this.bgColor,
    required this.subcategories,
  });
}

const _categoryTree = [
  _CategoryNode(
    id: 'electronics',
    label: 'Electronics',
    icon: Icons.devices_rounded,
    iconColor: Color(0xFF1E88E5),
    bgColor: Color(0xFFEFF6FF),
    subcategories: [
      _SubCategory(id: 'mobile_phones', label: 'Mobile Phones'),
      _SubCategory(id: 'laptops', label: 'Laptops'),
      _SubCategory(id: 'tablets', label: 'Tablets'),
      _SubCategory(id: 'cameras', label: 'Cameras'),
      _SubCategory(id: 'tv_audio', label: 'TV & Audio'),
      _SubCategory(id: 'accessories', label: 'Accessories'),
    ],
  ),
  _CategoryNode(
    id: 'vehicles',
    label: 'Vehicles',
    icon: Icons.directions_car_rounded,
    iconColor: Color(0xFFF59E0B),
    bgColor: Color(0xFFFFFBEB),
    subcategories: [
      _SubCategory(id: 'cars', label: 'Cars'),
      _SubCategory(id: 'motorcycles', label: 'Motorcycles'),
      _SubCategory(id: 'scooters', label: 'Scooters'),
      _SubCategory(id: 'trucks', label: 'Trucks & Buses'),
      _SubCategory(id: 'bicycles', label: 'Bicycles'),
      _SubCategory(id: 'boats', label: 'Boats'),
    ],
  ),
  _CategoryNode(
    id: 'property',
    label: 'Property',
    icon: Icons.apartment_rounded,
    iconColor: Color(0xFF059669),
    bgColor: Color(0xFFECFDF5),
    subcategories: [
      _SubCategory(id: 'flats', label: 'Flats & Apartments'),
      _SubCategory(id: 'houses', label: 'Houses & Villas'),
      _SubCategory(id: 'commercial', label: 'Commercial Spaces'),
      _SubCategory(id: 'land', label: 'Land & Plots'),
      _SubCategory(id: 'pg', label: 'PG & Hostels'),
    ],
  ),
  _CategoryNode(
    id: 'fashion',
    label: 'Fashion',
    icon: Icons.checkroom_rounded,
    iconColor: Color(0xFFEC4899),
    bgColor: Color(0xFFFDF2F8),
    subcategories: [
      _SubCategory(id: 'mens', label: "Men's Clothing"),
      _SubCategory(id: 'womens', label: "Women's Clothing"),
      _SubCategory(id: 'kids', label: "Kids' Clothing"),
      _SubCategory(id: 'footwear', label: 'Footwear'),
      _SubCategory(id: 'bags', label: 'Bags & Wallets'),
      _SubCategory(id: 'jewellery', label: 'Jewellery'),
    ],
  ),
  _CategoryNode(
    id: 'furniture',
    label: 'Furniture',
    icon: Icons.chair_rounded,
    iconColor: Color(0xFF92400E),
    bgColor: Color(0xFFFEF3C7),
    subcategories: [
      _SubCategory(id: 'sofa', label: 'Sofas & Chairs'),
      _SubCategory(id: 'bed', label: 'Beds & Wardrobes'),
      _SubCategory(id: 'dining', label: 'Dining Tables'),
      _SubCategory(id: 'office_furniture', label: 'Office Furniture'),
      _SubCategory(id: 'kids_furniture', label: "Kids' Furniture"),
    ],
  ),
  _CategoryNode(
    id: 'books',
    label: 'Books',
    icon: Icons.menu_book_rounded,
    iconColor: Color(0xFF0284C7),
    bgColor: Color(0xFFE0F2FE),
    subcategories: [
      _SubCategory(id: 'textbooks', label: 'Textbooks'),
      _SubCategory(id: 'novels', label: 'Novels & Fiction'),
      _SubCategory(id: 'comics', label: 'Comics'),
      _SubCategory(id: 'magazines', label: 'Magazines'),
      _SubCategory(id: 'self_help', label: 'Self-Help'),
    ],
  ),
  _CategoryNode(
    id: 'services',
    label: 'Services',
    icon: Icons.home_repair_service_rounded,
    iconColor: Color(0xFF16A34A),
    bgColor: Color(0xFFF0FDF4),
    subcategories: [
      _SubCategory(id: 'tutoring', label: 'Tutoring & Classes'),
      _SubCategory(id: 'repairs', label: 'Repairs & Home'),
      _SubCategory(id: 'events', label: 'Events & Entertainment'),
      _SubCategory(id: 'health', label: 'Health & Wellness'),
      _SubCategory(id: 'it_services', label: 'IT & Tech Services'),
    ],
  ),
];

// ── Screen ────────────────────────────────────────────────────────────────────

class CategorySelectionScreen extends StatefulWidget {
  final SellFlowController controller;

  const CategorySelectionScreen({super.key, required this.controller});

  @override
  State<CategorySelectionScreen> createState() =>
      _CategorySelectionScreenState();
}

class _CategorySelectionScreenState extends State<CategorySelectionScreen> {
  final _searchCtrl = TextEditingController();
  String _search = '';
  String? _expandedId;
  String? _selectedSubId;

  List<_CategoryNode> get _filtered {
    if (_search.isEmpty) return _categoryTree;
    final q = _search.toLowerCase();
    return _categoryTree
        .where((c) =>
            c.label.toLowerCase().contains(q) ||
            c.subcategories.any((s) => s.label.toLowerCase().contains(q)))
        .toList();
  }

  void _toggleExpand(String id) {
    setState(() => _expandedId = _expandedId == id ? null : id);
  }

  void _selectSub(_CategoryNode parent, _SubCategory sub) {
    setState(() {
      _selectedSubId = sub.id;
    });
    widget.controller.data.selectedCategoryId = parent.id;
    widget.controller.data.selectedCategoryName = parent.label;
    widget.controller.data.selectedSubcategoryId = sub.id;
    widget.controller.data.selectedSubcategoryName = sub.label;
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
        title: 'Select Category',
        currentStep: 2,
        totalSteps: SellFlowController.totalSteps,
        onBack: () => widget.controller.goToPrev(),
      ),
      body: Column(
        children: [
          // Search
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 8),
            child: SellSearchBar(
              hint: 'Search categories & subcategories…',
              controller: _searchCtrl,
              onChanged: (v) => setState(() => _search = v),
            ),
          ),

          // List
          Expanded(
            child: _filtered.isEmpty
                ? const Center(
                    child: Text(
                      'No categories found',
                      style: TextStyle(fontFamily: 'Poppins', color: Colors.grey),
                    ),
                  )
                : ListView.builder(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    itemCount: _filtered.length,
                    itemBuilder: (_, i) {
                      final cat = _filtered[i];
                      final isExpanded = _expandedId == cat.id;
                      return _CategoryTile(
                        node: cat,
                        isExpanded: isExpanded,
                        selectedSubId: _selectedSubId,
                        onTap: () => _toggleExpand(cat.id),
                        onSubTap: (sub) => _selectSub(cat, sub),
                        searchQuery: _search,
                      );
                    },
                  ),
          ),

          // Continue
          SellContinueButton(
            onPressed: _selectedSubId == null
                ? null
                : () => widget.controller.goToNext(),
          ),
        ],
      ),
    );
  }
}

// ── Category Expandable Tile ──────────────────────────────────────────────────

class _CategoryTile extends StatelessWidget {
  final _CategoryNode node;
  final bool isExpanded;
  final String? selectedSubId;
  final VoidCallback onTap;
  final ValueChanged<_SubCategory> onSubTap;
  final String searchQuery;

  const _CategoryTile({
    required this.node,
    required this.isExpanded,
    required this.selectedSubId,
    required this.onTap,
    required this.onSubTap,
    required this.searchQuery,
  });

  List<_SubCategory> get _visibleSubs {
    if (searchQuery.isEmpty) return node.subcategories;
    final q = searchQuery.toLowerCase();
    return node.subcategories
        .where((s) => s.label.toLowerCase().contains(q))
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          // Parent row
          InkWell(
            borderRadius: BorderRadius.circular(18),
            onTap: onTap,
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: node.bgColor,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(node.icon, color: node.iconColor, size: 22),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          node.label,
                          style: const TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: AppColors.appDark,
                            fontFamily: 'Poppins',
                          ),
                        ),
                        Text(
                          '${node.subcategories.length} subcategories',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey.shade400,
                            fontFamily: 'Poppins',
                          ),
                        ),
                      ],
                    ),
                  ),
                  AnimatedRotation(
                    turns: isExpanded ? 0.5 : 0,
                    duration: const Duration(milliseconds: 250),
                    child: Icon(Icons.keyboard_arrow_down_rounded,
                        color: Colors.grey.shade400),
                  ),
                ],
              ),
            ),
          ),

          // Subcategories
          AnimatedCrossFade(
            firstChild: const SizedBox.shrink(),
            secondChild: Column(
              children: [
                const Divider(height: 1, indent: 16, endIndent: 16),
                ..._visibleSubs.map((sub) {
                  final isSel = sub.id == selectedSubId;
                  return InkWell(
                    onTap: () => onSubTap(sub),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 20, vertical: 12),
                      child: Row(
                        children: [
                          Container(
                            width: 6,
                            height: 6,
                            decoration: BoxDecoration(
                              color: isSel
                                  ? AppColors.appGreen
                                  : Colors.grey.shade300,
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Text(
                              sub.label,
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: isSel
                                    ? FontWeight.w700
                                    : FontWeight.w400,
                                color: isSel
                                    ? AppColors.appGreen
                                    : AppColors.appDark,
                                fontFamily: 'Poppins',
                              ),
                            ),
                          ),
                          if (isSel)
                            const Icon(Icons.check_circle_rounded,
                                color: AppColors.appGreen, size: 18),
                        ],
                      ),
                    ),
                  );
                }),
                const SizedBox(height: 6),
              ],
            ),
            crossFadeState: (isExpanded || searchQuery.isNotEmpty)
                ? CrossFadeState.showSecond
                : CrossFadeState.showFirst,
            duration: const Duration(milliseconds: 280),
          ),
        ],
      ),
    );
  }
}
