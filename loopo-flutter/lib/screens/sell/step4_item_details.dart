// ─── Step 4 – Item Details ────────────────────────────────────────────────────

import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import 'sell_widgets.dart';
import 'sell_flow_controller.dart';

const _conditions = ['New', 'Like New', 'Good', 'Fair'];

class ItemDetailsScreen extends StatefulWidget {
  final SellFlowController controller;

  const ItemDetailsScreen({super.key, required this.controller});

  @override
  State<ItemDetailsScreen> createState() => _ItemDetailsScreenState();
}

class _ItemDetailsScreenState extends State<ItemDetailsScreen> {
  late final TextEditingController _titleCtrl;
  late final TextEditingController _brandCtrl;
  late final TextEditingController _modelCtrl;
  late final TextEditingController _descCtrl;
  late final TextEditingController _qtyCtrl;

  String? _condition;
  final _formKey = GlobalKey<FormState>();

  // Error texts
  String? _titleError;
  String? _conditionError;
  String? _descError;

  @override
  void initState() {
    super.initState();
    final d = widget.controller.data;
    _titleCtrl = TextEditingController(text: d.title);
    _brandCtrl = TextEditingController(text: d.brand);
    _modelCtrl = TextEditingController(text: d.model);
    _descCtrl = TextEditingController(text: d.description);
    _qtyCtrl =
        TextEditingController(text: d.quantity == 0 ? '1' : '${d.quantity}');
    _condition = d.condition.isEmpty ? null : d.condition;
  }

  @override
  void dispose() {
    _titleCtrl.dispose();
    _brandCtrl.dispose();
    _modelCtrl.dispose();
    _descCtrl.dispose();
    _qtyCtrl.dispose();
    super.dispose();
  }

  bool _validate() {
    bool ok = true;
    setState(() {
      _titleError =
          _titleCtrl.text.trim().isEmpty ? 'Please enter a title' : null;
      _conditionError =
          _condition == null ? 'Please select a condition' : null;
      _descError = _descCtrl.text.trim().isEmpty
          ? 'Please enter a description'
          : null;
    });
    if (_titleError != null || _conditionError != null || _descError != null) {
      ok = false;
    }
    return ok;
  }

  void _saveAndContinue() {
    if (!_validate()) return;
    final d = widget.controller.data;
    d.title = _titleCtrl.text.trim();
    d.brand = _brandCtrl.text.trim();
    d.model = _modelCtrl.text.trim();
    d.condition = _condition!;
    d.description = _descCtrl.text.trim();
    d.quantity = int.tryParse(_qtyCtrl.text) ?? 1;
    widget.controller.goToNext();
  }

  void _showConditionSheet() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => _ConditionSheet(
        selected: _condition,
        onSelect: (c) {
          setState(() {
            _condition = c;
            _conditionError = null;
          });
          Navigator.pop(ctx);
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      appBar: SellAppBar(
        title: 'Item Details',
        currentStep: 4,
        totalSteps: SellFlowController.totalSteps,
        onBack: () => widget.controller.goToPrev(),
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
              padding: const EdgeInsets.all(20),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Tell buyers about your item',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                        color: AppColors.appDark,
                        fontFamily: 'Poppins',
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Complete and accurate details attract more buyers',
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.grey.shade500,
                        fontFamily: 'Poppins',
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Title
                    SellLabeledField(
                      label: 'Title',
                      hint: 'e.g. iPhone 14 Pro Max 256GB Space Black',
                      controller: _titleCtrl,
                      maxLength: 100,
                      errorText: _titleError,
                      required: true,
                      onChanged: (_) {
                        if (_titleError != null) {
                          setState(() => _titleError = null);
                        }
                      },
                    ),
                    const SizedBox(height: 18),

                    // Brand + Model
                    Row(
                      children: [
                        Expanded(
                          child: SellLabeledField(
                            label: 'Brand',
                            hint: 'e.g. Apple',
                            controller: _brandCtrl,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: SellLabeledField(
                            label: 'Model',
                            hint: 'e.g. iPhone 14',
                            controller: _modelCtrl,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 18),

                    // Condition
                    SellSelectorTile(
                      label: 'Condition',
                      placeholder: 'Select condition',
                      value: _condition,
                      required: true,
                      errorText: _conditionError,
                      onTap: _showConditionSheet,
                    ),
                    const SizedBox(height: 18),

                    // Description
                    SellLabeledField(
                      label: 'Description',
                      hint:
                          'Describe your item in detail – age, features, any defects, reason for selling…',
                      controller: _descCtrl,
                      maxLines: 6,
                      maxLength: 2000,
                      required: true,
                      errorText: _descError,
                      onChanged: (_) {
                        if (_descError != null) {
                          setState(() => _descError = null);
                        }
                      },
                    ),
                    const SizedBox(height: 18),

                    // Quantity
                    Row(
                      children: [
                        const Expanded(
                          child: Text(
                            'Quantity',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: AppColors.appDark,
                              fontFamily: 'Poppins',
                            ),
                          ),
                        ),
                        _QuantitySelector(controller: _qtyCtrl),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // Tips
                    SellInfoCard(
                      icon: Icons.tips_and_updates_rounded,
                      title: 'Writing Tips',
                      body:
                          'Good titles have brand, model, key spec. Descriptions should be honest – mention defects to build trust.',
                    ),
                    const SizedBox(height: 8),
                  ],
                ),
              ),
            ),
          ),
          SellContinueButton(onPressed: _saveAndContinue),
        ],
      ),
    );
  }
}

