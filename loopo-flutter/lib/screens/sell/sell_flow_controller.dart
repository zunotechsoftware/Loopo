import 'dart:io';
import 'package:flutter/material.dart';

/// Holds all data collected across the sell flow steps.
class SellFlowData {
  // Step 1 – Sell Home / Category selection
  String? selectedCategoryId;
  String? selectedCategoryName;
  String? selectedSubcategoryId;
  String? selectedSubcategoryName;

  // Step 3 – Photos
  List<File> photos = [];

  // Step 4 – Item Details
  String title = '';
  String brand = '';
  String model = '';
  String condition = '';
  String description = '';
  int quantity = 1;

  // Step 5 – Price
  double? price;
  bool isNegotiable = false;
  bool acceptOffers = false;

  // Step 6 – Location
  String? locationName;
  String? locationAddress;
  double? latitude;
  double? longitude;

  // Step 7 – Seller Contact
  bool allowChat = true;
  bool allowCall = true;
  String? email;
  bool isVerifiedSeller = false;
}

/// Controller that drives the PageView and holds shared [SellFlowData].
class SellFlowController extends ChangeNotifier {
  final PageController pageController = PageController();
  final SellFlowData data = SellFlowData();

  int _currentStep = 0;
  int get currentStep => _currentStep;

  /// Total navigable steps (excluding the success screen).
  static const int totalSteps = 8;

  void goToNext() {
    if (_currentStep < totalSteps - 1) {
      _currentStep++;
      pageController.nextPage(
        duration: const Duration(milliseconds: 350),
        curve: Curves.easeInOut,
      );
      notifyListeners();
    }
  }

  void goToPrev() {
    if (_currentStep > 0) {
      _currentStep--;
      pageController.previousPage(
        duration: const Duration(milliseconds: 350),
        curve: Curves.easeInOut,
      );
      notifyListeners();
    }
  }

  void jumpTo(int step) {
    _currentStep = step;
    pageController.jumpToPage(step);
    notifyListeners();
  }

  @override
  void dispose() {
    pageController.dispose();
    super.dispose();
  }
}
