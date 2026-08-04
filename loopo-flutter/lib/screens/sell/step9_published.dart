// ─── Step 9 – Listing Published (Success Screen) ──────────────────────────────

import 'dart:math';
import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';

class ListingPublishedScreen extends StatefulWidget {
  final VoidCallback onGoHome;
  final VoidCallback onViewListing;
  final VoidCallback onSellAnother;

  const ListingPublishedScreen({
    super.key,
    required this.onGoHome,
    required this.onViewListing,
    required this.onSellAnother,
  });

  @override
  State<ListingPublishedScreen> createState() => _ListingPublishedScreenState();
}

class _ListingPublishedScreenState extends State<ListingPublishedScreen>
    with TickerProviderStateMixin {
  late final AnimationController _checkCtrl;
  late final AnimationController _fadeCtrl;
  late final AnimationController _confettiCtrl;

  late final Animation<double> _scaleAnim;
  late final Animation<double> _fadeAnim;

  @override
  void initState() {
    super.initState();

    _checkCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _fadeCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 700),
    );
    _confettiCtrl = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    );

    _scaleAnim = CurvedAnimation(
      parent: _checkCtrl,
      curve: Curves.elasticOut,
    );
    _fadeAnim = CurvedAnimation(
      parent: _fadeCtrl,
      curve: Curves.easeOut,
    );

    // Sequence
    Future.delayed(const Duration(milliseconds: 100), () {
      if (!mounted) return;
      _checkCtrl.forward();
    });
    Future.delayed(const Duration(milliseconds: 400), () {
      if (!mounted) return;
      _fadeCtrl.forward();
      _confettiCtrl.forward();
    });
  }

  @override
  void dispose() {
    _checkCtrl.dispose();
    _fadeCtrl.dispose();
    _confettiCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Stack(
          children: [
            // Confetti
            AnimatedBuilder(
              animation: _confettiCtrl,
              builder: (context, _) => CustomPaint(
                size: MediaQuery.of(context).size,
                painter: _ConfettiPainter(_confettiCtrl.value),
              ),
            ),

            // Content
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 28),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Checkmark
                  ScaleTransition(
                    scale: _scaleAnim,
                    child: _SuccessCircle(),
                  ),
                  const SizedBox(height: 32),

                  // Messages
                  FadeTransition(
                    opacity: _fadeAnim,
                    child: Column(
                      children: [
                        const Text(
                          '🎉 Listing Published!',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.w800,
                            color: AppColors.appDark,
                            fontFamily: 'Poppins',
                          ),
                        ),
                        const SizedBox(height: 10),
                        Text(
                          'Your listing is now live and visible to buyers near you.',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 15,
                            color: Colors.grey.shade500,
                            fontFamily: 'Poppins',
                            height: 1.5,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 16, vertical: 8),
                          decoration: BoxDecoration(
                            color: const Color(0xFFECFDF5),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                                color: AppColors.appGreen
                                    .withValues(alpha: 0.3)),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.bolt_rounded,
                                  color: AppColors.appGreen, size: 16),
                              SizedBox(width: 6),
                              Text(
                                'Usually gets first response in < 1 hour',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: AppColors.appGreen,
                                  fontWeight: FontWeight.w600,
                                  fontFamily: 'Poppins',
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 48),

                  // Buttons
                  FadeTransition(
                    opacity: _fadeAnim,
                    child: Column(
                      children: [
                        SizedBox(
                          width: double.infinity,
                          height: 52,
                          child: ElevatedButton.icon(
                            onPressed: widget.onViewListing,
                            icon: const Icon(Icons.visibility_rounded, size: 18),
                            label: const Text(
                              'View Listing',
                              style: TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w700,
                                fontFamily: 'Poppins',
                              ),
                            ),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.appGreen,
                              foregroundColor: Colors.white,
                              elevation: 0,
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(16)),
                            ),
                          ),
                        ),
                        const SizedBox(height: 10),
                        SizedBox(
                          width: double.infinity,
                          height: 52,
                          child: OutlinedButton.icon(
                            onPressed: () {
                              // Share intent – replace with share_plus
                            },
                            icon: const Icon(Icons.share_rounded, size: 18),
                            label: const Text(
                              'Share Listing',
                              style: TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w700,
                                fontFamily: 'Poppins',
                              ),
                            ),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: AppColors.appDark,
                              side: const BorderSide(
                                  color: Color(0xFFE5E7EB)),
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(16)),
                            ),
                          ),
                        ),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            Expanded(
                              child: OutlinedButton.icon(
                                onPressed: widget.onSellAnother,
                                icon: const Icon(Icons.add_rounded, size: 18),
                                label: const Text(
                                  'Sell Another',
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w700,
                                    fontFamily: 'Poppins',
                                  ),
                                ),
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: AppColors.appBlue,
                                  side: const BorderSide(
                                      color: AppColors.appBlue),
                                  shape: RoundedRectangleBorder(
                                      borderRadius:
                                          BorderRadius.circular(14)),
                                  padding:
                                      const EdgeInsets.symmetric(vertical: 13),
                                ),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: OutlinedButton.icon(
                                onPressed: widget.onGoHome,
                                icon:
                                    const Icon(Icons.home_rounded, size: 18),
                                label: const Text(
                                  'Go Home',
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w700,
                                    fontFamily: 'Poppins',
                                  ),
                                ),
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: Colors.grey.shade700,
                                  side: const BorderSide(
                                      color: Color(0xFFE5E7EB)),
                                  shape: RoundedRectangleBorder(
                                      borderRadius:
                                          BorderRadius.circular(14)),
                                  padding:
                                      const EdgeInsets.symmetric(vertical: 13),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Animated Success Circle ───────────────────────────────────────────────────

