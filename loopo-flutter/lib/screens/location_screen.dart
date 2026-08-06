import 'package:flutter/material.dart';
import '../services/location_service.dart';
import '../theme/app_colors.dart';
import '../widgets/primary_button.dart';
import 'home_screen.dart';

class LocationScreen extends StatefulWidget {
  const LocationScreen({super.key});

  @override
  State<LocationScreen> createState() => _LocationScreenState();
}

class _LocationScreenState extends State<LocationScreen> {
  bool _isLoading = false;

  // ---- Responsive breakpoints / helpers -------------------------------
  static const double _tabletBreakpoint = 600;
  static const double _maxContentWidth = 480;

  double _horizontalPadding(double width) {
    if (width >= _tabletBreakpoint) {
      final overflow = width - _maxContentWidth;
      return overflow > 0 ? overflow / 2 : 24.0;
    }
    return 24.0;
  }

  void _handleFindLocation() async {
    setState(() {
      _isLoading = true;
    });

    final loc = await LocationService().detectCurrentLocation();

    if (mounted) {
      setState(() {
        _isLoading = false;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Location found: ${loc['city']}, ${loc['country']}'),
          backgroundColor: Colors.green,
        ),
      );

      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const HomeScreen()),
      );
    }
  }

  // ---- Handle Other Location ----
  void _handleOtherLocation() {
    // TODO: Open a location picker or manual address input
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Location picker coming soon!'),
        backgroundColor: AppColors.appBlue,
      ),
    );
  }

  // ---- Wrapper methods for button callbacks ----
  void _onFindLocationPressed() {
    if (!_isLoading) {
      _handleFindLocation();
    }
  }

  void _onOtherLocationPressed() {
    _handleOtherLocation();
  }

  void _onSkipPressed() {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => const HomeScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            final width = constraints.maxWidth;
            final hPad = _horizontalPadding(width);

            return Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: _maxContentWidth),
                child: Padding(
                  padding: EdgeInsets.symmetric(horizontal: hPad),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Illustration
                      Image.asset(
                        "assets/images/location.png",

                        fit: BoxFit.contain,
                      ),
                      const SizedBox(height: 32),

                      // Title
                      const Text(
                        'Where is your location?',
                        style: TextStyle(
                          fontFamily: 'Poppins',
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Colors.black,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 12),

                      // Subtitle
                      const Text(
                        'Enjoy a personalized selling and buying experience by telling us your location.',
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.black54,
                          height: 1.5,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 32),

                      // Find My Location Button
                      SizedBox(
                        width: double.infinity,
                        child: PrimaryButton(
                          text: 'Find My Location',
                          onPressed: _onFindLocationPressed,
                        ),
                      ),
                      const SizedBox(height: 12),

                      // Other Location Button (Ghost)
                      SizedBox(
                        width: double.infinity,
                        child: TextButton(
                          onPressed: _onOtherLocationPressed,
                          style: TextButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                              side: BorderSide(
                                color: AppColors.appBlue,
                                width: 1.5,
                              ),
                            ),
                            foregroundColor: AppColors.appBlue,
                          ),
                          child: const Text(
                            'Other Location',
                            style: TextStyle(
                              fontFamily: 'Poppins',
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Skip for now
                      TextButton(
                        onPressed: _onSkipPressed,
                        child: const Text(
                          'Skip for now',
                          style: TextStyle(fontSize: 14, color: Colors.black54),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
