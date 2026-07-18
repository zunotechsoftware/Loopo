import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../theme/app_colors.dart';
import '../widgets/form_input.dart';
import '../widgets/primary_button.dart';
import 'home_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  bool _obscure = true;
  String _loginMode = 'email';
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _mobileController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  static const String _countryCode = '+91';
  static final RegExp _indiaMobileRegExp = RegExp(r'^[6-9]\d{9}$');

  bool _isValidMobile(String value) {
    final digitsOnly = value.replaceAll(RegExp(r'\D'), '');
    return digitsOnly.isNotEmpty && _indiaMobileRegExp.hasMatch(digitsOnly);
  }

  void _onMobileChanged(String value) {
    final digitsOnly = value.replaceAll(RegExp(r'\D'), '');
    final trimmedDigits = digitsOnly.length > 10
        ? digitsOnly.substring(0, 10)
        : digitsOnly;

    if (trimmedDigits.isNotEmpty &&
        trimmedDigits.length >= 1 &&
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

  @override
  void dispose() {
    _emailController.dispose();
    _mobileController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            return Column(
              children: [
                Expanded(
                  child: SingleChildScrollView(
                    physics: const ClampingScrollPhysics(),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 24.0,
                        vertical: 20.0,
                      ),
                      child: ConstrainedBox(
                        constraints: BoxConstraints(
                          minWidth: constraints.maxWidth,
                          maxWidth: constraints.maxWidth,
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Welcome Back!',
                              style: TextStyle(
                                fontFamily: 'Poppins',
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 6),
                            const Text(
                              'Login to your account',
                              style: TextStyle(color: Colors.black54),
                            ),
                            const SizedBox(height: 24),
                            _buildLoginForm(),
                            const SizedBox(height: 24),
                          ],
                        ),
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

  Text _fieldLabel(String label) {
    return Text(
      label,
      style: const TextStyle(
        fontFamily: 'Poppins',
        fontWeight: FontWeight.bold,
      ),
    );
  }

  Widget _buildPhoneField(
    String hintText, {
    TextEditingController? controller,
  }) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: Colors.grey.shade300),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: const [
              Text(
                _countryCode,
                style: TextStyle(
                  fontFamily: 'Poppins',
                  fontWeight: FontWeight.w600,
                ),
              ),
              SizedBox(width: 6),
              Icon(Icons.arrow_drop_down, size: 20),
            ],
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: FormInput(
            hintText: hintText,
            keyboardType: TextInputType.phone,
            controller: controller,
            inputFormatters: [FilteringTextInputFormatter.digitsOnly],
            onChanged: _onMobileChanged,
          ),
        ),
      ],
    );
  }

  Widget _buildLoginForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            _buildModeChip('Email', _loginMode == 'email', () {
              setState(() => _loginMode = 'email');
            }),
            const SizedBox(width: 12),
            _buildModeChip('Mobile', _loginMode == 'mobile', () {
              setState(() => _loginMode = 'mobile');
            }),
          ],
        ),
        const SizedBox(height: 12),
        _fieldLabel(_loginMode == 'email' ? 'Email' : 'Mobile Number'),
        const SizedBox(height: 8),
        _loginMode == 'email'
            ? FormInput(
                hintText: 'Enter your email',
                keyboardType: TextInputType.emailAddress,
              )
            : _buildPhoneField(
                'Enter mobile number',
                controller: _mobileController,
              ),
        const SizedBox(height: 12),
        _fieldLabel('Password'),
        const SizedBox(height: 8),
        FormInput(
          hintText: 'Enter your password',
          obscure: _obscure,
          suffixWidget: IconButton(
            onPressed: () => setState(() => _obscure = !_obscure),
            icon: Icon(_obscure ? Icons.visibility_off : Icons.visibility),
          ),
        ),
        const SizedBox(height: 8),
        Align(
          alignment: Alignment.centerRight,
          child: TextButton(
            onPressed: () {},
            child: const Text('Forgot password?'),
          ),
        ),
        const SizedBox(height: 12),
        PrimaryButton(
          text: 'Login',
          onPressed: () {
            if (_loginMode == 'mobile' &&
                !_isValidMobile(_mobileController.text)) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Enter a valid Indian mobile number'),
                ),
              );
              return;
            }

            Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (_) => const HomeScreen()),
            );
          },
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(child: Container(height: 1, color: Colors.grey.shade300)),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 12),
              child: Text(
                'or continue with',
                style: TextStyle(color: Colors.black54),
              ),
            ),
            Expanded(child: Container(height: 1, color: Colors.grey.shade300)),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: OutlinedButton(
                onPressed: () {},
                style: OutlinedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: Colors.black87,
                  side: BorderSide(color: Colors.grey.shade300),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                child: const Text('Google'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: OutlinedButton(
                onPressed: () {},
                style: OutlinedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: Colors.black87,
                  side: BorderSide(color: Colors.grey.shade300),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                child: const Text('Apple'),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildModeChip(String label, bool active, VoidCallback onTap) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: active
                ? AppColors.appGreen.withAlpha((0.12 * 255).round())
                : Colors.white,
            borderRadius: BorderRadius.circular(999),
            border: Border.all(
              color: active ? AppColors.appGreen : Colors.grey.shade300,
            ),
          ),
          child: Center(
            child: Text(
              label,
              style: TextStyle(
                color: active ? AppColors.appGreen : Colors.black54,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
