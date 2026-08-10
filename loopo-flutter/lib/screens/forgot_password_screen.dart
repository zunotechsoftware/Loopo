import 'package:flutter/material.dart';
import '../config/debug_config.dart';
import '../services/auth_service.dart';
import '../theme/app_colors.dart';
import '../widgets/form_input.dart';
import '../widgets/primary_button.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _tokenController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _confirmPasswordController = TextEditingController();

  bool _isSubmitting = false;
  bool _showResetFields = false;
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;

  static const double _maxContentWidth = 480;

  @override
  void initState() {
    super.initState();
    if (DebugConfig.isActive) {
      _emailController.text = DebugConfig.forgotEmail;
      _tokenController.text = DebugConfig.forgotResetToken;
      _passwordController.text = DebugConfig.forgotNewPassword;
      _confirmPasswordController.text = DebugConfig.forgotNewPassword;
    }
  }

  @override
  void dispose() {
    _emailController.dispose();
    _tokenController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _handleSendResetLink() async {
    final email = _emailController.text.trim();

    // ── Debug bypass: immediately show reset fields ──────────────────────
    if (DebugConfig.isBypassAuth || DebugConfig.isActive) {
      setState(() => _showResetFields = true);
      return;
    }

    if (email.isEmpty || !RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(email)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid email address')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final result = await AuthService().forgotPassword(email: email);
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result['message'] ?? 'Reset instructions sent successfully!'),
          backgroundColor: AppColors.appGreen,
        ),
      );

      setState(() {
        _showResetFields = true;
      });
    } catch (e) {
      if (!mounted) return;
      final message = e.toString().replaceFirst('Exception: ', '');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(message), backgroundColor: Colors.red),
      );
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  Future<void> _handleResetPassword() async {
    final token = _tokenController.text.trim();
    final password = _passwordController.text.trim();
    final confirmPassword = _confirmPasswordController.text.trim();

    if (token.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter the reset token')),
      );
      return;
    }

    if (password.length < 8) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Password must be at least 8 characters long')),
      );
      return;
    }

    if (password != confirmPassword) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Passwords do not match')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final result = await AuthService().resetPassword(
        token: token,
        password: password,
      );

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result['message'] ?? 'Password reset successfully!'),
          backgroundColor: AppColors.appGreen,
        ),
      );

      Navigator.of(context).pop(); // Back to login screen
    } catch (e) {
      if (!mounted) return;
      final message = e.toString().replaceFirst('Exception: ', '');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(message), backgroundColor: Colors.red),
      );
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final double width = MediaQuery.of(context).size.width;
    final double hPad = width >= 600 ? (width - _maxContentWidth) / 2 : 24.0;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 20, color: Colors.black),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      backgroundColor: Colors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: EdgeInsets.symmetric(horizontal: hPad, vertical: 16),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: _maxContentWidth),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Image.asset("assets/images/loopo.png", width: 180),
                ),
                const SizedBox(height: 40),
                Text(
                  _showResetFields ? 'Reset Password' : 'Forgot Password',
                  style: const TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  _showResetFields
                      ? 'Enter the verification token and your new password below.'
                      : 'Enter your email address and we\'ll send you a password reset link.',
                  style: const TextStyle(color: Colors.black54),
                ),
                const SizedBox(height: 32),
                if (!_showResetFields) ...[
                  const Text(
                    'Email Address',
                    style: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  FormInput(
                    hintText: 'Enter your registered email',
                    keyboardType: TextInputType.emailAddress,
                    controller: _emailController,
                  ),
                  const SizedBox(height: 24),
                  PrimaryButton(
                    text: _isSubmitting ? 'Sending...' : 'Send Reset Link',
                    onPressed: _isSubmitting ? () {} : _handleSendResetLink,
                  ),
                  const SizedBox(height: 16),
                  Center(
                    child: TextButton(
                      onPressed: () => setState(() => _showResetFields = true),
                      child: const Text(
                        'I already have a reset token',
                        style: TextStyle(color: AppColors.appBlue, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ),
                ] else ...[
                  const Text(
                    'Reset Token',
                    style: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  FormInput(
                    hintText: 'Enter reset token from email',
                    controller: _tokenController,
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'New Password',
                    style: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  FormInput(
                    hintText: 'Enter new password',
                    obscure: _obscurePassword,
                    controller: _passwordController,
                    suffixWidget: IconButton(
                      onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                      icon: Icon(_obscurePassword ? Icons.visibility_off : Icons.visibility),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Confirm New Password',
                    style: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  FormInput(
                    hintText: 'Confirm new password',
                    obscure: _obscureConfirmPassword,
                    controller: _confirmPasswordController,
                    suffixWidget: IconButton(
                      onPressed: () => setState(() => _obscureConfirmPassword = !_obscureConfirmPassword),
                      icon: Icon(_obscureConfirmPassword ? Icons.visibility_off : Icons.visibility),
                    ),
                  ),
                  const SizedBox(height: 28),
                  PrimaryButton(
                    text: _isSubmitting ? 'Resetting...' : 'Reset Password',
                    onPressed: _isSubmitting ? () {} : _handleResetPassword,
                  ),
                  const SizedBox(height: 16),
                  Center(
                    child: TextButton(
                      onPressed: () => setState(() => _showResetFields = false),
                      child: const Text(
                        'Back to Email Entry',
                        style: TextStyle(color: AppColors.appBlue, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
