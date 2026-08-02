import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:loopo/screens/location_screen.dart';
import 'package:loopo/screens/login_screen.dart';

// TODO: [Backend Integration] Register user via POST /api/v1/auth/register
// TODO: [Backend Integration] Handle duplicate email/phone conflict (409 Conflict) from backend

import '../config/debug_config.dart';
import '../services/auth_service.dart';
import '../theme/app_colors.dart';
import '../widgets/form_input.dart';
import '../widgets/primary_button.dart';

bool _isLoading = false;

// ============================================================
// Country Model
// ============================================================
class CountryOption {
  final String flag;
  final String dialCode;
  final String name;

  const CountryOption({
    required this.flag,
    required this.dialCode,
    required this.name,
  });
}

// ============================================================
// Mobile Validator
// ============================================================
class MobileValidator {
  static final RegExp _indiaMobileRegExp = RegExp(r'^[6-9]\d{9}$');
  static final RegExp _internationalMobileRegExp = RegExp(r'^\d{6,15}$');

  static bool isValid(String mobileNumber, String dialCode) {
    final digitsOnly = mobileNumber.replaceAll(RegExp(r'\D'), '');
    if (digitsOnly.isEmpty) return false;
    if (dialCode == '+91') {
      return _indiaMobileRegExp.hasMatch(digitsOnly);
    }
    return _internationalMobileRegExp.hasMatch(digitsOnly);
  }

  static String getErrorMessage(String dialCode) {
    if (dialCode == '+91') {
      return 'Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9';
    }
    return 'Enter a valid mobile number (6-15 digits)';
  }

  static bool isValidIndianFirstDigit(String digit) {
    return ['6', '7', '8', '9'].contains(digit);
  }

  static String cleanMobileNumber(String value) {
    return value.replaceAll(RegExp(r'\D'), '');
  }
}

// ============================================================
// Country Dropdown Widget
// ============================================================
class CountryDropdown extends StatelessWidget {
  final CountryOption selectedCountry;
  final ValueChanged<CountryOption?> onChanged;
  final double height;

  const CountryDropdown({
    super.key,
    required this.selectedCountry,
    required this.onChanged,
    this.height = 52,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: height,
      padding: const EdgeInsets.symmetric(horizontal: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey.shade300),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<CountryOption>(
          value: selectedCountry,
          isExpanded: true,
          icon: const Icon(Icons.keyboard_arrow_down, size: 20),
          onChanged: onChanged,
          items: _countryOptions.map((option) {
            return DropdownMenuItem<CountryOption>(
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
    );
  }
}

// ============================================================
// Mobile Input Field Widget
// ============================================================
class MobileInputField extends StatefulWidget {
  final TextEditingController controller;
  final CountryOption selectedCountry;
  final ValueChanged<CountryOption?> onCountryChanged;
  final ValueChanged<String>? onMobileChanged;
  final String hintText;

  const MobileInputField({
    super.key,
    required this.controller,
    required this.selectedCountry,
    required this.onCountryChanged,
    this.onMobileChanged,
    this.hintText = 'Enter 10 digit number',
  });

  @override
  State<MobileInputField> createState() => _MobileInputFieldState();
}

class _MobileInputFieldState extends State<MobileInputField> {
  void _onMobileChanged(String value) {
    final digitsOnly = MobileValidator.cleanMobileNumber(value);
    final trimmedDigits = digitsOnly.length > 10
        ? digitsOnly.substring(0, 10)
        : digitsOnly;

    if (widget.selectedCountry.dialCode == '+91' &&
        trimmedDigits.isNotEmpty &&
        !MobileValidator.isValidIndianFirstDigit(trimmedDigits[0])) {
      widget.controller.clear();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Enter a valid Indian mobile number')),
      );
      return;
    }

    if (trimmedDigits != value) {
      widget.controller.value = TextEditingValue(
        text: trimmedDigits,
        selection: TextSelection.collapsed(offset: trimmedDigits.length),
      );
    }

    widget.onMobileChanged?.call(trimmedDigits);
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          flex: 4,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Country Code',
                style: TextStyle(
                  fontFamily: 'Poppins',
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              CountryDropdown(
                selectedCountry: widget.selectedCountry,
                onChanged: (option) {
                  if (option == null) return;
                  widget.onCountryChanged(option);
                  widget.controller.clear();
                },
              ),
            ],
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          flex: 6,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Mobile Number',
                style: TextStyle(
                  fontFamily: 'Poppins',
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              FormInput(
                hintText: widget.hintText,
                keyboardType: TextInputType.phone,
                controller: widget.controller,
                inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                onChanged: _onMobileChanged,
              ),
            ],
          ),
        ),
      ],
    );
  }
}

