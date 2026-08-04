// ─── Step 6 – Location ───────────────────────────────────────────────────────

import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import 'sell_widgets.dart';
import 'sell_flow_controller.dart';

const _recentLocations = [
  {'name': 'Koramangala', 'address': 'Koramangala, Bengaluru, Karnataka'},
  {'name': 'Indiranagar', 'address': 'Indiranagar, Bengaluru, Karnataka'},
  {'name': 'HSR Layout', 'address': 'HSR Layout, Bengaluru, Karnataka'},
];

class LocationScreen extends StatefulWidget {
  final SellFlowController controller;

  const LocationScreen({super.key, required this.controller});

  @override
  State<LocationScreen> createState() => _LocationScreenState();
}

class _LocationScreenState extends State<LocationScreen> {
  final _searchCtrl = TextEditingController();
  String? _selectedLocation;
  String? _selectedAddress;
  bool _isDetecting = false;
  String? _locationError;

  @override
  void initState() {
    super.initState();
    final d = widget.controller.data;
    _selectedLocation = d.locationName;
    _selectedAddress = d.locationAddress;
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _detectCurrentLocation() async {
    setState(() => _isDetecting = true);
    // Simulated delay – replace with geolocator
    await Future.delayed(const Duration(seconds: 2));
    if (!mounted) return;
    setState(() {
      _isDetecting = false;
      _selectedLocation = 'My Current Location';
      _selectedAddress = 'Bengaluru, Karnataka';
      _locationError = null;
    });
    _syncToController('My Current Location', 'Bengaluru, Karnataka');
  }

  void _selectRecent(String name, String address) {
    setState(() {
      _selectedLocation = name;
      _selectedAddress = address;
      _locationError = null;
    });
    _syncToController(name, address);
  }

  void _syncToController(String name, String address) {
    widget.controller.data.locationName = name;
    widget.controller.data.locationAddress = address;
  }

  bool _validate() {
    if (_selectedLocation == null) {
      setState(() => _locationError = 'Please select a location');
      return false;
    }
    return true;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      appBar: SellAppBar(
        title: 'Location',
        currentStep: 6,
        totalSteps: SellFlowController.totalSteps,
        onBack: () => widget.controller.goToPrev(),
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Where is the item located?',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      color: AppColors.appDark,
                      fontFamily: 'Poppins',
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Help buyers know where to find your item',
                    style: TextStyle(
                      fontSize: 13,
                      color: Colors.grey.shade500,
                      fontFamily: 'Poppins',
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Map placeholder
                  _MapPlaceholder(),
                  const SizedBox(height: 16),

                  // Use current location button
                  _CurrentLocationCard(
                    isDetecting: _isDetecting,
                    onTap: _detectCurrentLocation,
                    selectedLocation: _selectedLocation,
                    selectedAddress: _selectedAddress,
                  ),
                  const SizedBox(height: 16),

                  // Search location
                  SellSearchBar(
                    hint: 'Search locality, area or city…',
                    controller: _searchCtrl,
                    onChanged: (v) {
                      // TODO: integrate location search API
                    },
                  ),
                  if (_locationError != null) ...[
                    const SizedBox(height: 6),
                    Text(
                      _locationError!,
                      style: const TextStyle(
                        fontSize: 12,
                        color: Colors.red,
                        fontFamily: 'Poppins',
                      ),
                    ),
                  ],
                  const SizedBox(height: 20),

                  // Recent locations
                  SellSectionHeader(
                    title: 'Recent Locations',
                    action: 'Clear',
                    onAction: () {},
                  ),
                  ..._recentLocations.map(
                    (loc) => _RecentLocationTile(
                      name: loc['name']!,
                      address: loc['address']!,
                      isSelected: _selectedLocation == loc['name'],
                      onTap: () =>
                          _selectRecent(loc['name']!, loc['address']!),
                    ),
                  ),
                  const SizedBox(height: 8),
                ],
              ),
            ),
          ),
          SellContinueButton(
            onPressed: () {
              if (_validate()) widget.controller.goToNext();
            },
          ),
        ],
      ),
    );
  }
}

// ── Map Placeholder ───────────────────────────────────────────────────────────

