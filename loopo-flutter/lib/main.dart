import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:loopo/screens/home_screen.dart';
import 'package:loopo/screens/location_screen.dart';
import 'package:loopo/screens/login_mobile.dart';
import 'package:loopo/screens/login_screen.dart';
import 'package:loopo/screens/profile_setup.dart';
import 'package:loopo/screens/signup_screen.dart';
import 'package:loopo/screens/welcome_screen.dart';

import 'theme/app_theme.dart';

class NoGlowScrollBehavior extends MaterialScrollBehavior {
  const NoGlowScrollBehavior();

  @override
  Widget buildOverscrollIndicator(
    BuildContext context,
    Widget child,
    ScrollableDetails details,
  ) {
    return child;
  }

  @override
  ScrollPhysics getScrollPhysics(BuildContext context) {
    return const ClampingScrollPhysics();
  }
}

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);

  // Show Flutter errors on-screen instead of a blank screen.
  ErrorWidget.builder = (FlutterErrorDetails details) {
    return Material(
      color: Colors.white,
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'An error occurred',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),

                const SizedBox(height: 12),

                Text(
                  details.exceptionAsString(),
                  style: const TextStyle(color: Colors.red),
                ),

                const SizedBox(height: 12),

                Text(
                  details.stack.toString(),
                  style: const TextStyle(fontSize: 12, color: Colors.black54),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  };

  await runZonedGuarded(
    () async {
      runApp(const MyApp());
    },
    (error, stack) {
      debugPrint('Uncaught zone error: $error');
      debugPrintStack(stackTrace: stack);
    },
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,

      title: 'Loopo',

      theme: AppTheme.lightTheme,

      scrollBehavior: const NoGlowScrollBehavior(),

      home: const WelcomeScreen(),
    );
  }
}