// ============================================================
// Country Constants
// ============================================================
const List<CountryOption> _countryOptions = [
  CountryOption(flag: '🇮🇳', dialCode: '+91', name: 'India'),
  CountryOption(flag: '🇺🇸', dialCode: '+1', name: 'United States'),
  CountryOption(flag: '🇬🇧', dialCode: '+44', name: 'United Kingdom'),
  CountryOption(flag: '🇦🇺', dialCode: '+61', name: 'Australia'),
  CountryOption(flag: '🇨🇦', dialCode: '+1', name: 'Canada'),
  CountryOption(flag: '🇦🇪', dialCode: '+971', name: 'UAE'),
  CountryOption(flag: '🇸🇬', dialCode: '+65', name: 'Singapore'),
  CountryOption(flag: '🇲🇾', dialCode: '+60', name: 'Malaysia'),
  CountryOption(flag: '🇩🇪', dialCode: '+49', name: 'Germany'),
  CountryOption(flag: '🇫🇷', dialCode: '+33', name: 'France'),
  CountryOption(flag: '🇮🇹', dialCode: '+39', name: 'Italy'),
  CountryOption(flag: '🇯🇵', dialCode: '+81', name: 'Japan'),
];

class SignupScreen extends StatefulWidget {
  const SignupScreen({super.key});

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;
  bool _agreedToTerms = false;

  final TextEditingController _fullNameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _mobileController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _confirmPasswordController =
      TextEditingController();

  CountryOption _selectedCountry = _countryOptions.first;

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

  @override
  void initState() {
    super.initState();
    if (DebugConfig.isActive) {
      _fullNameController.text = DebugConfig.signupFullName;
      _emailController.text = DebugConfig.signupEmail;
      _mobileController.text = DebugConfig.signupMobile;
      _passwordController.text = DebugConfig.signupPassword;
      _confirmPasswordController.text = DebugConfig.signupPassword;
      _agreedToTerms = true;
    }
  }