class _SuccessCircle extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 120,
      height: 120,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppColors.appGreen, Color(0xFF2ECC71)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: AppColors.appGreen.withValues(alpha: 0.35),
            blurRadius: 30,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      child: const Icon(
        Icons.check_rounded,
        color: Colors.white,
        size: 56,
      ),
    );
  }
}

// ── Confetti Painter ──────────────────────────────────────────────────────────

class _ConfettiPainter extends CustomPainter {
  final double progress;
  static final _rng = Random(42);

  static final _pieces = List.generate(60, (_) {
    return _ConfettiPiece(
      x: _rng.nextDouble(),
      startY: -0.1 - _rng.nextDouble() * 0.3,
      size: 6 + _rng.nextDouble() * 6,
      speed: 0.4 + _rng.nextDouble() * 0.6,
      color: [
        AppColors.appGreen,
        AppColors.appBlue,
        const Color(0xFFF59E0B),
        const Color(0xFFEC4899),
        const Color(0xFF7C3AED),
      ][_rng.nextInt(5)],
      rotation: _rng.nextDouble() * 2 * 3.14,
    );
  });

  _ConfettiPainter(this.progress);

  @override
  void paint(Canvas canvas, Size size) {
    if (progress == 0 || progress == 1) return;
    for (final p in _pieces) {
      final y = (p.startY + progress * p.speed);
      if (y < 0 || y > 1.1) continue;
      final paint = Paint()..color = p.color.withValues(alpha: 1 - progress * 0.5);
      canvas.save();
      canvas.translate(p.x * size.width, y * size.height);
      canvas.rotate(p.rotation + progress * 4);
      canvas.drawRect(
        Rect.fromCenter(center: Offset.zero, width: p.size, height: p.size * 0.5),
        paint,
      );
      canvas.restore();
    }
  }

  @override
  bool shouldRepaint(_ConfettiPainter old) => old.progress != progress;
}

class _ConfettiPiece {
  final double x;
  final double startY;
  final double size;
  final double speed;
  final Color color;
  final double rotation;

  const _ConfettiPiece({
    required this.x,
    required this.startY,
    required this.size,
    required this.speed,
    required this.color,
    required this.rotation,
  });
}
