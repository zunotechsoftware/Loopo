import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:loopo/screens/login_screen.dart';

void main() {
  testWidgets('shows email/mobile login form and login action', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const MaterialApp(home: LoginScreen()));

    expect(find.text('Email'), findsWidgets);
    expect(find.text('Mobile'), findsOneWidget);
    expect(find.text('Login'), findsWidgets);

    await tester.tap(find.text('Mobile'));
    await tester.pumpAndSettle();

    expect(find.text('Mobile Number'), findsOneWidget);
    expect(find.text('Password'), findsOneWidget);
  });

  testWidgets('rejects invalid Indian mobile prefixes', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const MaterialApp(home: LoginScreen()));

    await tester.tap(find.text('Mobile'));
    await tester.pumpAndSettle();

    final mobileField = find.byWidgetPredicate(
      (widget) =>
          widget is TextField &&
          widget.decoration?.hintText == 'Enter mobile number',
    );

    await tester.enterText(mobileField, '1234567890');
    await tester.pump();

    expect(tester.widget<TextField>(mobileField).controller?.text, isEmpty);
  });
}
