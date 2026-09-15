import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:loopo/screens/login_screen.dart';
import 'package:loopo/screens/location_screen.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  testWidgets('renders login screen with welcome back header', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const MaterialApp(home: LoginScreen()));
    expect(find.text('Welcome Back!'), findsOneWidget);
    expect(find.text('Login to your account'), findsOneWidget);
  });

  testWidgets('renders location screen with use current location button', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const MaterialApp(home: LocationScreen()));
    expect(find.text('Where is your location?'), findsOneWidget);
    expect(find.text('Find My Location'), findsOneWidget);
    expect(find.text('Other Location'), findsOneWidget);
  });
}
