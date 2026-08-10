// ─── My Ads (Selling Products) Screen ─────────────────────────────────────────

import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import 'sell/sell_flow_screen.dart';

class MyAdsScreen extends StatefulWidget {
  const MyAdsScreen({super.key});

  @override
  State<MyAdsScreen> createState() => _MyAdsScreenState();
}

class _MyAdsScreenState extends State<MyAdsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  // Sample initial selling products dataset
  List<Map<String, dynamic>> _myAds = [
    {
      'id': '1',
      'title': 'iPhone 14 Pro Max - 256GB Deep Purple (Like New)',
      'price': 78500,
      'category': 'Mobiles',
      'status': 'ACTIVE', // ACTIVE, PENDING, SOLD, DRAFT
      'date': '2 days ago',
      'views': 142,
      'favorites': 18,
      'chats': 5,
      'imageUrl': 'assets/images/loopo.png',
      'accent': const Color(0xFF7C3AED),
      'icon': Icons.phone_iphone_rounded,
      'location': 'Koramangala, Bengaluru',
    },
    {
      'id': '2',
      'title': 'Sony Bravia 55" 4K Ultra HD Smart OLED TV',
      'price': 52000,
      'category': 'Electronics',
      'status': 'ACTIVE',
      'date': '5 days ago',
      'views': 89,
      'favorites': 9,
      'chats': 3,
      'imageUrl': 'assets/images/loopo.png',
      'accent': const Color(0xFF2563EB),
      'icon': Icons.tv_rounded,
      'location': 'Indiranagar, Bengaluru',
    },
    {
      'id': '3',
      'title': 'Royal Enfield Classic 350 (2022 Model, 12,000 km)',
      'price': 145000,
      'category': 'Vehicles',
      'status': 'PENDING',
      'date': 'Yesterday',
      'views': 34,
      'favorites': 4,
      'chats': 1,
      'imageUrl': 'assets/images/loopo.png',
      'accent': const Color(0xFFD97706),
      'icon': Icons.two_wheeler_rounded,
      'location': 'HSR Layout, Bengaluru',
    },
    {
      'id': '4',
      'title': 'Ergonomic Premium Leather Office Chair (Black)',
      'price': 6500,
      'category': 'Furniture',
      'status': 'SOLD',
      'date': '2 weeks ago',
      'views': 230,
      'favorites': 25,
      'chats': 12,
      'imageUrl': 'assets/images/loopo.png',
      'accent': const Color(0xFF059669),
      'icon': Icons.chair_rounded,
      'location': 'Whitefield, Bengaluru',
    },
    {
      'id': '5',
      'title': 'MacBook Pro M1 16GB 512GB Space Grey',
      'price': 89000,
      'category': 'Electronics',
      'status': 'DRAFT',
      'date': 'Saved Draft',
      'views': 0,
      'favorites': 0,
      'chats': 0,
      'imageUrl': 'assets/images/loopo.png',
      'accent': const Color(0xFF4B5563),
      'icon': Icons.laptop_mac_rounded,
      'location': 'Koramangala, Bengaluru',
    },
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 5, vsync: this);
    _tabController.addListener(() {
      if (mounted) setState(() {});
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  List<Map<String, dynamic>> _getFilteredAds(String filterStatus) {
    return _myAds.where((ad) {
      final matchesStatus = filterStatus == 'ALL' ||
          (filterStatus == 'ACTIVE' && ad['status'] == 'ACTIVE') ||
          (filterStatus == 'PENDING' && ad['status'] == 'PENDING') ||
          (filterStatus == 'SOLD' && ad['status'] == 'SOLD') ||
          (filterStatus == 'DRAFT' && ad['status'] == 'DRAFT');

      final matchesQuery = _searchQuery.isEmpty ||
          ad['title'].toString().toLowerCase().contains(_searchQuery.toLowerCase()) ||
          ad['category'].toString().toLowerCase().contains(_searchQuery.toLowerCase());

      return matchesStatus && matchesQuery;
    }).toList();
  }

  int _countByStatus(String status) {
    if (status == 'ALL') return _myAds.length;
    return _myAds.where((ad) => ad['status'] == status).length;
  }

  void _markAsSold(String id) {
    setState(() {
      final index = _myAds.indexWhere((ad) => ad['id'] == id);
      if (index != -1) {
        _myAds[index]['status'] = 'SOLD';
      }
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Item marked as Sold! 🎉', style: TextStyle(fontFamily: 'Poppins')),
        backgroundColor: AppColors.appGreen,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _deleteAd(String id) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Delete Listing?', style: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.bold)),
        content: const Text('Are you sure you want to delete this listing? This action cannot be undone.', style: TextStyle(fontFamily: 'Poppins')),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(fontFamily: 'Poppins', color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              setState(() {
                _myAds.removeWhere((ad) => ad['id'] == id);
              });
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Listing deleted.', style: TextStyle(fontFamily: 'Poppins')),
                  behavior: SnackBarBehavior.floating,
                ),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            child: const Text('Delete', style: TextStyle(fontFamily: 'Poppins', color: Colors.white)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final activeCount = _countByStatus('ACTIVE');
    final totalViews = _myAds.fold<int>(0, (sum, item) => sum + (item['views'] as int));
    final totalChats = _myAds.fold<int>(0, (sum, item) => sum + (item['chats'] as int));

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 1,
        leading: Navigator.canPop(context)
            ? IconButton(
                onPressed: () => Navigator.maybePop(context),
                icon: Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(
                    Icons.arrow_back_ios_new_rounded,
                    color: AppColors.appDark,
                    size: 18,
                  ),
                ),
              )
            : null,
        title: const Text(
          'My Ads',
          style: TextStyle(
            color: AppColors.appDark,
            fontFamily: 'Poppins',
            fontWeight: FontWeight.w800,
            fontSize: 20,
          ),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: ElevatedButton.icon(
              onPressed: () {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const SellFlowScreen()),
                );
              },
              icon: const Icon(Icons.add_rounded, size: 18),
              label: const Text(
                'Post Ad',
                style: TextStyle(
                  fontFamily: 'Poppins',
                  fontWeight: FontWeight.w700,
                  fontSize: 13,
                ),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.appGreen,
                foregroundColor: Colors.white,
                elevation: 0,
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          // ── Stat Summary Cards ──────────────────────────────────────────────
          Container(
            color: Colors.white,
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
            child: Column(
              children: [
                Row(
                  children: [
                    Expanded(
                      child: _StatCard(
                        icon: Icons.inventory_2_rounded,
                        iconColor: AppColors.appGreen,
                        label: 'Active Ads',
                        value: '$activeCount',
                        bgColor: const Color(0xFFECFDF5),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _StatCard(
                        icon: Icons.visibility_rounded,
                        iconColor: AppColors.appBlue,
                        label: 'Total Views',
                        value: '$totalViews',
                        bgColor: const Color(0xFFEFF6FF),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _StatCard(
                        icon: Icons.chat_bubble_rounded,
                        iconColor: const Color(0xFFF59E0B),
                        label: 'Inquiries',
                        value: '$totalChats',
                        bgColor: const Color(0xFFFFFBEB),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),

                // ── Search Field ──────────────────────────────────────────────
                Container(
                  height: 44,
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: TextField(
                    controller: _searchController,
                    onChanged: (val) => setState(() => _searchQuery = val),
                    style: const TextStyle(fontFamily: 'Poppins', fontSize: 13),
                    decoration: InputDecoration(
                      hintText: 'Search my listings...',
                      hintStyle: TextStyle(
                        fontFamily: 'Poppins',
                        fontSize: 13,
                        color: Colors.grey.shade400,
                      ),
                      prefixIcon: Icon(Icons.search_rounded,
                          size: 20, color: Colors.grey.shade500),
                      suffixIcon: _searchQuery.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear_rounded, size: 18),
                              onPressed: () {
                                _searchController.clear();
                                setState(() => _searchQuery = '');
                              },
                            )
                          : null,
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // ── Filter Tabs ───────────────────────────────────────────────────
          Container(
            color: Colors.white,
            child: TabBar(
              controller: _tabController,
              isScrollable: true,
              labelColor: AppColors.appGreen,
              unselectedLabelColor: Colors.grey.shade600,
              indicatorColor: AppColors.appGreen,
              indicatorWeight: 3,
              labelStyle: const TextStyle(
                fontFamily: 'Poppins',
                fontWeight: FontWeight.w700,
                fontSize: 13,
              ),
              unselectedLabelStyle: const TextStyle(
                fontFamily: 'Poppins',
                fontWeight: FontWeight.w500,
                fontSize: 13,
              ),
              tabs: [
                Tab(text: 'All (${_countByStatus('ALL')})'),
                Tab(text: 'Active (${_countByStatus('ACTIVE')})'),
                Tab(text: 'Pending (${_countByStatus('PENDING')})'),
                Tab(text: 'Sold (${_countByStatus('SOLD')})'),
                Tab(text: 'Drafts (${_countByStatus('DRAFT')})'),
              ],
            ),
          ),

          const Divider(height: 1, color: Color(0xFFE2E8F0)),

          // ── Tab Views (Ad Lists) ──────────────────────────────────────────
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildAdsList('ALL'),
                _buildAdsList('ACTIVE'),
                _buildAdsList('PENDING'),
                _buildAdsList('SOLD'),
                _buildAdsList('DRAFT'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAdsList(String statusFilter) {
    final ads = _getFilteredAds(statusFilter);

    if (ads.isEmpty) {
      return Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: AppColors.appGreen.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.sell_outlined,
                  size: 40,
                  color: AppColors.appGreen,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                _searchQuery.isNotEmpty
                    ? 'No listings match "$_searchQuery"'
                    : statusFilter == 'ALL'
                        ? 'You haven\'t posted any ads yet'
                        : 'No $statusFilter listings found',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontFamily: 'Poppins',
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: AppColors.appDark,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Sell items you no longer need and reach thousands of buyers nearby.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontFamily: 'Poppins',
                  fontSize: 13,
                  color: Colors.grey.shade500,
                ),
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const SellFlowScreen()),
                  );
                },
                icon: const Icon(Icons.add_rounded),
                label: const Text(
                  'Post an Ad Now',
                  style: TextStyle(
                    fontFamily: 'Poppins',
                    fontWeight: FontWeight.w700,
                  ),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.appGreen,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: ads.length,
      itemBuilder: (context, index) {
        final ad = ads[index];
        return _AdItemCard(
          ad: ad,
          onMarkAsSold: () => _markAsSold(ad['id']),
          onDelete: () => _deleteAd(ad['id']),
          onEdit: () {
            Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => const SellFlowScreen()),
            );
          },
        );
      },
    );
  }
}

// ── Stat Card Component ──────────────────────────────────────────────────────

class _StatCard extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String label;
  final String value;
  final Color bgColor;

  const _StatCard({
    required this.icon,
    required this.iconColor,
    required this.label,
    required this.value,
    required this.bgColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: iconColor.withValues(alpha: 0.2)),
      ),
      child: Row(
        children: [
          Icon(icon, size: 20, color: iconColor),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  value,
                  style: TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: iconColor,
                    height: 1.1,
                  ),
                ),
                Text(
                  label,
                  style: TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    color: Colors.grey.shade600,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ── Ad Item Card Component ───────────────────────────────────────────────────

class _AdItemCard extends StatelessWidget {
  final Map<String, dynamic> ad;
  final VoidCallback onMarkAsSold;
  final VoidCallback onDelete;
  final VoidCallback onEdit;

  const _AdItemCard({
    required this.ad,
    required this.onMarkAsSold,
    required this.onDelete,
    required this.onEdit,
  });

  Color _getStatusColor(String status) {
    switch (status) {
      case 'ACTIVE':
        return AppColors.appGreen;
      case 'PENDING':
        return const Color(0xFFD97706);
      case 'SOLD':
        return Colors.blueGrey;
      case 'DRAFT':
        return Colors.grey;
      default:
        return AppColors.appGreen;
    }
  }

  String _getStatusLabel(String status) {
    switch (status) {
      case 'ACTIVE':
        return 'Active';
      case 'PENDING':
        return 'Under Review';
      case 'SOLD':
        return 'Sold';
      case 'DRAFT':
        return 'Draft';
      default:
        return status;
    }
  }

  @override
  Widget build(BuildContext context) {
    final status = ad['status'].toString();
    final statusColor = _getStatusColor(status);
    final statusLabel = _getStatusLabel(status);
    final priceStr = '₹${ad['price'].toInt().toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')}';
    final accent = ad['accent'] as Color? ?? AppColors.appGreen;
    final icon = ad['icon'] as IconData? ?? Icons.shopping_bag_rounded;

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
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
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(14),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Product Thumbnail Container
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: accent.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: accent.withValues(alpha: 0.2)),
                  ),
                  child: Center(
                    child: Icon(icon, size: 36, color: accent),
                  ),
                ),
                const SizedBox(width: 12),

                // Details Column
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Status Badge & Category
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: statusColor.withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              statusLabel,
                              style: TextStyle(
                                fontFamily: 'Poppins',
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                color: statusColor,
                              ),
                            ),
                          ),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              '• ${ad['category']}',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontFamily: 'Poppins',
                                fontSize: 11,
                                color: Colors.grey.shade500,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                          // More Options Menu
                          PopupMenuButton<String>(
                            onSelected: (val) {
                              if (val == 'edit') onEdit();
                              if (val == 'sold') onMarkAsSold();
                              if (val == 'delete') onDelete();
                            },
                            itemBuilder: (ctx) => [
                              const PopupMenuItem(
                                value: 'edit',
                                child: Row(
                                  children: [
                                    Icon(Icons.edit_outlined, size: 18),
                                    SizedBox(width: 8),
                                    Text('Edit Listing', style: TextStyle(fontFamily: 'Poppins', fontSize: 13)),
                                  ],
                                ),
                              ),
                              if (status != 'SOLD')
                                const PopupMenuItem(
                                  value: 'sold',
                                  child: Row(
                                    children: [
                                      Icon(Icons.check_circle_outline_rounded, size: 18, color: AppColors.appGreen),
                                      SizedBox(width: 8),
                                      Text('Mark as Sold', style: TextStyle(fontFamily: 'Poppins', fontSize: 13)),
                                    ],
                                  ),
                                ),
                              const PopupMenuItem(
                                value: 'delete',
                                child: Row(
                                  children: [
                                    Icon(Icons.delete_outline_rounded, size: 18, color: Colors.red),
                                    SizedBox(width: 8),
                                    Text('Delete', style: TextStyle(fontFamily: 'Poppins', fontSize: 13, color: Colors.red)),
                                  ],
                                ),
                              ),
                            ],
                            icon: Icon(Icons.more_vert_rounded, size: 18, color: Colors.grey.shade400),
                            padding: EdgeInsets.zero,
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),

                      // Title
                      Text(
                        ad['title'].toString(),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontFamily: 'Poppins',
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: AppColors.appDark,
                          height: 1.3,
                        ),
                      ),
                      const SizedBox(height: 6),

                      // Price
                      Text(
                        priceStr,
                        style: const TextStyle(
                          fontFamily: 'Poppins',
                          fontSize: 15,
                          fontWeight: FontWeight.w800,
                          color: AppColors.appGreen,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const Divider(height: 1, color: Color(0xFFF1F5F9)),

          // Stats Bar & Quick Action Row
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            child: Row(
              children: [
                // Views
                Icon(Icons.visibility_outlined, size: 14, color: Colors.grey.shade500),
                const SizedBox(width: 4),
                Text(
                  '${ad['views']}',
                  style: TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: Colors.grey.shade600,
                  ),
                ),
                const SizedBox(width: 12),

                // Favorites
                Icon(Icons.favorite_border_rounded, size: 14, color: Colors.grey.shade500),
                const SizedBox(width: 4),
                Text(
                  '${ad['favorites']}',
                  style: TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: Colors.grey.shade600,
                  ),
                ),
                const SizedBox(width: 12),

                // Chats
                Icon(Icons.chat_bubble_outline_rounded, size: 14, color: Colors.grey.shade500),
                const SizedBox(width: 4),
                Text(
                  '${ad['chats']}',
                  style: TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: Colors.grey.shade600,
                  ),
                ),

                const Spacer(),

                // Quick Action Buttons
                if (status == 'ACTIVE')
                  ElevatedButton(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Ad Boosted! Featured at top of search.', style: TextStyle(fontFamily: 'Poppins')),
                          backgroundColor: AppColors.appBlue,
                          behavior: SnackBarBehavior.floating,
                        ),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFEFF6FF),
                      foregroundColor: AppColors.appBlue,
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.bolt_rounded, size: 14),
                        SizedBox(width: 3),
                        Text(
                          'Boost',
                          style: TextStyle(
                            fontFamily: 'Poppins',
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                  ),

                if (status == 'DRAFT')
                  ElevatedButton(
                    onPressed: onEdit,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.appGreen,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: const Text(
                      'Finish Draft',
                      style: TextStyle(
                        fontFamily: 'Poppins',
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
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