class _MapPlaceholder extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 180,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        gradient: const LinearGradient(
          colors: [Color(0xFFE8F5E9), Color(0xFFE3F2FD)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        border: Border.all(color: const Color(0xFFE5E7EB)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Stack(
        children: [
          // Grid lines
          CustomPaint(
            size: const Size(double.infinity, 180),
            painter: _MapGridPainter(),
          ),
          // Center pin
          Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: Colors.red.shade400,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.red.withValues(alpha: 0.4),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: const Icon(Icons.location_on_rounded,
                      color: Colors.white, size: 24),
                ),
                const SizedBox(height: 4),
                Container(
                  width: 10,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              ],
            ),
          ),
          // Map label
          Positioned(
            top: 12,
            left: 12,
            child: Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.06),
                    blurRadius: 6,
                  ),
                ],
              ),
              child: const Row(
                children: [
                  Icon(Icons.map_rounded, size: 14, color: AppColors.appBlue),
                  SizedBox(width: 4),
                  Text(
                    'Map View',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: AppColors.appDark,
                      fontFamily: 'Poppins',
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _MapGridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.blueGrey.withValues(alpha: 0.08)
      ..strokeWidth = 1;
    const step = 30.0;
    for (double x = 0; x <= size.width; x += step) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }
    for (double y = 0; y <= size.height; y += step) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  @override
  bool shouldRepaint(_) => false;
}

// ── Current Location Card ─────────────────────────────────────────────────────

class _CurrentLocationCard extends StatelessWidget {
  final bool isDetecting;
  final VoidCallback onTap;
  final String? selectedLocation;
  final String? selectedAddress;

  const _CurrentLocationCard({
    required this.isDetecting,
    required this.onTap,
    this.selectedLocation,
    this.selectedAddress,
  });

  @override
  Widget build(BuildContext context) {
    final hasSelection = selectedLocation != null;
    return GestureDetector(
      onTap: isDetecting ? null : onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: hasSelection
              ? AppColors.appGreen.withValues(alpha: 0.06)
              : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: hasSelection
                ? AppColors.appGreen
                : const Color(0xFFE5E7EB),
            width: hasSelection ? 2 : 1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 10,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: hasSelection
                    ? AppColors.appGreen.withValues(alpha: 0.12)
                    : const Color(0xFFEFF6FF),
                borderRadius: BorderRadius.circular(12),
              ),
              child: isDetecting
                  ? const Padding(
                      padding: EdgeInsets.all(10),
                      child: CircularProgressIndicator(
                        strokeWidth: 2.5,
                        color: AppColors.appGreen,
                      ),
                    )
                  : Icon(
                      hasSelection
                          ? Icons.check_circle_rounded
                          : Icons.my_location_rounded,
                      color: hasSelection ? AppColors.appGreen : AppColors.appBlue,
                      size: 22,
                    ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    hasSelection ? selectedLocation! : 'Use Current Location',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: hasSelection
                          ? AppColors.appGreen
                          : AppColors.appDark,
                      fontFamily: 'Poppins',
                    ),
                  ),
                  if (selectedAddress != null) ...[
                    const SizedBox(height: 2),
                    Text(
                      selectedAddress!,
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey.shade500,
                        fontFamily: 'Poppins',
                      ),
                    ),
                  ] else
                    Text(
                      'Auto-detect your GPS location',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey.shade400,
                        fontFamily: 'Poppins',
                      ),
                    ),
                ],
              ),
            ),
            if (!hasSelection)
              const Icon(Icons.arrow_forward_ios_rounded,
                  size: 14, color: Colors.grey),
          ],
        ),
      ),
    );
  }
}

// ── Recent Location Tile ──────────────────────────────────────────────────────

class _RecentLocationTile extends StatelessWidget {
  final String name;
  final String address;
  final bool isSelected;
  final VoidCallback onTap;

  const _RecentLocationTile({
    required this.name,
    required this.address,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.appGreen.withValues(alpha: 0.06)
              : Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected ? AppColors.appGreen : const Color(0xFFE5E7EB),
            width: isSelected ? 2 : 1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.03),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            Icon(
              Icons.history_rounded,
              color: isSelected ? AppColors.appGreen : Colors.grey.shade400,
              size: 20,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: isSelected ? AppColors.appGreen : AppColors.appDark,
                      fontFamily: 'Poppins',
                    ),
                  ),
                  Text(
                    address,
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey.shade400,
                      fontFamily: 'Poppins',
                    ),
                  ),
                ],
              ),
            ),
            if (isSelected)
              const Icon(Icons.check_rounded,
                  color: AppColors.appGreen, size: 18),
          ],
        ),
      ),
    );
  }
}
