// ─── Sell Flow Entry Point ────────────────────────────────────────────────────
// sell_flow_screen.dart – PageView orchestrator for the 9-step sell flow.

import 'package:flutter/material.dart';
import 'sell_flow_controller.dart';
import 'step1_sell_home.dart';
import 'step2_category_selection.dart';
import 'step3_add_photos.dart';
import 'step4_item_details.dart';
import 'step5_price.dart';
import 'step6_location.dart';
import 'step7_seller_contact.dart';
import 'step8_review_listing.dart';
import 'step9_published.dart';

class SellFlowScreen extends StatefulWidget {
  const SellFlowScreen({super.key});

  @override
  State<SellFlowScreen> createState() => _SellFlowScreenState();
}

class _SellFlowScreenState extends State<SellFlowScreen> {
  late final SellFlowController _ctrl;

  @override
  void initState() {
    super.initState();
    _ctrl = SellFlowController();
    _ctrl.addListener(() {
      if (mounted) setState(() {});
    });
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: _ctrl.currentStep == 0,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop && _ctrl.currentStep > 0) {
          _ctrl.goToPrev();
        }
      },
      child: PageView(
        controller: _ctrl.pageController,
        physics: const NeverScrollableScrollPhysics(), // driven only by controller
        children: [
          // Step 1
          SellHomeScreen(controller: _ctrl),
          // Step 2
          CategorySelectionScreen(controller: _ctrl),
          // Step 3
          AddPhotosScreen(controller: _ctrl),
          // Step 4
          ItemDetailsScreen(controller: _ctrl),
          // Step 5
          PriceScreen(controller: _ctrl),
          // Step 6
          LocationScreen(controller: _ctrl),
          // Step 7
          SellerContactScreen(controller: _ctrl),
          // Step 8
          ReviewListingScreen(controller: _ctrl),
          // Step 9 – success (no back nav)
          ListingPublishedScreen(
            onGoHome: () => Navigator.of(context).popUntil((r) => r.isFirst),
            onViewListing: () {
              // TODO: Navigate to listing detail
              Navigator.of(context).popUntil((r) => r.isFirst);
            },
            onSellAnother: () {
              // Restart by replacing this route
              Navigator.of(context).pushReplacement(
                MaterialPageRoute(
                  builder: (_) => const SellFlowScreen(),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
