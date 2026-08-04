// ─── Step 3 – Add Photos ──────────────────────────────────────────────────────

import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../theme/app_colors.dart';
import 'sell_widgets.dart';
import 'sell_flow_controller.dart';

const int _maxPhotos = 10;

class AddPhotosScreen extends StatefulWidget {
  final SellFlowController controller;

  const AddPhotosScreen({super.key, required this.controller});

  @override
  State<AddPhotosScreen> createState() => _AddPhotosScreenState();
}

class _AddPhotosScreenState extends State<AddPhotosScreen> {
  final _picker = ImagePicker();
  List<File> _photos = [];

  Future<void> _pickFromCamera() async {
    if (_photos.length >= _maxPhotos) {
      _showMaxSnack();
      return;
    }
    final XFile? file =
        await _picker.pickImage(source: ImageSource.camera, imageQuality: 85);
    if (file != null) {
      setState(() => _photos.add(File(file.path)));
      _syncToController();
    }
  }

  Future<void> _pickFromGallery() async {
    final remaining = _maxPhotos - _photos.length;
    if (remaining <= 0) {
      _showMaxSnack();
      return;
    }
    final List<XFile> files = await _picker.pickMultiImage(imageQuality: 85);
    if (files.isNotEmpty) {
      final toAdd = files.take(remaining).map((x) => File(x.path)).toList();
      setState(() => _photos.addAll(toAdd));
      _syncToController();
    }
  }

  void _removePhoto(int index) {
    setState(() => _photos.removeAt(index));
    _syncToController();
  }

  void _syncToController() {
    widget.controller.data.photos = List.from(_photos);
  }

  void _showMaxSnack() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Maximum 10 photos allowed.',
            style: TextStyle(fontFamily: 'Poppins')),
        backgroundColor: Colors.orange,
      ),
    );
  }

  @override
  void initState() {
    super.initState();
    _photos = List.from(widget.controller.data.photos);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      appBar: SellAppBar(
        title: 'Add Photos',
        currentStep: 3,
        totalSteps: SellFlowController.totalSteps,
        onBack: () => widget.controller.goToPrev(),
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header
                  const Text(
                    'Show it off! 📸',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      color: AppColors.appDark,
                      fontFamily: 'Poppins',
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${_photos.length} / $_maxPhotos photos added',
                    style: TextStyle(
                      fontSize: 13,
                      color: Colors.grey.shade500,
                      fontFamily: 'Poppins',
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Progress indicator
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: LinearProgressIndicator(
                      value: _photos.length / _maxPhotos,
                      minHeight: 5,
                      backgroundColor: const Color(0xFFE5E7EB),
                      valueColor: AlwaysStoppedAnimation<Color>(
                        _photos.length >= 5
                            ? AppColors.appGreen
                            : AppColors.appBlue,
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Upload Card (shown when empty or add more)
                  if (_photos.isEmpty) ...[
                    _UploadCard(
                      onCamera: _pickFromCamera,
                      onGallery: _pickFromGallery,
                    ),
                    const SizedBox(height: 20),
                  ],

                  // Photos grid
                  if (_photos.isNotEmpty) ...[
                    SellSectionHeader(
                      title: 'Your Photos',
                      action: _photos.length < _maxPhotos ? 'Add More' : null,
                      onAction: _showAddOptions,
                    ),
                    _PhotoGrid(
                      photos: _photos,
                      onRemove: _removePhoto,
                    ),
                    const SizedBox(height: 20),
                  ],

                  // Helper text
                  SellInfoCard(
                    icon: Icons.lightbulb_rounded,
                    title: 'Pro Tip',
                    body:
                        'Listings with at least 5 photos receive more buyer responses. Show front, back, sides and any defects.',
                    iconColor: const Color(0xFFF59E0B),
                    bgColor: const Color(0xFFFFFBEB),
                  ),
                  const SizedBox(height: 16),

                  // Photo tips
                  _PhotoTipsCard(),
                ],
              ),
            ),
          ),

          // Continue
          SellContinueButton(
            onPressed:
                _photos.isEmpty ? null : () => widget.controller.goToNext(),
            label: _photos.isEmpty ? 'Add at least 1 photo' : 'Continue',
          ),
        ],
      ),
    );
  }

  void _showAddOptions() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => _AddPhotoSheet(
        onCamera: () {
          Navigator.pop(ctx);
          _pickFromCamera();
        },
        onGallery: () {
          Navigator.pop(ctx);
          _pickFromGallery();
        },
      ),
    );
  }
}

// ── Upload Card ───────────────────────────────────────────────────────────────

class _UploadCard extends StatelessWidget {
  final VoidCallback onCamera;
  final VoidCallback onGallery;

