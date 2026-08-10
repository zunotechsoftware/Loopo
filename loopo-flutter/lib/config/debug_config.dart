import 'package:flutter/foundation.dart';

/// Debug-only configuration for demo / client presentation builds.
///
/// All values here only take effect when `kDebugMode == true`
/// (i.e. `flutter run` without `--release`). A release build
/// compiled with `flutter run --release` or `flutter build apk --release`
/// will tree-shake this entire class away.
///
/// ─── HOW TO USE ─────────────────────────────────────────────────────────────
///  • [enabled]      → master switch; set to false to disable auto-fill even
///                     in debug mode (useful when you want to test real flows).
///  • [autoNavigate] → if true, auth screens immediately navigate forward
///                     without waiting for any tap, perfect for screen demos.
///  • Individual credential fields → pre-filled into form controllers via
///    the `DebugPrefill` mixin (see below).
/// ────────────────────────────────────────────────────────────────────────────
class DebugConfig {
  DebugConfig._();

  /// Master flag to bypass all backend server delays/network checks for rapid UI development.
  /// Set to `true` to bypass slow server responses and show all screens instantly.
  /// Set to `false` to test live backend integration with https://loopo-711b.onrender.com.
  /// Can be overridden at run time via: flutter run --dart-define=BYPASS_AUTH=true
  static const bool isBypassAuth = true;

  // ── Master switch ──────────────────────────────────────────────────────────
  /// Set to `false` to disable all debug prefill even in debug builds.
  static const bool enabled = false;

  /// Whether [enabled] is actually active (debug mode AND flag is on).
  static bool get isActive => kDebugMode && enabled;

  // ── Login ──────────────────────────────────────────────────────────────────
  static const String loginEmail    = 'demo@loopo.com';
  static const String loginPassword = 'Demo@1234';
  static const String loginMobile   = '9876543210'; // digits only, no dial code

  // ── Signup ─────────────────────────────────────────────────────────────────
  static const String signupFullName = 'Demo User';
  static const String signupEmail    = 'newuser@loopo.com';
  static const String signupMobile   = '9876543210';
  static const String signupPassword = 'Demo@1234';

  // ── Forgot Password ────────────────────────────────────────────────────────
  static const String forgotEmail         = 'demo@loopo.com';
  static const String forgotResetToken    = 'DEMO_TOKEN_123';
  static const String forgotNewPassword   = 'Demo@1234';

  // ── OTP (6 digits pre-filled) ─────────────────────────────────────────────
  /// Each character becomes one OTP box.
  static const String otpCode = '123456';

  // ── Auto-navigate ──────────────────────────────────────────────────────────
  /// When true, auth screens skip to HomeScreen immediately after prefilling.
  /// Useful for recording a fully-automated demo walkthrough.
  /// Set to false to let the client manually tap buttons.
  static const bool autoNavigate = false;

  // ── Visual indicator ──────────────────────────────────────────────────────
  /// Shows a small "DEBUG" banner on screens that are prefilled.
  static const bool showDebugBanner = true;

}
