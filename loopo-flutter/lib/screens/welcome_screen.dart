import 'package:flutter/material.dart';
import 'package:loopo/screens/login_mobile.dart';
import 'package:loopo/screens/login_screen.dart';
import 'package:loopo/screens/signup_screen.dart';

import '../theme/app_colors.dart';

// TODO: [Backend Integration] Support OAuth2 Social logins (Google / Apple Sign-In) via POST /api/v1/auth/social
// TODO: [Backend Integration] Auto-restore session token on launch via GET /api/v1/users/me


class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.appGrey,
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            final height = constraints.maxHeight;

            return SingleChildScrollView(
              child: ConstrainedBox(
                constraints: BoxConstraints(minHeight: height),
                child: IntrinsicHeight(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: Column(
                      children: [
                        SizedBox(height: height * 0.03),

                        // Logo
                        Image.asset("assets/images/loopo.png", width: 200),

                        const Spacer(),

                        // Illustration
                        Image.asset(
                          "assets/images/onboard.png",
                          height: height * 0.30,
                          fit: BoxFit.contain,
                        ),

                        const Spacer(),

                        // Login & Signup
                        Column(
                          children: [
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton(
                                onPressed: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (context) =>
                                          const LoginScreen(), // or LoginPage()
                                    ),
                                  );
                                },
                                child: const Text("Login"),
                              ),
                            ),
                            const SizedBox(height: 12),
                            SizedBox(
                              width: double.infinity,
                              child: OutlinedButton(
                                onPressed: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (context) =>
                                          const SignupScreen(), // or LoginPage()
                                    ),
                                  );
                                },
                                child: const Text("Sign Up"),
                              ),
                            ),
                          ],
                        ),

                        SizedBox(height: height * 0.03),

                        // Divider
                        Row(
                          children: [
                            const Expanded(
                              child: Divider(
                                thickness: 1,
                                color: Color(0xFFE0E0E0),
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                              ),
                              child: Text(
                                "or",
                                style: TextStyle(
                                  fontSize: 18,
                                  color: Colors.grey.shade500,
                                ),
                              ),
                            ),
                            const Expanded(
                              child: Divider(
                                thickness: 1,
                                color: Color(0xFFE0E0E0),
                              ),
                            ),
                          ],
                        ),

                        SizedBox(height: height * 0.025),

                        // Social Buttons
                        _SocialButton(
                          image: "assets/images/google_button.png",
                          text: "Continue with Google",
                          callBack: () {},
                        ),

                        const SizedBox(height: 10),

                        _SocialButton(
                          image: "assets/images/apple_button.png",
                          imageWidth: 20,
                          text: "Continue with Apple",
                          callBack: () {},
                        ),

                        const SizedBox(height: 10),

                        _SocialButton(
                          icon: Icons.phone_android,
                          text: "Continue with Mobile Number",
                          callBack: () => {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) =>
                                    const LoginMobile(), // or LoginPage()
                              ),
                            ),
                          },
                        ),

                        const Spacer(),

                        // Terms
                        RichText(
                          textAlign: TextAlign.center,
                          text: TextSpan(
                            style: const TextStyle(
                              fontSize: 12,
                              color: Colors.black,
                            ),
                            children: [
                              const TextSpan(
                                text: "By continuing, you agree to our ",
                              ),
                              const TextSpan(
                                text: "Terms",
                                style: TextStyle(
                                  color: AppColors.appBlue,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const TextSpan(text: " & "),
                              const TextSpan(
                                text: "Privacy Policy",
                                style: TextStyle(
                                  color: AppColors.appBlue,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),

                        SizedBox(height: height * 0.02),
                      ],
                    ),
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

class _SocialButton extends StatelessWidget {
  final String? image;
  final IconData? icon;
  final String text;
  final double imageWidth;
  final VoidCallback callBack;

  const _SocialButton({
    this.image,
    this.icon,
    required this.text,
    this.imageWidth = 22,
    required this.callBack,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: OutlinedButton(
        onPressed: callBack,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (image != null)
              Image.asset(image!, width: imageWidth, height: imageWidth)
            else
              Icon(icon, size: 20, color: Colors.black87),
            const SizedBox(width: 12),
            Text(text),
          ],
        ),
      ),
    );
  }
}
