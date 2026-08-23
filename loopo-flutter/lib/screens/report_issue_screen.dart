import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class ReportIssueScreen extends StatefulWidget {
  final String targetTitle;
  final String targetId;

  const ReportIssueScreen({
    super.key,
    this.targetTitle = 'Listing / User',
    this.targetId = 'target-101',
  });

  @override
  State<ReportIssueScreen> createState() => _ReportIssueScreenState();
}

class _ReportIssueScreenState extends State<ReportIssueScreen> {
  String _selectedReason = 'Spam or Fraudulent Ad';
  final _detailsCtrl = TextEditingController();
  bool _isSubmitting = false;

  final List<String> _reasons = [
    'Spam or Fraudulent Ad',
    'Counterfeit / Fake Product',
    'Inappropriate Content / Harassment',
    'Incorrect Price or Item Condition',
    'Unresponsive / Suspicious Seller',
    'Other Policy Violation',
  ];

  @override
  void dispose() {
    _detailsCtrl.dispose();
    super.dispose();
  }

  void _submitReport() {
    setState(() => _isSubmitting = true);
    Future.delayed(const Duration(milliseconds: 800), () {
      if (!mounted) return;
      setState(() => _isSubmitting = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Report submitted to moderation team. Thank you!'),
          backgroundColor: AppColors.emerald600,
          behavior: SnackBarBehavior.floating,
        ),
      );
      Navigator.of(context).pop();
    });
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
          style: TextStyle(color: Colors.black87, fontWeight: FontWeight.w800, fontSize: 18),
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
                  Icon(Icons.report_problem_outlined, color: Colors.amber.shade900, size: 24),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Reporting: ${widget.targetTitle}',
                      style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: Colors.amber.shade900),
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
            ..._reasons.map((reason) {
              final isSel = _selectedReason == reason;
              return Container(
                margin: const EdgeInsets.only(bottom: 8),
                decoration: BoxDecoration(
                  color: isSel ? AppColors.emerald600.withValues(alpha: 0.08) : Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: isSel ? AppColors.emerald600 : Colors.grey.shade200),
                ),
                child: RadioListTile<String>(
                  title: Text(
                    reason,
                    style: TextStyle(
                      fontWeight: isSel ? FontWeight.w800 : FontWeight.w600,
                      fontSize: 13,
                      color: isSel ? AppColors.emerald600 : Colors.black87,
                    ),
                  ),
                  value: reason,
                  groupValue: _selectedReason,
                  activeColor: AppColors.emerald600,
                  onChanged: (val) {
                    if (val != null) setState(() => _selectedReason = val);
                  },
                ),
              );
            }),
            const SizedBox(height: 16),
            const Text(
              'Additional Details (Optional)',
              style: TextStyle(fontWeight: FontWeight.w900, fontSize: 14),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _detailsCtrl,
              maxLines: 4,
              decoration: InputDecoration(
                hintText: 'Describe the issue or evidence to help our trust team...',
                hintStyle: TextStyle(fontSize: 12, color: Colors.grey.shade400),
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide(color: Colors.grey.shade300),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: const BorderSide(color: AppColors.emerald600, width: 2),
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
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  elevation: 0,
                ),
                child: _isSubmitting
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                      )
                    : const Text(
                        'Submit Violation Report',
                        style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 14),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
