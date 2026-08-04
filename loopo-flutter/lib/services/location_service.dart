import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:geocoding/geocoding.dart';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;

// TODO: [Backend Integration] Save user real-time GPS location via PATCH /api/v1/users/me/location
// TODO: [Backend Integration] Fetch nearby listings sorted by distance via GET /api/v1/search?latitude=:lat&longitude=:lng&radiusKm=20

class LocationService {
  static final LocationService _instance = LocationService._internal();
  factory LocationService() => _instance;
  LocationService._internal();

  String _currentCity = 'Bangalore';
  String _currentState = 'Karnataka';
  String _currentCountry = 'India';
  double? _latitude = 12.9716;
  double? _longitude = 77.5946;
  bool _isRealGps = false;

  String get currentCity => _currentCity;
  String get currentState => _currentState;
  String get currentCountry => _currentCountry;
  String get formattedLocation => '$_currentCity, $_currentCountry';
  double? get latitude => _latitude;
  double? get longitude => _longitude;
  bool get isRealGps => _isRealGps;

  static const List<Map<String, String>> popularCities = [
    {'city': 'Bangalore', 'state': 'Karnataka', 'country': 'India'},
    {'city': 'Mumbai', 'state': 'Maharashtra', 'country': 'India'},
    {'city': 'Delhi NCR', 'state': 'Delhi', 'country': 'India'},
    {'city': 'Hyderabad', 'state': 'Telangana', 'country': 'India'},
    {'city': 'Chennai', 'state': 'Tamil Nadu', 'country': 'India'},
    {'city': 'Pune', 'state': 'Maharashtra', 'country': 'India'},
    {'city': 'Kolkata', 'state': 'West Bengal', 'country': 'India'},
    {'city': 'Ahmedabad', 'state': 'Gujarat', 'country': 'India'},
  ];

  void setLocation({
    required String city,
    required String state,
    required String country,
    double? lat,
    double? lng,
    bool isGps = false,
  }) {
    _currentCity = city;
    _currentState = state;
    _currentCountry = country;
    if (lat != null) _latitude = lat;
    if (lng != null) _longitude = lng;
    _isRealGps = isGps;
  }

  /// Fetch Real-Time GPS Location using Device Hardware Sensors + Reverse Geocoding
  Future<Map<String, String>> detectCurrentLocation() async {
    try {
      // 1. Check if location services are enabled on device
      final serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        debugPrint('Location services disabled on device. Using IP fallback.');
        return await _fallbackIpLocation();
      }

      // 2. Check and request location permissions
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          debugPrint('Location permissions denied by user. Using IP fallback.');
          return await _fallbackIpLocation();
        }
      }

      if (permission == LocationPermission.deniedForever) {
        debugPrint('Location permissions permanently denied. Using IP fallback.');
        return await _fallbackIpLocation();
      }

      // 3. Fetch real-time GPS position from hardware sensors
      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 8),
        ),
      );

      // 4. Reverse-geocode GPS coordinates to retrieve actual City, State & Country
      final placemarks = await placemarkFromCoordinates(
        position.latitude,
        position.longitude,
      ).timeout(const Duration(seconds: 5));

      if (placemarks.isNotEmpty) {
        final place = placemarks.first;
        final city = (place.locality?.isNotEmpty == true
                ? place.locality
                : place.subAdministrativeArea?.isNotEmpty == true
                    ? place.subAdministrativeArea
                    : place.administrativeArea) ??
            'Bangalore';

        final state = place.administrativeArea ?? 'Karnataka';
        final country = place.country ?? 'India';

        setLocation(
          city: city,
          state: state,
          country: country,
          lat: position.latitude,
          lng: position.longitude,
          isGps: true,
        );

        return {'city': city, 'state': state, 'country': country};
      }
    } catch (e) {
      debugPrint('Real-time GPS error, falling back to IP detection: $e');
    }

    return await _fallbackIpLocation();
  }

  /// IP Geolocation fallback when GPS is disabled or permissions are denied
  Future<Map<String, String>> _fallbackIpLocation() async {
    try {
      final response = await http
          .get(Uri.parse('https://ipapi.co/json/'))
          .timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final city = data['city']?.toString() ?? 'Bangalore';
        final region = data['region']?.toString() ?? 'Karnataka';
        final country = data['country_name']?.toString() ?? 'India';
        final lat = double.tryParse(data['latitude']?.toString() ?? '');
        final lng = double.tryParse(data['longitude']?.toString() ?? '');

        setLocation(
          city: city,
          state: region,
          country: country,
          lat: lat,
          lng: lng,
          isGps: false,
        );

        return {'city': city, 'state': region, 'country': country};
      }
    } catch (e) {
      debugPrint('IP fallback error: $e');
    }

    setLocation(city: 'Bangalore', state: 'Karnataka', country: 'India', isGps: false);
    return {'city': 'Bangalore', 'state': 'Karnataka', 'country': 'India'};
  }
}
