import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../services/kyc_service.dart';

class KycVerificationScreen extends StatefulWidget {
  const KycVerificationScreen({super.key});

  @override
  State<KycVerificationScreen> createState() => _KycVerificationScreenState();
}

class _KycVerificationScreenState extends State<KycVerificationScreen> {
  final KycService _kycService = KycService();
  String _selectedDocType = 'Aadhaar Card';
  final TextEditingController _docNumberController = TextEditingController();
  bool _docUploaded = false;
  bool _selfieUploaded = false;
  bool _isSubmitted = false;
  bool _isSubmitting = false;
  String? _errorMessage;

  final List<String> _docTypes = [
    'Aadhaar Card',
    'Driving License',
    'Voter ID Card',
    'PAN Card',
    'Passport',
  ];

  @override
  void dispose() {
    _docNumberController.dispose();
    super.dispose();
  }

  Future<void> _submitKyc() async {
    if (!_docUploaded || !_selfieUploaded) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please upload both Document Photo and Selfie')),
      );
      return;
    }
    if (_docNumberController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter your document number')),
      );
      return;
    }

    setState(() { _isSubmitting = true; _errorMessage = null; });
    try {
      await _kycService.verifyKyc(
        docType: _selectedDocType.toUpperCase().replaceAll(' ', '_'),
        docNumber: _docNumberController.text.trim(),
      );
      setState(() { _isSubmitted = true; _isSubmitting = false; });
    } catch (e) {
      setState(() {
        _isSubmitting = false;
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(_errorMessage ?? 'KYC submission failed')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 1,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: AppColors.appDark, size: 18),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Identity & KYC Verification',
          style: TextStyle(
            color: AppColors.appDark,
            fontFamily: 'Poppins',
            fontWeight: FontWeight.w800,
            fontSize: 18,
          ),
        ),
      ),
      body: _isSubmitted
          ? Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 90,
                      height: 90,
                      decoration: const BoxDecoration(
                        color: Color(0xFFEFF6FF),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.verified_user_rounded, size: 50, color: AppColors.appBlue),
                    ),
                    const SizedBox(height: 20),
                    const Text(
                      'Verification Under Review',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontFamily: 'Poppins',
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: AppColors.appDark,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Your document ($_selectedDocType) and selfie have been received. Our team will verify your seller profile within 2-4 hours.',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontFamily: 'Poppins', fontSize: 13, color: Colors.grey.shade600, height: 1.4),
                    ),
                    const SizedBox(height: 24),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.verified, color: AppColors.appGreen, size: 24),
                          SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Verified Badge Benefit', style: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.bold, fontSize: 13)),
                                Text('Buyers are 4x more likely to trust and buy from verified sellers.', style: TextStyle(fontFamily: 'Poppins', fontSize: 11, color: Colors.black54)),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 32),
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: ElevatedButton(
                        onPressed: () => Navigator.pop(context),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.appGreen,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                        child: const Text('Back to Profile', style: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.bold, color: Colors.white)),
                      ),
                    ),
                  ],
                ),
              ),
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header Banner
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [AppColors.appGreen.withValues(alpha: 0.15), const Color(0xFFEFF6FF)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.appGreen.withValues(alpha: 0.3)),
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.shield_outlined, size: 36, color: AppColors.appGreen),
                        SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Get "Verified Seller" Badge',
                                style: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.w800, fontSize: 14, color: AppColors.appDark),
                              ),
                              SizedBox(height: 2),
                              Text(
                                'Complete government identity check to build trust & boost your ad inquiries.',
                                style: TextStyle(fontFamily: 'Poppins', fontSize: 11, color: Colors.black54),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Select Document Type
                  const Text('1. Select Government ID Type', style: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.appDark)),
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: _selectedDocType,
                        isExpanded: true,
                        icon: const Icon(Icons.keyboard_arrow_down),
                        items: _docTypes.map((doc) {
                          return DropdownMenuItem(
                            value: doc,
                            child: Text(doc, style: const TextStyle(fontFamily: 'Poppins', fontSize: 13)),
                          );
                        }).toList(),
                        onChanged: (val) {
                          if (val != null) setState(() => _selectedDocType = val);
                        },
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Document Number Input
                  const Text('1b. Enter Document Number', style: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.appDark)),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _docNumberController,
                    decoration: InputDecoration(
                      hintText: 'e.g. ABCD1234EF or 1234 5678 9012',
                      hintStyle: TextStyle(fontFamily: 'Poppins', fontSize: 13, color: Colors.grey.shade400),
                      filled: true,
                      fillColor: Colors.white,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Document Photo Upload Slot
                  const Text('2. Upload Front Photo of Document', style: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.appDark)),
                  const SizedBox(height: 10),
                  InkWell(
                    onTap: () {
                      setState(() {
                        _docUploaded = true;
                        if (_docNumberController.text.isEmpty) {
                          _docNumberController.text = '123456789012';
                        }
                      });
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('$_selectedDocType uploaded successfully')),
                      );
                    },
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      height: 110,
                      decoration: BoxDecoration(
                        color: _docUploaded ? AppColors.appGreen.withValues(alpha: 0.1) : Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: _docUploaded ? AppColors.appGreen : const Color(0xFFCBD5E1),
                          style: BorderStyle.solid,
                          width: _docUploaded ? 2 : 1,
                        ),
                      ),
                      child: Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              _docUploaded ? Icons.check_circle_rounded : Icons.add_a_photo_outlined,
                              size: 32,
                              color: _docUploaded ? AppColors.appGreen : Colors.grey.shade500,
                            ),
                            const SizedBox(height: 6),
                            Text(
                              _docUploaded ? '$_selectedDocType Attached' : 'Tap to capture / upload $_selectedDocType',
                              style: TextStyle(
                                fontFamily: 'Poppins',
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: _docUploaded ? AppColors.appGreen : Colors.grey.shade600,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Live Selfie Upload Slot
                  const Text('3. Take a Live Selfie Photo', style: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.appDark)),
                  const SizedBox(height: 10),
                  InkWell(
                    onTap: () {
                      setState(() => _selfieUploaded = true);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Selfie captured successfully')),
                      );
                    },
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      height: 110,
                      decoration: BoxDecoration(
                        color: _selfieUploaded ? AppColors.appGreen.withValues(alpha: 0.1) : Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: _selfieUploaded ? AppColors.appGreen : const Color(0xFFCBD5E1),
                          width: _selfieUploaded ? 2 : 1,
                        ),
                      ),
                      child: Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              _selfieUploaded ? Icons.check_circle_rounded : Icons.face_rounded,
                              size: 32,
                              color: _selfieUploaded ? AppColors.appGreen : Colors.grey.shade500,
                            ),
                            const SizedBox(height: 6),
                            Text(
                              _selfieUploaded ? 'Selfie Photo Attached' : 'Tap to take a selfie for face match',
                              style: TextStyle(
                                fontFamily: 'Poppins',
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: _selfieUploaded ? AppColors.appGreen : Colors.grey.shade600,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Submit Button
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      onPressed: _isSubmitting ? null : _submitKyc,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.appGreen,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      child: _isSubmitting
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : const Text(
                              'Submit Verification Documents',
                              style: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.bold, fontSize: 14, color: Colors.white),
                            ),
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}
