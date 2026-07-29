import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../theme/app_colors.dart';
import '../widgets/form_input.dart';
import '../widgets/primary_button.dart';
import 'home_screen.dart';

class ProfileSetupScreen extends StatefulWidget {
  const ProfileSetupScreen({super.key});

  @override
  State<ProfileSetupScreen> createState() => _ProfileSetupScreenState();
}

class _ProfileSetupScreenState extends State<ProfileSetupScreen> {
  final TextEditingController _cityController = TextEditingController();

  File? _profileImage;
  bool _allowGPS = true;
  bool _isLoading = false;

  // ---- Responsive breakpoints / helpers -------------------------------
  static const double _tabletBreakpoint = 600;
  static const double _maxContentWidth = 480;

  bool _isTablet(double width) => width >= _tabletBreakpoint;

  double _horizontalPadding(double width) {
    if (width >= _tabletBreakpoint) {
      final overflow = width - _maxContentWidth;
      return overflow > 0 ? overflow / 2 : 24.0;
    }
    return 24.0;
  }

  @override
  void dispose() {
    _cityController.dispose();
    super.dispose();
  }

  void _onSavePressed() {
    if (!_isLoading) {
      _handleSave();
    }
  }

  // ---- Image Picker ----
  Future<void> _pickImage() async {
    try {
      final ImagePicker picker = ImagePicker();
      final XFile? image = await picker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 512,
        maxHeight: 512,
        imageQuality: 80,
      );

      if (image != null) {
        setState(() {
          _profileImage = File(image.path);
        });
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error picking image: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  // ---- Handle Save ----
  void _handleSave() {
    final city = _cityController.text.trim();

    if (city.isEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Please enter your city')));
      return;
    }

    setState(() {
      _isLoading = true;
    });

    // TODO: Save profile data to backend
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Profile setup complete!'),
            backgroundColor: Colors.green,
          ),
        );

        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const HomeScreen()),
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        leading: IconButton(
          icon: const Icon(
            Icons.arrow_back_ios_new,
            size: 20,
            color: Colors.black,
          ),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text(
          'Profile Setup',
          style: TextStyle(color: Colors.black, fontWeight: FontWeight.w600),
        ),
        centerTitle: true,
      ),
      backgroundColor: Colors.white,
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            final width = constraints.maxWidth;
            final hPad = _horizontalPadding(width);

            return Column(
              children: [
                Expanded(
                  child: SingleChildScrollView(
                    physics: const ClampingScrollPhysics(),
                    padding: EdgeInsets.symmetric(horizontal: hPad),
                    child: ConstrainedBox(
                      constraints: BoxConstraints(
                        minHeight: constraints.maxHeight - 120,
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          const SizedBox(height: 20),

                          // Header
                          const Text(
                            "Let's Set Up Your Profile",
                            style: TextStyle(
                              fontFamily: 'Poppins',
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'Help others know you better',
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.black54,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 32),

                          // Profile Photo (Optional)
                          _buildProfilePhotoSection(),
                          const SizedBox(height: 24),

                          // Current City
                          _buildCitySection(),
                          const SizedBox(height: 16),

                          // GPS Toggle
                          _buildGPSSection(),
                          const SizedBox(height: 32),

                          // Save Button
                          SizedBox(
                            width: double.infinity,
                            child: PrimaryButton(
                              text: _isLoading
                                  ? 'Saving...'
                                  : 'Save & Continue',
                              onPressed: _onSavePressed, // ✅ Pass directly
                            ),
                          ),
                          const SizedBox(height: 20),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  // -----------------------------------------------------------------------
  // PROFILE PHOTO SECTION
  // -----------------------------------------------------------------------
  Widget _buildProfilePhotoSection() {
    return Column(
      children: [
        GestureDetector(
          onTap: _pickImage,
          child: Stack(
            children: [
              Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.grey.shade100,
                  border: Border.all(color: Colors.grey.shade300, width: 2),
                  image: _profileImage != null
                      ? DecorationImage(
                          image: FileImage(_profileImage!),
                          fit: BoxFit.cover,
                        )
                      : null,
                ),
                child: _profileImage == null
                    ? Icon(Icons.person, size: 50, color: Colors.grey.shade400)
                    : null,
              ),
              Positioned(
                bottom: 0,
                right: 0,
                child: Container(
                  width: 30,
                  height: 30,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppColors.appGreen,
                    border: Border.all(color: Colors.white, width: 2),
                  ),
                  child: const Icon(
                    Icons.camera_alt,
                    color: Colors.white,
                    size: 16,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 8),
        Text(
          _profileImage == null
              ? 'Profile Photo (Optional)'
              : 'Tap to change photo',
          style: TextStyle(
            fontSize: 12,
            color: _profileImage == null ? Colors.black54 : AppColors.appGreen,
          ),
        ),
      ],
    );
  }

  // -----------------------------------------------------------------------
  // CITY SECTION
  // -----------------------------------------------------------------------
  Widget _buildCitySection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Current City',
          style: TextStyle(
            fontFamily: 'Poppins',
            fontWeight: FontWeight.bold,
            fontSize: 14,
          ),
        ),
        const SizedBox(height: 8),
        FormInput(
          hintText: 'Enter your city',
          controller: _cityController,
          keyboardType: TextInputType.text,
        ),
      ],
    );
  }

  // -----------------------------------------------------------------------
  // GPS SECTION
  // -----------------------------------------------------------------------
  Widget _buildGPSSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        children: [
          Icon(
            Icons.location_on,
            color: _allowGPS ? AppColors.appGreen : Colors.grey,
            size: 24,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              'Allow GPS Location',
              style: TextStyle(
                fontFamily: 'Poppins',
                fontWeight: FontWeight.w600,
                fontSize: 14,
                color: _allowGPS ? Colors.black87 : Colors.grey.shade600,
              ),
            ),
          ),
          Switch(
            value: _allowGPS,
            onChanged: (value) {
              setState(() {
                _allowGPS = value;
              });
            },
            activeColor: AppColors.appGreen,
          ),
        ],
      ),
    );
  }
}
