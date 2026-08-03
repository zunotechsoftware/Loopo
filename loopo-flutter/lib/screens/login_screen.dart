import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:loopo/screens/signup_screen.dart';
import 'package:loopo/screens/forgot_password_screen.dart';
import 'package:loopo/screens/location_screen.dart';

// TODO: [Backend Integration] Login with Email/Password via POST /api/v1/auth/login
// TODO: [Backend Integration] Persist refresh token to flutter_secure_storage and handle token rotation


import '../config/debug_config.dart';
import '../services/auth_session.dart';
import '../services/auth_service.dart';
import '../widgets/form_input.dart';
import '../widgets/primary_button.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  bool _obscure = true;
  bool _isSubmitting = false;
  final String _loginMode = 'email';
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _mobileController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  @override
  void initState() {
    super.initState();
    if (DebugConfig.isActive) {
      _emailController.text = DebugConfig.loginEmail;
      _passwordController.text = DebugConfig.loginPassword;
      _mobileController.text = DebugConfig.loginMobile;
    }
  }

  static const String _countryCode = '+91';
  static final RegExp _indiaMobileRegExp = RegExp(r'^[6-9]\d{9}$');

  // ---- Responsive breakpoints / helpers -------------------------------
  static const double _tabletBreakpoint = 600;
  static const double _maxContentWidth = 480;

  bool _isTablet(double width) => width >= _tabletBreakpoint;

  double _horizontalPadding(double width) {
    if (width >= _tabletBreakpoint) {
      // center the constrained content on wide/tablet/desktop screens
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
    return digitsOnly.isNotEmpty && _indiaMobileRegExp.hasMatch(digitsOnly);
  }

  bool _isValidEmail(String value) {
    return RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(value.trim());
  }

  void _onMobileChanged(String value) {
    final digitsOnly = value.replaceAll(RegExp(r'\D'), '');
    final trimmedDigits = digitsOnly.length > 10
        ? digitsOnly.substring(0, 10)
        : digitsOnly;

    if (trimmedDigits.isNotEmpty &&
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

  Future<void> _handleLogin() async {
    if (_isSubmitting) return;

    // ── Debug bypass: skip validation and go directly to HomeScreen ──────────
    if (DebugConfig.isActive) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const LocationScreen()),
      );
      return;
    }

    // ---- Client-side validation -----------------------------------------
    if (_loginMode == 'email') {
      if (!_isValidEmail(_emailController.text)) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Enter a valid email address')),
        );
        return;
      }
    } else {
      if (!_isValidMobile(_mobileController.text)) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Enter a valid Indian mobile number')),
        );
        return;
      }
    }

    if (_passwordController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter your password')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    final email = _loginMode == 'email'
        ? _emailController.text.trim()
        : '$_countryCode${_mobileController.text.trim()}@loopo.com';
    final password = _passwordController.text;

    try {
      final result = await AuthService().login(
        email: email,
        password: password,
      );

      final data = result['data'] ?? result;
      final token = data['token'] ?? data['accessToken'] ?? result['accessToken'];
      if (token != null) {
        AuthSession.setToken(token.toString());
      }

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Login successful!'),
          backgroundColor: Colors.green,
          duration: Duration(seconds: 1),
        ),
      );

      await Future.delayed(const Duration(milliseconds: 400));
      if (!mounted) return;

      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const LocationScreen()),
      );
    } catch (e) {
      if (!mounted) return;
      final message = e.toString().replaceFirst('Exception: ', '');
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(message)));
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
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
                const SizedBox(height: 30),

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
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),

                // ---------------- LOGIN BUTTON (separate, fixed at bottom) ------
                _buildLoginButton(hPad),

                // ---------------- SIGN UP PROMPT (separate, fixed at bottom) ----
                _buildSignUpPrompt(hPad),
              ],
            );
          },
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

  // -----------------------------------------------------------------------
  // LOGIN BUTTON (pinned to bottom)
  // -----------------------------------------------------------------------
  Widget _buildLoginButton(double hPad) {
    return Padding(
      padding: EdgeInsets.fromLTRB(hPad, 0, hPad, 4),
      child: SizedBox(
        width: double.infinity,
        child: PrimaryButton(
          text: _isSubmitting ? 'Logging in...' : 'Login',
          onPressed: _isSubmitting ? () {} : _handleLogin,
        ),
      ),
    );
  }

  // -----------------------------------------------------------------------
  // SIGN UP PROMPT SECTION
  // -----------------------------------------------------------------------
  Widget _buildSignUpPrompt(double hPad) {
    return SafeArea(
      top: false,
      child: Padding(
        padding: EdgeInsets.fromLTRB(hPad, 12, hPad, 16),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              "Don't have an account?",
              style: TextStyle(fontSize: 14, color: Colors.black54),
            ),
            TextButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const SignupScreen()),
                );
              },
              style: TextButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                minimumSize: Size.zero,
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
              child: const Text(
                "Sign Up",
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

  // -----------------------------------------------------------------------
  // FORM FIELDS (logo, login button, and sign-up prompt no longer live here)
  // -----------------------------------------------------------------------
  Widget _buildLoginForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _fieldLabel(_loginMode == 'email' ? 'Email' : 'Mobile Number'),
        const SizedBox(height: 8),
        _loginMode == 'email'
            ? FormInput(
                hintText: 'Enter your email',
                keyboardType: TextInputType.emailAddress,
                controller: _emailController,
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
          controller: _passwordController,
          suffixWidget: IconButton(
            onPressed: () => setState(() => _obscure = !_obscure),
            icon: Icon(_obscure ? Icons.visibility_off : Icons.visibility),
          ),
        ),
        const SizedBox(height: 8),
        Align(
          alignment: Alignment.centerRight,
          child: TextButton(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => const ForgotPasswordScreen(),
                ),
              );
            },
            child: const Text('Forgot password?'),
          ),
        ),
      ],
    );
  }
}