// ── Condition Bottom Sheet ────────────────────────────────────────────────────

class _ConditionSheet extends StatelessWidget {
  final String? selected;
  final ValueChanged<String> onSelect;

  const _ConditionSheet({required this.selected, required this.onSelect});

  static const _descriptions = {
    'New': 'Brand new, unused, in original packaging.',
    'Like New': 'Used very little, no visible wear.',
    'Good': 'Minor signs of use, fully functional.',
    'Fair': 'Noticeable wear but works perfectly.',
  };

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Select Condition',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: AppColors.appDark,
              fontFamily: 'Poppins',
            ),
          ),
          const SizedBox(height: 16),
          ..._conditions.map((c) {
            final isSelected = c == selected;
            return GestureDetector(
              onTap: () => onSelect(c),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 180),
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: isSelected
                      ? AppColors.appGreen.withValues(alpha: 0.06)
                      : const Color(0xFFF5F7FA),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: isSelected
                        ? AppColors.appGreen
                        : const Color(0xFFE5E7EB),
                    width: isSelected ? 2 : 1,
                  ),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            c,
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                              color: isSelected
                                  ? AppColors.appGreen
                                  : AppColors.appDark,
                              fontFamily: 'Poppins',
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            _descriptions[c] ?? '',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey.shade500,
                              fontFamily: 'Poppins',
                            ),
                          ),
                        ],
                      ),
                    ),
                    if (isSelected)
                      const Icon(Icons.check_circle_rounded,
                          color: AppColors.appGreen, size: 22),
                  ],
                ),
              ),
            );
          }),
          const SizedBox(height: 4),
        ],
      ),
    );
  }
}

// ── Quantity Selector ─────────────────────────────────────────────────────────

class _QuantitySelector extends StatefulWidget {
  final TextEditingController controller;

  const _QuantitySelector({required this.controller});

  @override
  State<_QuantitySelector> createState() => _QuantitySelectorState();
}

class _QuantitySelectorState extends State<_QuantitySelector> {
  int _qty = 1;

  @override
  void initState() {
    super.initState();
    _qty = int.tryParse(widget.controller.text) ?? 1;
  }

  void _update(int v) {
    if (v < 1 || v > 99) return;
    setState(() => _qty = v);
    widget.controller.text = '$v';
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        _QtyBtn(
          icon: Icons.remove,
          onTap: () => _update(_qty - 1),
          enabled: _qty > 1,
        ),
        Container(
          width: 48,
          alignment: Alignment.center,
          child: Text(
            '$_qty',
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: AppColors.appDark,
              fontFamily: 'Poppins',
            ),
          ),
        ),
        _QtyBtn(
          icon: Icons.add,
          onTap: () => _update(_qty + 1),
          enabled: _qty < 99,
        ),
      ],
    );
  }
}

class _QtyBtn extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  final bool enabled;

  const _QtyBtn({
    required this.icon,
    required this.onTap,
    this.enabled = true,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: enabled ? onTap : null,
      child: Container(
        width: 36,
        height: 36,
        decoration: BoxDecoration(
          color: enabled ? AppColors.appGreen : Colors.grey.shade200,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(
          icon,
          size: 18,
          color: enabled ? Colors.white : Colors.grey.shade400,
        ),
      ),
    );
  }
}
