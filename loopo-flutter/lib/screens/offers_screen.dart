import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class OffersScreen extends StatefulWidget {
  const OffersScreen({super.key});

  @override
  State<OffersScreen> createState() => _OffersScreenState();
}

class _OffersScreenState extends State<OffersScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  final List<Map<String, dynamic>> _madeOffers = [
    {
      'id': 'off-1',
      'itemTitle': 'iPhone 15 Pro Max 256GB',
      'itemPrice': '₹78,000',
      'offeredPrice': '₹72,000',
      'sellerName': 'Rahul Verma',
      'status': 'Pending',
      'date': 'Yesterday',
      'image': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=400&auto=format&fit=crop',
    },
    {
      'id': 'off-2',
      'itemTitle': 'MacBook Pro M2 16"',
      'itemPrice': '₹1,45,000',
      'offeredPrice': '₹1,35,000',
      'sellerName': 'Priya Sharma',
      'status': 'Accepted',
      'date': '3 days ago',
      'image': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=400&auto=format&fit=crop',
    },
  ];

  final List<Map<String, dynamic>> _receivedOffers = [
    {
      'id': 'off-3',
      'itemTitle': 'Sony WH-1000XM5 Headphones',
      'itemPrice': '₹22,000',
      'offeredPrice': '₹19,500',
      'buyerName': 'Ananya Roy',
      'status': 'Pending',
      'date': 'Today',
      'image': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop',
    },
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _handleOfferAction(Map<String, dynamic> offer, String newStatus) {
    setState(() {
      offer['status'] = newStatus;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Offer marked as $newStatus'),
        backgroundColor: newStatus == 'Accepted' ? AppColors.emerald600 : Colors.red,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAFAFA),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        iconTheme: const IconThemeData(color: Colors.black87),
        title: const Text(
          'Offer & Bargain Center',
          style: TextStyle(color: Colors.black87, fontWeight: FontWeight.w800, fontSize: 18),
        ),
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.emerald600,
          unselectedLabelColor: Colors.black54,
          indicatorColor: AppColors.emerald600,
          indicatorWeight: 3,
          labelStyle: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13),
          tabs: const [
            Tab(text: 'Offers Made'),
            Tab(text: 'Offers Received'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildOffersList(_madeOffers, isReceived: false),
          _buildOffersList(_receivedOffers, isReceived: true),
        ],
      ),
    );
  }

  Widget _buildOffersList(List<Map<String, dynamic>> offers, {required bool isReceived}) {
    if (offers.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.local_offer_outlined, size: 64, color: Colors.grey.shade400),
            const SizedBox(height: 12),
            Text(
              isReceived ? 'No offers received yet' : 'No offers made yet',
              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15, color: Colors.black87),
            ),
            const SizedBox(height: 4),
            Text(
              isReceived
                ? 'Offers from interested buyers will appear here'
                : 'Bargain offers you make on items will appear here',
              style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: offers.length,
      itemBuilder: (context, index) {
        final offer = offers[index];
        final status = offer['status'] as String;

        Color statusBg;
        Color statusText;
        if (status == 'Accepted') {
          statusBg = AppColors.emerald600.withValues(alpha: 0.1);
          statusText = AppColors.emerald600;
        } else if (status == 'Declined') {
          statusBg = Colors.red.shade50;
          statusText = Colors.red;
        } else {
          statusBg = Colors.amber.shade50;
          statusText = Colors.amber.shade900;
        }

        return Container(
          margin: const EdgeInsets.only(bottom: 14),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: Colors.grey.shade200),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.02),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: Image.network(
                      offer['image'],
                      width: 60,
                      height: 60,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Container(
                        width: 60,
                        height: 60,
                        color: Colors.grey.shade200,
                        child: const Icon(Icons.image, size: 24, color: Colors.grey),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          offer['itemTitle'],
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          isReceived ? 'Buyer: ${offer['buyerName']}' : 'Seller: ${offer['sellerName']}',
                          style: TextStyle(fontSize: 12, color: Colors.grey.shade600, fontWeight: FontWeight.w500),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Text(
                              'Listed: ${offer['itemPrice']}',
                              style: const TextStyle(fontSize: 11, color: Colors.grey, decoration: TextDecoration.lineThrough),
                            ),
                            const SizedBox(width: 8),
                            const Text(
                              'Offered:',
                              style: TextStyle(fontSize: 11, color: Colors.grey),
                            ),
                            const SizedBox(width: 4),
                            Text(
                              offer['offeredPrice'],
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: AppColors.emerald600),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: statusBg,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      status,
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: statusText),
                    ),
                  ),
                ],
              ),
              if (isReceived && status == 'Pending') ...[
                const SizedBox(height: 12),
                const Divider(height: 1),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => _handleOfferAction(offer, 'Declined'),
                        style: OutlinedButton.styleFrom(
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          side: BorderSide(color: Colors.grey.shade300),
                        ),
                        child: const Text('Decline', style: TextStyle(color: Colors.black87, fontWeight: FontWeight.w700, fontSize: 12)),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () => _handleOfferAction(offer, 'Accepted'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.emerald600,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          elevation: 0,
                        ),
                        child: const Text('Accept Offer', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 12)),
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        );
      },
    );
  }
}
