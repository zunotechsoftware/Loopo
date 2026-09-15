// ─── Step 2 – Category Selection ─────────────────────────────────────────────
//
// Previously rendered a fully hardcoded category tree with fake string ids
// ('electronics', 'vehicles', ...) instead of real backend UUIDs. Since the
// backend's CreateProductDto requires categoryId to be a real @IsUUID(),
// every listing submitted through this screen failed validation - this was
// the Flutter side of the same bug found and fixed in loopo-client's sell
// flow (see agents/01-context/known-issues.md). Now fetches the real
// category tree from GET /categories/tree via CategoryService (the same
// service categories_screen.dart already uses successfully).

import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../services/category_service.dart';
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

// Real categories don't carry an icon/color from the backend, so both are
// picked by matching on the category's real name, with a generic fallback.
const _fallbackIcon = Icons.category_rounded;
const _fallbackIconColor = Color(0xFF64748B);
const _fallbackBgColor = Color(0xFFF1F5F9);

({IconData icon, Color iconColor, Color bgColor}) _styleForCategory(String name) {
  final key = name.toLowerCase();
  if (key.contains('mobile') || key.contains('phone') || key.contains('electronic')) {
    return (icon: Icons.devices_rounded, iconColor: const Color(0xFF1E88E5), bgColor: const Color(0xFFEFF6FF));
  }
  if (key.contains('vehicle') || key.contains('car') || key.contains('bike')) {
    return (icon: Icons.directions_car_rounded, iconColor: const Color(0xFFF59E0B), bgColor: const Color(0xFFFFFBEB));
  }
  if (key.contains('propert') || key.contains('home') || key.contains('living')) {
    return (icon: Icons.apartment_rounded, iconColor: const Color(0xFF059669), bgColor: const Color(0xFFECFDF5));
  }
  if (key.contains('fashion') || key.contains('cloth')) {
    return (icon: Icons.checkroom_rounded, iconColor: const Color(0xFFEC4899), bgColor: const Color(0xFFFDF2F8));
  }
  if (key.contains('furniture')) {
    return (icon: Icons.chair_rounded, iconColor: const Color(0xFF92400E), bgColor: const Color(0xFFFEF3C7));
  }
  if (key.contains('book')) {
    return (icon: Icons.menu_book_rounded, iconColor: const Color(0xFF0284C7), bgColor: const Color(0xFFE0F2FE));
  }
  if (key.contains('service')) {
    return (icon: Icons.home_repair_service_rounded, iconColor: const Color(0xFF16A34A), bgColor: const Color(0xFFF0FDF4));
  }
  return (icon: _fallbackIcon, iconColor: _fallbackIconColor, bgColor: _fallbackBgColor);
}

List<_CategoryNode> _mapCategoryTree(List<dynamic> raw) {
  return raw.map((c) {
    final style = _styleForCategory((c['name'] ?? '').toString());
    final children = (c['children'] as List<dynamic>? ?? [])
        .map((s) => _SubCategory(id: (s['id'] ?? '').toString(), label: (s['name'] ?? '').toString()))
        .toList();
    return _CategoryNode(
      id: (c['id'] ?? '').toString(),
      label: (c['name'] ?? '').toString(),
      icon: style.icon,
      iconColor: style.iconColor,
      bgColor: style.bgColor,
      subcategories: children,
    );
  }).toList();
}

// ── Screen ────────────────────────────────────────────────────────────────────

class CategorySelectionScreen extends StatefulWidget {
  final SellFlowController controller;

  const CategorySelectionScreen({super.key, required this.controller});

  @override
  State<CategorySelectionScreen> createState() =>
      _CategorySelectionScreenState();
}

class _CategorySelectionScreenState extends State<CategorySelectionScreen> {
  final _categoryService = CategoryService();
  final _searchCtrl = TextEditingController();
  String _search = '';
  String? _expandedId;
  String? _selectedSubId;
  List<_CategoryNode> _categories = [];
  bool _isLoading = true;
  bool _hasError = false;

  @override
  void initState() {
    super.initState();
    _loadCategories();
  }

  Future<void> _loadCategories() async {
    setState(() {
      _isLoading = true;
      _hasError = false;
    });
    final tree = await _categoryService.getCategoryTree();
    if (!mounted) return;
    setState(() {
      _categories = _mapCategoryTree(tree);
      _hasError = tree.isEmpty;
      _isLoading = false;
    });
  }

  List<_CategoryNode> get _filtered {
    if (_search.isEmpty) return _categories;
    final q = _search.toLowerCase();
    return _categories
        .where((c) =>
            c.label.toLowerCase().contains(q) ||
            c.subcategories.any((s) => s.label.toLowerCase().contains(q)))
        .toList();
  }

  void _toggleExpand(String id) {
    // Categories with no subcategories select themselves directly rather
    // than expanding into an empty list - otherwise a category with no
    // subcategories yet would be a permanent dead end for sellers.
    final node = _categories.firstWhere((c) => c.id == id, orElse: () => _categories.first);
    if (node.subcategories.isEmpty) {
      setState(() => _selectedSubId = node.id);
      widget.controller.data.selectedCategoryId = node.id;
      widget.controller.data.selectedCategoryName = node.label;
      widget.controller.data.selectedSubcategoryId = null;
      widget.controller.data.selectedSubcategoryName = null;
      return;
    }
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
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _hasError
                    ? Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Text(
                              'Could not load categories',
                              style: TextStyle(fontFamily: 'Poppins', color: Colors.grey),
                            ),
                            const SizedBox(height: 12),
                            TextButton(
                              onPressed: _loadCategories,
                              child: const Text('Retry'),
                            ),
                          ],
                        ),
                      )
                    : _filtered.isEmpty
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
