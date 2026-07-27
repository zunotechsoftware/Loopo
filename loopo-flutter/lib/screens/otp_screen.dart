import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../theme/app_colors.dart';
import '../widgets/primary_button.dart';
import 'home_screen.dart';

class OtpScreen extends StatefulWidget {
  final String dialCode;
  final String mobileNumber;

  const OtpScreen({
    super.key,
    this.dialCode = '+91',
    this.mobileNumber = '98765 43210',
  });

  @override
  State<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen> {
  static const int _otpLength = 6;
  static const int _resendCooldownSeconds = 60;

  final List<TextEditingController> _otpControllers = List.generate(
    _otpLength,
    (_) => TextEditingController(),
  );
  final List<FocusNode> _focusNodes = List.generate(
    _otpLength,
    (_) => FocusNode(),
  );

  Timer? _timer;
  int _secondsRemaining = _resendCooldownSeconds;

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
    _startTimer();
  }

  void _startTimer() {
    _timer?.cancel();
    setState(() => _secondsRemaining = _resendCooldownSeconds);
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_secondsRemaining <= 1) {
        timer.cancel();
        setState(() => _secondsRemaining = 0);
      } else {
        setState(() => _secondsRemaining--);
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    for (final controller in _otpControllers) {
      controller.dispose();
    }
    for (final node in _focusNodes) {
      node.dispose();
    }
    super.dispose();
  }

  String get _enteredOtp =>
      _otpControllers.map((controller) => controller.text).join();

  void _onDigitChanged(int index, String value) {
    if (value.isNotEmpty && index < _otpLength - 1) {
      _focusNodes[index + 1].requestFocus();
    }
    if (value.isEmpty && index > 0) {
      _focusNodes[index - 1].requestFocus();
    }
    setState(() {});
  }

  void _handleResend() {
    if (_secondsRemaining > 0) return;
    for (final controller in _otpControllers) {
      controller.clear();
    }
    _focusNodes.first.requestFocus();
    _startTimer();
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text('OTP resent successfully')));
  }

  void _handleVerify() {
    if (_enteredOtp.length != _otpLength) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter the complete 6-digit OTP')),
      );
      return;
    }

    // TODO: Call the verify-OTP API before navigating forward.
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => const HomeScreen()),
    );
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
        actions: [
          IconButton(
            icon: const Icon(
              Icons.notifications_none_rounded,
              color: Colors.black87,
            ),
            onPressed: () {},
          ),
        ],
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
                                  'Verify OTP',
                                  style: TextStyle(
                                    fontFamily: 'Poppins',
                                    fontSize: 24,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 6),
                                RichText(
                                  text: TextSpan(
                                    style: const TextStyle(
                                      color: Colors.black54,
                                      fontSize: 14,
                                    ),
                                    children: [
                                      const TextSpan(
                                        text: 'Enter the 6-digit OTP sent to\n',
                                      ),
                                      TextSpan(
                                        text:
                                            '${widget.dialCode} ${widget.mobileNumber}',
                                        style: const TextStyle(
                                          fontWeight: FontWeight.w700,
                                          color: Colors.black87,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 24),
                                _buildOtpFields(),
                                const SizedBox(height: 20),
                                _buildTimerRow(),
                                const SizedBox(height: 14),
                                _buildResendRow(),
                                const SizedBox(height: 14),
                                _buildChangeNumberRow(),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),

                // ---------------- VERIFY BUTTON (separate, fixed at bottom) -----
                _buildVerifyButton(hPad),
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
  // OTP INPUT BOXES
  // -----------------------------------------------------------------------
  Widget _buildOtpFields() {
    return LayoutBuilder(
      builder: (context, constraints) {
        final spacing = 10.0;
        final boxWidth =
            (constraints.maxWidth - spacing * (_otpLength - 1)) / _otpLength;
        final size = boxWidth.clamp(40.0, 52.0);

        return Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: List.generate(_otpLength, (index) {
            return SizedBox(
              width: size,
              height: size + 8,
              child: TextField(
                controller: _otpControllers[index],
                focusNode: _focusNodes[index],
                textAlign: TextAlign.center,
                keyboardType: TextInputType.number,
                maxLength: 1,
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                ),
                inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                decoration: InputDecoration(
                  counterText: '',
                  contentPadding: EdgeInsets.zero,
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: BorderSide(color: Colors.grey.shade300),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: BorderSide(color: Colors.grey.shade300),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(
                      color: AppColors.appGreen,
                      width: 1.6,
                    ),
                  ),
                ),
                onChanged: (value) => _onDigitChanged(index, value),
              ),
            );
          }),
        );
      },
    );
  }

  // -----------------------------------------------------------------------
  // TIMER ROW
  // -----------------------------------------------------------------------
  Widget _buildTimerRow() {
    return Row(
      children: [
        Icon(Icons.access_time_rounded, size: 16, color: Colors.grey.shade600),
        const SizedBox(width: 6),
        Text(
          _secondsRemaining > 0
              ? 'OTP expires in $_secondsRemaining seconds'
              : 'OTP expired',
          style: TextStyle(fontSize: 13, color: Colors.grey.shade600),
        ),
      ],
    );
  }

  // -----------------------------------------------------------------------
  // RESEND ROW
  // -----------------------------------------------------------------------
  Widget _buildResendRow() {
    final enabled = _secondsRemaining <= 0;
    final color = enabled ? AppColors.appBlue : Colors.grey.shade400;

    return InkWell(
      onTap: enabled ? _handleResend : null,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.refresh_rounded, size: 18, color: color),
          const SizedBox(width: 6),
          Text(
            'Resend OTP',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  // -----------------------------------------------------------------------
  // CHANGE MOBILE NUMBER ROW
  // -----------------------------------------------------------------------
  Widget _buildChangeNumberRow() {
    return InkWell(
      onTap: () => Navigator.of(context).pop(),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.edit_outlined, size: 16, color: AppColors.appBlue),
          const SizedBox(width: 6),
          const Text(
            'Change Mobile Number',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: AppColors.appBlue,
            ),
          ),
        ],
      ),
    );
  }

  // -----------------------------------------------------------------------
  // VERIFY & CONTINUE BUTTON (pinned to bottom)
  // -----------------------------------------------------------------------
  Widget _buildVerifyButton(double hPad) {
    return SafeArea(
      top: false,
      child: Padding(
        padding: EdgeInsets.fromLTRB(hPad, 12, hPad, 16),
        child: SizedBox(
          width: double.infinity,
          child: PrimaryButton(
            text: 'Verify & Continue',
            onPressed: _handleVerify,
          ),
        ),
      ),
    );
  }
}
