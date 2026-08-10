import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../config/debug_config.dart';
import 'package:loopo/screens/otp_screen.dart';

import '../theme/app_colors.dart';
import '../widgets/form_input.dart';
import '../widgets/primary_button.dart';

class _CountryOption {
  final String flag;
  final String dialCode;
  final String name;

  const _CountryOption({
    required this.flag,
    required this.dialCode,
    required this.name,
  });
}

class LoginMobile extends StatefulWidget {
  const LoginMobile({super.key});

  @override
  State<LoginMobile> createState() => _LoginMobileState();
}

class _LoginMobileState extends State<LoginMobile> {
  final TextEditingController _mobileController = TextEditingController();

  static final RegExp _indiaMobileRegExp = RegExp(r'^[6-9]\d{9}$');

  static const List<_CountryOption> _countryOptions = [
    _CountryOption(flag: '🇮🇳', dialCode: '+91', name: 'India'),
    _CountryOption(flag: '🇺🇸', dialCode: '+1', name: 'United States'),
    _CountryOption(flag: '🇬🇧', dialCode: '+44', name: 'United Kingdom'),
    _CountryOption(flag: '🇦🇪', dialCode: '+971', name: 'UAE'),
  ];

  _CountryOption _selectedCountry = _countryOptions.first;

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

  double _logoWidth(double width) {
    if (_isTablet(width)) return 220;
    final proportional = width * 0.5;
    return proportional.clamp(140.0, 220.0);
  }

  bool _isValidMobile(String value) {
    final digitsOnly = value.replaceAll(RegExp(r'\D'), '');
    if (_selectedCountry.dialCode != '+91') {
      // Only India has strict validation for now; others just need 10 digits.
      return digitsOnly.length >= 6;
    }
    return digitsOnly.isNotEmpty && _indiaMobileRegExp.hasMatch(digitsOnly);
  }

  void _onMobileChanged(String value) {
    final digitsOnly = value.replaceAll(RegExp(r'\D'), '');
    final trimmedDigits = digitsOnly.length > 10
        ? digitsOnly.substring(0, 10)
        : digitsOnly;

    if (_selectedCountry.dialCode == '+91' &&
        trimmedDigits.isNotEmpty &&
        trimmedDigits[0] != '6' &&
        trimmedDigits[0] != '7' &&
        trimmedDigits[0] != '8' &&
        trimmedDigits[0] != '9') {
      _mobileController.clear();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Enter a valid Indian mobile number')),
      );
      return;
    }

