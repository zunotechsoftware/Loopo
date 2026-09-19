import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../services/report_service.dart';

/// The exact, active reason codes the real backend validates against
/// (ReportReason lookup table) - matches loopo-client's already-fixed
/// ReportModal.tsx for consistency across apps.
const List<Map<String, String>> _reportReasons = [
  {'code': 'SPAM', 'label': 'Spam / Advertising content'},
  {'code': 'FRAUD', 'label': 'Fraudulent listings or activity'},
  {'code': 'FAKE_PRODUCT', 'label': 'Fake or misrepresented product'},
  {'code': 'DUPLICATE_LISTING', 'label': 'Duplicate product listing'},
  {'code': 'WRONG_CATEGORY', 'label': 'Listing placed in incorrect category'},
  {'code': 'COPYRIGHT_VIOLATION', 'label': 'Copyright / trademark violation'},
  {'code': 'HARASSMENT', 'label': 'Harassment, hate speech, or abuse'},
  {'code': 'ABUSIVE_LANGUAGE', 'label': 'Inappropriate or vulgar language'},
  {'code': 'SCAM', 'label': 'Suspected scam or suspicious offer'},
  {'code': 'ILLEGAL_ITEM', 'label': 'Sale of prohibited or illegal items'},
  {'code': 'COUNTERFEIT', 'label': 'Counterfeit or replica products'},
  {'code': 'OTHER', 'label': 'Other violation'},
];

class ReportIssueScreen extends StatefulWidget {
  final String targetTitle;
  final String targetId;

  /// 'LISTING' or 'USER' - matches the real backend's
  /// ReportTargetTypeDto enum exactly (there is no 'PRODUCT' value there).
  final String targetType;

  const ReportIssueScreen({
    super.key,
    required this.targetTitle,
    required this.targetId,
    this.targetType = 'LISTING',
  });

  @override
  State<ReportIssueScreen> createState() => _ReportIssueScreenState();
}

class _ReportIssueScreenState extends State<ReportIssueScreen> {
  final ReportService _reportService = ReportService();
  String _selectedReasonCode = _reportReasons.first['code']!;
  final _detailsCtrl = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _detailsCtrl.dispose();
    super.dispose();
  }

  Future<void> _submitReport() async {
    final details = _detailsCtrl.text.trim();
    if (details.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please add a few details describing the issue.'),
        ),
      );
      return;
    }

    setState(() => _isSubmitting = true);
    try {
      await _reportService.submitReport(
        targetId: widget.targetId,
        targetType: widget.targetType,
        reasonCode: _selectedReasonCode,
        details: details,
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Report submitted to moderation team. Thank you!'),
          backgroundColor: AppColors.emerald600,
          behavior: SnackBarBehavior.floating,
        ),
      );
      Navigator.of(context).pop();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString().replaceFirst('Exception: ', ''))),
      );
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAFAFA),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        iconTheme: const IconThemeData(color: Colors.black87),
        title: const Text(
          'Report Violation',
          style: TextStyle(
            color: Colors.black87,
            fontWeight: FontWeight.w800,
            fontSize: 18,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.amber.shade50,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.amber.shade200),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.report_problem_outlined,
                    color: Colors.amber.shade900,
                    size: 24,
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Reporting: ${widget.targetTitle}',
                      style: TextStyle(
                        fontWeight: FontWeight.w800,
                        fontSize: 13,
                        color: Colors.amber.shade900,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'Select Reason for Report',
              style: TextStyle(fontWeight: FontWeight.w900, fontSize: 14),
            ),
            const SizedBox(height: 10),
            ..._reportReasons.map((reason) {
              final isSel = _selectedReasonCode == reason['code'];
              return Container(
                margin: const EdgeInsets.only(bottom: 8),
                decoration: BoxDecoration(
                  color: isSel
                      ? AppColors.emerald600.withValues(alpha: 0.08)
                      : Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: isSel ? AppColors.emerald600 : Colors.grey.shade200,
                  ),
                ),
                child: RadioListTile<String>(
                  title: Text(
                    reason['label']!,
                    style: TextStyle(
                      fontWeight: isSel ? FontWeight.w800 : FontWeight.w600,
                      fontSize: 13,
                      color: isSel ? AppColors.emerald600 : Colors.black87,
                    ),
                  ),
                  value: reason['code']!,
                  groupValue: _selectedReasonCode,
                  activeColor: AppColors.emerald600,
                  onChanged: (val) {
                    if (val != null) setState(() => _selectedReasonCode = val);
                  },
                ),
              );
            }),
            const SizedBox(height: 16),
            const Text(
              'Additional Details',
              style: TextStyle(fontWeight: FontWeight.w900, fontSize: 14),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _detailsCtrl,
              maxLines: 4,
              decoration: InputDecoration(
                hintText:
                    'Describe the issue or evidence to help our trust team...',
                hintStyle: TextStyle(fontSize: 12, color: Colors.grey.shade400),
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide(color: Colors.grey.shade300),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: const BorderSide(
                    color: AppColors.emerald600,
                    width: 2,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: _isSubmitting ? null : _submitReport,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.redAccent,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                  elevation: 0,
                ),
                child: _isSubmitting
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2,
                        ),
                      )
                    : const Text(
                        'Submit Violation Report',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w900,
                          fontSize: 14,
                        ),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