  const _UploadCard({required this.onCamera, required this.onGallery});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      height: 200,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: AppColors.appGreen.withValues(alpha: 0.3),
          width: 2,
          strokeAlign: BorderSide.strokeAlignInside,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: AppColors.appGreen.withValues(alpha: 0.08),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.add_photo_alternate_rounded,
                color: AppColors.appGreen, size: 32),
          ),
          const SizedBox(height: 12),
          const Text(
            'Tap to add photos',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: AppColors.appDark,
              fontFamily: 'Poppins',
            ),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _PhotoSourceBtn(
                icon: Icons.camera_alt_rounded,
                label: 'Camera',
                onTap: onCamera,
              ),
              const SizedBox(width: 12),
              _PhotoSourceBtn(
                icon: Icons.photo_library_rounded,
                label: 'Gallery',
                onTap: onGallery,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _PhotoSourceBtn extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _PhotoSourceBtn({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
        decoration: BoxDecoration(
          color: AppColors.appGreen,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Icon(icon, color: Colors.white, size: 16),
            const SizedBox(width: 8),
            Text(
              label,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 13,
                fontWeight: FontWeight.w600,
                fontFamily: 'Poppins',
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Photo Grid ────────────────────────────────────────────────────────────────

class _PhotoGrid extends StatelessWidget {
  final List<File> photos;
  final ValueChanged<int> onRemove;

  const _PhotoGrid({required this.photos, required this.onRemove});

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: photos.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: 8,
        mainAxisSpacing: 8,
        childAspectRatio: 1,
      ),
      itemBuilder: (_, i) {
        final isCover = i == 0;
        return Stack(
          clipBehavior: Clip.none,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(14),
              child: Image.file(
                photos[i],
                width: double.infinity,
                height: double.infinity,
                fit: BoxFit.cover,
              ),
            ),
            // Cover badge
            if (isCover)
              Positioned(
                bottom: 6,
                left: 6,
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.appGreen,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Text(
                    'COVER',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 9,
                      fontWeight: FontWeight.w800,
                      fontFamily: 'Poppins',
                    ),
                  ),
                ),
              ),
            // Delete button
            Positioned(
              top: -4,
              right: -4,
              child: GestureDetector(
                onTap: () => onRemove(i),
                child: Container(
                  width: 24,
                  height: 24,
                  decoration: BoxDecoration(
                    color: Colors.red.shade400,
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white, width: 1.5),
                  ),
                  child: const Icon(Icons.close_rounded,
                      color: Colors.white, size: 14),
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}

// ── Add Photo Bottom Sheet ────────────────────────────────────────────────────

class _AddPhotoSheet extends StatelessWidget {
  final VoidCallback onCamera;
  final VoidCallback onGallery;

  const _AddPhotoSheet({required this.onCamera, required this.onGallery});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Add Photos',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: AppColors.appDark,
              fontFamily: 'Poppins',
            ),
          ),
          const SizedBox(height: 20),
          _SheetOption(
            icon: Icons.camera_alt_rounded,
            color: AppColors.appBlue,
            label: 'Take a Photo',
            subtitle: 'Use your camera',
            onTap: onCamera,
          ),
          const SizedBox(height: 12),
          _SheetOption(
            icon: Icons.photo_library_rounded,
            color: AppColors.appGreen,
            label: 'Choose from Gallery',
            subtitle: 'Select multiple photos',
            onTap: onGallery,
          ),
          const SizedBox(height: 8),
        ],
      ),
    );
  }
}

class _SheetOption extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String label;
  final String subtitle;
  final VoidCallback onTap;

  const _SheetOption({
    required this.icon,
    required this.color,
    required this.label,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.06),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: color.withValues(alpha: 0.15)),
        ),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: color, size: 22),
            ),
            const SizedBox(width: 14),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: AppColors.appDark,
                    fontFamily: 'Poppins',
                  ),
                ),
                Text(
                  subtitle,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey.shade500,
                    fontFamily: 'Poppins',
                  ),
                ),
              ],
            ),
            const Spacer(),
            Icon(Icons.arrow_forward_ios_rounded,
                size: 14, color: Colors.grey.shade400),
          ],
        ),
      ),
    );
  }
}

// ── Photo Tips Card ───────────────────────────────────────────────────────────

class _PhotoTipsCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    const tips = [
      'Use good lighting – natural light works best',
      'Show all angles: front, back, sides',
      'Photograph any scratches or wear',
      'Clean the item before photographing',
    ];
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '📷 Photo Tips',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: AppColors.appDark,
              fontFamily: 'Poppins',
            ),
          ),
          const SizedBox(height: 10),
          ...tips.map(
            (t) => Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.check_rounded,
                      size: 14, color: AppColors.appGreen),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      t,
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey.shade700,
                        fontFamily: 'Poppins',
                        height: 1.4,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