    if (trimmedDigits != value) {
      _mobileController.value = TextEditingValue(
        text: trimmedDigits,
        selection: TextSelection.collapsed(offset: trimmedDigits.length),
      );
    }
  }

  void _handleSendOtp() async {
    if (DebugConfig.isBypassAuth || DebugConfig.isActive) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => OtpScreen(
            dialCode: _selectedCountry.dialCode,
            mobileNumber: _mobileController.text.trim().isEmpty
                ? DebugConfig.loginMobile
                : _mobileController.text.trim(),
          ),
        ),
      );
      return;
    }

    if (!_isValidMobile(_mobileController.text)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Enter a valid mobile number')),
      );
      return;
    }

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(child: CircularProgressIndicator()),
    );

    // Simulate network latency for OTP generation
    await Future.delayed(const Duration(milliseconds: 800));

    if (!mounted) return;
    Navigator.pop(context); // Close dialog

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Verification code sent! Use code 123456 to verify.'),
        backgroundColor: AppColors.appGreen,
        duration: Duration(seconds: 4),
      ),
    );

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => OtpScreen(
          dialCode: _selectedCountry.dialCode,
          mobileNumber: _mobileController.text.trim(),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _mobileController.dispose();
    super.dispose();
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
      ),
      backgroundColor: Colors.white,
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            final width = constraints.maxWidth;
            final hPad = _horizontalPadding(width);

            return Column(
              children: [
                // ---------------- LOGO (separate, fixed at top) ----------------
                _buildLogo(width, hPad),
                SizedBox(height: 30),

                // ---------------- MIDDLE CONTENT (fills available space) -------
                Expanded(
                  child: LayoutBuilder(
                    builder: (context, innerConstraints) {
                      return SingleChildScrollView(
                        physics: const ClampingScrollPhysics(),
                        padding: EdgeInsets.symmetric(horizontal: hPad),
                        child: ConstrainedBox(
                          constraints: BoxConstraints(
                            minHeight: innerConstraints.maxHeight,
                          ),
                          child: ConstrainedBox(
                            constraints: const BoxConstraints(
                              maxWidth: _maxContentWidth,
                            ),
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Enter Mobile Number',
                                  style: TextStyle(
                                    fontFamily: 'Poppins',
                                    fontSize: 24,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 6),
                                const Text(
                                  'We will send you an OTP to verify your number.',
                                  style: TextStyle(color: Colors.black54),
                                ),
                                const SizedBox(height: 24),
                                _buildMobileForm(),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),

                // ---------------- SEND OTP BUTTON (separate, fixed at bottom) ---
                _buildSendOtpButton(hPad),
              ],
            );
          },
        ),
      ),
    );
  }

  // -----------------------------------------------------------------------
  // SEND OTP BUTTON (pinned to bottom)
  // -----------------------------------------------------------------------
  Widget _buildSendOtpButton(double hPad) {
    return SafeArea(
      top: false,
      child: Padding(
        padding: EdgeInsets.fromLTRB(hPad, 12, hPad, 16),
        child: SizedBox(
          width: double.infinity,
          child: PrimaryButton(text: 'Send OTP', onPressed: _handleSendOtp),
        ),
      ),
    );
  }

  // -----------------------------------------------------------------------
  // LOGO SECTION
  // -----------------------------------------------------------------------
  Widget _buildLogo(double width, double hPad) {
    return Padding(
      padding: EdgeInsets.fromLTRB(hPad, 8, hPad, 8),
      child: Center(
        child: Image.asset("assets/images/loopo.png", width: _logoWidth(width)),
      ),
    );
  }

  Text _fieldLabel(String label) {
    return Text(
      label,
      style: const TextStyle(
        fontFamily: 'Poppins',
        fontWeight: FontWeight.bold,
      ),
    );
  }

  // -----------------------------------------------------------------------
  // FORM
  // -----------------------------------------------------------------------
  Widget _buildMobileForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Country code selector
            Expanded(
              flex: 4,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _fieldLabel('Country Code'),
                  const SizedBox(height: 8),
                  Container(
                    height: 52,
                    padding: const EdgeInsets.symmetric(horizontal: 10),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.grey.shade300),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<_CountryOption>(
                        value: _selectedCountry,
                        isExpanded: true,
                        icon: const Icon(Icons.keyboard_arrow_down, size: 20),
                        onChanged: (option) {
                          if (option == null) return;
                          setState(() {
                            _selectedCountry = option;
                            _mobileController.clear();
                          });
                        },
                        items: _countryOptions.map((option) {
                          return DropdownMenuItem<_CountryOption>(
                            value: option,
                            child: Text(
                              '${option.flag}  ${option.dialCode}',
                              style: const TextStyle(
                                fontFamily: 'Poppins',
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            // Mobile number field
            Expanded(
              flex: 6,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _fieldLabel('Mobile Number'),
                  const SizedBox(height: 8),
                  FormInput(
                    hintText: 'Enter 10 digit number',
                    keyboardType: TextInputType.phone,
                    controller: _mobileController,
                    inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                    onChanged: _onMobileChanged,
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 20),

        _buildInfoRow('You will receive an OTP on this number'),
        const SizedBox(height: 10),
        _buildInfoRow('Standard message and data rates may apply'),
      ],
    );
  }

  Widget _buildInfoRow(String text) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Icon(Icons.check_circle, color: AppColors.appGreen, size: 18),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            text,
            style: const TextStyle(fontSize: 13, color: Colors.black54),
          ),
        ),
      ],
    );
  }
}