  @override
  void dispose() {
    _fullNameController.dispose();
    _emailController.dispose();
    _mobileController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  // Helper method to split fullName into firstName and lastName
  Map<String, String> _splitFullName(String fullName) {
    final nameParts = fullName.trim().split(' ');
    final firstName = nameParts.isNotEmpty ? nameParts[0] : '';
    final lastName = nameParts.length > 1 ? nameParts.sublist(1).join(' ') : '';
    return {'firstName': firstName, 'lastName': lastName};
  }

  Future<void> _handleCreateAccount() async {
    // Prevent multiple submissions
    if (_isLoading) return;

    // ── Debug bypass: skip all validation, go straight to next screen ────────
    if (DebugConfig.isActive) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const LocationScreen()),
      );
      return;
    }

    // Validate form fields first
    final fullName = _fullNameController.text.trim();
    final email = _emailController.text.trim();
    final mobile = _mobileController.text.trim();
    final password = _passwordController.text.trim();
    final confirmPassword = _confirmPasswordController.text.trim();

    if (fullName.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter your full name')),
      );
      return;
    }

    if (email.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter your email address')),
      );
      return;
    }

    if (!MobileValidator.isValid(mobile, _selectedCountry.dialCode)) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            MobileValidator.getErrorMessage(_selectedCountry.dialCode),
          ),
        ),
      );
      return;
    }

    if (password.isEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Please enter a password')));
      return;
    }

    if (password != confirmPassword) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Passwords do not match')));
      return;
    }

    if (!_agreedToTerms) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please agree to the Terms & Privacy Policy'),
        ),
      );
      return;
    }

    // Set loading state
    setState(() {
      _isLoading = true;
    });

    try {
      await _registerUser();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Registration error: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _registerUser() async {
    final fullName = _fullNameController.text.trim();
    final email = _emailController.text.trim();
    final mobile = _mobileController.text.trim();
    final password = _passwordController.text.trim();
    final confirmPassword = _confirmPasswordController.text.trim();

    // Validation checks
    if (fullName.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter your full name')),
      );
      return;
    }

    if (email.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter your email address')),
      );
      return;
    }

    if (!MobileValidator.isValid(mobile, _selectedCountry.dialCode)) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            MobileValidator.getErrorMessage(_selectedCountry.dialCode),
          ),
        ),
      );
      return;
    }

    if (password.isEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Please enter a password')));
      return;
    }

    if (password != confirmPassword) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Passwords do not match')));
      return;
    }

    if (!_agreedToTerms) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please agree to the Terms & Privacy Policy'),
        ),
      );
      return;
    }

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(child: CircularProgressIndicator()),
    );

    try {
      final nameParts = _splitFullName(fullName);
      final firstName = nameParts['firstName'] ?? '';
      final lastName = nameParts['lastName'] ?? '';
      final phone = '${_selectedCountry.dialCode}${MobileValidator.cleanMobileNumber(mobile)}';

      final response = await AuthService().register(
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
        phone: phone,
      );

      if (mounted) {
        Navigator.pop(context); // Close loading dialog
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(response['message'] ?? 'Account created successfully!'),
            backgroundColor: Colors.green,
          ),
        );

        Future.delayed(const Duration(milliseconds: 500), () {
          if (mounted) {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (_) => const LocationScreen()),
            );
          }
        });
      }
    } catch (e) {
      if (mounted) {
        Navigator.pop(context); // Close loading dialog
      }

      final message = e.toString().replaceFirst('Exception: ', '');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(message),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 3),
          ),
        );
      }
    }
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
                _buildLogo(width, hPad),
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
                          child: Center(
                            child: ConstrainedBox(
                              constraints: const BoxConstraints(
                                maxWidth: _maxContentWidth,
                              ),
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text(
                                    'Create Your Account',
                                    style: TextStyle(
                                      fontFamily: 'Poppins',
                                      fontSize: 24,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  const Text(
                                    'Fill in your details to get started',
                                    style: TextStyle(color: Colors.black54),
                                  ),
                                  const SizedBox(height: 24),
                                  _buildSignupForm(),
                                ],
                              ),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
                _buildLoginPrompt(hPad),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _buildLogo(double width, double hPad) {
    return Padding(
      padding: EdgeInsets.fromLTRB(hPad, 8, hPad, 8),
      child: Center(
        child: Image.asset("assets/images/loopo.png", width: _logoWidth(width)),
      ),
    );
  }

  Widget _buildLoginPrompt(double hPad) {
    return SafeArea(
      top: false,
      child: Padding(
        padding: EdgeInsets.fromLTRB(hPad, 12, hPad, 16),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              'Already have an account?',
              style: TextStyle(fontSize: 14, color: Colors.black54),
            ),
            TextButton(
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const LoginScreen()),
              ),
              style: TextButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                minimumSize: Size.zero,
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
              child: const Text(
                'Login',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
              ),
            ),
          ],
        ),
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

  Widget _buildSignupForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Full Name field (user enters full name)
        _fieldLabel('Full Name'),
        const SizedBox(height: 8),
        FormInput(
          hintText: 'Enter your full name',
          controller: _fullNameController,
          keyboardType: TextInputType.name,
        ),
        const SizedBox(height: 12),

        // Email field (matches DTO 'email')
        _fieldLabel('Email Address'),
        const SizedBox(height: 8),
        FormInput(
          hintText: 'Enter your email address',
          controller: _emailController,
          keyboardType: TextInputType.emailAddress,
        ),
        const SizedBox(height: 12),

        // Mobile Number field (matches DTO 'phone')
        MobileInputField(
          controller: _mobileController,
          selectedCountry: _selectedCountry,
          onCountryChanged: (option) {
            setState(() {
              _selectedCountry = option!;
              _mobileController.clear();
            });
          },
          hintText: 'Enter 10 digit number',
        ),
        const SizedBox(height: 12),

        // Password field (matches DTO 'password')
        _fieldLabel('Password'),
        const SizedBox(height: 8),
        FormInput(
          hintText: 'Enter password',
          controller: _passwordController,
          obscure: _obscurePassword,
          suffixWidget: IconButton(
            onPressed: () =>
                setState(() => _obscurePassword = !_obscurePassword),
            icon: Icon(
              _obscurePassword ? Icons.visibility_off : Icons.visibility,
            ),
          ),
        ),
        const SizedBox(height: 12),

        // Confirm Password
        _fieldLabel('Confirm Password'),
        const SizedBox(height: 8),
        FormInput(
          hintText: 'Confirm password',
          controller: _confirmPasswordController,
          obscure: _obscureConfirmPassword,
          suffixWidget: IconButton(
            onPressed: () => setState(
              () => _obscureConfirmPassword = !_obscureConfirmPassword,
            ),
            icon: Icon(
              _obscureConfirmPassword ? Icons.visibility_off : Icons.visibility,
            ),
          ),
        ),
        const SizedBox(height: 16),

        // Terms & Conditions
        Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            SizedBox(
              width: 22,
              height: 22,
              child: Checkbox(
                value: _agreedToTerms,
                activeColor: AppColors.appGreen,
                materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                onChanged: (value) =>
                    setState(() => _agreedToTerms = value ?? false),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: GestureDetector(
                onTap: () => setState(() => _agreedToTerms = !_agreedToTerms),
                child: RichText(
                  text: TextSpan(
                    style: const TextStyle(fontSize: 13, color: Colors.black87),
                    children: [
                      const TextSpan(text: 'I agree to the '),
                      TextSpan(
                        text: 'Terms & Privacy Policy',
                        style: TextStyle(
                          color: AppColors.appBlue,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 20),

        // Create Account Button
        SizedBox(
          width: double.infinity,
          child: PrimaryButton(
            text: _isLoading ? 'Creating Account...' : 'Create Account',
            onPressed: _handleCreateAccount,
          ),
        ),
      ],
    );
  }
}
