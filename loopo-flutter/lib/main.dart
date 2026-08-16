import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
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

  // Load the correct environment file.
  // Run with `flutter run` for dev, or pass `--dart-define=APP_ENV=production` for prod.
  const appEnv = String.fromEnvironment('APP_ENV', defaultValue: 'development');
  final envFile = appEnv == 'production' ? '.env.production' : '.env.development';

  try {
    await dotenv.load(fileName: envFile);
  } catch (_) {
    // Silently fall through — ApiConfig falls back to hardcoded dev URL
  }

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
