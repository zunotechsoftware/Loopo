import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class SavedSearchesScreen extends StatefulWidget {
  const SavedSearchesScreen({super.key});

  @override
  State<SavedSearchesScreen> createState() => _SavedSearchesScreenState();
}

class _SavedSearchesScreenState extends State<SavedSearchesScreen> {
  final List<Map<String, dynamic>> _savedSearches = [
    {
      'id': 'ss-1',
      'query': 'iPhone 15 Pro',
      'category': 'Mobiles',
      'location': 'Bangalore',
      'alertsEnabled': true,
      'newItemsCount': 4,
    },
    {
      'id': 'ss-2',
      'query': 'Royal Enfield Classic 350',
      'category': 'Bikes',
      'location': 'Mumbai',
      'alertsEnabled': true,
      'newItemsCount': 2,
    },
    {
      'id': 'ss-3',
      'query': 'Sony WH-1000XM5',
      'category': 'Electronics',
      'location': 'Delhi',
      'alertsEnabled': false,
      'newItemsCount': 0,
    },
  ];

  void _toggleAlerts(int index) {
    setState(() {
      _savedSearches[index]['alertsEnabled'] = !(_savedSearches[index]['alertsEnabled'] as bool);
    });
    final status = _savedSearches[index]['alertsEnabled'] as bool ? 'enabled' : 'disabled';
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Notifications $status for "${_savedSearches[index]['query']}"'),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _deleteSearch(int index) {
    final deleted = _savedSearches.removeAt(index);
    setState(() {});
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Removed saved search "${deleted['query']}"'),
        behavior: SnackBarBehavior.floating,
      ),
    );
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
          'Saved Searches & Alerts',
          style: TextStyle(color: Colors.black87, fontWeight: FontWeight.w800, fontSize: 18),
        ),
      ),
      body: _savedSearches.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.bookmark_outline, size: 64, color: Colors.grey.shade400),
                  const SizedBox(height: 12),
                  const Text(
                    'No saved searches yet',
                    style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15, color: Colors.black87),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Save your search filters to get instant push alerts for new ads',
                    style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                  ),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _savedSearches.length,
              itemBuilder: (context, index) {
                final search = _savedSearches[index];
                final alertsOn = search['alertsEnabled'] as bool;
                final newCount = search['newItemsCount'] as int;

                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.grey.shade200),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.02),
                        blurRadius: 8,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: AppColors.emerald600.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(14),
                            ),
                            child: const Icon(Icons.search, color: AppColors.emerald600, size: 22),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  search['query'],
                                  style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  '${search['category']} • ${search['location']}',
                                  style: TextStyle(fontSize: 12, color: Colors.grey.shade600, fontWeight: FontWeight.w500),
                                ),
                              ],
                            ),
                          ),
                          if (newCount > 0)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: AppColors.emerald600,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                '+$newCount new',
                                style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w800),
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      const Divider(height: 1),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Switch(
                                value: alertsOn,
                                activeTrackColor: AppColors.emerald600,
                                onChanged: (_) => _toggleAlerts(index),
                              ),
                              Text(
                                alertsOn ? 'Notifications Active' : 'Notifications Off',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                  color: alertsOn ? AppColors.emerald600 : Colors.grey,
                                ),
                              ),
                            ],
                          ),
                          IconButton(
                            icon: const Icon(Icons.delete_outline, color: Colors.redAccent, size: 20),
                            onPressed: () => _deleteSearch(index),
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),
    );
  }
}
