import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../services/offer_service.dart';

class OffersScreen extends StatefulWidget {
  const OffersScreen({super.key});

  @override
  State<OffersScreen> createState() => _OffersScreenState();
}

class _OffersScreenState extends State<OffersScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final OfferService _offerService = OfferService();

  List<dynamic> _madeOffers = [];
  List<dynamic> _receivedOffers = [];
  bool _isLoading = true;
  String? _error;
  final Set<String> _actioningIds = {};

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _load();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final made = await _offerService.getMadeOffers();
      final received = await _offerService.getReceivedOffers();
      if (!mounted) return;
      setState(() {
        _madeOffers = made;
        _receivedOffers = received;
        _isLoading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _error = 'Could not load your offers. Please try again.';
        _isLoading = false;
      });
    }
  }

  Future<void> _accept(Map offer) =>
      _act(offer, () => _offerService.acceptOffer(offer['id'].toString()));
  Future<void> _reject(Map offer) =>
      _act(offer, () => _offerService.rejectOffer(offer['id'].toString()));
  Future<void> _withdraw(Map offer) =>
      _act(offer, () => _offerService.withdrawOffer(offer['id'].toString()));

  Future<void> _act(Map offer, Future<void> Function() action) async {
    final id = offer['id'].toString();
    setState(() => _actioningIds.add(id));
    try {
      await action();
      await _load();
    } catch (e) {
      if (!mounted) return;
      setState(() => _actioningIds.remove(id));
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString().replaceFirst('Exception: ', ''))),
      );
    }
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
          style: TextStyle(
            color: Colors.black87,
            fontWeight: FontWeight.w800,
            fontSize: 18,
          ),
        ),
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.emerald600,
          unselectedLabelColor: Colors.black54,
          indicatorColor: AppColors.emerald600,
          indicatorWeight: 3,
          labelStyle: const TextStyle(
            fontWeight: FontWeight.w800,
            fontSize: 13,
          ),
          tabs: const [
            Tab(text: 'Offers Made'),
            Tab(text: 'Offers Received'),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.emerald600),
            )
          : _error != null
          ? Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(_error!, style: const TextStyle(color: Colors.black54)),
                  const SizedBox(height: 12),
                  ElevatedButton(onPressed: _load, child: const Text('Retry')),
                ],
              ),
            )
          : TabBarView(
              controller: _tabController,
              children: [
                _buildOffersList(_madeOffers, isReceived: false),
                _buildOffersList(_receivedOffers, isReceived: true),
              ],
            ),
    );
  }

  Widget _buildOffersList(List<dynamic> offers, {required bool isReceived}) {
    if (offers.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.local_offer_outlined,
              size: 64,
              color: Colors.grey.shade400,
            ),
            const SizedBox(height: 12),
            Text(
              isReceived ? 'No offers received yet' : 'No offers made yet',
              style: const TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 15,
                color: Colors.black87,
              ),
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

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: offers.length,
        itemBuilder: (context, index) {
          final offer = offers[index] as Map;
          final id = offer['id'].toString();
          final status = (offer['status'] ?? 'PENDING').toString();
          final product = offer['product'] is Map
              ? offer['product'] as Map
              : {};
          final otherParty = isReceived
              ? (offer['buyer'] is Map ? offer['buyer'] as Map : {})
              : (offer['seller'] is Map ? offer['seller'] as Map : {});
          final otherPartyName =
              '${otherParty['firstName'] ?? ''} ${otherParty['lastName'] ?? ''}'
                  .trim();
          final images = product['images'] is List
              ? product['images'] as List
              : [];
          String imageUrl = '';
          if (images.isNotEmpty && images.first is Map) {
            final first = images.first as Map;
            imageUrl = (first['thumbnailUrl'] ?? first['originalUrl'] ?? '')
                .toString();
          }
          final currency = (product['currency'] ?? 'INR') == 'INR'
              ? '₹'
              : '${product['currency']} ';
          final listedPrice = '$currency${product['price'] ?? ''}';
          final offeredPrice = '$currency${offer['amount'] ?? ''}';
          final isActioning = _actioningIds.contains(id);

          Color statusBg;
          Color statusText;
          String statusLabel;
          switch (status) {
            case 'ACCEPTED':
              statusBg = AppColors.emerald600.withValues(alpha: 0.1);
              statusText = AppColors.emerald600;
              statusLabel = 'Accepted';
              break;
            case 'REJECTED':
              statusBg = Colors.red.shade50;
              statusText = Colors.red;
              statusLabel = 'Declined';
              break;
            case 'WITHDRAWN':
              statusBg = Colors.grey.shade200;
              statusText = Colors.grey.shade700;
              statusLabel = 'Withdrawn';
              break;
            default:
              statusBg = Colors.amber.shade50;
              statusText = Colors.amber.shade900;
              statusLabel = 'Pending';
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
                      child: imageUrl.isNotEmpty
                          ? Image.network(
                              imageUrl,
                              width: 60,
                              height: 60,
                              fit: BoxFit.cover,
                              errorBuilder: (_, _, _) => Container(
                                width: 60,
                                height: 60,
                                color: Colors.grey.shade200,
                                child: const Icon(
                                  Icons.image,
                                  size: 24,
                                  color: Colors.grey,
                                ),
                              ),
                            )
                          : Container(
                              width: 60,
                              height: 60,
                              color: Colors.grey.shade200,
                              child: const Icon(
                                Icons.image,
                                size: 24,
                                color: Colors.grey,
                              ),
                            ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            (product['title'] ?? 'Listing').toString(),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontWeight: FontWeight.w800,
                              fontSize: 14,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            isReceived
                                ? 'Buyer: ${otherPartyName.isEmpty ? 'User' : otherPartyName}'
                                : 'Seller: ${otherPartyName.isEmpty ? 'User' : otherPartyName}',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey.shade600,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              Text(
                                'Listed: $listedPrice',
                                style: const TextStyle(
                                  fontSize: 11,
                                  color: Colors.grey,
                                  decoration: TextDecoration.lineThrough,
                                ),
                              ),
                              const SizedBox(width: 8),
                              const Text(
                                'Offered:',
                                style: TextStyle(
                                  fontSize: 11,
                                  color: Colors.grey,
                                ),
                              ),
                              const SizedBox(width: 4),
                              Text(
                                offeredPrice,
                                style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w900,
                                  color: AppColors.emerald600,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: statusBg,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        statusLabel,
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          color: statusText,
                        ),
                      ),
                    ),
                  ],
                ),
                if (status == 'PENDING') ...[
                  const SizedBox(height: 12),
                  const Divider(height: 1),
                  const SizedBox(height: 10),
                  if (isReceived)
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: isActioning
                                ? null
                                : () => _reject(offer),
                            style: OutlinedButton.styleFrom(
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              side: BorderSide(color: Colors.grey.shade300),
                            ),
                            child: const Text(
                              'Decline',
                              style: TextStyle(
                                color: Colors.black87,
                                fontWeight: FontWeight.w700,
                                fontSize: 12,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: ElevatedButton(
                            onPressed: isActioning
                                ? null
                                : () => _accept(offer),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.emerald600,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              elevation: 0,
                            ),
                            child: isActioning
                                ? const SizedBox(
                                    width: 16,
                                    height: 16,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: Colors.white,
                                    ),
                                  )
                                : const Text(
                                    'Accept Offer',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.w800,
                                      fontSize: 12,
                                    ),
                                  ),
                          ),
                        ),
                      ],
                    )
                  else
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton(
                        onPressed: isActioning ? null : () => _withdraw(offer),
                        style: OutlinedButton.styleFrom(
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          side: BorderSide(color: Colors.red.shade200),
                        ),
                        child: isActioning
                            ? const SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                ),
                              )
                            : const Text(
                                'Withdraw Offer',
                                style: TextStyle(
                                  color: Colors.red,
                                  fontWeight: FontWeight.w700,
                                  fontSize: 12,
                                ),
                              ),
                      ),
                    ),
                ],
              ],
            ),
          );
        },
      ),
    );
  }
}
